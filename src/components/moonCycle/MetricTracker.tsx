import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface MetricTrackerProps {
  energy: number | null;
  stress: number | null;
  sleepQuality: number | null;
  sensitivity: number | null;
  dreamIntensity: number | null;
  tags: string[];
  journalText: string;
  lifeAreas?: string[];
  onMetricChange: (field: string, value: number) => void;
  onTagsChange: (tags: string[]) => void;
  onJournalTextChange: (text: string) => void;
  onLifeAreasChange?: (areas: string[]) => void;
}

const BODY_METRICS = [
  { key: "energy", dbField: "energy", label: "Energy", emoji: "⚡", low: "Depleted", high: "Alive" },
  { key: "stress", dbField: "stress", label: "Stress", emoji: "🫁", low: "Calm", high: "Activated" },
  { key: "sleepQuality", dbField: "sleep_quality", label: "Sleep", emoji: "😴", low: "Restless", high: "Deep" },
  { key: "sensitivity", dbField: "body_sensitivity", label: "Sensitivity", emoji: "🌊", low: "Grounded", high: "Porous" },
  { key: "dreamIntensity", dbField: "dream_intensity", label: "Dream Intensity", emoji: "🌙", low: "None", high: "Vivid" },
];

const WORKSHOP_TAGS = [
  "anxiety",
  "exhaustion",
  "clarity",
  "conflict",
  "breakthrough",
  "withdrawal",
  "dream",
  "intuition",
  "overwhelm",
  "rest",
  "surprise",
  "release",
  "decision pressure",
  "alignment",
  "misalignment",
  "grief",
  "recovery",
  "forgiveness",
  "creative flow",
  "boundary issue",
  "synchronicity",
  "crying release",
];

const LIFE_AREAS = [
  { key: "body", label: "Body", emoji: "🧘" },
  { key: "work", label: "Work", emoji: "💼" },
  { key: "communication", label: "Communication", emoji: "💬" },
  { key: "home", label: "Home", emoji: "🏠" },
  { key: "children", label: "Children", emoji: "👶" },
  { key: "creativity", label: "Creativity", emoji: "🎨" },
  { key: "partnership", label: "Partnership", emoji: "💕" },
  { key: "money", label: "Money", emoji: "💰" },
  { key: "health", label: "Health", emoji: "🩺" },
  { key: "travel", label: "Travel", emoji: "✈️" },
  { key: "spirituality", label: "Spirituality", emoji: "🙏" },
  { key: "career", label: "Career", emoji: "⭐" },
];

export const MetricTracker = ({
  energy,
  stress,
  sleepQuality,
  sensitivity,
  dreamIntensity,
  tags,
  journalText,
  lifeAreas = [],
  onMetricChange,
  onTagsChange,
  onJournalTextChange,
  onLifeAreasChange,
}: MetricTrackerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const values: Record<string, number | null> = {
    energy,
    stress,
    sleepQuality,
    sensitivity,
    dreamIntensity,
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
    }
  };

  const toggleLifeArea = (area: string) => {
    if (!onLifeAreasChange) return;
    if (lifeAreas.includes(area)) {
      onLifeAreasChange(lifeAreas.filter((a) => a !== area));
    } else {
      onLifeAreasChange([...lifeAreas, area]);
    }
  };

  const trackedCount = Object.values(values).filter((v) => v != null).length;

  return (
    <Card className="bg-secondary/20 border-border/50">
      <CardContent className="p-4 space-y-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            🧘 Body State + Experience
            {trackedCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {trackedCount}/5
              </Badge>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
        </button>

        {isExpanded && (
          <div className="space-y-6 pt-2">
            {/* Body State Sliders */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">How is your body?</p>
              {BODY_METRICS.map((m) => (
                <div key={m.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>
                      {m.emoji} {m.label}
                    </span>
                    <span className="text-muted-foreground">
                      {values[m.key] != null ? `${values[m.key]}/10` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground w-14 text-right">
                      {m.low}
                    </span>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[values[m.key] ?? 5]}
                      onValueChange={([v]) => onMetricChange(m.dbField, v)}
                      className="flex-1"
                    />
                    <span className="text-[10px] text-muted-foreground w-14">
                      {m.high}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Life Areas Activated */}
            {onLifeAreasChange && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Life areas activated</p>
                <div className="flex flex-wrap gap-1.5">
                  {LIFE_AREAS.map((area) => (
                    <button
                      key={area.key}
                      onClick={() => toggleLifeArea(area.key)}
                      className={`rounded-full px-2.5 py-1 text-[10px] border transition-all ${
                        lifeAreas.includes(area.key)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {area.emoji} {area.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What showed up?</p>
              <div className="flex flex-wrap gap-1.5">
                {WORKSHOP_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-2.5 py-0.5 text-[10px] border transition-all ${
                      tags.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Free-form Journal */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What actually happened?</p>
              <Textarea
                placeholder="What is surfacing? What conversations, dreams, or events stood out? What does your body need?"
                value={journalText || ""}
                onChange={(e) => onJournalTextChange(e.target.value)}
                className="min-h-[100px] bg-background border-border/50 text-sm resize-none"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
