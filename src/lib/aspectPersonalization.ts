// Deterministic, felt-sense copy for a single ranked aspect in a specific chart.
// No AI calls. Follows project rules:
//   - plain language
//   - no em dashes
//   - describe what the person FEELS / DOES / NOTICES
//   - never a single trait
//   - dissociate aspects get a teaching callout explaining why Astro.com doesn't draw the line

import { RankedAspect, AspectName } from './aspectRanking';
import { HOUSE_MEANINGS } from './houseCalculations';

const PRETTY_NAME: Record<string,string> = {
  Sun: 'Sun', Moon: 'Moon', Ascendant: 'Ascendant', MC: 'Midheaven',
  Mercury: 'Mercury', Venus: 'Venus', Mars: 'Mars',
  Jupiter: 'Jupiter', Saturn: 'Saturn',
  Uranus: 'Uranus', Neptune: 'Neptune', Pluto: 'Pluto',
  NorthNode: 'North Node', SouthNode: 'South Node',
  Chiron: 'Chiron', Lilith: 'Lilith',
};

const SYMBOL: Record<string,string> = {
  Sun: '☉', Moon: '☽', Ascendant: 'ASC', MC: 'MC',
  Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄',
  Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', SouthNode: '☋',
  Chiron: '⚷', Lilith: '⚸',
};

export const prettyName = (k: string) => PRETTY_NAME[k] || k;
export const planetSymbol = (k: string) => SYMBOL[k] || k;

// Short mechanic, one sentence, per aspect type.
const MECHANIC: Record<AspectName,string> = {
  conjunction: 'These two energies fuse and act as one. You feel them together or not at all.',
  opposition: 'These two energies face each other and ask you to hold both sides without collapsing into one.',
  square: 'These two energies grind against each other until you build a structure that holds both.',
  trine: 'These two energies move together easily, which can make the gift invisible until you name it.',
  sextile: 'These two energies open a door when you walk toward it. It will not knock on its own.',
  quincunx: 'These two energies have nothing in common and refuse to merge. You keep adjusting between them and the adjustment is the work.',
  semisextile: 'These two energies sit next to each other in low-grade friction, like a tag rubbing your neck.',
};

// What each planet "wants" in lived terms.
const NEED: Record<string,string> = {
  Sun: 'to be seen for who you actually are',
  Moon: 'to feel safe inside your own body',
  Ascendant: 'to show up as yourself the moment you enter a room',
  MC: 'to be recognized for the work you do in public',
  Mercury: 'to think clearly and be understood when you speak',
  Venus: 'to be loved without performing for it',
  Mars: 'to act on what you want without apologizing',
  Jupiter: 'to expand, learn, and trust there is enough',
  Saturn: 'structure, mastery, and the right to say no',
  Uranus: 'freedom to break the rule you never agreed to',
  Neptune: 'something to dissolve into that is bigger than you',
  Pluto: 'to go to the bottom and come back changed',
  NorthNode: 'to grow into a self that does not yet feel natural',
  SouthNode: 'the comfort of the thing you already know how to do',
  Chiron: 'to stop hiding the wound that taught you how to help others',
  Lilith: 'to stop censoring the part of you that refuses to be tamed',
};

function houseLine(house: number | null): string {
  if (!house) return '';
  return HOUSE_MEANINGS[house]?.lifeArea || '';
}

function stackLine(stack: string[]): string {
  if (!stack.length) return '';
  const names = stack.map(prettyName).join(', ');
  return `This contact is also wired into ${names}, which means it does not show up alone. When one moves, the rest move with it.`;
}

function retroLine(aRetro: boolean, bRetro: boolean, a: string, b: string): string {
  const retros: string[] = [];
  if (aRetro) retros.push(prettyName(a));
  if (bRetro) retros.push(prettyName(b));
  if (!retros.length) return '';
  return `${retros.join(' and ')} is retrograde here, so the work happens inside first and only later shows up outside.`;
}

