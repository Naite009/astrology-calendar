import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, ArrowRight, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { 
  calculateSecondaryProgressions, 
  getProgressedMoonInfo, 
  findProgressedAspects,
  getProgressedPlanetSymbol,
  formatSignChangeDate,
  SecondaryProgressions,
  ProgressedMoonInfo,
  ProgressedAspect
} from '@/lib/secondaryProgressions';
import {
  calculateSolarArcChart,
  findSolarArcAspects,
  getExactSolarArcAspects,
  getUpcomingSolarArcAspects,
  getSolarArcPlanetSymbol,
  SolarArcChart,
  SolarArcAspect
} from '@/lib/solarArcDirections';
import { getSaturnReturnContext } from '@/lib/houseInterpretations';

interface ProgressionsDisplayProps {
  natalChart: NatalChart;
  age: number;
}

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
};

export const ProgressionsDisplay: React.FC<ProgressionsDisplayProps> = ({
  natalChart,
  age
}) => {
  // Calculate current date from age and birthDate
  const currentDate = useMemo(() => {
    if (!natalChart?.birthDate) return new Date();
    const [year, month, day] = natalChart.birthDate.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const targetDate = new Date(birthDate);
    targetDate.setFullYear(birthDate.getFullYear() + age);
    return targetDate;
  }, [natalChart?.birthDate, age]);

  // Secondary Progressions
  const progressions = useMemo(() => {
    if (!natalChart) return null;
    return calculateSecondaryProgressions(natalChart, currentDate);
  }, [natalChart, currentDate]);

  const progressedMoonInfo = useMemo(() => {
    if (!progressions || !natalChart) return null;
    return getProgressedMoonInfo(progressions, natalChart);
  }, [progressions, natalChart]);

  const progressedAspects = useMemo(() => {
    if (!progressions || !natalChart) return [];
    return findProgressedAspects(progressions, natalChart);
  }, [progressions, natalChart]);

  // Solar Arc Directions
  const solarArcChart = useMemo(() => {
    if (!natalChart) return null;
    return calculateSolarArcChart(natalChart, currentDate);
  }, [natalChart, currentDate]);

  const solarArcAspects = useMemo(() => {
    if (!solarArcChart || !natalChart) return [];
    return findSolarArcAspects(solarArcChart, natalChart);
  }, [solarArcChart, natalChart]);

  const exactSolarArcAspects = useMemo(() => 
    getExactSolarArcAspects(solarArcAspects), [solarArcAspects]);
    
  const upcomingSolarArcAspects = useMemo(() => 
    getUpcomingSolarArcAspects(solarArcAspects), [solarArcAspects]);

  // Saturn Return context
  const saturnContext = useMemo(() => getSaturnReturnContext(age), [age]);

  if (!progressions && !solarArcChart) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Unable to calculate progressions. Check birth data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Saturn Return Alert */}
      {saturnContext && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-600">
              <AlertCircle size={16} />
              {saturnContext.phase}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{saturnContext.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Progressed Moon — THE MOST IMPORTANT */}
      {progressedMoonInfo && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Moon size={16} className="text-primary" />
              Progressed Moon — Your Emotional Weather
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl">{SIGN_SYMBOLS[progressedMoonInfo.sign]}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {progressedMoonInfo.degree}° {progressedMoonInfo.sign}
                </div>
              </div>
              
              <div className="flex-1">
                <Badge variant={progressedMoonInfo.phase === 'Waxing' ? 'default' : 'secondary'}>
                  {progressedMoonInfo.phase} Phase
                </Badge>
                <p className="text-sm mt-2">{progressedMoonInfo.phaseDescription}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Current Theme: {progressedMoonInfo.signMeaning?.theme}
              </h4>
              <p className="text-sm">{progressedMoonInfo.signMeaning?.focus}</p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {progressedMoonInfo.signMeaning?.keywords.map((kw, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>

            {progressedMoonInfo.house && progressedMoonInfo.houseMeaning && (
              <>
                <Separator />
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Activating House {progressedMoonInfo.house}: {progressedMoonInfo.houseMeaning.short}
                  </h4>
                  <p className="text-sm">{progressedMoonInfo.houseMeaning.themes}</p>
                </div>
              </>
            )}

            <div className="bg-secondary/30 p-3 rounded-md flex items-center gap-3">
              <Clock size={16} className="text-muted-foreground" />
              <div className="text-xs">
                <span className="text-muted-foreground">Sign change in ~{progressedMoonInfo.monthsUntilSignChange} months</span>
                <span className="mx-2">→</span>
                <span>{SIGN_SYMBOLS[progressedMoonInfo.nextSign]} {progressedMoonInfo.nextSign}</span>
                <span className="text-muted-foreground ml-2">({formatSignChangeDate(progressedMoonInfo.signChangeDate)})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Secondary Progressed Aspects */}
      {progressedAspects.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sun size={16} />
              Progressed Aspects to Natal — Inner Maturation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              Secondary progressions show inner psychological development — how you're maturing internally.
            </p>
            <div className="space-y-3">
              {progressedAspects.slice(0, 6).map((aspect, i) => (
                <div key={i} className="border rounded-md p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getProgressedPlanetSymbol(aspect.progressedPlanet)}</span>
                    <span className="text-sm font-medium">{aspect.aspectSymbol}</span>
                    <span className="text-lg">{getProgressedPlanetSymbol(aspect.natalPlanet)}</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      {aspect.orb.toFixed(2)}° orb
                    </Badge>
                  </div>
                  <p className="text-sm">{aspect.interpretation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solar Arc Directions */}
      {solarArcChart && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles size={16} />
              Solar Arc Directions — Life Events Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/30 p-3 rounded-md">
              <p className="text-xs text-muted-foreground">
                Solar Arc = <strong>{solarArcChart.solarArc.toFixed(2)}°</strong> (age {solarArcChart.ageYears} years, {solarArcChart.ageMonths} months)
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Solar Arc aspects time major external life events — when natal potential manifests in the world.
              </p>
            </div>

            {/* Exact aspects — MAJOR EVENTS */}
            {exactSolarArcAspects.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-red-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  EXACT NOW — Major Life Events
                </h4>
                <div className="space-y-3">
                  {exactSolarArcAspects.map((aspect, i) => (
                    <div key={i} className="border-2 border-red-500/30 bg-red-500/5 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getSolarArcPlanetSymbol(aspect.solarArcPlanet)}</span>
                        <ArrowRight size={12} className="text-muted-foreground" />
                        <span className="text-lg">{getSolarArcPlanetSymbol(aspect.natalPlanet)}</span>
                        <span className="text-sm font-medium ml-1">{aspect.aspectSymbol}</span>
                        <Badge variant="destructive" className="text-xs ml-auto">
                          EXACT ({aspect.orb.toFixed(2)}°)
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{aspect.interpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming aspects */}
            {upcomingSolarArcAspects.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-amber-500 uppercase tracking-wide mb-2">
                  Coming in 1-3 Years
                </h4>
                <div className="space-y-2">
                  {upcomingSolarArcAspects.slice(0, 5).map((aspect, i) => (
                    <div key={i} className="border border-amber-500/30 rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{getSolarArcPlanetSymbol(aspect.solarArcPlanet)}</span>
                        <span className="text-sm">{aspect.aspectSymbol}</span>
                        <span>{getSolarArcPlanetSymbol(aspect.natalPlanet)}</span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          ~{aspect.yearsUntilExact.toFixed(1)} years
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{aspect.interpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other active aspects */}
            {solarArcAspects.filter(a => a.orb >= 0.5 && a.yearsUntilExact > 3).length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Background Themes (orb 0.5-1°)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {solarArcAspects
                    .filter(a => a.orb >= 0.5 && a.orb <= 1)
                    .slice(0, 8)
                    .map((aspect, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {aspect.solarArcPlanet} {aspect.aspectSymbol} {aspect.natalPlanet}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progressed Planet Positions */}
      {progressions && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progressed Planet Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(progressions.planets).map(([name, data]) => (
                <div key={name} className="text-center p-2 border rounded-md">
                  <div className="text-lg">{getProgressedPlanetSymbol(name)}</div>
                  <div className="text-xs font-medium">{name}</div>
                  <div className="text-xs text-muted-foreground">
                    {SIGN_SYMBOLS[data.sign]} {data.degree.toFixed(0)}° {data.sign}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
