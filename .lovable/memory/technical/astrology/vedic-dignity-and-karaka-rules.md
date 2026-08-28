---
name: Vedic dignity, karaka and timing accuracy rules
description: Dignity must be reported with dispositor and neecha bhanga context, karakas must name the 8-karaka reverse-Rahu method, and dasha timing windows must be age-filtered
type: feature
---

Dignity
- A house ruler's dignity is always stated in the sign the ruler OCCUPIES, never the sign of the house it rules. Use `body.sign`, never the house sign.
- Never report exaltation or debilitation in isolation. `src/lib/vedic/dignityMitigation.ts` (`auditDignities`) supplies dispositor condition, neecha bhanga cancellations (dispositor or exaltation lord in a kendra from lagna or Moon, conjunction, mutual drishti, parivartana, kendra placement, retrogression) and exaltation qualifiers (dusthana house or lordship, malefic glance, combustion, weak D9).
- Present in three labeled layers: classical fact, traditional interpretation, this app's interpretation. Never blur them.

Karakas
- The app uses the eight karaka method (seven grahas plus Rahu, Ketu excluded). Rahu is reverse counted: effective degree = 30 minus its degree in sign.
- Always display both the actual degree and the effective ranking degree, plus `KARAKA_METHOD_NOTE`. Darakaraka is "the last of the eight ranked karakas", never "lowest degree in the chart".

Houses
- Whole-sign houses are the system this tab is built on, not "the standard for Jyotish". Acknowledge Sripati and bhava chalit.

Timing
- Dasha windows shown to a user must be filtered to a usable age range (start age <= 75 and within ~30 years). If none qualify, say so and point to sub-periods rather than printing a window at age 94.

Western vs Vedic
- `ZodiacBridgeCard` sits high in the tab: Western position, minus ayanamsa, Vedic position, with per-planet shifts and the lagna conversion. The sidereal sign never replaces or corrects the tropical sign.
