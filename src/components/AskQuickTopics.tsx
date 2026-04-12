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
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive relocation analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover each of the following as its own detailed section: NATAL ASTROCARTOGRAPHY LINES — which planetary lines cross which cities? Analyze Sun, Moon, Venus, Jupiter, and Midheaven lines for career/success locations. Analyze Moon, Venus, and IC lines for home/comfort locations. Flag any Saturn, Pluto, or Mars lines as caution zones. Cover at least 6-8 specific cities. 4TH HOUSE ANALYSIS (Home & Roots) — what does the natal 4th house cusp sign, its ruler's placement, and any planets in the 4th say about the ideal living environment? What kind of home, climate, and community suits this person? Also analyze the solar return 4th house. 10TH HOUSE ANALYSIS (Career & Public Life) — what does the natal 10th house say about where career thrives? Where is the solar return Midheaven pointing this year? SOLAR RETURN RELOCATION EFFECTS — if the solar return were cast for different cities, how would the SR angles shift? Which cities put benefics on angles? Which should be avoided? ELEMENTAL AND MODAL FIT — does this person thrive in water cities (coastal), fire cities (desert, dynamic), earth cities (mountains, stable), or air cities (high altitude, intellectual)? TIMING FOR A MOVE — best windows based on transits to the 4th house ruler, IC, and Moon over the next 12-18 months. CITY COMPARISON TABLE — compare at least 6 cities with astro lines, theme, score out of 10, and life areas supported. Include at least 2 caution cities per timeframe. STRATEGY SUMMARY — top cities this year, top cities long-term, cities to avoid, and ideal timing window.`,
  },
  {
    id: "relationship",
    label: "Love & Relationships",
    icon: <Heart className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive relationship and love analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: VENUS ANALYSIS — Venus sign, house, and aspects describing love language and attraction style. 7TH HOUSE — the Descendant sign, its ruler's placement, and what this person naturally attracts in a partner. JUNO — where Juno falls and what it says about long-term commitment needs. RELATIONSHIP TRANSITS — ALL major transits affecting Venus, 7th house ruler, Juno, and the Descendant over the next 12-18 months with exact degrees and date ranges. Include outer planet transits. SOLAR RETURN RELATIONSHIP INDICATORS — what does this year's SR say about love timing, new relationships, or deepening existing ones? BEST CITIES FOR LOVE — at least 4 cities where Venus DSC, Jupiter DSC, or Venus IC lines support romantic connection. CAUTION ZONES — at least 2 cities where Saturn DSC, Pluto DSC, or Mars DSC lines could attract difficult dynamics. ELEMENTAL BALANCE — how the chart's element mix affects relationship patterns. STRATEGY SUMMARY — who to look for, where, when the best windows are, and what to avoid.`,
  },
  {
    id: "career",
    label: "Career & Purpose",
    icon: <Briefcase className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive career and professional purpose analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: CAREER DNA — 10th house cusp sign, its ruler, Sun sign/house, MC degree. What fields and roles align with this energy? HIDDEN STRENGTHS — 6th house for daily work style, 2nd house for earning style, 8th house for joint ventures and investments. THE GROWTH EDGE — North Node purpose, Saturn lessons, and Chiron's wound-to-gift in career context. BEST CITIES FOR CAREER — at least 4 cities where Sun MC, Jupiter MC, or Venus MC lines support professional success. CAUTION ZONES — at least 2 cities where Saturn MC, Mars MC, or Pluto MC lines create career friction. CAREER TIMING — transits to MC ruler, 10th house planets, and North Node with exact degrees and date ranges over the next 12-18 months. ELEMENTAL BALANCE — how the chart's elements affect work style. STRATEGY SUMMARY — ideal field, ideal work style, when to act, and what to avoid.`,
  },
  {
    id: "health",
    label: "Health & Wellness",
    icon: <Activity className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive health and wellness analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: VITALITY BLUEPRINT — Sun sign/house for core vitality, 1st house/Ascendant for physical constitution, Mars for energy and drive. STRESS POINTS & VULNERABILITIES — 6th house for chronic patterns, 12th house for hidden drains, Saturn for structural weaknesses, any stelliums creating overload. HEALING & RECOVERY — Chiron sign/house for the wound-to-gift pattern, Neptune for intuition and spiritual healing, Jupiter for where the body recovers best. HEALTH TIMING — transits to 6th house ruler, Ascendant ruler, and Mars with exact degrees and date ranges. Flag any upcoming challenging transits to health houses. ELEMENTAL BALANCE — frame as what the body needs: fire=movement, earth=routine, air=breath/nervous system, water=rest/hydration. STRATEGY SUMMARY — core strength, watch points, best practices, and timing.`,
  },
  {
    id: "money",
    label: "Money & Finances",
    icon: <DollarSign className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive financial and wealth analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: EARNING STYLE — 2nd house cusp, its ruler, Venus sign/house for values and income. SHARED RESOURCES & INVESTMENTS — 8th house cusp, its ruler, Pluto for transformation of wealth, any planets in the 8th. CAREER EARNINGS POTENTIAL — 10th house/MC connection to income, Jupiter for abundance and opportunity, Saturn for long-term wealth building. BEST CITIES FOR WEALTH — at least 4 cities where Jupiter IC, Venus MC, or Sun MC lines support financial growth. FINANCIAL TIMING — transits to 2nd/8th house rulers, Venus, and Jupiter with exact degrees and date ranges over the next 12-18 months. ELEMENTAL BALANCE — how the chart's elements affect financial habits. STRATEGY SUMMARY — best income path, investment style, when to act, and what to avoid.`,
  },
  {
    id: "spiritual",
    label: "Spiritual & Life Path",
    icon: <Compass className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive spiritual and life path analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: SOUL'S BLUEPRINT — North Node sign/house for destiny direction, South Node for past-life gifts to release. THE INNER TEACHER — Saturn sign/house for life lessons, Chiron for the wound that becomes your gift, 12th house for spiritual connection. THE AWAKENING POINTS — Uranus for breakthroughs, Neptune for spiritual vision, Pluto for deep transformation. SPIRITUAL TIMING — transits to North Node, Neptune, and 12th house ruler with exact degrees and date ranges. ELEMENTAL BALANCE — frame as spiritual temperament. STRATEGY SUMMARY — soul purpose, key lesson, spiritual practice, and timing for growth.`,
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
    <div className="flex flex-wrap gap-2">
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
