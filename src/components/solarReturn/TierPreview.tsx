import { useState } from 'react';
import { ArrowLeft, Download, Sparkles, Loader2, Clock } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { buildOraclePrompt } from '@/lib/aiPrompts/oraclePrompt';
import { generateTier1SolarReturnPDF } from '@/lib/pdfSections/tier1Report';
import { CAKE_IMAGES } from '@/components/SolarReturnPDFExport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────
export type TierId = 't1' | 't2' | 't3' | 't4' | 't5';

const TIER_META: Record<TierId, { name: string; tagline: string; color: string; textColor: string; borderColor: string }> = {
  t1: { name: 'Year at a Glance', tagline: 'Plain language · 2 pages', color: 'hsl(30 55% 92%)', textColor: 'hsl(25 60% 40%)', borderColor: 'hsl(30 55% 80%)' },
  t2: { name: 'The Year Ahead', tagline: 'Core interpretation · 8–12 pages', color: 'hsl(145 35% 90%)', textColor: 'hsl(145 50% 25%)', borderColor: 'hsl(145 35% 75%)' },
  t3: { name: 'Deep Dive', tagline: 'Full analysis · 20–25 pages', color: 'hsl(270 40% 92%)', textColor: 'hsl(270 45% 30%)', borderColor: 'hsl(270 40% 78%)' },
  t4: { name: 'Master Reading', tagline: 'Practitioner depth · Coming soon', color: 'hsl(5 55% 92%)', textColor: 'hsl(5 55% 30%)', borderColor: 'hsl(5 55% 78%)' },
  t5: { name: 'Oracle Report', tagline: 'Complete mastery · Coming soon', color: 'hsl(25 65% 92%)', textColor: 'hsl(25 65% 30%)', borderColor: 'hsl(25 65% 78%)' },
};

// ─── Lookup Tables ──────────────────────────────────────────────────

const RISING_QUALITY: Record<string, string> = {
  Aries: 'Bold, forward-moving', Taurus: 'Steady, grounding',
  Gemini: 'Curious, connective', Cancer: 'Nurturing, inward',
  Leo: 'Radiant, expressive', Virgo: 'Clear, purposeful',
  Libra: 'Harmonizing, relational', Scorpio: 'Deep, transformative',
  Sagittarius: 'Expansive, seeking', Capricorn: 'Focused, building',
  Aquarius: 'Visionary, freeing', Pisces: 'Gentle, open-hearted',
};

const PROFECTION_THEME_PLAIN: Record<number, string> = {
  1: 'fresh starts and stepping into yourself',
  2: 'building security and knowing your worth',
  3: 'learning, speaking up, and staying curious',
  4: 'home, roots, and what nourishes you',
  5: 'joy, creativity, and what lights you up',
  6: 'health, rhythm, and showing up daily',
  7: 'relationships and meaningful partnership',
  8: 'transformation and going deeper',
  9: 'expansion, travel, and finding meaning',
  10: 'purpose, work, and being seen',
  11: 'community, friendship, and shared vision',
  12: 'rest, healing, and inner renewal',
};

const HOUSE_THEME_SHORT: Record<number, string> = {
  1: 'Identity & fresh starts', 2: 'Security & self-worth',
  3: 'Learning & expression', 4: 'Home & roots',
  5: 'Joy & creativity', 6: 'Health & daily rhythm',
  7: 'Relationships & partnership', 8: 'Transformation & depth',
  9: 'Expansion & meaning', 10: 'Purpose & recognition',
  11: 'Community & friendship', 12: 'Rest & inner renewal',
};

const MOON_KEYWORD: Record<string, string> = {
  Aries: 'Active & independent', Taurus: 'Steady & grounded',
  Gemini: 'Curious & expressive', Cancer: 'Sensitive & nurturing',
  Leo: 'Warm & expressive', Virgo: 'Thoughtful & discerning',
  Libra: 'Balanced & relational', Scorpio: 'Intense & perceptive',
  Sagittarius: 'Free & optimistic', Capricorn: 'Steady & disciplined',
  Aquarius: 'Independent & aware', Pisces: 'Intuitive & compassionate',
};

