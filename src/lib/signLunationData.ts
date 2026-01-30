// Sign-specific data for New Moon interpretations
// Each sign has expressions (positive keywords), shadow sides, and thematic guidance

export interface SignLunationData {
  expressions: string[];
  shadow: string[];
  overview: string;
  seedGuidance: string;
  themes: Array<{
    title: string;
    description: string;
  }>;
  intentionWords: string[];
  rulerNote?: string;
}

export const SIGN_LUNATION_DATA: Record<string, SignLunationData> = {
  Aries: {
    expressions: ['courage', 'initiative', 'independence', 'leadership', 'action', 'pioneering', 'assertiveness', 'vitality', 'passion', 'directness', 'authenticity', 'self-trust'],
    shadow: ['impatience', 'aggression', 'selfishness', 'recklessness', 'anger', 'impulsivity', 'burnout from going too fast', 'difficulty listening'],
    overview: 'This Aries New Moon invites bold beginnings and authentic self-expression. It marks a reset around identity, courage, and the willingness to take the first step.',
    seedGuidance: 'As a cardinal fire New Moon, it asks for courageous intention and willingness to act, even without a guaranteed outcome. Seeds planted now ignite quickly but need sustained attention.',
    themes: [
      { title: 'Reclaiming your fire', description: 'This lunation can reignite passion and remind you what you\'re fighting for. Where have you been playing small?' },
      { title: 'Begin before you\'re ready', description: 'Aries doesn\'t wait for permission. Take the first step now and figure out the rest as you go.' },
      { title: 'Anger as information', description: 'What has been frustrating you? Anger points to what matters. Channel it into action rather than suppression.' }
    ],
    intentionWords: ['courage', 'action', 'leadership', 'initiative', 'independence', 'vitality', 'pioneering', 'self-trust', 'authenticity', 'boldness']
  },
  Taurus: {
    expressions: ['stability', 'patience', 'sensuality', 'reliability', 'groundedness', 'values', 'abundance', 'beauty', 'comfort', 'persistence', 'self-worth', 'pleasure'],
    shadow: ['stubbornness', 'resistance to change', 'possessiveness', 'materialism', 'stagnation', 'over-indulgence', 'rigidity', 'fear of loss'],
    overview: 'This Taurus New Moon invites a grounded reset around values, resources, and what truly nourishes you. It marks a return to the body and the senses.',
    seedGuidance: 'As a fixed earth New Moon, it asks for patient intention and willingness to build slowly. Seeds planted now grow steadily with proper tending.',
    themes: [
      { title: 'Return to the body', description: 'This lunation calls you back into physical awareness. What does your body need? Honor its wisdom.' },
      { title: 'Clarify your values', description: 'What truly matters? Let go of what you\'ve outgrown and recommit to what feeds your soul.' },
      { title: 'Slow and steady wins', description: 'Taurus plays the long game. Build with patience and trust the process of gradual growth.' }
    ],
    intentionWords: ['stability', 'values', 'abundance', 'patience', 'groundedness', 'beauty', 'self-worth', 'nourishment', 'persistence', 'comfort']
  },
  Gemini: {
    expressions: ['curiosity', 'communication', 'adaptability', 'learning', 'connection', 'versatility', 'wit', 'networking', 'ideas', 'writing', 'teaching', 'flexibility'],
    shadow: ['scattered energy', 'superficiality', 'gossip', 'restlessness', 'inconsistency', 'overthinking', 'anxiety', 'difficulty committing'],
    overview: 'This Gemini New Moon invites fresh perspectives and new conversations. It marks a reset around communication, learning, and mental agility.',
    seedGuidance: 'As a mutable air New Moon, it asks for flexible intention and openness to where ideas lead. Seeds planted now sprout in multiple directions.',
    themes: [
      { title: 'Follow your curiosity', description: 'What are you eager to learn? Let questions lead you somewhere unexpected.' },
      { title: 'Clear communication', description: 'Say what you mean. Start conversations you\'ve been avoiding. Words have power now.' },
      { title: 'Connect the dots', description: 'Information wants to flow. Share ideas, network, and let synchronicities guide you.' }
    ],
    intentionWords: ['curiosity', 'communication', 'learning', 'connection', 'ideas', 'flexibility', 'networking', 'writing', 'teaching', 'adaptability']
  },
  Cancer: {
    expressions: ['nurturing', 'emotional depth', 'intuition', 'home', 'family', 'protection', 'sensitivity', 'care', 'memory', 'roots', 'belonging', 'comfort'],
    shadow: ['moodiness', 'clinginess', 'over-protection', 'emotional manipulation', 'difficulty letting go', 'taking things personally', 'victim mentality'],
    overview: 'This Cancer New Moon invites emotional renewal and a return to what feels like home. It marks a reset around family, inner life, and emotional security.',
    seedGuidance: 'As a cardinal water New Moon, it asks for heartfelt intention and emotional honesty. Seeds planted now grow from deep emotional roots.',
    themes: [
      { title: 'Tend your inner home', description: 'What needs nurturing in your inner world? Create safety within before seeking it outside.' },
      { title: 'Honor your roots', description: 'Family patterns and ancestral themes may surface. What do you carry forward? What ends with you?' },
      { title: 'Trust your feelings', description: 'Intuition is heightened. Let emotional wisdom guide you rather than logic alone.' }
    ],
    intentionWords: ['nurturing', 'home', 'family', 'emotional security', 'intuition', 'care', 'belonging', 'protection', 'roots', 'comfort']
  },
  Leo: {
    expressions: ['creativity', 'self-expression', 'confidence', 'generosity', 'joy', 'leadership', 'warmth', 'playfulness', 'heart', 'courage', 'radiance', 'authenticity'],
    shadow: ['ego inflation', 'need for validation', 'drama', 'arrogance', 'attention-seeking', 'pride', 'difficulty sharing spotlight', 'taking things too personally'],
    overview: 'This Leo New Moon invites creative expression and heart-centered living. It marks a reset around joy, self-expression, and what makes you feel alive.',
    seedGuidance: 'As a fixed fire New Moon, it asks for wholehearted intention and commitment to your creative vision. Seeds planted now need consistent warmth to flourish.',
    themes: [
      { title: 'Follow your heart', description: 'What brings you genuine joy? Make space for play, creativity, and self-expression.' },
      { title: 'Shine authentically', description: 'Stop dimming your light. The world needs your unique gifts and perspective.' },
      { title: 'Lead with love', description: 'Generosity and warmth open doors. Lead by example and inspire others through your own radiance.' }
    ],
    intentionWords: ['creativity', 'joy', 'self-expression', 'confidence', 'heart', 'playfulness', 'authenticity', 'generosity', 'radiance', 'courage']
  },
  Virgo: {
    expressions: ['service', 'health', 'refinement', 'discernment', 'skill', 'humility', 'practicality', 'healing', 'analysis', 'improvement', 'devotion', 'craftsmanship'],
    shadow: ['perfectionism', 'over-criticism', 'anxiety', 'workaholism', 'self-neglect in service to others', 'analysis paralysis', 'harsh self-judgment'],
    overview: 'This Virgo New Moon invites refinement and sacred service. It marks a reset around health, daily rituals, and the quality of your work.',
    seedGuidance: 'As a mutable earth New Moon, it asks for practical intention and willingness to improve. Seeds planted now grow through careful attention to detail.',
    themes: [
      { title: 'Refine your routines', description: 'Small daily habits create large results. What practices support your wellbeing?' },
      { title: 'Sacred service', description: 'How can you be genuinely useful? Service done with devotion becomes spiritual practice.' },
      { title: 'Good enough is good', description: 'Release perfectionism. Progress matters more than perfection. Start where you are.' }
    ],
    intentionWords: ['health', 'service', 'refinement', 'healing', 'skill', 'discernment', 'improvement', 'devotion', 'practicality', 'craftsmanship']
  },
  Libra: {
    expressions: ['balance', 'harmony', 'partnership', 'beauty', 'diplomacy', 'fairness', 'grace', 'cooperation', 'art', 'justice', 'relationship', 'peace'],
    shadow: ['people-pleasing', 'indecision', 'conflict avoidance', 'losing self in others', 'superficiality', 'passive aggression', 'dependency'],
    overview: 'This Libra New Moon invites relational reset and the pursuit of harmony. It marks a new beginning around partnerships, balance, and beauty.',
    seedGuidance: 'As a cardinal air New Moon, it asks for balanced intention and willingness to collaborate. Seeds planted now grow through right relationship.',
    themes: [
      { title: 'Relationship reset', description: 'What needs rebalancing in your partnerships? Give and receive in equal measure.' },
      { title: 'Find your center', description: 'Before seeking harmony outside, find it within. Your inner peace creates outer peace.' },
      { title: 'Beauty as medicine', description: 'Surround yourself with beauty. Art, music, and aesthetics nourish the soul now.' }
    ],
    intentionWords: ['balance', 'harmony', 'partnership', 'beauty', 'cooperation', 'fairness', 'peace', 'grace', 'relationship', 'diplomacy']
  },
  Scorpio: {
    expressions: ['transformation', 'depth', 'intimacy', 'power', 'healing', 'passion', 'investigation', 'regeneration', 'truth', 'intensity', 'commitment', 'psychological insight'],
    shadow: ['obsession', 'jealousy', 'control', 'manipulation', 'vengefulness', 'secrecy', 'fear of vulnerability', 'holding grudges', 'power struggles'],
    overview: 'This Scorpio New Moon invites deep transformation and emotional truth. It marks a reset around power, intimacy, and what lies beneath the surface.',
    seedGuidance: 'As a fixed water New Moon, it asks for profound intention and willingness to go deep. Seeds planted now transform through death and rebirth cycles.',
    themes: [
      { title: 'What needs to die', description: 'Transformation requires release. What are you holding onto that no longer serves your evolution?' },
      { title: 'Embrace your power', description: 'Reclaim power you\'ve given away. Stand in your truth without apology.' },
      { title: 'Intimacy and trust', description: 'Vulnerability is strength. Allow yourself to be truly seen by those who have earned your trust.' }
    ],
    intentionWords: ['transformation', 'power', 'healing', 'truth', 'depth', 'intimacy', 'regeneration', 'commitment', 'release', 'rebirth']
  },
  Sagittarius: {
    expressions: ['adventure', 'expansion', 'wisdom', 'truth', 'freedom', 'optimism', 'exploration', 'philosophy', 'teaching', 'faith', 'meaning', 'vision'],
    shadow: ['over-promising', 'restlessness', 'dogmatism', 'escapism', 'commitment-phobia', 'tactlessness', 'excess', 'grass-is-greener syndrome'],
    overview: 'This Sagittarius New Moon invites expansion and the quest for meaning. It marks a reset around beliefs, adventure, and your larger vision.',
    seedGuidance: 'As a mutable fire New Moon, it asks for expansive intention and faith in the journey. Seeds planted now grow toward distant horizons.',
    themes: [
      { title: 'Expand your horizons', description: 'What adventure is calling? Whether inner or outer, say yes to growth and exploration.' },
      { title: 'Question your beliefs', description: 'Which beliefs still serve you? Release dogma and stay open to new truth.' },
      { title: 'Follow the meaning', description: 'What gives your life purpose? Align your actions with your deeper why.' }
    ],
    intentionWords: ['adventure', 'expansion', 'wisdom', 'freedom', 'meaning', 'faith', 'vision', 'truth', 'exploration', 'optimism']
  },
  Capricorn: {
    expressions: ['responsibility', 'integrity', 'commitment', 'long-term vision', 'maturity', 'discipline', 'self-authority', 'patience', 'legacy', 'steadfast', 'planning', 'grounded', 'structure', 'stability', 'business', 'money', 'ambition', 'achievement', 'organization', 'strategy', 'quiet leadership'],
    shadow: ['over-control', 'rigidity', 'burnout', 'self-criticism', 'emotional suppression', 'perfectionism', 'fear of failure', 'carrying too much alone', 'equating worth with productivity'],
    overview: 'This Capricorn New Moon invites a grounded reset around goals, priorities, and long-term direction. It marks a reset around inner authority, discipline, and the structures that support your well-being.',
    seedGuidance: 'As a cardinal earth New Moon, it asks for grounded intention and conscious commitment, even if the outer results are not yet visible. Seeds planted now take root and mature over time through consistency and self-trust.',
    themes: [
      { title: '"What\'s in your bones" is surfacing', description: 'This lunation can highlight family patterns and old rules we\'ve accepted as "just the way it is." Now we get to see the reality and choose what stays vs. what ends with us.' },
      { title: 'Plant seeds for the long game', description: 'This isn\'t "set intentions today, manifest tomorrow." Capricorn plays the long game. Begin with integrity, build step by step, commit to consistency and trust the timeline.' },
      { title: 'Be open to change', description: 'Change is not optional right now and this cycle supports updating systems, improving what\'s outdated, liberation/freedom, and choosing a new way forward.' }
    ],
    intentionWords: ['steadfast', 'planning', 'grounded', 'responsibility', 'legacy', 'structure', 'stability', 'business', 'money', 'ambition', 'achievement', 'strategy', 'discipline', 'organization'],
    rulerNote: 'With Saturn ruling this New Moon at the end of Pisces, there\'s a sense of letting something complete rather than pushing for answers. As both Saturn and Neptune prepare to enter Aries, we\'re making space for a new beginning and a different way forward.'
  },
  Aquarius: {
    expressions: ['innovation', 'freedom', 'community', 'originality', 'humanitarian', 'visionary', 'independence', 'progressive', 'friendship', 'idealism', 'awakening', 'authenticity'],
    shadow: ['detachment', 'rebellion for its own sake', 'emotional distance', 'contrarianism', 'alienation', 'feeling like an outsider', 'dismissing emotions as illogical'],
    overview: 'This Aquarius New Moon invites innovation and authentic self-expression. It marks a reset around community, freedom, and your unique contribution.',
    seedGuidance: 'As a fixed air New Moon, it asks for visionary intention and commitment to what makes you different. Seeds planted now grow through community and shared ideals.',
    themes: [
      { title: 'Embrace your weirdness', description: 'What makes you different is your gift. Stop trying to fit in and let your originality shine.' },
      { title: 'Community matters', description: 'Find your people. Connection with like-minded souls amplifies your impact.' },
      { title: 'Future-forward thinking', description: 'What world do you want to create? Align your actions with your vision for the future.' }
    ],
    intentionWords: ['innovation', 'freedom', 'community', 'authenticity', 'vision', 'independence', 'friendship', 'progress', 'originality', 'awakening']
  },
  Pisces: {
    expressions: ['spirituality', 'imagination', 'compassion', 'intuition', 'healing', 'transcendence', 'creativity', 'surrender', 'dreams', 'unity', 'forgiveness', 'faith'],
    shadow: ['escapism', 'victim mentality', 'boundary dissolution', 'addiction', 'martyrdom', 'confusion', 'avoidance', 'over-idealization', 'lack of grounding'],
    overview: 'This Pisces New Moon invites spiritual renewal and surrender to the mystery. It marks a reset around faith, imagination, and connection to something greater.',
    seedGuidance: 'As a mutable water New Moon, it asks for intuitive intention and trust in divine timing. Seeds planted now grow through faith and letting go.',
    themes: [
      { title: 'Surrender to the flow', description: 'Stop forcing. Let go of control and trust that you\'re being guided.' },
      { title: 'Heal through compassion', description: 'Forgiveness—of self and others—opens doors. Let compassion be your medicine.' },
      { title: 'Dream the vision', description: 'Imagination is a spiritual tool. Allow yourself to dream without limits.' }
    ],
    intentionWords: ['surrender', 'faith', 'healing', 'compassion', 'imagination', 'intuition', 'dreams', 'spirituality', 'forgiveness', 'unity']
  }
};

export function getSignLunationData(sign: string): SignLunationData | null {
  return SIGN_LUNATION_DATA[sign] || null;
}
