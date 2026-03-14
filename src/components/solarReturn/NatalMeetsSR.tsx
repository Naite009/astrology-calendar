import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

const OPPOSITES: Record<string, string> = {
  Aries: 'Libra', Taurus: 'Scorpio', Gemini: 'Sagittarius',
  Cancer: 'Capricorn', Leo: 'Aquarius', Virgo: 'Pisces',
  Libra: 'Aries', Scorpio: 'Taurus', Sagittarius: 'Gemini',
  Capricorn: 'Cancer', Aquarius: 'Leo', Pisces: 'Virgo',
};

const isOpposite = (s1: string, s2: string) => OPPOSITES[s1] === s2;
const ord = (n: number) => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

// Sun headline — always same sign, different house
function sunHeadline(house: number): string {
  const m: Record<number, string> = {
    1: 'Your core self takes center stage', 2: 'Your energy focuses on security and value',
    3: 'Your life force flows through communication', 4: 'Your vitality turns homeward',
    5: 'Your creative spark lights up', 6: 'Your energy refines daily life',
    7: 'You meet yourself through relationships', 8: 'Your growth happens through depth and transformation',
    9: 'Your perspective expands significantly', 10: 'Your purpose becomes publicly visible',
    11: 'Your energy connects with community', 12: 'Your vitality turns inward for renewal',
  };
  return m[house] || 'Your energy enters a new arena';
}

function sunBody(house: number): string {
  const m: Record<number, string> = {
    1: 'Identity and self-presentation are the year\'s primary arena. Others notice the changes before you do.',
    2: 'Finances, possessions, and self-worth dominate. What you build this year has staying power.',
    3: 'Writing, teaching, learning, and local connections absorb your energy. Your voice carries further.',
    4: 'Home, family, and emotional foundations are the priority. Real estate, a parent, or your living space matters most.',
    5: 'Creativity, romance, and self-expression are where your life force goes. Follow what delights you.',
    6: 'Health, daily routines, and work habits require conscious attention. Small changes compound.',
    7: 'Partnerships and one-on-one relationships define the year. Others reflect you back to yourself.',
    8: 'Shared resources, psychological depth, and transformation are in play. Nothing stays on the surface.',
    9: 'Travel, higher learning, and belief systems expand your world. The horizon is calling.',
    10: 'Career, public reputation, and legacy are front and center. What you do is seen.',
    11: 'Friendships, group projects, and future visions define the year. Your network is your net worth.',
    12: 'Solitude, rest, and spiritual work are the assignment. What you release matters as much as what you pursue.',
  };
  return m[house] || 'A new focus area commands your attention.';
}

// Moon headline
function moonHeadline(natal: string, sr: string): string {
  if (natal === sr) return 'Your emotional world stays in familiar territory';
  const q: Record<string, string> = {
    Aries: 'quickens and activates', Taurus: 'steadies and grounds',
    Gemini: 'lightens and opens', Cancer: 'deepens and softens',
    Leo: 'warms and brightens', Virgo: 'clarifies and refines',
    Libra: 'seeks harmony', Scorpio: 'intensifies',
    Sagittarius: 'expands and lifts', Capricorn: 'steadies and structures',
    Aquarius: 'detaches and sees clearly', Pisces: 'opens and dissolves boundaries',
  };
  return `Your emotional world ${q[sr] || 'shifts into new territory'}`;
}

function moonBody(natal: string, sr: string): string {
  if (natal === sr) return 'The SR Moon matches your natal Moon — emotional continuity this year. What feels natural is reinforced.';
  return `Your natal ${natal} Moon meets a ${sr} emotional climate this year. The shift asks you to process feelings through a different lens than usual.`;
}

// Rising headline
function risingHeadline(natal: string, sr: string): string {
  if (natal === sr) return 'Your natural presence is reinforced';
  const q: Record<string, string> = {
    Aries: 'becomes bolder and more direct', Taurus: 'grounds into quiet confidence',
    Gemini: 'becomes lighter and more curious', Cancer: 'softens and becomes more intuitive',
    Leo: 'becomes more visible and warm', Virgo: 'sharpens and becomes more purposeful',
    Libra: 'becomes more graceful', Scorpio: 'deepens and becomes more magnetic',
    Sagittarius: 'opens up and reaches further', Capricorn: 'becomes more focused and authoritative',
    Aquarius: 'becomes more independent', Pisces: 'becomes gentler and more compassionate',
  };
  return `Your presence ${q[sr] || 'takes on a new quality'}`;
}

function risingBody(natal: string, sr: string): string {
  if (natal === sr) return 'Others see you as you truly are this year. Your natural way of showing up is amplified.';
  return `Your natal ${natal} Rising shifts to ${sr} this year. How others perceive you and how you approach the world both change.`;
}

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
}

export const NatalMeetsSR = ({ analysis, srChart, natalChart }: Props) => {
  const natalSun = natalChart.planets?.Sun?.sign || '—';
  const natalMoon = natalChart.planets?.Moon?.sign || '—';
  const natalRising = natalChart.planets?.Ascendant?.sign || '—';
  const srMoon = analysis.moonSign || srChart.planets.Moon?.sign || '—';
  const srRising = srChart.planets.Ascendant?.sign || analysis.yearlyTheme?.ascendantSign || '—';
  const sunH = analysis.sunHouse?.house || 1;

  const cards = [
    {
      planet: 'Sun',
      natalTag: `${natalSun} natal`,
      srTag: `${sunH}H SR`,
      headline: sunHeadline(sunH),
      body: sunBody(sunH),
      showOpposite: false,
    },
    {
      planet: 'Moon',
      natalTag: `${natalMoon} natal`,
      srTag: `${srMoon} SR`,
      headline: moonHeadline(natalMoon, srMoon),
      body: moonBody(natalMoon, srMoon),
      showOpposite: isOpposite(natalMoon, srMoon),
    },
    {
      planet: 'Rising',
      natalTag: `${natalRising} natal`,
      srTag: `${srRising} SR`,
      headline: risingHeadline(natalRising, srRising),
      body: risingBody(natalRising, srRising),
      showOpposite: isOpposite(natalRising, srRising),
    },
  ];

  return (
    <div className="mb-4">
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
        How this year meets your natal chart
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((c) => (
          <div key={c.planet} className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground">{c.planet}</span>
              <div className="flex items-center gap-1">
                <span className="bg-purple-50 text-purple-800 text-[9px] font-medium px-1.5 py-0.5 rounded">{c.natalTag}</span>
                <span className="text-[9px] text-muted-foreground">→</span>
                <span className="bg-orange-50 text-orange-800 text-[9px] font-medium px-1.5 py-0.5 rounded">{c.srTag}</span>
              </div>
            </div>
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-foreground mb-1 leading-snug">{c.headline}</div>
              <div className="text-[11px] text-muted-foreground leading-relaxed">{c.body}</div>
              {c.showOpposite && (
                <span className="inline-block text-[9px] font-medium px-2 py-0.5 rounded-full mt-1.5 bg-amber-50 text-amber-800">
                  Opposite sign shift
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
