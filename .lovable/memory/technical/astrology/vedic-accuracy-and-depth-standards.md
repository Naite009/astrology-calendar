---
name: Vedic accuracy and depth standards
description: Ayanamsa modes, condition-weighted yogas, vedha/bindu transit filtering, chart drivers gate, dasha-transit synthesis, and the 20-person Vedic accuracy suite
type: feature
---

Ayanamsa: four selectable modes (Lahiri default, Raman, KP, True Chitra), linear precession from J2000, persisted per session. Mode is threaded through `buildVedicChart` and shown with its own label everywhere, never hardcoded as "Lahiri".

Yogas: weight is adjusted by the average condition index (0-100) of the participating grahas, reported as raised or lowered with a plain note. A yoga on a weak graha must never read as a strong promise.

Gochara: transits are filtered by classical Vedha (obstruction) points and by Ashtakavarga bindus in the transited sign, producing a net verdict of works / mixed / maintenance.

Chart drivers: every Vedic reading opens with the three things that run the chart, being the Lagna lord, the Atmakaraka, and the current Mahadasha lord. Dasha and transit are synthesized into one timing narrative, never listed separately.

Accuracy suite: `src/lib/qa/vedicAccuracy.ts` grades all 20 reference people. Expected sidereal longitude is the frozen JPL tropical value minus the ayanamsa for the same UTC instant. Nakshatra, pada and whole-sign house are recomputed independently. Invariants cover Ketu exactly opposite Rahu, the 120-year contiguous dasha cycle with the birth balance derived from the Moon's nakshatra fraction, valid signs across all 16 vargas, BAV totals and SAV summing to 337, and ayanamsa school ordering. Rahu carries a wide tolerance because the fixtures hold the mean node and the app uses the true node. Results show on `/qa/accuracy` and in `src/test/vedicAccuracySuite.test.ts`.
