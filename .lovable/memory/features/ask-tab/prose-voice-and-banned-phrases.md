---
name: Prose Voice & Banned Phrases
description: Hard banned-phrase list and named inline transition lines that replace bullets in compact relationship sections
type: preference
---
## Banned phrases (hard ban — never use anywhere in any Ask reading)
"blueprint", "DNA", "configuration", "this is the core of", "reinforces this", "the key placements suggest", "this configuration tells us", "your chart shows", "key indicators", "energetic signature", "cosmic", "the universe is", "tells a very specific story", "further emphasizes", "this is a direct contrast".

**"DNA" specifically** must NEVER appear in astrological context (no "Career DNA", "Astrology DNA", "chart DNA", "energetic DNA", etc.). Use "Foundation" or "Core" instead. The biological term "DNA" remains acceptable in body-part / anatomical references inside encyclopedic data files (e.g., Pluto ruling cellular regeneration) — but never in AI-generated prose or section titles.

If the AI catches itself about to use any of these, it must stop and rewrite in plain human language instead. A server-side `stripBannedPhrases` hygiene pass in `supabase/functions/ask-astrology/index.ts` runs after `dedupeRepeatedSentences` as a final safety net, replacing "DNA"/"dna" → "Foundation"/"foundation" and "blueprint" variants → "foundation" across all string fields in the JSON output. Replacements are recorded in `_validation_log` as `banned_phrases_replaced`.

## Three additional prose-quality enforcement passes (Lauren Newman defects)

Three companion hygiene passes run in the same emission pipeline (after `stripMetaSentences`) and log to `_validation_log`:

1. **`rewriteThirdPersonPronouns`** — Every Ask reading is strictly 2nd-person ("you" / "your"). This pass mechanically swaps stray third-person pronouns ("Their drive runs into walls", "they keep almost-getting the big thing") to 2nd-person and fixes verb agreement (`you keeps` → `you keep`, `you is` → `you are`). Skipped for `question_type === "biography" | "third_person"`. Logs as `third_person_pronouns_rewritten`.

2. **`dedupeAspectsAcrossSections`** — Each natal aspect (e.g. "Mars square Saturn", "Venus opposition Jupiter") AND each canned non-aspect sentence (e.g. "This is the South Node pattern: security through partnership instead of through self.") may appear in AT MOST ONE section per reading. The pass runs on every section EXCEPT known data/table types (`timing_section`, `modality_element`, `table_section`, `data_table`, `transit_table`, `windows_section`, `placement_table`) — i.e. ALL prose-bearing sections regardless of declared `type` (no longer gated to just `narrative_section`/`summary_box`). Inside each section a recursive walker descends into every nested object/array and cleans every string field except known metadata keys (`type`, `title`, `label`, `name`, `subtitle`, `heading`, `id`, `kind`, `planet`, `sign`, `house`, `degrees`, `aspect`, `natal_point`, `symbol`, `tag`, `date`, `date_range`, `dateRange`, `generated_date`, `subject`, `question_type`, `question_asked`, `balance_interpretation`, `windows`, `transits`, `items_meta`). This guarantees coverage of `body`, `content`, `text`, `prose`, `narrative`, `paragraphs[]`, `bullets[]` (string OR `{text}` OR `{value}`), `items[]`, AND any nested `subsections[]`/`blocks[]`/custom containers used by relationship/health/money templates. Two complementary dedupe maps run in parallel: (a) **aspect-key dedupe** keyed by sorted `<planet>|<kind>|<planet>`; (b) **exact-sentence dedupe** keyed by normalized sentence (lowercase, en/em-dashes unified to `-`, curly quotes unified, terminal `.!?` stripped, whitespace collapsed) — only fires for sentences ≥25 normalized chars to avoid eating short transitions. When a duplicate is dropped, the immediately following short sentence (<220 chars) without its own anchor is also dropped as an orphan continuation. Logs as `cross_section_aspect_duplicates_removed`.

