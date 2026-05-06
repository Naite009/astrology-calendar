/**
 * Today at a Glance — fast, scannable summary of what's actually different today.
 *
 * 100% deterministic. Reads only from dayData and astronomy-engine helpers.
 * No AI / fetch / edge-function calls. Slow planets like Pluto only appear in the
 * collapsed "All planet positions" section (they're constants, not "news").
 */

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DayData, getDayType, getPlanetSymbol } from '@/lib/astrology';
import { NatalChart } from '@/hooks/useNatalChart';
import { TransitAspect, getTransitPlanetSymbol, getTopTransitAspects, describeDailyMotion } from '@/lib/transitAspects';
import { findNextMoonSignChange, formatVOCRange } from '@/lib/voidOfCourseMoon';
import {
  getAllRetrogradePeriods,
  getRetrogradeStatus,
  formatRetrogradeDateWithTime,
} from '@/lib/retrogradePatterns';

interface Props {
  dayData: DayData;
  transitAspects: TransitAspect[];
  activeChart: NatalChart | null | undefined;
}

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍',
  quincunx: '⚻', semisextile: '⚺',
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) +
  ' ' +
  (new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || 'ET');

export const TodayAtAGlance = ({ dayData, transitAspects, activeChart }: Props) => {
  const { date, planets, moonPhase, aspects, exactLunarPhase, majorIngresses, voc } = dayData;
  const [showAllPositions, setShowAllPositions] = useState(false);

  const dayType = useMemo(() => getDayType(aspects || [], moonPhase), [aspects, moonPhase]);

  // Moon sign change today (if any)
  const moonSignChange = useMemo(() => {
    try {
      const change = findNextMoonSignChange(date);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      if (change.time >= dayStart && change.time <= dayEnd) {
        return { fromSign: planets.moon.signName, toSign: change.newSign, time: change.time };
      }
      return null;
    } catch {
      return null;
    }
  }, [date, planets.moon.signName]);

  // Retrograde stations happening today + currently-active retrogrades
  const retrogradeInfo = useMemo(() => {
    try {
      const all = getAllRetrogradePeriods(date);
      const stationsToday: { planet: string; type: 'Retrograde' | 'Direct' }[] = [];
      const active: { planet: string; sign: string; stationDirect: string }[] = [];
      const dayKey = date.toISOString().slice(0, 10);

      for (const [planet, periods] of Object.entries(all)) {
        for (const p of periods as Array<{ start: Date; end: Date; sign: string }>) {
          if (p.start.toISOString().slice(0, 10) === dayKey) {
            stationsToday.push({ planet, type: 'Retrograde' });
          }
          if (p.end.toISOString().slice(0, 10) === dayKey) {
            stationsToday.push({ planet, type: 'Direct' });
          }
        }
        const status = getRetrogradeStatus(date, periods);
        if (status.isRetrograde && status.retrogradeInfo) {
          active.push({
            planet,
            sign: status.retrogradeInfo.sign,
            stationDirect: formatRetrogradeDateWithTime(status.retrogradeInfo.end),
          });
        }
      }
      return { stationsToday, active };
    } catch {
      return { stationsToday: [], active: [] };
    }
  }, [date]);

  // Top 5 personal transits — re-prioritized so karmic bodies (Lilith, Chiron, Node)
  // hitting personal points (Sun, Moon, Asc, MC) surface alongside outer-planet transits.
  const topTransits = getTopTransitAspects(transitAspects, 5);

  // Planet list for the collapsed "Sky right now"
  const planetRows = useMemo(() => {
    const rows: { glyph: string; name: string; full: string }[] = [];
    const order: Array<[string, keyof typeof planets]> = [
      ['Sun', 'sun'], ['Moon', 'moon'], ['Mercury', 'mercury'], ['Venus', 'venus'],
      ['Mars', 'mars'], ['Jupiter', 'jupiter'], ['Saturn', 'saturn'],
      ['Uranus', 'uranus'], ['Neptune', 'neptune'], ['Pluto', 'pluto'],
    ];
    for (const [name, key] of order) {
      const p = planets[key] as { fullDegree?: string };
      if (p?.fullDegree) {
        rows.push({ glyph: getPlanetSymbol(name.toLowerCase()), name, full: p.fullDegree });
      }
    }
    if (planets.northNode) rows.push({ glyph: '☊', name: 'North Node', full: planets.northNode.fullDegree });
    if (planets.chiron) rows.push({ glyph: '⚷', name: 'Chiron', full: planets.chiron.fullDegree });
    if (planets.lilith) rows.push({ glyph: '⚸', name: 'Lilith', full: planets.lilith.fullDegree });
    return rows;
  }, [planets]);

  // Build "what's actually changing" rows
  const changes: Array<{ icon: string; label: string; detail?: string }> = [];

  if (exactLunarPhase) {
    changes.push({
      icon: exactLunarPhase.emoji,
      label: `${exactLunarPhase.type} in ${exactLunarPhase.sign}`,
      detail: `Exact at ${formatTime(exactLunarPhase.time)}${exactLunarPhase.isSupermoon ? ' · Supermoon' : ''}`,
    });
  }

  for (const ing of majorIngresses) {
    changes.push({
      icon: '→',
      label: `${ing.planet} enters ${ing.sign}`,
      detail: ing.entryTime || undefined,
    });
  }

  if (moonSignChange) {
    changes.push({
      icon: '☽',
      label: `Moon enters ${moonSignChange.toSign}`,
      detail: `at ${formatTime(moonSignChange.time)} (from ${moonSignChange.fromSign})`,
    });
  }

  if (voc.isVOC && voc.start && voc.end) {
    changes.push({
      icon: '◌',
      label: 'Void-of-Course Moon',
      detail: `${formatVOCRange(voc.start, voc.end, date)} · avoid starting anything new`,
    });
  }

  for (const s of retrogradeInfo.stationsToday) {
    changes.push({
      icon: '⟲',
      label: `${s.planet} stations ${s.type}`,
      detail: s.type === 'Retrograde' ? 'review begins' : 'forward motion resumes',
    });
  }

  // Currently-retrograde planets (one-line summary, no walls of text)
  const activeRxLine = retrogradeInfo.active.length > 0
    ? retrogradeInfo.active.map(r => `${r.planet} Rx in ${r.sign}`).join(' · ')
    : null;

  return (
    <div className="space-y-6">
      {/* Headline strip */}
      <div className="rounded-sm border border-border bg-secondary/40 p-4">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Today</div>
        <div className="text-base text-foreground leading-relaxed">
          <span className="font-medium">Moon in {planets.moon.signName}</span>
          <span className="text-muted-foreground"> · </span>
          <span>{moonPhase.phaseIcon} {moonPhase.phaseName}</span>
          <span className="text-muted-foreground"> · </span>
          <span>{dayType.emoji} {dayType.label}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{dayType.description}</p>
      </div>

      {/* Color band (compact) */}
      {dayData.dayColors && (
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <span
              className="inline-block h-4 w-4 rounded-full border border-border"
              style={{ backgroundColor: dayData.dayColors.primary }}
              aria-hidden
            />
            {dayData.dayColors.secondary && (
              <span
                className="inline-block h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: dayData.dayColors.secondary }}
                aria-hidden
              />
            )}
          </div>
          <span className="text-xs text-muted-foreground">{dayData.dayColors.label}</span>
        </div>
      )}

      {/* What's changing today */}
      <div>
        <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
          What's changing today
        </h3>
        {changes.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No major sign changes, lunations, ingresses, voids, or stations today. The sky is steady.
          </p>
        ) : (
          <ul className="space-y-2">
            {changes.map((c, i) => (
              <li key={i} className="flex items-start gap-3 rounded-sm bg-secondary/30 px-3 py-2">
                <span className="text-lg leading-none mt-0.5 w-6 text-center">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{c.label}</div>
                  {c.detail && <div className="text-xs text-muted-foreground">{c.detail}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
        {activeRxLine && (
          <p className="text-[11px] text-muted-foreground mt-2 italic">
            Currently retrograde: {activeRxLine}
          </p>
        )}
      </div>

      {/* Top 3 personal transits */}
      {activeChart && (
        <div>
          <h3 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            Your top transits today {activeChart.name ? `· ${activeChart.name}` : ''}
          </h3>
          {topTransits.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No tight personal transits today (within 5° orb).
            </p>
          ) : (
            <ul className="space-y-2">
              {topTransits.map((t, i) => (
                <li key={i} className="rounded-sm border border-border bg-card px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {getTransitPlanetSymbol(t.transitPlanet)} {t.transitPlanet}{' '}
                      {ASPECT_GLYPH[t.aspect] || ''} natal {t.natalPlanet}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t.orb}°{t.isExact ? ' · exact' : ''}
                    </span>
                    {!t.isExact && (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          t.applying
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                        }`}
                        title={t.feltSenseDuration || ''}
                      >
                        {t.applying ? '↗ applying' : '↘ separating'}
                      </span>
                    )}
                    {(() => {
                      const m = describeDailyMotion(t.transitPlanet);
                      return m ? (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground font-mono"
                          title={`${m.pace} — ${m.note}`}
                        >
                          {m.speed} · {m.pace}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  {t.feltSenseDuration && (
                    <p className="text-[11px] text-muted-foreground mt-1 italic">
                      {t.feltSenseDuration}
                    </p>
                  )}
                  {(() => {
                    const m = describeDailyMotion(t.transitPlanet);
                    return m ? (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {t.transitPlanet} moves {m.speed} ({m.pace}) — {m.note}
                      </p>
                    ) : null;
                  })()}
                  {t.interpretation && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {t.interpretation}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          {transitAspects.length > topTransits.length && (
            <p className="text-[10px] text-muted-foreground mt-2">
              +{transitAspects.length - topTransits.length} more in Full Detail
            </p>
          )}
        </div>
      )}

      {/* Sky right now — collapsed */}
      <Collapsible open={showAllPositions} onOpenChange={setShowAllPositions}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 rounded-sm bg-muted/40 hover:bg-muted/60 transition-colors">
          <span className="text-sm font-medium flex-1 text-left">All planet positions</span>
          <span className="text-[10px] text-muted-foreground">
            {showAllPositions ? 'hide' : 'show'} slow planets
          </span>
          {showAllPositions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {planetRows.map((p, i) => (
              <li key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-secondary/20 text-sm">
                <span className="w-5 text-center text-muted-foreground">{p.glyph}</span>
                <span className="font-medium text-foreground w-24">{p.name}</span>
                <span className="text-muted-foreground">{p.full}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-muted-foreground mt-2 italic">
            Positions calculated with astronomy-engine. No AI.
          </p>
        </CollapsibleContent>
      </Collapsible>

      <p className="text-[10px] text-muted-foreground italic text-center pt-2">
        Need the deep dive? Switch to <span className="font-medium">Full Detail</span> above.
      </p>
    </div>
  );
};
