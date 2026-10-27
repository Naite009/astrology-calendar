import { validateSolarReturnProse } from '../../supabase/functions/_shared/solarReturnProseQuality';

/** Interpretive possibilities, not events. Input houses must already be verified by the caller. */
const life: Record<number, { area: string; action: string; purpose: string }> = {
  1: { area: 'how you introduce yourself and take the lead', action: 'practice stating what you want when you meet people', purpose: 'make choices that reflect your own priorities' },
  2: { area: 'your income and everyday spending', action: 'review your budget or compare what you earn with what you spend', purpose: 'make money decisions you can sustain' },
  3: { area: 'your conversations and everyday learning', action: 'study a skill, write more, or ask clearer questions in a conversation', purpose: 'use what you learn to make better daily decisions' },
  4: { area: 'your home and private life', action: 'rearrange your home or discuss how you share family responsibilities', purpose: 'make your home a place where you can rest' },
  5: { area: 'the things you enjoy and choose to create', action: 'start a creative project or make time for a hobby with a friend', purpose: 'give enjoyable work a real place in your schedule' },
  6: { area: 'your workload and daily routines', action: 'change your schedule or set a clearer limit on extra tasks', purpose: 'finish important work without giving every hour to it' },
  7: { area: 'your close relationships and agreements', action: 'discuss expectations with a partner or renegotiate an agreement', purpose: 'make commitments that both people understand' },
  8: { area: 'money and responsibilities you share with others', action: 'review a shared bill or discuss who pays for what', purpose: 'make shared agreements clearer before you commit' },
  9: { area: 'your studies and plans beyond your usual surroundings', action: 'take a course, plan a trip, or compare a belief with what you learn', purpose: 'choose a direction based on experience rather than assumption' },
  10: { area: 'your work and public responsibilities', action: 'apply for a role or discuss the responsibilities of your current job', purpose: 'choose work that deserves your time and effort' },
  11: { area: 'your friendships and shared plans', action: 'join a group or choose which team project to spend time on', purpose: 'build plans with people who want to contribute' },
  12: { area: 'your private time and unfinished work', action: 'clear time to rest or finish a project away from other people', purpose: 'make room in your schedule before taking on more' },
};
const changes: Record<string, string> = {
  Sun: 'You may give this more of your time and make it a clearer priority',
  Moon: 'You may notice that what happens here affects how settled you feel from day to day',
  Mercury: 'You may need more conversations or clearer information before you make decisions here',
  Venus: 'You may give more time to the people and activities you genuinely enjoy here',
  Mars: 'You may be more ready to act here, while requests for your time can test your limits',
  Jupiter: 'You may want to learn more or take on a bigger plan here, so checking the time and cost matters',
  Saturn: 'You may need to set clearer limits or make a commitment you can actually maintain here',
  Uranus: 'You may want to change a familiar routine here rather than keep doing it the same way',
  Neptune: 'You may need to check what was actually agreed here before acting on an assumption',
  Pluto: 'You may reconsider a commitment here when it takes more time or money than you want to give',
};
export function solarReturnOverlayMeaning(planet: string, srHouse: number | null, natalHouse: number | null): string {
  const annual = srHouse ? life[srHouse] : undefined, natal = natalHouse ? life[natalHouse] : undefined;
  if (!annual || !natal) return '';
  const body = planet.replace(/^the\s+/i, '');
  if (srHouse === natalHouse) return solarReturnHouseMeaning(srHouse, body);
  const text = `This year, choices about ${annual.area.replace(/^your /, '')} may affect ${natal.area}. For example, if you ${annual.action}, consider whether that changes how you ${natal.action}. ${changes[body] || changes.Sun}; checking that practical effect can help you ${natal.purpose}.`;
  if (validateSolarReturnProse(text).length) throw new Error('Solar Return overlay failed quality validation');
  return text;
}
export function solarReturnHouseDetail(house: number, planet: string) {
  const entry = life[house];
  if (!entry) return null;
  return { title: entry.area.replace(/^your /, ''), overview: solarReturnHouseMeaning(house, planet),
    experience: `You might ${entry.action}; notice whether this helps you ${entry.purpose}.`,
    focus: `If you choose to ${entry.action}, check how much time the plan needs before you commit.`,
    caution: `You can review the plan with the people involved before you take on another responsibility.` };
}
export function solarReturnHouseMeaning(house: number | null | undefined, planet = 'Sun'): string {
  const entry = house ? life[house] : undefined;
  if (!entry) return '';
  const text = `This year, ${entry.area} may need more attention. ${changes[planet] || changes.Sun}. You might ${entry.action}, so you can ${entry.purpose}.`;
  if (validateSolarReturnProse(text).length) throw new Error('Solar Return house meaning failed quality validation');
  return text;
}
export function solarReturnProfectionMeaning(house: number, lord: string, routeHouse: number | null | undefined): string {
  const entry = life[house], route = routeHouse ? life[routeHouse] : undefined;
  if (!entry) return '';
  if (!route || routeHouse === house) return solarReturnHouseMeaning(house, lord);
  const change = (changes[lord] || changes.Sun).replace(/, so checking the time and cost matters$/, ', with time and cost worth checking');
  const text = `This year, ${entry.area} may need more attention. You might ${entry.action}; pursuing that could also lead you to ${route.action}. ${change}, helping you ${entry.purpose}.`;
  if (validateSolarReturnProse(text).length) throw new Error('Solar Return profection meaning failed quality validation');
  return text;
}