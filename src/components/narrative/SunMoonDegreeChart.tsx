import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NatalChart } from '@/hooks/useNatalChart';
import { getKalderaArchetype, PHASE_CHAPTER_TITLES, MoonArchetype } from '@/data/moonPhaseSignArchetypes';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const PHASES: { name: string; min: number; max: number; emoji: string }[] = [
  { name: 'New Moon', min: 0, max: 45, emoji: '🌑' },
  { name: 'Waxing Crescent', min: 45, max: 90, emoji: '🌒' },
  { name: 'First Quarter', min: 90, max: 135, emoji: '🌓' },
  { name: 'Waxing Gibbous', min: 135, max: 180, emoji: '🌔' },
  { name: 'Full Moon', min: 180, max: 225, emoji: '🌕' },
  { name: 'Waning Gibbous', min: 225, max: 270, emoji: '🌖' },
  { name: 'Last Quarter', min: 270, max: 315, emoji: '🌗' },
  { name: 'Balsamic', min: 315, max: 360, emoji: '🌘' },
];

function getPhaseForDegree(deg: number): typeof PHASES[number] {
  for (const p of PHASES) {
    if (deg >= p.min && deg < p.max) return p;
  }
  return PHASES[PHASES.length - 1];
}

function getSeparation(sunSign: string, moonSign: string): number {
  const sunIdx = SIGNS.indexOf(sunSign);
  const moonIdx = SIGNS.indexOf(moonSign);
  // Using midpoint of each sign (15°) for the grid
  const sunAbs = sunIdx * 30 + 15;
  const moonAbs = moonIdx * 30 + 15;
  let sep = moonAbs - sunAbs;
  if (sep < 0) sep += 360;
  return sep;
}

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export function SunMoonDegreeChart({ userNatalChart, savedCharts }: Props) {
  const [selectedCell, setSelectedCell] = useState<{ sunSign: string; moonSign: string; deg: number; phase: typeof PHASES[number] } | null>(null);
  const [archetypeModal, setArchetypeModal] = useState<{ archetype: MoonArchetype; phase: string; sign: string } | null>(null);

  // Find user's exact position
  const userPosition = useMemo(() => {
    const chart = userNatalChart;
    if (!chart) return null;
    const sun = chart.planets.Sun;
    const moon = chart.planets.Moon;
    if (!sun || !moon) return null;
    const sunAbs = SIGNS.indexOf(sun.sign) * 30 + sun.degree + (sun.minutes || 0) / 60;
    const moonAbs = SIGNS.indexOf(moon.sign) * 30 + moon.degree + (moon.minutes || 0) / 60;
    let sep = moonAbs - sunAbs;
    if (sep < 0) sep += 360;
    return { sunSign: sun.sign, moonSign: moon.sign, separation: Math.round(sep * 10) / 10, phase: getPhaseForDegree(sep) };
  }, [userNatalChart]);

  // Saved chart positions
  const chartPositions = useMemo(() => {
    return savedCharts.map(c => {
      const sun = c.planets.Sun;
      const moon = c.planets.Moon;
      if (!sun || !moon) return null;
      const sunAbs = SIGNS.indexOf(sun.sign) * 30 + sun.degree + (sun.minutes || 0) / 60;
      const moonAbs = SIGNS.indexOf(moon.sign) * 30 + moon.degree + (moon.minutes || 0) / 60;
      let sep = moonAbs - sunAbs;
      if (sep < 0) sep += 360;
      return { name: c.name, sunSign: sun.sign, moonSign: moon.sign, separation: Math.round(sep * 10) / 10, phase: getPhaseForDegree(sep) };
    }).filter(Boolean) as { name: string; sunSign: string; moonSign: string; separation: number; phase: typeof PHASES[number] }[];
  }, [savedCharts]);

  const handleCellClick = (sunSign: string, moonSign: string) => {
    const deg = getSeparation(sunSign, moonSign);
    const phase = getPhaseForDegree(deg);
    setSelectedCell({ sunSign, moonSign, deg, phase });

    // Look up archetype for moon sign + phase
    const archetype = getKalderaArchetype(phase.name, moonSign);
    if (archetype) {
      setArchetypeModal({ archetype, phase: phase.name, sign: moonSign });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">☉–☽ Phase Degree Chart</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Find where your Sun sign (left) meets your Moon sign (top) to see the approximate Sun–Moon separation in degrees.
          Each cell is color-coded by lunar phase. Tap any cell to see the Kaldera archetype for that combination.
        </p>
        {userPosition && (
          <p className="text-sm text-primary mt-2">
            Your exact Sun–Moon separation: <span className="font-mono font-semibold">{userPosition.separation}°</span> — {userPosition.phase.emoji} {userPosition.phase.name}
          </p>
        )}
      </div>

      {/* Phase legend */}
      <div className="flex flex-wrap gap-2">
        {PHASES.map(p => (
          <Badge key={p.name} variant="outline" className="text-[10px] gap-1">
            <span>{p.emoji}</span> {p.name} ({p.min}°–{p.max}°)
          </Badge>
        ))}
      </div>

      {/* The grid */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="min-w-[700px]">
          {/* Header row: Moon signs */}
          <div className="grid gap-0.5" style={{ gridTemplateColumns: '52px repeat(12, 1fr)' }}>
            <div className="flex items-center justify-center text-[9px] text-muted-foreground font-medium">
              ☉ ↓ / ☽ →
            </div>
            {SIGNS.map(sign => (
              <div key={sign} className="flex items-center justify-center text-center p-1">
                <span className="text-base" title={sign}>{GLYPHS[sign]}</span>
              </div>
            ))}
          </div>

          {/* Data rows: one per Sun sign */}
          {SIGNS.map(sunSign => (
            <div key={sunSign} className="grid gap-0.5" style={{ gridTemplateColumns: '52px repeat(12, 1fr)' }}>
              <div className="flex items-center justify-center text-base" title={sunSign}>
                {GLYPHS[sunSign]}
              </div>
              {SIGNS.map(moonSign => {
                const deg = getSeparation(sunSign, moonSign);
                const phase = getPhaseForDegree(deg);
                const isUser = userPosition && userPosition.sunSign === sunSign && userPosition.moonSign === moonSign;
                const savedHere = chartPositions.filter(c => c.sunSign === sunSign && c.moonSign === moonSign);

                // Phase-based background colors using semantic tokens
                const phaseColors: Record<string, string> = {
                  'New Moon': 'bg-foreground/10',
                  'Waxing Crescent': 'bg-primary/10',
                  'First Quarter': 'bg-primary/20',
                  'Waxing Gibbous': 'bg-primary/30',
                  'Full Moon': 'bg-accent/40',
                  'Waning Gibbous': 'bg-accent/30',
                  'Last Quarter': 'bg-accent/20',
                  'Balsamic': 'bg-foreground/5',
                };

                return (
                  <div
                    key={moonSign}
                    onClick={() => handleCellClick(sunSign, moonSign)}
                    className={`
                      flex flex-col items-center justify-center p-1 rounded-sm cursor-pointer transition-all
                      ${phaseColors[phase.name] || 'bg-muted/20'}
                      ${isUser ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                      hover:ring-1 hover:ring-primary/50
                    `}
                    title={`☉ ${sunSign} / ☽ ${moonSign} — ${deg}° ${phase.name}`}
                  >
                    <span className="text-[10px] font-mono text-foreground leading-none">{deg}°</span>
                    <span className="text-[8px] text-muted-foreground leading-none mt-0.5">{phase.emoji}</span>
                    {isUser && <span className="text-[7px] text-primary font-bold">YOU</span>}
                    {savedHere.length > 0 && !isUser && (
                      <span className="text-[7px] text-muted-foreground">★</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected cell info */}
      {selectedCell && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedCell.phase.emoji}</span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  ☉ {GLYPHS[selectedCell.sunSign]} {selectedCell.sunSign} / ☽ {GLYPHS[selectedCell.moonSign]} {selectedCell.moonSign}
                </p>
                <p className="text-sm text-muted-foreground">
                  Separation: <span className="font-mono text-foreground">{selectedCell.deg}°</span> — <span className="text-foreground">{selectedCell.phase.name}</span>
                </p>
                {archetypeModal && (
                  <p className="text-xs text-primary mt-1">
                    Archetype: <span className="font-serif font-semibold">{archetypeModal.archetype.name}</span> — tap for deep dive →
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Archetype detail modal */}
      {archetypeModal && (
        <Dialog open={!!archetypeModal} onOpenChange={() => setArchetypeModal(null)}>
          <DialogContent className="max-w-lg max-h-[85vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <span className="text-2xl">{PHASES.find(p => p.name === archetypeModal.phase)?.emoji || '🌙'}</span>
                <span className="font-serif">{archetypeModal.archetype.name}</span>
              </DialogTitle>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="outline" className="text-[10px]">{archetypeModal.phase}</Badge>
                <Badge variant="secondary" className="text-[10px]">{GLYPHS[archetypeModal.sign]} {archetypeModal.sign}</Badge>
                {PHASE_CHAPTER_TITLES[archetypeModal.phase] && (
                  <span className="text-[10px] text-muted-foreground italic">"{PHASE_CHAPTER_TITLES[archetypeModal.phase]}"</span>
                )}
              </div>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <p className="text-sm font-medium italic text-primary/80">{archetypeModal.archetype.essence}</p>
                {archetypeModal.archetype.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-foreground">{para}</p>
                ))}
                {archetypeModal.archetype.coreWound && (
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">💔 CORE WOUND</p>
                    <p className="text-sm text-foreground leading-relaxed">{archetypeModal.archetype.coreWound}</p>
                  </div>
                )}
                {archetypeModal.archetype.healingPath && (
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">🌿 HEALING PATH</p>
                    <p className="text-sm text-foreground leading-relaxed">{archetypeModal.archetype.healingPath}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">✦ GIFTS</p>
                    <ul className="space-y-1">
                      {archetypeModal.archetype.gifts.map((g, i) => (
                        <li key={i} className="text-xs text-foreground">• {g}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">⚠ CHALLENGES</p>
                    <ul className="space-y-1">
                      {archetypeModal.archetype.challenges.map((c, i) => (
                        <li key={i} className="text-xs text-foreground">• {c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                {archetypeModal.archetype.sacredPurpose && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-medium text-muted-foreground mb-1">🌟 SACRED PURPOSE</p>
                    <p className="text-sm text-foreground leading-relaxed">{archetypeModal.archetype.sacredPurpose}</p>
                  </div>
                )}
                {archetypeModal.archetype.affirmation && (
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                    <p className="text-base font-serif italic text-foreground">"{archetypeModal.archetype.affirmation}"</p>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground italic">— Raven Kaldera, Moon Phase Astrology</p>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
