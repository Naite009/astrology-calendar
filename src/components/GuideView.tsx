import { useState } from "react";
import { RetroGradesHub } from "@/components/RetroGradesHub";
import { ArrowRight, HelpCircle } from "lucide-react";
import { 
  GuideSection, 
  GUIDE_NAV_ITEMS, 
  getViewForSection, 
  sectionHasTryIt, 
  getTryItLabel,
  ViewMode 
} from "@/lib/guideNavigation";

interface GuideViewProps {
  onNavigateToView?: (view: ViewMode) => void;
}

const SymbolCard = ({ icon, name, desc }: { icon: string; name: string; desc: string }) => (
  <div className="rounded-sm border border-border bg-secondary p-4">
    <span className="mb-2 block text-3xl">{icon}</span>
    <div className="mb-1 font-medium text-foreground">{name}</div>
    <div className="text-xs leading-relaxed text-muted-foreground">{desc}</div>
  </div>
);

const ColorCard = ({ color, planet, symbol, desc }: { color: string; planet: string; symbol: string; desc: string }) => (
  <div className="rounded-sm border border-border bg-secondary p-4">
    <div className="mb-3 h-10 w-full rounded-sm" style={{ backgroundColor: color }} />
    <div className="mb-1 font-medium text-foreground">{symbol} {planet}</div>
    <div className="text-xs leading-relaxed text-muted-foreground">{desc}</div>
  </div>
);

const TryItButton = ({ section, onNavigate }: { section: GuideSection; onNavigate?: (view: ViewMode) => void }) => {
  if (!sectionHasTryIt(section) || !onNavigate) return null;
  
  return (
    <button
      onClick={() => onNavigate(getViewForSection(section))}
      className="mt-6 inline-flex items-center gap-2 rounded-sm border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
    >
      {getTryItLabel(section)}
      <ArrowRight size={16} />
    </button>
  );
};

