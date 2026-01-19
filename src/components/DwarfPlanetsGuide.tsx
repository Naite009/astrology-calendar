import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlanetSymbol } from "./PlanetSymbol";

interface DwarfPlanetData {
  key: string;
  symbol: string;
  name: string;
  discovery: string;
  orbitalPeriod: string;
  mythology: string;
  archetype: string;
  inYourChart: string;
  keywords: string[];
  shadow: string;
  integration: string;
  currentSign?: string;
  currentSignNote?: string;
}

const DWARF_PLANETS: DwarfPlanetData[] = [
  {
    key: 'eris',
    symbol: '⯰',
    name: 'Eris',
    discovery: '2005 (caused Pluto\'s "demotion")',
    orbitalPeriod: '558 years',
    mythology: 'Greek goddess of discord and strife. When not invited to a wedding, she threw the golden "Apple of Discord" that led to the Trojan War. She reveals truth through disruption.',
    archetype: 'The Feminine Warrior • The Uninvited One • The Truth-Teller',
    inYourChart: 'Where you fight for what you believe in. What you cannot NOT do. Your soul purpose that creates necessary chaos. Where you refuse to play nice to keep the peace.',
    keywords: ['Soul purpose', 'Feminine warrior', 'Necessary discord', 'Paradigm shifting', 'Outsider power', 'What you fight for'],
    shadow: 'Fighting for fighting\'s sake. Chronic troublemaker. Unable to belong anywhere.',
    integration: 'Channel your warrior energy toward causes that matter. Your disruption serves awakening.',
    currentSign: 'Aries',
    currentSignNote: 'Eris has been in Aries since 1926 and stays until 2048 — a generational signature of fighting for individual rights.',
  },
  {
    key: 'sedna',
    symbol: '⯲',
    name: 'Sedna',
    discovery: '2003',
    orbitalPeriod: '~11,400 years (most distant known object)',
    mythology: 'Inuit goddess of the sea. Betrayed by her father who cut off her fingers (becoming sea creatures) and threw her overboard. She rules the underworld of the ocean, controlling the food supply.',
    archetype: 'The Betrayed Goddess • Victim to Sovereign • The Deep Survivor',
    inYourChart: 'Where you\'ve experienced deep betrayal, abandonment, or victimization. Where you must reclaim your power from the depths. Ancestral trauma that runs generations deep.',
    keywords: ['Deep survival', 'Betrayal transcendence', 'Ancestral trauma', 'Self-sufficiency', 'Ocean depths of psyche', 'Sovereign power'],
    shadow: 'Victim identity. Bitterness. Refusing help even when needed. Isolation as armor.',
    integration: 'Transform your deepest wounds into sovereignty. You survived the unsurvivable.',
    currentSign: 'Gemini',
    currentSignNote: 'Sedna entered Gemini in 2024 after 40+ years in Taurus. Beginning a new cycle of mental/communication awakening around survival.',
  },
  {
    key: 'makemake',
    symbol: '🜨',
    name: 'Makemake',
    discovery: '2005',
    orbitalPeriod: '306 years',
    mythology: 'Creator god of the Rapa Nui (Easter Island). Chief deity who created humanity and brought fertility. Associated with the annual Birdman competition and tangata manu cult.',
    archetype: 'The Creator • The Environmentalist • The Fertility Bringer',
    inYourChart: 'Where you create something from nothing. Your relationship to Earth\'s resources. Environmental consciousness. Primal creative power that manifests tangible results.',
    keywords: ['Creation', 'Fertility', 'Environmental awareness', 'Manifestation', 'Resourcefulness', 'Connection to Earth'],
    shadow: 'Resource exploitation. Creating without considering consequences. Fertility obsession.',
    integration: 'Create in harmony with natural cycles. Your manifestation power comes from Earth.',
    currentSign: 'Libra → Scorpio',
    currentSignNote: 'Makemake has been in Libra since 2000 and enters Scorpio around 2025 — shifting from relational creation to transformative creation.',
  },
  {
    key: 'haumea',
    symbol: '🜵',
    name: 'Haumea',
    discovery: '2004',
    orbitalPeriod: '285 years',
    mythology: 'Hawaiian goddess of childbirth and fertility. She could transform into a young woman to remarry and bear more children. The patron of the islands and all living things born from her body.',
    archetype: 'The Mother of Renewal • The Shapeshifter • The Fertility Goddess',
    inYourChart: 'Where you experience rapid rebirth and regeneration. Your creative life force. The ability to renew yourself and others. Continuous transformation through creation.',
    keywords: ['Rebirth', 'Regeneration', 'Fertility', 'Rapid transformation', 'Creative life force', 'Shapeshifting'],
    shadow: 'Identity instability. Compulsive reinvention. Using creativity to escape rather than transform.',
    integration: 'Trust your ability to be reborn. Every ending is a new beginning.',
    currentSign: 'Scorpio',
    currentSignNote: 'Haumea in Scorpio intensifies themes of death/rebirth and transformative creation.',
  },
  {
    key: 'quaoar',
    symbol: '🝾',
    name: 'Quaoar',
    discovery: '2002',
    orbitalPeriod: '288 years',
    mythology: 'Creation god of the Tongva people of Southern California. Quaoar sang and danced the world into existence, first creating Weywot (sky god), then the other deities, animals, and humans.',
    archetype: 'The Sacred Dancer • The Song of Creation • The Cosmic Choreographer',
    inYourChart: 'Where you bring things into being through rhythm and resonance. Sacred creativity. Manifestation through vibration. The power of voice, dance, and music to create reality.',
    keywords: ['Creation through dance/song', 'Sacred rhythm', 'Manifestation', 'Cosmic order', 'Resonance', 'Bringing form from chaos'],
    shadow: 'Chaotic creation without intention. Using creativity to control. Performance addiction.',
    integration: 'Let your creative expression be a sacred act. You dance reality into being.',
    currentSign: 'Capricorn',
    currentSignNote: 'Quaoar has been in Capricorn since 2000 — structured creation, manifesting through discipline.',
  },
  {
    key: 'orcus',
    symbol: '🝿',
    name: 'Orcus',
    discovery: '2004',
    orbitalPeriod: '247.5 years (same as Pluto)',
    mythology: 'Etruscan and Roman god of the underworld and punisher of broken oaths. He enforced promises made in his name. Later conflated with Pluto but represents the "keeper of oaths" aspect.',
    archetype: 'The Oath Keeper • Shadow Pluto • The Consequence Bringer',
    inYourChart: 'Where you must keep your word or face consequences. Karmic contracts. The weight of promises. Where integrity is non-negotiable. The anti-Pluto (its orbit mirrors Pluto\'s).',
    keywords: ['Oaths and promises', 'Karmic contracts', 'Integrity', 'Consequence of betrayal', 'Underworld justice', 'Shadow work'],
    shadow: 'Holding others to impossible standards. Punishment obsession. Breaking your own vows.',
    integration: 'Honor your word. Your promises create your reality. Integrity is power.',
    currentSign: 'Virgo',
    currentSignNote: 'Orcus in Virgo emphasizes practical integrity, service commitments, and health-related vows.',
  },
  {
    key: 'pholus',
    symbol: '⯛',
    name: 'Pholus',
    discovery: '1992',
    orbitalPeriod: '92 years',
    mythology: 'Greek centaur who guarded a sacred jar of wine. When Heracles visited, Pholus opened the jar, unleashing chaos that killed many centaurs. A small action with massive unintended consequences.',
    archetype: 'The Catalyst • The Uncorking • The Generational Healer',
    inYourChart: 'Where small actions create massive change. Turning points and catalysts. Opening "Pandora\'s box." Generational patterns that get released. Addiction and healing patterns.',
    keywords: ['Small cause → big effect', 'Catalyst', 'Generational healing', 'Addiction patterns', 'Turning points', 'Uncorking what was sealed'],
    shadow: 'Unleashing chaos unintentionally. Compulsive pattern repetition. Fearing your own power.',
    integration: 'Recognize your catalytic nature. Your small acts ripple through generations.',
    currentSign: 'Capricorn',
    currentSignNote: 'Pholus in Capricorn relates to catalyzing structural/institutional changes.',
  },
  {
    key: 'nessus',
    symbol: '⯜',
    name: 'Nessus',
    discovery: '1993',
    orbitalPeriod: '122 years',
    mythology: 'The centaur killed by Heracles for trying to abduct his wife. Dying, Nessus gave his poisoned blood to the wife as a "love potion" — which later killed Heracles. Revenge that transcends death.',
    archetype: 'The Buck Stops Here • The Cycle Breaker • The Shadow Returner',
    inYourChart: 'Where cycles of abuse, karma, and toxic patterns end with you. Where the buck stops here. Accountability for ancestral patterns. Breaking the chain of harm.',
    keywords: ['Ending abuse cycles', 'Karmic return', 'Accountability', 'Breaking chains', 'Toxic patterns', 'The buck stops here'],
    shadow: 'Perpetuating what you suffered. Revenge that poisons you. Victim → perpetrator cycle.',
    integration: 'You are the one who breaks the chain. The pattern ends with you.',
    currentSign: 'Pisces',
    currentSignNote: 'Nessus in Pisces relates to healing collective/spiritual abuse patterns.',
  },
  {
    key: 'ixion',
    symbol: '⯳',
    name: 'Ixion',
    discovery: '2001',
    orbitalPeriod: '250 years',
    mythology: 'Greek king who murdered his father-in-law, was purified by Zeus, then tried to seduce Hera. Punished by being bound to a fiery wheel for eternity. The first human to murder kin.',
    archetype: 'The Second Chance • Entitlement vs Gratitude • The Ethical Lesson',
    inYourChart: 'Your relationship to privilege, gratitude, and ethical boundaries. Where you\'ve been given second chances. The temptation to abuse trust. Learning through consequences.',
    keywords: ['Entitlement vs gratitude', 'Ethical lessons', 'Second chances', 'Abuse of trust', 'Privilege', 'Repetitive patterns'],
    shadow: 'Repeating the same mistake. Entitlement. Betraying those who help you.',
    integration: 'Learn from your second chances. Gratitude prevents the fiery wheel.',
    currentSign: 'Capricorn → Aquarius',
    currentSignNote: 'Ixion moves from Capricorn to Aquarius around 2025 — shifting from authority issues to collective ethics.',
  },
  {
    key: 'varuna',
    symbol: '⯴',
    name: 'Varuna',
    discovery: '2000',
    orbitalPeriod: '283 years',
    mythology: 'Vedic god of the sky, cosmic order, and moral law. The "all-seeing" deity who watches from above and knows all truth and lies. Later became associated with the ocean.',
    archetype: 'The All-Seeing Eye • The Cosmic Judge • The Fame Maker',
    inYourChart: 'Your relationship to fame, reputation, and being seen. Where truth and lies matter. Cosmic law and vast perspective. The eye that sees everything.',
    keywords: ['Cosmic law', 'Vast perspective', 'Truth and lies', 'Fame/infamy', 'Divine order', 'All-seeing awareness'],
    shadow: 'Judging from false moral high ground. Obsession with reputation. Lies catching up.',
    integration: 'Live as if the All-Seeing Eye watches. Your reputation reflects your truth.',
    currentSign: 'Leo',
    currentSignNote: 'Varuna in Leo emphasizes visibility, creative reputation, and authentic self-expression.',
  },
];

