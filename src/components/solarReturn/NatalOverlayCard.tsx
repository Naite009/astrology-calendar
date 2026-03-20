import { useMemo } from 'react';
import { Compass, MapPin, Star, Layers, HelpCircle } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity, body, self-definition, personal visibility',
  2: 'money, resources, self-worth, values',
  3: 'communication, learning, siblings, local movement',
  4: 'home, family, roots, private life',
  5: 'creativity, romance, children, pleasure, risk',
  6: 'work, routines, service, health, daily systems',
  7: 'relationships, partnership, agreements, mirrors',
  8: 'shared resources, intimacy, psychological depth, transformation',
  9: 'beliefs, travel, higher learning, publishing, meaning',
  10: 'career, calling, status, reputation, visibility',
  11: 'friends, networks, communities, future goals',
  12: 'rest, retreat, healing, spirituality, endings, unconscious material',
};

const ANGULAR_HOUSES = [1, 4, 7, 10];

interface OverlayPoint {
  label: string;
  natalHouse: number;
  meaning: string;
  narrative: string;
  isPriority: boolean;
}

interface Pattern {
  type: 'stacked' | 'angular' | 'private';
  message: string;
}

interface Props {
  analysis: SolarReturnAnalysis;
}

export function NatalOverlayCard({ analysis }: Props) {
  const { points, dominantHouse, patterns } = useMemo(() => {
    const pts: OverlayPoint[] = [];
    const houseCounts: Record<number, string[]> = {};

    const addPoint = (label: string, house: number | null, isPriority: boolean) => {
      if (!house) return;
      const meaning = HOUSE_MEANINGS[house] || '';
      pts.push({ label, natalHouse: house, meaning, narrative: '', isPriority });
      if (!houseCounts[house]) houseCounts[house] = [];
      houseCounts[house].push(label);
    };

    // Priority points
    if (analysis.srAscInNatalHouse) {
      addPoint('SR Ascendant', analysis.srAscInNatalHouse.natalHouse, true);
    }
    addPoint('SR Sun', analysis.sunNatalHouse?.house ?? null, true);
    addPoint('SR Moon', analysis.moonNatalHouse?.house ?? null, true);

    // Saturn & Jupiter from overlays
    for (const ov of analysis.houseOverlays || []) {
      if (ov.planet === 'Saturn' || ov.planet === 'Jupiter') {
        addPoint(`SR ${ov.planet}`, (ov as any).srInNatalHouse ?? ov.natalHouse, true);
      }
    }

    // Other overlays (non-priority)
    for (const ov of analysis.houseOverlays || []) {
      if (['Sun', 'Moon', 'Saturn', 'Jupiter'].includes(ov.planet)) continue;
      addPoint(`SR ${ov.planet}`, (ov as any).srInNatalHouse ?? ov.natalHouse, false);
    }

    // Build narratives
    pts.forEach(p => {
      const narratives: Record<string, Record<number, string>> = {
        'SR Ascendant': {
          1: 'The year is approached through the lens of self-reinvention and personal presence.',
          2: 'The year is filtered through financial realities, earning power, and questions of self-worth.',
          3: 'The year unfolds through communication, local connections, and daily learning.',
          4: 'The year is shaped by home, family dynamics, and private emotional processing.',
          5: 'The year opens through creative expression, romance, or the joy of self-expression.',
          6: 'The year is experienced through daily routines, health adjustments, and work systems.',
          7: 'The year is defined by partnerships, one-on-one dynamics, and relational mirrors.',
          8: 'The year draws you into shared resources, intimacy, and psychological transformation.',
          9: 'The year expands through travel, study, publishing, or shifts in worldview.',
          10: 'The year is shaped by career visibility, public roles, and ambitions.',
          11: 'The year is channeled through community, friendships, and collective goals.',
          12: 'The year moves inward — retreat, healing, spiritual work, and hidden processes dominate.',
        },
        'SR Sun': {
          1: 'The core purpose of the year centers on identity, new beginnings, and personal visibility.',
          2: 'The core purpose of the year centers on building financial stability and clarifying values.',
          3: 'The core purpose of the year centers on learning, writing, and strengthening daily connections.',
          4: 'The core purpose of the year centers on home, family bonds, and emotional foundations.',
          5: 'The core purpose of the year centers on creative output, romance, and self-expression.',
          6: 'The core purpose of the year centers on health, work refinement, and daily discipline.',
          7: 'The core purpose of the year centers on partnership, commitment, and relational growth.',
          8: 'The core purpose of the year centers on shared resources, deep healing, and transformation.',
          9: 'The core purpose of the year centers on expanding horizons through travel, study, or beliefs.',
          10: 'The core purpose of the year centers on career achievement, reputation, and public direction.',
          11: 'The core purpose of the year centers on community, friendships, and future aspirations.',
          12: 'The core purpose of the year centers on retreat, inner work, and spiritual realignment.',
        },
        'SR Moon': {
          1: 'Emotional life and daily experience are most active around personal identity and self-image.',
          2: 'Emotional life and daily experience revolve around money, possessions, and material security.',
          3: 'Emotional life and daily experience are tied to conversations, siblings, and local movement.',
          4: 'Emotional life is deeply tied to home, family, and private inner processing.',
          5: 'Emotional life and daily experience are channeled through creativity, pleasure, and love.',
          6: 'Emotional life and daily experience are closely tied to health, work routines, and service.',
          7: 'Emotional focus is strongly tied to relationships and one-on-one dynamics.',
          8: 'Emotional life is pulled toward intimacy, psychological depth, and shared resources.',
          9: 'Emotional life is nourished by travel, philosophy, and searching for meaning.',
          10: 'Emotional focus is strongly tied to career developments, public roles, and visibility.',
          11: 'Emotional life is nourished by friendships, group belonging, and future-oriented goals.',
          12: 'Emotional life flows through solitude, dreams, healing, and subconscious material.',
        },
      };
      const specific = narratives[p.label]?.[p.natalHouse];
      p.narrative = specific || `${p.label} in your natal ${p.natalHouse}${ordinal(p.natalHouse)} house activates themes of ${p.meaning}.`;
    });

    // Dominant house — house with the most SR points stacking
    let dominant: { house: number; count: number; labels: string[] } | null = null;
    for (const [h, labels] of Object.entries(houseCounts)) {
      const count = labels.length;
      if (count >= 2 && (!dominant || count > dominant.count)) {
        dominant = { house: Number(h), count, labels };
      }
    }

    // Patterns
    const pats: Pattern[] = [];
    if (dominant && dominant.count >= 2) {
      pats.push({
        type: 'stacked',
        message: `${dominant.labels.join(', ')} all land in your natal ${dominant.house}${ordinal(dominant.house)} house — this is a major arena of the year.`,
      });
    }

    const ascHouse = analysis.srAscInNatalHouse?.natalHouse;
    if (ascHouse && ANGULAR_HOUSES.includes(ascHouse)) {
      pats.push({
        type: 'angular',
        message: 'The SR Ascendant falls in an angular natal house — this year is likely to be externally visible, active, and consequential.',
      });
    }

    const sunH = analysis.sunNatalHouse?.house;
    const moonH = analysis.moonNatalHouse?.house;
    if ((sunH === 12 || sunH === 4) || (moonH === 12 || moonH === 4)) {
      pats.push({
        type: 'private',
        message: 'Key placements land in natal 4th or 12th — the year may emphasize interior development, home life, or private transitions.',
      });
    }

    return {
      points: pts,
      dominantHouse: dominant,
      patterns: pats,
    };
  }, [analysis]);

  const priorityPoints = points.filter(p => p.isPriority);

  if (priorityPoints.length === 0) return null;

  return (
    <div className="border border-primary/20 rounded-sm p-5 bg-card">
      <h3 className="text-sm uppercase tracking-widest font-medium text-foreground mb-1 flex items-center gap-2">
        <Compass size={16} className="text-primary" />
        How This Year Lands in Your Natal Chart
      </h3>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        Solar Return → Natal House Overlay
      </p>

      {/* Teaching context */}
      <div className="bg-muted/30 border border-border rounded-sm p-3 mb-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
          <HelpCircle size={10} />
          What This Means
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your birth chart is like a permanent map of your life, divided into 12 sections (houses), each covering a different area — money, relationships, career, etc. Every birthday, a new chart is created. When we place this year's planets onto your permanent map, we can see <strong className="text-foreground">which parts of your life will get the most attention</strong>. Below, we show where each key planet falls and what it activates for you.
        </p>
      </div>

      {/* Main arena summary */}
      {dominantHouse && (
        <div className="bg-primary/5 border border-primary/10 rounded-sm p-3 mb-4">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Layers size={12} />
            Main Arena of the Year — Natal {dominantHouse.house}{ordinal(dominantHouse.house)} House
          </p>
          <p className="text-sm text-foreground leading-relaxed">
            This Solar Return lands most strongly in your natal {dominantHouse.house}{ordinal(dominantHouse.house)} house, emphasizing <em>{HOUSE_MEANINGS[dominantHouse.house]}</em>.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1.5 flex items-start gap-1">
            <HelpCircle size={10} className="flex-shrink-0 mt-0.5" />
            <span>
              Why this house? {dominantHouse.count} of this year's key planets ({dominantHouse.labels.join(', ')}) all fall into your birth chart's {dominantHouse.house}{ordinal(dominantHouse.house)} house. When multiple planets pile up in the same section of your chart, that area of life becomes the main storyline of the year — it's where the biggest events, decisions, and changes show up.
            </span>
          </p>
        </div>
      )}

      {/* Priority overlay cards with explanations */}
      <div className="space-y-3 mb-4">
        {priorityPoints.map((p) => (
          <div key={p.label} className="flex gap-3 items-start">
            <div className="flex-shrink-0 mt-0.5">
              {p.label.includes('Ascendant') ? <Compass size={14} className="text-primary" /> :
               p.label.includes('Sun') ? <Star size={14} className="text-primary" /> :
               <MapPin size={14} className="text-primary" />}
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">
                {p.label} → Natal {p.natalHouse}{ordinal(p.natalHouse)} House
                <span className="text-muted-foreground font-normal ml-1.5">({p.meaning})</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{p.narrative}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pattern alerts */}
      {patterns.length > 0 && (
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Pattern Signals</p>
          {patterns.map((pat, i) => (
            <p key={i} className="text-xs text-foreground leading-relaxed">
              {pat.type === 'stacked' && '📌 '}
              {pat.type === 'angular' && '⚡ '}
              {pat.type === 'private' && '🌙 '}
              {pat.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function ordinal(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}
