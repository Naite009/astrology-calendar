
# Portrait Hierarchy v3 — APPROVED (UI-only, ChildPortrait.tsx only)

## Scope lock
- File touched: **`src/components/family/ChildPortrait.tsx` only** (plus a ~15-line local helper inside the same file).
- Untouched: `portraitComposer.ts`, `portraitValidator.ts`, `portraitSignature.ts`, `childPortrait.ts`, both test files, every data shape, the interpretation engine.
- No new dependencies. No `Tabs` component. No hidden content beyond the single collapsed Math Check `<details>`.

---

## The 4-Tier Hierarchy

```
TIER 1  HEADLINE                gradient bg, large type, no heavy border
   ├─ Core Portrait (life-stage chapter folded in as italic subtitle)
   └─ Operating System line — Chart Ruler as a full sentence
       "Operating system: {ruler} in {sign}{ in the Nth house} — {behavioral read}."

TIER 2  THE LIVED EXPERIENCE    two equal-weight saturated boxes
   ├─ Real Life · What To Do            (emerald)   action + Looks Like / Actually Is
   └─ In The Moment                     (rose)      ranked behavioral sequence

TIER 3  HOW THE SYSTEM WORKS    one unified indigo box, sequential subsections (no tabs)
   ├─ Bridge intro (2 sentences)
   ├─ Main Pressure Point callout   (single bordered row; sources composed.systemMechanism.trigger
   │                                  + tightest hard aspect to Sun/Moon from portrait.mathCheck)
   ├─ Signal → Medium → Collision → Output
   ├─ Chain of Command (dispositor walk, mutual reception, final boss, badge row)
   └─ Chart Story (narrative prose)

TIER 4  TENDER PLACES & THE PATH   quiet by default, ADAPTIVE promotion for Saturn/Chiron/Nodes
   ├─ Saturn / Chiron / Nodes        (promotion rule below)
   ├─ Moon Phase
   ├─ Chart Ruler dashed sub-card    (full card retained for completeness)
   ├─ Extreme degrees (0° / 29° angles)
   └─ Math Check (collapsed <details>)
```

---

## Required behaviors

**Tier 3 confirmed sequential subsections.** One indigo box, internal `<h4>`-style headings, top-to-bottom render, prints and PDF-exports cleanly. No `Tabs`, no `<details>` inside Tier 3.

**Main Pressure Point lives in Tier 3.** Pluto/Uranus/Neptune/Mars-led pressure is *driver* energy, not tender-place energy. Rendered as a single bordered row directly after the Bridge intro, inside the indigo box. Format: `Main pressure point: {body} {aspect} {body} (orb {n}°) — {one-line behavioral read}.` This guarantees the engine of the chart is always visible at the top of the mechanism, regardless of which body it is.

**Tier 4 adaptive promotion (Saturn / Chiron / Nodes only).** A sub-card promotes when ANY of:
1. It is the chart ruler.
2. It is the final dispositor in `composed.chainOfCommand.finalDispositor`, or one side of `composed.chainOfCommand.mutualReception`.
3. It anchors the life-stage chapter (`composed.lifeStageChapter` matches /Saturn|Chiron|Node|Nodal/i).
4. It is the stress trigger (`composed.systemMechanism.trigger.label` references the body).
5. It carries the tightest hard aspect to Sun or Moon in `portrait.mathCheck` (orb ≤ 2°, aspect ∈ {conjunction, square, opposition}).

Promotion effect: card moves to top of Tier 4, container becomes `border-2 border-violet-500/60`, body text drops `text-muted-foreground`, small `Badge` reads `Central to this chart · {reason}` where reason names whichever rule fired.

**Color encodes role; weight encodes importance.**
- Tier 1: no outer border, gradient bg, largest type.
- Tier 2: `border-2`, saturated bg (emerald, rose).
- Tier 3: `border-2` indigo, calmer bg; internal subsections carry structure.
- Tier 4: `border` (1px) violet, dashed sub-cards, muted body — *unless* the promotion rule fires.

**No em dashes in any new copy.** Use commas, colons, periods, parentheses (per project core rule).

---

## Concrete section order per person (caption corrected)

```
LAUREN (adult, Chiron-anchored)
  Tier 1  Core Portrait + "Operating system: {her ruler} ..."
  Tier 2  Real Life · What To Do
          In The Moment
  Tier 3  How The System Works
            Bridge intro
            Main pressure point: Chiron Return
            Signal/Medium/Collision/Output
            Chain of Command
            Chart Story
  Tier 4  Tender Places & The Path
            ★ Chiron  (PROMOTED, "Central · life-stage anchor")
              Saturn  (quiet)
              Nodes   (quiet)
              Moon Phase, Chart Ruler card, Extreme degrees
              Math Check (collapsed)

BEN (teen, Saturn-pressure, Merc↔Sat reception)
  Tier 1  Core Portrait + "Operating system: ..."
  Tier 2  Real Life · What To Do
          In The Moment
  Tier 3  How The System Works
            Bridge intro
            Main pressure point: Saturn (mutual reception with Mercury)
            Signal/Medium/Collision/Output
            Chain of Command (Merc↔Sat badge visible)
            Chart Story
  Tier 4  Tender Places & The Path
            ★ Saturn (PROMOTED, "Central · mutual reception")
              Chiron  (quiet)
              Nodes   (quiet)
              Moon Phase, Chart Ruler card, Extreme degrees
              Math Check (collapsed)

IKE (teen, Sun square Pluto, Mars-Aries dominant)
  Tier 1  Core Portrait + "Operating system: Mars in Aries in the 5th ..."
  Tier 2  Real Life · What To Do
          In The Moment
  Tier 3  How The System Works
            Bridge intro
            Main pressure point: Sun square Pluto (orb 1.4°)
            Signal/Medium/Collision/Output (Pluto's role explained here)
            Chain of Command
            Chart Story
  Tier 4  Tender Places & The Path
              Saturn  (quiet, not central for Ike)
              Chiron  (quiet, not central for Ike)
              Nodes   (quiet)
              Moon Phase, Chart Ruler card, Extreme degrees
              Math Check (collapsed)
```

---

## Implementation checklist (build phase)

In `src/components/family/ChildPortrait.tsx` only:
1. Add Tier 1 Operating System line under Core Portrait, rendering `portrait.chartRuler.rulerName/rulerSign/line` as a full sentence (not a chip).
2. Merge current `realTimeSequence` (In The Moment) and Real Life sections into Tier 2 stack; remove duplicate Human Translation block from inside Planet Interaction.
3. Merge Bridge + Planet Interaction System + Chart Story into one indigo Tier 3 box with sequential subsections.
4. Insert Main Pressure Point row at top of Tier 3 (right after Bridge intro) using `composed.systemMechanism.trigger` plus tightest hard luminary aspect from `portrait.mathCheck`.
5. Restyle Tier 4 to 1px violet border + dashed sub-cards + muted body by default.
6. Add local `centralityFor(body)` helper (Saturn/Chiron/Nodes) returning `{ promoted: boolean, reason?: string }` based on the 5 rules; reorder Tier 4 sub-cards so promoted bodies come first with `border-2` + badge.
7. Wrap Math Check in `<details>` collapsed by default.
8. Fold Life-Stage Chapter into Core Portrait as an italic subtitle line; remove its standalone box.
9. Verify no em dashes in any new strings.
10. Run `bunx vitest run` to confirm composer/validator tests still pass (no engine touched, expected green).

Approved. Moving to build.