export const DwarfPlanetsGuide = () => {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">What Are Dwarf Planets & TNOs?</CardTitle>
          <CardDescription className="text-base">
            Trans-Neptunian Objects (TNOs) orbit beyond Neptune in the Kuiper Belt and scattered disc. 
            These distant bodies have extremely long orbital periods — some taking thousands of years to complete one cycle — 
            making them generational and even civilizational in their influence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Why They Matter</h3>
              <p className="text-sm text-muted-foreground">
                While the traditional planets represent personal and social dynamics, dwarf planets operate at the level of 
                soul purpose, deep ancestral patterns, and collective transformation. They reveal what your soul came here to heal, 
                fight for, and transform across lifetimes.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">How to Use Them</h3>
              <p className="text-sm text-muted-foreground">
                Focus on the house placement to understand where these energies manifest. Aspects to personal planets (Sun, Moon, Mercury, Venus, Mars) 
                make them more personally significant. Conjunctions are especially powerful — that planet becomes infused with the dwarf planet's archetype.
              </p>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <h3 className="font-semibold text-primary mb-2">The Centaurs: Pholus & Nessus</h3>
            <p className="text-sm text-muted-foreground">
              Centaurs are different from TNOs — they orbit between the outer planets (Saturn to Neptune). 
              They act as bridges between personal and transpersonal realms, often representing wounds, catalysts, 
              and healing opportunities that emerge in our lifetime rather than across generations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Individual Planet Guides */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-semibold">The Dwarf Planets & Centaurs</h2>
        
        <Accordion type="single" collapsible className="space-y-2">
          {DWARF_PLANETS.map((planet) => (
            <AccordionItem 
              key={planet.key} 
              value={planet.key}
              className="border rounded-lg px-4 bg-card"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <span className="text-2xl">{planet.symbol}</span>
                  <div>
                    <div className="font-semibold">{planet.name}</div>
                    <div className="text-xs text-muted-foreground">{planet.archetype}</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <div className="space-y-4">
                  {/* Mythology */}
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Mythology</h4>
                    <p className="text-sm">{planet.mythology}</p>
                  </div>

                  {/* Discovery & Orbit */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Discovery</h4>
                      <p className="text-sm">{planet.discovery}</p>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Orbital Period</h4>
                      <p className="text-sm">{planet.orbitalPeriod}</p>
                    </div>
                  </div>

                  {/* Current Sign */}
                  {planet.currentSign && (
                    <div className="p-3 rounded-lg bg-primary/5 border-l-4 border-primary">
                      <h4 className="text-xs uppercase tracking-widest text-primary mb-1">Currently in {planet.currentSign}</h4>
                      <p className="text-sm text-muted-foreground">{planet.currentSignNote}</p>
                    </div>
                  )}

                  {/* In Your Chart */}
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">In Your Chart</h4>
                    <p className="text-sm">{planet.inYourChart}</p>
                  </div>

                  {/* Keywords */}
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {planet.keywords.map((kw, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Shadow & Integration */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <h4 className="text-xs uppercase tracking-widest text-destructive mb-1">Shadow Expression</h4>
                      <p className="text-sm">{planet.shadow}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <h4 className="text-xs uppercase tracking-widest text-green-600 dark:text-green-400 mb-1">Integration</h4>
                      <p className="text-sm">{planet.integration}</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Quick Reference Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Symbol</th>
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-left py-2 px-2">Core Theme</th>
                  <th className="text-left py-2 px-2 hidden md:table-cell">Orbit</th>
                </tr>
              </thead>
              <tbody>
                {DWARF_PLANETS.map((planet) => (
                  <tr key={planet.key} className="border-b border-muted">
                    <td className="py-2 px-2 text-lg">{planet.symbol}</td>
                    <td className="py-2 px-2 font-medium">{planet.name}</td>
                    <td className="py-2 px-2 text-muted-foreground">{planet.keywords[0]}</td>
                    <td className="py-2 px-2 text-muted-foreground hidden md:table-cell">{planet.orbitalPeriod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DwarfPlanetsGuide;
