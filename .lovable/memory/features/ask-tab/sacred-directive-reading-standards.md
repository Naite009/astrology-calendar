---
name: Ask Tab Sacred Directive Reading Standards
description: Big Three + Saturn + North Node fortune-cookie directive as an Ask tab reading type
type: feature
---
The Ask tab includes a `sacred_directive` reading type (🔮 Sacred Directive Quick Topic) that synthesizes Sun, Moon, Ascendant, Saturn, and North Node into a short plain-language directive on how to live.

**Structure (mandatory, in order):**
1. `placement_table` "The Five Anchors" — Sun, Moon, Rising, Saturn, North Node (sign + house + degree)
2. `narrative_section` "Who You Are" — 2–3 sentences synthesizing Big Three into how this person moves through a day
3. `narrative_section` "The Long Lesson" — 2 sentences on Saturn's slow build, framed as a recurring real-life situation
4. `narrative_section` "Where You Are Going" — 2 sentences on the North Node as a concrete behavior to lean toward (not a destination)
5. `summary_box` "Sacred Directive" with one item "Live This" — the 100–140 word fortune-cookie directive

**Voice:** 3rd-grade reading level, no astrology vocabulary inside the directive itself (planet/sign names only allowed in the placement_table), each line is recognizable real-life behavior or feeling, Hybrid Clarity Rule throughout. Banned: "wound", "archetypal", "portal", "metabolized", "calling" (noun), "journey", "honor your truth", any generic spiritual filler.

**`question_type` value:** `sacred_directive` → `QT_TO_LABEL["sacred_directive"] = "Sacred Directive"` in `supabase/functions/ask-astrology/index.ts`.
