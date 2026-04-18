---
name: Anthropic Prompt Caching
description: ask-astrology edge function uses 2-block ephemeral cache (SYSTEM_PROMPT + chart context) for ~80% latency reduction on repeat questions
type: feature
---

The `ask-astrology` edge function sends `system` as an array of 2-3 blocks with explicit `cache_control: { type: "ephemeral" }`. Block order is critical because cache key is byte-for-byte exact-prefix match:

1. **Block 1 (cached)**: `SYSTEM_PROMPT` constant — identical across all users, all charts, all questions.
2. **Block 2 (cached)**: Chart-scoped rules + `--- CHART DATA ---\n${sanitizedChartContext}` (Lilith/Juno/SR gates + chart context). Identical across every question on the same chart.
3. **Block 3 (uncached)**: `compactRelationshipInstruction` + `--- CURRENT LOCAL DATE ---`. Per-question / per-day, not worth caching.

Cache TTL is 5 minutes. Min cacheable size is 1024 input tokens (Sonnet) — both cached blocks comfortably exceed that.

**Telemetry**: Stream consumption parses `message_start.message.usage` for `cache_read_input_tokens` / `cache_creation_input_tokens` / `input_tokens` and `message_delta.usage.output_tokens`. Final summary log line is `[ask-astrology] AI call done in Xs | cache_read=N cache_write=N regular_input=N output=N cache_hit_rate=N% finish=stop`. First call shows ~0% hit rate (cache write); subsequent calls within 5 min should show 80-95%.

**Do NOT** reorder the blocks, append new content to Block 1 or 2 between calls, or interpolate per-question values into the cached blocks — any of these breaks the prefix match and forces a full cache rewrite.