const SECTIONS: Record<GuideSection, { title: string; content: React.ReactNode }> = {
  overview: {
    title: "How to Use This Calendar",
    content: (
      <>
        <p>
          This astrological calendar shows you the daily cosmic weather at a glance. 
          Here's what you'll find:
        </p>
        
        <h3>Daily Information</h3>
        <p>Each day displays:</p>
        <ul>
          <li><strong>Moon Phase:</strong> The current lunar phase (🌑 New to 🌕 Full)</li>
          <li><strong>Moon Sign:</strong> Which zodiac sign the Moon is in</li>
          <li><strong>Mercury Retrograde:</strong> ☿℞ indicator when Mercury is retrograde</li>
          <li><strong>Energy Level:</strong> Color-coded background based on cosmic conditions</li>
        </ul>
        
        <h3>Views Available</h3>
        <ul>
          <li><strong>Month:</strong> Traditional calendar grid with daily cosmic data</li>
          <li><strong>Week:</strong> Detailed daily view with space for intentions and notes</li>
          <li><strong>Year:</strong> Quick reference for all 12 months</li>
          <li><strong>Phases:</strong> Visual moon phase chart for the entire year</li>
          <li><strong>Tables:</strong> Annual reference for full/new moons, retrogrades</li>
          <li><strong>Guide:</strong> This reference section</li>
          <li><strong>Charts:</strong> Save and manage multiple natal charts</li>
          <li><strong>Wheel:</strong> Visual natal chart wheel display</li>
          <li><strong>Timing:</strong> Best days, biorhythms, and electional astrology</li>
          <li><strong>Colors:</strong> Personalized astro-inspired color palettes</li>
          <li><strong>Patterns:</strong> Live planetary positions and cycle tracking</li>
          <li><strong>Script:</strong> Sacred Script reading generator (Debra Silverman method)</li>
          <li><strong>Decoder:</strong> Deep chart analysis with dignities and dispositors</li>
          <li><strong>Speeds:</strong> Planetary speed reference guide</li>
          <li><strong>TNOs:</strong> Dwarf planets and Trans-Neptunian Objects guide</li>
        </ul>
        
        <h3>Color Coding</h3>
        <p>Each day is color-coded based on which planets are most active through aspects. See the Colors section for full details.</p>
        
        <h3>Getting Started</h3>
        <p>
          Click the User icon to enter your birth information. This allows the calendar 
          to show you personalized transits and aspects to your natal chart.
        </p>
      </>
    ),
  },
  colors: {
    title: "Planetary Color Guide",
    content: (
      <>
        <p>
          Each day in your calendar is color-coded based on which planets are most active through aspects. 
          When multiple planets are active, the day shows a gradient split between two colors.
        </p>
        
        <h3>Planetary Colors & Meanings</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ColorCard color="#C74E4E" planet="Mars" symbol="♂" desc="Action, energy, drive, courage, assertiveness. Days to take bold action." />
          <ColorCard color="#E8D5CC" planet="Venus" symbol="♀" desc="Love, beauty, values, relationships, harmony. Days for connection and aesthetics." />
          <ColorCard color="#F4D03F" planet="Sun" symbol="☉" desc="Core self, vitality, life force, confidence. Days to shine and express yourself." />
          <ColorCard color="#7FA3C7" planet="Moon" symbol="☽" desc="Emotions, intuition, rhythms, nurturing. Days to honor your feelings." />
          <ColorCard color="#E8A558" planet="Mercury" symbol="☿" desc="Communication, thinking, learning, connections. Days for mental work and messaging." />
          <ColorCard color="#9B7EBD" planet="Jupiter" symbol="♃" desc="Growth, expansion, wisdom, luck, optimism. Days to expand your horizons." />
          <ColorCard color="#8B7355" planet="Saturn" symbol="♄" desc="Structure, discipline, responsibility, limits. Days for serious work and commitments." />
          <ColorCard color="#D4C5E8" planet="Balsamic Moon" symbol="🌘" desc="Sacred rest phase (315°-337.5°). Only 2-3 days per month. Deep spiritual retreat before new beginnings." />
        </div>
        
        <h3>Split Colors (Gradient Days)</h3>
        <p>
          When a day has aspects from two different planets, it displays as a split gradient:
        </p>
        <ul>
          <li><strong>Top half:</strong> First active planet (morning aspects)</li>
          <li><strong>Bottom half:</strong> Second active planet (afternoon/evening aspects)</li>
        </ul>
        <p>
          Example: Mars square Moon in morning (red top) + Venus trine Sun in afternoon (rose bottom) = Red-to-Rose gradient day
        </p>
        
        <h3>Personalized Colors</h3>
        <p>
          The Colors tab generates personalized color palettes based on your natal chart transits. 
          Each day's palette reflects the current planetary influences on YOUR chart specifically.
        </p>
      </>
    ),
  },
  symbols: {
    title: "Astrology Symbols",
    content: (
      <>
        <p>Here are all the symbols used throughout the calendar:</p>
        
        <h3>Planets</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SymbolCard icon="☽" name="Moon" desc="Emotions, intuition, daily rhythms" />
          <SymbolCard icon="☉" name="Sun" desc="Core self, vitality, life force" />
          <SymbolCard icon="☿" name="Mercury" desc="Communication, thinking, learning" />
          <SymbolCard icon="♀" name="Venus" desc="Love, beauty, values, relationships" />
          <SymbolCard icon="♂" name="Mars" desc="Action, energy, drive, assertion" />
          <SymbolCard icon="♃" name="Jupiter" desc="Growth, expansion, wisdom, luck" />
          <SymbolCard icon="♄" name="Saturn" desc="Structure, discipline, responsibility" />
          <SymbolCard icon="♅" name="Uranus" desc="Change, innovation, revolution" />
          <SymbolCard icon="♆" name="Neptune" desc="Dreams, intuition, spirituality" />
          <SymbolCard icon="♇" name="Pluto" desc="Transformation, power, rebirth" />
        </div>
        
        <h3>Zodiac Signs</h3>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SymbolCard icon="♈" name="Aries" desc="Fire - Action, courage, leadership" />
          <SymbolCard icon="♉" name="Taurus" desc="Earth - Stability, sensuality, security" />
          <SymbolCard icon="♊" name="Gemini" desc="Air - Communication, curiosity, versatility" />
          <SymbolCard icon="♋" name="Cancer" desc="Water - Nurturing, emotions, home" />
          <SymbolCard icon="♌" name="Leo" desc="Fire - Creativity, confidence, joy" />
          <SymbolCard icon="♍" name="Virgo" desc="Earth - Analysis, service, health" />
          <SymbolCard icon="♎" name="Libra" desc="Air - Balance, harmony, relationships" />
          <SymbolCard icon="♏" name="Scorpio" desc="Water - Intensity, transformation, depth" />
          <SymbolCard icon="♐" name="Sagittarius" desc="Fire - Adventure, philosophy, expansion" />
          <SymbolCard icon="♑" name="Capricorn" desc="Earth - Ambition, discipline, achievement" />
          <SymbolCard icon="♒" name="Aquarius" desc="Air - Innovation, community, freedom" />
          <SymbolCard icon="♓" name="Pisces" desc="Water - Compassion, dreams, spirituality" />
        </div>
      </>
    ),
  },
  moonphases: {
    title: "Moon Phases Explained",
    content: (
      <>
        <p>
          The Moon goes through eight distinct phases in its ~29.5 day cycle. 
          Each phase carries different energy and is best suited for specific activities.
        </p>
        
        <h3>🌑 New Moon</h3>
        <p>
          The beginning of the lunar cycle. The Moon is between Earth and Sun, 
          appearing dark in the sky.
        </p>
        <ul>
          <li><strong>Energy:</strong> Fresh starts, new beginnings, planting seeds</li>
          <li><strong>Best for:</strong> Setting intentions, starting projects, making wishes</li>
          <li><strong>Avoid:</strong> Forcing outcomes, being too aggressive</li>
        </ul>
        
        <h3>🌒 Waxing Crescent</h3>
        <p>The first visible sliver of moon appears. Energy is building.</p>
        <ul>
          <li><strong>Energy:</strong> Hope, faith, trust in the process</li>
          <li><strong>Best for:</strong> Taking first steps, gathering resources, planning</li>
        </ul>
        
        <h3>🌓 First Quarter</h3>
        <p>Half the moon is visible. This is a time of action and decision.</p>
        <ul>
          <li><strong>Energy:</strong> Challenges, decisions, taking action</li>
          <li><strong>Best for:</strong> Overcoming obstacles, making commitments, pushing forward</li>
        </ul>
        
        <h3>🌔 Waxing Gibbous</h3>
        <p>More than half illuminated. Refining and perfecting.</p>
        <ul>
          <li><strong>Energy:</strong> Refinement, adjustment, patience</li>
          <li><strong>Best for:</strong> Fine-tuning, improving, getting feedback</li>
        </ul>
        
        <h3>🌕 Full Moon</h3>
        <p>The Moon is fully illuminated. Peak energy and manifestation.</p>
        <ul>
          <li><strong>Energy:</strong> Culmination, celebration, revelation, heightened emotions</li>
          <li><strong>Best for:</strong> Manifesting, celebrating, releasing what no longer serves</li>
          <li><strong>Note:</strong> Emotions and intuition are heightened</li>
        </ul>
        
        <h3>🌖 Waning Gibbous</h3>
        <p>Light is decreasing. Time for gratitude and sharing.</p>
        <ul>
          <li><strong>Energy:</strong> Gratitude, sharing, teaching</li>
          <li><strong>Best for:</strong> Giving back, sharing knowledge, helping others</li>
        </ul>
        
        <h3>🌗 Last Quarter</h3>
        <p>Half the moon visible again, but decreasing. Re-evaluation time.</p>
        <ul>
          <li><strong>Energy:</strong> Re-evaluation, release, letting go</li>
          <li><strong>Best for:</strong> Breaking habits, releasing attachments, forgiveness</li>
        </ul>
        
        <h3>🌘 Waning Crescent</h3>
        <p>The Moon's light thins toward darkness. Quiet completion and gentle release.</p>
        <ul>
          <li><strong>Energy:</strong> Reflection, closure, soft release, simplification</li>
          <li><strong>Best for:</strong> Wrapping up tasks, clearing space, restoring your energy</li>
          <li><strong>Avoid:</strong> Overcommitting, forcing momentum</li>
        </ul>

        <h3>🌘 Balsamic Moon</h3>
        <p>The final sliver before New Moon. Deep rest, surrender, and spiritual reset.</p>
        <ul>
          <li><strong>Energy:</strong> Rest, reflection, spiritual connection, surrender</li>
          <li><strong>Best for:</strong> Meditation, rest, spiritual practices, closure</li>
          <li><strong>Avoid:</strong> Starting new projects, making major decisions</li>
          <li><strong>This is marked on your calendar as "Balsamic Moon"</strong></li>
        </ul>
      </>
    ),
  },
  retrogrades: {
    title: "Understanding Retrogrades",
    content: (
      <>
        <p>
          When a planet appears to move backward in the sky (from our perspective on Earth), 
          it's called "retrograde." This is an optical illusion caused by the relative speeds 
          of Earth and the other planet.
        </p>
        
        <h3>What Does Retrograde Mean?</h3>
        <p>
          During retrograde periods, the planet's energy is turned inward. It's a time to 
          review, revise, and reconsider matters related to that planet.
        </p>
        
        <h3>☿℞ Mercury Retrograde</h3>
        <p>The most famous retrograde! Mercury rules communication, technology, and travel.</p>
        <ul>
          <li><strong>Frequency:</strong> 3-4 times per year, lasting about 3 weeks each</li>
          <li><strong>Effects:</strong> Communication mishaps, technology glitches, travel delays, misunderstandings</li>
          <li><strong>Best Activities:</strong> Review, revise, reconnect with old friends, edit, research, reflect</li>
          <li><strong>Avoid:</strong> Signing contracts, buying electronics, starting new projects, making major decisions</li>
          <li><strong>Shadow Period:</strong> The effects can be felt 1-2 weeks before and after the actual retrograde</li>
        </ul>
        
        <h3>Other Retrogrades</h3>
        <p>
          All planets except the Sun and Moon go retrograde. Your calendar shows Mercury 
          retrograde as it has the most noticeable day-to-day effects.
        </p>
        <ul>
          <li><strong>Venus Retrograde:</strong> Every 18 months - Review relationships and values</li>
          <li><strong>Mars Retrograde:</strong> Every 2 years - Reevaluate how you take action</li>
          <li><strong>Outer Planet Retrogrades:</strong> Jupiter, Saturn, Uranus, Neptune, Pluto all retrograde annually for several months</li>
        </ul>
        
        <h3>How to Work With Retrogrades</h3>
        <p>
          Retrogrades aren't "bad" - they're opportunities for reflection and course correction. 
          Use these periods to:
        </p>
        <ul>
          <li>Review and revise your plans</li>
          <li>Reconnect with old friends or revisit past ideas</li>
          <li>Research and gather information</li>
          <li>Rest and recharge</li>
          <li>Finish projects you've already started</li>
          <li>Back up your data and double-check details</li>
        </ul>
      </>
    ),
  },
  aspects: {
    title: "Planetary Aspects",
    content: (
      <>
        <p>
          Aspects are the angles planets make to each other in the sky. They show how 
          planetary energies interact and influence each other.
        </p>
        
        <h3>Major Aspects</h3>
        
        <div className="mb-4 rounded-sm border border-border bg-secondary p-4">
          <span className="mb-2 block text-3xl">☌</span>
          <div className="mb-1 font-medium">Conjunction (0°)</div>
          <div className="text-sm text-muted-foreground">
            Planets in the same sign, energies blend and amplify each other. 
            Can be harmonious or challenging depending on the planets involved.
          </div>
        </div>
        
        <div className="mb-4 rounded-sm border border-border bg-secondary p-4">
          <span className="mb-2 block text-3xl">⚹</span>
          <div className="mb-1 font-medium">Sextile (60°)</div>
          <div className="text-sm text-muted-foreground">
            Harmonious and supportive. Opportunities arise easily. 
            Good for taking action on what comes naturally.
          </div>
        </div>
        
        <div className="mb-4 rounded-sm border border-border bg-secondary p-4">
          <span className="mb-2 block text-3xl">□</span>
          <div className="mb-1 font-medium">Square (90°)</div>
          <div className="text-sm text-muted-foreground">
            Challenging aspect creating tension and friction. 
            Motivates growth through conflict. Requires conscious effort to resolve.
          </div>
        </div>
        
        <div className="mb-4 rounded-sm border border-border bg-secondary p-4">
          <span className="mb-2 block text-3xl">△</span>
          <div className="mb-1 font-medium">Trine (120°)</div>
          <div className="text-sm text-muted-foreground">
            Very harmonious and flowing. Talents and gifts. Things come easily. 
            Can sometimes lead to complacency.
          </div>
        </div>
        
        <div className="mb-4 rounded-sm border border-border bg-secondary p-4">
          <span className="mb-2 block text-3xl">☍</span>
          <div className="mb-1 font-medium">Opposition (180°)</div>
          <div className="text-sm text-muted-foreground">
            Planets facing each other, creating polarity and awareness. 
            Need to find balance between two opposing forces.
          </div>
        </div>
        
        <h3>How to Read Aspects in Your Calendar</h3>
        <p>
          When you enter your birth information, the calendar will show you when transiting 
          planets make aspects to your natal planets. For example:
        </p>
        <ul>
          <li>"Venus △ natal Sun" means Venus is making a trine to your natal Sun - excellent for love and self-expression</li>
          <li>"Moon □ natal Mars" means the Moon is squaring your Mars - you might feel emotional tension around taking action</li>
        </ul>
        
        <h3>Orbs</h3>
        <p>
          An "orb" is how close an aspect needs to be to be felt. Your calendar shows the orb 
          in degrees. Tighter orbs (0-2°) are stronger than wider orbs (5-8°).
        </p>
      </>
    ),
  },
  dignities: {
    title: "Planetary Dignities",
    content: (
      <>
        <p>
          Planetary dignities describe how well a planet functions in each zodiac sign. 
          When a planet is in a sign where it's strong (domicile or exaltation), its positive qualities shine. 
          When weak (detriment or fall), the planet struggles to express itself naturally.
        </p>
        
        <h3>Understanding Dignities</h3>
        <div className="mt-4 mb-6 grid gap-3 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-sm bg-secondary">
            <span className="text-green-600 dark:text-green-400 font-bold">🏠</span>
            <div>
              <strong className="text-green-600 dark:text-green-400">Domicile (Rulership):</strong>
              <span className="text-muted-foreground ml-2">Planet is "at home" - functions naturally and powerfully</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-sm bg-secondary">
            <span className="text-blue-600 dark:text-blue-400 font-bold">⭐</span>
            <div>
              <strong className="text-blue-600 dark:text-blue-400">Exaltation:</strong>
              <span className="text-muted-foreground ml-2">Planet is honored guest - expresses highest potential</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-sm bg-secondary">
            <span className="text-red-600 dark:text-red-400 font-bold">🚫</span>
            <div>
              <strong className="text-red-600 dark:text-red-400">Detriment:</strong>
              <span className="text-muted-foreground ml-2">Planet is in opposite sign of domicile - uncomfortable, struggles</span>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-sm bg-secondary">
            <span className="text-orange-600 dark:text-orange-400 font-bold">⚠️</span>
            <div>
              <strong className="text-orange-600 dark:text-orange-400">Fall:</strong>
              <span className="text-muted-foreground ml-2">Planet is in opposite sign of exaltation - weakest expression</span>
            </div>
          </div>
        </div>

        <h3>Complete Dignities Table</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="p-3 text-left font-semibold">Planet</th>
                <th className="p-3 text-left font-semibold">🏠 Domicile</th>
                <th className="p-3 text-left font-semibold">⭐ Exaltation</th>
                <th className="p-3 text-left font-semibold">🚫 Detriment</th>
                <th className="p-3 text-left font-semibold">⚠️ Fall</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">☉ Sun</td>
                <td className="p-3 text-green-600 dark:text-green-400">♌ Leo</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♈ Aries (19°)</td>
                <td className="p-3 text-red-600 dark:text-red-400">♒ Aquarius</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♎ Libra (19°)</td>
              </tr>
              <tr className="bg-secondary border-b border-border">
                <td className="p-3 font-medium">☽ Moon</td>
                <td className="p-3 text-green-600 dark:text-green-400">♋ Cancer</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♉ Taurus (3°)</td>
                <td className="p-3 text-red-600 dark:text-red-400">♑ Capricorn</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♏ Scorpio (3°)</td>
              </tr>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">☿ Mercury</td>
                <td className="p-3 text-green-600 dark:text-green-400">♊ Gemini, ♍ Virgo</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♒ Aquarius (15°)</td>
                <td className="p-3 text-red-600 dark:text-red-400">♐ Sagittarius, ♓ Pisces</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♌ Leo (15°)</td>
              </tr>
              <tr className="bg-secondary border-b border-border">
                <td className="p-3 font-medium">♀ Venus</td>
                <td className="p-3 text-green-600 dark:text-green-400">♉ Taurus, ♎ Libra</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♓ Pisces (27°)</td>
                <td className="p-3 text-red-600 dark:text-red-400">♏ Scorpio, ♈ Aries</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♍ Virgo (27°)</td>
              </tr>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">♂ Mars</td>
                <td className="p-3 text-green-600 dark:text-green-400">♈ Aries, ♏ Scorpio</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♑ Capricorn (28°)</td>
                <td className="p-3 text-red-600 dark:text-red-400">♎ Libra, ♉ Taurus</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♋ Cancer (28°)</td>
              </tr>
              <tr className="bg-secondary border-b border-border">
                <td className="p-3 font-medium">♃ Jupiter</td>
                <td className="p-3 text-green-600 dark:text-green-400">♐ Sagittarius, ♓ Pisces</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♋ Cancer (15°)</td>
                <td className="p-3 text-red-600 dark:text-red-400">♊ Gemini, ♍ Virgo</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♑ Capricorn (15°)</td>
              </tr>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">♄ Saturn</td>
                <td className="p-3 text-green-600 dark:text-green-400">♑ Capricorn, ♒ Aquarius</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♎ Libra (21°)</td>
                <td className="p-3 text-red-600 dark:text-red-400">♋ Cancer, ♌ Leo</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♈ Aries (21°)</td>
              </tr>
              <tr className="bg-secondary border-b border-border">
                <td className="p-3 font-medium">♅ Uranus</td>
                <td className="p-3 text-green-600 dark:text-green-400">♒ Aquarius</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♏ Scorpio</td>
                <td className="p-3 text-red-600 dark:text-red-400">♌ Leo</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♉ Taurus</td>
              </tr>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">♆ Neptune</td>
                <td className="p-3 text-green-600 dark:text-green-400">♓ Pisces</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♋ Cancer (9°) or ♌ Leo</td>
                <td className="p-3 text-red-600 dark:text-red-400">♍ Virgo</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♑ Capricorn or ♒ Aquarius</td>
              </tr>
              <tr className="bg-secondary">
                <td className="p-3 font-medium">♇ Pluto</td>
                <td className="p-3 text-green-600 dark:text-green-400">♏ Scorpio</td>
                <td className="p-3 text-blue-600 dark:text-blue-400">♈ Aries or ♌ Leo</td>
                <td className="p-3 text-red-600 dark:text-red-400">♉ Taurus</td>
                <td className="p-3 text-orange-600 dark:text-orange-400">♎ Libra</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>How to Use This Information</h3>
        <div className="mt-4 p-4 rounded-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700">
          <ul className="space-y-2">
            <li>
              <strong>Strong planets work better:</strong> When you see "♂ Mars enters ♑ Capricorn" (exaltation), expect Mars energy to be particularly effective and well-directed.
            </li>
            <li>
              <strong>Weak planets need extra care:</strong> When Mars is in Cancer (fall), channel aggressive energy more carefully - it is less reliable.
            </li>
            <li>
              <strong>Personal planets matter most:</strong> Sun, Moon, Mercury, Venus, Mars dignities affect daily life more noticeably than outer planets.
            </li>
            <li>
              <strong>Check your natal chart:</strong> If a planet transits its dignity in your natal chart, that planet themes become especially important for you.
            </li>
          </ul>
        </div>
        
        <h3>See It In Action</h3>
        <p>
          The <strong>Chart Decoder</strong> tab shows your natal chart's dignity distribution, 
          including a full breakdown of which planets are strong or weak by placement.
        </p>
      </>
    ),
  },
  difficultplacements: {
    title: "Working With Difficult Placements",
    content: (
      <>
        <p>
          In this app, “costume adjustments” means: the planet isn’t broken — it’s just wearing a costume that
          makes its instincts come out sideways at first. Your work is to make the planet conscious, trainable,
          and trustworthy.
        </p>

        <h3>Step 1: Name the reflex (no shame)</h3>
        <ul>
          <li>
            <strong>Detriment:</strong> the planet is in the sign opposite its home sign. It still wants its normal
            job, but it’s forced to speak a “foreign language.”
          </li>
          <li>
            <strong>Fall:</strong> the planet is opposite its exaltation — it’s easiest to collapse into the shadow
            expression when stressed.
          </li>
        </ul>

        <h3>Step 2: Give it a clean job description</h3>
        <p>
          Ask: “What is this planet trying to protect or achieve?” Then give it a lawful role.
          Example:
        </p>
        <ul>
          <li>
            <strong>Venus:</strong> Values, bonding, pleasure, aesthetics, receiving.
          </li>
          <li>
            <strong>Uranus:</strong> Truth, freedom, invention, differentiation, disruption of stagnation.
          </li>
        </ul>

        <h3>Step 3: Build a practice (somatic + behavioral)</h3>
        <div className="mt-4 grid gap-3">
          <div className="rounded-sm border border-border bg-secondary p-4">
            <h4 className="font-medium text-foreground">Conscious Venus — examples</h4>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Receiving drill (2 minutes):</strong> accept a compliment without deflecting. Just say “thank you.”
              </li>
              <li>
                <strong>Values list (weekly):</strong> write 5 values you want relationships to obey (e.g., honesty, reciprocity). 
                Then choose one boundary that protects them.
              </li>
              <li>
                <strong>Beauty as regulation:</strong> one intentional aesthetic act per day (music, clothing, scent, color). 
                The goal is nervous system safety, not perfection.
              </li>
            </ul>
          </div>

          <div className="rounded-sm border border-border bg-secondary p-4">
            <h4 className="font-medium text-foreground">Conscious Uranus — examples</h4>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Truth filter:</strong> before you disrupt, ask: “Is this rebellion, or is it integrity?”
              </li>
              <li>
                <strong>Experiment contract:</strong> run a 14‑day experiment (new routine, new tool, new boundary). 
                Keep it small and measurable.
              </li>
              <li>
                <strong>Contain the lightning:</strong> schedule one outlet for intensity (movement, cold water, breathwork) 
                so relationships don’t become the dumping ground.
              </li>
            </ul>
          </div>
        </div>

        <h3>Step 4: Journal prompts (turn insight into behavior)</h3>
        <ul>
          <li>
            “When I’m stressed, this planet tends to ___ (control / disappear / please / provoke). What is it trying to protect?”
          </li>
          <li>
            “If this planet were mature, it would say ‘no’ to ___. It would say ‘yes’ to ___.”
          </li>
          <li>
            “What does ‘safe expression’ look like in my real life this week? Give one concrete example.”
          </li>
        </ul>

        <h3>Step 5: Use the app to target the work</h3>
        <p>
          Go to <strong>Decoder → Director’s Notes</strong>. Look for:
        </p>
        <ul>
          <li><strong>Loudest Characters:</strong> where to consciously amplify (angular houses).</li>
          <li><strong>Costume Adjustments:</strong> where to practice the “clean job + practice” method above.</li>
        </ul>

        <TryItButton section="difficultplacements" onNavigate={undefined} />
        <p className="mt-6 text-sm text-muted-foreground">
          Tip: If you want, tell me which planet + sign the app flags as a “costume adjustment” for your chart and I’ll
          write a tailored practice plan (behavior, boundary, and a 14‑day experiment).
        </p>
      </>
    ),
  },
  fixedstars: {
    title: "Fixed Stars",
    content: (
      <>
        <p>
          Fixed stars are distant suns that move so slowly through the zodiac (about 1° per 72 years) 
          that they appear "fixed" in the sky. When planets conjunct these powerful points, 
          their energy is activated.
        </p>
        
        <h3>The Royal Stars (Guardians of the Sky)</h3>
        <p>Four stars marking the four corners of the heavens in ancient Persian astrology:</p>
        
        <div className="mt-4 grid gap-4">
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Aldebaran (9° Gemini)</span>
              <span className="text-xs text-muted-foreground">Guardian of the East</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              The Bull's Eye. Integrity, honor, eloquence. "Success through integrity." Military honors, courage, passion for truth.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Regulus (29° Leo)</span>
              <span className="text-xs text-muted-foreground">Guardian of the North</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Heart of the Lion. Royal power, leadership, fame, success. "Success if revenge is avoided." Military honors, nobility, positions of power.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Antares (9° Sagittarius)</span>
              <span className="text-xs text-muted-foreground">Guardian of the West</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Rival of Mars. Warrior spirit, obsession, intensity. Success through persistence. Heart of the Scorpion. Passionate and powerful.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Fomalhaut (3° Pisces)</span>
              <span className="text-xs text-muted-foreground">Guardian of the South</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              The Mouth of the Fish. Idealism, mysticism, fame. The "fallen angel" star—potential for both rise and fall. Charisma, magic, spiritual power.
            </div>
          </div>
        </div>
        
        <h3>Other Major Fixed Stars</h3>
        <div className="mt-4 grid gap-4">
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Sirius (14° Cancer)</span>
              <span className="text-xs text-amber-600 dark:text-amber-400">Brightest Star</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              The Dog Star. Spiritual wisdom, success, fame. Ancient Egyptian sacred star marking the New Year. Divine downloads, kundalini awakening.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Algol (26° Taurus)</span>
              <span className="text-xs text-red-600 dark:text-red-400">Most Infamous</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Medusa's Head. Transformation through facing shadow. Feminine rage transmuted to power. Losing one's head, then reclaiming it.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Spica (23° Libra)</span>
              <span className="text-xs text-green-600 dark:text-green-400">Most Benefic</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              The Wheat Sheaf. Gifts, talents, protection. Venus-Jupiter nature. Artistic success, harvest of efforts. The priestess star.
            </div>
          </div>
        </div>
        
        <h3>How Fixed Stars Work</h3>
        <div className="mt-4 p-4 rounded-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700">
          <ul className="space-y-2">
            <li><strong>Orb:</strong> Fixed stars use tight orbs (1-2°). A planet must be very close to activate the star.</li>
            <li><strong>Conjunction only:</strong> Traditionally, only conjunctions matter for fixed stars.</li>
            <li><strong>Your calendar shows:</strong> When planets transit near major fixed stars, activating their energy.</li>
            <li><strong>Natal chart:</strong> Check if you have natal planets conjunct fixed stars for lifelong themes.</li>
          </ul>
        </div>
      </>
    ),
  },
  divinefeminine: {
    title: "Divine Feminine Bodies",
    content: (
      <>
        <p>
          Beyond the traditional planets, astrologers work with additional celestial bodies that 
          represent different facets of the feminine divine, healing, and destiny.
        </p>
        
        <h3>☊☋ Lunar Nodes (North & South)</h3>
        <div className="mt-4 mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-sm border border-border bg-green-50 dark:bg-green-900/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">☊</span>
              <span className="font-semibold text-foreground">North Node</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Your destiny point. Where you're headed in this lifetime. Growth, evolution, future direction. 
              Feels uncomfortable but rewarding. Life purpose and soul growth.
            </div>
          </div>
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">☋</span>
              <span className="font-semibold text-foreground">South Node</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Past life skills and comfort zone. What you've already mastered. Can become a crutch. 
              Release attachment here to grow toward North Node.
            </div>
          </div>
        </div>
        
        <h3>⚷ Chiron — The Wounded Healer</h3>
        <p>
          A comet between Saturn and Uranus, Chiron represents our deepest wound and our greatest 
          healing gift. Where Chiron falls in your chart shows where you've been wounded—and where 
          you can heal others once you've done your own healing work.
        </p>
        
        <h3>⚸ Lilith — Dark Moon</h3>
        <p>
          The lunar apogee—the point where the Moon is farthest from Earth. Represents the 
          wild, untamed feminine. Your primal instincts, raw sexuality, and what you refuse 
          to be controlled about. Shadow self and repressed desires.
        </p>
        
        <h3>The Asteroid Goddesses</h3>
        <div className="mt-4 grid gap-4">
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">⚳ Ceres — The Great Mother</div>
            <div className="text-sm text-muted-foreground">
              Nurturing, sustenance, what we need to feel nurtured. Mother-child dynamics, 
              food relationship, grief and loss, seasons of life.
            </div>
          </div>
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">⚴ Pallas — The Warrior Strategist</div>
            <div className="text-sm text-muted-foreground">
              Intelligence, pattern recognition, creative wisdom. Political savvy, 
              father-daughter dynamics, legal acumen.
            </div>
          </div>
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">⚵ Juno — The Divine Consort</div>
            <div className="text-sm text-muted-foreground">
              Committed partnership, marriage, what you need in long-term relationships. 
              Loyalty, jealousy, balance of power in partnership.
            </div>
          </div>
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">⚶ Vesta — The Sacred Flame</div>
            <div className="text-sm text-muted-foreground">
              Devotion, dedication, what you're willing to sacrifice for. Sexual energy 
              channeled into work, focus, spiritual service.
            </div>
          </div>
        </div>
      </>
    ),
  },
  venuscycles: {
    title: "Understanding Venus Cycles",
    content: (
      <>
        <p>
          Venus has a unique 584-day cycle that creates profound patterns in our lives around 
          love, values, beauty, and self-worth. Twice in this cycle, Venus conjuncts the Sun—
          these are called <strong>Venus Star Points</strong>.
        </p>
        
        <h3>What is a Venus Star Point?</h3>
        <p>
          A Venus Star Point occurs when Venus aligns exactly with the Sun. There are two types:
        </p>
        
        <div className="mt-4 mb-6 grid gap-4 text-sm">
          <div className="p-4 rounded-sm bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700">
            <div className="font-semibold text-foreground mb-2">🌑 Inferior Conjunction (Venus Retrograde)</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Venus passes BETWEEN Earth and Sun</li>
              <li>• Venus is CLOSEST to Earth</li>
              <li>• Like a "Venus New Moon" — NEW CYCLE BEGINS</li>
              <li>• Time to reassess values, relationships, self-worth</li>
              <li>• <strong>This is the main "Star Point"</strong></li>
            </ul>
          </div>
          
          <div className="p-4 rounded-sm bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
            <div className="font-semibold text-foreground mb-2">☀️ Superior Conjunction</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Venus passes on FAR SIDE of Sun</li>
              <li>• Like a "Venus Full Moon" — maturation point</li>
              <li>• Integration and consolidation phase</li>
              <li>• Time to solidify what you've learned about love and value</li>
            </ul>
          </div>
        </div>
        
        <h3>The Sacred Geometry: 8-Year Pentagram</h3>
        <p>
          Every <strong>8 years</strong>, Venus creates a perfect <strong>5-pointed star (pentagram)</strong> 
          in the zodiac! Each inferior conjunction returns to approximately the same sign/degree 
          every 8 years. This is why Venus Star Points that happened 8 years ago carry 
          similar themes to current ones.
        </p>
        
        <h3>Morning Star vs Evening Star</h3>
        <div className="mt-4 mb-6 grid gap-4 text-sm md:grid-cols-2">
          <div className="p-4 rounded-sm bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700">
            <div className="font-semibold text-foreground mb-2">🌅 Morning Star (Phosphorus)</div>
            <p className="text-muted-foreground">
              Venus rises before the Sun. Energy is <strong>new, eager, spontaneous</strong>. 
              Internal work—clarifying what you truly value.
            </p>
          </div>
          
          <div className="p-4 rounded-sm bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700">
            <div className="font-semibold text-foreground mb-2">🌆 Evening Star (Hesperus)</div>
            <p className="text-muted-foreground">
              Venus follows the Sun. Energy is <strong>experienced, wiser, worldly</strong>. 
              External expression—dating, socializing, beautifying.
            </p>
          </div>
        </div>
      </>
    ),
  },
  vocmoon: {
    title: "Void of Course Moon",
    content: (
      <>
        <p>
          The <strong>Void of Course (VOC) Moon</strong> is the period between when the Moon makes 
          its last major aspect in one sign and when it enters the next sign. During this time, 
          the Moon is "between worlds" — finishing one cycle but not yet starting the next.
        </p>
        
        <h3>What Happens During VOC?</h3>
        <p>
          Activities started during VOC often "come to nothing" — not necessarily bad outcomes, 
          but things don't develop as expected. It's a period of flux and transition.
        </p>
        
        <h3>❌ What to Avoid During VOC</h3>
        <div className="mt-4 mb-6 grid gap-2 text-sm">
          <div className="flex items-start gap-2 p-2 rounded-sm bg-red-50 dark:bg-red-900/20">
            <span className="text-red-600">✗</span>
            <span>Starting new projects or initiatives</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-sm bg-red-50 dark:bg-red-900/20">
            <span className="text-red-600">✗</span>
            <span>Important business decisions</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-sm bg-red-50 dark:bg-red-900/20">
            <span className="text-red-600">✗</span>
            <span>Signing contracts or making commitments</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-sm bg-red-50 dark:bg-red-900/20">
            <span className="text-red-600">✗</span>
            <span>First dates or job interviews</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-sm bg-red-50 dark:bg-red-900/20">
            <span className="text-red-600">✗</span>
            <span>Launching products or campaigns</span>
          </div>
        </div>
        
        <h3>✓ What Works Well During VOC</h3>
        <div className="mt-4 mb-6 grid gap-2 text-sm">
          <div className="flex items-start gap-2 p-2 rounded-sm bg-green-50 dark:bg-green-900/20">
            <span className="text-green-600">✓</span>
            <span>Finish existing work and tie up loose ends</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-sm bg-green-50 dark:bg-green-900/20">
            <span className="text-green-600">✓</span>
            <span>Rest, meditate, and recharge</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-sm bg-green-50 dark:bg-green-900/20">
            <span className="text-green-600">✓</span>
            <span>Routine tasks and maintenance</span>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-sm bg-green-50 dark:bg-green-900/20">
            <span className="text-green-600">✓</span>
            <span>Brainstorming (without implementation)</span>
          </div>
        </div>
        
        <h3>How Your Calendar Shows VOC</h3>
        <p>
          On your calendar, VOC periods are marked with <strong>⚠️ V/C</strong> along with the 
          duration. The Timing tab shows current VOC status in real-time.
        </p>
      </>
    ),
  },
  planetaryhours: {
    title: "Understanding Planetary Hours",
    content: (
      <>
        <p>
          <strong>Planetary Hours</strong> is an ancient system that divides each day and night into 
          12 unequal "hours," each ruled by one of the seven classical planets. This gives you 
          precise timing WITHIN a day—not just which day is good, but which HOUR is optimal.
        </p>
        
        <h3>How It Works</h3>
        <div className="mt-4 p-4 rounded-sm bg-secondary border border-border font-mono text-xs">
          <div className="space-y-2 text-muted-foreground">
            <div>☀️ <strong>Day Hours:</strong> Sunrise to Sunset (12 hours)</div>
            <div>🌙 <strong>Night Hours:</strong> Sunset to Sunrise (12 hours)</div>
            <div className="pt-2 border-t border-border">
              Note: These are NOT clock hours! Each planetary "hour" 
              expands or contracts with the actual length of day/night.
            </div>
          </div>
        </div>
        
        <h3>The Chaldean Order</h3>
        <p>
          Planets cycle in a specific order called the <strong>Chaldean Order</strong>:
        </p>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-2 rounded-sm bg-secondary text-sm">♄ Saturn</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-3 py-2 rounded-sm bg-secondary text-sm">♃ Jupiter</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-3 py-2 rounded-sm bg-secondary text-sm">♂ Mars</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-3 py-2 rounded-sm bg-secondary text-sm">☉ Sun</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-3 py-2 rounded-sm bg-secondary text-sm">♀ Venus</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-3 py-2 rounded-sm bg-secondary text-sm">☿ Mercury</span>
          <span className="text-muted-foreground">→</span>
          <span className="px-3 py-2 rounded-sm bg-secondary text-sm">☽ Moon</span>
        </div>
        
        <h3>Day Rulers</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3">Day</th>
                <th className="text-left py-2 px-3">Ruler</th>
                <th className="text-left py-2 px-3">Best For</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Sunday</td>
                <td className="py-2 px-3">☉ Sun</td>
                <td className="py-2 px-3">Leadership, vitality, creativity</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Monday</td>
                <td className="py-2 px-3">☽ Moon</td>
                <td className="py-2 px-3">Home, family, emotions</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Tuesday</td>
                <td className="py-2 px-3">♂ Mars</td>
                <td className="py-2 px-3">Action, competition, courage</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Wednesday</td>
                <td className="py-2 px-3">☿ Mercury</td>
                <td className="py-2 px-3">Communication, learning, travel</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Thursday</td>
                <td className="py-2 px-3">♃ Jupiter</td>
                <td className="py-2 px-3">Expansion, luck, education</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Friday</td>
                <td className="py-2 px-3">♀ Venus</td>
                <td className="py-2 px-3">Love, beauty, pleasure</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Saturday</td>
                <td className="py-2 px-3">♄ Saturn</td>
                <td className="py-2 px-3">Structure, discipline, planning</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3>Viewing Planetary Hours</h3>
        <p>
          The Timing tab shows the current planetary hour in real-time. Click on any day 
          to see the complete planetary hour schedule for that day.
        </p>
      </>
    ),
  },
  solararc: {
    title: "Solar Arc Directions",
    content: (
      <>
        <p>
          <strong>Solar Arc Directions</strong> are a powerful predictive technique that shows your 
          PERSONAL timing — not collective transits, but YOUR chart evolving through time.
        </p>
        
        <h3>How It Works</h3>
        <p>
          Move every planet and point in your chart forward by approximately <strong>1° for each 
          year of your life</strong>. At age 30, every planet has moved 30° from its birth position.
        </p>
        
        <div className="mt-4 p-4 rounded-sm bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700">
          <div className="font-semibold text-foreground mb-2">Example:</div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>• Birth: Venus at 5° Aries</div>
            <div>• Age 25: Solar Arc Venus at 30° Aries (0° Taurus)</div>
            <div>• If your natal Sun is at 0° Taurus...</div>
            <div className="font-medium text-purple-600 dark:text-purple-400 mt-2">
              → Solar Arc Venus conjuncts natal Sun = Major relationship/creative event!
            </div>
          </div>
        </div>
        
        <h3>Key Interpretations</h3>
        <div className="mt-4 space-y-4">
          <div className="p-4 rounded-sm bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700">
            <div className="font-semibold text-foreground mb-2">SA Venus to Natal Sun/Ascendant</div>
            <p className="text-sm text-muted-foreground">
              Major relationship activation! Marriage, significant partnership, creative breakthrough.
            </p>
          </div>
          
          <div className="p-4 rounded-sm bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
            <div className="font-semibold text-foreground mb-2">SA Jupiter to Natal Sun/MC</div>
            <p className="text-sm text-muted-foreground">
              Career expansion, luck, recognition, promotion. Opportunities abound.
            </p>
          </div>
          
          <div className="p-4 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
            <div className="font-semibold text-foreground mb-2">SA Saturn to Natal Sun/Moon</div>
            <p className="text-sm text-muted-foreground">
              Major responsibility arrives. Maturation point. Career advancement through hard work.
            </p>
          </div>
        </div>
        
        <h3>See Your Solar Arcs</h3>
        <p>
          The <strong>Chart Decoder</strong> tab shows your current Solar Arc aspects with exact orbs.
        </p>
      </>
    ),
  },
  progressions: {
    title: "Secondary Progressions",
    content: (
      <>
        <p>
          <strong>Secondary Progressions</strong> use the "day for a year" principle: each day 
          after your birth represents one year of your life. This shows your internal emotional 
          development and psychological maturation.
        </p>
        
        <h3>The Most Important: Progressed Moon</h3>
        <p>
          The Progressed Moon is the SINGLE MOST IMPORTANT progression. It moves about 1° per 
          month (12-13° per year), changing signs every <strong>~2.5 years</strong>. Each sign 
          change marks a major emotional shift.
        </p>
        
        <div className="mt-4 p-4 rounded-sm bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
          <div className="font-semibold text-foreground mb-2">Progressed Moon Through Signs:</div>
          <div className="text-sm text-muted-foreground space-y-2">
            <div><strong>♈ Aries:</strong> New beginnings, independence, self-focus</div>
            <div><strong>♉ Taurus:</strong> Building security, finances, comfort</div>
            <div><strong>♊ Gemini:</strong> Learning, communication, curiosity</div>
            <div><strong>♋ Cancer:</strong> Home, family, nurturing</div>
            <div><strong>♌ Leo:</strong> Creativity, romance, self-expression</div>
            <div><strong>♍ Virgo:</strong> Health, service, improvement</div>
            <div><strong>♎ Libra:</strong> Relationships, partnership, balance</div>
            <div><strong>♏ Scorpio:</strong> Transformation, intensity, depth</div>
            <div><strong>♐ Sagittarius:</strong> Travel, philosophy, adventure</div>
            <div><strong>♑ Capricorn:</strong> Career, ambition, discipline</div>
            <div><strong>♒ Aquarius:</strong> Community, innovation, friendship</div>
            <div><strong>♓ Pisces:</strong> Spirituality, dreams, compassion</div>
          </div>
        </div>
        
        <h3>Viewing Your Progressions</h3>
        <p>
          The <strong>Chart Decoder</strong> tab shows your current Progressed Moon position and 
          a timeline of when it will change signs next.
        </p>
      </>
    ),
  },
  biorhythms: {
    title: "Biorhythms Guide",
    content: (
      <>
        <p>
          <strong>Biorhythms</strong> are a system that tracks natural cycles in your physical, 
          emotional, and mental energy based on your birth date. Unlike astrology (which is based 
          on planetary positions), biorhythms are mathematical cycles that begin at birth.
        </p>
        
        <h3>Primary Cycles</h3>
        <div className="mt-4 grid gap-4">
          <div className="rounded-sm border border-border bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💪</span>
              <span className="font-semibold text-foreground">Physical Cycle — 23 Days</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Governs your physical energy, strength, endurance, and coordination. 
              High phases are ideal for exercise, competition, and physical challenges.
              Low phases require more rest and recovery.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💙</span>
              <span className="font-semibold text-foreground">Emotional Cycle — 28 Days</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Governs your emotional stability, sensitivity, and mood. 
              High phases favor relationships, creativity, and emotional expression.
              Low phases may bring moodiness or emotional sensitivity.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-amber-50 dark:bg-amber-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🧠</span>
              <span className="font-semibold text-foreground">Intellectual Cycle — 33 Days</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Governs mental clarity, concentration, learning, and decision-making.
              High phases are excellent for studying, problem-solving, and important decisions.
              Low phases may bring mental fatigue or difficulty focusing.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-purple-50 dark:bg-purple-900/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✨</span>
              <span className="font-semibold text-foreground">Intuitive Cycle — 38 Days</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Governs intuition, psychic awareness, and subconscious perception.
              High phases enhance gut feelings, dreams, and spiritual connection.
              A longer cycle that subtly influences the other three.
            </div>
          </div>
        </div>
        
        <h3>⚠️ Critical Days</h3>
        <p>
          <strong>Critical Days</strong> occur when a cycle crosses from positive to negative (or vice versa). 
          These are transition points where the associated energy is unstable:
        </p>
        <ul>
          <li><strong>Physical Critical:</strong> Higher accident risk, avoid extreme sports</li>
          <li><strong>Emotional Critical:</strong> Mood swings, avoid major relationship decisions</li>
          <li><strong>Intellectual Critical:</strong> Mental blocks, double-check important work</li>
        </ul>
        
        <h3>Secondary Cycles (Advanced)</h3>
        <p>
          Composite cycles are created by combining primary cycles:
        </p>
        <ul>
          <li><strong>Mastery:</strong> Physical + Intellectual = 14 days (coordination of body and mind)</li>
          <li><strong>Passion:</strong> Physical + Emotional = 12.75 days (romantic and creative energy)</li>
          <li><strong>Wisdom:</strong> Emotional + Intellectual = 15.17 days (emotional intelligence)</li>
        </ul>
        
        <h3>Romance Mode</h3>
        <p>
          The biorhythm card includes a <strong>Romance mode</strong> (heart icon) that shows:
        </p>
        <ul>
          <li><strong>Solo mode:</strong> Your personal "romance readiness" — magnetism, passion, emotional openness</li>
          <li><strong>Compatibility mode:</strong> When comparing two birth dates, shows passion sync, communication sync, and overall compatibility</li>
        </ul>
        
        <h3>30-Day Forecast</h3>
        <p>
          The wave chart shows all four cycles plotted over 30 days. Look for:
        </p>
        <ul>
          <li>📈 <strong>Peaks:</strong> When multiple cycles are high simultaneously</li>
          <li>📉 <strong>Troughs:</strong> When multiple cycles are low — plan rest days</li>
          <li>❤️ <strong>Romance peaks:</strong> In compatibility mode, best days for connection</li>
        </ul>
      </>
    ),
  },
  timing: {
    title: "Timing & Electional Astrology",
    content: (
      <>
        <p>
          The Timing tab brings together multiple systems to help you choose the best times 
          for important activities. This guide explains each feature.
        </p>
        
        <h3>💕 Best Romance Days</h3>
        <p>
          Identifies the top 5 days in the next 30 days that are most favorable for romance:
        </p>
        <ul>
          <li><strong>Moon Phase & Sign:</strong> Full moons illuminate romance; Moon in Libra, Taurus, or Leo enhances love</li>
          <li><strong>Venus Aspects:</strong> When Venus makes harmonious aspects</li>
          <li><strong>Biorhythm Romance Readiness:</strong> Your personal passion and magnetism cycles</li>
          <li><strong>Romantic Mood:</strong> Each day has a mood (passionate, dreamy, sensual, playful)</li>
        </ul>
        
        <h3>✨ Synastry Analysis</h3>
        <p>
          Compares the aspects between two natal charts to reveal relationship dynamics:
        </p>
        <ul>
          <li><strong>Venus-Mars Aspects:</strong> Physical chemistry and romantic attraction</li>
          <li><strong>Sun-Moon Aspects:</strong> Core identity and emotional compatibility</li>
          <li><strong>Saturn Aspects:</strong> Karmic bonds and commitment potential</li>
        </ul>
        
        <h3>👥 Composite Chart</h3>
        <p>
          Creates a single "relationship chart" by calculating the midpoint between each pair of planets. 
          This represents the relationship as its own entity.
        </p>
        
        <h3>📅 Davison Chart</h3>
        <p>
          An alternative relationship chart that calculates the midpoint in <em>time</em> and <em>space</em> 
          between two births, creating an actual horoscope for the relationship's "birth moment."
        </p>
        
        <h3>🔔 Transit Alerts</h3>
        <p>
          Monitors major outer planet transits to your personal planets and alerts you when they're 
          approaching or exact:
        </p>
        <ul>
          <li><strong>Critical:</strong> Exact outer planet transits to Sun, Moon, or Ascendant</li>
          <li><strong>High:</strong> Approaching transits within 1° orb</li>
          <li><strong>Medium:</strong> Transits within 2-3° that are building</li>
        </ul>
        
        <h3>♄ Saturn Return Calculator</h3>
        <p>
          Tracks your Saturn cycles — the most significant life transitions at ages ~28-30 and ~57-59. 
          Shows your current Saturn phase and upcoming major transitions.
        </p>
        
        <h3>📆 Electional Calendar</h3>
        <p>
          A monthly grid showing which days are best (green), neutral (yellow), or challenging (red) 
          for launching new projects, making major decisions, or starting important ventures.
        </p>
        
        <h3>📊 Best Days Summary</h3>
        <p>
          Shows the single best day for each life area (love, career, health, travel, finance) at a glance. 
          When multiple categories peak on the same day, it's highlighted as a "Power Day."
        </p>
      </>
    ),
  },
  patterns: {
    title: "Patterns & Cycles",
    content: (
      <>
        <p>
          The Patterns tab shows live planetary positions and helps you track major astrological 
          cycles and configurations.
        </p>
        
        <h3>Live Planetary Positions</h3>
        <p>
          Real-time positions of all planets, updating every second. Click any planet to see 
          detailed information about its current sign, degree, and any special conditions.
        </p>
        
        <h3>Current Patterns</h3>
        <p>
          The app detects and alerts you to significant configurations:
        </p>
        <ul>
          <li><strong>Stelliums:</strong> 3+ planets in one sign — concentrated energy in that sign's themes</li>
          <li><strong>Grand Trines:</strong> Three planets forming a perfect triangle — flowing, harmonious energy</li>
          <li><strong>T-Squares:</strong> Two planets opposing with a third squaring both — dynamic tension</li>
          <li><strong>Yods:</strong> Two planets sextile with both quincunx a third — "finger of fate"</li>
        </ul>
        
        <h3>Mercury Retrograde Tracker</h3>
        <p>
          Visual tracker showing Mercury retrograde periods over multiple years, including which 
          signs Mercury retrogrades through (the element shifts every few years).
        </p>
        
        <h3>Historical Conjunctions</h3>
        <p>
          Major planetary conjunctions mark generational shifts:
        </p>
        <ul>
          <li><strong>Jupiter-Saturn:</strong> Every ~20 years — social and economic restructuring</li>
          <li><strong>Saturn-Uranus:</strong> Every ~45 years — tension between old and new structures</li>
          <li><strong>Saturn-Neptune:</strong> Every ~36 years — dissolution of rigid structures</li>
          <li><strong>Saturn-Pluto:</strong> Every ~33 years — power restructuring, endings and beginnings</li>
        </ul>
      </>
    ),
  },
  chartdecoder: {
    title: "Chart Decoder Guide",
    content: (
      <>
        <p>
          The Chart Decoder provides deep analysis of a natal chart, breaking down its components 
          and showing how planets interact. Here's what each section reveals:
        </p>
        
        <h3>☀️ Birth Conditions</h3>
        <p>
          Fundamental context for interpreting the chart:
        </p>
        <ul>
          <li><strong>Day/Night Sect:</strong> Born during day or night — affects which planets are most supportive</li>
          <li><strong>Natal Moon Phase:</strong> The lunar phase at birth — your natural emotional rhythm</li>
          <li><strong>Chart Shape:</strong> Overall pattern (bowl, bucket, bundle, locomotive, etc.)</li>
        </ul>
        
        <h3>👑 Chart Ruler Deep Dive</h3>
        <p>
          Your Ascendant's ruling planet is the "CEO" of your chart. This section analyzes:
        </p>
        <ul>
          <li>Which planet rules your rising sign</li>
          <li>That planet's sign, house, and condition</li>
          <li>What this means for your overall life direction</li>
        </ul>
        
        <h3>📊 Dignity Distribution</h3>
        <p>
          A breakdown of how many planets are in each dignity state (domicile, exaltation, 
          detriment, fall, or peregrine). Shows your chart's overall "strength profile."
        </p>
        
        <h3>☀️🌙 Sect Analysis</h3>
        <p>
          In ancient astrology, planets are divided into day and night "teams":
        </p>
        <ul>
          <li><strong>Day Sect:</strong> Sun, Jupiter, Saturn (if born during day)</li>
          <li><strong>Night Sect:</strong> Moon, Venus, Mars (if born at night)</li>
          <li>Planets "in sect" are more supportive; planets "out of sect" may cause more challenges</li>
        </ul>
        
        <h3>🗺️ Dispositor Map</h3>
        <p>
          Every planet is "disposed" by the ruler of the sign it's in. This creates a chain of 
          command showing which planet ultimately controls the chart's energy flow.
        </p>
        
        <h3>📈 Planetary Condition Dashboard</h3>
        <p>
          A scoring system that rates each planet's overall condition based on:
        </p>
        <ul>
          <li>Dignity (sign placement)</li>
          <li>Sect (day/night team alignment)</li>
          <li>House placement</li>
          <li>Aspects received</li>
        </ul>
        
        <h3>🌙 Progressed Moon Timeline</h3>
        <p>
          Shows your Progressed Moon's journey through the signs, including when it will next 
          change signs and what themes that will bring.
        </p>
        
        <h3>🧭 Quadrant Analysis</h3>
        <p>
          Divides the chart into four quadrants to show where planetary energy is concentrated:
        </p>
        <ul>
          <li><strong>1st Quadrant (Houses 1-3):</strong> Self-development</li>
          <li><strong>2nd Quadrant (Houses 4-6):</strong> Personal resources</li>
          <li><strong>3rd Quadrant (Houses 7-9):</strong> Relationships and expansion</li>
          <li><strong>4th Quadrant (Houses 10-12):</strong> Public life and transcendence</li>
        </ul>
      </>
    ),
  },
  sacredscript: {
    title: "Sacred Script Guide",
    content: (
      <>
        <p>
          The Sacred Script tab generates a structured astrological reading based on 
          <strong> Debra Silverman's</strong> methodology. This is a professional framework for 
          conducting comprehensive natal chart readings.
        </p>
        
        <h3>The 9-Section Reading Structure</h3>
        <p>
          Each Sacred Script reading follows this framework:
        </p>
        
        <div className="mt-4 space-y-4">
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">1️⃣ Introduction</div>
            <div className="text-sm text-muted-foreground">
              Establish rapport, explain the reading process, set intentions.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">2️⃣ Saturn Cycles</div>
            <div className="text-sm text-muted-foreground">
              Where you are in your Saturn Return cycle — the most important timing marker.
              Saturn returns at ages ~28-30 and ~57-59 mark major life transitions.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">3️⃣ Character (Sun, Moon, Rising)</div>
            <div className="text-sm text-muted-foreground">
              The "Big Three" — your core identity (Sun), emotional nature (Moon), 
              and outward presentation (Rising). The foundation of who you are.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">4️⃣ Mercury & Communication</div>
            <div className="text-sm text-muted-foreground">
              How you think, learn, and communicate. Mercury's sign, house, and aspects 
              reveal your mental style.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">5️⃣ What Stands Out</div>
            <div className="text-sm text-muted-foreground">
              Unique chart features: stelliums, chart patterns, dominant planets, 
              unusual configurations.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">6️⃣ Elements & Modalities</div>
            <div className="text-sm text-muted-foreground">
              Balance of Fire, Earth, Air, Water and Cardinal, Fixed, Mutable. 
              Shows your natural strengths and blind spots.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">7️⃣ Current Transits</div>
            <div className="text-sm text-muted-foreground">
              What's happening NOW — major transits affecting your chart and their timing.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">8️⃣ Progressed Moon</div>
            <div className="text-sm text-muted-foreground">
              Your current emotional chapter — which sign your Progressed Moon is in 
              and what themes that brings.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">9️⃣ Life Lesson & Closing</div>
            <div className="text-sm text-muted-foreground">
              The North Node message — your soul's growth direction in this lifetime.
              Integration and actionable takeaways.
            </div>
          </div>
        </div>
        
        <h3>Element Balance</h3>
        <p>
          The reading analyzes how planets are distributed across the four elements:
        </p>
        <ul>
          <li><strong>🔥 Fire (Aries, Leo, Sagittarius):</strong> Inspiration, action, enthusiasm</li>
          <li><strong>🌍 Earth (Taurus, Virgo, Capricorn):</strong> Practicality, stability, manifestation</li>
          <li><strong>💨 Air (Gemini, Libra, Aquarius):</strong> Ideas, communication, connection</li>
          <li><strong>💧 Water (Cancer, Scorpio, Pisces):</strong> Emotions, intuition, depth</li>
        </ul>
        
        <h3>Document Upload</h3>
        <p>
          You can upload PDF or image files of additional astrological materials to integrate 
          into your reading (such as previously cast charts or notes).
        </p>
      </>
    ),
  },
  dwarfplanets: {
    title: "Dwarf Planets & TNOs",
    content: (
      <>
        <p>
          <strong>Trans-Neptunian Objects (TNOs)</strong> are celestial bodies orbiting beyond Neptune. 
          While smaller than the traditional planets, they carry powerful symbolic meaning, especially 
          for generational and civilizational themes.
        </p>
        
        <h3>Why Dwarf Planets Matter</h3>
        <p>
          These bodies have extremely long orbital periods (165-550+ years), meaning their sign 
          placements are shared by entire generations. They speak to collective evolution and 
          the deepest layers of the psyche.
        </p>
        
        <h3>Key Dwarf Planets</h3>
        <div className="mt-4 space-y-4">
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">⚢ Eris — Discord & Strife</div>
            <div className="text-sm text-muted-foreground">
              <strong>Orbital Period:</strong> 558 years<br/>
              Goddess of discord. Reveals what we exclude and the chaos that results. 
              The "uninvited guest" who exposes uncomfortable truths. Currently in Aries since 1926.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">⯕ Sedna — Ancestral Trauma</div>
            <div className="text-sm text-muted-foreground">
              <strong>Orbital Period:</strong> 11,400 years<br/>
              Inuit goddess of the sea. Represents deep ancestral wounds, especially around 
              betrayal and abandonment. Themes of resource scarcity and survival.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">🜃 Makemake — Fertility & Creation</div>
            <div className="text-sm text-muted-foreground">
              <strong>Orbital Period:</strong> 305 years<br/>
              Rapa Nui (Easter Island) creator god. Themes of environmentalism, sustainability, 
              and the consequences of resource depletion. Fertility and creation myths.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">🜄 Haumea — Rebirth & Family</div>
            <div className="text-sm text-muted-foreground">
              <strong>Orbital Period:</strong> 283 years<br/>
              Hawaiian goddess of fertility. Themes of childbirth, regeneration, and family lineage. 
              The ability to regenerate parts of self (like a lizard's tail).
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">Quaoar — Creation Stories</div>
            <div className="text-sm text-muted-foreground">
              <strong>Orbital Period:</strong> 286 years<br/>
              Tongva creation deity. Represents the stories we tell to make sense of existence. 
              Mythmaking, cultural narratives, and the power of creation through dance and song.
            </div>
          </div>
        </div>
        
        <h3>Centaurs</h3>
        <p>
          Centaurs orbit between Jupiter and Neptune, bridging the personal and transpersonal:
        </p>
        <ul>
          <li><strong>⚷ Chiron:</strong> The Wounded Healer — our deepest wound and healing gift</li>
          <li><strong>Pholus:</strong> Small cause, big effect — the butterfly effect in your life</li>
          <li><strong>Nessus:</strong> Toxic patterns and abuse cycles — what must end</li>
        </ul>
        
        <h3>The TNOs Tab</h3>
        <p>
          The TNOs tab provides detailed information on each dwarf planet, including their 
          mythology, current sign placement, and how to interpret them in your chart.
        </p>
      </>
    ),
  },
  speeds: {
    title: "Planetary Speeds Guide",
    content: (
      <>
        <p>
          Understanding how fast planets move is crucial for interpreting their influence. 
          Faster planets affect daily life; slower planets shape generations.
        </p>
        
        <h3>Speed Categories</h3>
        <div className="mt-4 space-y-4">
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">⚡ Fast (Personal Planets)</div>
            <div className="text-sm text-muted-foreground">
              <strong>Moon:</strong> 27.3 days per orbit, ~2.5 days per sign<br/>
              <strong>Mercury:</strong> 88 days per orbit, ~3 weeks per sign<br/>
              <strong>Venus:</strong> 225 days per orbit, ~4 weeks per sign<br/>
              <strong>Sun:</strong> 365 days per orbit, ~1 month per sign<br/>
              <strong>Mars:</strong> 687 days per orbit, ~6 weeks per sign
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">🔄 Medium (Social Planets)</div>
            <div className="text-sm text-muted-foreground">
              <strong>Jupiter:</strong> 12 years per orbit, ~1 year per sign<br/>
              <strong>Saturn:</strong> 29.5 years per orbit, ~2.5 years per sign
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="font-semibold text-foreground mb-2">🐢 Slow (Generational Planets)</div>
            <div className="text-sm text-muted-foreground">
              <strong>Uranus:</strong> 84 years per orbit, ~7 years per sign<br/>
              <strong>Neptune:</strong> 165 years per orbit, ~14 years per sign<br/>
              <strong>Pluto:</strong> 248 years per orbit, ~12-31 years per sign (varies due to eccentric orbit)
            </div>
          </div>
        </div>
        
        <h3>Why Speed Matters</h3>
        <ul>
          <li><strong>Fast planets:</strong> Their transits affect you personally and frequently. 
            Moon transits last hours, Mercury transits last days.</li>
          <li><strong>Slow planets:</strong> Their transits are rare and transformative. 
            A Pluto transit can last 2-3 years and restructure your life.</li>
          <li><strong>Generational planets:</strong> When Uranus, Neptune, or Pluto change signs, 
            it marks a shift in collective consciousness.</li>
        </ul>
        
        <h3>Retrograde Motion</h3>
        <p>
          All planets (except Sun and Moon) appear to move backward periodically. 
          Slower planets spend more time retrograde:
        </p>
        <ul>
          <li><strong>Mercury:</strong> ~3 weeks retrograde, 3-4 times per year</li>
          <li><strong>Venus/Mars:</strong> ~6-10 weeks retrograde, every 1-2 years</li>
          <li><strong>Outer planets:</strong> ~5-6 months retrograde every year</li>
        </ul>
        
        <h3>The Speeds Tab</h3>
        <p>
          The Speeds tab provides a comprehensive reference with exact orbital periods, 
          average daily motion, and interpretive guidance for each celestial body.
        </p>
      </>
    ),
  },
  cosmickitchen: {
    title: "Cosmic Kitchen: Astro-Ayurvedic Eating",
    content: (
      <>
        <p>
          The <strong>Cosmic Kitchen</strong> integrates two ancient wisdom systems—Western astrology 
          and Ayurveda—to create meal recommendations aligned with both celestial and seasonal energies.
        </p>
        
        <h3>🌙 The Astrological Layer</h3>
        <p>
          Each day, the Moon moves through a zodiac sign, influencing our emotional relationship 
          with food and what types of nourishment our souls crave:
        </p>
        <div className="mt-4 grid gap-2">
          <div className="p-3 rounded-sm border border-border bg-secondary">
            <strong>Fire Signs (Aries, Leo, Sagittarius):</strong> Energizing, bold flavors. Protein-rich, 
            spices that ignite metabolism. Ginger, cayenne, citrus, golden foods.
          </div>
          <div className="p-3 rounded-sm border border-border bg-secondary">
            <strong>Earth Signs (Taurus, Virgo, Capricorn):</strong> Grounding, substantial meals. 
            Root vegetables, whole grains, hearty comfort foods. Slow-cooked, nourishing.
          </div>
          <div className="p-3 rounded-sm border border-border bg-secondary">
            <strong>Air Signs (Gemini, Libra, Aquarius):</strong> Light, varied—multiple small dishes. 
            Beautiful presentation, balanced flavors, innovative combinations.
          </div>
          <div className="p-3 rounded-sm border border-border bg-secondary">
            <strong>Water Signs (Cancer, Scorpio, Pisces):</strong> Soul food, emotional nourishment. 
            Soups, broths, warm beverages, foods that comfort the heart.
          </div>
        </div>
        
        <h3>🍃 The Ayurvedic Layer (Ritucharya)</h3>
        <p>
          Ayurveda's <em>Ritucharya</em> (seasonal regimen) teaches that our digestive fire (Agni) 
          and the dominant dosha change with the seasons:
        </p>
        <div className="mt-4 grid gap-3">
          <div className="p-4 rounded-sm border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
            <div className="font-semibold text-foreground mb-2">❄️ Winter (Hemanta/Shishira) — Nov-Feb</div>
            <div className="text-sm text-muted-foreground">
              <strong>Vata season with STRONG Agni.</strong> The body needs warmth and substance.<br/>
              <strong>Favor:</strong> Warm, oily, heavy, sweet, sour, salty foods. Ghee, soups, stews, 
              root vegetables, warm spices (ginger, cinnamon, black pepper), sesame oil, nuts, whole grains.<br/>
              <strong>Avoid:</strong> Cold, raw, dry foods. <em>No cold cucumber, raw salads, cold smoothies, 
              ice cream—even for "watery" Moon signs.</em>
            </div>
          </div>
          <div className="p-4 rounded-sm border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
            <div className="font-semibold text-foreground mb-2">🌸 Spring (Vasanta) — Mar-May</div>
            <div className="text-sm text-muted-foreground">
              <strong>Kapha accumulates.</strong> Lighten up to prevent stagnation.<br/>
              <strong>Favor:</strong> Light, dry, warming, bitter, pungent, astringent. Honey, barley, 
              millet, leafy greens, ginger tea, lighter proteins.<br/>
              <strong>Reduce:</strong> Heavy, oily, sweet, dairy-heavy foods.
            </div>
          </div>
          <div className="p-4 rounded-sm border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
            <div className="font-semibold text-foreground mb-2">☀️ Summer (Grishma) — Jun-Aug</div>
            <div className="text-sm text-muted-foreground">
              <strong>Pitta season with WEAK Agni.</strong> Digestion is naturally lower.<br/>
              <strong>Favor:</strong> Cooling, sweet, light, liquid foods. Cucumber (NOW it's appropriate!), 
              melons, coconut, mint, coriander, sweet fruits, light dairy.<br/>
              <strong>Avoid:</strong> Excess spicy, sour, salty, heavy foods.
            </div>
          </div>
          <div className="p-4 rounded-sm border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
            <div className="font-semibold text-foreground mb-2">🍂 Autumn (Sharad) — Sep-Oct</div>
            <div className="text-sm text-muted-foreground">
              <strong>Pitta releasing.</strong> Transition period requiring balance.<br/>
              <strong>Favor:</strong> Sweet, bitter, astringent, cooling. Ghee to balance accumulated heat. 
              Pomegranates, grapes, rice, wheat, moderate spices.
            </div>
          </div>
        </div>
        
        <h3>🔥 Honoring Agni (Digestive Fire)</h3>
        <p>
          Ayurveda teaches that <em>Agni</em>—our digestive fire—follows a daily rhythm:
        </p>
        <ul>
          <li><strong>Morning:</strong> Agni is kindling. Start with warm foods to ignite digestion. 
            Warm water with lemon, cooked grains, warm spices.</li>
          <li><strong>Midday (10am-2pm):</strong> Agni peaks. This is when to eat your largest, 
            most complex meal. Your body can handle heavier foods now.</li>
          <li><strong>Evening:</strong> Agni decreases. Eat lighter, earlier. Heavy dinners burden 
            digestion and disrupt sleep.</li>
        </ul>
        
        <h3>🔮 Zodiac-Dosha Correspondences</h3>
        <p>
          The zodiac elements correlate loosely with Ayurvedic constitutions:
        </p>
        <ul>
          <li><strong>Fire Signs → Pitta tendency:</strong> Need cooling, balancing foods to prevent 
            excess heat. Bitter greens, sweet fruits, cooling herbs.</li>
          <li><strong>Earth Signs → Kapha/Vata mix:</strong> Need warmth and grounding. 
            Root vegetables, warm grains, moderate spices.</li>
          <li><strong>Air Signs → Vata tendency:</strong> Need warmth, moisture, grounding. 
            Ghee, soups, stews, root vegetables. AVOID cold, dry, raw.</li>
          <li><strong>Water Signs → Kapha tendency:</strong> Need warming spices to prevent stagnation. 
            Ginger, turmeric, light proteins. Don't over-emphasize cold/watery foods.</li>
        </ul>
        
        <h3>Why This Matters</h3>
        <p>
          When you see a Cancer Moon in January and think "soul food, comfort," Ayurveda agrees—
          but specifies WARM soups and stews, not cold dairy or raw cucumbers. The Cosmic Kitchen 
          synthesizes both: honoring the emotional quality of the Moon sign while respecting the 
          seasonal wisdom of your body's needs.
        </p>
        <p>
          <em>This is why you won't see cold salads recommended in winter, even on Water sign days. 
          The season always takes precedence over the sign for physical nourishment, while the sign 
          guides the emotional quality of the meal.</em>
        </p>
      </>
    ),
  },
  mercuryretrograde: {
    title: "Retrogrades",
    content: <RetroGradesHub allCharts={[]} />,
  },
};

export const GuideView = ({ onNavigateToView }: GuideViewProps = {}) => {
  const [guideSection, setGuideSection] = useState<GuideSection>("overview");

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      {/* Navigation */}
      <div className="mb-8 flex flex-wrap gap-2">
        {GUIDE_NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => setGuideSection(item.key)}
            className={`rounded-sm border px-4 py-2 text-[11px] uppercase tracking-widest transition-all ${
              guideSection === item.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-transparent text-muted-foreground hover:border-primary hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="guide-content rounded-sm border border-border bg-background p-8 md:p-10">
        <h2 className="mb-6 border-b border-border pb-4 font-serif text-3xl font-light text-foreground md:text-4xl">
          {SECTIONS[guideSection].title}
        </h2>
        {SECTIONS[guideSection].content}
        
        {/* Try It button */}
        <TryItButton section={guideSection} onNavigate={onNavigateToView} />
      </div>

      <style>{`
        .guide-content h3 {
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        .guide-content p {
          margin-bottom: 1rem;
          line-height: 1.75;
          color: hsl(var(--muted-foreground));
        }
        .guide-content ul {
          margin-bottom: 1rem;
          margin-left: 1.5rem;
          list-style-type: disc;
        }
        .guide-content li {
          margin-bottom: 0.5rem;
          line-height: 1.625;
          color: hsl(var(--muted-foreground));
        }
        .guide-content strong {
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
};
