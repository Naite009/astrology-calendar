import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NatalChart } from "@/hooks/useNatalChart";

// ─── PROPS ───────────────────────────────────────────────────────────────────

interface MercuryRetrogradeGuideProps {
  allCharts: NatalChart[];
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const SIGN_ORDER = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"] as const;

function getAscendantSign(chart: NatalChart): string {
  const asc = chart.planets?.Ascendant;
  if (!asc?.sign) return "none";
  return asc.sign.toLowerCase();
}

// House position of a sign relative to the rising sign
function getHouseOfSign(risignSign: string, targetSign: string): number | null {
  const rIdx = SIGN_ORDER.indexOf(risignSign as any);
  const tIdx = SIGN_ORDER.indexOf(targetSign as any);
  if (rIdx === -1 || tIdx === -1) return null;
  return ((tIdx - rIdx + 12) % 12) + 1;
}

const HOUSE_MEANINGS = {
  1: { name: "1st House — Self & Identity", description: "Mercury stations retrograde across your Ascendant — the very lens through which you see the world. You've been rebuilding your entire sense of self since 2023. Who you've become under Saturn's pressure is now being reviewed. Expect old versions of yourself to surface. Which parts served you? Which are ready to dissolve for good? This retrograde asks you to re-introduce yourself — to yourself first." },
  2: { name: "2nd House — Resources & Worth", description: "Your relationship to money, security, and what you value has been radically restructured by Saturn since 2023. This retrograde passes through that zone of earned income and self-worth. Financial plans may need revisiting. But more than money — your deepest beliefs about what you deserve are being reviewed. This is a profound moment to reclaim value you once gave away." },
  3: { name: "3rd House — Mind & Communication", description: "Siblings, neighbors, local environment, writing, and speaking — your Pisces 3rd house has been under Saturn's rewrite since 2023. Your entire way of thinking and communicating was restructured. Now Mercury's retrograde here asks: what still needs to be said? Old conversations may resurface. Reach out. Revise. The words you write now may carry unexpected power." },
  4: { name: "4th House — Home & Roots", description: "Home, family, ancestors, and your emotional foundation — Saturn rewired all of this for you from 2023–2026. Now Mercury retraces those degrees. Old family dynamics, unresolved housing matters, or ancestral patterns may re-emerge for final review. You're not going backward — you're integrating the enormous shifts in your private world." },
  5: { name: "5th House — Creativity & Romance", description: "Children, creative expression, romance, and play lived under Saturn's weight from 2023–2026. Joy came with responsibility. Now this Mercury retrograde moves through that same creative territory. An old romance or creative project may resurface for review. What did you create — or give up — during those years? This is your reclamation window." },
  6: { name: "6th House — Health & Daily Life", description: "Daily routines, health practices, and work rhythms were overhauled by Saturn in your 6th house from 2023–2026. You may have changed your entire relationship to your body and work. Now Mercury revisits those degrees — expect old health matters or work projects to need attention. Systems that were established under Saturn may need refinement. Listen to your body's messages carefully." },
  7: { name: "7th House — Partnerships", description: "Marriage, committed partnerships, and significant one-on-one relationships bore Saturn's full weight from 2023–2026. Contracts were tested. Commitments were either deepened or dissolved. Now Mercury retraces those same degrees. An ex or old partner may resurface. Partnership agreements may need review. This is not the time to sign new contracts — it is the time to honestly assess what partnerships survived and what they now mean to you." },
  8: { name: "8th House — Transformation & Shared Resources", description: "Debt, inheritance, intimacy, and shared finances received a Saturn restructure from 2023–2026. Profound transformation happened in the most private corners of your life. Now Mercury retraces those degrees — financial entanglements, insurance, wills, or deeply intimate matters may resurface for a final review. What still needs to be released? What needs to be reclaimed?" },
  9: { name: "9th House — Beliefs & Higher Mind", description: "Your entire belief system, philosophy of life, higher education, and relationship to foreign cultures was Saturn-tested from 2023–2026. What you once believed was dismantled and rebuilt. Now Mercury moves backward through those same degrees — old teachers, studies, or spiritual philosophies may return. A belief you let go might need one final, honest examination. Trust the revision process." },
  10: { name: "10th House — Career & Reputation", description: "Your career, public reputation, and life direction were placed under Saturn's most rigorous testing from 2023–2026 — inside your own sign house, no less. The restructuring was intense. Now Mercury retraces those degrees. Old professional contacts may resurface. A project you thought was finished needs a second look. Your reputation is being refined. What story does your career tell now?" },
  11: { name: "11th House — Community & Future Visions", description: "Your friendships, communities, social networks, and long-term hopes were systematically restructured by Saturn from 2023–2026. Some communities fell away. New, more authentic ones formed. Now Mercury retraces those degrees — an old friend or collaborator may reconnect. Group projects may need revision. Your vision for the future is being updated. What do you truly hope for now?" },
  12: { name: "12th House — The Unseen & Spiritual Life", description: "Saturn in your 12th house from 2023–2026 was one of the most profound, often invisible restructurings possible — your relationship to the unconscious, solitude, spirituality, and what hides in the shadows. Things dissolved. Fears surfaced and were faced. Now Mercury retrogrades through this same liminal space. Hidden matters may resurface. Dreams become vivid and meaningful. This is an extraordinary time for journaling, therapy, retreat, and listening to what your deeper self has been trying to tell you." },
};

type RxData = {
  id: string; name: string; sign: string; element: string; dates: string;
  degrees: string; preshadow: string; shadow: string; station_rx: string;
  station_direct: string; cazimi: string | null; current: boolean;
  sign_quality: string; detriment_fall: boolean; detriment_fall_note?: string;
  jupiter_aspect: string; saturn_note: string | null; color: string; gradient: string;
};

const RETROGRADES_BY_YEAR: Record<number, { element: string; summary: string; retrogrades: RxData[] }> = {
  2025: {
    element: "Fire",
    summary: "2025's retrogrades were in FIRE signs — Aries, Leo, and Sagittarius. A year of action, initiative, and bold re-evaluation of identity, creativity, and belief systems.",
    retrogrades: [
      {
        id: "rx1", name: "Mercury Retrograde #1", sign: "Aries", element: "Fire",
        dates: "March 14 – April 7, 2025", degrees: "9°35' Aries → 26°49' Pisces",
        preshadow: "February 25, 2025", shadow: "April 19, 2025",
        station_rx: "March 14, 2025 at 9°35' Aries", station_direct: "April 7, 2025 at 26°49' Pisces",
        cazimi: "March 26, 2025", current: false,
        sign_quality: "Cardinal Fire — Mars-ruled", detriment_fall: false,
        jupiter_aspect: "Jupiter in Gemini creates a sextile — new ideas ignite rapidly.",
        saturn_note: null, color: "#c05050", gradient: "from-red-900/40 to-orange-900/40",
      },
      {
        id: "rx2", name: "Mercury Retrograde #2", sign: "Leo", element: "Fire",
        dates: "July 17 – August 11, 2025", degrees: "15°34' Leo → 4°37' Leo",
        preshadow: "June 30, 2025", shadow: "August 24, 2025",
        station_rx: "July 17, 2025 at 15°34' Leo", station_direct: "August 11, 2025 at 4°37' Leo",
        cazimi: null, current: false,
        sign_quality: "Fixed Fire — Sun-ruled", detriment_fall: true,
        detriment_fall_note: "Mercury is in fall in Leo — opposite Aquarius, its sign of exaltation. The cool, systematic thinker becomes theatrical and heart-driven. Communication prioritizes dramatic impact over precision.",
        jupiter_aspect: "Jupiter in Cancer forms a semi-sextile — subtle emotional adjustments meet creative fire.",
        saturn_note: null, color: "#d4a030", gradient: "from-amber-900/40 to-yellow-900/40",
      },
      {
        id: "rx3", name: "Mercury Retrograde #3", sign: "Sagittarius", element: "Fire",
        dates: "November 9 – November 29, 2025", degrees: "6°51' Sagittarius → 20°37' Scorpio",
        preshadow: "October 22, 2025", shadow: "December 15, 2025",
        station_rx: "November 9, 2025 at 6°51' Sagittarius", station_direct: "November 29, 2025 at 20°37' Scorpio",
        cazimi: null, current: false,
        sign_quality: "Mutable Fire — Jupiter-ruled", detriment_fall: true,
        detriment_fall_note: "Mercury is in detriment in Sagittarius — opposite its home sign Gemini. Big-picture thinking overwhelms details.",
        jupiter_aspect: "Jupiter in Cancer creates a quincunx — philosophical restlessness meets emotional security needs.",
        saturn_note: null, color: "#9b59b6", gradient: "from-purple-900/40 to-violet-900/40",
      },
    ],
  },
  2026: {
    element: "Water",
    summary: "2026 shifts to ALL WATER — Pisces, Cancer, and Scorpio. After 2025's fire-sign action and initiative, we descend into the emotional depths. This is a year-long healing undercurrent.",
    retrogrades: [
      {
        id: "rx1", name: "Mercury Retrograde #1", sign: "Pisces", element: "Water",
        dates: "February 25–26 – March 20, 2026", degrees: "22°33' Pisces → 8°29' Pisces",
        preshadow: "February 11, 2026 at 8°29' Pisces", shadow: "April 9, 2026 at 22°33' Pisces",
        station_rx: "February 25-26, 2026 at 22°33' Pisces", station_direct: "March 20, 2026 at 8°29' Pisces",
        cazimi: "March 7, 2026 at 16°52' Pisces", current: true,
        sign_quality: "Mutable Water — Jupiter-ruled (traditionally), Neptune-ruled (modern)",
        detriment_fall: true,
        detriment_fall_note: "Mercury is in detriment in Pisces — opposite Virgo, Mercury's home sign. The sharp, analytical mind is submerged in boundless, feeling-first Pisces. Logic becomes poetry. Intuition replaces analysis. Note: Mercury's fall is actually in Leo, not Pisces. But detriment alone is significant here.",
        jupiter_aspect: "Jupiter is in Cancer during the Pisces retrograde, forming a trine (water to water) — amplifying emotional wisdom, spiritual insight, and intuitive downloads.",
        saturn_note: "Saturn moved through Pisces from March 2023 to February 2026 — restructuring whatever house Pisces rules in your chart. This retrograde is the FIRST Mercury cycle since Saturn's departure. The reconstruction is over. Mercury is now reviewing what was rebuilt.",
        color: "#7c6fa0", gradient: "from-violet-900/40 to-indigo-900/40",
      },
      {
        id: "rx2", name: "Mercury Retrograde #2", sign: "Cancer", element: "Water",
        dates: "June 29 – July 23, 2026", degrees: "26°27' Cancer → 16°18' Cancer",
        preshadow: "June 13, 2026 at 16°18' Cancer", shadow: "August 7, 2026",
        station_rx: "June 29, 2026 at 26°27' Cancer", station_direct: "July 23, 2026 at 16°19' Cancer",
        cazimi: null, current: false,
        sign_quality: "Cardinal Water — Moon-ruled", detriment_fall: false,
        jupiter_aspect: "Jupiter remains in Cancer — Mercury retrogrades directly across Jupiter's transit zone. Emotional communication, memory, and nurturing themes are extraordinarily amplified.",
        saturn_note: null, color: "#4a8fa8", gradient: "from-cyan-900/40 to-blue-900/40",
      },
      {
        id: "rx3", name: "Mercury Retrograde #3", sign: "Scorpio", element: "Water",
        dates: "October 24 – November 13, 2026", degrees: "20°59' Scorpio → 5°02' Scorpio",
        preshadow: "October 4, 2026 at 5°02' Scorpio", shadow: "November 30, 2026",
        station_rx: "October 24, 2026 at 20°59' Scorpio", station_direct: "November 13, 2026 at 5°02' Scorpio",
        cazimi: null, current: false,
        sign_quality: "Fixed Water — Mars-ruled (traditional), Pluto-ruled (modern)",
        detriment_fall: false,
        jupiter_aspect: "With Jupiter having moved into Leo by fall 2026, this deep Scorpio retrograde creates tension with Jupiterian expansion — secrets, investigations, and profound reckonings come to the surface.",
        saturn_note: null, color: "#8b3a52", gradient: "from-rose-900/40 to-red-900/40",
      },
    ],
  },
  2027: {
    element: "Air",
    summary: "2027 shifts to AIR signs — the mind re-engages after a year of water. Communication, intellect, and social connections take center stage. Data coming soon.",
    retrogrades: [],
  },
};

const AVAILABLE_YEARS = Object.keys(RETROGRADES_BY_YEAR).map(Number).sort();

const MERCURY_BASICS = [
  { icon: "☿", title: "Who Is Mercury?", content: "Mercury is the winged messenger god — the divine communicator who travels between worlds, carrying messages from the gods to mortals and back again. In astrology, Mercury governs the mind: how we think, speak, learn, and process information. He rules perception, logic, language, short-distance travel, contracts, technology, commerce, and the nervous system. Mercury is quick, curious, clever, and endlessly adaptable — the trickster who loves a puzzle. In your chart, Mercury shows HOW you think, not just what you think about." },
  { icon: "🌞", title: "Mercury & The Sun: Always Close", content: "Mercury is never more than 28° away from the Sun — you will never find Mercury in a sign more than one sign away from your natal Sun. This is because Mercury orbits so close to the Sun that from Earth, he stays near it always. This proximity means Mercury's retrograde always happens in a zone tightly linked to your solar identity. When Mercury retrogrades, it often brings deeply personal, ego-adjacent themes." },
  { icon: "🔄", title: "How Often & How Far", content: "Mercury retrogrades 3 times per year (occasionally 4), each retrograde lasting approximately 3 weeks. During each retrograde, Mercury appears to travel backward between 12° and 15° of the zodiac. The full cycle — from pre-shadow to post-shadow — spans roughly 8 weeks. In 2026, all three Mercury retrogrades occur in water signs (Pisces, Cancer, Scorpio) — a rare and emotionally significant year-long theme." },
  { icon: "🌊", title: "2026: All Water Signs — The Shift from Fire", content: "2025 retrogrades were in FIRE signs (Aries, Leo, Sagittarius) — 2026 is the shift to ALL WATER. This is a significant elemental transition year. Water is the realm of feeling, memory, intuition, healing, and the unconscious. 2026 asks us — all year — to go beneath the surface. Every Mercury retrograde this year will pull up emotional memories, unresolved feelings, and intuitive wisdom. Logic will repeatedly defer to feeling. After a year of fire-sign action and initiative, we now descend into the emotional depths." },
  { icon: "🌞", title: "The Cazimi — Heart of the Sun", content: "The cazimi is when Mercury is at the exact heart of the Sun during retrograde. This is a special moment of clarity and illumination within the retrograde — a brief window when Mercury is purified and insights land clearly. Traditionally, a planet cazimi the Sun is considered supremely dignified, as if sitting on the throne of the king. The 2026 Pisces cazimi is March 7 at 16°52' Pisces — a moment of lucid intuition within the fog." },
  { icon: "📐", title: "Retrograde Degrees: The Span", content: "Each retrograde has a specific range of degrees it covers — the point where Mercury stations retrograde (turns backward) and the point where it stations direct (turns forward again). The degrees between those two points are walked THREE times: once in pre-shadow going forward, once during retrograde going backward, and once in post-shadow going forward again. Planets or points in your natal chart at those degrees will be activated intensely — three passes of Mercury across that degree." },
  { icon: "🕯️", title: "Pre-Shadow, Retrograde & Post-Shadow", content: "The pre-shadow begins when Mercury first crosses the degree where it will later station direct — this is when themes begin to emerge. The retrograde begins at the station retrograde degree and ends at the station direct. The post-shadow (sometimes called 'storm') ends when Mercury returns to the degree where it first stationed retrograde. Astrologers say: you won't fully understand what the retrograde was about until Mercury clears the shadow." },
];

const DO_DONT = {
  do: [
    "Review, revise, and reconsider — the 'RE' words are your allies",
    "Reconnect with people from the past",
    "Return to unfinished projects with fresh eyes",
    "Research deeply before making decisions",
    "Rest, restore, and slow down",
    "Reflect on what has shifted since the last retrograde",
    "Journal dreams and intuitive impressions — especially in water retrogrades",
    "Double-check all written communications before sending",
    "Read fine print and re-read contracts",
    "Breathe — Mercury retrograde is a cosmic invitation to pause",
  ],
  dont: [
    "Sign brand-new contracts if you can avoid it",
    "Launch new major projects or businesses",
    "Make permanent decisions based on incomplete information",
    "Assume everyone received your message — follow up",
    "Ignore technical glitches — back up your data",
    "Rush through negotiations",
    "Buy major electronics or vehicles without thorough research",
    "Send that impulsive message — wait until post-shadow",
  ],
};

const WATER_PERSONALIZED = {
  none: "With all 2026 Mercury retrogrades in water signs, the entire year carries an emotional, intuitive undertone. After 2025's fire-sign retrogrades (Aries, Leo, Sagittarius), the shift to water is profound. Themes of memory, feeling, healing, and spiritual sensitivity will run through every Mercury cycle. Logic will yield to intuition again and again. Trust what you feel.",
  aries: "As an Aries Rising, the water retrogrades activate your 12th (Pisces), 4th (Cancer), and 8th (Scorpio) houses — the three most hidden, private, and transformative areas of your chart. 2026 asks you to heal what hides in your unconscious, your family roots, and your shared depths. Significant inner work awaits.",
  taurus: "As a Taurus Rising, the water retrogrades light up your 11th (Pisces), 3rd (Cancer), and 7th (Scorpio) houses — community, communication, and partnerships. Old friendships surface, important conversations revisit, and partnership contracts need review. Your social world is being emotionally recalibrated.",
  gemini: "As a Gemini Rising, the water retrogrades activate your 10th (Pisces), 2nd (Cancer), and 6th (Scorpio) houses — career, income, and health. Your professional direction, financial security, and daily health rhythms are all under emotional review in 2026. What do you truly want to build?",
  cancer: "As a Cancer Rising, the water retrogrades move through your 9th (Pisces), 1st (Cancer), and 5th (Scorpio) houses — beliefs, self, and creativity. A profound year for spiritual recalibration, personal reinvention, and creative renewal. You are reviewing who you are, what you believe, and what you love to create.",
  leo: "As a Leo Rising, the water retrogrades activate your 8th (Pisces), 12th (Cancer), and 4th (Scorpio) houses — transformation, the hidden, and home. Deep psychological themes, ancestral patterns, and profound private shifts define 2026 for you. What needs to finally be released?",
  virgo: "As a Virgo Rising, the water retrogrades move through your 7th (Pisces), 11th (Cancer), and 3rd (Scorpio) houses — partnerships, community, and communication. Relationship dynamics, friendship circles, and the way you communicate emotionally are all under review. Are the people in your life truly aligned with who you've become?",
  libra: "As a Libra Rising, the water retrogrades activate your 6th (Pisces), 10th (Cancer), and 2nd (Scorpio) houses — health, career, and money. Daily routines, professional legacy, and financial values are all emotionally reviewed in 2026. What structures are worth keeping? What habits no longer serve you?",
  scorpio: "As a Scorpio Rising, the water retrogrades light up your 5th (Pisces), 9th (Cancer), and 1st (Scorpio) houses — creativity, philosophy, and self. A year of profound creative reclaiming, belief system review, and personal reinvention. The third retrograde in Scorpio activates your entire identity — a reset of the deepest kind.",
  sagittarius: "As a Sagittarius Rising, the water retrogrades move through your 4th (Pisces), 8th (Cancer), and 12th (Scorpio) houses — home, transformation, and the unseen. Family, inherited patterns, and deep subconscious material are the year's themes. What from your roots is ready to be healed and released?",
  capricorn: "As a Capricorn Rising, the water retrogrades activate your 3rd (Pisces), 7th (Cancer), and 11th (Scorpio) houses — communication, partnerships, and community. Important conversations revisit all year, partnership dynamics shift emotionally, and your community connections undergo profound review.",
  aquarius: "As an Aquarius Rising, the water retrogrades light up your 2nd (Pisces), 6th (Cancer), and 10th (Scorpio) houses — money, health, and career. Financial values, health rhythms, and professional transformation are under review all year. 2026 restructures the material and physical dimensions of your life.",
  pisces: "As a Pisces Rising, the water retrogrades activate your 1st (Pisces), 5th (Cancer), and 9th (Scorpio) houses — self, creativity, and philosophy. An extraordinary year of personal reinvention, creative renaissance, and philosophical expansion. The first retrograde begins in your very sign — this year starts with you.",
};

// ─── ELEMENT BADGES ──────────────────────────────────────────────────────────

const ELEMENT_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  Fire: { bg: "bg-orange-950/50", border: "border-orange-500/40", text: "text-orange-200", badge: "🔥 Fire" },
  Water: { bg: "bg-sky-950/50", border: "border-sky-500/40", text: "text-sky-200", badge: "🌊 Water" },
  Air: { bg: "bg-teal-950/50", border: "border-teal-500/40", text: "text-teal-200", badge: "💨 Air" },
  Earth: { bg: "bg-emerald-950/50", border: "border-emerald-500/40", text: "text-emerald-200", badge: "🌍 Earth" },
};

