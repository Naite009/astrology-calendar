/**
 * Deep placement copy for the Vedic tab.
 *
 * Style target: the specific, recognizable statements people react to in
 * Jyotish talks ("Mars in Cancer will fight for their mother"). Every line is
 * a concrete behavior or a real-life scene, not an adjective list.
 *
 * Rules: no em dashes, no jargon inside the sentence, present tense, second
 * person, one image plus one consequence.
 */

import { VedicPlanet } from '../nakshatras';

export const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;
export type VSign = typeof SIGNS[number];

type SignMap = Record<VSign, string>;
type HouseMap = Record<number, string>;

/* ---------------------------------------------------------------- signs -- */

export const PLANET_IN_SIGN: Record<VedicPlanet, SignMap> = {
  Sun: {
    Aries: 'You want to be first, and you would rather lead a small thing you started than inherit a big thing someone else built. Authority handed to you feels less real than authority you took.',
    Taurus: 'You want your position to be solid before you announce it. You will hold a job, a house or an opinion long past the point where others would have moved, because moving feels like losing ground.',
    Gemini: 'Your standing comes from what you know and how you explain it. You get respect in conversation, and you lose interest fast in any role where you cannot talk, teach or negotiate.',
    Cancer: 'You may lead by taking care of people, and criticism of your work can land as criticism of you personally. Family history and early authority figures are traditionally read as connected to how worth gets measured here, though that only becomes a firm reading when the rest of the chart repeats it.',
    Leo: 'You are comfortable being looked at and uncomfortable being ignored. You do your best work when your name is attached and your worst work when you are one anonymous name on a list.',
    Virgo: 'You prove yourself through competence, not presence. You would rather be the person who catches the error than the person on stage, and you quietly resent it when the stage person gets the credit.',
    Libra: 'You need other people to reflect you back before you feel sure. You lead through diplomacy and partnership, and you stall when a decision means someone will be unhappy with you.',
    Scorpio: 'You keep your real intentions private and let people find out later what you were actually doing. Power interests you more than applause, and you do not forget who doubted you.',
    Sagittarius: 'You need to believe in the thing before you will lead it. Teaching, advising and pointing at the bigger picture come naturally, and detail work drains you fast.',
    Capricorn: 'You take the long route deliberately and you respect people who earned it. Recognition usually comes later than you want, and when it comes it lasts.',
    Aquarius: 'You are the one who does not follow the format. You will hold an unpopular position for years and be proven reasonable eventually, and you are rarely comfortable inside a hierarchy.',
    Pisces: 'Your sense of self is porous. You take on the mood of whoever you are with, and you feel most yourself doing something creative, healing or spiritual rather than something titled.',
  },
  Moon: {
    Aries: 'You feel it fast and you say it fast, then it is over for you while everyone else is still holding it. You need something to push against or you get restless.',
    Taurus: 'You settle when your surroundings are calm, your food is good and no one is rushing you. Sudden change hits your body before it hits your mind.',
    Gemini: 'You process by talking, and if you cannot talk it out it circles. You need variety and new input the way other people need rest.',
    Cancer: 'You feel everything at full volume and you protect the people you love before you check whether they needed protecting. Home and mother are the center of your emotional map.',
    Leo: 'You need to be appreciated out loud, not assumed. Warmth comes easily from you, and being overlooked by someone you care about wounds more than an outright fight.',
    Virgo: 'You calm down by fixing something. Worry is your default background noise, and cleaning, listing or organizing genuinely regulates you.',
    Libra: 'You feel unsettled when the room is tense and you will smooth it over even at your own cost. You know what you want most clearly when someone else is in front of you.',
    Scorpio: 'You feel privately and intensely, and you show almost none of it. You are hard to fool and slow to trust, and you remember exactly how something felt years later.',
    Sagittarius: 'You need room. Optimism comes back to you quickly, and you get low when your life is small, repetitive or supervised.',
    Capricorn: 'You handle it rather than feel it, and you often had to grow up early. You give practical help easily and receive comfort awkwardly.',
    Aquarius: 'You watch your own feelings from a step back. You are loyal to your people and still need a lot of distance, and you feel most at home among unusual company.',
    Pisces: 'You absorb the mood of the room and cannot always tell whose feeling you are carrying. Time alone, water and music are not luxuries for you, they are maintenance.',
  },
  Mars: {
    Aries: 'You act first and negotiate after. Direct conflict does not scare you, and slow, indirect people exhaust you faster than opposition does.',
    Taurus: 'You are slow to anger and immovable once you are there. You fight by refusing rather than attacking, and money or property arguments bring it out.',
    Gemini: 'You fight with words and you usually win the exchange. You get impatient with anything that takes physical repetition, and you argue partly because it is interesting.',
    Cancer: 'You will fight for your mother, your family and your home, and you will not fight nearly that hard for yourself. Anger goes inward or sideways, comes out as silence or a sharp remark, and it lingers.',
    Leo: 'You defend your pride and your people in public. Being embarrassed in front of others makes you retaliate more than being wronged in private.',
    Virgo: 'Your anger looks like criticism. You go after the flaw with real energy, and you push hardest at work, at health and at anything sloppy.',
    Libra: 'You avoid the fight until you cannot, then it comes out all at once. You are better at fighting for someone else than for yourself.',
    Scorpio: 'You do not announce it. You wait, you plan, and you cut off completely rather than argue, and once you are done you are done.',
    Sagittarius: 'You fight for the principle, not the detail. You will risk a comfortable situation over something you believe, and you cool off as fast as you flared.',
    Capricorn: 'You use anger as fuel and put it into work. You are relentless on a long project and you have no patience for people who quit early.',
    Aquarius: 'You push against the rule itself. You will take on the system rather than the person, and you go cold rather than loud.',
    Pisces: 'Your energy runs in waves and direct confrontation drains you. You fight best on behalf of someone vulnerable, and you tend to escape rather than face it head on.',
  },
  Mercury: {
    Aries: 'You decide quickly and say it before it is polished. You are good in a crisis and impatient with long explanations.',
    Taurus: 'You think slowly and you do not change your mind because someone pushed. Once you have concluded something it stays concluded.',
    Gemini: 'You can talk your way into and out of almost anything. You hold several ideas at once and you get bored before you finish.',
    Cancer: 'You remember conversations emotionally, not literally. You think in stories and you take the tone of a message more seriously than the content.',
    Leo: 'You speak with authority and you like an audience. You do not enjoy being corrected in front of others, even when the correction is right.',
    Virgo: 'You catch the mistake everyone else skipped. You are precise, you edit yourself constantly, and overthinking is your main cost.',
    Libra: 'You phrase things so nobody is offended, which sometimes buries what you actually meant. You are a natural negotiator and a slow decider.',
    Scorpio: 'You research quietly and you do not share everything you found. You read subtext accurately and you ask questions with a purpose behind them.',
    Sagittarius: 'You speak in the big frame and skip the specifics. You are blunt without meaning harm, and people either find it refreshing or too much.',
    Capricorn: 'You say less than you know and you mean what you say. Your thinking is structured, practical and slightly pessimistic on purpose.',
    Aquarius: 'You arrive at conclusions no one else in the room reached. You are logical about things people usually feel about, and you dislike being told the standard answer.',
    Pisces: 'You know things before you can explain them, and you lose the thread when forced to be linear. Images, metaphors and music carry your thinking better than bullet points.',
  },
  Jupiter: {
    Aries: 'You grow by starting things. Your luck shows up when you move first, and your excess is taking on more than you can staff.',
    Taurus: 'You grow through steady accumulation and good taste. Comfort is easy for you to build and easy to over-indulge.',
    Gemini: 'You grow through learning, teaching and conversation. You know a little about everything and get talked out of depth by your own curiosity.',
    Cancer: 'You are generous with your family and your home is where your good fortune shows. Protecting people is your instinct and over-mothering is your excess.',
    Leo: 'You grow when you are given a stage and a title. Your generosity is real and public, and your blind spot is needing the credit.',
    Virgo: 'You grow through service and useful skill rather than through big vision. You undersell yourself and over-prepare.',
    Libra: 'You grow through partnership and fair dealing. Marriage, contracts and the right ally change your life more than your solo effort does.',
    Scorpio: 'You grow through what you survive and what you research deeply. Your beliefs are hard-won and you do not take a teacher on reputation alone.',
    Sagittarius: 'You grow through travel, teaching and belief. Faith comes easily, restraint does not, and you overpromise when you are excited.',
    Capricorn: 'Growth arrives late, earned and durable. You are skeptical of easy optimism and you would rather have a plan than a promise.',
    Aquarius: 'You grow through groups, causes and unconventional people. Your generosity is toward the collective more than the individual in front of you.',
    Pisces: 'You grow through compassion, imagination and letting go. Money and boundaries are the loose ends, meaning and mercy are the strength.',
  },
  Venus: {
    Aries: 'You fall for people fast and lose interest just as fast if the chase ends. You go after who you want directly.',
    Taurus: 'You want beauty you can touch: good food, comfort, steady affection. You are loyal and slow, and you will not be hurried in love or in spending.',
    Gemini: 'You are attracted to how someone talks. You need conversation and variety in a relationship, and silence reads to you as distance.',
    Cancer: 'You show love by feeding and protecting. You want emotional safety more than excitement, and you hold onto people long after they stopped earning it.',
    Leo: 'You want to be adored and you are warm and generous with the person who does it. Being taken for granted is the fastest way to lose you.',
    Virgo: 'You show love by doing useful things and you struggle to just receive. You notice everything about your partner, including the parts you should let go of.',
    Libra: 'You are genuinely good at relating and you dislike being single more than you admit. Beauty, balance and pleasant surroundings matter to you at a level others underestimate.',
    Scorpio: 'You do not do casual well. Attraction is all or nothing for you, jealousy is the risk, and depth is the reward.',
    Sagittarius: 'You need a partner who is also a friend and does not fence you in. You are attracted to people from a different background or country than yours.',
    Capricorn: 'You take love seriously and slowly, and you often end up with someone older, younger or in a different life stage. You show it by providing rather than by saying it.',
    Aquarius: 'You need friendship first and freedom throughout. You are drawn to unusual people and you resist the standard relationship script.',
    Pisces: 'You love in an idealizing way and you forgive too much. Romance, art and devotion are all one thing for you, and boundaries are the work.',
  },
  Saturn: {
    Aries: 'You had to learn patience the hard way. Your frustration is with your own pace, and you do best when you set your own deadline and keep it.',
    Taurus: 'Money and security are where life made you slow down. Stability arrives, later than you wanted, and it holds.',
    Gemini: 'You had to earn the right to speak. Early on you doubted your intelligence, and later you become the careful, precise one people rely on.',
    Cancer: 'Emotional safety was not automatic for you. You built your own sense of home, and you carry a certain guardedness that only close people ever see past.',
    Leo: 'Recognition came slowly and you learned not to depend on applause. You are wary of ego, sometimes to the point of shrinking your own contribution.',
    Virgo: 'You are hard on yourself about work and health. Discipline is genuinely available to you and so is quiet burnout.',
    Libra: 'Relationships are where the lesson lands. You take commitment seriously, you may marry later or once for keeps, and fairness is a live issue for you.',
    Scorpio: 'You went through something that changed the way you trust. You handle crisis competently and you do not talk about the cost.',
    Sagittarius: 'You had to build your own beliefs rather than inherit them. Formal teachers disappointed you and experience did not.',
    Capricorn: 'You are built for the long climb. Responsibility landed on you early and authority follows later than your peers, then it stays.',
    Aquarius: 'You are the reliable one inside groups, and you hold a certain distance from all of them. You take collective duty seriously and personal duty even more so.',
    Pisces: 'You carry a background sadness you rarely name. Boundaries, sleep and solitude are the practical medicine, and quiet service is where you find footing.',
  },
  Rahu: {
    Aries: 'You are hungry to be first and you sometimes charge in without the backing. The obsession is independence, and the correction is finishing what you start.',
    Taurus: 'You chase security, comfort and things you can hold. It is never quite enough, and the fix is defining a number that counts as sufficient.',
    Gemini: 'You want to know everything and be in every conversation. Information overload is your trap, depth is the correction.',
    Cancer: 'You want a family or a home that matches an image in your head. Emotional intensity runs high and the correction is accepting the ordinary version.',
    Leo: 'You want to be seen and recognized, sometimes badly enough to perform it. Real creative work is the way out of the craving.',
    Virgo: 'You chase perfection, technique and being useful. Health anxiety or overwork is the trap, and finishing at good enough is the discipline.',
    Libra: 'You chase relationships, image and being liked. Compromise past your own limit is the trap, and an honest no is the correction.',
    Scorpio: 'You are pulled toward power, secrets and what other people avoid. Intensity is not the problem, obsession is.',
    Sagittarius: 'You chase meaning, travel and the next belief system. Guru-hopping is the trap, practicing one thing is the correction.',
    Capricorn: 'You want status and the position that proves it. Ambition works for you as long as you notice when you have arrived.',
    Aquarius: 'You are pulled toward networks, technology and the unconventional. Scattering across too many groups is the trap, one contribution is the correction.',
    Pisces: 'You chase escape, imagination and the spiritual high. Substances, fantasy or over-giving are the risk, structured practice is the answer.',
  },
  Ketu: {
    Aries: 'You already know how to fight and you are tired of it. You disengage rather than assert, and you have to consciously choose to claim your own turn.',
    Taurus: 'You are unattached to possessions and can walk away from comfort easily. Money slips through unless you build a deliberate structure.',
    Gemini: 'You are quick with words and quietly bored by talking. You would rather be silent than clever, and information alone no longer satisfies you.',
    Cancer: 'You know how to care for people and you feel done with being the emotional container. Some distance from family or home is part of your pattern.',
    Leo: 'You have the ability to lead and no appetite for the spotlight. Praise means little to you, and you have to be persuaded to take credit.',
    Virgo: 'You are naturally skilled and detached from the details. You can fix it and you would rather not be the one who always does.',
    Libra: 'You know how to please people and you are worn out by it. Solitude appeals more than partnership, and you have to choose connection on purpose.',
    Scorpio: 'You have been through depth already and you avoid drama now. Occult or crisis material is familiar to you and no longer thrilling.',
    Sagittarius: 'You know the teachings and you are past needing the teacher. Belief is internal for you, and you quietly distrust institutions of faith.',
    Capricorn: 'You know how to work and carry weight, and you are unimpressed by status. Ambition burns out fast unless it means something to you.',
    Aquarius: 'You are familiar with groups and detached from all of them. You contribute and you never quite belong, and that is workable rather than tragic.',
    Pisces: 'You are naturally intuitive and inclined to withdraw. Spiritual life comes easily, and staying grounded in the practical world is the work.',
  },
};

