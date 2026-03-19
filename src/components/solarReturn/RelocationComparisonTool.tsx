/**
 * Side-by-side SR chart comparison for different locations.
 * Compares house cusps, angular planets, and planet house placements.
 */

import { useMemo, useState } from 'react';
import { MapPin, ArrowRight, ArrowLeftRight, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { analyzeSolarReturn, SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

const ZODIAC_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const SIGN_SYMBOLS: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂',
  Jupiter:'♃', Saturn:'♄', Uranus:'♅', Neptune:'♆', Pluto:'♇',
  Ascendant:'ASC', NorthNode:'☊', Chiron:'⚷',
};

const CORE_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron'];

interface Props {
  srCharts: SolarReturnChart[];
  natalChart: NatalChart;
  currentSR: SolarReturnChart;
  currentAnalysis: SolarReturnAnalysis;
}

interface ComparisonRow {
  planet: string;
  sign: string;           // same for both
  houseA: number | null;
  houseB: number | null;
  shifted: boolean;
}

export const RelocationComparisonTool = ({ srCharts, natalChart, currentSR, currentAnalysis }: Props) => {
  // Find other SR charts for the same year
  const sameYearCharts = useMemo(() => {
    return srCharts.filter(sr => sr.solarReturnYear === currentSR.solarReturnYear && sr.id !== currentSR.id);
  }, [srCharts, currentSR]);

  const [compareId, setCompareId] = useState<string | null>(null);
  const compareSR = sameYearCharts.find(sr => sr.id === compareId) || null;

  const compareAnalysis = useMemo(() => {
    if (!compareSR) return null;
    return analyzeSolarReturn(compareSR, natalChart);
  }, [compareSR, natalChart]);

  const comparison = useMemo(() => {
    if (!compareAnalysis) return null;

    // Compare house placements for each planet
    const rows: ComparisonRow[] = CORE_PLANETS.map(planet => {
      const houseA = currentAnalysis.planetSRHouses[planet] ?? null;
      const houseB = compareAnalysis.planetSRHouses[planet] ?? null;
      const overlay = currentAnalysis.houseOverlays.find(h => h.planet === planet);
      return {
        planet,
        sign: overlay?.srSign || '',
        houseA,
        houseB,
        shifted: houseA !== houseB && houseA !== null && houseB !== null,
      };
    });

    // ASC comparison
    const ascA = currentAnalysis.yearlyTheme?.ascendantSign || '';
    const ascB = compareAnalysis.yearlyTheme?.ascendantSign || '';

    // Angular planets comparison
    const angularA = currentAnalysis.angularPlanets;
    const angularB = compareAnalysis.angularPlanets;

    // Benefits on angles
    const beneficsOnAnglesA = angularA.filter(p => ['Jupiter','Venus'].includes(p));
    const beneficsOnAnglesB = angularB.filter(p => ['Jupiter','Venus'].includes(p));
    const maleficsOnAnglesA = angularA.filter(p => ['Saturn','Pluto','Mars'].includes(p));
    const maleficsOnAnglesB = angularB.filter(p => ['Saturn','Pluto','Mars'].includes(p));

    // Sun house comparison
    const sunHouseA = currentAnalysis.sunHouse.house;
    const sunHouseB = compareAnalysis.sunHouse.house;

    // Moon house comparison
    const moonHouseA = currentAnalysis.moonHouse.house;
    const moonHouseB = compareAnalysis.moonHouse.house;

    return {
      rows,
      ascA, ascB,
      angularA, angularB,
      beneficsOnAnglesA, beneficsOnAnglesB,
      maleficsOnAnglesA, maleficsOnAnglesB,
      sunHouseA, sunHouseB,
      moonHouseA, moonHouseB,
      locationA: currentSR.solarReturnLocation || natalChart.birthLocation || 'Birth Location',
      locationB: compareSR!.solarReturnLocation || natalChart.birthLocation || 'Birth Location',
    };
  }, [currentAnalysis, compareAnalysis, currentSR, compareSR, natalChart]);

  if (sameYearCharts.length === 0) {
    return (
      <div className="border border-dashed border-primary/30 rounded-sm p-5 bg-card/50 text-center space-y-3">
        <ArrowLeftRight size={24} className="mx-auto text-primary/50" />
        <h4 className="text-sm font-medium text-foreground">Compare Locations</h4>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Add another SR chart for <strong>{currentSR.solarReturnYear}</strong> with a different location 
          to see a side-by-side comparison of how the house placements, angular planets, and year themes change.
        </p>
        <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
          Same planets, different houses → different year
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Picker */}
      <div className="border border-primary/20 rounded-sm p-4 bg-card">
        <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          Compare SR {currentSR.solarReturnYear} Locations
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-primary" />
            <span className="font-medium text-foreground">{currentSR.solarReturnLocation || natalChart.birthLocation || 'Birth'}</span>
          </div>
          <ArrowLeftRight size={14} className="text-muted-foreground" />
          <select
            value={compareId || ''}
            onChange={e => setCompareId(e.target.value || null)}
            className="border border-border bg-background text-foreground rounded-sm px-3 py-1.5 text-sm"
          >
            <option value="">Select location to compare…</option>
            {sameYearCharts.map(sr => (
              <option key={sr.id} value={sr.id}>
                {sr.solarReturnLocation || natalChart.birthLocation || 'Birth Location'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison results */}
      {comparison && (
        <div className="space-y-4">
          {/* Headline comparison */}
          <div className="grid grid-cols-2 gap-3">
            <LocationCard
              label={comparison.locationA}
              ascSign={comparison.ascA}
              sunHouse={comparison.sunHouseA}
              moonHouse={comparison.moonHouseA}
              beneficsOnAngles={comparison.beneficsOnAnglesA}
              maleficsOnAngles={comparison.maleficsOnAnglesA}
              angularPlanets={comparison.angularA}
              variant="current"
            />
            <LocationCard
              label={comparison.locationB}
              ascSign={comparison.ascB}
              sunHouse={comparison.sunHouseB}
              moonHouse={comparison.moonHouseB}
              beneficsOnAngles={comparison.beneficsOnAnglesB}
              maleficsOnAngles={comparison.maleficsOnAnglesB}
              angularPlanets={comparison.angularB}
              variant="compare"
            />
          </div>

          {/* Key differences callout */}
          <div className="border border-primary/20 rounded-sm p-4 bg-primary/5 space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-medium">Key Differences</h4>
            {comparison.ascA !== comparison.ascB && (
              <p className="text-sm text-foreground">
                <strong>Ascendant shifts</strong> from {SIGN_SYMBOLS[comparison.ascA]} {comparison.ascA} → {SIGN_SYMBOLS[comparison.ascB]} {comparison.ascB} — the entire year's tone and approach changes.
              </p>
            )}
            {comparison.sunHouseA !== comparison.sunHouseB && (
              <p className="text-sm text-foreground">
                <strong>Sun moves</strong> from House {comparison.sunHouseA} → House {comparison.sunHouseB} — your vitality and identity focus shifts to a different life area.
              </p>
            )}
            {comparison.moonHouseA !== comparison.moonHouseB && (
              <p className="text-sm text-foreground">
                <strong>Moon moves</strong> from House {comparison.moonHouseA} → House {comparison.moonHouseB} — your emotional needs and comfort zone change.
              </p>
            )}
            {comparison.beneficsOnAnglesB.length > comparison.beneficsOnAnglesA.length && (
              <p className="text-sm text-accent-foreground flex items-center gap-1">
                <CheckCircle size={14} className="text-green-500" />
                {comparison.locationB} places more benefics (Jupiter/Venus) on angles — generally favorable.
              </p>
            )}
            {comparison.maleficsOnAnglesB.length > comparison.maleficsOnAnglesA.length && (
              <p className="text-sm text-foreground flex items-center gap-1">
                <AlertTriangle size={14} className="text-amber-500" />
                {comparison.locationB} places more challenging planets on angles — expect deeper transformation.
              </p>
            )}
          </div>

          {/* Planet-by-planet table */}
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="grid grid-cols-4 bg-secondary px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Planet</span>
              <span>Sign</span>
              <span>{comparison.locationA.split(',')[0]}</span>
              <span>{comparison.locationB.split(',')[0]}</span>
            </div>
            {comparison.rows.map(row => (
              <div
                key={row.planet}
                className={`grid grid-cols-4 px-3 py-2 text-sm border-t border-border ${
                  row.shifted ? 'bg-primary/5' : ''
                }`}
              >
                <span className="font-medium text-foreground">
                  {PLANET_SYMBOLS[row.planet] || ''} {row.planet}
                </span>
                <span className="text-muted-foreground">
                  {SIGN_SYMBOLS[row.sign] || ''} {row.sign}
                </span>
                <span className="text-foreground">
                  H{row.houseA ?? '?'}
                </span>
                <span className={row.shifted ? 'text-primary font-medium' : 'text-foreground'}>
                  H{row.houseB ?? '?'}
                  {row.shifted && <span className="text-[10px] ml-1 text-primary">↻</span>}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground/60 text-center uppercase tracking-widest">
            Signs stay the same — only houses change with location
          </p>
        </div>
      )}
    </div>
  );
};

// Sub-component for each location's summary card
const LocationCard = ({ label, ascSign, sunHouse, moonHouse, beneficsOnAngles, maleficsOnAngles, angularPlanets, variant }: {
  label: string;
  ascSign: string;
  sunHouse: number | null;
  moonHouse: number | null;
  beneficsOnAngles: string[];
  maleficsOnAngles: string[];
  angularPlanets: string[];
  variant: 'current' | 'compare';
}) => (
  <div className={`border rounded-sm p-4 space-y-2 ${
    variant === 'current' ? 'border-primary/30 bg-card' : 'border-accent/30 bg-card'
  }`}>
    <div className="flex items-center gap-2">
      <MapPin size={14} className={variant === 'current' ? 'text-primary' : 'text-accent-foreground'} />
      <h5 className="text-xs font-medium text-foreground truncate">{label}</h5>
    </div>
    <div className="space-y-1 text-xs text-muted-foreground">
      <p>ASC: <strong className="text-foreground">{SIGN_SYMBOLS[ascSign]} {ascSign}</strong></p>
      <p>☉ Sun: <strong className="text-foreground">House {sunHouse ?? '?'}</strong></p>
      <p>☽ Moon: <strong className="text-foreground">House {moonHouse ?? '?'}</strong></p>
    </div>
    {angularPlanets.length > 0 && (
      <div className="pt-1 border-t border-border/50">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">On Angles</p>
        <div className="flex flex-wrap gap-1">
          {angularPlanets.map(p => (
            <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded-sm ${
              ['Jupiter','Venus'].includes(p) ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
              ['Saturn','Pluto','Mars'].includes(p) ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
              'bg-secondary text-foreground'
            }`}>
              {PLANET_SYMBOLS[p] || ''} {p}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);