export function dissociateExplanation(aspect: AspectName): string {
  const aspectNice: Record<AspectName,string> = {
    conjunction: 'conjunction',
    opposition: 'opposition',
    trine: 'trine',
    square: 'square',
    sextile: 'sextile',
    quincunx: 'quincunx',
    semisextile: 'semi-sextile',
  };
  return `This is a dissociate ${aspectNice[aspect]}. The degrees are tight enough for the aspect to be real, but the two signs do not belong in this geometry, so most chart software (including Astro.com) leaves the line off the wheel. You feel it. The drawing just does not show it. That gap between what you sense and what the chart confirms is exactly where this contact lives.`;
}

export interface AspectCopy {
  headline: string;          // "Saturn in Aries (6H) ⚻ Uranus Rx in Libra (11H)"
  subline: string;           // orb + dissociate badge text
  mechanic: string;          // 1 sentence
  felt: string;              // 2 to 3 sentences personalized
  dissociate?: string;       // teaching callout, only when dissociate
}

export function buildAspectCopy(ra: RankedAspect): AspectCopy {
  const aLabel = `${planetSymbol(ra.a)} ${prettyName(ra.a)}${ra.aRetro ? ' Rx' : ''} in ${ra.aSign}${ra.aHouse ? ` (${ra.aHouse}H)` : ''}`;
  const bLabel = `${planetSymbol(ra.b)} ${prettyName(ra.b)}${ra.bRetro ? ' Rx' : ''} in ${ra.bSign}${ra.bHouse ? ` (${ra.bHouse}H)` : ''}`;
  const headline = `${aLabel}  ${ra.symbol}  ${bLabel}`;

  const orbDeg = Math.floor(ra.orb);
  const orbMin = Math.round((ra.orb - orbDeg) * 60);
  const subline = `Orb ${orbDeg}°${String(orbMin).padStart(2,'0')}'${ra.dissociate ? ' · dissociate' : ''}`;

  const mechanic = MECHANIC[ra.aspect];

  // Felt-sense, grounded in actual sign + house.
  const aNeed = NEED[ra.a] || `what ${prettyName(ra.a)} wants in you`;
  const bNeed = NEED[ra.b] || `what ${prettyName(ra.b)} wants in you`;
  const aHouseArea = houseLine(ra.aHouse);
  const bHouseArea = houseLine(ra.bHouse);

  let felt = `Your need ${aNeed}${aHouseArea ? `, which lives in ${aHouseArea},` : ''} is in direct conversation with your need ${bNeed}${bHouseArea ? `, which lives in ${bHouseArea}` : ''}. `;

  switch (ra.aspect) {
    case 'conjunction':
      felt += `In your body these two register as one signal. You will rarely feel only one of them at a time.`;
      break;
    case 'opposition':
      felt += `You will keep meeting people and situations that hold one side while you hold the other. The work is not to win, it is to stop outsourcing.`;
      break;
    case 'square':
      felt += `Every time you try to satisfy one, the other complains. You build the life that can hold both by getting tired of the swing.`;
      break;
    case 'trine':
      felt += `This combination already works, which is why you may not notice it until someone else points it out or until you stop using it.`;
      break;
    case 'sextile':
      felt += `It will not force anything. When you take one small step toward it, the room opens.`;
      break;
    case 'quincunx':
      felt += `Neither side will compromise and you will keep recalibrating for the rest of your life. The recalibration is not a failure, it is the relationship.`;
      break;
    case 'semisextile':
      felt += `It will not stop you, but it will keep clearing its throat in the background until you turn around and answer it.`;
      break;
  }

  const retro = retroLine(ra.aRetro, ra.bRetro, ra.a, ra.b);
  if (retro) felt += ` ${retro}`;

  // Stack: anything that conjoins either endpoint within 3°. Show only bodies not already in the pair.
  const combinedStack = Array.from(new Set([...ra.stackedWithA, ...ra.stackedWithB]))
    .filter(n => n !== ra.a && n !== ra.b);
  const stack = stackLine(combinedStack);
  if (stack) felt += ` ${stack}`;

  return {
    headline,
    subline,
    mechanic,
    felt,
    dissociate: ra.dissociate ? dissociateExplanation(ra.aspect) : undefined,
  };
}
