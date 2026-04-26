---
name: Retrograde prose correction (SR + natal)
description: SR/natal retrograde correctors must inspect label/title/name/subtitle/heading fields — bullets[*].label is where Replit gate flags RETROGRADE_STATE_MISMATCH
type: feature
---
The `fixSrRetrogradeMentionsInProse` and `fixNatalRetrogradeMentionsInProse` correctors in `supabase/functions/ask-astrology/index.ts` must NOT skip the keys `label`, `title`, `name`, `subtitle`, or `heading`. Bullet labels like `"SR Mercury Retrograde in Pisces"` are exactly where the Replit gate raises `RETROGRADE_STATE_MISMATCH` defects. The SKIP_KEYS set is intentionally narrow — only true metadata (`type`, `id`, `kind`, internal `_*` keys, structured fields like `planet`/`sign`/`house`).

The SR corrector must also:
- Walk the entire `parsedContent` tree (not just `parsedContent.sections`) so summary boxes, three-call sub-sections, and future containers are inspected.
- Handle separated retrograde claims (e.g. `"SR Mercury in Pisces in the SR 6th house is retrograde"`) where the retro suffix is not adjacent to the planet name — the `srSeparatedRetroRe` pattern bounds the gap to 80 chars.
- Flip explicit "<SR Planet> direct" / "<SR Planet> is direct" claims to retrograde when the SR truth table marks the planet retrograde (mirrors the natal direct→retrograde path).
