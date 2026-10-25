# Natal Portrait personalization hierarchy QA

## Scope and root causes
The previous gate verified facts and chain membership but did not distinguish sign-only background from individualized support. Overlapping chains could inflate independence. Behavioral fields could borrow unrelated citations from elsewhere in a signature. Cache hits skipped the updated gate. Live output also overclaimed accuracy, autonomy and hidden perception.

## Changes
- New shared `personEvidenceStrength.ts`: unique-factor scoring, personal versus slow-sign weight, houses, angularity, orb-weighted contacts, chart/house rulership, dispositor links and repeated areas. Index is an application editorial rule, NOT a probability or scientific personality measurement.
- Weights: personal/angle sign 2; other sign 0.25; house 2; angular house 2; personal/angle/chart-ruler aspect 4 multiplied by orb tier (under 1: 1; under 3: .75; under 5: .4; otherwise .15); outer-only contact .5 times tier; house ruler 1.5 or chart ruler 3; dispositor chain .5; repeated areas 1. Background below 4, supported at 4+, strong at 10+ with 3+ factors.
- Concentrations expand their actual constituent placements, without adding independent bonus votes. Duplicate IDs and mirrored ASC/DSC or MC/IC contacts count once.
- Schema 3 graph includes ten planet chains, IC chain, four angle placements, twelve rulers, full degree/house/retrograde dispositor paths, all qualifying aspect objects, house occupancy, separate sign/house/condition evidence, angular houses, and verified triple configurations (grand trine, T-square, tight-quincunx yod).
- Each signature and behavioral field has its own declared evidence IDs. The model cannot assign its score. Server and browser compute the same index and reject unsupported strength.
- Slow-sign explanations must explicitly mark the background layer in the astrology paragraph. House/ruler/personal-aspect links must earn personal relevance. Sign-only life/destiny claims are blocked. A score never licenses fixed fate.
- Cached readings are versioned and revalidated. Browser no longer strips transit notes before checking them.
- Preserved model: google/gemini-3.1-pro-preview. No astrology calculation engine changes.

## Actual saved-chart check
Signed-in localhost preview, primary saved Lauren Newman chart, adult born 1976-10-21 at 07:12 in Washington DC. No invented chart or newly saved test chart. Captured request from actual UI and inspected rendered text and all four signatures. Compared sign/degree/house/aspect evidence with the saved chart graph. This is saved-data fidelity QA, not independent astronomical recertification of the birth record.

Early generated output failed: weak field support, misuse of 'tight' at 3.3 degrees, deterministic autonomy wording, inflated psychological insight and sensing ability. The first accepted draft still overstated behavior, so it was not treated as finished. Strengthened the gate, regenerated, then repaired the actual model-generated saved-chart draft through the deployed endpoint. Final response HTTP 200, server errors [], browser accepted and cached it. Browser repair testing resumed the genuine failed draft using a captured request; this is NOT proof that a fresh first pass always succeeds.

Four inspected signatures had multiple actual placements and verified contacts:
- Diplomat's Iron Core: Libra Sun/ASC plus first-house Scorpio Mars-Uranus, 1.7-degree conjunction. Uranus described as cohort tone individualized by angular house and Mars contact.
- Private Processing Radar: Libra Moon/Mercury/Pluto in house 12; Mercury-Pluto 4.7-degree conjunction, not described as tight. Pluto explicitly background before personal house/contact explanation.
- Generosity Loop: chart ruler Venus 0°54 Sagittarius H2, Jupiter 29°34 Taurus retrograde H8, 1.3-degree opposition explicitly out of sign, mutual dispositor loop.
- Reluctant Authority: Cancer MC 28°51, Moon H12, Saturn 15°36 Leo H10, Sun-MC square .7 degrees. Saturn explicitly cohort tone before angular-house relevance.

No 'change the world', destined or meant-to claims in accepted portrait. Plain synthesis precedes astrology in every signature. Real-life scenes remain conditional. All factual factors above were hand-checked against the supplied saved placements/cusps and graph. The astrology still sometimes abbreviates full house rulership/dispositor explanation, although the source contains it.

## Results and limitations
695 tests passed across 38 files using reduced worker concurrency. Initial unrestricted run had two existing Solar Return tests exceed their five-second timeout; both passed under reduced contention without changing assertions. Automatic preview build OK.

Remaining: fresh first-pass reliability confirmed failing on a recheck (2026-10-25): signed-in regeneration with cache cleared returned gateway 504 IDLE_TIMEOUT at 150s while the model wrote; the repaired-pass route still succeeds. Fix would be a smaller first-pass scope or automatic retry-on-504 in the UI. Some repaired phrasing is over-hedged and titles are still not uniformly literal. Per-field citations and wording parsers cannot prove semantic causality of arbitrary prose. The score is an editorial heuristic, not astrology's objective accuracy measure. Only one saved adult chart was inspected live. Older lower Natal sections, arbitrary prose, PDF-wide parity, all configurations beyond verified triples, and independent birth-chart astronomy were not certified here. Gina relationship live-output and broader duplicate-calculator work remain separate open roadmap items.