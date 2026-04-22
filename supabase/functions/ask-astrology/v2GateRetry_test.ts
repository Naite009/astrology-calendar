// Regression test for the V2 gate retry loop in ask-astrology.
//
// What this test guards:
//   1. EMPTY_SECTION + EMPTY_BULLET_TEXT defects from the gate trigger
//      a heal pass that fills both, and the second gate verdict is OK.
//   2. EMPTY_BULLET_TEXT patches the CORRECT bullet — when two sections
//      both have an empty bullet with the same label, we patch the one
//      whose section title matches, not just "the first empty one".
//   3. Retries are CAPPED — a gate that keeps returning the same defects
//      after 3 attempts gives up and records `give_up_reason`.
//   4. Structured per-attempt logs land in `_gate.v2_retry.attempts[]`
//      so we can audit why V2 stopped.
//
// We do NOT spin up the real edge function or call Anthropic/Replit.
// Instead we re-implement the loop body as a small pure runner that
// takes injected `runGate` + `runClaude` mocks and mutates a payload
// the same way the real loop does. This keeps the test fast and
// deterministic and lets us assert exact attempt counts / give-up reasons.
//
// If the real loop in index.ts diverges from this runner, update both
// in lockstep — the runner is a faithful mirror, not the source of
// truth. The structural invariants asserted here (cap=3, give-up
// reasons, bullet matching) MUST hold in production.

