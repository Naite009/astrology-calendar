import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, TrendingDown, TrendingUp, Zap, Heart, AlertTriangle, User } from 'lucide-react';
import { RelationshipTimelineCalculator } from '@/lib/relationshipTimelineCalculator';
import { RelationshipTimelineConfig, MonthlySnapshot } from '@/types/relationshipTimeline';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RelationshipTimelineProps {
  person1Name: string;
  person2Name: string;
  person1Chart: any;
  person2Chart: any;
  synastryAspects: any[];
}

export const RelationshipTimeline: React.FC<RelationshipTimelineProps> = ({
  person1Name,
  person2Name,
  person1Chart,
  person2Chart,
  synastryAspects
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);

  const timeline = useMemo(() => {
    if (!startDate || !showTimeline) return [];

    const config: RelationshipTimelineConfig = {
      person1Name,
      person2Name,
      person1Chart,
      person2Chart,
      relationshipStartDate: new Date(startDate),
      relationshipEndDate: endDate ? new Date(endDate) : undefined,
      synastryAspects
    };

    const calculator = new RelationshipTimelineCalculator(config);
    return calculator.generateTimeline();
  }, [startDate, endDate, showTimeline, person1Name, person2Name, person1Chart, person2Chart, synastryAspects]);

  const handleGenerate = () => {
    if (startDate) {
      setShowTimeline(true);
    }
  };

  const getEmotionalWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'calm': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'passionate': return <Heart className="h-4 w-4 text-pink-500" />;
      case 'tense': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'transformative': return <Zap className="h-4 w-4 text-purple-500" />;
      case 'difficult': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">When did you meet/start dating?</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                When did it end? (optional - leave blank if ongoing)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={!startDate} className="w-full">
            Generate Month-by-Month Timeline
          </Button>
          
          {!startDate && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Enter the relationship start date to see what was happening astrologically each month
            </p>
          )}
        </CardContent>
      </Card>

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
                      {getEmotionalWeatherIcon(snapshot.emotionalWeather)}
                      <span className="font-medium">{snapshot.month}</span>
                      <Badge variant="outline">{snapshot.phase.phaseName}</Badge>
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
                    {/* Phase Information */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Relationship Phase</h4>
                      <p className="text-sm text-muted-foreground">{snapshot.phase.description}</p>
                      <p className="text-sm mt-2">
                        <span className="font-medium">Overall Energy:</span> {snapshot.phase.overallEnergy}
                      </p>
                    </div>

                    {/* Person Experiences */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{person1Name}'s Experience</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{snapshot.person1Feelings}</p>
                      </div>
                      
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-medium">{person2Name}'s Experience</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{snapshot.person2Feelings}</p>
                      </div>
                    </div>

                    {/* Major Transits */}
                    {snapshot.transits.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Astrological Influences</h4>
                        <div className="space-y-2">
                          {snapshot.transits.map((transit, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                              <span className={`w-2 h-2 rounded-full mt-2 ${getIntensityColor(transit.intensity)}`} />
                              <div>
                                <p className="text-sm font-medium">
                                  {transit.transitingPlanet} {transit.transitAspect} {transit.natalPoint}
                                </p>
                                <p className="text-xs text-muted-foreground">{transit.interpretation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Events */}
                    {snapshot.keyEvents.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Key Dates</h4>
                        <ul className="space-y-1">
                          {snapshot.keyEvents.map((event, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              {event}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Best/Worst Days */}
                    {(snapshot.bestDays.length > 0 || snapshot.worstDays.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {snapshot.bestDays.length > 0 && (
                          <div className="bg-green-500/10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="font-medium text-sm">Best Days</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {snapshot.bestDays.map((date, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {date.toLocaleDateString()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {snapshot.worstDays.length > 0 && (
                          <div className="bg-red-500/10 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <span className="font-medium text-sm">Challenging Days</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {snapshot.worstDays.map((date, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {date.toLocaleDateString()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Advice */}
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <h4 className="font-semibold mb-2">Guidance for This Month</h4>
                      <p className="text-sm">{snapshot.phase.advice}</p>
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
