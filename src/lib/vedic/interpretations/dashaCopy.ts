/**
 * Felt-sense copy for the nine Vimshottari dasha lords.
 * Written as a life chapter: what the period asks for, what it gives back, and
 * the trap it tends to set. Conditional language only. No fated claims.
 */

import { VedicPlanet } from '../nakshatras';

export interface DashaCopy {
  title: string;
  asks: string;
  gives: string;
  trap: string;
}

export const DASHA_COPY: Record<VedicPlanet, DashaCopy> = {
  Sun: {
    title: 'the visible years',
    asks: 'that you stop deferring and put your own name on the work',
    gives: 'recognition, clearer authority, a role that fits the person you actually became',
    trap: 'proving yourself to people whose approval you no longer need',
  },
  Moon: {
    title: 'the domestic and emotional years',
    asks: 'that you tend to home, family and your own nervous system rather than pure output',
    gives: 'softer footing, closer relationships, a real sense of being held somewhere',
    trap: 'mood running the schedule, and deciding permanent things on a bad week',
  },
  Mars: {
    title: 'the push years',
    asks: 'that you take direct action and stop waiting for permission or consensus',
    gives: 'momentum, physical energy, wins that came from your own effort',
    trap: 'burning a relationship or a job over something you could have said calmly a month earlier',
  },
  Mercury: {
    title: 'the learning and dealmaking years',
    asks: 'that you get skilled, get organized and say the thing out loud in writing',
    gives: 'income from what you know, better networks, work that uses your actual intelligence',
    trap: 'staying so busy and so informed that nothing gets committed to',
  },
  Jupiter: {
    title: 'the expansion years',
    asks: 'that you say yes to something bigger than your current container',
    gives: 'growth, teachers, opportunity, often through people who open doors for you',
    trap: 'spreading wide and shallow, and taking the growth as proof you can skip the details',
  },
  Venus: {
    title: 'the pleasure, partnership and money years',
    asks: 'that you value what you value and let life be enjoyable rather than only earned',
    gives: 'relationships, beauty, comfort, money that arrives through people and taste',
    trap: 'keeping the peace at a cost you are not admitting to',
  },
  Saturn: {
    title: 'the structure years',
    asks: 'that you do the slow real work and let go of what was never going to hold',
    gives: 'competence, standing, results that do not evaporate',
    trap: 'reading the slowness as failure, and getting bleak instead of getting specific',
  },
  Rahu: {
    title: 'the hungry years',
    asks: 'that you go after the unfamiliar thing you have no track record in',
    gives: 'sudden reach, new worlds, a life that stops looking like your family\u2019s life',
    trap: 'never being satisfied, and mistaking scale for meaning',
  },
  Ketu: {
    title: 'the loosening years',
    asks: 'that you release what you are already done with, including identities that used to work',
    gives: 'clarity, skill that runs on autopilot, freedom from things that once controlled you',
    trap: 'checking out entirely instead of choosing what to keep',
  },
};

export function dashaCopy(lord: VedicPlanet): DashaCopy {
  return DASHA_COPY[lord];
}
