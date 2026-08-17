/**
 * Vedic (Jyotish) tab.
 *
 * Sidereal chart, nakshatra and pada, Vimshottari dasha timeline, and the
 * divisional charts read for purpose, past-life themes, money, career and
 * partnership. Every section pairs a chart-logic box with one felt-sense
 * paragraph. Calculations are deterministic, no AI math.
 */

import { useMemo, useRef, useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { ChartSelector } from '@/components/ChartSelector';
import { SectionExportButtons } from '@/components/SectionExportButtons';
import { buildVedicChart, formatDegree } from '@/lib/vedic/siderealChart';
import { buildVedicReading } from '@/lib/vedic/vedicReadings';
import { formatAyanamsa } from '@/lib/vedic/ayanamsa';
import { VedicSectionCard } from './VedicSectionCard';
import { DashaTimeline } from './DashaTimeline';
import { VargaGrid } from './VargaGrid';
import { PlacementDeepDiveCard } from './PlacementDeepDive';
import { buildPlacementDeepDives, findComboHits } from '@/lib/vedic/placementDeepDive';

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

const STORAGE_KEY = 'vedic-selected-chart';

export const VedicView = ({ userNatalChart, savedCharts }: Props) => {
  const [selectedId, setSelectedId] = useState<string>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return userNatalChart?.id || savedCharts[0]?.id || '';
  });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    try { sessionStorage.setItem(STORAGE_KEY, id); } catch { /* storage full, non-critical */ }
  };

  const allCharts = useMemo(
    () => [...(userNatalChart ? [userNatalChart] : []), ...savedCharts],
    [userNatalChart, savedCharts]
  );

  const activeChart = useMemo(
    () => allCharts.find(c => c.id === selectedId) || userNatalChart || allCharts[0] || null,
    [allCharts, selectedId, userNatalChart]
  );

  const reading = useMemo(() => {
    if (!activeChart) return null;
    try {
      const vedic = buildVedicChart(activeChart);
      return vedic ? buildVedicReading(vedic) : null;
    } catch (e) {
      console.error('[Vedic] failed to build reading', e);
      return null;
    }
  }, [activeChart]);

  const deepDive = useMemo(() => {
    if (!reading) return null;
    try {
      return {
        dives: buildPlacementDeepDives(reading.chart),
        combos: findComboHits(reading.chart),
      };
    } catch (e) {
      console.error('[Vedic] deep dive failed', e);
      return null;
    }
  }, [reading]);

  const containerRef = useRef<HTMLDivElement>(null);

  const jsonData = useMemo(() => {
    if (!reading) return null;
    const { chart, sections, karakas, current, vargas } = reading;
    return {
      person: {
        name: chart.name,
        birthDate: chart.birthDate,
        birthTime: chart.birthTime,
        birthLocation: chart.birthLocation,
      },
      system: {
        zodiac: 'sidereal',
        ayanamsa: `Lahiri ${formatAyanamsa(chart.ayanamsa)}`,
        houses: 'whole sign',
      },
      lagna: chart.lagnaSign
        ? { sign: chart.lagnaSign, degree: formatDegree(chart.lagnaDegree || 0), lord: chart.lagnaLord, nakshatra: chart.lagnaNakshatra?.name, pada: chart.lagnaNakshatra?.pada }
        : null,
      bodies: chart.bodies.map(b => ({
        name: b.name,
        sign: b.sign,
        degree: formatDegree(b.degree),
        house: b.house,
        nakshatra: b.nakshatra.name,
        pada: b.nakshatra.pada,
        nakshatraLord: b.nakshatra.lord,
        dignity: b.dignity,
        retrograde: b.retrograde,
        westernSign: b.tropicalSign,
      })),
      karakas,
      currentDasha: current
        ? {
            mahadasha: current.maha.lord,
            mahadashaStart: current.maha.start.toISOString(),
            mahadashaEnd: current.maha.end.toISOString(),
            antardasha: current.antar?.subLord || null,
            antardashaEnd: current.antar?.end.toISOString() || null,
          }
        : null,
      divisionalCharts: Object.fromEntries(
        Object.entries(vargas).map(([k, v]) => [k, { reads: v.reads, lagna: v.lagnaSign, placements: v.placements }])
      ),
      sections: sections.map(s => ({ title: s.title, chartLogic: s.logic, reading: s.paragraph })),
      placementDeepDive: buildPlacementDeepDives(chart),
      signatureCombinations: findComboHits(chart),
    };
  }, [reading]);

  if (!activeChart) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sparkles className="mb-4 text-muted-foreground" size={44} />
        <h2 className="mb-2 font-serif text-xl">No chart yet</h2>
        <p className="text-muted-foreground">Add a natal chart in the Chart Library to read it in the Vedic system.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl">Vedic Astrology</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sidereal chart, nakshatra, dasha timeline and the divisional charts for purpose, money, career and partnership
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ChartSelector
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartId={selectedId}
            onSelect={handleSelect}
            label="Reading for:"
          />
          {jsonData && (
            <SectionExportButtons
              filename={`${activeChart.name} Vedic Reading`}
              jsonData={jsonData}
              targetRef={containerRef}
            />
          )}
        </div>
      </div>

      {!reading && (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          This chart does not have enough planet data yet to build a Vedic reading. Add the Sun, Moon and the five visible
          planets in the Chart Library and it will fill in.
        </div>
      )}

      {reading && (
        <div ref={containerRef} className="space-y-6">
          {/* System note */}
          <div className="flex flex-wrap items-start gap-2 rounded-md border border-border bg-secondary/25 p-3 text-[12px] text-muted-foreground">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>
              Sidereal zodiac, Lahiri ayanamsa {formatAyanamsa(reading.chart.ayanamsa)}, whole-sign houses.
              {!reading.chart.lagnaSign && ' No rising sign is available for this chart, so house-based material is limited until a birth time is added.'}
              {' '}Sanskrit terms are kept visible on purpose, with the plain reading directly underneath each one.
            </span>
          </div>

          {reading.sections.slice(0, 2).map(s => (
            <VedicSectionCard key={s.id} section={s} />
          ))}

          {deepDive && deepDive.dives.length > 0 && (
            <PlacementDeepDiveCard dives={deepDive.dives} combos={deepDive.combos} name={reading.chart.name} />
          )}

          <DashaTimeline periods={reading.dashas} current={reading.current} birthMoment={reading.chart.birthMoment} />

          {reading.sections.slice(2).map(s => (
            <VedicSectionCard key={s.id} section={s} />
          ))}

          {/* Divisional charts reference */}
          <div className="rounded-lg border border-border bg-card p-5 md:p-6">
            <h3 className="font-serif text-xl">Your Divisional Charts</h3>
            <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              The vargas behind the readings above
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {(['D9', 'D10', 'D12', 'D2', 'D7'] as const).map(k => (
                <VargaGrid key={k} varga={reading.vargas[k]} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VedicView;
