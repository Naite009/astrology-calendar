// Sign-specific Mercury retrograde guidance.
// Mercury Rx themes (review, revise, reconnect, back up, delay contracts) filtered
// through the sign Mercury is actually traveling — because the flavor of the
// review, the kind of miscommunication, and what needs re-doing changes by sign.

export interface MercuryRetroSignGuidance {
  headline: string;   // one-line felt-sense description
  reviewing: string;  // what specifically comes back up
  watchFor: string;   // the miscommunication / friction pattern
  doThis: string;     // concrete practice
}

export const MERCURY_RETRO_BY_SIGN: Record<string, MercuryRetroSignGuidance> = {
  Aries: {
    headline: "Old fights, quick tempers, and half-finished ideas circle back.",
    reviewing: "Impulsive words you sent, projects you launched too fast, arguments left unresolved.",
    watchFor: "Snapping before you think, restarting things you already quit, competitive misfires.",
    doThis: "Slow the send button. Finish one abandoned thing before starting a new one.",
  },
  Taurus: {
    headline: "Money, values, and slow-simmering resentments want a second look.",
    reviewing: "Budgets, subscriptions, possessions, and what you actually value versus what you tolerate.",
    watchFor: "Digging in on the wrong hill, banking glitches, delivery delays, wardrobe regret.",
    doThis: "Reprice, unsubscribe, declutter. Postpone big purchases if you can.",
  },
  Gemini: {
    headline: "Mercury retrograde in its home sign, so the classic chaos is loud.",
    reviewing: "Old emails, group chats, drafts, half-learned skills, siblings and neighbors.",
    watchFor: "Typos, missed texts, tech glitches, gossip loops, over-scheduling.",
    doThis: "Reply to the message you have been ignoring. Back up devices today.",
  },
  Cancer: {
    headline: "Family conversations and home logistics get pulled back onto the table.",
    reviewing: "Old family dynamics, unfinished conversations with a parent, the emotional history of your home.",
    watchFor: "Reading tone into texts, feeling misunderstood by people you love, home repairs re-opening.",
    doThis: "Say the sentence you have been rehearsing to a family member. Kindly.",
  },
  Leo: {
    headline: "Creative projects, past romances, and how you want to be seen come back around.",
    reviewing: "A creative piece you shelved, a person you used to date, feedback you brushed off.",
    watchFor: "Performative arguments, pride talking louder than truth, ex-energy.",
    doThis: "Reopen the creative file. Do not text the ex unless the reason is clean.",
  },
  Virgo: {
    headline: "Mercury retrograde in its other home sign, so systems and routines misbehave.",
    reviewing: "Work systems, health routines, appointments, everything you said you would fix.",
    watchFor: "Perfectionism spiraling, calendar mix-ups, health flare-ups asking for attention.",
    doThis: "Re-book the appointment. Re-audit one routine. Stop editing and ship.",
  },
  Libra: {
    headline: "Relationships and unfinished conversations with partners return for another pass.",
    reviewing: "A one-on-one you avoided, an agreement that never got clear, a person who ghosted.",
    watchFor: "People-pleasing your way into resentment, contract fine print, indecision loops.",
    doThis: "Have the direct conversation. Reread every contract before signing.",
  },
  Scorpio: {
    headline: "Buried truths, shared money, and old intimacy patterns rise for review.",
    reviewing: "Debts, taxes, inheritances, a trust that got broken, what you never said out loud.",
    watchFor: "Obsessive re-reading of old messages, jealousy replays, financial paperwork errors.",
    doThis: "Handle the paperwork you have been avoiding. Say the hard, true thing.",
  },
  Sagittarius: {
    headline: "Travel plans, beliefs, and big-picture statements get fact-checked.",
    reviewing: "A trip that got postponed, a belief you inherited, courses or teachers from your past.",
    watchFor: "Overpromising, itinerary chaos, arguing philosophy instead of listening.",
    doThis: "Rebook, reconfirm, and let a smaller opinion be enough today.",
  },
  Capricorn: {
    headline: "Career direction, authority figures, and long-term commitments come back for revision.",
    reviewing: "A job path, a boss dynamic, a reputation moment you want to correct.",
    watchFor: "Rigid decisions made under pressure, delayed approvals, structural cracks at work.",
    doThis: "Redraft the resume, the pitch, the ask. Do not lock in the new title yet.",
  },
  Aquarius: {
    headline: "Friend groups, community projects, and future plans want a second look.",
    reviewing: "A friendship that faded, a group you left, a vision you swore off.",
    watchFor: "Detaching to avoid feelings, tech and group-chat glitches, ideology over people.",
    doThis: "Message the friend you miss. Revisit the plan you shelved.",
  },
  Pisces: {
    headline: "Mercury moves slow through Pisces water — logic gets foggy, intuition gets loud.",
    reviewing: "Dreams, creative work, spiritual practices, and the parts of a story you never told clearly.",
    watchFor: "Fuzzy communication, misheard tone, escapism, over-trusting a good feeling.",
    doThis: "Write it down before you decide. Sleep on it. Choose the boring, clear sentence.",
  },
};

export const getMercuryRetroGuidance = (mercurySign: string): string => {
  const g = MERCURY_RETRO_BY_SIGN[mercurySign];
  if (!g) {
    return `Mercury Retrograde in ${mercurySign}. Review, revise, and reconnect. Back up devices, reread contracts before signing, and expect small delays in tech and travel.`;
  }
  return `Mercury Retrograde in ${mercurySign}. ${g.headline} Coming back up: ${g.reviewing} Watch for: ${g.watchFor} Do this: ${g.doThis}`;
};
