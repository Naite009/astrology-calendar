# Concrete Element and Modality Balance

## Goal
Replace abstract low-element and modality wording with chart-specific, everyday explanations across Chart Walkthrough, Natal Portrait, and the shared element display.

## What will change
- Add one shared balance interpreter that uses the actual ten-planet/Ascendant counts, dominant elements or modalities, planet signs, and house placements.
- For each light element, explain what may happen in daily life, what the person may use instead, practical supports, and any compensating signatures.
- Detect compensation from the requested planets, signs, and houses, and name the exact evidence that modifies the interpretation.
- When two elements are light, show one combined synthesis first, with a 1–3 word label, both low-element effects, and the dominant channel the person may use instead.
- Rewrite dominant and light modality language as concrete starting, sustaining, and adapting behavior, including compensating signatures.
- Remove internal authoring language, especially “Frame it as a pattern,” from every user-facing output.
- Keep element and modality counts visible as evidence.

## UI behavior
- Chart Walkthrough will show a combined low-element card first when applicable, followed by optional individual details.
- Natal Portrait will use the same shared interpretation instead of its current one-line low-count summary.
- The broader element distribution display will use the same concrete shared wording rather than separate “missing/low” templates.

## Quality checks
- Add tests for low Earth, Water, Air, Fire, a two-light-element combination, dominant replacement style, and compensation evidence.
- Add modality tests for dominant and light Cardinal, Fixed, and Mutable behavior.
- Add a regression that fails if “Frame it as a pattern” appears in generated or visible reading copy.
- Run focused tests, the full test suite, type checking, and the production build.

## Technical boundary
- Interpretation and presentation only. Natal positions, birth data, houses, aspects, and saved chart identity remain unchanged.