const MOON_PHASE_PLAIN: Record<string, string> = {
  'New Moon': 'A year of fresh starts — plant new seeds',
  'Waxing Crescent': 'A building year — keep going',
  'First Quarter': 'A year of action — push through',
  'Waxing Gibbous': 'A year of refinement — almost there',
  'Full Moon': 'A completion year — things come full circle',
  'Waning Gibbous': 'A year of sharing — give what you\'ve learned',
  'Last Quarter': 'A year of release — let go gracefully',
  'Balsamic': 'A quiet year — rest before the next chapter',
  'Balsamic Moon': 'A quiet year — rest before the next chapter',
};

const SUN_HOUSE_BODY: Record<number, string> = {
  1: 'This is a year where your sense of self takes center stage. You may feel a pull to reinvent, refresh, or simply show up more fully as who you are.',
  2: 'This year draws your attention to what you value — your resources, your time, and your sense of security.',
  3: 'This is a year of words, ideas, and connections. You may feel drawn to learn something new or speak up more.',
  4: 'This year turns your attention inward — toward home, family, and what nourishes you at the deepest level.',
  5: 'This is a year to follow what genuinely delights you. Joy, creativity, and self-expression are the point.',
  6: 'This year asks you to refine your daily rhythm. Health, habits, and showing up each day become the foundation.',
  7: 'This is a year defined by the people closest to you. Relationships take center stage.',
  8: 'This year invites you to go deeper. Transformation, shared resources, and emotional honesty shape your growth.',
  9: 'This is a year to expand your world. Travel, education, or a shift in perspective — the horizon calls.',
  10: 'This year puts your work and purpose in the spotlight. What you are building becomes visible.',
  11: 'This is a year shaped by community, friendship, and shared vision.',
  12: 'This year invites you to slow down, rest, and listen to what is happening beneath the surface.',
};

const MOON_SIGN_BODY: Record<string, string> = {
  Aries: 'Your emotional world this year is quick, direct, and action-oriented.',
  Taurus: 'Your emotional world this year is calm and steady — comfort in routine and beauty.',
  Gemini: 'Your emotional world this year is lively and curious — processing through conversation.',
  Cancer: 'Your emotional world this year is tender and intuitive — sensitivity is a gift.',
  Leo: 'Your emotional world this year is warm and generous — you need to feel seen.',
  Virgo: 'Your emotional world this year is thoughtful and discerning.',
  Libra: 'Your emotional world this year seeks harmony through relationships.',
  Scorpio: 'Your emotional world this year runs deep — honesty others find uncomfortable.',
  Sagittarius: 'Your emotional world this year is optimistic and restless — seeking meaning.',
  Capricorn: 'Your emotional world this year tends toward patience and practicality.',
  Aquarius: 'Your emotional world this year is independent and clear-sighted.',
  Pisces: 'Your emotional world this year is fluid and deeply empathic.',
};

const RISING_BODY: Record<string, string> = {
  Aries: 'You come across as someone ready to act — direct and unafraid to lead.',
  Taurus: 'You come across as grounded and dependable — someone others instinctively trust.',
  Gemini: 'You come across as bright, curious, and adaptable.',
  Cancer: 'You come across as warm, intuitive, and emotionally intelligent.',
  Leo: 'You come across as confident, warm, and naturally magnetic.',
  Virgo: 'You come across as competent, thoughtful, and precise.',
  Libra: 'You come across as graceful, fair-minded, and diplomatic.',
  Scorpio: 'You come across as intense, perceptive, and quietly powerful.',
  Sagittarius: 'You come across as open, enthusiastic, and ready for adventure.',
  Capricorn: 'You come across as serious, capable, and quietly ambitious.',
  Aquarius: 'You come across as original, independent, and unconventional.',
  Pisces: 'You come across as gentle, open-hearted, and deeply intuitive.',
};

