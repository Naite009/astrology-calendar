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

CORE RULES: Do not guess astrocartography lines from interpretation alone — use calculated planetary angular lines only. Use city-to-line proximity thresholds and report distance from line when possible. Separate long-term natal relocation fit from current-year solar return relocation effects. Score each city by life priorities (home, career, love, vitality, healing, intensity) instead of one generic recommendation. Do not call a city universally "best" without specifying best for what. Do not treat Saturn, Mars, or Pluto lines as automatically bad — explain their use and cost. Make it clear which cities are better for home, which for career, and which for a temporary growth year.

Cover each of the following as its own detailed section:

NATAL ASTROCARTOGRAPHY — Sun, Moon, Venus, Jupiter, Saturn, Mars, Pluto angular lines (MC, IC, ASC, DSC). Report which lines cross which cities and the distance from line for each recommended city. Minimum 6-10 candidate cities.

RELOCATED NATAL CHART COMPARISON — For shortlisted cities, analyze: relocated Ascendant, relocated Midheaven and IC, relocated 4th/7th/10th houses, relocated Moon, relocated 4th house ruler, relocated 10th house ruler, benefics or malefics on relocated angles.

HOME AND EMOTIONAL FIT — Natal 4th house cusp and ruler, Moon sign and house, IC themes. What is the ideal climate, pace, neighborhood type, and community style? Also analyze the solar return 4th house — how does this year's energy shift the home picture?

CAREER AND PUBLIC LIFE FIT — Natal 10th house and ruler, MC themes, career-supportive cities. Which cities support public visibility, ambition, or recognition? How does the SR Midheaven point this year?

SOLAR RETURN RELOCATION EFFECTS — For shortlisted cities: relocated SR Ascendant, relocated SR Midheaven and IC, SR Venus and Jupiter on angles vs SR Saturn/Mars/Pluto/Neptune on angles. Which cities improve the SR home/career/love picture? Which destabilize it?

TIMING FOR A MOVE — Transits to Moon, IC, 4th house ruler, and 10th house ruler. Eclipses activating the 4th/10th axis or home indicators. Best move windows and caution windows over the next 12-18 months.

CITY SCORING AND DECISION SUPPORT — Score each city out of 10 and rate separately for home, career, love, vitality, healing, and intensity. Separate THIS YEAR cities (from solar return) from LONG-TERM cities (from natal). Include at least 2 caution cities per timeframe. Include recommended and caution cities as separate tables.

STRATEGY SUMMARY — Top cities this year, top cities long-term, cities to avoid, and ideal timing window. Prioritize clarity and decision usefulness over generic astrocartography language.`,
  },
  {
    id: "relationship",
    label: "Love & Relationships",
    icon: <Heart className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a deep, structured relationship and love analysis. Today's date is ${today()}. All timing must be future-relative to today. Do NOT include any location/city/astrocartography analysis — this is a relationship-only reading. Do NOT interpret Lilith unless Lilith data is explicitly provided in the chart context with a valid sign, degree, and house. Cover each of the following as its own detailed section:

NATAL RELATIONSHIP ARCHITECTURE — Analyze Venus sign, house, and aspects. Mars sign, house, and aspects. Moon sign, house, and aspects. 5th house cusp sign, its ruler, and any planets in the 5th (romance and dating). 7th house cusp sign, its ruler, and any planets in the 7th (partnership and commitment). 8th house cusp sign, its ruler, and any planets in the 8th (intimacy, trust, sexual bonding, power dynamics). Juno sign, house, and aspects (commitment needs). If Lilith data is available, include Lilith sign, house, and aspects (shadow attraction patterns). Synthesize into: love language, attraction style, dating style, sexual style, emotional needs, commitment pattern, intimacy pattern, shadow relationship pattern, and ideal partner profile. Each synthesis point should be a full sentence grounded in specific chart placements.

SOLAR RETURN LOVE ACTIVATION — Analyze SR Venus sign, house, and aspects. SR Moon sign, house, and aspects. SR 5th house cusp, ruler, and planets in 5th. SR 7th house cusp, ruler, and planets in 7th. SR Juno if available. SR outer planets (Jupiter, Saturn, Uranus, Neptune, Pluto) affecting the 5th, 7th, Venus, Mars, Moon, or Descendant. Synthesize into: relationship tone of the year, likelihood of new relationships, likelihood of deepening existing relationships, instability vs commitment themes, healing themes in love, and best environments for meeting someone.

NATAL AND SOLAR RETURN OVERLAY — Cross-reference SR placements against natal relationship indicators: SR Venus aspects to natal Venus, Mars, Moon, Juno, and Descendant ruler. SR Descendant within 3° of natal planets. SR 5th ruler aspects to natal relationship indicators. SR 7th ruler aspects to natal relationship indicators. SR planets falling into natal 5th, 7th, 8th, and 11th houses. SR angles activating natal Venus, Mars, Moon, or 7th ruler. Synthesize: what is being triggered in the natal relationship pattern this year, what feels new vs familiar, where growth or disruption is happening.

RELATIONSHIP TIMING WINDOWS — Use ephemeris-based future transit calculations only, covering the next 12-18 months. Include minimum 6 transits from Jupiter, Saturn, Uranus, Neptune, and Pluto (optionally Chiron if significant) to these natal points: Venus, Mars, Moon, Juno, Descendant, and the 7th house ruler. For EACH transit include: transiting planet, aspect type, exact degree, first applying date, exact hit date, separating/end date, plain-language interpretation, and a tag (meeting / attraction / commitment / test / rupture / healing).

ELEMENTAL & MODAL BALANCE — How the chart's element and modality distribution affects relationship patterns, compatibility, and what the person needs from a partner.

RELATIONSHIP STRATEGY SUMMARY — Who to look for (ideal partner archetype from the chart). Where love is most likely to begin (house/context, not cities). Best timing windows. Caution windows. What to avoid repeating (shadow patterns). How to work with the chart instead of against it. Do not overpromise soulmates or marriage. Do not claim certainty about outcomes. Differentiate chemistry from compatibility. Differentiate attraction from stability. Call out contradiction patterns in the chart when present.`,
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
