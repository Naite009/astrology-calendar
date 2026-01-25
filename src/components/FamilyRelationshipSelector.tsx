/**
 * FamilyRelationshipSelector Component
 * 
 * Detailed selector for family relationship types that captures:
 * - Relationship category (parent-child, siblings, etc.)
 * - Direction (who is who)
 * - Contextual information for accurate interpretations
 */

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Users, Info, ArrowRight, Heart, Scale, Sparkles } from 'lucide-react';
import {
  FamilyRelationType,
  FamilyRelationshipContext,
  FAMILY_RELATIONSHIP_OPTIONS,
  buildFamilyContext,
  getFamilyQuestionFrameworks
} from '@/lib/familyRelationshipTypes';

interface FamilyRelationshipSelectorProps {
  userName: string;
  otherPersonName: string;
  onContextChange: (context: FamilyRelationshipContext | null) => void;
  initialRelationType?: FamilyRelationType;
}

export const FamilyRelationshipSelector = ({
  userName,
  otherPersonName,
  onContextChange,
  initialRelationType
}: FamilyRelationshipSelectorProps) => {
  const [relationType, setRelationType] = useState<FamilyRelationType | ''>(initialRelationType || '');
  const [context, setContext] = useState<FamilyRelationshipContext | null>(null);

  // Build context when relationship type changes
  useEffect(() => {
    if (relationType) {
      const newContext = buildFamilyContext(relationType, userName, otherPersonName);
      setContext(newContext);
      onContextChange(newContext);
    } else {
      setContext(null);
      onContextChange(null);
    }
  }, [relationType, userName, otherPersonName, onContextChange]);

  const questionFrameworks = context ? getFamilyQuestionFrameworks(context) : null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="text-primary" size={20} />
          Define Your Family Relationship
        </CardTitle>
        <CardDescription>
          The specific relationship type changes how we interpret everything
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Relationship Type Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">What is your relationship to {otherPersonName}?</Label>
          <Select
            value={relationType}
            onValueChange={(value) => setRelationType(value as FamilyRelationType)}
          >
            <SelectTrigger className="w-full bg-card">
              <SelectValue placeholder="Select your relationship type..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50 max-h-[300px]">
              {FAMILY_RELATIONSHIP_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Context Display */}
        {context && (
          <div className="space-y-4 pt-2">
            {/* Relationship Summary */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{context.relationshipLabel}</span>
                <div className="flex gap-1">
                  {context.isBloodRelated ? (
                    <Badge variant="secondary" className="text-xs">Blood Family</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Chosen Family</Badge>
                  )}
                  {context.hasAuthorityDynamic && (
                    <Badge variant="outline" className="text-xs">Authority Dynamic</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{context.userLabel}</span>
                <ArrowRight size={14} />
                <span className="font-medium">{context.otherLabel}</span>
              </div>
              {context.generationGap > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {context.generationGap === 1 ? 'One generation apart' : 
                   context.generationGap === 2 ? 'Two generations apart' : 
                   `${context.generationGap} generations apart`}
                </p>
              )}
            </div>

            {/* Question Frameworks Preview */}
            {questionFrameworks && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Info size={14} className="text-primary" />
                  <span>How this changes the analysis:</span>
                </div>

                <div className="grid gap-2">
                  <div className="p-2 rounded bg-secondary/30 border text-sm">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Scale size={12} />
                      <span>Dynamics Question</span>
                    </div>
                    <p className="text-foreground">{questionFrameworks.dynamicsQuestion}</p>
                  </div>

                  <div className="p-2 rounded bg-secondary/30 border text-sm">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Sparkles size={12} />
                      <span>Learning Focus</span>
                    </div>
                    <p className="text-foreground">{questionFrameworks.learningQuestion}</p>
                  </div>

                  <div className="p-2 rounded bg-secondary/30 border text-sm">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Heart size={12} />
                      <span>Karmic Context</span>
                    </div>
                    <p className="text-foreground text-xs">{questionFrameworks.karmicContext}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Why This Matters */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs">
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Why this matters:</p>
              <ul className="space-y-1 text-amber-700 dark:text-amber-300">
                <li>• "<strong>{context.otherLabel}</strong>'s Pluto squares <strong>your</strong> Moon" is interpreted differently than the reverse</li>
                <li>• {context.hasAuthorityDynamic 
                  ? 'Authority dynamics (parent/child) have specific power patterns'
                  : 'Peer dynamics (siblings/cousins) have equality and rivalry patterns'}
                </li>
                <li>• {context.isBloodRelated 
                  ? 'Blood family carries inherited/genetic patterns across generations'
                  : 'Chosen family creates new patterns rather than continuing inherited ones'}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Prompt to select */}
        {!context && (
          <div className="p-4 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
            <Users className="mx-auto mb-2 opacity-50" size={24} />
            <p>Select your relationship type above for accurate family astrology interpretations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyRelationshipSelector;