// ─── SUBCOMPONENTS ──────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl font-semibold tracking-wide text-white">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-violet-300 ml-11">{subtitle}</p>}
    </div>
  );
}

function AccordionCard({ icon, title, content, defaultOpen = false }: { icon: string; title: string; content: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className={`rounded-xl border transition-all duration-300 cursor-pointer ${open ? "border-violet-400/60 bg-violet-900/50" : "border-violet-700/40 bg-violet-900/25 hover:border-violet-500/50"}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-white">{title}</span>
        </div>
        <span className={`text-violet-300 transition-transform duration-300 text-lg ${open ? "rotate-180" : ""}`}>▾</span>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <div className="h-px bg-violet-600/30 mb-4" />
          <p className="text-violet-100 text-sm leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}

function YearNavigator({ year, onChange }: { year: number; onChange: (y: number) => void }) {
  const minYear = AVAILABLE_YEARS[0];
  const maxYear = AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      <button
        onClick={() => onChange(year - 1)}
        disabled={year <= minYear}
        className="p-2 rounded-full border border-violet-500/40 bg-violet-900/40 text-violet-200 hover:bg-violet-800/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Previous year"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-2xl font-bold text-white tracking-wider min-w-[80px] text-center">{year}</span>
      <button
        onClick={() => onChange(year + 1)}
        disabled={year >= maxYear}
        className="p-2 rounded-full border border-violet-500/40 bg-violet-900/40 text-violet-200 hover:bg-violet-800/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Next year"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function RxCard({ rx, onClick, isSelected }: { rx: RxData; onClick: (id: string) => void; isSelected: boolean }) {
  return (
    <div
      onClick={() => onClick(rx.id)}
      className={`rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${isSelected ? "border-violet-300/70 bg-gradient-to-br " + rx.gradient + " shadow-lg shadow-violet-900/40" : "border-violet-600/40 bg-violet-900/25 hover:border-violet-400/60"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rx.current ? "bg-violet-500/40 text-white border border-violet-300/50" : "bg-slate-600/50 text-slate-200 border border-slate-500/40"}`}>
            {rx.current ? "● CURRENT" : "UPCOMING"}
          </span>
          <h3 className="text-lg font-semibold text-white mt-2">{rx.name}</h3>
          <p className="text-violet-200 text-sm">{rx.sign} — {rx.element}</p>
        </div>
        <span className="text-3xl opacity-60 text-violet-300">☿</span>
      </div>
      <div className="text-sm text-violet-100 space-y-1">
        <p>📅 {rx.dates}</p>
        <p>📐 {rx.degrees}</p>
      </div>
      {isSelected && <p className="text-xs text-violet-200 mt-2 italic">Click to expand details below ↓</p>}
    </div>
  );
}

function RxDetail({ rx, risingSign, chartName }: { rx: RxData; risingSign: string; chartName: string }) {
  const retroSign = rx.sign.toLowerCase();
  const house = risingSign !== "none" ? getHouseOfSign(risingSign, retroSign) : null;
  const houseMeaning = house ? HOUSE_MEANINGS[house as keyof typeof HOUSE_MEANINGS] : null;

  return (
    <div className="rounded-2xl border border-violet-400/50 bg-gradient-to-br from-violet-900/60 to-indigo-900/60 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{rx.name}</h2>
          <p className="text-violet-200">{rx.sign} · {rx.element} · {rx.sign_quality}</p>
        </div>
        <span className="text-5xl opacity-40 text-violet-300">☿</span>
      </div>

      {/* Key Dates Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Pre-Shadow Begins", value: rx.preshadow, icon: "🌑" },
          { label: "Station Retrograde", value: rx.station_rx, icon: "↩️" },
          ...(rx.cazimi ? [{ label: "Cazimi (☿☌☉)", value: rx.cazimi, icon: "🌞" }] : []),
          { label: "Station Direct", value: rx.station_direct, icon: "↪️" },
          { label: "Shadow Clears", value: rx.shadow, icon: "🌕" },
        ].map((d) => (
          <div key={d.label} className="rounded-xl bg-indigo-800/40 border border-indigo-500/30 p-3">
            <p className="text-xs text-indigo-200 mb-1">{d.icon} {d.label}</p>
            <p className="text-sm font-medium text-white">{d.value}</p>
          </div>
        ))}
      </div>

      {/* Degree Range */}
      <div className="rounded-xl bg-indigo-800/35 border border-indigo-500/35 p-4">
        <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-1">Degree Range — Triple Activation Zone</p>
        <p className="text-white font-bold text-lg">{rx.degrees}</p>
        <p className="text-sm text-indigo-100 mt-2 leading-relaxed">Any natal planet or angle between these degrees will be visited THREE times by Mercury: once in pre-shadow (direct), once during retrograde (backward), and once in post-shadow (direct). These planets will be at the heart of this retrograde's story for you.</p>
      </div>

      {/* Detriment/Fall */}
      {rx.detriment_fall && (
        <div className="rounded-xl bg-amber-900/30 border border-amber-500/40 p-4">
          <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider mb-2">
            {rx.sign === "Pisces" ? "⚠️ Mercury in Detriment" : rx.sign === "Leo" ? "⚠️ Mercury in Fall" : "⚠️ Mercury in Detriment"}
          </p>
          <p className="text-amber-50 text-sm leading-relaxed">{rx.detriment_fall_note}</p>
          {rx.sign === "Pisces" && (
            <p className="text-amber-100 text-sm leading-relaxed mt-2">
              In <strong className="text-amber-200">detriment</strong>, Mercury is in Pisces — the opposite of Virgo, Mercury's home sign. The sharp, analytical, fact-sorting mind of Mercury is submerged in boundless, imagistic, feeling-first Pisces. Logic becomes poetry. Precision becomes intuition. Facts blur into impressions. This is not simply weakness — it is a different kind of intelligence: channeled, received, felt rather than reasoned.
            </p>
          )}
          {rx.sign === "Leo" && (
            <p className="text-amber-100 text-sm leading-relaxed mt-2">
              In <strong className="text-amber-200">fall</strong>, Mercury is in Leo — opposite Aquarius, Mercury's sign of exaltation. Mercury's cool, detached, systems-level thinking is overwhelmed by Leo's need for personal expression and dramatic flair. Communication becomes performative rather than precise. But this also channels Mercury through the heart — messages carry warmth, creativity, and conviction.
            </p>
          )}
        </div>
      )}

      {/* Jupiter Aspect */}
      <div className="rounded-xl bg-teal-900/30 border border-teal-500/40 p-4">
        <p className="text-xs text-teal-300 font-semibold uppercase tracking-wider mb-2">♃ Jupiter Connection</p>
        <p className="text-teal-50 text-sm leading-relaxed">{rx.jupiter_aspect}</p>
      </div>

      {/* Saturn Context */}
      {rx.saturn_note && (
        <div className="rounded-xl bg-slate-700/40 border border-slate-500/40 p-4">
          <p className="text-xs text-slate-200 font-semibold uppercase tracking-wider mb-2">♄ Saturn Has Just Left — The Reconstruction Is Over</p>
          <p className="text-slate-100 text-sm leading-relaxed">{rx.saturn_note}</p>
        </div>
      )}

      {/* Station Events */}
      <div className="space-y-3">
        <p className="text-xs text-violet-200 font-semibold uppercase tracking-wider">What Happens at the Station Degrees</p>
        <div className="rounded-xl bg-violet-800/30 border border-violet-500/30 p-4 space-y-3">
          <div>
            <p className="text-violet-200 text-xs font-semibold uppercase mb-1">↩️ Station Retrograde — {rx.station_rx}</p>
            <p className="text-violet-50 text-sm leading-relaxed">Mercury appears to stop in the sky before reversing direction. This is the most intensely felt moment of the cycle. The themes of this retrograde crystallize suddenly. Expect: miscommunications to peak, technical glitches to spike, delayed news to arrive, and old situations to suddenly need your attention.</p>
          </div>
          <div className="h-px bg-violet-600/30" />
          <div>
            <p className="text-violet-200 text-xs font-semibold uppercase mb-1">↪️ Station Direct — {rx.station_direct}</p>
            <p className="text-violet-50 text-sm leading-relaxed">Mercury halts again before moving forward. Things may feel temporarily MORE confused just before it stations direct — a final stirring of the waters. Once Mercury begins moving forward again, clarity arrives gradually. Don't rush into major decisions the day Mercury turns direct — give it a few days to build momentum.</p>
          </div>
        </div>
      </div>

      {/* General Retrograde Theme */}
      <div className="rounded-xl bg-indigo-800/30 border border-indigo-500/35 p-4">
        <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-2">🌊 General Themes — This Retrograde</p>
        <p className="text-indigo-50 text-sm leading-relaxed">
          {rx.sign === "Pisces" && "Mercury retrograde in Pisces is one of the most inward, dreamlike, spiritually rich retrogrades possible. The mind turns inward and dissolves its usual defenses. Dreams become vivid and symbolic. Intuition arrives in flashes rather than logical sequences. Old emotional memories surface — not to torment, but to complete."}
          {rx.sign === "Cancer" && "Mercury retrograde in Cancer brings emotional memories, family themes, and home-related reconsiderations. Old family conversations resurface. Childhood patterns re-emerge in current relationships. Home and living situation logistics may need review. Your emotional intelligence is heightened — feelings arrive as information, not obstacles."}
          {rx.sign === "Scorpio" && "Mercury retrograde in Scorpio is one of the most investigative, intense, and psychologically penetrating cycles. Hidden information surfaces. Power dynamics in relationships and finances come into sharp focus. Secrets are revealed — your own as much as others'. The unconscious speaks. This retrograde rewards honest self-reckoning."}
          {rx.sign === "Aries" && "Mercury retrograde in Aries revisits action, identity, and initiative. Impulsive decisions from the recent past return for reassessment. The warrior's mind turns inward — are you fighting the right battles?"}
          {rx.sign === "Leo" && "Mercury retrograde in Leo reviews self-expression, creativity, and recognition. Past creative projects or romantic connections resurface. The question: are you expressing your authentic self, or performing?"}
          {rx.sign === "Sagittarius" && "Mercury retrograde in Sagittarius (its detriment) challenges big-picture thinking. Travel plans, educational pursuits, and philosophical beliefs are revisited. What you thought you knew is up for honest reassessment."}
        </p>
      </div>

      {/* Personalized House Section — works for ALL signs now */}
      {risingSign !== "none" && houseMeaning && (
        <div className="rounded-xl bg-gradient-to-br from-fuchsia-900/40 to-violet-900/40 border border-fuchsia-400/40 p-5">
          <p className="text-xs text-fuchsia-200 font-semibold uppercase tracking-wider mb-2">✨ Personalized for {chartName} — {houseMeaning.name}</p>
          <p className="text-fuchsia-50 text-sm leading-relaxed">{houseMeaning.description}</p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function MercuryRetrogradeGuide({ allCharts }: MercuryRetrogradeGuideProps) {
  const [selectedChartId, setSelectedChartId] = useState("none");
  const [selectedRxId, setSelectedRxId] = useState("rx1");
  const [activeSection, setActiveSection] = useState("learn");
  const [selectedYear, setSelectedYear] = useState(2026);

  const selectedChart = allCharts.find(c => c.id === selectedChartId) || null;
  const risingSign = selectedChart ? getAscendantSign(selectedChart) : "none";
  const chartName = selectedChart?.name || "";

  const yearData = RETROGRADES_BY_YEAR[selectedYear];
  const yearRetrogrades = yearData?.retrogrades ?? [];
  const selectedRx = yearRetrogrades.find((r) => r.id === selectedRxId) || yearRetrogrades[0];
  const elStyle = ELEMENT_STYLES[yearData?.element ?? "Water"];

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    setSelectedRxId("rx1");
  };

  const sections = [
    { id: "learn", label: "Learn Mercury", icon: "☿" },
    { id: "retrogrades", label: `${selectedYear} Retrogrades`, icon: "🔄" },
    { id: "current", label: "Current Cycle", icon: "🌊" },
    { id: "guidance", label: "Your Guidance", icon: "✨" },
  ];

  return (
    <div className="rounded-xl bg-gradient-to-b from-slate-950 via-indigo-950/50 to-slate-950 text-slate-100 font-sans pb-10 -mx-4 -mt-4 md:-mx-6 md:-mt-6">
      {/* Starfield header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(1px 1px at 50% 60%, white, transparent), radial-gradient(1px 1px at 10% 80%, white, transparent), radial-gradient(1px 1px at 90% 70%, white, transparent), radial-gradient(2px 2px at 40% 45%, #c4b5fd, transparent), radial-gradient(1px 1px at 70% 25%, #a5f3fc, transparent)",
          }}
        />
        <div className="relative px-4 pt-10 pb-6 text-center">
          <div className="text-5xl mb-3 animate-pulse" style={{ animationDuration: "4s" }}>☿</div>
          <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-200 to-indigo-300">
            Mercury Retrograde
          </h1>
          <p className="text-violet-200 text-sm mt-2 max-w-sm mx-auto">
            Understanding the Messenger's backward dance — and what it means for you
          </p>

          {/* Chart selector — now uses imported chart names */}
          <div className="mt-5 flex justify-center">
            <div className="relative">
              <select
                value={selectedChartId}
                onChange={(e) => setSelectedChartId(e.target.value)}
                className="appearance-none bg-violet-900/50 border border-violet-500/50 text-white rounded-xl px-4 py-2.5 pr-10 text-sm cursor-pointer focus:outline-none focus:border-violet-300/70 transition-colors"
              >
                <option value="none" className="bg-slate-900">— Select a Chart —</option>
                {allCharts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-300 pointer-events-none">▾</span>
            </div>
          </div>
          {selectedChart && (
            <p className="text-xs text-violet-200 mt-2">
              ✨ Content personalized for {chartName} ({risingSign !== "none" ? `${risingSign.charAt(0).toUpperCase() + risingSign.slice(1)} Rising` : "rising sign not set"})
            </p>
          )}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-violet-800/40 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-2xl mx-auto">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeSection === s.id ? "bg-violet-600 text-white shadow-lg shadow-violet-900/40" : "text-violet-200 hover:text-white hover:bg-violet-800/40"}`}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">

        {/* ── SECTION: LEARN MERCURY ── */}
        {activeSection === "learn" && (
          <div className="space-y-4">
            <SectionHeader icon="☿" title="Understanding Mercury" subtitle="The messenger, the mind, the trickster — click each card to explore" />
            {MERCURY_BASICS.map((item) => (
              <AccordionCard key={item.title} icon={item.icon} title={item.title} content={item.content} />
            ))}

            {/* Mercury Keywords */}
            <div className="rounded-2xl border border-violet-600/40 bg-violet-900/30 p-5">
              <p className="text-xs text-violet-200 font-semibold uppercase tracking-wider mb-3">☿ Words That Are Mercury</p>
              <div className="flex flex-wrap gap-2">
                {["Communication", "Logic", "Language", "Wit", "Duality", "Curiosity", "Analysis", "Writing", "Commerce", "Technology", "Nervous System", "Travel", "Siblings", "Contracts", "Trickster", "Messenger", "Perception", "Adaptability", "Data", "Speed", "Youth", "Learning", "Skill", "Connection"].map((w) => (
                  <span key={w} className="text-xs px-3 py-1 rounded-full bg-violet-800/50 border border-violet-500/40 text-violet-100">{w}</span>
                ))}
              </div>
            </div>

            {/* Signs Mercury Rules / Is in Detriment / Fall / Exalt */}
            <div className="rounded-2xl border border-violet-600/40 bg-violet-900/30 p-5">
              <p className="text-xs text-violet-200 font-semibold uppercase tracking-wider mb-3">☿ Mercury's Sign Dignity</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-emerald-900/30 border border-emerald-500/30 p-3">
                  <p className="text-emerald-300 text-xs font-bold uppercase mb-1">Domicile (Home)</p>
                  <p className="text-emerald-50">Gemini · Virgo</p>
                  <p className="text-emerald-200 text-xs mt-1">Sharp, precise, at full power</p>
                </div>
                <div className="rounded-xl bg-blue-900/30 border border-blue-500/30 p-3">
                  <p className="text-blue-300 text-xs font-bold uppercase mb-1">Exaltation</p>
                  <p className="text-blue-50">Virgo (some: Aquarius)</p>
                  <p className="text-blue-200 text-xs mt-1">Elevated, honored, refined</p>
                </div>
                <div className="rounded-xl bg-rose-900/30 border border-rose-500/30 p-3">
                  <p className="text-rose-300 text-xs font-bold uppercase mb-1">Detriment</p>
                  <p className="text-rose-50">Sagittarius · Pisces</p>
                  <p className="text-rose-200 text-xs mt-1">Diffuse, visionary over precise</p>
                </div>
                <div className="rounded-xl bg-amber-900/30 border border-amber-500/30 p-3">
                  <p className="text-amber-300 text-xs font-bold uppercase mb-1">Fall</p>
                  <p className="text-amber-50">Pisces</p>
                  <p className="text-amber-200 text-xs mt-1">Logic yields to feeling & dreams</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION: RETROGRADES BY YEAR ── */}
        {activeSection === "retrogrades" && (
          <div className="space-y-4">
            <SectionHeader icon="🔄" title={`${selectedYear} Mercury Retrogrades`} subtitle="Tap a card to explore details" />

            {/* Year Navigator */}
            <YearNavigator year={selectedYear} onChange={handleYearChange} />

            {/* Element + Year summary banner */}
            <div className={`rounded-2xl ${elStyle.bg} ${elStyle.border} border p-4`}>
              <p className={`${elStyle.text} text-sm leading-relaxed`}>
                <span className="font-bold text-white">{elStyle.badge} — {selectedYear} Element Theme.</span>{" "}
                {yearData?.summary}
              </p>
            </div>

            {/* Retrograde cards */}
            {yearRetrogrades.length > 0 ? (
              <div className="space-y-3">
                {yearRetrogrades.map((rx) => (
                  <RxCard key={rx.id} rx={rx} onClick={setSelectedRxId} isSelected={selectedRxId === rx.id} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-violet-600/30 bg-violet-900/20 p-8 text-center">
                <p className="text-violet-200 text-lg mb-2">☿ Data coming soon</p>
                <p className="text-violet-300 text-sm">Detailed retrograde data for {selectedYear} will be added as it becomes available.</p>
              </div>
            )}

            {/* Selected retrograde detail inline */}
            {selectedRx && (
              <div className="mt-2">
                <RxDetail rx={selectedRx} risingSign={risingSign} chartName={chartName} />
              </div>
            )}
          </div>
        )}

        {/* ── SECTION: CURRENT CYCLE ── */}
        {activeSection === "current" && (
          <div className="space-y-4">
            <SectionHeader icon="🌊" title="Current Cycle — Mercury in Pisces" subtitle="February 25–26 – March 20, 2026 · Retrograde from 22°33' to 8°29' Pisces" />

            <RxDetail rx={RETROGRADES_BY_YEAR[2026].retrogrades[0]} risingSign={risingSign} chartName={chartName} />

            {/* Phase by phase */}
            <div className="rounded-2xl border border-violet-600/40 bg-violet-900/25 p-5 space-y-4">
              <p className="text-xs text-violet-200 font-semibold uppercase tracking-wider">📅 Phase by Phase — What to Watch</p>
              {[
                { phase: "Pre-Shadow · Feb 11–25", icon: "🌑", text: "Mercury first crosses 8°29' Pisces. Themes begin to whisper. A situation, conversation, or feeling starts to emerge that will become central to this retrograde. Pay attention to what arises around February 11 — it is a preview of what will need your full attention." },
                { phase: "Station Retrograde · Feb 25-26", icon: "↩️", text: "Mercury halts at 22°33' Pisces and begins its backward journey. The days around February 25-26 are likely to feel intense, confused, or surprisingly clarifying. Old matters arrive suddenly. Technology may glitch. Conversations get complicated. This is the moment to slow down completely." },
                { phase: "Cazimi · March 7", icon: "🌞", text: "Mercury conjuncts the Sun at 16°52' Pisces — the heart of the retrograde. The cazimi is a moment of clarity and illumination within the fog: Mercury is purified by the Sun's light. Insights land clearly, downloads arrive, and a brief window of lucidity opens. Pay attention to what comes through on this day — it is the retrograde's deepest message." },
                { phase: "Station Direct · March 20", icon: "↪️", text: "Mercury halts again at 8°29' Pisces and prepares to move forward. The moment of turning direct may feel like a fog beginning to lift. Don't rush into major decisions immediately — give Mercury 2–3 days to build momentum." },
                { phase: "Post-Shadow · Mar 20 – Apr 9", icon: "🌕", text: "Mercury retraces the shadow zone forward, from 8°29' back to 22°33' Pisces. You won't fully understand what this retrograde was about until April 9. Use this phase to apply what you've reviewed. Decisions are clearer now. Conversations that were tangled begin to resolve. Integration happens." },
              ].map((item) => (
                <div key={item.phase} className="rounded-xl bg-indigo-800/30 border border-indigo-500/30 p-4">
                  <p className="text-xs text-indigo-200 font-semibold uppercase mb-2">{item.icon} {item.phase}</p>
                  <p className="text-indigo-50 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION: GUIDANCE ── */}
        {activeSection === "guidance" && (
          <div className="space-y-6">
            <SectionHeader icon="✨" title="Mercury Retrograde Guidance" subtitle="What to do, what to avoid, and your personalized guidance" />

            {/* Do's */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/20 p-5">
              <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider mb-4">✅ What To Do During Mercury Retrograde</p>
              <div className="space-y-2">
                {DO_DONT.do.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-emerald-50">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✦</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Don'ts */}
            <div className="rounded-2xl border border-rose-500/40 bg-rose-900/20 p-5">
              <p className="text-xs text-rose-300 font-semibold uppercase tracking-wider mb-4">⚠️ What To Avoid</p>
              <div className="space-y-2">
                {DO_DONT.dont.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-rose-50">
                    <span className="text-rose-400 mt-0.5 flex-shrink-0">✦</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Water Sign Retrograde Specific */}
            <div className="rounded-2xl border border-sky-500/40 bg-sky-900/20 p-5">
              <p className="text-xs text-sky-300 font-semibold uppercase tracking-wider mb-3">🌊 For Water Sign Retrogrades Specifically</p>
              <div className="space-y-2 text-sm text-sky-50">
                {["Journal your dreams — they carry messages during water retrogrades", "Spend time near water: baths, ocean, rivers, rain", "Allow feelings to arrive without immediately analyzing them", "Practice emotional check-ins instead of intellectual processing", "Trust your intuition over logic when the two disagree", "Use this time to tend emotional relationships with care", "Create: paint, write poetry, sing — right-brain expression is favored"].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="text-sky-400 mt-0.5 flex-shrink-0">✦</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Personalized section */}
            <div className="rounded-2xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-900/30 to-violet-900/30 p-5">
              <p className="text-xs text-fuchsia-200 font-semibold uppercase tracking-wider mb-3">
                {risingSign === "none" ? "🔮 Select a Chart for Personalized Guidance" : `✨ Your 2026 Water Retrograde Year — ${chartName}`}
              </p>
              {risingSign === "none" ? (
                <p className="text-violet-200 text-sm">Select a chart using the dropdown at the top of this page to receive guidance personalized to your rising sign.</p>
              ) : (
                <p className="text-fuchsia-50 text-sm leading-relaxed">{WATER_PERSONALIZED[risingSign as keyof typeof WATER_PERSONALIZED]}</p>
              )}
            </div>

            {/* Closing affirmation */}
            <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-900/40 to-indigo-900/40 p-6 text-center">
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider mb-3">☿ A Mercury Retrograde Mantra</p>
              <p className="text-violet-50 text-base leading-relaxed italic">
                "I slow down and trust the process of review.<br/>
                What returns to me returns for completion.<br/>
                What is unfinished becomes my greatest teacher.<br/>
                I am not going backward — I am going deeper."
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
