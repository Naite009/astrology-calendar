import { MapPin, Heart, Briefcase, Activity, DollarSign, Compass } from "lucide-react";

export interface QuickTopic {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: (name: string, birthDate: string, birthTime: string, birthLocation: string) => string;
}

const today = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export const QUICK_TOPICS: QuickTopic[] = [
  {
    id: "relocation",
    label: "Where Should I Live?",
    icon: <MapPin className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, determine the best cities for relocation. Today's date is ${today()}. All timing must be future-relative to today.

ANALYSIS MODE: This is Astrology-Based Relocation Guidance unless actual astrocartography line calculations are present in the chart data. Do NOT label recommendations as "astrocartography" unless real planetary line data with orbs and distances exists. Do NOT claim a city is "on a Venus line" or "on a Jupiter line" unless line calculations are provided. If only natal chart and solar return are available, use chart symbolism to infer environmental fit.

SCORING ALGORITHM: Score each city across 6 categories (home, career, love, healing, vitality, risk) on a 1-10 scale. For THIS YEAR cities, weight solar return at 55% and natal at 45%. For LONG-TERM cities, weight natal at 75% and solar return at 25%. Calculate overall_score as weighted average of the 5 support scores minus a risk penalty (max(0, (risk_score - 5) * 0.35)), clamped 1-10.

SCORING CATEGORY LOGIC:
- Home: natal 4th house/ruler, Moon, IC themes + city climate/pace/community match + SR 4th/Moon modifiers
- Career: natal 10th house/ruler, Sun, MC themes + city opportunity/industry/visibility + SR MC/10th modifiers
- Love: natal Venus, 7th house/ruler, Juno, 5th house + city social accessibility/romantic culture + SR Venus/5th/7th modifiers
- Healing: Moon condition, 12th house, Neptune, Chiron + city calmness/nature/privacy + SR Moon/Neptune/Chiron modifiers
- Vitality: Sun, Mars, Jupiter, 1st house + city energy/outdoor access/pace + SR Sun/Mars/Jupiter modifiers
- Risk: Saturn/Mars/Pluto/Uranus sensitivity + city overstimulation/isolation/pressure + SR destabilization signatures

GLOBAL CITY SUPPORT: When no user-specified city list is provided, recommend cities from a diverse global pool spanning multiple world regions (North America, Europe, Asia, Oceania, South America, Middle East, Africa). Always include city + country. Balance at least 2-3 world regions in recommendations.

CITY TAGS: Assign 2-5 tags per city from: Water-Supportive, Structured, Social, Quiet, Career-Active, Healing-Oriented, High-Intensity, Romantic, Grounding, Transformational.

Cover each of the following as its own detailed section:

ENVIRONMENTAL PROFILE — Before recommending any cities, establish what this person NEEDS:
- Ideal home environment (from 4th house cusp/ruler, Moon sign/house, IC themes)
- Ideal climate type (fire=hot/dry, earth=temperate/stable, air=high-altitude/breezy, water=coastal/humid)
- Social structure needs (from 7th/11th house, Venus, Moon)
- Emotional stability needs (from Moon aspects, 4th house condition, Saturn)
- Career environment needs (from 10th house, MC ruler, Sun)
- This year's environmental shift (from SR 4th house, SR Moon, SR Ascendant)

ASTROCARTOGRAPHY OR CHART-BASED GUIDANCE — If astrocartography line data is present, report planetary angular lines with distances. If NOT present, explain chart-based reasoning for city fit (e.g., "4th house ruler in Pisces favors coastal cities") and label as Astrology-Based. Do NOT fake line data.

DECISION SYNTHESIS — For each city, explain WHY it works by connecting chart placements to city characteristics. Include clear tradeoffs. Flag cities with strong chart resonance but environmental mismatch, and vice versa.

TIMING FOR A MOVE — Transits to Moon, IC, 4th house ruler, 10th house ruler. Eclipses activating 4th/10th axis. Best move windows and caution windows over next 12-18 months.

CITY COMPARISON TABLES — Top 3 cities this year (SR-weighted). Top 3 long-term cities (natal-weighted). 2-3 caution cities. Each city must include: name, country, score, sub-scores (home/career/love/healing/vitality/risk), tags, theme, supports, cautions, and explanation.

STRATEGY SUMMARY — Top cities this year, top cities long-term, cities to avoid, ideal timing window, analysis mode disclosure.

ANTI-HALLUCINATION RULES: Never claim exact planetary line positions without line data. Never invent relocated angles without relocated chart data. Frame recommendations as "strongest matches" not certainties. Do not treat Mars/Saturn/Pluto as automatically bad — explain as intense/demanding/transformational. Always state whether this is Astrology-Based or Astrocartography-Based.`,
  },
  {
    id: "relationship",
    label: "Love & Relationships",
    icon: <Heart className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a deep, structured relationship and love analysis. Today's date is ${today()}. All timing must be future-relative to today. Do NOT include any location, city, or astrocartography analysis — this is a relationship-only reading. Do NOT interpret Lilith unless Lilith data is explicitly provided in the chart context with a valid sign, degree, and house. Do NOT interpret Juno or SR Juno unless Juno data is explicitly provided with a valid sign, degree, and house — if unavailable, omit entirely without comment.

Cover each of the following as its own detailed section:

---

SECTION 1: NATAL RELATIONSHIP ARCHITECTURE

Analyze each of the following placements individually before synthesizing:
- Venus: sign, house, and all aspects
- Mars: sign, house, and all aspects
- Moon: sign, house, and all aspects
- North Node: sign, house, and aspects — interpret as the soul-growth trajectory in relationships and the relational pattern being grown toward (contrast with South Node as the default comfort zone)
- 5th house: cusp sign, its ruler (sign, house, and aspects), and any planets in the 5th (romance, dating, attraction)
- 7th house: cusp sign, its ruler (sign, house, and aspects), and any planets in the 7th (partnership, commitment, the Descendant archetype)
- 8th house: cusp sign, its ruler (sign, house, and aspects), and any planets in the 8th (intimacy, trust, sexual bonding, power dynamics, shared vulnerability)
- Juno: sign, house, and aspects — interpret as commitment needs and the partner archetype sought for long-term bonding (include only if data is available)
- Vertex: sign and house — interpret as the fated encounter point and what types of people or circumstances tend to arrive as significant relationship catalysts (include only if data is available)
- Lilith: sign, house, and aspects — interpret as shadow attraction patterns and taboo desire (include only if explicitly provided with valid sign, degree, and house)

Then synthesize into the following points. Each must be a full sentence grounded in at least one specific chart placement:
- Love language
- Attraction style
- Dating style
- Sexual style
- Emotional needs in relationship
- Commitment pattern
- Intimacy pattern
- Shadow relationship pattern (what gets repeated unconsciously)
- Contradiction patterns in the chart (call out any placements that pull in opposing directions — do not smooth over tension)
- Ideal partner profile

---

SECTION 2: SOLAR RETURN LOVE ACTIVATION

Analyze each of the following SR placements individually:
- SR Venus: sign, house, and aspects
- SR Moon: sign, house, and aspects
- SR North Node: sign and house — how does the SR nodal axis interact with the natal relationship axis and nodal story?
- SR 5th house: cusp sign, its ruler, and any planets in the SR 5th
- SR 7th house: cusp sign, its ruler, and any planets in the SR 7th
- SR Juno: sign and house (include only if data is available)
- SR outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto): include only those making a direct aspect to SR Venus, SR Mars, SR Moon, SR 5th house ruler, SR 7th house ruler, or the SR Descendant — skip any that are not meaningfully activated

Then synthesize:
- Relationship tone of the year
- Likelihood and conditions for new relationships forming
- Likelihood and conditions for deepening existing relationships
- Instability vs. commitment themes
- Healing themes in love
- Best environments or contexts for meeting someone (describe by house/life domain, not geography)

---

SECTION 3: NATAL AND SOLAR RETURN OVERLAY

Cross-reference SR placements against natal relationship indicators using a maximum orb of 3°:
- SR Venus aspects to natal Venus, Mars, Moon, Juno (if available), and Descendant ruler
- SR Descendant: note if it falls within 3° of any natal planet and interpret
- SR 5th house ruler aspects to natal relationship indicators
- SR 7th house ruler aspects to natal relationship indicators
- SR planets falling into natal 5th, 7th, 8th, or 11th houses
- SR angles (ASC, DSC, MC, IC) activating natal Venus, Mars, Moon, or 7th house ruler

Then synthesize:
- What is being triggered in the natal relationship pattern this year
- What feels new vs. what feels like familiar territory
- Where growth is happening vs. where disruption is happening
- How the SR is either supporting or challenging the natal relationship architecture

---

SECTION 4: RELATIONSHIP TIMING WINDOWS

Using ephemeris-based calculations only, cover all meaningful transits over the next 12–18 months from today's date. Include transits from Jupiter, Saturn, Uranus, Neptune, and Pluto — and Chiron if it is making a direct, exact aspect — to the following natal points: Venus, Mars, Moon, North Node, Juno (if available), Descendant, and the 7th house ruler.

Only include a transit if the transiting planet comes within 1° of exact during the window. Do not stretch or manufacture transits to reach a minimum count. For slow-moving planets (Saturn, Uranus, Neptune, Pluto), confirm the aspect is genuinely active within the 18-month window before including it.

For EACH qualifying transit provide:
- Transiting planet and aspect type
- Exact degree of the aspect
- First applying date (when orb enters 1°)
- Exact hit date
- Separating/end date (when orb leaves 1°)
- Plain-language interpretation of how this transit is likely to feel in relationships
- Tag: one of [meeting / attraction / deepening / commitment / test / rupture / healing / karmic]

---

SECTION 5: ELEMENTAL AND MODAL BALANCE

Analyze the elemental (fire, earth, air, water) and modal (cardinal, fixed, mutable) distribution of the natal chart. Ground this specifically in how the elemental and modal balance — or imbalance — shows up in the relationship indicators already analyzed above. Do not give a generic textbook summary. Connect directly to Venus, Mars, Moon, the 7th house ruler, and the synthesis points from Section 1. Include what this person may unconsciously seek in a partner to compensate for what is underrepresented in their own chart.

---

SECTION 6: RELATIONSHIP STRATEGY SUMMARY

Synthesize the entire reading into actionable guidance:
- Ideal partner archetype (drawn from the full chart, not just Sun sign)
- Where love is most likely to begin (describe by house and life domain — not cities or geography)
- Best timing windows from Section 4
- Caution windows from Section 4
- Shadow patterns to stop repeating (drawn from Section 1 synthesis)
- How to work with this chart instead of against it

Tone requirements for this section: Do not overpromise soulmates, marriage, or certainty about outcomes. Differentiate chemistry from long-term compatibility. Differentiate initial attraction from relational stability. Be honest about contradiction patterns. This section should feel like wise counsel, not a horoscope.`,
  },
  {
    id: "career",
    label: "Career & Purpose",
    icon: <Briefcase className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive career and professional purpose analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: CAREER DNA — 10th house cusp sign, its ruler, Sun sign/house, MC degree. What fields, industries, and roles align with this energy? Include Mars sign/house for ambition and competitive drive, and Jupiter sign/house for where professional luck and expansion naturally flow. HIDDEN STRENGTHS — 6th house for daily work style and ideal work environment. 2nd house for earning style and relationship with money. 8th house for joint ventures, investments, and ability to manage others' resources. 11TH HOUSE & NETWORKING — the 11th house cusp and any planets there showing how professional community, networking, and long-term career goals play out. THE GROWTH EDGE — North Node sign/house for career destiny direction. Saturn sign/house for lessons and long-term mastery. Chiron's wound-to-gift pattern in career context — what professional strength comes from a personal wound? SOLAR RETURN CAREER INDICATORS — what does this year's SR Midheaven, SR 10th house planets, and SR 6th house say about career shifts, promotions, or new directions this year? BEST CITIES FOR CAREER — at least 4 cities where Sun MC, Jupiter MC, or Venus MC lines support professional success. CAUTION ZONES — at least 2 cities where Saturn MC, Mars MC, or Pluto MC lines create career friction or burnout. CAREER TIMING — transits to MC ruler, 10th house planets, Jupiter, Saturn, and North Node with exact degrees and date ranges over the next 12-18 months. ELEMENTAL BALANCE — how the chart's elements affect work style (fire=leadership, earth=persistence, air=communication, water=intuition). STRATEGY SUMMARY — ideal field, ideal work style, when to act, and what to avoid.`,
  },
  {
    id: "health",
    label: "Health & Wellness",
    icon: <Activity className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive health and wellness analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: VITALITY BLUEPRINT — Sun sign/house for core vitality and life force. 1st house/Ascendant for physical constitution and how the body presents. Mars sign/house for energy levels, physical drive, and exercise needs. EMOTIONAL & HORMONAL HEALTH — Moon sign/house for emotional well-being, digestive health, sleep patterns, and hormonal cycles. Venus sign/house for throat, kidney, and thyroid function, and the connection between pleasure and physical health. STRESS POINTS & VULNERABILITIES — 6th house cusp sign, its ruler, and any planets there for chronic patterns, daily health habits, and susceptibility to specific conditions. 12th house for hidden drains, mental health, and self-undoing patterns. Saturn sign/house for structural weaknesses (bones, teeth, joints, chronic conditions). Note any stelliums creating system overload. 8TH HOUSE (Crisis & Recovery) — regenerative capacity, surgical resilience, and how the body handles acute crises. HEALING & RECOVERY — Chiron sign/house for the wound-to-gift pattern and where holistic or alternative healing is most effective. Neptune sign/house for intuition-based healing and spiritual approaches. Jupiter sign/house for where the body recovers best and natural resilience. SOLAR RETURN HEALTH FLAGS — what does this year's SR 1st house, SR 6th house, and SR 12th house say about health themes? Are there SR planets on the Ascendant or in health houses? HEALTH TIMING — transits to 6th house ruler, Ascendant ruler, Mars, and Moon with exact degrees and date ranges. Flag any upcoming challenging transits (Saturn, Pluto) to health houses or the Ascendant. ELEMENTAL BALANCE — frame as what the body needs: fire=movement/heat, earth=routine/grounding, air=breathwork/nervous system support, water=rest/hydration/emotional release. STRATEGY SUMMARY — core strength, watch points, best daily practices, and timing for extra care.`,
  },
  {
    id: "money",
    label: "Money & Finances",
    icon: <DollarSign className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive financial and wealth analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: EARNING STYLE — 2nd house cusp sign, its ruler, and any planets in the 2nd. Venus sign/house for values, self-worth, and relationship to income. How does this person naturally attract and earn money? SPENDING & RISK — Mars sign/house for spending impulses, risk tolerance, and entrepreneurial drive. Where does financial aggression or impulsivity show up? SHARED RESOURCES & INVESTMENTS — 8th house cusp, its ruler, and any planets in the 8th. Pluto sign/house for transformation of wealth, inheritance potential, and power dynamics around money. 11TH HOUSE (Long-Term Wealth) — the 11th house cusp and any planets there for income from career, group ventures, and long-term financial goals. CAREER EARNINGS POTENTIAL — 10th house/MC connection to income and professional reputation. Jupiter sign/house for abundance, opportunity, and where financial luck flows. Saturn sign/house for long-term wealth building, financial discipline, and delayed rewards. NORTH NODE & KARMIC WEALTH — North Node sign/house revealing the karmic direction for building sustainable prosperity and what financial habits to grow into. SOLAR RETURN FINANCIAL INDICATORS — what does this year's SR 2nd house, SR 8th house, and SR Venus placement say about money flow, new income streams, or financial shifts? BEST CITIES FOR WEALTH — at least 4 cities where Jupiter IC, Venus MC, or Sun MC lines support financial growth (only if astrocartography data is available). FINANCIAL TIMING — transits to 2nd/8th house rulers, Venus, Jupiter, and Saturn with exact degrees and date ranges over the next 12-18 months. ELEMENTAL BALANCE — how the chart's elements affect financial habits (fire=bold bets, earth=steady growth, air=multiple income streams, water=intuitive investing). STRATEGY SUMMARY — best income path, investment style, when to act, and what to avoid.`,
  },
  {
    id: "spiritual",
    label: "Spiritual & Life Path",
    icon: <Compass className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive spiritual and life path analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: SOUL'S BLUEPRINT — North Node sign/house for destiny direction and what the soul is growing toward. South Node sign/house for past-life gifts, karmic patterns to release, and comfort zones that limit growth. INTUITIVE & PSYCHIC CAPACITY — Moon sign/house for emotional intuition, psychic sensitivity, and how spiritual insights arrive (dreams, feelings, visions). THE INNER TEACHER — Saturn sign/house for life's core lessons and where spiritual maturity is forged through challenges. Chiron sign/house for the wound that becomes your greatest gift and teaching. 12TH HOUSE (The Unseen) — the 12th house cusp sign, its ruler, and any planets there revealing the connection to the divine, meditation style, past-life karma, and where surrender is required. 8TH HOUSE (Death & Rebirth) — transformation cycles, occult sensitivity, shadow work, and how the soul evolves through crisis and letting go. 9TH HOUSE (Higher Wisdom) — philosophy, spiritual teachers, foreign spiritual traditions, and how higher learning expands consciousness. LILITH (Shadow Integration) — Lilith sign/house for reclaiming hidden power, shadow integration, and where societal taboos become spiritual gifts. THE AWAKENING POINTS — Uranus sign/house for sudden breakthroughs and liberation. Neptune sign/house for spiritual vision, mystical experiences, and divine connection. Pluto sign/house for deep transformation, soul-level power, and phoenix cycles. SOLAR RETURN SPIRITUAL INDICATORS — what does this year's SR 12th house, SR Neptune, SR North Node, and SR Pluto placement say about this year's spiritual growth and awakening opportunities? SPIRITUAL TIMING — transits to North Node, Neptune, Pluto, and 12th house ruler with exact degrees and date ranges over the next 12-18 months. Include any upcoming eclipses near the nodal axis. ELEMENTAL BALANCE — frame as spiritual temperament (fire=passionate devotion, earth=embodied practice, air=study/meditation, water=mystical surrender). STRATEGY SUMMARY — soul purpose, key lesson this lifetime, recommended spiritual practice, and timing for deepest growth.`,
  },
];

interface AskQuickTopicsProps {
  onSelect: (prompt: string) => void;
  chartName: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  disabled?: boolean;
}

export function AskQuickTopics({ onSelect, chartName, birthDate, birthTime, birthLocation, disabled }: AskQuickTopicsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {QUICK_TOPICS.map((topic) => (
        <button
          key={topic.id}
          disabled={disabled}
          onClick={() => onSelect(topic.prompt(chartName, birthDate, birthTime, birthLocation))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {topic.icon}
          {topic.label}
        </button>
      ))}
    </div>
  );
}
