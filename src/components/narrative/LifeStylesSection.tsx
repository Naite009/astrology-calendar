import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Heart, Medal } from 'lucide-react';
import { PlanetHouseInfo, SignalsData } from '@/lib/narrativeAnalysisEngine';

interface Props {
  signals: SignalsData;
}

const getElement = (sign: string): string => {
  const fire = ['Aries', 'Leo', 'Sagittarius'];
  const earth = ['Taurus', 'Virgo', 'Capricorn'];
  const air = ['Gemini', 'Libra', 'Aquarius'];
  const water = ['Cancer', 'Scorpio', 'Pisces'];
  if (fire.includes(sign)) return 'Fire';
  if (earth.includes(sign)) return 'Earth';
  if (air.includes(sign)) return 'Air';
  if (water.includes(sign)) return 'Water';
  return 'Unknown';
};

// User expectation: this section should talk about the 10 core planets only.
const CORE_10 = new Set([
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
]);

const core10 = (planetHouses: PlanetHouseInfo[]) => planetHouses.filter((p) => CORE_10.has(p.planet));

function computeEducationStyle(planetHousesAll: PlanetHouseInfo[]) {
  const planetHouses = core10(planetHousesAll);
  const triggers: string[] = [];
  const traits: string[] = [];

  const mercury = planetHouses.find((p) => p.planet === 'Mercury');
  const jupiter = planetHouses.find((p) => p.planet === 'Jupiter');
  const thirdHousePlanets = planetHouses.filter((p) => p.house === 3);
  const ninthHousePlanets = planetHouses.filter((p) => p.house === 9);

  if (mercury) {
    triggers.push(`Mercury in ${mercury.sign} (${mercury.house}H)`);
    const element = getElement(mercury.sign);
    if (element === 'Fire') traits.push('learns best through action and enthusiasm');
    if (element === 'Earth') traits.push('prefers practical, hands-on learning');
    if (element === 'Air') traits.push('thrives on discussion and ideas');
    if (element === 'Water') traits.push('absorbs information intuitively and emotionally');

    if (mercury.house === 3) traits.push('naturally curious with strong short-term focus');
    if (mercury.house === 9) traits.push('drawn to philosophy and higher education');
    if (mercury.isRetrograde) traits.push('may process internally before speaking; reflective learner');
  }

  if (jupiter) {
    triggers.push(`Jupiter in ${jupiter.sign} (${jupiter.house}H)`);
    if (jupiter.house === 9) traits.push('strongly drawn to academia and teaching');
    if (jupiter.house === 3) traits.push('loves learning through variety and short courses');
  }

  if (thirdHousePlanets.length > 0) {
    triggers.push(`${thirdHousePlanets.length} planet(s) in 3rd house`);
    traits.push('active communicator; curious mind');
  }

  if (ninthHousePlanets.length > 0) {
    triggers.push(`${ninthHousePlanets.length} planet(s) in 9th house`);
    traits.push('naturally philosophical; drawn to big-picture study');
  }

  return {
    summary: traits.length ? `${traits.slice(0, 3).join('; ')}.` : 'Balanced learning style with no strong emphasis.',
    triggers,
  };
}

function computeAthleticStyle(planetHousesAll: PlanetHouseInfo[]) {
  const planetHouses = core10(planetHousesAll);
  const triggers: string[] = [];
  const traits: string[] = [];

  const mars = planetHouses.find((p) => p.planet === 'Mars');
  const sun = planetHouses.find((p) => p.planet === 'Sun');
  const firstHousePlanets = planetHouses.filter((p) => p.house === 1);
  const fifthHousePlanets = planetHouses.filter((p) => p.house === 5);

  if (mars) {
    triggers.push(`Mars in ${mars.sign} (${mars.house}H)`);
    const element = getElement(mars.sign);
    if (element === 'Fire') traits.push('explosive energy; competitive athlete');
    if (element === 'Earth') traits.push('endurance-based; steady power');
    if (element === 'Air') traits.push('strategic; thrives in team coordination');
    if (element === 'Water') traits.push('fluid movements; rhythm-based or flow sports');

    if (mars.sign === 'Aries') traits.push('born competitor; thrives under pressure');
    if (mars.sign === 'Scorpio') traits.push('intense focus; excels one-on-one');
    if (mars.sign === 'Capricorn') traits.push('disciplined training; long-game athlete');
    if (mars.house === 1) traits.push('physical presence is central to identity');
  }

  if (sun) {
    triggers.push(`Sun in ${sun.sign} (${sun.house}H)`);
    if (sun.house === 5) traits.push('shines in playful physical expression');
    if (sun.house === 1) traits.push('vitality is a core identity theme');
  }

  if (firstHousePlanets.length >= 2) {
    triggers.push(`${firstHousePlanets.length} planets in 1st house`);
    traits.push('body-forward; natural presence');
  }

  if (fifthHousePlanets.length > 0) {
    triggers.push(`${fifthHousePlanets.length} planet(s) in 5th house`);
    traits.push('sports as play; performs best when it’s fun');
  }

  return {
    summary: traits.length ? `${traits.slice(0, 3).join('; ')}.` : 'Athletic energy is present but not dominant.',
    triggers,
  };
}

