/**
 * Classical single-placement statements.
 *
 * Short, old-book style declarations for one planet in one sign, the kind of line
 * you find in traditional texts ("Mars in Cancer: the native fights fiercely for
 * the mother and the home"). These are deliberately single-factor: no aspects,
 * no house pairing, no synthesis. They are used to show a person the plain
 * classical reading of each placement they actually have.
 */

export interface ClassicalPlacement {
  planet: string;
  sign: string;
  /** The classical declaration, one or two sentences. */
  statement: string;
  /** What it tends to look like in ordinary daily life. */
  inPractice: string;
}

export const CLASSICAL_PLACEMENTS: ClassicalPlacement[] = [
  // ---------------- SUN ----------------
  { planet: 'Sun', sign: 'Aries', statement: 'The native leads before being asked and would rather be wrong first than right late.', inPractice: 'You start things. You lose interest once the hard part becomes maintenance rather than launch.' },
  { planet: 'Sun', sign: 'Taurus', statement: 'The native builds slowly and will not be hurried, and what is built tends to last.', inPractice: 'You need to see the point before you move, and once you commit you are very hard to shift.' },
  { planet: 'Sun', sign: 'Gemini', statement: 'The native lives by curiosity and is known for talk, wit and quick turns of mind.', inPractice: 'You think out loud, follow several interests at once, and get restless in one lane.' },
  { planet: 'Sun', sign: 'Cancer', statement: 'The native shines through care of the family and the home, and takes personal things personally.', inPractice: 'Your mood follows the state of the house and the people in it more than your job title.' },
  { planet: 'Sun', sign: 'Leo', statement: 'The native is made warm and proud, and needs the work to be recognized as their own.', inPractice: 'You give generously and you notice, sharply, when credit goes somewhere else.' },
  { planet: 'Sun', sign: 'Virgo', statement: 'The native is known for usefulness, skill and correction rather than display.', inPractice: 'You feel like yourself when something is being improved, and edgy when things are sloppy.' },
  { planet: 'Sun', sign: 'Libra', statement: 'The native is known through relationship, and measures themselves in the mirror of others.', inPractice: 'You read the room fast, and you can lose your own preference while keeping the peace.' },
  { planet: 'Sun', sign: 'Scorpio', statement: 'The native is private in strength and will not show the whole hand.', inPractice: 'You go all in or not at all, and you remember what people did under pressure.' },
  { planet: 'Sun', sign: 'Sagittarius', statement: 'The native lives toward the larger view and cannot be fenced in by small rules.', inPractice: 'You need room, honesty and a reason. Fine print and closed doors make you argumentative.' },
  { planet: 'Sun', sign: 'Capricorn', statement: 'The native is made for responsibility, and rises late but permanently.', inPractice: 'You carry weight without complaining, and rest feels like something you have to earn.' },
  { planet: 'Sun', sign: 'Aquarius', statement: 'The native stands slightly outside the group and sees the system from there.', inPractice: 'You will not do a thing just because it is done that way, and you need independence more than approval.' },
  { planet: 'Sun', sign: 'Pisces', statement: 'The native takes in more than they can account for and is known for mercy.', inPractice: 'You absorb the atmosphere of a room, and you need time alone to tell which feelings were yours.' },

  // ---------------- MOON ----------------
  { planet: 'Moon', sign: 'Aries', statement: 'The native feels quickly and forgets quickly, and anger arrives before explanation.', inPractice: 'You react fast, then feel fine an hour later while others are still processing.' },
  { planet: 'Moon', sign: 'Taurus', statement: 'The native is steady in feeling and calmed by the body, by food, warmth and familiar things.', inPractice: 'You settle through routine and touch, and sudden change unsettles you more than you admit.' },
  { planet: 'Moon', sign: 'Gemini', statement: 'The native soothes feeling by naming it, and needs conversation to know their own mood.', inPractice: 'You talk or write your way to calm, and silence makes the worry louder.' },
  { planet: 'Moon', sign: 'Cancer', statement: 'The native is deeply bound to home and mother, and feeling runs the whole day.', inPractice: 'You need a safe base to function, and you feed people as a way of loving them.' },
  { planet: 'Moon', sign: 'Leo', statement: 'The native needs to be seen in order to feel safe, and warmth is returned generously.', inPractice: 'Being noticed steadies you. Being overlooked lands harder than it should.' },
  { planet: 'Moon', sign: 'Virgo', statement: 'The native calms by ordering things, and worry is the private cost of care.', inPractice: 'You clean, list and fix when upset, and you show love by handling details for people.' },
  { planet: 'Moon', sign: 'Libra', statement: 'The native cannot rest in a room where there is bad feeling between people.', inPractice: 'You smooth things over early, sometimes before you know what you actually wanted.' },
  { planet: 'Moon', sign: 'Scorpio', statement: 'The native feels at depth, keeps it hidden, and tests before trusting.', inPractice: 'You watch people closely, hold things a long time, and go quiet rather than explain.' },
  { planet: 'Moon', sign: 'Sagittarius', statement: 'The native is consoled by movement, distance and the sense that more is possible.', inPractice: 'You escape into plans, travel or study when low, and you hate being emotionally cornered.' },
  { planet: 'Moon', sign: 'Capricorn', statement: 'The native takes charge instead of being comforted, and learned early to manage alone.', inPractice: 'You handle the crisis first and feel it later, and asking for help feels like weakness.' },
  { planet: 'Moon', sign: 'Aquarius', statement: 'The native steps back from feeling in order to see it clearly.', inPractice: 'You explain your emotions rather than show them, and you need distance before closeness.' },
  { planet: 'Moon', sign: 'Pisces', statement: 'The native feels what is in the room, whether or not it belongs to them.', inPractice: 'You pick up other people's moods and carry them, and you need quiet to reset.' },

  // ---------------- MERCURY ----------------
  { planet: 'Mercury', sign: 'Aries', statement: 'The native speaks first and considers afterward, and the tongue is sharp.', inPractice: 'You decide fast and say the blunt thing, which is useful and occasionally expensive.' },
  { planet: 'Mercury', sign: 'Taurus', statement: 'The native is slow to speak and slow to change a settled opinion.', inPractice: 'You want time before answering, and once you have decided, argument rarely moves you.' },
  { planet: 'Mercury', sign: 'Gemini', statement: 'The native is quick in speech, many-sided in interest, and learns by talking.', inPractice: 'You hold several threads at once and finish thinking mid-sentence.' },
  { planet: 'Mercury', sign: 'Cancer', statement: 'The native thinks with memory and feeling, and recalls the tone rather than the words.', inPractice: 'You remember how a conversation felt years later, and you take remarks to heart.' },
  { planet: 'Mercury', sign: 'Leo', statement: 'The native speaks with authority and dislikes being corrected in front of others.', inPractice: 'You explain well and carry a room, and public correction stings for days.' },
  { planet: 'Mercury', sign: 'Virgo', statement: 'The native reasons precisely and catches the flaw others walk past.', inPractice: 'You edit as you read, and you would rather be accurate than agreeable.' },
  { planet: 'Mercury', sign: 'Libra', statement: 'The native weighs both sides and finds deciding harder than understanding.', inPractice: 'You see the fair version of every argument, which makes taking a side slow.' },
  { planet: 'Mercury', sign: 'Scorpio', statement: 'The native investigates rather than converses, and says less than is known.', inPractice: 'You research quietly, ask the pointed question, and keep your conclusions to yourself.' },
  { planet: 'Mercury', sign: 'Sagittarius', statement: 'The native speaks in the large view and is impatient with detail.', inPractice: 'You get the shape of a thing fast and skip the fine print, sometimes at a cost.' },
  { planet: 'Mercury', sign: 'Capricorn', statement: 'The native thinks in structures and will not speak until it can be defended.', inPractice: 'You plan in steps, say only what you can back up, and distrust hype.' },
  { planet: 'Mercury', sign: 'Aquarius', statement: 'The native reasons by system and departs from received opinion.', inPractice: 'You see the pattern others miss and get impatient with tradition offered as a reason.' },
  { planet: 'Mercury', sign: 'Pisces', statement: 'The native thinks in images and impressions rather than in lines.', inPractice: 'You know the answer before you can explain it, and precise words feel like a cage.' },

  // ---------------- VENUS ----------------
  { planet: 'Venus', sign: 'Aries', statement: 'The native loves by pursuit and cools when there is nothing left to win.', inPractice: 'You move first in attraction and lose interest when it becomes too easy.' },
  { planet: 'Venus', sign: 'Taurus', statement: 'The native loves steadily and through the senses, and stays long past the point of change.', inPractice: 'You show affection through comfort, food and touch, and you do not leave easily.' },
  { planet: 'Venus', sign: 'Gemini', statement: 'The native is won by conversation and bored by sameness.', inPractice: 'You need someone interesting to talk to more than someone impressive.' },
  { planet: 'Venus', sign: 'Cancer', statement: 'The native loves protectively and mixes affection with care.', inPractice: 'You look after the people you love, and withdraw into the shell when hurt.' },
  { planet: 'Venus', sign: 'Leo', statement: 'The native loves generously and requires that the love be visible.', inPractice: 'You give big, and you want to be chosen out loud rather than quietly.' },
  { planet: 'Venus', sign: 'Virgo', statement: 'The native loves through service and notices imperfection in what is loved.', inPractice: 'You show up practically, and you critique the thing you care about most.' },
  { planet: 'Venus', sign: 'Libra', statement: 'The native is made for partnership and is uneasy alone.', inPractice: 'You accommodate early in relationships, then resent the version of you that agreed.' },
  { planet: 'Venus', sign: 'Scorpio', statement: 'The native loves absolutely and does not share what is loved.', inPractice: 'You want all or nothing, and betrayal is not something you get over lightly.' },
  { planet: 'Venus', sign: 'Sagittarius', statement: 'The native loves freedom alongside the beloved and will not be held too closely.', inPractice: 'You need space and honesty in love, and you fade when it turns into obligation.' },
  { planet: 'Venus', sign: 'Capricorn', statement: 'The native loves through commitment and proof rather than through display.', inPractice: 'You take affection seriously, move slowly, and value someone who does what they said.' },
  { planet: 'Venus', sign: 'Aquarius', statement: 'The native loves as a friend first and refuses to be owned.', inPractice: 'You need independence inside closeness, and you keep an unusual set of loyalties.' },
  { planet: 'Venus', sign: 'Pisces', statement: 'The native loves without measure and can love the possibility rather than the person.', inPractice: 'You give more than is asked, and you sometimes stay for who someone could be.' },

  // ---------------- MARS ----------------
  { planet: 'Mars', sign: 'Aries', statement: 'The native strikes first and does not wait for permission to act.', inPractice: 'You move on impulse and burn hot, so the trick is choosing which fights to take.' },
  { planet: 'Mars', sign: 'Taurus', statement: 'The native is slow to rouse and impossible to move once roused.', inPractice: 'You avoid conflict a long time, then dig in completely and will not budge.' },
  { planet: 'Mars', sign: 'Gemini', statement: 'The native fights with words and scatters effort across many fronts.', inPractice: 'You argue well and start more than you finish, so energy leaks through the gaps.' },
  { planet: 'Mars', sign: 'Cancer', statement: 'The native will fight fiercely for the mother, the family and the home, but rarely for themselves directly.', inPractice: 'You are protective rather than combative. Anger comes out sideways, through mood and withdrawal, unless someone you love is threatened.' },
  { planet: 'Mars', sign: 'Leo', statement: 'The native acts with pride and cannot be driven, only led.', inPractice: 'You work hard when it matters to your name, and you will not be pushed around.' },
  { planet: 'Mars', sign: 'Virgo', statement: 'The native acts through skill and precision rather than force.', inPractice: 'You fight by being competent, and frustration turns into irritation over detail.' },
  { planet: 'Mars', sign: 'Libra', statement: 'The native resists open conflict and acts through negotiation.', inPractice: 'You hold anger back for the sake of fairness, then it comes out cold rather than hot.' },
  { planet: 'Mars', sign: 'Scorpio', statement: 'The native is relentless, strategic, and does not forget an injury.', inPractice: 'You do not explode, you wait. When you commit force it is total and controlled.' },
  { planet: 'Mars', sign: 'Sagittarius', statement: 'The native fights for the principle rather than for the ground.', inPractice: 'You go straight at hypocrisy and get bored once the argument is won.' },
  { planet: 'Mars', sign: 'Capricorn', statement: 'The native works with discipline and wins by outlasting.', inPractice: 'You channel anger into effort, and you tend to win by still being there at the end.' },
  { planet: 'Mars', sign: 'Aquarius', statement: 'The native rebels on principle and acts against the expected order.', inPractice: 'You resist being told, and your effort comes in unpredictable bursts rather than steady output.' },
  { planet: 'Mars', sign: 'Pisces', statement: 'The native acts indirectly and finds open assertion uncomfortable.', inPractice: 'You avoid, then act suddenly. You do far better fighting for someone than for yourself.' },

  // ---------------- JUPITER ----------------
  { planet: 'Jupiter', sign: 'Aries', statement: 'The native is favored when they begin, and grows through risk taken early.', inPractice: 'Luck arrives when you move first rather than when you wait for certainty.' },
  { planet: 'Jupiter', sign: 'Taurus', statement: 'The native increases through what is held and tended rather than what is chased.', inPractice: 'You grow through patience, ownership and steady accumulation.' },
  { planet: 'Jupiter', sign: 'Gemini', statement: 'The native grows through learning, teaching and many contacts, and can spread too wide.', inPractice: 'Opportunities come through conversation and referral. Focus is the missing ingredient.' },
  { planet: 'Jupiter', sign: 'Cancer', statement: 'The native is favored in matters of home, family and property, and grows by caring for others.', inPractice: 'Good fortune tends to arrive through family, houses and people who look after you.' },
  { planet: 'Jupiter', sign: 'Leo', statement: 'The native grows through generosity and visible confidence.', inPractice: 'Doors open when you lead openly, and close when you perform rather than give.' },
  { planet: 'Jupiter', sign: 'Virgo', statement: 'The native grows through craft and usefulness rather than through scale.', inPractice: 'Your increase comes from being very good at something specific.' },
  { planet: 'Jupiter', sign: 'Libra', statement: 'The native is favored through partnership and fair dealing.', inPractice: 'Your opportunities come through people, contracts and reputation for evenness.' },
  { planet: 'Jupiter', sign: 'Scorpio', statement: 'The native increases through other people's resources and through what is hidden.', inPractice: 'Growth comes through shared money, deep research or work others avoid.' },
  { planet: 'Jupiter', sign: 'Sagittarius', statement: 'The native is favored in travel, teaching and belief, and lives by the long view.', inPractice: 'Luck follows the honest expansion: distance, study, or telling the truth publicly.' },
  { planet: 'Jupiter', sign: 'Capricorn', statement: 'The native increases only through structure, and gifts arrive as responsibility.', inPractice: 'Growth is earned and slow, and it holds once it arrives.' },
  { planet: 'Jupiter', sign: 'Aquarius', statement: 'The native grows through community and through what has not been tried.', inPractice: 'Opportunity comes through networks, groups and unconventional routes.' },
  { planet: 'Jupiter', sign: 'Pisces', statement: 'The native is favored in mercy, art and faith, and gives without accounting.', inPractice: 'Good fortune arrives through generosity and through people you helped without a plan.' },

  // ---------------- SATURN ----------------
  { planet: 'Saturn', sign: 'Aries', statement: 'The native is restrained in action and must learn to move without permission.', inPractice: 'You hesitate at the moment of initiative, and confidence has to be practiced.' },
  { planet: 'Saturn', sign: 'Taurus', statement: 'The native learns through want, and security is built rather than inherited.', inPractice: 'Money and safety come slowly, and lessons arrive through scarcity and worth.' },
  { planet: 'Saturn', sign: 'Gemini', statement: 'The native is tested in speech and learning, and gains authority through study.', inPractice: 'You doubt your own voice early, then become the one people trust to explain things.' },
  { planet: 'Saturn', sign: 'Cancer', statement: 'The native is tested through home and family, and safety must be built rather than received.', inPractice: 'Early home life asked you to be the steady one, and you still find it hard to be looked after.' },
  { planet: 'Saturn', sign: 'Leo', statement: 'The native is restrained in self-display, and recognition must be earned twice.', inPractice: 'You hold back from the spotlight, and confidence comes from competence rather than praise.' },
  { planet: 'Saturn', sign: 'Virgo', statement: 'The native is bound to duty and to the fear of doing it wrong.', inPractice: 'You over-check and over-work, and the lesson is good enough rather than flawless.' },
  { planet: 'Saturn', sign: 'Libra', statement: 'The native learns through relationship, and commitment is weighed heavily.', inPractice: 'Partnership teaches you the hard lessons, and you take promises very seriously.' },
  { planet: 'Saturn', sign: 'Scorpio', statement: 'The native is tested in trust and control, and must learn to let go without losing power.', inPractice: 'You guard yourself closely, and letting anyone all the way in is the long work.' },
  { planet: 'Saturn', sign: 'Sagittarius', statement: 'The native is tested in belief, and must build a philosophy rather than borrow one.', inPractice: 'You question inherited faith, then construct something you can actually stand on.' },
  { planet: 'Saturn', sign: 'Capricorn', statement: 'The native is made for endurance and carries authority as a weight.', inPractice: 'You take on responsibility early and measure yourself by what you have handled.' },
  { planet: 'Saturn', sign: 'Aquarius', statement: 'The native is tested through belonging, and stands apart from the group.', inPractice: 'You feel outside the circle and build your own structures rather than joining existing ones.' },
  { planet: 'Saturn', sign: 'Pisces', statement: 'The native is tested through boundaries and must learn where they end.', inPractice: 'You absorb too much and over-give, and the work is limits without guilt.' },
];

/** Ordinal helper matching the app's house labels. */
const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

export interface MatchedClassicalPlacement extends ClassicalPlacement {
  house?: number;
  houseLabel?: string;
}

/**
 * Return the classical single-placement statements that apply to a chart,
 * in traditional planet order.
 */
export const getClassicalPlacementsForChart = (
  positions: { planet: string; sign: string; house?: number }[]
): MatchedClassicalPlacement[] => {
  const order = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  const out: MatchedClassicalPlacement[] = [];

  for (const planet of order) {
    const pos = positions.find((p) => p.planet === planet);
    if (!pos?.sign) continue;
    const entry = CLASSICAL_PLACEMENTS.find((c) => c.planet === planet && c.sign === pos.sign);
    if (!entry) continue;
    out.push({
      ...entry,
      house: pos.house,
      houseLabel: pos.house ? `${ordinal(pos.house)} House` : undefined,
    });
  }

  return out;
};
