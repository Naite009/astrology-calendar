import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

interface MetricTrackerProps {
  mood: number | null;
  energy: number | null;
  clarity: number | null;
  stress: number | null;
  sleepQuality: number | null;
  communicationQuality: number | null;
  intuition: number | null;
  productivity: number | null;
  dreamIntensity: number | null;
  conflictLevel: number | null;
  bodySensitivity: number | null;
  tags: string[];
  journalText: string;
  onMetricChange: (field: string, value: number) => void;
  onTagsChange: (tags: string[]) => void;
  onJournalTextChange: (text: string) => void;
}

const METRICS = [
  { key: "mood", label: "Mood", emoji: "😊", low: "Low", high: "Great" },
  { key: "energy", label: "Energy", emoji: "⚡", low: "Drained", high: "Vibrant" },
  { key: "clarity", label: "Clarity", emoji: "💎", low: "Foggy", high: "Crystal" },
  { key: "stress", label: "Stress", emoji: "😰", low: "Calm", high: "Intense" },
  { key: "sleepQuality", label: "Sleep", emoji: "😴", low: "Poor", high: "Deep" },
  { key: "communicationQuality", label: "Communication", emoji: "💬", low: "Muddled", high: "Flowing" },
  { key: "intuition", label: "Intuition", emoji: "🔮", low: "Quiet", high: "Loud" },
  { key: "productivity", label: "Productivity", emoji: "📈", low: "Stalled", high: "On Fire" },
  { key: "dreamIntensity", label: "Dreams", emoji: "🌙", low: "None", high: "Vivid" },
  { key: "conflictLevel", label: "Conflict", emoji: "⚔️", low: "None", high: "Heated" },
  { key: "bodySensitivity", label: "Body", emoji: "🧘", low: "Numb", high: "Heightened" },
];

// Map camelCase to snake_case for DB fields
const FIELD_MAP: Record<string, string> = {
  mood: "mood",
  energy: "energy",
  clarity: "clarity",
  stress: "stress",
  sleepQuality: "sleep_quality",
  communicationQuality: "communication_quality",
  intuition: "intuition",
  productivity: "productivity",
  dreamIntensity: "dream_intensity",
  conflictLevel: "conflict_level",
  bodySensitivity: "body_sensitivity",
};

const STARTER_TAGS = [
  "important conversation",
  "short trip",
  "errands",
  "writing",
  "siblings",
  "fatigue",
  "retreat",
  "vivid dreams",
  "crying release",
  "insight",
  "spiritual practice",
  "conflict",
  "breakthrough",
  "news",
  "home focus",
  "relationship focus",
  "career focus",
];

export const MetricTracker = ({
  mood,
  energy,
  clarity,
  stress,
  sleepQuality,
  communicationQuality,
  intuition,
  productivity,
  dreamIntensity,
  conflictLevel,
  bodySensitivity,
  tags,
  journalText,
  onMetricChange,
  onTagsChange,
  onJournalTextChange,
}: MetricTrackerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const values: Record<string, number | null> = {
    mood,
    energy,
    clarity,
    stress,
    sleepQuality,
    communicationQuality,
    intuition,
    productivity,
    dreamIntensity,
    conflictLevel,
    bodySensitivity,
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag));
    } else {
      onTagsChange([...tags, tag]);
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
            📊 Track Your Experience
            {trackedCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {trackedCount}/11
              </Badge>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
        </button>

        {isExpanded && (
          <div className="space-y-5 pt-2">
            {/* Metric Sliders */}
            <div className="space-y-3">
              {METRICS.map((m) => (
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
                    <span className="text-[10px] text-muted-foreground w-12 text-right">
                      {m.low}
                    </span>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[values[m.key] ?? 5]}
                      onValueChange={([v]) => onMetricChange(FIELD_MAP[m.key], v)}
                      className="flex-1"
                    />
                    <span className="text-[10px] text-muted-foreground w-12">
                      {m.high}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <p className="text-xs font-medium">🏷️ Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_TAGS.map((tag) => (
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
              <p className="text-xs font-medium">📝 Free Journal</p>
              <Textarea
                placeholder="Anything else you want to note about today's experience..."
                value={journalText || ""}
                onChange={(e) => onJournalTextChange(e.target.value)}
                className="min-h-[80px] bg-background border-border/50 text-sm resize-none"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
