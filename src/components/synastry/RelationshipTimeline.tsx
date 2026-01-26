import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, TrendingUp, Zap, Heart, AlertTriangle, Flame, User, Skull, Sparkles, Shield, HeartCrack } from 'lucide-react';
import { RelationshipTransitCalculator, BirthChart } from '@/lib/relationshipTransitCalculator';
import { MonthlyTimeline, TransitEvent, KarmicAnalysis } from '@/types/relationshipTimeline';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RelationshipTimelineProps {
  person1Name: string;
  person2Name: string;
  person1Chart: any;
  person2Chart: any;
}

// Helper to convert natal chart format to BirthChart format
const convertToBirthChart = (chart: any): BirthChart => {
  const planets: { name: string; longitude: number }[] = [];
  
  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'NorthNode', 'Chiron'];
  const signOrder = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  // Check if planets are nested under chart.planets (NatalChart format) or directly on chart
  const planetSource = chart.planets || chart;
  
  planetNames.forEach(name => {
    // Try multiple key formats
    const planetData = planetSource[name] || planetSource[name.toLowerCase()] || planetSource[name.replace(' ', '')];
    
    if (planetData && planetData.sign !== undefined && planetData.sign !== '') {
      const signIndex = signOrder.indexOf(planetData.sign);
      if (signIndex === -1) return; // Skip if sign not found
      
      const degree = planetData.degree || 0;
      const minutes = planetData.minutes || 0;
      const longitude = signIndex * 30 + degree + minutes / 60;
      
      // Use display name with space for North Node
      const displayName = name === 'NorthNode' ? 'North Node' : name;
      planets.push({ name: displayName, longitude });
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
  person2Chart
}) => {
  const [metDate, setMetDate] = useState('');
  const [startedDatingDate, setStartedDatingDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);

  // Use the earlier of the two dates as the timeline start
  const effectiveStartDate = metDate && startedDatingDate 
    ? (new Date(metDate) < new Date(startedDatingDate) ? metDate : startedDatingDate)
    : metDate || startedDatingDate;

  // Calculate relationship overview (attraction, challenges, breakup)
  const relationshipOverview = useMemo(() => {
    if (!person1Chart || !person2Chart) return null;
    
    const chart1 = convertToBirthChart(person1Chart);
    const chart2 = convertToBirthChart(person2Chart);
    
    return RelationshipTransitCalculator.analyzeRelationshipOverview(
      chart1,
      chart2,
      person1Name,
      person2Name,
      effectiveStartDate ? new Date(effectiveStartDate) : new Date(),
      endDate ? new Date(endDate) : undefined
    );
  }, [person1Chart, person2Chart, person1Name, person2Name, effectiveStartDate, endDate]);

  // Calculate karmic analysis
  const karmicAnalysis = useMemo(() => {
    if (!person1Chart || !person2Chart) return null;
    
    const chart1 = convertToBirthChart(person1Chart);
    const chart2 = convertToBirthChart(person2Chart);
    
    const synastryAspects = RelationshipTransitCalculator.calculateSynastryAspects(chart1, chart2);
    
    return RelationshipTransitCalculator.identifyKarmicPatterns(synastryAspects);
  }, [person1Chart, person2Chart]);

  // Generate timeline
  const timeline = useMemo(() => {
    if (!effectiveStartDate || !showTimeline || !person1Chart || !person2Chart) return [];

    const chart1 = convertToBirthChart(person1Chart);
    const chart2 = convertToBirthChart(person2Chart);

    return RelationshipTransitCalculator.generateTimeline(
      chart1,
      chart2,
      person1Name,
      person2Name,
      new Date(effectiveStartDate),
      endDate ? new Date(endDate) : undefined
    );
  }, [effectiveStartDate, endDate, showTimeline, person1Name, person2Name, person1Chart, person2Chart]);

  const handleGenerate = () => {
    if (metDate || startedDatingDate) {
      setShowTimeline(true);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 8) return 'bg-destructive';
    if (intensity >= 6) return 'bg-orange-500';
    if (intensity >= 4) return 'bg-yellow-500';
    return 'bg-primary/50';
  };

  const getIntensityIcon = (intensity: number) => {
    if (intensity >= 8) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (intensity >= 6) return <Zap className="h-4 w-4 text-orange-500" />;
    if (intensity >= 4) return <Heart className="h-4 w-4 text-pink-500" />;
    return <TrendingUp className="h-4 w-4 text-primary" />;
  };

  return (
    <div className="space-y-6">
      {/* Relationship Overview - Always show if charts exist */}
      {relationshipOverview && (
        <>
          {/* The Attraction */}
          <Card className="border-pink-500/30 bg-pink-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-400">
                <Sparkles className="h-5 w-5" />
                Why You're Attracted to Each Other
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{relationshipOverview.attraction.magneticPull}</p>
              <p className="text-sm text-muted-foreground">{relationshipOverview.attraction.coreAttraction}</p>
              
              {relationshipOverview.attraction.chemistryFactors.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chemistry Factors</h4>
                  <ul className="space-y-1">
                    {relationshipOverview.attraction.chemistryFactors.map((factor, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <Heart className="h-3 w-3 text-pink-400 mt-0.5 shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* The Core Challenge */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Shield className="h-5 w-5" />
                The Relationship's Core Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{relationshipOverview.challenge.coreChallenge}</p>
              <p className="text-sm text-muted-foreground italic">{relationshipOverview.challenge.growthEdge}</p>
              
              {relationshipOverview.challenge.warningSignals.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Watch For</h4>
                  <ul className="space-y-1">
                    {relationshipOverview.challenge.warningSignals.slice(0, 3).map((signal, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* What Caused the Breakup - Only if endDate provided */}
          {relationshipOverview.breakup && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <HeartCrack className="h-5 w-5" />
                  What Caused the Breakup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed font-medium">{relationshipOverview.breakup.primaryCause}</p>
                <p className="text-sm text-muted-foreground">{relationshipOverview.breakup.buildUp}</p>
                <p className="text-sm text-muted-foreground italic">{relationshipOverview.breakup.finalStraw}</p>
                
                {relationshipOverview.breakup.triggerTransits.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trigger Transits</h4>
                    <ul className="space-y-1">
                      {relationshipOverview.breakup.triggerTransits.slice(0, 5).map((transit, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <Zap className="h-3 w-3 text-destructive mt-0.5 shrink-0" />
                          {transit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Karmic Analysis Card */}
      {karmicAnalysis && (
        <Card className={karmicAnalysis.isKarmic ? 'border-purple-500/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {karmicAnalysis.isKarmic && <Flame className="h-5 w-5 text-purple-500" />}
              Karmic Connection Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{karmicAnalysis.description}</p>
            
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

      {/* Timeline Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Relationship Timeline & Transits
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
            Generate Month-by-Month Transit Analysis
          </Button>
          
          <p className="text-sm text-muted-foreground mt-3 text-center">
            See exactly what transits hit your synastry aspects each month, who felt what, and why things happened when they did.
          </p>
        </CardContent>
      </Card>

      {/* Timeline Results */}
      {showTimeline && timeline.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {person1Name} & {person2Name} Timeline
            </h3>
            <Badge variant="outline">
              {timeline.length} {timeline.length === 1 ? 'month' : 'months'}
            </Badge>
          </div>
          
          <Accordion type="single" collapsible className="space-y-2">
            {timeline.map((monthData, index) => (
              <AccordionItem key={index} value={`month-${index}`} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      {monthData.month}
                      {monthData.transits.length > 0 && getIntensityIcon(monthData.transits[0].intensity)}
                    </div>
                    <div className="flex gap-1">
                      {monthData.transits.slice(0, 5).map((transit, i) => (
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
                      <p className="text-sm">{monthData.summary}</p>
                    </div>

                    {/* Person Experiences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{person1Name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{monthData.person1Summary}</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{person2Name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{monthData.person2Summary}</p>
                      </div>
                    </div>

                    {/* Transit Details */}
                    {monthData.transits.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold">Transit Details</h4>
                        {monthData.transits.map((transit, i) => (
                          <div key={i} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${getIntensityColor(transit.intensity)}`} />
                                  <span className="font-medium text-sm">
                                    {transit.transitPlanet} {transit.aspectType}
                                  </span>
                                  {transit.isKarmic && (
                                    <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                                      <Skull className="h-3 w-3 mr-1" />
                                      Karmic
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{transit.interpretation}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Intensity: {transit.intensity}/10
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-border/50">
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-primary">
                                  {person1Name}'s Experience:
                                </span>
                                <p className="text-xs text-muted-foreground">{transit.person1Experience}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-primary">
                                  {person2Name}'s Experience:
                                </span>
                                <p className="text-xs text-muted-foreground">{transit.person2Experience}</p>
                              </div>
                            </div>

                            {transit.whoFeelsItMore !== 'both' && (
                              <p className="text-xs text-muted-foreground italic pt-2 border-t border-border/50">
                                {transit.whoFeelsItMore === 'person1' ? person1Name : person2Name} feels this transit more intensely.
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Advice */}
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Guidance for This Month</span>
                      </div>
                      <p className="text-sm">{monthData.advice}</p>
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