/* --------------------------------------------------------------- houses -- */

export const PLANET_IN_HOUSE: Record<VedicPlanet, HouseMap> = {
  Sun: {
    1: 'People register you as someone in charge before you have done anything. Your sense of vitality and your confidence tend to move together, so when one is low the other usually follows.',
    2: 'Your voice carries authority and family expectations shaped what you think you are worth. Money is tied to standing.',
    3: 'You lead through effort, siblings and your own hands. Courage is something you built rather than inherited.',
    4: 'Home is where the authority question lives. Your father, your property or your inner peace is a running theme rather than a settled matter.',
    5: 'You shine through what you create and through your children. You need a personal outlet or the confidence goes flat.',
    6: 'You beat competition and you get through illness and debt by sheer will. Work is where you prove yourself.',
    7: 'Your identity is worked out through partnership. You need a strong counterpart and you compete with them at the same time.',
    8: 'You transform through crises that are not public. Research, other people\u2019s money and hidden matters shape your sense of self.',
    9: 'Belief, teachers and travel form you. You either follow your father\u2019s worldview closely or reject it completely.',
    10: 'Career is the main stage of your life. Visibility and reputation come to you, and your worth is tangled up with your job.',
    11: 'Gains come through networks and older friends. You are respected in groups and you want your circle to be impressive.',
    12: 'A twelfth house emphasis can create a strong pull toward privacy, retreat, independent work, behind-the-scenes roles, or periods away from constant visibility. It does not mean public recognition is impossible or unwanted, and many people with this placement build real authority quietly first.',
  },
  Moon: {
    1: 'Your mood shows on your face. People sense how you feel before you speak and you are read as approachable.',
    2: 'Your emotional security is tied to money, food and family. A low bank balance genuinely affects your mood.',
    3: 'You need frequent contact with siblings or close friends and small daily changes to feel alive.',
    4: 'Home and mother are the emotional center of your life. You need a place that feels like yours or nothing else settles.',
    5: 'Your feelings come out through creativity, romance and children. You need something to pour into.',
    6: 'You worry through your body and your routine. Stress lands as health, and service is how you soothe yourself.',
    7: 'Your emotional weather depends on your closest relationship more than you like to admit.',
    8: 'You feel deeply and privately, with sharp intuition and periodic emotional resets that change you.',
    9: 'You need meaning, travel and something to believe in. Your mother or a teacher shaped your worldview.',
    10: 'The public sees your feelings. Your career shifts with your mood, and you need work that matters to you emotionally.',
    11: 'You feel safest in a community. Friendships hold you the way family holds other people.',
    12: 'You need solitude, sleep and distance to regulate. Foreign places and quiet rooms restore you.',
  },
  Mars: {
    1: 'You come across as direct and physically present. You act on impulse and you carry a visible edge.',
    2: 'You fight about money and family, and you speak sharply when pushed. Earning is aggressive and fast.',
    3: 'You are brave in the everyday sense, competitive with siblings, and good with your hands.',
    4: 'The heat is at home. You defend your family fiercely and you argue there more than anywhere else.',
    5: 'You are competitive in creative work, romance and risk. You go after what you want directly.',
    6: 'You win fights, lawsuits and competition. Enemies do not last long, and your temper affects your health.',
    7: 'You attract intense partners and you argue with them. Passion and friction arrive together.',
    8: 'You handle crisis, surgery and other people\u2019s money without flinching. Anger runs deep and hidden.',
    9: 'You fight for your beliefs and you argue with authority figures and teachers.',
    10: 'You are driven in your career and willing to be the one who takes the heat publicly.',
    11: 'You go after gains hard and your friendships have a competitive edge.',
    12: 'Your energy is spent in private, on foreign or behind-the-scenes work. Suppressed anger costs you sleep.',
  },
  Mercury: {
    1: 'You are read as smart and young for your age. You think out loud and identify with your intelligence.',
    2: 'You earn through speaking, writing or selling, and your family valued being articulate.',
    3: 'Writing, messaging and short trips are your native ground. You are good at anything that needs quick hands and quick words.',
    4: 'You think at home, study at home and may work from there. Your mother shaped how you learn.',
    5: 'You are clever with creative work, teaching and games. You calculate risk rather than feel it.',
    6: 'You solve problems for a living. Detail work, health and systems suit you, and worry is the cost.',
    7: 'You negotiate for a living and you need a partner you can talk to. Business partnerships suit you.',
    8: 'You research what other people avoid. Secrets, finances and psychology are where your mind goes.',
    9: 'You teach, publish or advise. Your thinking wants a framework behind it.',
    10: 'You are known for what you say. Communication is the career, whatever the title on it.',
    11: 'You network and connect people, and you earn through groups and ideas rather than through one job.',
    12: 'You think privately and you may not trust your own conclusions until much later. Writing alone suits you.',
  },
  Jupiter: {
    1: 'You are read as generous and reasonable. Optimism protects you, and weight and excess are the physical risk.',
    2: 'Money comes with some ease and so does spending it. Family values matter to you.',
    3: 'You teach through everyday effort and you are the encouraging one among siblings and friends.',
    4: 'Home, mother and property are where the good fortune sits. You end up with a house that means something.',
    5: 'Children, creativity and teaching are the luck. Your judgment about risk is usually sound.',
    6: 'You grow through service and difficulty, and you are protected in health and legal matters more than most.',
    7: 'A partner genuinely improves your life. Marriage and contracts bring expansion.',
    8: 'You are protected through crisis. Inheritance, other people\u2019s money or deep study of hidden subjects features.',
    9: 'This is Jupiter at home in theme. Belief, teachers, travel and long study are the spine of your life.',
    10: 'Your career carries an ethical or teaching function. People trust you professionally.',
    11: 'Gains come through friends, groups and mentors. Your network is your asset.',
    12: 'Your growth is inward. Charity, retreat, foreign places and spiritual practice are where the return is.',
  },
  Venus: {
    1: 'People find you pleasant to look at and easy to be around. Comfort and beauty matter more to you than you say.',
    2: 'You earn through taste and voice. Good food, good things and family comfort are the pull.',
    3: 'Your charm is in the way you communicate. Sisters, friends and short trips feature in your pleasures.',
    4: 'You need a beautiful home and a calm one. Your mother or your house is a source of real pleasure.',
    5: 'Romance, creativity and children are where you come alive. You are drawn to performance and play.',
    6: 'You show love through service and you can end up doing too much for the wrong person. Work relationships blur.',
    7: 'Partnership is central. You want a spouse and you are good at relating, and you overweight the relationship in your life.',
    8: 'Attraction runs deep and complicated. Shared money and intimacy are the transformative area.',
    9: 'You are drawn to people from other cultures and to beauty found while traveling.',
    10: 'Your career involves style, people or aesthetics, and your likability is a professional asset.',
    11: 'Friendships bring both pleasure and income. You gain through women and through social circles.',
    12: 'Private pleasures, foreign love, and a tendency to give in relationships without being seen doing it.',
  },
  Saturn: {
    1: 'You matured early and you carry visible seriousness. You are hard on yourself about your own body and pace.',
    2: 'Money had to be earned slowly, and family resources were limited or conditional. Later stability is real.',
    3: 'Courage was built, not given. Sibling relationships carried weight or distance.',
    4: 'Home carried responsibility young. Peace at home is something you construct rather than inherit.',
    5: 'Creativity, children or romance came with delay or duty. What you make, you make properly.',
    6: 'You outlast everyone in daily work. Chronic issues need routine rather than intensity.',
    7: 'Commitment is serious business for you. Later marriage, an age gap, or a partner who is a duty as much as a joy.',
    8: 'Long endurance through hidden difficulty. You handle death, debt and crisis with grim competence.',
    9: 'You question inherited beliefs and build your own slowly. Formal teachers disappointed you.',
    10: 'Career is the long climb and the main lesson. Authority arrives late and holds.',
    11: 'Gains come slowly and through older or established people. Your circle is small and durable.',
    12: 'Isolation, hidden burdens and the need for solitude. Spiritual discipline suits you better than social religion.',
  },
  Rahu: {
    1: 'You want to be someone, and your image is a project. People misread you often, in both directions.',
    2: 'The hunger is money, family status and being heard. Speech can be exaggerated or magnetic depending on the day.',
    3: 'Restless ambition in everyday effort. Media, marketing and self-promotion suit the appetite.',
    4: 'Unusual home life, foreign residence, or a restless search for the place that feels right.',
    5: 'Big appetite for creativity, speculation and romance. Risk-taking needs a hard rule around it.',
    6: 'You go after competition, service and health with unusual force. Debt or litigation can spike, then resolve.',
    7: 'You are drawn to unconventional or foreign partners. The relationship is where the obsession sits.',
    8: 'Sudden change, hidden matters and other people\u2019s money. Research and occult subjects pull hard.',
    9: 'You chase teachers, belief systems and foreign travel, and you may reject the tradition you were given.',
    10: 'Strong drive for status and public role. Career can rise fast and needs an ethical floor.',
    11: 'Large networks and big gains. The circle can outgrow your ability to keep it real.',
    12: 'Foreign places, isolation and the imagination. Escape is the risk and spiritual depth is the payoff.',
  },
  Ketu: {
    1: 'You have some distance from your own identity and appearance. People sense you are not fully in the room.',
    2: 'Detachment from money and family assets. Speech is sparing and lands harder when you do use it.',
    3: 'You have skill you do not value. Effort feels pointless until you find something that means something.',
    4: 'Distance from home or mother. You may live far from where you started.',
    5: 'Complicated or delayed attachment to children and creative output. What you make is not for approval.',
    6: 'You dissolve competition rather than fight it. Health issues can be hard to diagnose neatly.',
    7: 'Detachment inside partnership. You need a relationship that allows separateness.',
    8: 'Natural pull toward the hidden, occult and mystical, with real intuition about crisis.',
    9: 'You have inherited spiritual knowledge and no patience for institutions of belief.',
    10: 'Ambivalence about career and status. You do the work well and you do not want the ladder.',
    11: 'You drift in and out of groups and gains arrive unpredictably. Wanting less actually helps here.',
    12: 'Strong placement for spiritual life. Solitude, foreign places and inner practice come naturally.',
  },
};

