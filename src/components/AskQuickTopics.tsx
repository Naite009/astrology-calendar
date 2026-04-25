import { useState, useRef, useEffect } from "react";
import { MapPin, Heart, Briefcase, Activity, DollarSign, Compass, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CityInput } from "@/components/CityInput";
import { resolveCity } from "@/lib/cityResolver";

export interface UserLocationsInput {
  current?: string;
  considering1?: string;
  considering2?: string;
}

const sanitizeCityField = (raw: string): string =>
  raw.replace(/[^A-Za-z0-9 ,.\-'()]/g, "").slice(0, 80);

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
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a focused relationship and love analysis. Today's date is ${today()}. All timing must be future-relative to today. Do NOT include any location, city, or astrocartography analysis — this is a relationship-only reading. Do NOT interpret Lilith unless Lilith data is explicitly provided in the chart context with a valid sign, degree, and house. Do NOT interpret Juno or SR Juno unless Juno data is explicitly provided with a valid sign, degree, and house — if unavailable, omit entirely without comment.

PRIORITY RULE: Prioritize clarity over exhaustiveness. Only discuss placements and aspects that genuinely shape this person's relationship patterns. Skip any placement that doesn't add meaningful insight. A shorter, honest reading is better than a long one that repeats itself.

LANGUAGE STYLE: Always translate astrology into natural, human language. Do not make rigid or overly specific claims about behavior (e.g., frequency, exact habits, fixed traits). Instead describe tendencies, patterns, ways something may show up, and ranges of expression. Use language like "you may…", "this can show up as…", "you might find yourself…", "this often leads to…". The goal is to make the interpretation feel accurate, flexible, and recognizable — not absolute or overly literal.

CLARITY TRANSLATION RULE: Do not describe placements using abstract or trait-based language. Always translate into real-life situations and experiences. When describing a placement, answer: what actually happens, what the person experiences, what situations they get into, what this leads to over time. Avoid phrases like "mentally stimulating", "emotionally complex", "intense dynamics", "psychologically deep", "unclear energy". Instead describe concrete scenarios like "you may find yourself unsure where you stand with someone", "you might get attached before the relationship is clearly defined", "this can lead to mixed signals or inconsistent behavior". Every interpretation should feel like something the reader has actually experienced.

REWRITE FOR RECOGNITION: After writing each key sentence, internally test it: if someone with zero astrology knowledge read this, would they immediately recognize it from their real life? If not, rewrite it until they would. The reader should think "that's exactly what happens to me" — not "I wonder what that means." Never leave a sentence in abstract or symbolic form. Always land on the lived experience.

Cover each of the following as its own section:

---

SECTION 1: HOW THIS PERSON LOVES

OPENING RULE: The body paragraph MUST open with the specific chart placements that define this person's love style. First sentence names Venus sign+house, 7th house cusp sign, and the 7th house ruler's position. Second sentence translates what that configuration means for THIS person. Then continue into the portrait. NEVER open with an abstract statement like "Your relationship blueprint is built on a contradiction."

Lead with the 2–4 most important relationship placements in this chart — the ones that actually explain how this person operates in love. Always include Venus and the 7th house ruler. For Venus, Mars, and Moon: cover sign, house, and major aspects within valid orb only. Include Moon, Mars, North Node, 5th/8th house rulers, Juno, or Lilith ONLY if they add something the other placements don't already say. Do not list every placement mechanically — weave them into a portrait.

Then distill into these synthesis points (skip any that would be redundant or generic — only include points where the chart says something specific):
- What they're attracted to vs. what they actually need
- How they show up early in relationships vs. once committed
- Shadow pattern (what gets repeated unconsciously)
- Any genuine contradiction in the chart (placements pulling in opposite directions — name it honestly)
- What kind of partner would actually work long-term

---

SECTION 2: THIS YEAR IN LOVE (SOLAR RETURN)

OPENING RULE: The body paragraph MUST open by naming SR Venus sign+house and the SR 7th house cusp sign before any interpretation. Example: "SR Venus is in Scorpio in your 5th house, and the SR 7th house cusp is Pisces with its ruler Neptune in the 10th." Then translate what that means for THIS year.

Focus on only the SR placements that meaningfully activate relationship themes. Always cover SR Venus and the SR 7th house. Include SR Moon, SR 5th house, SR Juno, SR North Node, or SR outer planets ONLY if they make a direct aspect to a relationship indicator or fall in a relationship house. Skip anything inactive.

Synthesize into:
- The emotional tone of relationships this year
- What's shifting compared to the natal baseline
- Whether this year favors meeting someone new, deepening what exists, or doing inner work first

---

SECTION 3: WHERE NATAL AND SOLAR RETURN CONNECT

OPENING RULE: The body paragraph MUST open by naming the specific SR-to-natal overlap (e.g., "SR Mars at 12° Gemini lands exactly on your natal Mars in the 12th house"). Then explain what that activation means. NEVER open with "The Solar Return activates..." or similar abstractions.

Only include cross-references where a SR placement falls within 3° of a natal relationship point. Do not manufacture connections. If there are few genuine overlaps, say so — that itself is meaningful.

Synthesize: What part of the natal relationship pattern is being activated or challenged this year?

---

SECTION 4: RELATIONSHIP TIMING

Using ephemeris-based calculations only, cover transits over the next 12–18 months to natal Venus, Mars, Moon, Descendant, and 7th house ruler. Include North Node, Juno, or Chiron targets only if a major transit is genuinely within 1° during the window.

Only include transits that actually occur within 1° during the window. If there are only 2 real transits, report 2. Do not pad.

For each transit:
- What's transiting what, and the aspect type
- Exact degree and date range (applying → exact → separating)
- What it's likely to feel like in plain language
- Tag: meeting / attraction / deepening / commitment / test / rupture / healing / karmic

---

SECTION 5: RELATIONSHIP STRATEGY

Synthesize the entire reading into honest, actionable guidance:
- What kind of partner actually fits this chart (not Sun-sign matching — real compatibility factors)
- Best timing windows from Section 4
- The one shadow pattern most worth breaking
- How to work with this chart instead of against it

Tone: Wise counsel, not a horoscope. Do not overpromise. Differentiate chemistry from compatibility. Be direct about contradictions.`,
  },
  {
    id: "career",
    label: "Career & Purpose",
    icon: <Briefcase className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive career and professional purpose analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: CAREER FOUNDATION — 10th house cusp sign, its ruler, Sun sign/house, MC degree. What fields, industries, and roles align with this energy? Include Mars sign/house for ambition and competitive drive, and Jupiter sign/house for where professional luck and expansion naturally flow. HIDDEN STRENGTHS — 6th house for daily work style and ideal work environment. 2nd house for earning style and relationship with money. 8th house for joint ventures, investments, and ability to manage others' resources. 11TH HOUSE & NETWORKING — the 11th house cusp and any planets there showing how professional community, networking, and long-term career goals play out. THE GROWTH EDGE — North Node sign/house for career destiny direction. Saturn sign/house for lessons and long-term mastery. Chiron's wound-to-gift pattern in career context — what professional strength comes from a personal wound? SOLAR RETURN CAREER INDICATORS — what does this year's SR Midheaven, SR 10th house planets, and SR 6th house say about career shifts, promotions, or new directions this year? BEST CITIES FOR CAREER — at least 4 cities where Sun MC, Jupiter MC, or Venus MC lines support professional success. CAUTION ZONES — at least 2 cities where Saturn MC, Mars MC, or Pluto MC lines create career friction or burnout. CAREER TIMING — transits to MC ruler, 10th house planets, Jupiter, Saturn, and North Node with exact degrees and date ranges over the next 12-18 months. ELEMENTAL BALANCE — how the chart's elements affect work style (fire=leadership, earth=persistence, air=communication, water=intuition). STRATEGY SUMMARY — ideal field, ideal work style, when to act, and what to avoid.`,
  },
  {
    id: "health",
    label: "Health & Wellness",
    icon: <Activity className="h-4 w-4" />,
    prompt: (name, date, time, loc) =>
      `Using the full natal chart AND the current solar return chart for ${name}, born ${date} at ${time} in ${loc}, provide a comprehensive health and wellness analysis. Today's date is ${today()}. All timing must be future-relative to today. Cover: VITALITY BASELINE — Sun sign/house for core vitality and life force. 1st house/Ascendant for physical constitution and how the body presents. Mars sign/house for energy levels, physical drive, and exercise needs. EMOTIONAL & HORMONAL HEALTH — Moon sign/house for emotional well-being, digestive health, sleep patterns, and hormonal cycles. Venus sign/house for throat, kidney, and thyroid function, and the connection between pleasure and physical health. STRESS POINTS & VULNERABILITIES — 6th house cusp sign, its ruler, and any planets there for chronic patterns, daily health habits, and susceptibility to specific conditions. 12th house for hidden drains, mental health, and self-undoing patterns. Saturn sign/house for structural weaknesses (bones, teeth, joints, chronic conditions). Note any stelliums creating system overload. 8TH HOUSE (Crisis & Recovery) — regenerative capacity, surgical resilience, and how the body handles acute crises. HEALING & RECOVERY — Chiron sign/house for the wound-to-gift pattern and where holistic or alternative healing is most effective. Neptune sign/house for intuition-based healing and spiritual approaches. Jupiter sign/house for where the body recovers best and natural resilience. SOLAR RETURN HEALTH FLAGS — what does this year's SR 1st house, SR 6th house, and SR 12th house say about health themes? Are there SR planets on the Ascendant or in health houses? HEALTH TIMING — transits to 6th house ruler, Ascendant ruler, Mars, and Moon with exact degrees and date ranges. Flag any upcoming challenging transits (Saturn, Pluto) to health houses or the Ascendant. ELEMENTAL BALANCE — frame as what the body needs: fire=movement/heat, earth=routine/grounding, air=breathwork/nervous system support, water=rest/hydration/emotional release. STRATEGY SUMMARY — core strength, watch points, best daily practices, and timing for extra care.`,
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

function buildPromptWithContext(
  topic: QuickTopic,
  name: string,
  birthDate: string,
  birthTime: string,
  birthLocation: string,
  personalContext?: string
): string {
  const basePrompt = topic.prompt(name, birthDate, birthTime, birthLocation);
  if (!personalContext?.trim()) return basePrompt;

  const contextBlock = `\n\nPERSONAL CONTEXT: The person specifically wants to know about: "${personalContext.trim()}"\nWeave this into the relevant sections of your analysis. Do not create a separate section for it — integrate it naturally where it fits (e.g., timing, compatibility patterns, attraction style, environmental preferences, career direction). Address their specific situation through the lens of their chart placements.`;

  return basePrompt + contextBlock;
}

interface AskQuickTopicsProps {
  onSelect: (prompt: string, userLocations?: UserLocationsInput) => void;
  chartName: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  disabled?: boolean;
}

export function AskQuickTopics({ onSelect, chartName, birthDate, birthTime, birthLocation, disabled }: AskQuickTopicsProps) {
  const [activeTopic, setActiveTopic] = useState<QuickTopic | null>(null);
  const [personalContext, setPersonalContext] = useState("");
  // Relocation-only inline city inputs. Rendered next to the personal-context
  // textarea when activeTopic.id === "relocation". All optional — empty
  // values are filtered before the userLocations object is sent.
  const [relocCurrent, setRelocCurrent] = useState("");
  const [relocCity1, setRelocCity1] = useState("");
  const [relocCity2, setRelocCity2] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeTopic && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeTopic]);

  const handleTopicClick = (topic: QuickTopic) => {
    if (disabled) return;
    setActiveTopic(topic);
    setPersonalContext("");
    setRelocCurrent("");
    setRelocCity1("");
    setRelocCity2("");
  };

  const handleSubmit = () => {
    if (!activeTopic) return;
    const prompt = buildPromptWithContext(
      activeTopic,
      chartName,
      birthDate,
      birthTime,
      birthLocation,
      personalContext
    );
    let userLocations: UserLocationsInput | undefined;
    if (activeTopic.id === "relocation") {
      // Substitute the resolved canonical city when the resolver is confident
      // ("wynwyd pa" → "Wynnewood, PA"). Falls back to the raw trimmed input.
      const resolveOrRaw = (raw: string): string | undefined => {
        const trimmed = raw.trim();
        if (!trimmed) return undefined;
        const match = resolveCity(trimmed);
        return match?.canonical ?? trimmed;
      };
      const current = resolveOrRaw(relocCurrent);
      const considering1 = resolveOrRaw(relocCity1);
      const considering2 = resolveOrRaw(relocCity2);
      if (current || considering1 || considering2) {
        userLocations = { current, considering1, considering2 };
      }
    }
    setActiveTopic(null);
    setPersonalContext("");
    setRelocCurrent("");
    setRelocCity1("");
    setRelocCity2("");
    onSelect(prompt, userLocations);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK_TOPICS.map((topic) => (
          <button
            key={topic.id}
            disabled={disabled}
            onClick={() => handleTopicClick(topic)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none ${
              activeTopic?.id === topic.id
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-foreground hover:bg-primary/10 hover:border-primary/30"
            }`}
          >
            {topic.icon}
            {topic.label}
          </button>
        ))}
      </div>

      {activeTopic && (
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Included prompt for {activeTopic.label}
              </p>
              <div className="rounded-md border border-border bg-muted/40 p-3 max-h-[200px] overflow-y-auto">
                <p className="text-xs text-foreground/80 whitespace-pre-wrap">
                  {activeTopic.prompt(chartName, birthDate, birthTime, birthLocation)}
                </p>
              </div>
            </div>

            {activeTopic.id === "relocation" && (
              <div className="space-y-2 rounded-md border border-primary/30 bg-primary/5 p-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    Your Location Choices (optional)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add any cities you want analyzed specifically. The reading will include a
                    dedicated <span className="font-medium text-foreground">"Your Location Choices"</span>{" "}
                    section that maps each one to your chart. Leave blank for the general reading.
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <CityInput
                    id="reloc-current"
                    label="Current city"
                    placeholder="e.g. Brooklyn, NY"
                    value={relocCurrent}
                    onChange={(v) => setRelocCurrent(sanitizeCityField(v))}
                    disabled={disabled}
                  />
                  <CityInput
                    id="reloc-c1"
                    label="Considering #1"
                    placeholder="e.g. Lisbon, Portugal"
                    value={relocCity1}
                    onChange={(v) => setRelocCity1(sanitizeCityField(v))}
                    disabled={disabled}
                  />
                  <CityInput
                    id="reloc-c2"
                    label="Considering #2"
                    placeholder="e.g. Mexico City, Mexico"
                    value={relocCity2}
                    onChange={(v) => setRelocCity2(sanitizeCityField(v))}
                    disabled={disabled}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Anything additional you'd like included in this reading?
              </p>
              <Textarea
                ref={textareaRef}
                value={personalContext}
                onChange={(e) => setPersonalContext(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  activeTopic.id === "relationship"
                    ? 'e.g., "I met someone earthy, should I pursue it?"'
                    : activeTopic.id === "relocation"
                    ? 'e.g., "I got a job offer in Denver"'
                    : activeTopic.id === "career"
                    ? 'e.g., "Thinking about switching to freelance work"'
                    : activeTopic.id === "health"
                    ? 'e.g., "I\'ve been having trouble sleeping lately"'
                    : activeTopic.id === "money"
                    ? 'e.g., "Considering investing in real estate"'
                    : 'e.g., "I keep seeing repeating numbers everywhere"'
                }
                className="min-h-[72px] text-sm resize-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                className="text-xs"
              >
                <Send className="h-3 w-3 mr-1" />
                Generate Reading
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
