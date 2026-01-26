import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, TrendingDown, TrendingUp, Zap, Heart, AlertTriangle, User, Skull } from 'lucide-react';
import { RelationshipTransitCalculator, BirthChart } from '@/lib/relationshipTransitCalculator';
import { MonthlyTimeline, TransitEvent, KarmicAnalysis } from '@/types/relationshipTimeline';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RelationshipTimelineProps {
  person1Name: string;
  person2Name: string;
  person1Chart: any;
  person2Chart: any;
  synastryAspects: any[];
}

// Helper to convert natal chart format to BirthChart format
const convertToBirthChart = (chart: any): BirthChart => {
  const planets: { name: string; longitude: number }[] = [];
  
  // Convert each planet position to longitude
  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'North Node', 'Chiron'];
  const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  planetNames.forEach(name => {
    const key = name.toLowerCase().replace(' ', '');
    const planetData = chart[key] || chart[name.toLowerCase()];
    
    if (planetData && planetData.sign !== undefined) {
      const signIndex = signOrder.indexOf(planetData.sign);
      const degree = planetData.degree || 0;
      const minutes = planetData.minutes || 0;
      const longitude = signIndex * 30 + degree + minutes / 60;
      
      planets.push({ name, longitude });
    }
  });
  
  return {
    date: chart.birthDate ? new Date(chart.birthDate) : new Date(),
    latitude: chart.latitude || 0,
    longitude: chart.longitude || 0,
    planets
  };
};

export const RelationshipTimeline: React.FC<RelationshipTimelineProps> = ({
  person1Name,
  person2Name,
  person1Chart,
  person2Chart,
  synastryAspects
}) => {
  const [metDate, setMetDate] = useState('');
  const [startedDatingDate, setStartedDatingDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);

  // Use the earlier of the two dates as the timeline start
  const effectiveStartDate = metDate && startedDatingDate 
    ? (new Date(metDate) < new Date(startedDatingDate) ? metDate : startedDatingDate)
    : metDate || startedDatingDate;

  const { timeline, karmicAnalysis } = useMemo(() => {
    if (!effectiveStartDate || !showTimeline) {
      return { timeline: [], karmicAnalysis: null };
    }

    const chart1 = convertToBirthChart(person1Chart);
    const chart2 = convertToBirthChart(person2Chart);
    
    const generatedTimeline = RelationshipTransitCalculator.generateTimeline(
      chart1,
      chart2,
      person1Name,
      person2Name,
      new Date(effectiveStartDate),
      endDate ? new Date(endDate) : undefined
    );
    
    const synastryAspects = RelationshipTransitCalculator.calculateSynastryAspects(chart1, chart2);
    const karmic = RelationshipTransitCalculator.identifyKarmicPatterns(synastryAspects);
    
    return { timeline: generatedTimeline, karmicAnalysis: karmic };
  }, [effectiveStartDate, endDate, showTimeline, person1Name, person2Name, person1Chart, person2Chart]);

  const handleGenerate = () => {
    if (metDate || startedDatingDate) {
      setShowTimeline(true);
    }
  };

  const getIntensityLabel = (intensity: number): string => {
    if (intensity >= 8) return 'Critical';
    if (intensity >= 6) return 'High';
    if (intensity >= 4) return 'Medium';
    return 'Low';
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity >= 8) return 'bg-red-500';
    if (intensity >= 6) return 'bg-orange-500';
    if (intensity >= 4) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getMonthIntensityIcon = (transits: TransitEvent[]) => {
    if (transits.length === 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    
    const maxIntensity = Math.max(...transits.map(t => t.intensity));
    
    if (maxIntensity >= 8) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (maxIntensity >= 6) return <Zap className="h-4 w-4 text-orange-500" />;
    if (maxIntensity >= 4) return <Heart className="h-4 w-4 text-pink-500" />;
    return <TrendingUp className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Relationship Timeline Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="metDate">When did you meet?</Label>
              <Input
                id="metDate"
                type="date"
                value={metDate}
                onChange={(e) => setMetDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startedDatingDate">When did you start dating?</Label>
              <Input
                id="startedDatingDate"
                type="date"
                value={startedDatingDate}
                onChange={(e) => setStartedDatingDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                When did it end? (optional)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={!metDate && !startedDatingDate} className="w-full">
            Generate Month-by-Month Timeline
          </Button>
          
          {!metDate && !startedDatingDate && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Enter at least one date to see what was happening astrologically each month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Karmic Analysis Card */}
      {showTimeline && karmicAnalysis && (
        <Card className={karmicAnalysis.isKarmic ? 'border-purple-500/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5" />
              Karmic Analysis
              {karmicAnalysis.isKarmic && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  Karmic Bond
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">{karmicAnalysis.description}</p>
            
            {karmicAnalysis.karmicIndicators.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Karmic Indicators:</h4>
                <ul className="space-y-1">
                  {karmicAnalysis.karmicIndicators.map((indicator, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      {indicator}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showTimeline && timeline.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Timeline: {person1Name} & {person2Name}
          </h3>
          
          <Accordion type="single" collapsible className="space-y-2">
            {timeline.map((snapshot, index) => (
              <AccordionItem key={index} value={`month-${index}`} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      {getMonthIntensityIcon(snapshot.transits)}
                      <span className="font-medium">{snapshot.month}</span>
                      <Badge variant="outline">
                        {snapshot.transits.length} transits
                      </Badge>
                    </div>

                    <div className="flex gap-1">
                      {snapshot.transits.slice(0, 3).map((transit, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full ${getIntensityColor(transit.intensity)}`}
                        />
                      ))}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {/* Monthly Summary */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Monthly Overview</h4>
                      <p className="text-sm text-muted-foreground">{snapshot.summary}</p>
                    </div>

                    {/* Person Experiences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{person1Name}'s Experience</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{snapshot.person1Summary}</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{person2Name}'s Experience</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{snapshot.person2Summary}</p>
                      </div>
                    </div>

                    {/* Transit Events */}
                    {snapshot.transits.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Astrological Influences</h4>
                        <div className="space-y-2">
                          {snapshot.transits.map((transit, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${getIntensityColor(transit.intensity)}`} />
                                <span className="text-xs text-muted-foreground">
                                  {getIntensityLabel(transit.intensity)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-medium">
                                    {transit.transitPlanet} {transit.aspectType} {transit.synastryPoint.person1Planet}-{transit.synastryPoint.person2Planet}
                                  </p>
                                  {transit.isKarmic && (
                                    <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                                      Karmic
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{transit.interpretation}</p>
                                
                                {/* Who feels it more */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/50">
                                  <div className="text-xs">
                                    <span className="font-medium text-primary">{person1Name}:</span>{' '}
                                    <span className="text-muted-foreground">{transit.person1Experience}</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="font-medium text-primary">{person2Name}:</span>{' '}
                                    <span className="text-muted-foreground">{transit.person2Experience}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Advice */}
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <h4 className="font-semibold mb-2">Guidance for This Month</h4>
                      <p className="text-sm">{snapshot.advice}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
};