const ELEMENT_WORD: Record<string, string> = {
  Fire: 'Ignition', Earth: 'Roots', Air: 'Clarity', Water: 'Depth',
};
const PROFECTION_WORD: Record<number, string> = {
  1: 'Identity', 2: 'Resources', 3: 'Expression', 4: 'Home',
  5: 'Joy', 6: 'Service', 7: 'Partnership', 8: 'Transformation',
  9: 'Expansion', 10: 'Purpose', 11: 'Community', 12: 'Surrender',
};
const MOON_WORD: Record<string, string> = {
  Aries: 'Courage', Taurus: 'Patience', Gemini: 'Curiosity', Cancer: 'Nurture',
  Leo: 'Radiance', Virgo: 'Precision', Libra: 'Balance', Scorpio: 'Depth',
  Sagittarius: 'Freedom', Capricorn: 'Mastery', Aquarius: 'Vision', Pisces: 'Flow',
};

function getBigThreeSunHeadline(_natalSign: string, srHouse: number): string {
  const m: Record<number, string> = {
    1: 'finds fresh expression', 2: 'focuses on what truly matters',
    3: 'discovers new ways to communicate', 4: 'turns homeward',
    5: 'lights up with joy and creativity', 6: 'refines daily life',
    7: 'meets itself through others', 8: 'goes deeper than usual',
    9: 'seeks a bigger picture', 10: 'steps into the spotlight',
    11: 'connects with community', 12: 'turns inward for renewal',
  };
  return `Your core self ${m[srHouse] || 'enters a new chapter'}`;
}

function getBigThreeMoonHeadline(natalMoon: string, srMoon: string): string {
  if (natalMoon === srMoon) return 'Your emotional world stays in familiar territory';
  const q: Record<string, string> = {
    Aries: 'quickens and activates', Taurus: 'steadies and grounds',
    Gemini: 'lightens and opens', Cancer: 'deepens and softens',
    Leo: 'warms and brightens', Virgo: 'clarifies and refines',
    Libra: 'seeks harmony and balance', Scorpio: 'intensifies and transforms',
    Sagittarius: 'expands and lifts', Capricorn: 'steadies and clarifies',
    Aquarius: 'detaches and sees clearly', Pisces: 'opens and dissolves boundaries',
  };
  return `Your emotional world ${q[srMoon] || 'shifts into new territory'}`;
}

function getBigThreeRisingHeadline(natalRising: string, srRising: string): string {
  if (natalRising === srRising) return 'Your natural presence becomes your greatest strength';
  const q: Record<string, string> = {
    Aries: 'becomes bolder and more direct', Taurus: 'grounds into quiet confidence',
    Gemini: 'becomes lighter and more curious', Cancer: 'softens and becomes more intuitive',
    Leo: 'becomes more visible and warm', Virgo: 'sharpens and becomes more purposeful',
    Libra: 'becomes more graceful and diplomatic', Scorpio: 'deepens and becomes more magnetic',
    Sagittarius: 'opens up and reaches further', Capricorn: 'becomes more focused and authoritative',
    Aquarius: 'becomes more independent and original', Pisces: 'becomes gentler and more compassionate',
  };
  return `Your presence ${q[srRising] || 'takes on a new quality'}`;
}

