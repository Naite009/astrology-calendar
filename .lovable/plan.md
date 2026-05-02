# Parent ↔ Child Tab (Deterministic) + Parenting Reading in Ask Tab

## Part 1 — Family Tab (Deterministic, no AI)

New **👪 Family** tab. For any two saved charts marked as a family pair, generates a directional synastry report from hand-authored interpretations.

**UX**
- My Family panel: add child / parent / grandparent / sibling, each linked to a saved chart.
- Pair selector: FROM chart → TO chart, relationship dropdown, Swap button.
- Report sections: The Essence · How They Experience You · How You Land in Their Nervous System · The Inherited Pattern · What Helps.
- Each card: aspect glyph, orb, child-experience paragraph, parent-blind-spot paragraph, what-helps bullets. Behavior-first language.

**Curated aspect rows (FROM → TO)**
Sun→Moon, Moon→Sun, Asc→Sun, Mars→Moon, Mercury→Moon, Saturn→Sun, Moon→Venus, Jupiter→Sun, Venus→Moon, Pluto→Sun/Moon, Neptune→Sun/Moon, Chiron→Sun/Moon, North Node→Sun/Moon. Sibling pairs swap Saturn-authority for Mercury↔Mercury.

**Tech**
1. Extend `src/lib/familyRelationshipTypes.ts` with roles + `FamilyPair` type.
2. New table `family_relationships` (user_id NOT NULL, from_chart_id, to_chart_id, relationship, created_at) with owner-only RLS.
3. New `src/lib/parentChildSynastry.ts` — computes curated cross-aspects using `aspectOrbs.ts`.
4. New `src/data/parentChildInterpretations.ts` — ~65 hand-authored entries (13 framings × 5 aspect kinds), each with `childExperience`, `parentBlindSpot`, `whatHelps[]`. v1 ships with this set; expand later as gaps appear.
5. New components under `src/components/family/`: `FamilyTab`, `FamilyRoster`, `FamilyPairSelector`, `FamilySynastryReport`, `FamilyAspectCard`.
6. Register **👪 Family** in main tab navigation.

## Part 2 — Parenting Reading in Ask Tab

New `parenting` reading type using existing `ask-astrology` infrastructure.

**UX**
- Add **👪 Parenting** to Ask reading-type selector.
- Pair selector appears (Parent + Child charts from saved charts).
- Quick-Topic auto-submit buttons: "How does my child experience my anger?", "Why don't my words land?", "What does my child need from me right now?", "Where am I unintentionally repeating my own parents' patterns?", "What part of my child am I missing?", "How do my child and I clash, and why?"
- Free-text input also available.

**System prompt (additive to existing rules)**
```
PARENTING READING SYSTEM PROMPT

You are reading a directional dyad: PARENT chart → CHILD chart.
The parent is asking. The child is the receiver. Direction matters absolutely.

Mandatory structure:
1. The Essence of This Parent–Child Dynamic
   2–4 sentences. Zero jargon. Synthesize parent's Sun/Moon/Mars/Mercury/Saturn
   into how this specific child experiences them.

2. Direct Answer to the Question
   Behavior-first. Sentence 2 names the cross-chart aspect causing it.

3. How Your Child Experiences You (top 5 tightest cross-aspects, by orb)
   For each: a) what the child feels in their body, b) the cross-aspect with sign+orb+applying/separating,
   c) what the child has likely concluded about themselves, d) one concrete parenting move.

4. The Inherited Pattern
   Parent Saturn/Chiron/Pluto/Nodes to child's Sun/Moon/Asc.
   Name the unconscious transmission and the chance to break it.

5. What This Child Needs From You That Other Children Wouldn't
   Tied to child's Moon sign+house, Asc, Mercury. Not generic advice.

6. Where You Two Will Always Click
   Tightest supportive cross-aspects (trine/sextile ≤3°). Frame as shared language.

Hard rules:
- Never use synastry-romance language for the child.
- Never blame the child for parent's reactions or pathologize the child.
- Always frame challenges as "the child's nervous system reads X as Y" — never "child is difficult."
- Calibrate language by child's age: developmental <12, identity-formation 12–18, adult-child 18+.
- Honor BEHAVIOR-FIRST and ESSENCE OPENING rules.
- Inject EPHEMERIS FACT CHECK with both charts' verified placements.
- Apply existing retrograde post-processors.
```

**Tech**
1. Add `parenting` to Ask reading-type union + selector in `AskView.tsx`.
2. Add `secondChartId` (child) to Ask job payload; build child's chart context (ruler chains, planets-by-house) same as parent's.
3. In `supabase/functions/ask-astrology/index.ts`: add `PARENTING_SYSTEM_PROMPT` block, wire when `readingType === 'parenting'`, pass both contexts labeled `PARENT CHART` and `CHILD CHART`. Reuse all existing post-processors.
4. Add Quick-Topic buttons matching existing AI Chart Consultation auto-submit pattern.
5. Add memory file `mem://features/ask-tab/parenting-reading-standards.md`.

## Out of Scope
Composite/Davison family charts, 3+ person group dynamics, shared rosters across accounts.