import { assert, assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

// ─────────────────────────────────────────────────────────────────────
// Types mirroring the real loop's contract
// ─────────────────────────────────────────────────────────────────────
interface Defect {
  code: "MISSING_REQUIRED_SECTION" | "EMPTY_SECTION" | "EMPTY_BULLET_TEXT" | string;
  section: string;
  bullet_label?: string;
  label?: string;
  fix?: string;
}
interface Verdict {
  label: string;
  ok: boolean;
  defects: Defect[];
  status?: number;
}
interface Bullet { label?: string; text?: string; _v2_gate_patched?: boolean }
interface Section { title: string; type?: string; body?: string; bullets?: Bullet[]; _v2_gate_added?: boolean }
interface Payload { sections: Section[]; _gate?: any }

interface ClaudePatch {
  newSections?: Section[];          // healed/added sections
  bulletPatches?: Array<{ section: string; label: string; text: string }>;
}

// Mock signatures
type RunGate = (label: string, payload: Payload) => Promise<Verdict>;
type RunClaude = (
  sectionDefects: Defect[],
  bulletDefects: Defect[],
  attemptIdx: number,
) => Promise<ClaudePatch>;

// ─────────────────────────────────────────────────────────────────────
// The runner — mirrors the real V2 loop in supabase/functions/ask-astrology/index.ts
// ─────────────────────────────────────────────────────────────────────
const MAX_GATE_RETRIES = 3;

const collectDefects = (verdict: Verdict) => {
  const defects = Array.isArray(verdict?.defects) ? verdict.defects : [];
  const sectionDefects = defects.filter(
    (d) =>
      (d.code === "MISSING_REQUIRED_SECTION" || d.code === "EMPTY_SECTION")
      && typeof d.section === "string",
  );
  const bulletDefects = defects.filter(
    (d) =>
      d.code === "EMPTY_BULLET_TEXT"
      && typeof d.section === "string"
      && (typeof d.bullet_label === "string" || typeof d.label === "string"),
  );
  return { sectionDefects, bulletDefects };
};

const defectSignature = (sectionDefects: Defect[], bulletDefects: Defect[]) => {
  const s = sectionDefects.map((d) => `S:${d.code}:${String(d.section).toLowerCase()}`);
  const b = bulletDefects.map((d) => `B:${String(d.section).toLowerCase()}::${String(d.bullet_label || d.label).toLowerCase()}`);
  return [...s, ...b].sort().join("|");
};

// Apply a Claude patch to the payload — mirrors requestMissingSections +
// requestMissingBullets. Critically, bullet matching uses BOTH section
// title AND bullet label.
const applyPatch = (payload: Payload, patch: ClaudePatch, emptySectionTitles: Set<string>) => {
  let added = 0;
  let patched = 0;

  if (patch.newSections?.length) {
    // Drop empty shells so the V2 version is the only copy.
    if (emptySectionTitles.size > 0) {
      payload.sections = payload.sections.filter((s) => {
        if (s._v2_gate_added) return true;
        return !emptySectionTitles.has(s.title.trim().toLowerCase());
      });
    }
    for (const ns of patch.newSections) {
      if (!ns?.title || !ns?.body) continue;
      payload.sections.push({ ...ns, _v2_gate_added: true });
      added++;
    }
  }

  if (patch.bulletPatches?.length) {
    for (const bp of patch.bulletPatches) {
      if (!bp?.section || !bp?.label || !bp?.text) continue;
      const sNorm = bp.section.trim().toLowerCase();
      const lNorm = bp.label.trim().toLowerCase();
      // CRITICAL: match BOTH section title and bullet label.
      for (const sec of payload.sections) {
        if (sec.title.trim().toLowerCase() !== sNorm) continue;
        if (!Array.isArray(sec.bullets)) continue;
        for (const b of sec.bullets) {
          if ((b.label || "").trim().toLowerCase() !== lNorm) continue;
          b.text = bp.text;
          b._v2_gate_patched = true;
          patched++;
          break;
        }
      }
    }
  }

  return { added, patched };
};

interface RunnerResult {
  payload: Payload;
  history: Verdict[];
  attempts: any[];
  giveUpReason: string | null;
  totalAttempts: number;
}

async function runV2Loop(
  payload: Payload,
  runGate: RunGate,
  runClaude: RunClaude,
): Promise<RunnerResult> {
  const verdict1 = await runGate("initial", payload);
  const history: Verdict[] = [verdict1];
  const attempts: any[] = [];
  let giveUpReason: string | null = null;
  let prevSignature: string | null = null;
  let attemptIdx = 0;

  while (attemptIdx < MAX_GATE_RETRIES) {
    const last = history[history.length - 1];
    const { sectionDefects, bulletDefects } = collectDefects(last);
    const total = sectionDefects.length + bulletDefects.length;
    if (total === 0) break;

    const sig = defectSignature(sectionDefects, bulletDefects);
    if (prevSignature !== null && sig === prevSignature) {
      giveUpReason = "no_progress_same_defects";
      attempts.push({ attempt: attemptIdx + 1, skipped: true, reason: giveUpReason });
      break;
    }
    prevSignature = sig;

    const patch = await runClaude(sectionDefects, bulletDefects, attemptIdx);
    const emptyTitles = new Set(
      sectionDefects
        .filter((d) => d.code === "EMPTY_SECTION")
        .map((d) => d.section.trim().toLowerCase()),
    );
    const { added, patched } = applyPatch(payload, patch, emptyTitles);

    if (added === 0 && patched === 0) {
      giveUpReason = "claude_made_no_changes";
      attempts.push({ attempt: attemptIdx + 1, skipped: true, reason: giveUpReason, added_sections: 0, patched_bullets: 0 });
      break;
    }

    const verdictN = await runGate(`post_retry_${attemptIdx + 1}`, payload);
    history.push(verdictN);
    attempts.push({
      attempt: attemptIdx + 1,
      requested_sections: sectionDefects.length,
      requested_bullets: bulletDefects.length,
      added_sections: added,
      patched_bullets: patched,
      verdict_ok: verdictN.ok,
      verdict_defects: verdictN.defects.length,
    });
    attemptIdx++;
  }

  if (!giveUpReason && attemptIdx >= MAX_GATE_RETRIES) {
    const last = history[history.length - 1];
    const { sectionDefects, bulletDefects } = collectDefects(last);
    if (sectionDefects.length + bulletDefects.length > 0) {
      giveUpReason = "max_retries_reached";
    }
  }

  payload._gate = {
    ...history[history.length - 1],
    history,
    v2_retry: {
      attempted: attempts.length > 0,
      attempts,
      total_attempts: attempts.length,
      max_attempts: MAX_GATE_RETRIES,
      give_up_reason: giveUpReason,
    },
  };

  return { payload, history, attempts, giveUpReason, totalAttempts: attempts.length };
}

// ─────────────────────────────────────────────────────────────────────
// TEST 1 — Happy path: V2 fills EMPTY_SECTION + EMPTY_BULLET_TEXT
// and gate returns ok:true on the second pass.
// ─────────────────────────────────────────────────────────────────────
Deno.test("V2 heals EMPTY_SECTION + EMPTY_BULLET_TEXT, returns ok:true on second pass", async () => {
  const payload: Payload = {
    sections: [
      { title: "Natal Key Placements", type: "placement_table", body: "" }, // EMPTY_SECTION
      {
        title: "How This Person Loves",
        type: "narrative_section",
        body: "Some intro text.",
        bullets: [
          { label: "What you're attracted to vs. what you need", text: "" }, // EMPTY_BULLET_TEXT
          { label: "Recurring patterns", text: "Real text already here." },
        ],
      },
    ],
  };

  let gateCallCount = 0;
  const runGate: RunGate = async (label, p) => {
    gateCallCount++;
    if (label === "initial") {
      return {
        label,
        ok: false,
        defects: [
          { code: "EMPTY_SECTION", section: "Natal Key Placements" },
          {
            code: "EMPTY_BULLET_TEXT",
            section: "How This Person Loves",
            bullet_label: "What you're attracted to vs. what you need",
          },
        ],
      };
    }
    // Pass 2: check it actually healed
    const natal = p.sections.find((s) => s.title === "Natal Key Placements");
    const loveBullet = p.sections
      .find((s) => s.title === "How This Person Loves")
      ?.bullets?.find((b) => b.label === "What you're attracted to vs. what you need");
    const healed = !!natal?.body && !!loveBullet?.text;
    return { label, ok: healed, defects: healed ? [] : [{ code: "EMPTY_SECTION", section: "Natal Key Placements" }] };
  };

  const runClaude: RunClaude = async (sectionDefects, bulletDefects) => {
    return {
      newSections: sectionDefects.map((d) => ({
        title: d.section,
        type: "placement_table",
        body: `Healed body for ${d.section}.`,
      })),
      bulletPatches: bulletDefects.map((d) => ({
        section: d.section,
        label: d.bullet_label || d.label || "",
        text: `Healed text for "${d.bullet_label || d.label}".`,
      })),
    };
  };

  const result = await runV2Loop(payload, runGate, runClaude);

  assertEquals(gateCallCount, 2, "gate should be called exactly twice");
  assertEquals(result.totalAttempts, 1, "exactly one heal attempt needed");
  assertEquals(result.giveUpReason, null, "no give-up reason on success");
  assertEquals(result.history[result.history.length - 1].ok, true, "final verdict should be ok");

  const natal = result.payload.sections.find((s) => s.title === "Natal Key Placements");
  assertExists(natal?.body, "Natal section body must be filled");
  assert(natal._v2_gate_added, "healed natal section must be tagged _v2_gate_added");

  const bullet = result.payload.sections
    .find((s) => s.title === "How This Person Loves")
    ?.bullets?.find((b) => b.label === "What you're attracted to vs. what you need");
  assertExists(bullet?.text, "empty bullet must be filled");
  assert(bullet._v2_gate_patched, "patched bullet must be tagged _v2_gate_patched");

  // Make sure the OTHER bullet (which already had text) was NOT touched.
  const other = result.payload.sections
    .find((s) => s.title === "How This Person Loves")
    ?.bullets?.find((b) => b.label === "Recurring patterns");
  assertEquals(other?.text, "Real text already here.", "non-empty bullet must not be touched");
  assertEquals(other?._v2_gate_patched, undefined, "non-empty bullet should not be tagged");
});

// ─────────────────────────────────────────────────────────────────────
// TEST 2 — Bullet matching uses BOTH section title and label
// Two sections each have a bullet with the SAME label "Patterns" but
// only ONE is empty. We must patch the empty one in the correct section.
// ─────────────────────────────────────────────────────────────────────
Deno.test("EMPTY_BULLET_TEXT patches by (section title + label), not first match", async () => {
  const payload: Payload = {
    sections: [
      {
        title: "How This Person Loves",
        type: "narrative_section",
        body: "intro",
        bullets: [
          { label: "Patterns", text: "Already filled — must NOT be overwritten." },
        ],
      },
      {
        title: "Relationship Strategy Summary",
        type: "summary_box",
        body: "intro",
        bullets: [
          { label: "Patterns", text: "" }, // the actual empty one
        ],
      },
    ],
  };

  const runGate: RunGate = async (label, p) => {
    if (label === "initial") {
      return {
        label,
        ok: false,
        defects: [
          {
            code: "EMPTY_BULLET_TEXT",
            section: "Relationship Strategy Summary",
            bullet_label: "Patterns",
          },
        ],
      };
    }
    // Verify the right bullet was patched
    const correct = p.sections
      .find((s) => s.title === "Relationship Strategy Summary")
      ?.bullets?.find((b) => b.label === "Patterns");
    return { label, ok: !!correct?.text, defects: correct?.text ? [] : [{ code: "EMPTY_BULLET_TEXT", section: "Relationship Strategy Summary" }] };
  };

  const runClaude: RunClaude = async (_s, bulletDefects) => ({
    bulletPatches: bulletDefects.map((d) => ({
      section: d.section,
      label: d.bullet_label || d.label || "",
      text: "Healed strategy summary patterns text.",
    })),
  });

  const result = await runV2Loop(payload, runGate, runClaude);

  assertEquals(result.giveUpReason, null);
  assertEquals(result.history[result.history.length - 1].ok, true);

  const loveBullet = result.payload.sections
    .find((s) => s.title === "How This Person Loves")!
    .bullets!.find((b) => b.label === "Patterns")!;
  assertEquals(
    loveBullet.text,
    "Already filled — must NOT be overwritten.",
    "bullet in OTHER section with same label must remain untouched",
  );
  assertEquals(loveBullet._v2_gate_patched, undefined);

  const summaryBullet = result.payload.sections
    .find((s) => s.title === "Relationship Strategy Summary")!
    .bullets!.find((b) => b.label === "Patterns")!;
  assertEquals(summaryBullet.text, "Healed strategy summary patterns text.");
  assert(summaryBullet._v2_gate_patched);
});

// ─────────────────────────────────────────────────────────────────────
// TEST 3 — Retries are CAPPED at MAX_GATE_RETRIES
// Gate keeps returning DIFFERENT defects each pass (so the loop can't
// short-circuit on "same signature"). Claude keeps producing real
// patches. After 3 attempts the loop must stop with
// give_up_reason="max_retries_reached".
// ─────────────────────────────────────────────────────────────────────
Deno.test("retries cap at MAX_GATE_RETRIES with give_up_reason=max_retries_reached", async () => {
  const payload: Payload = { sections: [{ title: "A", body: "x" }] };

  let gateCalls = 0;
  const runGate: RunGate = async (label) => {
    gateCalls++;
    // Always return ONE defect, but make it a different section each time
    // so the signature never matches and we never short-circuit early.
    if (label === "initial") {
      return { label, ok: false, defects: [{ code: "EMPTY_SECTION", section: "Sec1" }] };
    }
    const idx = parseInt(label.replace("post_retry_", ""), 10);
    return { label, ok: false, defects: [{ code: "EMPTY_SECTION", section: `Sec${idx + 1}` }] };
  };

  const runClaude: RunClaude = async (sectionDefects) => ({
    newSections: sectionDefects.map((d) => ({ title: d.section, body: "healed" })),
  });

  const result = await runV2Loop(payload, runGate, runClaude);

  assertEquals(result.totalAttempts, MAX_GATE_RETRIES, `should hit cap of ${MAX_GATE_RETRIES} attempts`);
  assertEquals(result.giveUpReason, "max_retries_reached");
  assertEquals(gateCalls, MAX_GATE_RETRIES + 1, "1 initial + N retries");
  // Structured logging must record every attempt.
  assertEquals(result.attempts.length, MAX_GATE_RETRIES);
  for (let i = 0; i < MAX_GATE_RETRIES; i++) {
    assertEquals(result.attempts[i].attempt, i + 1);
    assertExists(result.attempts[i].verdict_ok);
  }
  // Final _gate audit object must surface the give-up reason.
  assertEquals((result.payload._gate as any).v2_retry.give_up_reason, "max_retries_reached");
});

// ─────────────────────────────────────────────────────────────────────
// TEST 4 — Same defect signature → give up early
// Gate returns the IDENTICAL defect twice → second pass detects no
// progress and stops with give_up_reason="no_progress_same_defects".
// This is the case where Claude "patched" the bullet but the gate
// doesn't accept the new text (e.g. it's still too short).
// ─────────────────────────────────────────────────────────────────────
Deno.test("same defects two passes in a row → give_up_reason=no_progress_same_defects", async () => {
  const payload: Payload = {
    sections: [{ title: "Foo", bullets: [{ label: "L", text: "" }] }],
  };

  const sameDefect: Defect = { code: "EMPTY_BULLET_TEXT", section: "Foo", bullet_label: "L" };
  const runGate: RunGate = async (label) => ({
    label,
    ok: false,
    defects: [sameDefect],
  });

  // Claude DOES patch (so we get past the "no changes" guard), but the
  // gate keeps flagging the same defect anyway.
  const runClaude: RunClaude = async (_s, bulletDefects) => ({
    bulletPatches: bulletDefects.map((d) => ({
      section: d.section,
      label: d.bullet_label || d.label || "",
      text: "patched but gate hates it",
    })),
  });

  const result = await runV2Loop(payload, runGate, runClaude);

  assertEquals(result.giveUpReason, "no_progress_same_defects");
  // Should have made exactly one real patch attempt before bailing on attempt 2.
  assert(result.totalAttempts <= 2, `expected ≤2 attempts, got ${result.totalAttempts}`);
  const last = result.attempts[result.attempts.length - 1];
  assertEquals(last.skipped, true);
  assertEquals(last.reason, "no_progress_same_defects");
});

// ─────────────────────────────────────────────────────────────────────
// TEST 5 — Claude produces nothing → give up immediately
// ─────────────────────────────────────────────────────────────────────
Deno.test("Claude returns empty patch → give_up_reason=claude_made_no_changes", async () => {
  const payload: Payload = { sections: [{ title: "Foo", body: "" }] };
  const runGate: RunGate = async (label) => ({
    label,
    ok: false,
    defects: [{ code: "EMPTY_SECTION", section: "Foo" }],
  });
  const runClaude: RunClaude = async () => ({}); // no patches

  const result = await runV2Loop(payload, runGate, runClaude);

  assertEquals(result.giveUpReason, "claude_made_no_changes");
  assertEquals(result.totalAttempts, 1);
});