// ─── Auto-generated birthday message ────────────────────────────────
function generateBirthdayMessage(firstName: string, sunSign: string, profHouse: number): string {
  const gifts: Record<string, string> = {
    Aries: 'the courage to begin before anyone else is ready',
    Taurus: 'the patience to build things that last',
    Gemini: 'a mind that makes connections others miss',
    Cancer: 'the ability to make people feel safe',
    Leo: 'the kind of warmth that makes people feel celebrated',
    Virgo: 'the eye that catches what everyone else overlooks',
    Libra: 'the grace to hold two sides of anything without losing yourself',
    Scorpio: 'the willingness to go where others are afraid to look',
    Sagittarius: 'a faith that life is leading you somewhere meaningful',
    Capricorn: 'the discipline to show up even when no one is watching',
    Aquarius: 'the vision to see what the world could be',
    Pisces: 'a sensitivity that changes the people around you',
  };
  const invitations: Record<number, string> = {
    1: 'step into the newest version of yourself',
    2: 'honor what truly matters to you',
    3: 'speak up and stay curious',
    4: 'come home to yourself',
    5: 'follow what genuinely delights you',
    6: 'build a rhythm that sustains you',
    7: 'deepen the relationships that matter most',
    8: 'trust what is transforming',
    9: 'expand your world in a way that feels right',
    10: 'let your purpose become visible',
    11: 'find your people and dream together',
    12: 'rest, and let what needs to heal, heal',
  };
  const gift = gifts[sunSign] || 'something the world genuinely needs';
  const invitation = invitations[profHouse] || 'trust what emerges';
  return `Happy birthday, ${firstName}. You were born with ${gift}. This year invites you to ${invitation}. Wishing you a beautiful year ahead.`;
}

// ─── Component ──────────────────────────────────────────────────────

interface Props {
  tier: TierId;
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  onBack: () => void;
}

