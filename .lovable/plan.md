## Review of the three flagged items

I checked each of the three issues against the actual code. Verdict: **all three are real, two are quick deterministic fixes, one is a content-depth upgrade.** I'd also flag two related issues worth bundling.

---

### 1. ✅ Confirmed: `srRisingDesc` ignores the natal Rising contrast

**Where it lives:** `src/components/SolarReturnPDFExport.tsx` lines 740 and 999. Both export sites do:

```ts
srRisingDesc: SIGN_DESCRIPTIONS[analysis.yearlyTheme?.ascendantSign || '']?.rising || ''
```

That just looks up a static per-sign blurb (Virgo → "competent, thoughtful, detail-oriented"). There is no awareness of natal Rising at all. For Nicki, this is a Scorpio-rising person presenting as Virgo for the year — astrologically the most interesting thing about the SR Ascendant — and it goes unmentioned.

**Fix:** Add a new exported field `srRisingContrast` that is populated only when SR Rising ≠ natal Rising. Build it from a small lookup table of "natal X presenting as SR Y" pairings so it stays deterministic. Keep the existing `srRisingDesc` so the Replit renderer doesn't lose its default copy. Both export sites get the same field.

Example output for Scorpio→Virgo: *"Your natal Scorpio Rising — intense, private, watching beneath the surface — is wearing a Virgo coat this year. People will read you as more measured, precise, and useful than your default. The watcher is still there; it's just running through a checklist now."*

---

### 2. ✅ Confirmed: `profectionYear.age` can be 0 — real bug

**Where it lives:** `src/lib/solarReturnAnalysis.ts` lines 962–966:

```ts
if (natalChart.birthDate && srChart.solarReturnYear) {
  const birthYear = parseInt(natalChart.birthDate.slice(0, 4), 10);
  if (!isNaN(birthYear)) {
    const age = srChart.solarReturnYear - birthYear;
```

If `srChart.solarReturnYear` is missing, equals the birth year, or got stamped with the natal year by a stale cache/import, `age` collapses to `0` (or even negative). The PDF export at `SolarReturnPDFExport.tsx:708–715` already has a guard (`effectiveSrYear` falls back to current calendar year and computes `srAge`), but **`mappedProfectionYear` at lines 693–696 and 957–960 still spreads the raw `profYear` and never overwrites `age`**. So the JSON exports the bad `age: 0` while the rest of the report uses the corrected age. That's exactly the symptom described.

**Fix (two layers, both needed):**

a. **Source fix** in `solarReturnAnalysis.ts`: replicate the same `effectiveSrYear` guard used in the PDF export (reject birthYear collisions and out-of-range values, fall back to current year). This stops `age: 0` at the source for every consumer, not just the JSON export.

b. **Export fix** in `SolarReturnPDFExport.tsx`: in both `mappedProfectionYear` blocks, explicitly overwrite `age: srAge ?? profYear.age` so the JSON can never ship a stale 0 even if the analysis layer ever regresses.

---

### 3. ⚠️ Confirmed: SR-to-natal aspect prose is template-driven (Tier 1/2 limitation, not a bug)

**Where it lives:** `src/lib/solarReturnAspectInterp.ts`. `generateSRtoNatalInterpretation()` first tries `getSRNatalPairInterp(srP, natP, aspectType)` for a hand-written pair entry. If none exists, it falls through to `buildGenericFeeling` / `buildGenericMeaning` / `buildGenericAdvice` — which is where every sextile reads like every sextile and every square reads like every square.

You're right that this isn't wrong — it's just generic. The realistic path is not "write 10 × 10 × 8 = 800 unique pair entries," it's **make the generic builder less generic** by injecting three pieces of information it already has access to but isn't using:

- **Orb tightness band** — "0–1° exact and pressing all year" vs "1–3° clearly active" vs "3°+ background hum." Already computed (`tightness` on line 194), but only stuffed into `whatItMeans`, never into `howItFeels` or `whatToDo`.
- **House overlays** — `analysis.houseOverlays` knows which natal house the SR planet is sitting in and which natal house the natal planet rules. The generic builder ignores both.
- **Aspect direction** (applying vs separating) — already in `srToNatalAspects` for many entries; surface it.

**Fix:** Rewrite `buildGenericFeeling` / `buildGenericMeaning` / `buildGenericAdvice` to take an optional `context` arg `{ orb, srHouse, natalHouse, applying }` and weave those specifics into the sentence templates. Then expand the explicit pair table (`getSRNatalPairInterp`) by ~20–30 high-value pairs that come up constantly in real charts — Mars/Saturn, Saturn/Moon, Jupiter/Sun, Pluto/Venus, Uranus/Mercury, Neptune/Sun across all 8 aspect types. That's a much smaller lift than full coverage and removes the "every sextile sounds the same" feeling on the placements clients actually notice.

Scope-wise I'd cap this at ~40–50 new pair entries and the generic-builder context upgrade for this round, then iterate from real reports.

---

### Two additional suggestions (you didn't ask, you asked me to add if beneficial)

**A. Profection wheel age field is also being read by PDF/UI rendering.** `SolarReturnPDFExport.tsx` lines 1671, 1696, 1703, 1919, 1925 all read `analysis.profectionYear.age` directly. If the source-layer fix in #2a lands, these are automatically correct. If only the export-layer fix lands, these still display "You are 0 years old…" in the printed PDF. **This is why fix 2a is non-negotiable** — the bug isn't just JSON cosmetics, it'll surface in the printed report too.

**B. The Profection Time Lord interpretation hardcodes generic Mars-as-Time-Lord copy.** While I was in `solarReturnAnalysis.ts` around line 1021, I noticed `buildProfectionSynthesis(timeLord, houseNumber)` doesn't take the Time Lord's actual SR placement into account — only its name and the activated house. For Nicki, Mars-as-Time-Lord in Aries (domicile) in the SR 8th is *exceptionally* powerful and the synthesis prose doesn't mention dignity or the SR house Mars actually sits in. I'd add an optional enhancement to pass `timeLordSRHouse`, `timeLordSRSign`, and a computed `dignity` into `buildProfectionSynthesis` so the closing line can say something like *"Mars in domicile in your SR 8th gives this year unusual force in matters of shared resources, depth, and other people's money — your Time Lord is at full strength."* This is a 30-line change; happy to include it or defer.

---

## Files to change

- `src/lib/solarReturnAnalysis.ts` — guard against `solarReturnYear === birthYear` / missing year collapsing `age` to 0 (fix 2a). Optionally enhance `buildProfectionSynthesis` to use Time Lord placement + dignity (suggestion B).
- `src/components/SolarReturnPDFExport.tsx` — add `srRisingContrast` field at both export sites (fix 1); overwrite `mappedProfectionYear.age` with computed `srAge` at both sites (fix 2b).
- `src/lib/solarReturnAspectInterp.ts` — extend `buildGeneric*` builders to accept `{ orb, srHouse, natalHouse, applying }` and weave specifics into the prose; add ~40–50 new high-value pair entries to `getSRNatalPairInterp` (fix 3).
- (No edge function or backend changes. No deploy needed.)

## What I want you to confirm before I implement

1. **Suggestion B** (Time Lord dignity + SR placement woven into the profection synthesis) — include it this round, or defer?
2. **Aspect pair expansion size** — ~40–50 new entries this round feels right to me. If you want a different cap (smaller and faster, or larger and more comprehensive), say so now.
3. The `srRisingContrast` line is *additive* — `srRisingDesc` stays as-is so the Replit renderer's existing layout keeps working. Confirm that's the right call vs. replacing the field outright.