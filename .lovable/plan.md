# Solar Return Report: Remaining Technical and Synthesis Fixes

Thirteen corrections, grouped into four work areas. All astrology stays deterministic in code; the AI layer only writes prose from facts it is handed.

## 1. Aspect source integrity (item 1)

Every aspect object gets an explicit, non-strippable source label before it reaches any renderer or the AI.

- Add `source: 'sr-to-natal' | 'sr-internal'` plus a prebuilt `label` string to each aspect produced in `solarReturnAnalysis.ts`:
  - SR to natal: `Solar Return Mars square natal Saturn`
  - SR internal: `Solar Return Mars square Solar Return Saturn`
- Use that `label` everywhere aspects are printed: `AspectsTimingTab`, `ThisYearTab`, `SROverviewDashboard`, `yearAtAGlance`, `highlightsAndForecasts`, and the PDF sections. No component rebuilds its own aspect sentence.
- In `generate-sr-ai-reading`, pass the two aspect lists in separate, clearly headed blocks and add a hard rule: never merge the two, never restate a natal planet as a Solar Return planet, and always name both charts when describing a cross-chart aspect.

## 2. Dignity correctness (items 2 and 3)

- Create one canonical dignity module (`src/lib/essentialDignity.ts`) with the traditional tables only: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn. Jupiter's domiciles are Sagittarius and Pisces, so Jupiter in Leo returns "no essential dignity (peregrine)".
- Uranus, Neptune and Pluto return `not-assigned`, rendered as "Uranus, Neptune and Pluto are not assigned traditional essential dignity" or simply omitted. This removes "Neptune in Aries, Fall".
- Point `solarReturnAnalysis.ts`, `solarReturnT4Analysis.ts` and `solarReturnT5Analysis.ts` at that single module and delete their local copies so they cannot drift.
- Add the dignity of each planet as a supplied fact in the AI payload with a rule that dignity may never be invented or inferred.

## 3. Hierarchy and story rebalance (items 4, 6, 7, 8, 9, 13)

In `solarReturnYearStory.ts`:

- Raise the weight of the annual profection house and of the SR Sun's house; lower the standalone weight of the Time Lord's own house so a 6th-house Saturn cannot outrank the profected 7th house or the Sun's 11th house.
- Guarantee ordering: the profection house and the SR Sun house always rank above a house that only qualifies because the Time Lord sits there.
- Write real 11th-house synthesis copy: friendships, community, professional and social networks, and the future being built, with the Sun there as the year's center of gravity.
- Add a combining pass so that when 11, 7 and 6 all rank, the core story tells them as one arc: the future you are building, who belongs in it, and whether your daily structure can carry it. Career stays present but reads as the outcome of the 11th-house story rather than the headline.
- Keep Venus opposition Saturn treated as a defining aspect when it is inside a tight orb and involves the Time Lord, and reference it in the story rather than burying it in a list.
- Target closing shape of the core story: becoming intentional about the future being built and the people who belong in it, with relationships and daily sustainability as the two pressures that make the choices real.

## 4. Scoring, health language, grammar, eclipse language (items 5, 10, 11, 12)

- `yearPriorityScoring.ts` is where inflated numbers like 234 come from. Rework it to count independent signatures rather than raw signals:
  - one contribution per signature type per category (Sun house, Moon house, house concentration, angle contact, profection, tight aspect), each capped
  - planets sharing a house count once for that house, so Mars plus Ceres in the same house is one signature, not two
  - minor bodies can reinforce a category that already has a major signature but can never create one
  - final score normalized to a 0 to 100 scale so confidence labels mean something
- `solarReturnLifeDomainScores.ts`: apply the same single-signature-per-house rule and stop letting the aspect pool re-add the same planets that already scored through house occupancy.
- Health language: replace the remaining medical-adjacent phrasing, including "doctor visits", with workload, routines, pacing, stamina and stress-management wording across `solarReturnT4Analysis.ts`, `solarReturnAspectData.ts` and the domain advice strings.
- Grammar: fix the pronoun and verb agreement bugs ("you's", "you has", "how you earns her living") by generating second-person copy with a single subject-verb helper instead of substituting a name into third-person templates, and add a prompt rule for strict second person with no mixed pronouns.
- Eclipse language: remove "fated" and similar overstatement. Eclipses become "turning points" or "points where something already in motion becomes visible", in both the deterministic copy and the AI prompt.

## Verification

Run the report for Shannon and confirm: Jupiter in Leo shows peregrine, no outer-planet dignity claims, aspects always name their chart, 11th house leads with 7th and 6th supporting, domain scores fall in a sane range, no medical phrasing, no "fated", no "you's", no em dashes.