export const TierPreview = ({ tier, analysis, srChart, natalChart, onBack }: Props) => {
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [includeBirthday, setIncludeBirthday] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const meta = TIER_META[tier];
  const name = natalChart.name || 'You';
  const firstName = name.split(/\s+/)[0];
  const year = srChart.solarReturnYear;
  const natalSunSign = natalChart.planets?.Sun?.sign || '';
  const natalMoonSign = natalChart.planets?.Moon?.sign || '';
  const natalRisingSign = natalChart.planets?.Ascendant?.sign || '';
  const srMoonSign = analysis.moonSign || srChart.planets.Moon?.sign || '';
  const srRisingSign = srChart.planets.Ascendant?.sign || analysis.yearlyTheme?.ascendantSign || '';
  const sunHouse = analysis.sunHouse?.house || 1;
  const profHouse = analysis.profectionYear?.houseNumber || 1;
  const profAge = analysis.profectionYear?.age;
  const dominantEl = analysis.elementBalance?.dominant || 'Fire';
  const timeLord = analysis.profectionYear?.timeLord || '';

  const autoBirthdayMessage = generateBirthdayMessage(firstName, natalSunSign, profHouse);

  const handleDownloadPDF = async () => {
    if (tier === 't4' || tier === 't5') {
      toast.info('Coming soon — this tier is under development');
      return;
    }
    setDownloading(true);
    try {
      // Currently only T1 has a PDF generator
      if (tier === 't1') {
        await generateTier1SolarReturnPDF(
          analysis, srChart, natalChart,
          includeBirthday, includeBirthday ? autoBirthdayMessage : '',
          CAKE_IMAGES,
        );
      } else {
        toast.info(`Tier ${tier.replace('t', '')} PDF coming soon`);
      }
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const risingQuality = RISING_QUALITY[srRisingSign] || 'Fresh, evolving';
  const profThemePlain = PROFECTION_THEME_PLAIN[profHouse] || 'growth and renewal';
  const themeHeadline = `${risingQuality} energy leads this year — a time for ${profThemePlain}.`;
  const themeBody = `This year invites you into a season of ${profThemePlain}. The energy is ${risingQuality.toLowerCase()}, and the invitation is to trust what emerges naturally rather than forcing outcomes.`;

  const sunHouseTheme = HOUSE_THEME_SHORT[sunHouse] || 'A new focus area';
  const moonKeyword = MOON_KEYWORD[srMoonSign] || 'Emotionally attuned';
  const moonPhaseDesc = MOON_PHASE_PLAIN[analysis.moonPhase?.phase || ''] || 'A year of steady inner rhythm';
  const profThemeShort = HOUSE_THEME_SHORT[profHouse] || 'A new chapter';

  const w1 = ELEMENT_WORD[dominantEl] || 'Growth';
  const w2 = PROFECTION_WORD[profHouse] || 'Renewal';
  const w3 = MOON_WORD[srMoonSign] || 'Depth';

  const bigThreeCards = [
    {
      label: 'YOUR SUN', natalTag: natalSunSign, srTag: `H${sunHouse}`,
      headline: getBigThreeSunHeadline(natalSunSign, sunHouse),
      body: SUN_HOUSE_BODY[sunHouse] || 'Your energy moves toward a meaningful new focus.',
      labelColor: 'text-amber-700', bgColor: 'bg-amber-50',
      tagBg: 'bg-purple-100', tagText: 'text-purple-800',
      srTagBg: 'bg-orange-100', srTagText: 'text-orange-800',
    },
    {
      label: 'YOUR MOON', natalTag: natalMoonSign, srTag: srMoonSign,
      headline: getBigThreeMoonHeadline(natalMoonSign, srMoonSign),
      body: MOON_SIGN_BODY[srMoonSign] || 'Your emotional world shifts into a new rhythm.',
      labelColor: 'text-purple-700', bgColor: 'bg-purple-50',
      tagBg: 'bg-purple-100', tagText: 'text-purple-800',
      srTagBg: 'bg-orange-100', srTagText: 'text-orange-800',
    },
    {
      label: 'YOUR PRESENCE THIS YEAR', natalTag: natalRisingSign, srTag: srRisingSign,
      headline: getBigThreeRisingHeadline(natalRisingSign, srRisingSign),
      body: RISING_BODY[srRisingSign] || 'The way you show up takes on a new quality.',
      labelColor: 'text-orange-700', bgColor: 'bg-orange-50',
      tagBg: 'bg-purple-100', tagText: 'text-purple-800',
      srTagBg: 'bg-orange-100', srTagText: 'text-orange-800',
    },
  ];

  const snapCards = [
    { micro: 'WHERE YOUR ENERGY GOES', value: sunHouseTheme, sub: SUN_HOUSE_BODY[sunHouse]?.split('.')[0] + '.' || '', microClass: 'text-amber-700' },
    { micro: 'YOUR EMOTIONAL WEATHER', value: moonKeyword, sub: moonPhaseDesc, microClass: 'text-purple-700' },
    { micro: 'THE FOCUS OF THIS YEAR', value: profThemeShort, sub: profAge != null ? `Year ${profAge}` : '', microClass: 'text-orange-700' },
  ];

  // T2+ data
  const topAspects = analysis.srToNatalAspects?.slice(0, 5) || [];
  const stelliums = analysis.stelliums || [];
  const moonPhase = analysis.moonPhase?.phase || '';

  const generateAI = async () => {
    setAiLoading(true);
    try {
      const prompt = buildOraclePrompt(analysis, srChart, natalChart);
      const { data, error } = await supabase.functions.invoke('oracle-reading', { body: { prompt } });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setAiText(data?.text || 'No reading generated.');
    } catch (err: any) {
      console.error('Oracle reading error:', err);
      toast.error('Failed to generate oracle reading');
    } finally {
      setAiLoading(false);
    }
  };

  const isComingSoon = tier === 't4' || tier === 't5';
  const tierNum = tier.replace('t', '');

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={12} /> Back to Overview
          </button>
          <span
            className="text-sm font-medium px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: meta.color, color: meta.textColor, border: `1px solid ${meta.borderColor}` }}
          >
            T{tierNum} · {meta.name}
          </span>
          <span className="text-xs text-muted-foreground">{meta.tagline}</span>
          {tier === 't1' && (
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!includeBirthday}
                onChange={(e) => setIncludeBirthday(!e.target.checked)}
                className="rounded border-border h-3.5 w-3.5"
              />
              <span className="text-[11px] text-muted-foreground">No birthday</span>
            </label>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-3 py-1.5 rounded text-xs font-medium border transition-all hover:opacity-80 flex items-center gap-1.5 disabled:opacity-50"
            style={{ backgroundColor: meta.color, color: meta.textColor, borderColor: meta.borderColor }}
          >
            {downloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            {isComingSoon ? 'Coming Soon' : downloading ? 'Generating...' : 'Download PDF'}
          </button>
          <button
            onClick={generateAI}
            disabled={aiLoading}
            className="px-3 py-1.5 rounded text-xs font-medium border border-border text-muted-foreground hover:bg-secondary transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {aiLoading ? 'Generating...' : 'AI Reading'}
          </button>
        </div>
      </div>

      {/* ═══════════════ COMING SOON (T4/T5) ═══════════════ */}
      {isComingSoon && (
        <div className="border border-border rounded-sm p-8 bg-card/40 text-center space-y-4">
          <Clock size={32} className="mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-serif text-foreground">{meta.name}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {tier === 't4'
              ? 'The Master Reading will include planet dignity reports, health overlays, eclipse sensitivity, intercepted signs, mutual receptions, and quarterly focus areas.'
              : 'The Oracle Report will include fixed stars, Arabic Parts, Firdaria, Antiscia, solar arc directions, and full relationship/money/career synthesis with an oracle narrative.'
            }
          </p>
          <p className="text-xs text-muted-foreground/60 italic">Under development — coming in a future release</p>
        </div>
      )}

      {/* ═══════════════ T1 SECTIONS (shown in T1, T2, T3) ═══════════════ */}
      {!isComingSoon && (
        <>
          {/* Section: This Year's Theme */}
          <div className="space-y-3 border border-border rounded-sm p-5 bg-card/60">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">This Year's Theme</div>
            <h3 className="text-xl font-serif text-foreground leading-snug">{themeHeadline}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{themeBody}</p>
          </div>

          {/* Three Snapshot Cards */}
          <div className="grid grid-cols-3 gap-3">
            {snapCards.map((card) => (
              <div key={card.micro} className="border border-border rounded-sm p-4 bg-card/40 space-y-2">
                <div className={`text-[9px] uppercase tracking-widest font-semibold ${card.microClass}`}>
                  {card.micro}
                </div>
                <div className="text-sm font-semibold text-foreground">{card.value}</div>
                {card.sub && <div className="text-xs text-muted-foreground">{card.sub}</div>}
              </div>
            ))}
          </div>

          {/* Section: How This Year Meets You */}
          <div className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">How This Year Meets You</div>
            <p className="text-xs text-muted-foreground italic">
              Your natal chart is who you are. Your Solar Return shows how this year's energy meets that.
            </p>
            <div className="space-y-2">
              {bigThreeCards.map((card) => (
                <div key={card.label} className="border border-border rounded-sm overflow-hidden">
                  <div className={`px-4 py-2 flex items-center justify-between ${card.bgColor}`}>
                    <span className={`text-[10px] uppercase tracking-widest font-semibold ${card.labelColor}`}>
                      {card.label}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${card.tagBg} ${card.tagText}`}>
                        {card.natalTag}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${card.srTagBg} ${card.srTagText}`}>
                        {card.srTag}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-1">
                    <div className="text-sm font-medium text-foreground">{card.headline}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{card.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Three Words */}
          <div className="border-t border-b border-border py-4 text-center space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Three Words for {year}
            </div>
            <div className="text-lg font-serif text-foreground/80 tracking-wide">
              {w1}  ·  {w2}  ·  {w3}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════ T2+ SECTIONS ═══════════════ */}
      {(tier === 't2' || tier === 't3') && (
        <>
          {/* Time Lord / Profection Year */}
          <div className="space-y-3 border border-border rounded-sm p-5 bg-card/60">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Profection Year & Time Lord</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Time Lord</div>
                <div className="text-sm font-medium text-foreground">{timeLord || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Profection House</div>
                <div className="text-sm font-medium text-foreground">
                  House {profHouse} — {HOUSE_THEME_SHORT[profHouse] || ''}
                  {profAge != null && <span className="text-xs text-muted-foreground ml-1">(Age {profAge})</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Moon Phase */}
          <div className="space-y-3 border border-border rounded-sm p-5 bg-card/60">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Moon Climate</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">SR Moon</div>
                <div className="text-sm font-medium text-foreground">{srMoonSign} in House {analysis.moonHouse?.house || '—'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Moon Phase</div>
                <div className="text-sm font-medium text-foreground">{moonPhase || '—'}</div>
                {moonPhaseDesc && <div className="text-xs text-muted-foreground mt-0.5">{moonPhaseDesc}</div>}
              </div>
            </div>
          </div>

          {/* Top Aspects */}
          {topAspects.length > 0 && (
            <div className="space-y-3 border border-border rounded-sm p-5 bg-card/60">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Key SR-to-Natal Aspects</div>
              <div className="space-y-2">
                {topAspects.map((asp, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-foreground w-36 shrink-0">
                      {asp.planet1} {asp.type} {asp.planet2}
                    </span>
                    <span className="text-xs text-muted-foreground">{asp.orb?.toFixed(1)}° orb</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════ T3 SECTIONS ═══════════════ */}
      {tier === 't3' && (
        <>
          {/* Stelliums */}
          {stelliums.length > 0 && (
            <div className="space-y-3 border border-border rounded-sm p-5 bg-card/60">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Stelliums</div>
              {stelliums.map((s, i) => (
                <div key={i} className="text-sm text-foreground">
                  <span className="font-medium">{s.location}</span>
                  <span className="text-muted-foreground ml-2">— {s.planets.join(', ')}</span>
                </div>
              ))}
            </div>
          )}

          {/* Element Balance */}
          {analysis.elementBalance && (
            <div className="space-y-3 border border-border rounded-sm p-5 bg-card/60">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Element Balance</div>
              <div className="grid grid-cols-4 gap-3">
                {(['Fire', 'Earth', 'Air', 'Water'] as const).map(el => (
                  <div key={el} className="text-center">
                    <div className="text-sm font-medium text-foreground">{el}</div>
                    <div className="text-xs text-muted-foreground">
                      {analysis.elementBalance?.[el.toLowerCase() as keyof typeof analysis.elementBalance] || 0}
                    </div>
                  </div>
                ))}
              </div>
              {analysis.elementBalance.dominant && (
                <div className="text-xs text-muted-foreground">
                  Dominant element: <span className="font-medium text-foreground">{analysis.elementBalance.dominant}</span>
                </div>
              )}
            </div>
          )}

          {/* Year-Defining Aspect */}
          {(analysis as any).yearDefiningAspect && (
            <div className="space-y-3 border border-border rounded-sm p-5 bg-card/60">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Year-Defining Aspect</div>
              <div className="text-sm font-medium text-foreground">
                {(analysis as any).yearDefiningAspect.planet1} {(analysis as any).yearDefiningAspect.type} {(analysis as any).yearDefiningAspect.planet2}
              </div>
              {(analysis as any).yearDefiningAspect.orb != null && (
                <div className="text-xs text-muted-foreground">{(analysis as any).yearDefiningAspect.orb.toFixed(1)}° orb</div>
              )}
            </div>
          )}

          {/* All SR-to-Natal Aspects (extended list) */}
          {(analysis.srToNatalAspects?.length || 0) > 5 && (
            <div className="space-y-3 border border-border rounded-sm p-5 bg-card/60">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">All SR-to-Natal Aspects</div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {analysis.srToNatalAspects?.map((asp, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="font-medium text-foreground w-36 shrink-0">
                      {asp.planet1} {asp.type} {asp.planet2}
                    </span>
                    <span className="text-muted-foreground">{asp.orb?.toFixed(1)}°</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Oracle AI Reading (appears after button click) */}
      {aiText && (
        <div className="border-t border-border pt-4 space-y-3">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Sparkles size={10} /> Your Oracle Reading
          </div>
          <div className="text-sm text-muted-foreground leading-[1.8] font-serif whitespace-pre-wrap">
            {aiText}
          </div>
        </div>
      )}
    </div>
  );
};