3. **`stripOffTopicDomainPhrases`** — Aspect-library entries occasionally leak relationship-domain phrasing ("romanticizing people", "in your love life", "warmth with proportion", "a partner who can handle", "overgiving in love", "in love and friendship", "your romantic life", "idealizing your partner") into career/money/health/relocation readings. This pass replaces those phrases with domain-appropriate equivalents per `question_type`. **Health** maps the Venus-Jupiter relationship blurb tokens to body/recovery framing (e.g. "warmth with proportion" → "vitality with proportion", "a partner who can handle" → "a routine that can handle", "attractions are real strengths" → "vitality is a real strength"). **Money** maps to financial framing (e.g. "warmth with proportion" → "generosity with proportion", "in love and friendship" → "in your spending and giving"). **Relocation** maps to place framing ("a partner who can handle" → "a place that can hold"). **Career** maps to professional framing. Logs as `off_topic_domain_phrases_replaced`.

These passes are paired with explicit upstream SYSTEM_PROMPT rules: PRONOUN VOICE (strictly 2nd person), CROSS-SECTION ASPECT UNIQUENESS (at most one section per aspect), and DOMAIN-APPROPRIATE FRAMING (re-frame each aspect for the question_type before emitting).

### Career-template hardening (Lauren Newman 12-defects-per-reading sweep)

The Replit gate sweep showed all career readings failing on the same 4 boilerplate strings ("Their reach and their grasp don't match", "Their drive runs into walls", "They can outlast forces", "They communicate carefully and people take them seriously") repeated across the same 4 sections (Career Foundation, Hidden Strengths, 11th House and Networking, The Growth Edge). Solar Returns and Relocation passed clean.

Fix applied at three layers:
- **Template-level** (`SYSTEM_PROMPT` career section, after section 9): a new `CAREER PROSE QUALITY RULE` block (a–d) enumerates the 4 forbidden stock phrases by name with required 2nd-person rewrites, mandates one-section-per-aspect, bans relationship-domain phrases, and bans "DNA"/"blueprint"/"configuration" in section titles.
- **Hard-coded boilerplate rewrites** (`CAREER_BOILERPLATE_REWRITES` array): regex-driven deterministic rewrites for the 4 exact strings, run as the first step inside `rewriteSentencePronouns` so they're guaranteed clean even if the broader regex misses an edge case.
- **Broader pronoun coverage**: leading-clause swap now matches em-dash, en-dash, hyphen, colon, semicolon. Object-pronoun swap added (`take them seriously` → `take you seriously`). Verb-agreement map expanded from 22 to 50+ common verbs. Quick-reject also tests for the boilerplate patterns directly.
- **Health-template fix**: section 2 title "Your Vitality Blueprint" → "Your Vitality Foundation" (the runtime banned-phrase strip would catch it, but template-level fix prevents the AI from generating it).

## Prose-over-bullets in compact relationship mode
The compact relationship sections — "How You Love", "This Year in Love", "Where Natal and Solar Return Connect", and the prose portion of "Relationship Strategy" — must use continuous prose paragraphs in the `body` field (2–4 paragraphs each, line-break separated) and an empty `bullets: []` array. Synthesis happens through NAMED INLINE TRANSITION LABELS embedded inside the prose, not as separate bullet items.

## Allowed named transitions (inline labels, not bullets)
- "What you're attracted to vs. what you actually need:"
- "Early vs. committed:"
- "Shadow pattern:"
- "The core contradiction:"
- "What would actually work long-term:"
- "The emotional tone:"
- "What's shifting:"
- "What this year is for:"
- "Best timing windows:"
- "The one shadow pattern most worth breaking:"
- "How to work with this chart:"

Example inside body prose: "...you keep gravitating toward people who feel mentally electric. Shadow pattern: the same wit that hooks you also keeps you from asking the boring practical questions early enough. What would actually work long-term: someone who is steady AND can hold a real conversation — you don't have to choose."

Implemented in `supabase/functions/ask-astrology/index.ts` SYSTEM_PROMPT (top-of-prompt BANNED PHRASES block) and the COMPACT RELATIONSHIP MODE PROSE-OVER-BULLETS RULE.
