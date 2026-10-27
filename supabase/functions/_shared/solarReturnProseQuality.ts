/** Shared authoring contract and fail-only heuristic. It never alters chart facts or repairs text by deletion. */
export const SOLAR_RETURN_PROSE_STANDARD = `SOLAR RETURN CLIENT MEANING:
Use validated facts only. Natal and Solar Return houses are Placidus; only annual profections use Whole Sign.
Lead with annual profection/time lord and SR Sun house, then angular emphasis, tight defining contacts and repeated evidence. Never give all placements equal weight.
Every interpretive paragraph must name the life area, what changes, a concrete possible experience, and why that matters this year. Write to you in plain US English, no em dashes.
Translate a placement into a lived possibility, not a noun list. Describe what you may notice, discuss, choose, pay for, learn, schedule or change. Do not assume biography.
Do not describe interpretation machinery or use empty bridges: the point is how these areas meet, neither cancels the other, these themes interact, balance both, integrate these energies, this connects with, themes related to, worldview large enough to guide your choices.
Different houses are not automatically a conflict. Name opposing needs only when supplied evidence supports them; otherwise describe a practical connection. No invented tension section.
Evidence lines may state exact placements, chart source labels and orbs separately. A tight orb is not certainty; exact transit dates require verified solver hits. Unknown facts stay unknown.`;

const meta = /the point is how|(?:neither|not that one|one|it) cancels (?:the )?other|these themes interact|balance both|integrate (?:these|the) energies|this connects with|themes related to|worldview large enough|the return placement of|themes? (?:meet|interact) in actual choices|two different rooms|gap is where the growth|threads weave together|pulling you in two directions|honor both without choosing|finding a middle ground|beautifully aligned|good things naturally happen/i;
const overclaim = /\b(?:prophetic dreams|dreams are prophetic|health (?:issues|crises|improvements)|surgical procedures|surprise pregnancy|cannot (?:emotionally )?thrive|cannot do this year alone|hold(?:ing)? grudges|guaranteed|fated|destined|depression|hypochondria|traumas?|hidden enemies|your identity is destroyed|no going back|you (?:will|must|are forced to) (?:lose|suffer|face|change|heal|confront)|engagements, marriages|legal victories|gambling luck)\b/i;
export function solarReturnProseViolations(text: string): string[] {
  return [...(meta.test(text) ? ['Empty meta-synthesis or invented overlay model'] : []), ...(overclaim.test(text) ? ['Unsupported event, medical or psychological claim'] : []), ...(/\u2014/.test(text) ? ['Prohibited dash'] : [])];
}
// A verb alone is not enough: require an observable verb-object pair, not "learn about energies".
const scene = /\b(?:writ\w*|read\w*|stud\w*|teach\w*|learn\w*|explain\w*|discuss\w*|ask\w*|talk\w*|speak\w*|listen\w*|check\w*|review\w*|compar\w*|pay\w*|sav\w*|spend\w*|earn\w*|charg\w*|renegotiat\w*|schedul\w*|plan\w*|choos\w*|chang\w*|join\w*|meet\w*|finish\w*|start\w*|build\w*|set\w*|mak\w*|tak\w*|turn\w*|rest\w*|sleep\w*|notice\w*|say\w*|rehears\w*|rearrang\w*|practic\w*|travel\w*|apply\w*|organize\w*|clear\w*)\b[^.!?\n]{0,65}\b(?:course|class|skill|book|message|conversation|question|decision|agreement|contract|appointment|deadline|project|job|role|work|money|bill|budget|price|purchase|income|home|room|family|friend|partner|relationship|group|team|community|trip|travel|plan|schedule|routine|sleep|time|hour|meal|task|request|help|boundary|invitation|application|practice|draft|idea|belief|opinion|commitment|responsibility|yes|no|yourself|people)\w*\b/i;

export function validateSolarReturnProse(text: string): string[] {
  const errors: string[] = [];
  const paragraphs = text.split(/\n\s*\n/).map(p => p.replace(/^##[^\n]*(?:\n|$)/gm, '').trim())
    .filter(p => p && !/^(?:Evidence|Why astrologically|Source|Methodology|Reference):/i.test(p));
  for (const [i, paragraph] of paragraphs.entries()) {
    errors.push(...solarReturnProseViolations(paragraph).map(e => `Paragraph ${i + 1}: ${e}`));
    if (meta.test(paragraph)) errors.push(`Paragraph ${i + 1}: empty meta-synthesis or astrology machinery`);
    if (!/\b(?:you|your)\b/i.test(paragraph)) errors.push(`Paragraph ${i + 1}: missing second-person client meaning`);
    const sentences = paragraph.split(/(?<=[.!?])\s+/);
    if (!sentences.some(s => /\b(?:you|your)\b/i.test(s) && !meta.test(s) && scene.test(s))) errors.push(`Paragraph ${i + 1}: no concrete life manifestation`);
    if (/\b(?:questions, words, school|attention may return to)\b/i.test(paragraph)) errors.push(`Paragraph ${i + 1}: keyword-list interpretation`);
    if (/\u2014/.test(paragraph)) errors.push(`Paragraph ${i + 1}: prohibited dash`);
  }
  if (!paragraphs.length) errors.push('No interpretive paragraphs');
  return [...new Set(errors)];
}

/** One retry, same verified facts, then fail closed. Both gates run on every draft. */
export async function generateCheckedSolarReturnProse(
  generate: (feedback: string[]) => Promise<string>,
  validateFacts: (text: string) => string[],
  validateReading: (text: string) => string[],
): Promise<string> {
  let errors: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const text = await generate(errors);
    errors = [...validateFacts(text), ...validateReading(text)];
    if (!errors.length) return text;
  }
  throw new Error(`Reading withheld after quality retry: ${errors.join('; ')}`);
}