function computeCareerStyle(planetHousesAll: PlanetHouseInfo[], signals: SignalsData) {
  const planetHouses = core10(planetHousesAll);
  const triggers: string[] = [];
  const traits: string[] = [];

  const mc = signals.midheaven;
  const saturn = planetHouses.find((p) => p.planet === 'Saturn');
  const sun = planetHouses.find((p) => p.planet === 'Sun');
  const tenthHousePlanets = planetHouses.filter((p) => p.house === 10);
  const sixthHousePlanets = planetHouses.filter((p) => p.house === 6);

  if (mc) {
    triggers.push(`MC in ${mc.sign}`);
    const element = getElement(mc.sign);
    if (element === 'Fire') traits.push('leadership-oriented; seeks recognition');
    if (element === 'Earth') traits.push('builds tangible structures; practical achievements');
    if (element === 'Air') traits.push('idea-driven; communication and systems');
    if (element === 'Water') traits.push('meaning-driven; care and impact');

    if (mc.rulerIsAngular) {
      triggers.push(`MC ruler ${mc.ruler} is angular`);
      traits.push('career is central to life direction');
    }
  }

  if (saturn) {
    triggers.push(`Saturn in ${saturn.sign} (${saturn.house}H)`);
    if (saturn.isAngular) traits.push('responsibility and structure define career');
    if (saturn.house === 10) traits.push('executive potential; late-blooming success');
  }

  if (sun && sun.house === 10) {
    triggers.push('Sun in 10th house');
    traits.push('identity tied to public achievement');
  }

  if (tenthHousePlanets.length >= 2) {
    triggers.push(`${tenthHousePlanets.length} planets in 10th house`);
    traits.push('strong public presence; career-focused');
  }

  if (sixthHousePlanets.length >= 2) {
    triggers.push(`${sixthHousePlanets.length} planets in 6th house`);
    traits.push('service-oriented; detail-focused work style');
  }

  return {
    summary: traits.length ? `${traits.slice(0, 3).join('; ')}.` : 'Balanced career approach with flexibility.',
    triggers,
  };
}

function computeRomanceStyle(planetHousesAll: PlanetHouseInfo[], signals: SignalsData) {
  const planetHouses = core10(planetHousesAll);
  const triggers: string[] = [];
  const traits: string[] = [];

  const venus = planetHouses.find((p) => p.planet === 'Venus');
  const moon = planetHouses.find((p) => p.planet === 'Moon');
  const mars = planetHouses.find((p) => p.planet === 'Mars');
  const fifthHousePlanets = planetHouses.filter((p) => p.house === 5);
  const seventhHousePlanets = planetHouses.filter((p) => p.house === 7);

  if (venus) {
    triggers.push(`Venus in ${venus.sign} (${venus.house}H)`);
    const element = getElement(venus.sign);
    if (element === 'Fire') traits.push('passionate; loves the chase');
    if (element === 'Earth') traits.push('sensual; values stability in love');
    if (element === 'Air') traits.push('mental connection first; flirtatious');
    if (element === 'Water') traits.push('deeply bonding; emotionally intense');

    if (venus.house === 5) traits.push('romantic at heart; loves courtship');
    if (venus.house === 7) traits.push('partnership-focused; seeks committed love');
    if (venus.house === 8) traits.push('all-or-nothing love; transformative bonds');
    if (venus.house === 12) traits.push('private about love; secret romance possible');
  }

  if (moon) {
    triggers.push(`Moon in ${moon.sign} (${moon.house}H)`);
    if (moon.house === 7) traits.push('emotional fulfillment through partnership');
    if (getElement(moon.sign) === 'Water') traits.push('needs deep emotional security');
  }

  if (mars) {
    triggers.push(`Mars in ${mars.sign}`);
    if (mars.sign === 'Scorpio' || mars.sign === 'Aries') traits.push('assertive in pursuit of love');
  }

  const venusAspects = signals.natalAspects.filter((a) => a.planet1 === 'Venus' || a.planet2 === 'Venus');
  if (venusAspects.some((a) => a.planet1 === 'Mars' || a.planet2 === 'Mars')) {
    triggers.push('Venus–Mars aspect');
    traits.push('strong romantic drive; passion matters');
  }
  if (venusAspects.some((a) => a.planet1 === 'Pluto' || a.planet2 === 'Pluto')) {
    triggers.push('Venus–Pluto aspect');
    traits.push('intense bonds; transformative relationships');
  }

  if (fifthHousePlanets.length >= 2) {
    triggers.push(`${fifthHousePlanets.length} planets in 5th house`);
    traits.push('love affairs are central; playful romance');
  }

  if (seventhHousePlanets.length >= 2) {
    triggers.push(`${seventhHousePlanets.length} planets in 7th house`);
    traits.push('strongly oriented toward partnership');
  }

  return {
    summary: traits.length ? `${traits.slice(0, 3).join('; ')}.` : 'Romantic nature is balanced and adaptable.',
    triggers,
  };
}

export function LifeStylesSection({ signals }: Props) {
  const planetHouses = signals.planetHouses;

  const education = computeEducationStyle(planetHouses);
  const athletic = computeAthleticStyle(planetHouses);
  const career = computeCareerStyle(planetHouses, signals);
  const romance = computeRomanceStyle(planetHouses, signals);

  const styles = [
    { key: 'education', icon: GraduationCap, label: 'Education Style', data: education },
    { key: 'athletic', icon: Medal, label: 'Athletic Style', data: athletic },
    { key: 'career', icon: Briefcase, label: 'Career Style', data: career },
    { key: 'romance', icon: Heart, label: 'Romance Style', data: romance },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Life Styles
          <Badge variant="outline" className="ml-2 text-[10px]">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {styles.map((style) => (
          <div key={style.key} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <style.icon className="h-5 w-5 text-primary" />
              <h4 className="font-medium text-sm">{style.label}</h4>
            </div>
            <p className="text-sm text-foreground mb-2">{style.data.summary}</p>
            <div className="flex flex-wrap gap-1">
              {style.data.triggers.map((trigger, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
