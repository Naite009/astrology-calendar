# Physics-Based Core Portrait

The Core Portrait currently lists what each placement *means* (topics, archetypes). You want it to explain *the physical collision* — how a planet's voltage hits the density of the house it lives in, and what that feels like in the body. All edits live in `src/lib/portraitComposer.ts` (presentation layer only — no astrology math changes).

## The mental model the engine will follow

```text
Planet + Sign  = VOLTAGE   (speed / pressure / texture of the signal)
Planet + House = MEDIUM    (density the signal has to travel through)
Collision      = SENSATION (what the body actually feels)
```

### House Density classes (new)

- **Reflex (1, 4, 7, 10 — angular):** zero-latency, live-wire. Signal hits the skin/room instantly.
- **Friction (6, primarily; also 2):** hard-wired to the nervous system. Thought must be *conducted* through the body — creates a thermal/data jam.
- **Submerged (12, 8, 4 as inner):** underwater density. Information is massive but lagged; surface answer trails the real one.
- **Wireless (3, 11, 9, 5 — air/fire mental houses):** low friction. Thought and speech are near-simultaneous.

### Voltage classes (new, per planet+sign)

A small lookup keyed by `${planet}-${sign}` for the planets that matter most in the live moment: Mercury, Mars, Venus, Moon, Sun. Examples:
- Aquarius Mercury → "high-voltage lightning, non-linear, instant"
- Libra Mercury → "balanced signal, edits in real time for precision"
- Pisces Mercury → "diffuse signal, arrives as impression before words"
- Scorpio Mars → "pressure cooker, concentrated, reactive"
- Aries Mars → "live-wire discharge, immediate"
- Capricorn Mars → "compressed voltage, pushed down for later"

(Curated, not exhaustive — only the combos that produce distinctive collisions. Falls back gracefully when a combo isn't mapped.)

### Collision rules (the synthesis)

A function `describeCollision(voltage, density)` returns a sensation sentence:

- High Voltage + Friction → **Data Jam.** "Fullness in the chest/throat; the brain has finished, the nerves are still grounding the current."
- High Pressure + Reflex → **The Wall.** "Body throws up a shield at skin-level before the mind has finished downloading."
- Balanced/Diffuse Voltage + Submerged → **Deep-Sea Lag.** "Understanding is there in real time; the language is still surfacing."
- Wireless + any → **Open Line.** "Thought and speech arrive together — nothing to translate."
- High Voltage + Submerged → **Signal Fog with Spark.** "Lightning underwater; sudden flashes of clarity that take time to articulate."
- High Pressure + Friction → **Pressure Cooker in the Hardware.** "The body holds the heat; release looks like an outburst or a shutdown, not a conversation."

## What gets written into `composePortrait`

Replace the current "stack" paragraph (the `stackLines.join(...)` block around lines 502–517) with a **two-layer Hardware Audit**, then a **Collision Report**, then the existing Moon regulation + pace fix.

### Layer 1: Hardware Audit (one short paragraph)

For Mercury, Mars, and the chart ruler, name:
- the sign as **voltage** (one phrase)
- the house as **density** (one phrase — using the new class label, not the topic)

Example output style:
> "Mercury runs as **balanced signal** through a **submerged 12th-house medium** — the understanding loads underwater. Mars runs as **pressure cooker** in a **reflex 1st-house medium** — it discharges at the skin before the mind catches up."

### Layer 2: Collision Report (one short paragraph)

Apply the collision rules to the two strongest hardware setups and describe the **sensation**, not the personality:
> "When the room moves fast, the live wire on the surface (Mars 1st) throws up a wall before the deep processor (Mercury 12th) has surfaced the actual words. What looks like coldness is a shield bought to protect a system still downloading."

### Layer 3 (kept): Moon regulation + Pace Fix

The existing `MOON_NEED` line and `PACE_FIX` line stay. They are the only "what to do" beats and they already work.

## Vocabulary swap (enforced)

Inside the new sections, replace:

| Banned word | Use instead |
|---|---|
| intense | pressure at the skin |
| quiet, shut down | conducting electricity |
| vague, spacey | underwater processing |
| slow, indecisive | grounding the surge |
| reactive | live wire discharge |
| people-pleasing | editing the signal in real time |

## What stays the same

- The `lifeStageChapter` block above Core Portrait.
- The opening "live mechanic" sentence (`SUN_LIVE[sunSign]`).
- The chart-ruler "what it actually believes" sentence (`RULER_BELIEF`).
- The Sun–Chiron permission line.
- `systemMechanism`, `bridge`, `stageAsk`, `misreads`, `whatHelps`, `chainOfCommand` — untouched.

The change is concentrated in steps 6–8 of the current portrait build (the synthesis + stack), which become Hardware Audit → Collision → regulation/fix.

## Files touched

- `src/lib/portraitComposer.ts` — add `HOUSE_DENSITY`, `VOLTAGE`, `COLLISION` maps + a `describeCollision()` helper; rewrite the synthesis paragraph block.

No changes to `childPortrait.ts`, no new astrology math, no UI changes.

## Acceptance check

After the edit, the Core Portrait for Lauren (Libra Mercury 12th, Scorpio Mars 1st) should read approximately:
> "Mercury runs as a balanced signal through a submerged 12th-house medium — the words form underwater and surface after the moment. Mars runs as a pressure cooker on the 1st-house live wire — it puts a wall up at the skin before the words arrive. So in fast rooms, the shield gets thrown before the real answer has surfaced. That is not coldness and it is not people-pleasing — it is a deep processor protected by a surface reactor."

Not Lauren's exact wording, but that *shape* — voltage, medium, collision, sensation — for any chart the engine receives.
