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
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive relocation analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover each of the following as its own detailed section: NATAL ASTROCARTOGRAPHY LINES — which planetary lines cross which cities? Analyze Sun, Moon, Venus, Jupiter, and Midheaven lines for career/success locations. Analyze Moon, Venus, and IC lines for home/comfort locations. Flag any Saturn, Pluto, or Mars lines as caution zones. Cover at least 6-8 specific cities. 4TH HOUSE ANALYSIS (Home & Roots) — what does the natal 4th house cusp sign, its ruler's placement, and any planets in the 4th say about the ideal living environment? Include the Moon's sign and house as the primary emotional comfort indicator. What kind of home, climate, and community suits this person? Also analyze the solar return 4th house — how does this year's energy shift the home picture? 10TH HOUSE ANALYSIS (Career & Public Life) — what does the natal 10th house say about where career thrives? Where is the solar return Midheaven pointing this year? Which cities align career lines with the SR Midheaven? SOLAR RETURN RELOCATION EFFECTS — how would the SR Ascendant and angles shift in different cities? Which cities put benefic planets (Venus, Jupiter) on SR angles? Which cities would put challenging planets on angles and should be avoided? Use intention ratings (love, career, healing, vitality) when available to match cities to the person's priorities. ELEMENTAL AND MODAL FIT — based on the chart's elemental balance, does this person thrive in water cities (coastal, tropical), fire cities (desert, hot, dynamic), earth cities (mountains, rural, stable), or air cities (high altitude, intellectual hubs)? How does the solar return element balance modify this for the current year? TIMING FOR A MOVE — best windows based on transits to the 4th house ruler, IC, and Moon over the next 12-18 months. Include any upcoming eclipses or outer planet transits activating relocation houses. CITY COMPARISON TABLE — compare at least 6 cities. Separate recommended from caution cities. For each city include: which astro lines cross it, the overall theme, a score out of 10, and specific life areas it supports. Include at least 2 caution cities per timeframe. Show THIS YEAR cities (from solar return) and LONG-TERM cities (from natal) as separate tables. STRATEGY SUMMARY — top cities this year, top cities long-term, cities to avoid, and ideal timing window.`,
  },
  {
    id: "relationship",
    label: "Love & Relationships",
    icon: <Heart className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive relationship and love analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: VENUS & MARS ANALYSIS — Venus sign, house, and aspects describing love language, attraction style, and values in partnership. Mars sign, house, and aspects showing how desire, sexual chemistry, and pursuit energy manifest. THE MOON IN LOVE — Moon sign and house revealing emotional needs, nurturing style, and what creates safety in a relationship. 7TH HOUSE & DESCENDANT — the Descendant sign, its ruler's placement, and what this person naturally attracts in a partner. JUNO & COMMITMENT — where Juno falls and what it says about long-term commitment needs and ideal partnership structure. 5TH HOUSE (Romance & Dating) — the sign on the 5th house cusp and any planets there revealing how romance, flirtation, and creative self-expression in love play out. 8TH HOUSE (Intimacy & Trust) — the 8th house cusp, its ruler, and any planets there showing how deep intimacy, vulnerability, power dynamics, and sexual bonding work. LILITH — Lilith's sign and house showing shadow attraction patterns and where obsessive or taboo dynamics may emerge. SOLAR RETURN LOVE INDICATORS — what does this year's SR say about love timing, new relationships, or deepening existing ones? Look at SR Venus, SR 7th house, and SR 5th house. RELATIONSHIP TRANSITS — ALL major transits affecting Venus, Mars, the 7th house ruler, Juno, and the Descendant over the next 12-18 months with exact degrees and date ranges. Include outer planet transits (Pluto, Neptune, Uranus) as well as Jupiter and Saturn. Aim for 4-6 transits minimum. BEST CITIES FOR LOVE — at least 4 cities where Venus DSC, Jupiter DSC, or Venus IC lines support romantic connection. CAUTION ZONES — at least 2 cities where Saturn DSC, Pluto DSC, or Mars DSC lines could attract difficult relationship dynamics. ELEMENTAL BALANCE — how the chart's element and modality mix affects relationship patterns and compatibility. STRATEGY SUMMARY — who to look for, where, when the best windows are, and what to avoid.`,
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
