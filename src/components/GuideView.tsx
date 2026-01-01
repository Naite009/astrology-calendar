import { useState } from "react";

type GuideSection = "overview" | "colors" | "symbols" | "moonphases" | "retrogrades" | "aspects";

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
        
        <h3>🌘 Waning Crescent / Balsamic</h3>
        <p>The final sliver before new moon. Deep rest and surrender.</p>
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
};

const NAV_ITEMS: { key: GuideSection; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "colors", label: "Colors" },
  { key: "symbols", label: "Symbols" },
  { key: "moonphases", label: "Moon Phases" },
  { key: "retrogrades", label: "Retrogrades" },
  { key: "aspects", label: "Aspects" },
];

export const GuideView = () => {
  const [guideSection, setGuideSection] = useState<GuideSection>("overview");

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      {/* Navigation */}
      <div className="mb-8 flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => (
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
      </div>

      <style>{`
        .guide-content h3 {
          font-family: var(--font-serif);
          font-size: 1.5rem;
          font-weight: 400;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: hsl(var(--foreground));
        }
        .guide-content p {
          font-size: 0.875rem;
          line-height: 1.8;
          color: hsl(var(--foreground));
          margin-bottom: 1rem;
        }
        .guide-content ul {
          list-style: none;
          padding: 0;
          margin-bottom: 1rem;
        }
        .guide-content li {
          font-size: 0.875rem;
          line-height: 1.8;
          color: hsl(var(--foreground));
          padding-left: 1.5rem;
          position: relative;
          margin-bottom: 0.75rem;
        }
        .guide-content li::before {
          content: '•';
          position: absolute;
          left: 0.5rem;
          color: hsl(var(--primary));
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};