/* -------------------------------------------------- classic combinations -- */

interface Combo {
  test: (get: (p: VedicPlanet) => { sign: string; house: number | null } | undefined) => boolean;
  label: string;
  text: string;
}

const inSign = (p: VedicPlanet, s: VSign): Combo['test'] => g => g(p)?.sign === s;

export const CLASSIC_COMBOS: Combo[] = [
  {
    test: inSign('Mars', 'Cancer'),
    label: 'Mars in Cancer',
    text: 'You will fight for your mother and your family faster than you will fight for yourself. Anger goes quiet and sideways rather than loud, and it stays with you long after the incident.',
  },
  {
    test: inSign('Moon', 'Scorpio'),
    label: 'Moon in Scorpio',
    text: 'You feel at a depth you rarely show, and you had at least one early experience that taught you to keep your inner life private. Intuition about people is close to unfair.',
  },
  {
    test: inSign('Sun', 'Libra'),
    label: 'Sun in Libra',
    text: 'You measure yourself through other people\u2019s reactions, so a single piece of disapproval can outweigh ten compliments. Partnership is where your identity actually gets built.',
  },
  {
    test: inSign('Venus', 'Virgo'),
    label: 'Venus in Virgo',
    text: 'You express love as usefulness, and you notice your partner\u2019s flaws in high resolution. Being served rather than serving is the uncomfortable growth edge.',
  },
  {
    test: inSign('Jupiter', 'Capricorn'),
    label: 'Jupiter in Capricorn',
    text: 'Optimism does not come for free here. Growth arrives through structure and delay, and you trust what you built over what you were promised.',
  },
  {
    test: inSign('Saturn', 'Aries'),
    label: 'Saturn in Aries',
    text: 'You are impatient with your own pace and slow to start things you actually want. Once you set your own deadline rather than borrowing someone else\u2019s, the block lifts.',
  },
  {
    test: g => g('Mercury')?.sign === g('Sun')?.sign,
    label: 'Mercury with the Sun in one sign',
    text: 'Your thinking and your sense of self run on the same track, so criticism of your ideas feels like criticism of you. It also makes you quick and articulate about your own field.',
  },
  {
    test: g => {
      const m = g('Moon');
      const j = g('Jupiter');
      if (!m?.house || !j?.house) return false;
      const diff = Math.abs(m.house - j.house);
      return diff === 0 || diff === 6;
    },
    label: 'Gaja Kesari yoga (Moon and Jupiter in relationship)',
    text: 'Classically read as protection through good judgment: you tend to be believed, people extend you the benefit of the doubt, and you recover from setbacks faster than the situation warranted.',
  },
  {
    test: g => {
      const s = g('Sun');
      const mo = g('Moon');
      if (!s?.house || !mo?.house) return false;
      return Math.abs(s.house - mo.house) <= 1;
    },
    label: 'Sun and Moon close together',
    text: 'Who you are and what you feel are not separate departments. You are consistent and hard to talk out of your own read, and you get little internal contradiction to hide behind.',
  },
];
