import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, Target, Hexagon } from 'lucide-react';
import { SignalsData, PlanetHouseInfo } from '@/lib/narrativeAnalysisEngine';
import type { ReadingType } from '../GroundedNarrativeView';

interface Props {
  readingType: ReadingType;
  signals?: SignalsData | null;
  hdChart?: any;
}

const HOUSE_LIFE_AREAS: Record<number, string> = {
  1: 'Identity & Self', 2: 'Resources & Values', 3: 'Communication',
  4: 'Home & Roots', 5: 'Creativity & Romance', 6: 'Health & Service',
  7: 'Relationships', 8: 'Transformation', 9: 'Expansion & Learning',
  10: 'Career & Legacy', 11: 'Community & Vision', 12: 'Spirituality & Healing',
};

function computeAstroThemes(signals: SignalsData) {
  const strengths: { label: string; detail: string }[] = [];
  const growth: { label: string; detail: string }[] = [];

  // Strengths from angular planets
  if (signals.angularPlanets.length >= 2) {
    strengths.push({ label: 'Visible Impact', detail: `${signals.angularPlanets.join(', ')} in angular positions — your presence is naturally felt` });
  }

  // Dominant element as strength
  const elStrengths: Record<string, string> = {
    Fire: 'Initiative & Courage — you naturally start things and inspire others',
    Earth: 'Reliability & Manifestation — you ground ideas into tangible results',
    Air: 'Connection & Ideas — you think broadly and communicate effectively',
    Water: 'Emotional Intelligence — you sense what others miss',
  };
  strengths.push({ label: `${signals.dominantElement} Dominant`, detail: elStrengths[signals.dominantElement] || '' });

  // Trines/sextiles as strengths
  const softAspects = signals.natalAspects.filter(a => a.type === 'trine' || a.type === 'sextile').sort((a, b) => a.orb - b.orb);
  if (softAspects.length > 0) {
    const top = softAspects[0];
    strengths.push({ label: `${top.planet1}–${top.planet2} Flow`, detail: `Natural ${top.type} (${top.orb}°) — these energies cooperate effortlessly` });
  }

  // Growth edges from pressure points
  for (const pp of signals.pressurePointsRanked.slice(0, 3)) {
    growth.push({ label: pp.description, detail: pp.details });
  }

  // Missing elements as growth
  for (const el of signals.absenceSignals.missingElements) {
    growth.push({ label: `No ${el}`, detail: `Developing ${el} qualities requires conscious effort` });
  }

  // Dominant life area from house emphasis
  const houseCounts: Record<number, number> = {};
  for (const ph of signals.planetHouses) {
    houseCounts[ph.house] = (houseCounts[ph.house] || 0) + 1;
  }
  const topHouse = Object.entries(houseCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
  const dominantArea = topHouse ? HOUSE_LIFE_AREAS[Number(topHouse[0])] || 'Unknown' : 'Balanced';

  return { strengths: strengths.slice(0, 3), growth: growth.slice(0, 3), dominantArea, topHouseNum: topHouse ? Number(topHouse[0]) : 0 };
}

// HD circuit classification
const INDIVIDUAL_CHANNELS = ['1-8', '2-14', '3-60', '10-20', '12-22', '23-43', '28-38', '34-57', '39-55', '51-25', '61-24'];
const TRIBAL_CHANNELS = ['5-15', '6-59', '19-49', '21-45', '26-44', '27-50', '32-54', '37-40', '40-37', '54-32'];
const COLLECTIVE_CHANNELS = ['4-63', '7-31', '9-52', '11-56', '13-33', '16-48', '17-62', '18-58', '29-46', '35-36', '41-30', '42-53', '47-64'];

function getCircuitEmphasis(channels: string[]): { individual: number; tribal: number; collective: number } {
  let individual = 0, tribal = 0, collective = 0;
  for (const ch of channels) {
    if (INDIVIDUAL_CHANNELS.includes(ch)) individual++;
    else if (TRIBAL_CHANNELS.includes(ch)) tribal++;
    else if (COLLECTIVE_CHANNELS.includes(ch)) collective++;
  }
  return { individual, tribal, collective };
}

export function ThemesTab({ readingType, signals, hdChart }: Props) {
  const showAstro = (readingType === 'astrology' || readingType === 'combined') && signals;
  const showHd = (readingType === 'human_design' || readingType === 'combined') && hdChart;

  const astroThemes = showAstro ? computeAstroThemes(signals!) : null;
  const circuits = showHd && hdChart.definedChannels ? getCircuitEmphasis(hdChart.definedChannels) : null;
  const totalCircuits = circuits ? circuits.individual + circuits.tribal + circuits.collective : 0;

  if (!showAstro && !showHd) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>Generate a reading to see your themes.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        {/* Strengths */}
        {astroThemes && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Top Strengths & Gifts</h3>
            </div>
            <div className="space-y-2">
              {astroThemes.strengths.map((s, i) => (
                <div key={i} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Edges */}
        {astroThemes && astroThemes.growth.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="font-medium">Growth Edges</h3>
            </div>
            <div className="space-y-2">
              {astroThemes.growth.map((g, i) => (
                <div key={i} className="p-3 rounded-lg bg-accent/50 border border-accent">
                  <p className="text-sm font-medium">{g.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{g.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dominant Life Area */}
        {astroThemes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Dominant Life Area</h3>
            </div>
            <div className="p-3 rounded-lg bg-muted/40">
              <p className="text-sm font-medium">{astroThemes.dominantArea}</p>
              <p className="text-xs text-muted-foreground mt-1">
                House {astroThemes.topHouseNum} has the most planets — this is where your chart concentrates energy.
              </p>
            </div>
          </div>
        )}

        {/* HD Circuit Emphasis */}
        {circuits && totalCircuits > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hexagon className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Circuit Group Emphasis</h3>
            </div>
            <p className="text-xs text-muted-foreground">Your channels belong to these circuit groups, shaping how you interact with the world.</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Individual', count: circuits.individual, desc: 'Empowerment, mutation, unique expression' },
                { label: 'Tribal', count: circuits.tribal, desc: 'Support, resources, family bonds' },
                { label: 'Collective', count: circuits.collective, desc: 'Sharing, logic, abstract patterns' },
              ].map(c => (
                <div key={c.label} className={`p-3 rounded-lg border text-center ${c.count > 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-border'}`}>
                  <p className="text-lg font-semibold">{c.count}</p>
                  <p className="text-xs font-medium">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{c.desc}</p>
                </div>
              ))}
            </div>
            {circuits.individual > circuits.tribal && circuits.individual > circuits.collective && (
              <p className="text-xs text-muted-foreground italic">You're wired for individual expression — you bring mutation and empowerment through being uniquely yourself.</p>
            )}
            {circuits.tribal > circuits.individual && circuits.tribal > circuits.collective && (
              <p className="text-xs text-muted-foreground italic">You're wired for tribal support — your gifts flow through close relationships, family, and material security.</p>
            )}
            {circuits.collective > circuits.individual && circuits.collective > circuits.tribal && (
              <p className="text-xs text-muted-foreground italic">You're wired for collective sharing — you're here to contribute patterns and logic that benefit the whole.</p>
            )}
          </div>
        )}

        {/* HD Not-Self Themes */}
        {showHd && hdChart.type && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="font-medium">Not-Self Indicators</h3>
            </div>
            <div className="p-3 rounded-lg bg-accent/50 border border-accent">
              <p className="text-sm font-medium">
                {hdChart.type === 'Generator' || hdChart.type === 'Manifesting Generator' ? 'Frustration' :
                 hdChart.type === 'Projector' ? 'Bitterness' :
                 hdChart.type === 'Manifestor' ? 'Anger' :
                 hdChart.type === 'Reflector' ? 'Disappointment' : 'Not-Self'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {hdChart.type === 'Generator' && 'When you initiate instead of waiting to respond, you feel stuck and frustrated. This signals you\'re off track.'}
                {hdChart.type === 'Manifesting Generator' && 'Frustration arises when you skip your sacral response or try to be linear. Trust your multi-passionate process.'}
                {hdChart.type === 'Projector' && 'Bitterness comes from giving your gifts without being invited or recognized. Wait for correct invitations.'}
                {hdChart.type === 'Manifestor' && 'Anger builds when you feel controlled or when others don\'t respect your autonomy. Inform before acting.'}
                {hdChart.type === 'Reflector' && 'Disappointment signals you\'re in the wrong environment. Give yourself a full lunar cycle before major decisions.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
