import { useState } from "react";

type GuideSection = "overview" | "colors" | "symbols" | "moonphases" | "retrogrades" | "aspects" | "dignities" | "fixedstars" | "divinefeminine" | "venuscycles";

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
              The Dog Star. Spiritual wisdom, success, fame. Ancient Egyptian sacred star marking the New Year. Divine downloads, kundalini awakening, connection to higher consciousness.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Algol (26° Taurus)</span>
              <span className="text-xs text-red-600 dark:text-red-400">Most Infamous</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Medusa's Head. Transformation through facing shadow. Feminine rage transmuted to power. Losing one's head, then reclaiming it. Passion, intensity.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Spica (23° Libra)</span>
              <span className="text-xs text-green-600 dark:text-green-400">Most Benefic</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              The Wheat Sheaf. Gifts, talents, protection. Venus-Jupiter nature. Artistic success, harvest of efforts. Spiritual gifts, mystical knowledge. The priestess star.
            </div>
          </div>
          
          <div className="rounded-sm border border-border bg-secondary p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="font-semibold text-foreground">Alcyone (0° Gemini)</span>
              <span className="text-xs text-purple-600 dark:text-purple-400">Pleiades</span>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              Central star of the Seven Sisters. Vision, mysticism, grief. Something to cry about. Ambition, mourning. Connection to ancient star wisdom.
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
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="p-3 text-left font-semibold">Chiron in Sign</th>
                <th className="p-3 text-left font-semibold">The Wound & The Healing</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">♈ Aries</td>
                <td className="p-3 text-muted-foreground">Wound: Identity, self-assertion. Healing: Courage to be yourself.</td>
              </tr>
              <tr className="bg-secondary border-b border-border">
                <td className="p-3 font-medium">♉ Taurus</td>
                <td className="p-3 text-muted-foreground">Wound: Self-worth, security. Healing: Grounding, valuing yourself.</td>
              </tr>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">♊ Gemini</td>
                <td className="p-3 text-muted-foreground">Wound: Communication, learning. Healing: Finding your voice.</td>
              </tr>
              <tr className="bg-secondary border-b border-border">
                <td className="p-3 font-medium">♋ Cancer</td>
                <td className="p-3 text-muted-foreground">Wound: Family, belonging. Healing: Nurturing self and others.</td>
              </tr>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">♌ Leo</td>
                <td className="p-3 text-muted-foreground">Wound: Self-expression, recognition. Healing: Authentic creativity.</td>
              </tr>
              <tr className="bg-secondary border-b border-border">
                <td className="p-3 font-medium">♍ Virgo</td>
                <td className="p-3 text-muted-foreground">Wound: Perfectionism, health. Healing: Accepting imperfection.</td>
              </tr>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">♎ Libra</td>
                <td className="p-3 text-muted-foreground">Wound: Relationships, fairness. Healing: Healthy boundaries.</td>
              </tr>
              <tr className="bg-secondary border-b border-border">
                <td className="p-3 font-medium">♏ Scorpio</td>
                <td className="p-3 text-muted-foreground">Wound: Trust, intimacy. Healing: Deep emotional healing.</td>
              </tr>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">♐ Sagittarius</td>
                <td className="p-3 text-muted-foreground">Wound: Meaning, truth. Healing: Faith, philosophical understanding.</td>
              </tr>
              <tr className="bg-secondary border-b border-border">
                <td className="p-3 font-medium">♑ Capricorn</td>
                <td className="p-3 text-muted-foreground">Wound: Authority, achievement. Healing: Building from wounds.</td>
              </tr>
              <tr className="bg-background border-b border-border">
                <td className="p-3 font-medium">♒ Aquarius</td>
                <td className="p-3 text-muted-foreground">Wound: Belonging, uniqueness. Healing: Embracing difference.</td>
              </tr>
              <tr className="bg-secondary">
                <td className="p-3 font-medium">♓ Pisces</td>
                <td className="p-3 text-muted-foreground">Wound: Boundaries, escapism. Healing: Compassion, mystical connection.</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3>⚸ Black Moon Lilith — The Wild Feminine</h3>
        <p>
          Black Moon Lilith is not a planet but a mathematical point—the lunar apogee (Moon's 
          farthest point from Earth). She represents the wild, untamed feminine, sexuality, 
          and the parts of ourselves we've been taught to suppress.
        </p>
        <div className="mt-4 p-4 rounded-sm bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700">
          <div className="font-semibold text-foreground mb-2">Lilith Themes by Sign</div>
          <div className="grid gap-2 text-sm">
            <div><strong>♈ Aries:</strong> Wild independence. Power through fierce autonomy.</div>
            <div><strong>♉ Taurus:</strong> Sensual sovereignty. Body as temple.</div>
            <div><strong>♊ Gemini:</strong> Voice as weapon. Speaking dangerous truths.</div>
            <div><strong>♋ Cancer:</strong> Primal mother. Raw emotional intensity.</div>
            <div><strong>♌ Leo:</strong> Creative fury. Shameless self-expression.</div>
            <div><strong>♍ Virgo:</strong> Perfect imperfection. Sacred service.</div>
            <div><strong>♎ Libra:</strong> Relationship rebel. Authentic partnership.</div>
            <div><strong>♏ Scorpio:</strong> Sexual power. Transformative intensity.</div>
            <div><strong>♐ Sagittarius:</strong> Wild freedom. Untamed spirit.</div>
            <div><strong>♑ Capricorn:</strong> Authority defiance. Building your empire.</div>
            <div><strong>♒ Aquarius:</strong> Radical uniqueness. Revolutionary change.</div>
            <div><strong>♓ Pisces:</strong> Mystic wild. Spiritual rebellion.</div>
          </div>
        </div>
        
        <h3>Working with Divine Feminine Energy</h3>
        <div className="mt-4 p-4 rounded-sm bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700">
          <ul className="space-y-2">
            <li><strong>North Node transits:</strong> Major life direction themes activated. Pay attention to destiny opportunities.</li>
            <li><strong>Chiron transits:</strong> Healing crises and opportunities. Old wounds resurface for healing.</li>
            <li><strong>Lilith transits:</strong> Reclaiming suppressed parts of self. Rage, sexuality, power emerging.</li>
            <li><strong>Stelliums:</strong> When 3+ planets gather in one sign, that sign's themes dominate.</li>
          </ul>
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
              <li>• Inward, cocooning phase</li>
              <li>• Time to reassess values, relationships, self-worth</li>
              <li>• <strong>This is the main "Star Point"</strong></li>
            </ul>
          </div>
          
          <div className="p-4 rounded-sm bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700">
            <div className="font-semibold text-foreground mb-2">☀️ Superior Conjunction</div>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Venus passes on FAR SIDE of Sun</li>
              <li>• Venus is FARTHEST from Earth</li>
              <li>• Like a "Venus Full Moon" — maturation point</li>
              <li>• Integration and consolidation phase</li>
              <li>• Time to solidify what you've learned about love and value</li>
            </ul>
          </div>
        </div>
        
        <h3>The Full Venus Cycle</h3>
        <div className="mt-4 p-4 rounded-sm bg-secondary border border-border font-mono text-xs">
          <div className="space-y-2">
            <div><strong>🌑 INFERIOR CONJUNCTION</strong> (Retrograde)</div>
            <div className="pl-4 border-l-2 border-pink-300 text-muted-foreground">
              "Underworld Journey"<br/>
              3 weeks before: Release what no longer serves<br/>
              EXACT: New Venus cycle seed planted<br/>
              3 weeks after: Integrate, prepare for emergence
            </div>
            <div className="text-center text-muted-foreground">↓ (Venus turns Direct) ↓</div>
            
            <div><strong>🌅 MORNING STAR PHASE</strong> (6-7 months)</div>
            <div className="pl-4 border-l-2 border-orange-300 text-muted-foreground">
              Venus visible before sunrise<br/>
              INTERNAL refinement<br/>
              Clarifying values, self-worth development<br/>
              Relationship patterns examined internally
            </div>
            <div className="text-center text-muted-foreground">↓</div>
            
            <div><strong>☀️ SUPERIOR CONJUNCTION</strong></div>
            <div className="pl-4 border-l-2 border-amber-300 text-muted-foreground">
              "Venus Full Moon"<br/>
              Maturation point<br/>
              Integration of lessons
            </div>
            <div className="text-center text-muted-foreground">↓</div>
            
            <div><strong>🌆 EVENING STAR PHASE</strong> (6-7 months)</div>
            <div className="pl-4 border-l-2 border-purple-300 text-muted-foreground">
              Venus visible after sunset<br/>
              EXTERNAL expression<br/>
              Dating, socializing, beautifying<br/>
              Relationship growth expressed outwardly
            </div>
            <div className="text-center text-muted-foreground">↓ [Venus turns Retrograde] ↓</div>
            
            <div><strong>🌑 NEXT INFERIOR CONJUNCTION</strong> (584 days later)</div>
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
              Venus rises before the Sun. Energy is <strong>new, eager, spontaneous, resilient</strong>. 
              Perhaps a little naive when it comes to love. Internal work—clarifying what you truly value, 
              developing self-worth privately before expressing it.
            </p>
          </div>
          
          <div className="p-4 rounded-sm bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700">
            <div className="font-semibold text-foreground mb-2">🌆 Evening Star (Hesperus)</div>
            <p className="text-muted-foreground">
              Venus follows the Sun. Energy is <strong>experienced, wiser, worldly</strong>. 
              More cautious and practical about love. External expression—actively dating, 
              socializing, beautifying your environment, attracting abundance.
            </p>
          </div>
        </div>
        
        <h3>Why Venus Cycles Matter for Libra/Taurus</h3>
        <p>
          If you have Libra or Taurus rising, or a stellium in those signs, <strong>Venus rules your chart</strong>. 
          When Venus has major cycles, your ENTIRE life restructures around relationships, values, money, 
          beauty, and self-worth. Pay special attention to Star Points!
        </p>
        
        <h3>Journal Prompts by Phase</h3>
        <div className="mt-4 space-y-4 text-sm">
          <div className="p-3 rounded-sm bg-pink-50 dark:bg-pink-900/30">
            <div className="font-semibold mb-2">🌑 Inferior Conjunction (Underworld)</div>
            <ul className="text-muted-foreground space-y-1">
              <li>• What values no longer serve me?</li>
              <li>• What relationships need releasing or deepening?</li>
              <li>• Where have I lost touch with my self-worth?</li>
              <li>• What does my heart truly want?</li>
            </ul>
          </div>
          
          <div className="p-3 rounded-sm bg-orange-50 dark:bg-orange-900/30">
            <div className="font-semibold mb-2">🌅 Morning Star (Internal Refinement)</div>
            <ul className="text-muted-foreground space-y-1">
              <li>• How am I developing my values internally?</li>
              <li>• What do I need to feel worthy?</li>
              <li>• How can I love myself better?</li>
              <li>• What relationship patterns am I healing?</li>
            </ul>
          </div>
          
          <div className="p-3 rounded-sm bg-amber-50 dark:bg-amber-900/30">
            <div className="font-semibold mb-2">☀️ Superior Conjunction (Maturation)</div>
            <ul className="text-muted-foreground space-y-1">
              <li>• What has matured in my relationships since the last star point?</li>
              <li>• What values have solidified?</li>
              <li>• What commitments am I ready to make?</li>
              <li>• How have I integrated Venus lessons?</li>
            </ul>
          </div>
          
          <div className="p-3 rounded-sm bg-purple-50 dark:bg-purple-900/30">
            <div className="font-semibold mb-2">🌆 Evening Star (External Expression)</div>
            <ul className="text-muted-foreground space-y-1">
              <li>• How am I expressing my values outwardly?</li>
              <li>• What relationships am I actively cultivating?</li>
              <li>• How am I beautifying my environment?</li>
              <li>• Where am I attracting abundance?</li>
            </ul>
          </div>
        </div>
        
        <h3>Key Dates to Watch (2025-2027)</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-3">Type</th>
                <th className="text-left py-2 px-3">Position</th>
                <th className="text-left py-2 px-3">Significance</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Mar 23, 2025</td>
                <td className="py-2 px-3">Inferior ℞</td>
                <td className="py-2 px-3">3° ♈ Aries</td>
                <td className="py-2 px-3">New cycle begins</td>
              </tr>
              <tr className="border-b border-border/50 bg-amber-50 dark:bg-amber-900/20">
                <td className="py-2 px-3 font-medium text-foreground">Jan 6, 2026</td>
                <td className="py-2 px-3 font-bold">Superior + ☉♂</td>
                <td className="py-2 px-3">16° ♑ Capricorn</td>
                <td className="py-2 px-3">🌟 TRIPLE CONJUNCTION! Happens every 32 years</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Oct 23, 2026</td>
                <td className="py-2 px-3">Inferior ℞</td>
                <td className="py-2 px-3">0° ♏ Scorpio</td>
                <td className="py-2 px-3">First Scorpio star point in new era</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 font-medium text-foreground">Mar 10, 2027</td>
                <td className="py-2 px-3">Superior</td>
                <td className="py-2 px-3">20° ♓ Pisces</td>
                <td className="py-2 px-3">Integration phase</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
};

const NAV_ITEMS: { key: GuideSection; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "colors", label: "Colors" },
  { key: "symbols", label: "Symbols" },
  { key: "moonphases", label: "Moon Phases" },
  { key: "venuscycles", label: "Venus Cycles" },
  { key: "retrogrades", label: "Retrogrades" },
  { key: "aspects", label: "Aspects" },
  { key: "dignities", label: "Dignities" },
  { key: "fixedstars", label: "Fixed Stars" },
  { key: "divinefeminine", label: "Divine Feminine" },
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
