/**
 * Natal Portrait View — Comprehensive natal chart analysis
 * 12-section unified report comparable to Solar Return Birthday Gift
 */

import { useMemo, useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { ChartSelector } from './ChartSelector';
import { generateNatalPortrait, NatalPortrait, DomainDeepDive, HouseEmphasis, RankedTheme, NatalPowerPortrait, LifetimeWisdom } from '@/lib/natalPortraitEngine';
import {
  Sun, Moon, Star, Sparkles, ChevronDown, ChevronUp,
  Heart, Briefcase, Waves, Shield, Flame, Compass,
  Crown, Zap, Battery, Target, BookOpen,
} from 'lucide-react';

interface NatalPortraitViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

// ─── Sub-components ─────────────────────────────────────────────────

const SectionWrapper = ({ 
  title, emoji, children, defaultOpen = true 
}: { 
  title: string; emoji: string; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-sm bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between border-b border-border hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <span className="text-sm font-medium uppercase tracking-widest text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
};

// ─── 1. Life Purpose ────────────────────────────────────────────────

const LifePurposeSection = ({ portrait }: { portrait: NatalPortrait }) => {
  const lp = portrait.lifePurpose;
  
  return (
    <SectionWrapper title="Life Purpose & Core Identity" emoji="☀️" defaultOpen={true}>
      <div className="space-y-6">
        {/* Big Three Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/5 rounded-sm border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sun size={16} className="text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Sun — Identity</span>
            </div>
            <p className="text-lg font-serif text-foreground">{lp.sunSign}</p>
            <p className="text-[11px] text-foreground/80 mt-1.5 leading-relaxed">{getSunCoreLine(lp.sunSign, lp.sunHouse)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">House {lp.sunHouse} • {lp.sunDecan}</p>
            {lp.sunSabian && <p className="text-[10px] text-muted-foreground mt-1 italic">"{lp.sunSabian}"</p>}
          </div>
          <div className="p-4 bg-primary/5 rounded-sm border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Moon size={16} className="text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Moon — Emotions</span>
            </div>
            <p className="text-lg font-serif text-foreground">{lp.moonSign}</p>
            <p className="text-[11px] text-foreground/80 mt-1.5 leading-relaxed">{getMoonCoreLine(lp.moonSign, lp.moonHouse)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">House {lp.moonHouse} • {lp.moonDecan}</p>
            {lp.moonSabian && <p className="text-[10px] text-muted-foreground mt-1 italic">"{lp.moonSabian}"</p>}
          </div>
          <div className="p-4 bg-primary/5 rounded-sm border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Star size={16} className="text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Rising — Mask</span>
            </div>
            <p className="text-lg font-serif text-foreground">{lp.risingSign}</p>
            <p className="text-[11px] text-foreground/80 mt-1.5 leading-relaxed">{getRisingCoreLine(lp.risingSign)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{lp.risingDecan}</p>
            {lp.risingSabian && <p className="text-[10px] text-muted-foreground mt-1 italic">"{lp.risingSabian}"</p>}
          </div>
        </div>

        {/* Sect Badge */}
        <div className="flex items-center gap-3 px-4 py-2 bg-secondary/50 rounded-sm">
          <span className="text-sm">{lp.sect === 'Day' ? '☀️' : '🌙'}</span>
          <span className="text-xs text-foreground font-medium">{lp.sect} Chart</span>
          <span className="text-[11px] text-muted-foreground">
            {lp.sect === 'Night' 
              ? '— Your Moon leads; emotional intelligence is your superpower.'
              : '— Your Sun leads; willful expression and visibility drive your path.'}
          </span>
        </div>

        {/* Synthesis */}
        <div className="space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Who You Are (Sun)</p>
            <p className="text-[12px] text-foreground leading-relaxed">{lp.identityStatement}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">What You Need (Moon)</p>
            <p className="text-[12px] text-foreground leading-relaxed">{lp.emotionalNeeds}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">How Others See You (Rising)</p>
            <p className="text-[12px] text-foreground leading-relaxed">{lp.worldMask}</p>
          </div>
        </div>

        {/* Element & Modality */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 bg-secondary/30 rounded-sm">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Element Balance</p>
            <div className="space-y-1.5">
              {Object.entries(lp.elementBreakdown).map(([el, count]) => (
                <div key={el} className="flex items-center gap-2">
                  <span className="text-[11px] w-12 text-foreground">{el}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / 10) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-4">{count}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-primary mt-2">Dominant: {lp.dominantElement}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-sm">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">Modality Balance</p>
            <div className="space-y-1.5">
              {Object.entries(lp.modalityBreakdown).map(([mod, count]) => (
                <div key={mod} className="flex items-center gap-2">
                  <span className="text-[11px] w-16 text-foreground">{mod}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / 10) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-4">{count}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-primary mt-2">Dominant: {lp.dominantModality}</p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

// ─── 2. Top Themes ──────────────────────────────────────────────────

const TopThemesSection = ({ themes }: { themes: RankedTheme[] }) => (
  <SectionWrapper title="Top 5 Life Themes" emoji="🎯" defaultOpen={true}>
    <div className="space-y-3">
      {themes.map((t) => (
        <div key={t.rank} className="p-4 bg-secondary/30 rounded-sm border-l-2 border-primary">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-primary">#{t.rank}</span>
            <span className="text-sm font-medium text-foreground">{t.title}</span>
            <span className="ml-auto text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
              Score: {t.importance}
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">{t.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {t.drivers.map((d, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 bg-secondary text-muted-foreground rounded-full">{d}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

// ─── Domain Deep Dive Card ──────────────────────────────────────────

const DomainSection = ({ domain }: { domain: DomainDeepDive }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <SectionWrapper title={domain.title} emoji={domain.emoji}>
      <div className="space-y-4">
        <p className="text-[12px] text-foreground leading-relaxed">{domain.summary}</p>

        {/* Key Planets */}
        {domain.keyPlanets.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium">Key Players</p>
            {domain.keyPlanets.map((p, i) => (
              <div key={i} className="flex gap-3 text-[11px] p-2 bg-secondary/20 rounded-sm">
                <div className="flex-shrink-0 w-28">
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="block text-[9px] text-muted-foreground">
                    {p.sign} • H{p.house} {p.isRetrograde ? '℞' : ''}
                  </span>
                </div>
                <div className="flex-1 text-muted-foreground">{p.role}</div>
              </div>
            ))}
          </div>
        )}

        {/* House Activations */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-widest text-primary font-medium">House Focus</p>
          {domain.houseActivations.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px]">
              <span className="font-medium text-foreground w-16">House {h.house}</span>
              <span className="text-muted-foreground flex-1">{h.theme}</span>
              <span className="text-[9px] text-primary">
                {h.planets.length > 0 ? h.planets.join(', ') : 'Empty'}
              </span>
            </div>
          ))}
        </div>

        {/* Strengths & Challenges */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
        >
          {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {showDetails ? 'Hide' : 'Show'} strengths & challenges
        </button>

        {showDetails && (
          <div className="grid sm:grid-cols-2 gap-3 border-t border-border pt-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-green-600 dark:text-green-400 font-medium mb-1.5">Strengths</p>
              {domain.strengths.map((s, i) => (
                <p key={i} className="text-[11px] text-foreground/70 flex items-start gap-1.5 mb-1">
                  <span className="text-green-600 dark:text-green-400 mt-0.5">✦</span>
                  <span>{s}</span>
                </p>
              ))}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-medium mb-1.5">Growth Areas</p>
              {domain.challenges.map((c, i) => (
                <p key={i} className="text-[11px] text-foreground/70 flex items-start gap-1.5 mb-1">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">→</span>
                  <span>{c}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Advice */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-sm">
          <p className="text-[11px] text-primary italic">💡 {domain.advice}</p>
        </div>
      </div>
    </SectionWrapper>
  );
};

// ─── House Emphasis Grid ────────────────────────────────────────────

const HouseEmphasisSection = ({ houses }: { houses: HouseEmphasis[] }) => (
  <SectionWrapper title="House Emphasis Map" emoji="🏠">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {houses.map((h) => (
        <div
          key={h.house}
          className={`p-3 rounded-sm border text-center ${
            h.intensity === 'High' ? 'border-primary bg-primary/10' :
            h.intensity === 'Medium' ? 'border-primary/40 bg-primary/5' :
            h.intensity === 'Low' ? 'border-border bg-secondary/20' :
            'border-border/50 bg-transparent'
          }`}
        >
          <p className="text-xs font-bold text-foreground">House {h.house}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">{h.theme}</p>
          <p className={`text-[9px] mt-1 font-medium ${
            h.intensity === 'High' ? 'text-primary' :
            h.intensity === 'Medium' ? 'text-primary/70' :
            'text-muted-foreground'
          }`}>
            {h.intensity === 'Empty' ? '—' : h.planets.join(', ')}
          </p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);

// ─── Power Portrait ─────────────────────────────────────────────────

const PowerPortraitSection = ({ power }: { power: NatalPowerPortrait }) => (
  <SectionWrapper title="Power Portrait" emoji="⚡">
    <div className="space-y-4">
      {/* Mantra */}
      <div className="px-5 py-3 bg-primary/5 rounded-sm text-center">
        <p className="text-[12px] font-serif italic text-primary">"{power.mantra}"</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Drive Source</span>
          </div>
          <p className="text-[12px] text-foreground leading-relaxed">{power.driveSource}</p>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-medium">How You Sustain</span>
          </div>
          <p className="text-[12px] text-foreground leading-relaxed">{power.sustainStyle}</p>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Battery size={14} className="text-destructive" />
            <span className="text-[10px] uppercase tracking-widest text-destructive font-medium">Burnout Pattern</span>
          </div>
          <p className="text-[12px] text-foreground leading-relaxed">{power.burnoutPattern}</p>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-primary" />
            <span className="text-[10px] uppercase tracking-widest text-primary font-medium">Reset Button</span>
          </div>
          <p className="text-[12px] text-foreground leading-relaxed">{power.realignment}</p>
        </div>
      </div>
    </div>
  </SectionWrapper>
);

// ─── Patterns ───────────────────────────────────────────────────────

const PatternsSection = ({ patterns }: { patterns: NatalPortrait['patterns'] }) => (
  <SectionWrapper title="Chart Patterns & Configurations" emoji="🔷">
    {patterns.length === 0 ? (
      <p className="text-[12px] text-muted-foreground">No major geometric patterns detected. This isn't a lack — it means your energy is more evenly distributed across your chart rather than concentrated in specific configurations.</p>
    ) : (
      <div className="space-y-3">
        {patterns.map((p, i) => (
          <div key={i} className="p-4 bg-secondary/30 rounded-sm">
            <div className="flex items-center gap-2 mb-1">
              <span>{p.symbol}</span>
              <span className="text-sm font-medium text-foreground">{p.name}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">{p.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {p.planets.map((pl, j) => (
                <span key={j} className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">{pl}</span>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-2 mt-3">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-green-600 dark:text-green-400 mb-0.5">Gift</p>
                <p className="text-[10px] text-foreground/70">{p.gift}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">Challenge</p>
                <p className="text-[10px] text-foreground/70">{p.challenge}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </SectionWrapper>
);

// ─── Lifetime Wisdom ────────────────────────────────────────────────

const LifetimeWisdomSection = ({ wisdom }: { wisdom: LifetimeWisdom }) => (
  <SectionWrapper title="Lifetime Wisdom — Take This With You" emoji="🧭">
    <div className="space-y-5">
      {/* Nodal Axis */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 bg-primary/5 rounded-sm border border-primary/20">
          <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">North Node — Your Growth Direction</p>
          <p className="text-sm font-serif text-foreground">{wisdom.northNodeSign} {wisdom.northNodeHouse > 0 ? `(House ${wisdom.northNodeHouse})` : ''}</p>
          <p className="text-[12px] text-foreground/80 mt-2">{wisdom.lifeDirection}</p>
          <p className="text-[10px] text-primary mt-2 italic">Growth edge: {wisdom.growthEdge}</p>
        </div>
        <div className="p-4 bg-secondary/30 rounded-sm border border-border">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">South Node — Past-Life Gifts</p>
          <p className="text-sm font-serif text-foreground">{wisdom.southNodeSign} {wisdom.southNodeHouse > 0 ? `(House ${wisdom.southNodeHouse})` : ''}</p>
          <p className="text-[12px] text-foreground/80 mt-2">{wisdom.pastLifeGifts}</p>
        </div>
      </div>

      {/* Saturn Lesson */}
      <div className="p-4 bg-secondary/20 rounded-sm border-l-2 border-primary">
        <p className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Saturn's Lifetime Lesson</p>
        <p className="text-sm font-serif text-foreground">{wisdom.saturnSign} {wisdom.saturnHouse > 0 ? `(House ${wisdom.saturnHouse})` : ''}</p>
        <p className="text-[12px] text-foreground/80 mt-2">{wisdom.saturnLesson}</p>
      </div>

      {/* Closing */}
      <div className="p-5 bg-primary/5 border border-primary/20 rounded-sm text-center">
        <BookOpen size={20} className="mx-auto text-primary mb-2" />
        <p className="text-[12px] text-foreground leading-relaxed font-serif italic">{wisdom.closingWisdom}</p>
      </div>
    </div>
  </SectionWrapper>
);

// ─── Main View ──────────────────────────────────────────────────────

export const NatalPortraitView = ({ userNatalChart, savedCharts }: NatalPortraitViewProps) => {
  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userNatalChart) charts.push(userNatalChart);
    charts.push(...savedCharts.filter(c => c.id !== userNatalChart?.id));
    return charts;
  }, [userNatalChart, savedCharts]);

  const [selectedChartId, setSelectedChartId] = useState(allCharts[0]?.id || '');
  const selectedChart = allCharts.find(c => c.id === selectedChartId) || allCharts[0];

  const portrait = useMemo(() => {
    if (!selectedChart) return null;
    return generateNatalPortrait(selectedChart);
  }, [selectedChart]);

  if (!allCharts.length) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Crown size={48} className="mx-auto mb-4 opacity-30" />
        <p>Add a natal chart first to generate your Natal Portrait.</p>
      </div>
    );
  }

  if (!portrait || !selectedChart) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Chart Selector */}
      {allCharts.length > 1 && (
        <div className="flex items-center gap-3 mb-6">
          <ChartSelector
            userNatalChart={userNatalChart}
            savedCharts={savedCharts}
            selectedChartId={selectedChartId === userNatalChart?.id ? 'user' : selectedChartId}
            onSelect={(id) => setSelectedChartId(id === 'user' ? (userNatalChart?.id || '') : id)}
            label="Select Chart"
          />
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border pb-6 mb-6">
        <div className="flex items-center gap-3">
          <Crown size={28} className="text-primary" />
          <div>
            <h2 className="text-2xl font-serif tracking-wide text-foreground">{selectedChart.name}'s Natal Portrait</h2>
            <p className="text-sm text-muted-foreground">
              Born {selectedChart.birthDate} at {selectedChart.birthTime} • {selectedChart.birthLocation}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 max-w-2xl">
          A comprehensive analysis of your birth chart — who you are, what drives you, where you struggle, 
          and what you're here to become. This is your lifetime operating manual.
        </p>
      </div>

      {/* 1. Life Purpose & Core Identity */}
      <LifePurposeSection portrait={portrait} />

      {/* 2. Top 5 Life Themes */}
      <TopThemesSection themes={portrait.topThemes} />

      {/* 3-8. Domain Deep Dives */}
      <DomainSection domain={portrait.relationshipBlueprint} />
      <DomainSection domain={portrait.careerMoneyMap} />
      <DomainSection domain={portrait.emotionalArchitecture} />
      <DomainSection domain={portrait.healthVitality} />
      <DomainSection domain={portrait.shadowGrowth} />
      <DomainSection domain={portrait.spiritualKarmic} />

      {/* 9. House Emphasis */}
      <HouseEmphasisSection houses={portrait.houseEmphasis} />

      {/* 10. Power Portrait */}
      <PowerPortraitSection power={portrait.powerPortrait} />

      {/* 11. Chart Patterns */}
      <PatternsSection patterns={portrait.patterns} />

      {/* 12. Lifetime Wisdom */}
      <LifetimeWisdomSection wisdom={portrait.lifetimeWisdom} />
    </div>
  );
};

export default NatalPortraitView;
