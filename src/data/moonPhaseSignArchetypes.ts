// 96 Moon Archetypes — Raven Kaldera, "Moon Phase Astrology: The Lunar Key to Your Destiny"
// Each combination of Moon phase + zodiac sign produces a unique archetype name.

export interface MoonArchetype {
  name: string;
  essence: string;
  description: string;
  gifts: string[];
  challenges: string[];
  soulLesson: string;
  inRelationships: string;
}

/**
 * Kaldera's 8 phase labels mapped to the app's internal phase names.
 * His "Crescent" = our "Waxing Crescent", "Waking Quarter" = "First Quarter",
 * "Gibbous" = "Waxing Gibbous", "Disseminating" = "Waning Gibbous",
 * "Waning Quarter" = "Last Quarter", "Balsamic" = "Balsamic".
 */
export const MOON_PHASE_SIGN_ARCHETYPES: Record<string, Record<string, MoonArchetype>> = {
  // ──────────────────────────────────────────────────
  // 1 · NEW MOON — "In the Beginning"
  // ──────────────────────────────────────────────────
  'New Moon': {
    Aries: {
      name: "Infant's Moon",
      essence: "Pure impulse — the spark of new life before thought intervenes. Brave, raw, and utterly present.",
      description: "You arrived in this world like a spark — all impulse, no plan. The Infant's Moon carries the energy of the very first breath: urgent, vital, completely absorbed in the NOW. There is no past weighing you down and no future to fear. You act before you think, and that is both your superpower and your stumbling block. People born under this Moon have an extraordinary gift for cutting through complexity and getting straight to the heart of things. You don't deliberate — you MOVE. This can make you seem impatient or reckless, but underneath that urgency is a soul that trusts life so completely it doesn't need a safety net. Your journey is about learning to slow down just enough to let others catch up, without ever losing that magnificent instinct to leap.",
      gifts: ["Fearless initiative", "Raw honesty", "Ability to start fresh without baggage", "Infectious enthusiasm"],
      challenges: ["Impatience with slower processes", "Can burn out quickly", "May struggle to finish what you start", "Difficulty seeing others' perspectives"],
      soulLesson: "Learning that courage includes vulnerability — that the bravest thing you can do is sometimes to wait, to listen, to let someone else lead.",
      inRelationships: "You bring electric energy to partnerships. You fall fast and love fiercely. Your challenge is learning that love isn't a sprint — it's a dance that requires letting your partner lead sometimes."
    },
    Taurus: {
      name: "Dryad's Moon",
      essence: "The young tree spirit rooting down into the Earth for the first time. Sensual innocence and stubborn beauty.",
      description: "The Dryad's Moon is the soul learning to inhabit a body for the very first time. Everything is SENSATION — the feel of grass, the taste of food, the warmth of sunlight on skin. You experience the physical world with a freshness that others have long forgotten. There is a stubborn, beautiful simplicity to this Moon: you know what feels good and you move toward it. You know what feels wrong and you move away. This isn't indulgence — it's wisdom in its most primal form. Your challenge is that the world will try to complicate what you instinctively understand: that life is meant to be SAVORED. People may call you stubborn, but what they're really seeing is a soul that refuses to betray its own senses.",
      gifts: ["Deep sensory intelligence", "Natural patience", "Ability to create beauty and comfort", "Grounding presence for others"],
      challenges: ["Resistance to change", "Can mistake comfort for purpose", "May cling to possessions as security", "Slow to adapt when circumstances shift"],
      soulLesson: "Learning that true security comes from within — that you can trust your body's wisdom without clinging to the external things that make you feel safe.",
      inRelationships: "You are the most loyal, steady partner imaginable. You love through DOING — cooking, touching, providing. Your challenge is learning that emotional presence matters as much as physical comfort."
    },
    Gemini: {
      name: "Little Brother's Moon",
      essence: "Curiosity in its purest form — the child asking 'why?' a hundred times. Quick, restless, delighted.",
      description: "The Little Brother's Moon is the eternal student of the zodiac — the soul that arrived asking questions and has never stopped. Your mind is a hummingbird, darting from flower to flower, gathering nectar wherever it finds sweetness. You learn not through discipline but through DELIGHT. Whatever fascinates you, you absorb instantly; whatever bores you might as well not exist. This isn't superficiality — it's a soul so new to the mental realm that everything is equally interesting. Your gift is making connections that no one else sees, bridging worlds and ideas with effortless grace. Your journey is about learning which of the thousand paths before you is truly YOURS.",
      gifts: ["Lightning-fast learning", "Social adaptability", "Ability to translate complex ideas simply", "Eternal youthfulness of spirit"],
      challenges: ["Difficulty committing to one path", "Nervousness and mental restlessness", "May talk instead of feel", "Can scatter energy across too many interests"],
      soulLesson: "Learning that depth and breadth are not enemies — that you can be curious about everything while still going deep into something.",
      inRelationships: "You bring sparkle, conversation, and mental stimulation. You need a partner who can keep up with your mind. Your challenge is staying present when the conversation (or the relationship) gets uncomfortably deep."
    },
    Cancer: {
      name: "Mother's Daughter Moon",
      essence: "Deep emotional bonding — learning love through being held. Tender, intuitive, fiercely loyal.",
      description: "The Mother's Daughter Moon carries the imprint of the very first bond — the primal, wordless connection between parent and child. You feel EVERYTHING, and you feel it intensely. Your emotional radar is so sensitive that you often pick up on what others are feeling before they know it themselves. This is both your gift and your burden. You are here to learn what it means to nurture — not just others, but yourself. The danger is losing yourself in the emotional needs of everyone around you. The triumph is when you learn that the love you give so freely to others must also flow back to YOU.",
      gifts: ["Profound empathy", "Intuitive emotional intelligence", "Creating safe spaces for others", "Deep, lasting loyalty"],
      challenges: ["Over-identifying with others' pain", "Difficulty with boundaries", "Mood swings tied to environment", "Can use nurturing as a way to control"],
      soulLesson: "Learning that self-care is not selfish — that the best way to love others is from a full cup, not an empty one.",
      inRelationships: "You love with your whole being. Home and family are sacred to you. Your challenge is allowing your partner their own emotional space without interpreting distance as rejection."
    },
    Leo: {
      name: "Sun Child's Moon",
      essence: "The born performer, radiating warmth before knowing the word 'audience.' Playful royalty.",
      description: "The Sun Child's Moon is pure creative radiance — the soul that shines simply because shining is what it does. There is nothing calculated about your warmth; it pours out of you like sunlight. You have a natural gift for making others feel seen, valued, and entertained. Children and animals gravitate toward you because they recognize your authentic playfulness. Your challenge is that you need others to reflect your light back to you — when the audience disappears, you can feel strangely lost. Your journey is learning to shine for its own sake, regardless of whether anyone is watching.",
      gifts: ["Natural charisma", "Creative self-expression", "Ability to inspire joy in others", "Generous heart"],
      challenges: ["Need for constant validation", "Can dominate without realizing it", "May confuse attention with love", "Wounded deeply by being ignored"],
      soulLesson: "Learning that your worth is inherent — that the Sun doesn't need applause to rise each morning.",
      inRelationships: "You bring warmth, drama, and grand romantic gestures. You make your partner feel like the most important person in the world. Your challenge is sharing the spotlight and celebrating your partner's shine too."
    },
    Virgo: {
      name: "Maiden's Moon",
      essence: "The careful observer taking stock of the world with fresh, discerning eyes. Modest and precise.",
      description: "The Maiden's Moon is the soul learning to serve — but not as a servant. This is service as a sacred act, the careful attention to detail that makes the world function. You notice what others overlook: the crooked picture frame, the unspoken worry, the small thing that needs fixing. This isn't fussiness — it's LOVE expressed through attention. You show up for people not with grand gestures but with quiet, reliable care. Your challenge is turning that precise eye on yourself with the same compassion you offer others. The Maiden's journey is learning that you don't have to be perfect to be worthy.",
      gifts: ["Precise observation", "Practical problem-solving", "Humble service", "Discernment and good judgment"],
      challenges: ["Perfectionism and self-criticism", "Anxiety about getting things wrong", "Difficulty receiving praise", "Can focus on flaws and miss the beauty"],
      soulLesson: "Learning that imperfection is not failure — that the most sacred service includes being gentle with your own humanity.",
      inRelationships: "You show love through acts of service — remembering preferences, fixing problems, being reliably present. Your challenge is learning to receive as generously as you give."
    },
    Libra: {
      name: "White Knight's Moon",
      essence: "Idealistic quest for fairness and beauty — the soul that believes in a just world.",
      description: "The White Knight's Moon is the idealist of the zodiac — born with an unshakable belief that the world SHOULD be fair, beautiful, and harmonious. You are the champion of balance, the one who steps in when things feel unjust, who can't rest until equilibrium is restored. There is something deeply noble about this Moon — and something deeply painful, because the world so often fails to live up to your vision of how it should be. Your challenge is learning that true justice sometimes requires getting your hands dirty, that peace isn't always polite, and that the most important person to be fair to is yourself.",
      gifts: ["Natural sense of justice", "Eye for beauty and harmony", "Diplomatic skill", "Ability to see all sides"],
      challenges: ["Indecisiveness from seeing too many perspectives", "People-pleasing to avoid conflict", "Can sacrifice self for others' comfort", "May mistake peace for avoidance"],
      soulLesson: "Learning that standing up for yourself IS an act of justice — that your needs matter as much as everyone else's.",
      inRelationships: "You are the partner everyone dreams of — attentive, romantic, dedicated to making the relationship work. Your challenge is speaking up when things AREN'T working, even if it disrupts the harmony."
    },
    Scorpio: {
      name: "Raging Moon",
      essence: "Primal emotional intensity breaking through — raw power before it learns control.",
      description: "The Raging Moon is the most intense of the New Moon archetypes — a soul arriving with enormous emotional force but no container to hold it yet. You feel things at a depth that frightens others and sometimes frightens you. There is nothing moderate about your inner world: love is consuming, anger is volcanic, grief is oceanic. This isn't drama for its own sake — this is a soul so ALIVE that it cannot do anything halfway. Your journey is not to tame this intensity but to CHANNEL it. The Raging Moon that finds its purpose becomes the most transformative force in the zodiac. The one that doesn't can be self-destructive.",
      gifts: ["Emotional fearlessness", "Ability to transform through crisis", "Unflinching honesty", "Profound psychological insight"],
      challenges: ["Overwhelming emotional intensity", "Difficulty trusting others", "Can push people away to test them", "May mistake intensity for intimacy"],
      soulLesson: "Learning that vulnerability is the ultimate power — that letting someone see your soft underbelly takes more courage than any battle.",
      inRelationships: "You love with a totality that can be breathtaking. You want to merge completely. Your challenge is allowing your partner their own depths without trying to plumb every secret."
    },
    Sagittarius: {
      name: "Gypsy's Moon",
      essence: "Born wanderer — restless spirit that must roam before it can know home.",
      description: "The Gypsy's Moon is the soul born with an itch in its feet and a horizon in its eyes. You arrived in this life already looking BEYOND — beyond the family, beyond the neighborhood, beyond the known world. There is an enormous faith here, a trust that the universe will provide, that the next bend in the road will reveal something wonderful. You learn through experience, not instruction. You need SPACE — physical, mental, spiritual — the way others need food and water. Your challenge is that this restlessness can become running, and the destination you're really seeking might be something you carry within.",
      gifts: ["Adventurous spirit", "Philosophical breadth", "Infectious optimism", "Ability to inspire others to expand"],
      challenges: ["Commitment phobia", "Can mistake motion for progress", "May preach without practicing", "Difficulty with routine and detail"],
      soulLesson: "Learning that the greatest adventure is going deep — that the explored life is as rich as the explored world.",
      inRelationships: "You bring adventure, humor, and big-picture vision. You need a partner who has their own life and won't clip your wings. Your challenge is showing up for the ordinary days, not just the extraordinary ones."
    },
    Capricorn: {
      name: "Forgotten One's Moon",
      essence: "The child who learned self-reliance too early — serious, watchful, quietly strong.",
      description: "The Forgotten One's Moon is perhaps the most poignant of all 96 archetypes. This is the soul that arrived old — the child who had to parent themselves, who learned responsibility before they learned to play. There is an immense quiet strength here, a competence that others lean on without realizing it. You became your own authority because no one else was reliable enough. The gift is genuine self-sufficiency. The wound is a deep loneliness that you've learned to call independence. Your journey is discovering that needing people is not weakness — that the strongest thing the Forgotten One can do is ask for help.",
      gifts: ["Self-reliance", "Natural authority", "Ability to endure and persist", "Strategic long-term thinking"],
      challenges: ["Emotional guardedness", "Difficulty asking for help", "Can mistake isolation for independence", "May judge others as weak"],
      soulLesson: "Learning that connection is not dependency — that letting others carry some of the weight makes you stronger, not weaker.",
      inRelationships: "You are the rock. You provide stability, structure, and quiet devotion. Your challenge is letting your partner see the vulnerable child behind the competent adult."
    },
    Aquarius: {
      name: "Father's Son Moon",
      essence: "The intellectual child reaching for ideas bigger than itself — maverick from birth.",
      description: "The Father's Son Moon is the born outsider — the soul that arrived already questioning the rules. You think differently from everyone around you, and early in life you learned that being 'normal' wasn't an option. Rather than conforming, you doubled down on your uniqueness. This isn't rebellion for its own sake — it's a genuinely original mind that sees patterns and possibilities invisible to others. Your gift is your vision; your challenge is remembering that you live among humans, not concepts. The Father's Son must learn that emotional connection is not a distraction from their mission — it IS the mission.",
      gifts: ["Original thinking", "Ability to see the future", "Humanitarian vision", "Comfort with being different"],
      challenges: ["Emotional detachment", "Can intellectualize feelings", "May feel alienated from family", "Difficulty with one-on-one intimacy"],
      soulLesson: "Learning that the mind and the heart are not enemies — that your most revolutionary act might be falling in love.",
      inRelationships: "You bring intellectual stimulation, freedom, and progressive values. You need space and respect for your individuality. Your challenge is showing up emotionally, not just ideologically."
    },
    Pisces: {
      name: "Dreamer's Moon",
      essence: "Born between worlds — the soul that arrives already half in the spirit realm.",
      description: "The Dreamer's Moon is the mystic infant — a soul so recently arrived from the other side that the veil between worlds is still thin. You feel everything, absorb everything, and sometimes can't tell where you end and the rest of the world begins. Your inner life is rich beyond measure — dreams, visions, intuitions, and a sense of cosmic connection that others spend decades meditating to achieve. Your challenge is learning to function in a world that seems painfully solid and literal compared to the fluid reality you carry within. The Dreamer's journey is finding a bridge between the invisible world and the visible one.",
      gifts: ["Spiritual sensitivity", "Artistic vision", "Unconditional compassion", "Access to the collective unconscious"],
      challenges: ["Boundary dissolution", "Escapist tendencies", "Can absorb others' emotions as your own", "Difficulty with practical demands"],
      soulLesson: "Learning that incarnation is not imprisonment — that you chose this body, this life, for a reason, and that reason requires your full presence.",
      inRelationships: "You love without conditions and see the best in everyone. You create a magical, romantic atmosphere. Your challenge is staying grounded when the relationship requires practical decisions rather than beautiful feelings."
    },
  },

  // ──────────────────────────────────────────────────
  // 2 · WAXING CRESCENT — "Call to Action"
  // ──────────────────────────────────────────────────
  'Waxing Crescent': {
    Aries: {
      name: "Torch-Bearer's Moon",
      essence: "Carrying the flame forward — courage that lights the way for others.",
      description: "The Torch-Bearer lights the way through darkness — not because they're fearless, but because they've decided that someone HAS to go first. You carry an almost sacred sense of mission: there is something you must do, something you must fight for, and you cannot rest until you've done it. Unlike the Infant's Moon, you've begun to encounter resistance, and it has only made you more determined. The fire you carry isn't just for yourself — it illuminates the path for everyone behind you.",
      gifts: ["Moral courage", "Pioneer energy", "Ability to inspire action in others", "Willingness to go first"],
      challenges: ["Can burn yourself out carrying others' burdens", "Difficulty delegating", "May see retreat as failure", "Prone to crusading"],
      soulLesson: "Learning that the torch can be shared — that your strength inspires others to light their own flame.",
      inRelationships: "You are the protector, the one who fights for the relationship. Your challenge is letting your partner be strong too."
    },
    Taurus: {
      name: "Gardener's Moon",
      essence: "Patient cultivation — the one who plants seeds knowing they must wait for harvest.",
      description: "The Gardener's Moon understands something profound: that the most important things in life cannot be rushed. You are the patient cultivator, the soul who plants seeds in darkness and trusts they will grow. While others chase quick results, you are building something that will last generations. There is a quiet heroism in your patience — you show up every day, do the work, water the seeds, and wait. Your faith is not in magic but in PROCESS, and that makes you one of the most reliable souls in the zodiac.",
      gifts: ["Extraordinary patience", "Practical wisdom", "Ability to nurture growth over time", "Physical resilience"],
      challenges: ["Can become stuck in routines", "May resist necessary change", "Difficulty with spontaneity", "Can prioritize security over growth"],
      soulLesson: "Learning that some seasons require letting the garden lie fallow — that rest is part of the growth cycle.",
      inRelationships: "You are the steady, nurturing partner who builds a beautiful life brick by brick. Your challenge is allowing wild, unexpected growth alongside the carefully tended rows."
    },
    Gemini: {
      name: "Little Sister's Moon",
      essence: "Quick-witted adaptation — learning to survive through cleverness and charm.",
      description: "The Little Sister's Moon is the survivor who uses intelligence as a weapon and charm as a shield. You learned early that you couldn't overpower the world, but you could outsmart it. There is a quicksilver quality to your emotional responses — you adapt, you adjust, you find the angle that works. This isn't manipulation; it's a genuine gift for reading rooms, understanding people, and finding solutions where others see only problems. Your challenge is learning that you no longer need to be clever to be safe — that being straightforward is also an option.",
      gifts: ["Social intelligence", "Rapid adaptation", "Verbal brilliance", "Ability to connect diverse people and ideas"],
      challenges: ["Can use charm to avoid depth", "May not trust straightforward communication", "Restless when things settle", "Can scatter energy to avoid vulnerability"],
      soulLesson: "Learning that you can drop the clever mask and still be loved — that your truest self is more interesting than any performance.",
      inRelationships: "You keep things light, fun, and mentally engaging. You're the partner who always has something interesting to say. Your challenge is staying when the conversation turns painful."
    },
    Cancer: {
      name: "Mother's Son Moon",
      essence: "Fighting to protect what is loved — fierce nurturing disguised as gentleness.",
      description: "The Mother's Son Moon is the fierce protector — the gentle soul who becomes a lion when someone they love is threatened. You carry a deep programming around family, belonging, and emotional safety. You will build walls, fight battles, and move mountains to create a safe haven for your people. This isn't weakness disguised as strength — it IS strength, the kind that comes from knowing exactly what matters and being willing to defend it with everything you have. Your challenge is extending that fierce protection to yourself.",
      gifts: ["Fierce loyalty", "Emotional courage", "Creating safe emotional environments", "Ability to nurture without enabling"],
      challenges: ["Can be overprotective", "May struggle to leave the nest", "Difficulty with emotional boundaries", "Can absorb family patterns uncritically"],
      soulLesson: "Learning that the best protection is teaching others to protect themselves — that love grows stronger when given room.",
      inRelationships: "You create a sanctuary for your partner. Home is your love language. Your challenge is allowing your partner to venture out without interpreting it as abandonment."
    },
    Leo: {
      name: "Clown's Moon",
      essence: "Joy as a weapon against darkness — the performer who heals through laughter.",
      description: "The Clown's Moon carries medicine in its comedy. You discovered early that you could transform any situation with humor — that a well-timed joke could defuse tension, comfort a child, or make an impossible day bearable. This isn't frivolous entertainment; it's a genuine healing gift. The sacred clown has existed in every culture because laughter opens hearts that grief has closed. Your challenge is knowing when to drop the mask — when the situation calls not for a joke but for tears. The Clown who can cry is the most powerful healer of all.",
      gifts: ["Healing humor", "Ability to lighten heavy situations", "Creative expression through performance", "Making others feel included and seen"],
      challenges: ["Using humor to avoid pain", "Difficulty being taken seriously", "May perform instead of connect", "Can deflect with jokes when vulnerability is needed"],
      soulLesson: "Learning that your truest comedy comes from your truest tears — that the Clown's power lies in honesty, not evasion.",
      inRelationships: "You bring laughter, play, and creative spark. You make every day an adventure. Your challenge is being present for the serious conversations without reaching for a joke."
    },
    Virgo: {
      name: "Apprentice's Moon",
      essence: "Humble dedication to craft — the student who serves in order to master.",
      description: "The Apprentice's Moon is the dedicated learner — the soul that understands mastery requires submission to the discipline. You don't want shortcuts; you want to UNDERSTAND, from the ground up, how things truly work. There is a humility here that is actually a form of ambition: you know that the master was once the student, and you're willing to do the unglamorous work of learning. Your precision isn't perfectionism — it's devotion to excellence. Your challenge is remembering that the apprenticeship eventually ends, and it's time to trust your own authority.",
      gifts: ["Dedication to craft", "Willingness to learn", "Attention to detail", "Service-oriented excellence"],
      challenges: ["Can defer to authority too long", "May never feel 'ready enough'", "Self-criticism that blocks progress", "Difficulty claiming expertise"],
      soulLesson: "Learning that you already know more than you think — that at some point, the apprentice must become the master.",
      inRelationships: "You show love through devoted attention — learning your partner's needs and meeting them precisely. Your challenge is stepping into equal partnership rather than always serving."
    },
    Libra: {
      name: "Dancer's Moon",
      essence: "Grace under pressure — finding balance through movement and beauty.",
      description: "The Dancer's Moon moves through life with an innate sense of rhythm and balance. You understand instinctively that life is a dance — not a static pose, but a flowing series of adjustments and responses. Where others see conflict, you see choreography. Where others feel pressure, you find grace. This isn't avoidance of difficulty — it's a genuine ability to transform tension into beauty. Like a dancer who makes impossible movements look effortless, you navigate complex emotional and social situations with a lightness that belies the strength required. Your challenge is remembering that sometimes the dance requires stillness.",
      gifts: ["Social grace", "Ability to find beauty in difficulty", "Natural rhythm in relationships", "Aesthetic intelligence"],
      challenges: ["Can prioritize appearance over substance", "Difficulty standing still or alone", "May dance around problems instead of facing them", "Can lose yourself in the performance"],
      soulLesson: "Learning that the most powerful dance is the one performed for no audience — that grace is an internal quality, not an external performance.",
      inRelationships: "You bring elegance, romance, and flowing partnership. You intuitively know when to lead and when to follow. Your challenge is having the hard conversations that can't be danced around."
    },
    Scorpio: {
      name: "Blood Moon",
      essence: "Survival at its most primal — the will to endure what would destroy others.",
      description: "The Blood Moon is the survivor archetype at its most intense. You have known — or will know — experiences that strip everything away and leave only the essential. This isn't pleasant, but it is profoundly transformative. You understand something that lighter souls may never learn: that who you really are is not your job, your possessions, your relationships, or your story. Who you really are is what remains when all of that is gone. The Blood Moon's gift is an extraordinary resilience and an unflinching relationship with truth. You cannot be lied to because you have seen through the deepest lie: that death is the end.",
      gifts: ["Unbreakable resilience", "Deep truth-telling", "Ability to transform crisis into growth", "Fearlessness about darkness"],
      challenges: ["Can create crises unconsciously", "Difficulty trusting calm periods", "May mistake drama for meaning", "Can push people to their limits to test them"],
      soulLesson: "Learning that survival mode can become a prison — that you are allowed to thrive, not just endure.",
      inRelationships: "You love with fierce intensity and complete commitment. You want truth above all. Your challenge is allowing light, easy moments without suspecting what lurks beneath."
    },
    Sagittarius: {
      name: "Traveler's Moon",
      essence: "Setting out on the great journey — faith that the road will provide.",
      description: "The Traveler's Moon is the soul setting out on its first great journey — not just geographic but philosophical. You are driven by an irresistible need to UNDERSTAND, to see for yourself, to test received wisdom against lived experience. Unlike the Gypsy's Moon, which wanders for wandering's sake, the Traveler has a destination (even if that destination keeps changing). You collect experiences like other people collect possessions, and each adventure adds another chapter to the epic story of your life. Your challenge is learning that some of the most important journeys happen without ever leaving home.",
      gifts: ["Faith in life's journey", "Philosophical depth", "Cultural openness", "Ability to find meaning in experience"],
      challenges: ["Can overcommit to the search and miss the finding", "Difficulty being present", "May romanticize distance and otherness", "Restless with the familiar"],
      soulLesson: "Learning that the journey and the destination are not opposites — that you can arrive somewhere and still be a traveler.",
      inRelationships: "You bring vision, adventure, and intellectual passion. You need a partner who values growth. Your challenge is being fully present for the quiet, ordinary moments."
    },
    Capricorn: {
      name: "Mountain Climber's Moon",
      essence: "Disciplined ascent — the one who reaches the summit through sheer persistence.",
      description: "The Mountain Climber's Moon is the soul with its eyes fixed firmly on the summit. You don't dream about success — you PLAN for it. Every step is deliberate, every resource is conserved, every risk is calculated. This isn't cold ambition; it's a profound understanding that the mountain doesn't care about your feelings — it rewards only preparation and persistence. You inspire others not through words but through example: by continuing to climb when everyone else has turned back. Your challenge is remembering to look at the view along the way, and to notice the wildflowers growing in the cracks of the rock.",
      gifts: ["Strategic persistence", "Emotional resilience in adversity", "Natural leadership through example", "Long-term vision"],
      challenges: ["Can sacrifice joy for achievement", "Difficulty with detours or delays", "May judge yourself by external metrics", "Can be rigid in approach"],
      soulLesson: "Learning that the mountain was always a metaphor — that what you're really climbing toward is self-acceptance.",
      inRelationships: "You are the partner who builds a solid future. You show love through provision and planning. Your challenge is pausing the climb long enough to play, laugh, and be foolish together."
    },
    Aquarius: {
      name: "Father's Daughter Moon",
      essence: "Inheriting the intellectual mantle — the rebel who challenges the father's world.",
      description: "The Father's Daughter Moon is the soul that received its worldview from an intellectual lineage — and then set about questioning every part of it. You are the inheritor who challenges the inheritance, the student who surpasses the teacher, the daughter who takes her father's best ideas and makes them revolutionary. There is a fierce independence here that is actually an act of love: you honor the tradition by IMPROVING it. Your challenge is acknowledging that you didn't build from nothing — that your rebellion stands on the shoulders of what came before.",
      gifts: ["Intellectual courage", "Ability to build on tradition", "Revolutionary thinking rooted in deep knowledge", "Independence of thought"],
      challenges: ["Can reject the past too harshly", "May struggle with emotional inheritance", "Difficulty acknowledging debts to mentors", "Can be ideologically rigid"],
      soulLesson: "Learning that honoring your roots doesn't diminish your wings — that the most original ideas often grow from the deepest soil.",
      inRelationships: "You bring intellectual partnership and visionary planning. You need a partner who respects your independence. Your challenge is letting your guard down enough to be emotionally dependent."
    },
    Pisces: {
      name: "Mermaid Moon",
      essence: "Swimming between two worlds — the amphibious soul equally at home in feeling and form.",
      description: "The Mermaid Moon lives between worlds — half in the visible, practical world and half in the invisible world of feeling, dream, and spirit. You are amphibious, capable of functioning in both realms but never quite belonging completely to either. This gives you a unique perspective: you see what the land-dwellers miss and feel what the sea-dwellers cannot articulate. Your gift is translation — bridging the gap between the concrete and the mystical, the practical and the poetic. Your challenge is choosing which world to call home, knowing that either choice means leaving something behind.",
      gifts: ["Dual-world awareness", "Emotional and practical intelligence", "Ability to translate between worlds", "Creative fluidity"],
      challenges: ["Feeling split between two realities", "Difficulty fully committing to either", "Can feel homeless in both worlds", "May sacrifice depth for adaptability"],
      soulLesson: "Learning that you don't have to choose — that your gift IS the bridge, and bridges belong to both sides.",
      inRelationships: "You bring magic, emotional depth, and practical adaptability. You can meet your partner wherever they are. Your challenge is showing them where YOU are — your true home beneath the surface."
    },
  },

  // ──────────────────────────────────────────────────
  // 3 · FIRST QUARTER — "Internal Crisis"
  // ──────────────────────────────────────────────────
  'First Quarter': {
    Aries: {
      name: "Brigand's Moon",
      essence: "Crisis demands boldness — the outlaw who breaks rules to survive and protect.",
      description: "The Brigand's Moon is the soul forced into outlawry by circumstance. You didn't choose to break the rules — the rules broke you first. There is a fierce, Robin Hood quality here: you fight unfair systems, defy unjust authority, and protect the vulnerable by any means necessary. The crisis of this Moon is learning the difference between righteous rebellion and mere destruction. When you fight FOR something rather than just AGAINST something, you become an unstoppable force for justice.",
      gifts: ["Courage under fire", "Ability to act decisively in crisis", "Protective instinct for the underdog", "Willingness to defy unjust authority"],
      challenges: ["Can become addicted to conflict", "Difficulty distinguishing personal anger from righteous anger", "May create enemies unnecessarily", "Struggle with peacetime"],
      soulLesson: "Learning that the greatest battle is the one you don't have to fight — that true courage sometimes means putting down the sword.",
      inRelationships: "You are fiercely protective and passionate. You fight for your relationship. Your challenge is not fighting WITH your partner — turning your warrior energy toward the world, not each other."
    },
    Taurus: {
      name: "Woodcutter's Moon",
      essence: "Hard work through resistance — clearing the forest to make room for growth.",
      description: "The Woodcutter's Moon is the soul doing the hard, unglamorous work of clearing space for new growth. You chop wood, carry water, clear the land — not because it's exciting, but because it's NECESSARY. There is a powerful dignity in this Moon: you understand that before anything beautiful can grow, the ground must be prepared. The crisis here is in the relentlessness of the work — the temptation to stop, to rest before the clearing is done. Your strength is that you don't stop. Your challenge is knowing when the clearing is finished.",
      gifts: ["Work ethic", "Practical strength", "Ability to clear obstacles methodically", "Patience with hard processes"],
      challenges: ["Can work beyond the point of necessity", "Difficulty resting or celebrating", "May mistake busyness for productivity", "Resistance to help"],
      soulLesson: "Learning that the forest also needs some trees standing — that clearing everything leaves you with nothing to build from.",
      inRelationships: "You are the partner who does the work — literally and emotionally. You clear obstacles for the relationship. Your challenge is resting together in the clearing you've made."
    },
    Gemini: {
      name: "Liar's Moon",
      essence: "The crisis of truth and deception — learning that words have real power.",
      description: "The Liar's Moon is not actually about lying — it's about the CRISIS of truth. You are confronted with the enormous power of language: words can heal or destroy, illuminate or deceive, connect or manipulate. You've experienced both sides of this power, and the crisis is deciding how you'll use it. This Moon marks the soul wrestling with authenticity — the moment when clever word-play must give way to genuine communication. When you choose truth, your words become medicine. When you choose deception (even self-deception), they become poison.",
      gifts: ["Understanding language's power", "Ability to reframe reality", "Verbal agility and intelligence", "Seeing through others' deceptions"],
      challenges: ["Temptation to manipulate with words", "Difficulty with simple, direct truth", "Can spin narratives instead of facing facts", "May not trust others' words"],
      soulLesson: "Learning that the most powerful word is the honest one — that truth spoken simply needs no cleverness to support it.",
      inRelationships: "You are articulate and perceptive, able to name what others can't. Your challenge is using your verbal gifts to build bridges, not walls — to speak truth with kindness, not as a weapon."
    },
    Cancer: {
      name: "Weeping Moon",
      essence: "Emotional crisis breaks the heart open — grief that eventually becomes compassion.",
      description: "The Weeping Moon is the soul in the midst of emotional crisis — the heart cracking open wide enough to let the whole world in. This isn't weakness; it's the birth of true compassion. You have wept — for yourself, for others, for the state of the world — and in that weeping, you've discovered something precious: that tears are not the END of strength but the BEGINNING of wisdom. The crisis of this Moon is learning to feel without drowning, to grieve without losing yourself, to keep your heart open when everything in you wants to shut it down.",
      gifts: ["Profound emotional depth", "Compassion born from suffering", "Ability to hold space for others' grief", "Emotional authenticity"],
      challenges: ["Can become overwhelmed by feeling", "Difficulty with emotional boundaries", "May wallow instead of process", "Tendency to absorb collective pain"],
      soulLesson: "Learning that tears water the garden — that grief, fully felt and honored, transforms into the deepest compassion.",
      inRelationships: "You create profound emotional intimacy. You are unafraid of the depths. Your challenge is not drowning your partner in your ocean — giving them room to feel their own feelings alongside yours."
    },
    Leo: {
      name: "Actor's Moon",
      essence: "The crisis of authenticity — when the mask and the face must become one.",
      description: "The Actor's Moon faces the most existential crisis of the creative soul: WHO AM I when the performance stops? You've become so skilled at playing roles — the confident one, the funny one, the leader — that the line between the mask and the face has blurred. The crisis demands that you find out which parts are YOU and which parts are the character. This isn't about stopping the performance; it's about making the performance TRUE. The Actor who reconciles mask and face becomes the most authentic person in the room.",
      gifts: ["Creative self-expression", "Ability to embody different energies", "Understanding of human character", "Natural stage presence"],
      challenges: ["Identity confusion", "Difficulty knowing your authentic self", "Can perform love instead of feeling it", "Fear of being seen without the mask"],
      soulLesson: "Learning that the greatest role you'll ever play is yourself — that authenticity is the ultimate performance art.",
      inRelationships: "You bring passion, creativity, and an understanding of human nature. Your challenge is letting your partner see the person behind ALL the masks — the one who's just as scared and confused as everyone else."
    },
    Virgo: {
      name: "Counting Moon",
      essence: "Crisis of precision — when every detail matters and nothing can be wasted.",
      description: "The Counting Moon is the soul in the grip of the ultimate analytical crisis: the realization that details MATTER, that precision has consequences, that getting it wrong isn't just an inconvenience — it's a moral failing. This intense focus on accuracy can look like anxiety, and sometimes it is. But at its best, the Counting Moon produces the soul who catches the error that saves the project, the healer who notices the symptom that everyone else missed, the accountant whose diligence protects the vulnerable. The crisis is in learning when precision serves life and when it imprisons it.",
      gifts: ["Extraordinary attention to detail", "Ethical precision", "Ability to catch critical errors", "Service through accuracy"],
      challenges: ["Paralysis by analysis", "Anxiety about imperfection", "Can't see the forest for the trees", "May focus on controlling details when life feels uncontrollable"],
      soulLesson: "Learning that sometimes 'good enough' IS perfect — that life is not a ledger that must balance to the penny.",
      inRelationships: "You pay attention like no other partner — you notice and remember everything. Your challenge is not keeping score — allowing the relationship to be beautifully imprecise."
    },
    Libra: {
      name: "Black Knight's Moon",
      essence: "The dark side of justice — fighting for balance through uncomfortable confrontation.",
      description: "The Black Knight's Moon is the shadow side of Libra's quest for justice — the moment when the White Knight realizes that fairness sometimes requires a sword. You've tried diplomacy. You've tried compromise. And now you're learning that some situations cannot be balanced through niceness alone. The crisis is in accepting that you — the lover of harmony — must sometimes be the one who disrupts it. The Black Knight fights for justice BECAUSE they love peace, not in spite of it. Your challenge is wielding the sword without losing your soul.",
      gifts: ["Courage to fight for fairness", "Willingness to be uncomfortable for justice", "Ability to confront without cruelty", "Understanding both light and shadow sides of justice"],
      challenges: ["Can become what you fight against", "Difficulty returning to peace after battle", "May swing between avoidance and aggression", "Struggle with moral ambiguity"],
      soulLesson: "Learning that justice and mercy are partners, not opponents — that the strongest sword is sheathed in compassion.",
      inRelationships: "You bring honesty and a willingness to address what's unfair. Your challenge is knowing when to fight and when to forgive — and not punishing your partner for the world's injustices."
    },
    Scorpio: {
      name: "Executioner's Moon",
      essence: "Ruthless pruning — cutting away what is dead so the living can flourish.",
      description: "The Executioner's Moon is the most feared and most necessary archetype in the zodiac. You carry the blade that separates the living from the dead — in relationships, in careers, in beliefs, in identities. This isn't cruelty; it's the surgeon's precision applied to emotional and spiritual life. Something must die so something else can live, and you are the one willing to make that cut. The crisis is in bearing the weight of that responsibility — in accepting that the one who cuts also bleeds.",
      gifts: ["Ability to end what needs ending", "Emotional surgery precision", "Courage to face death and transformation", "Clearing space for new life"],
      challenges: ["Can cut too deep or too fast", "Difficulty with mercy", "May become identified with the role of destroyer", "Can cut off parts of yourself that still have life"],
      soulLesson: "Learning that the executioner is also the midwife — that every ending you facilitate is also a beginning.",
      inRelationships: "You bring transformative honesty and the willingness to prune what isn't working. Your challenge is remembering that some things need nurturing, not cutting — that love sometimes grows from the messy parts."
    },
    Sagittarius: {
      name: "Seeker's Moon",
      essence: "The crisis of meaning — when old beliefs shatter and new truth must be found.",
      description: "The Seeker's Moon marks the crisis of belief — the moment when the comfortable story you've been telling yourself about how the world works suddenly falls apart. This is not a gentle questioning; it's a COLLAPSE. The old meaning structure crumbles, and you're left standing in the rubble, asking the most terrifying question a Sagittarian can face: WHAT IF NOTHING MEANS ANYTHING? The gift of this crisis is that it forces you to find meaning that can't be shattered — truth so deep that no experience can destroy it. But finding that takes courage.",
      gifts: ["Willingness to question everything", "Ability to rebuild belief from the ground up", "Philosophical courage", "Deep authenticity"],
      challenges: ["Can become nihilistic during the search", "Difficulty trusting any belief system", "May swing between fanaticism and skepticism", "Existential anxiety"],
      soulLesson: "Learning that meaning is not discovered but CREATED — that you are the author of your own sacred text.",
      inRelationships: "You bring depth, questioning, and a refusal to settle for surface answers. Your challenge is not subjecting your partner to constant philosophical interrogation — allowing some things to simply BE."
    },
    Capricorn: {
      name: "Miner's Moon",
      essence: "Digging deep into the earth — extracting treasure from the most resistant rock.",
      description: "The Miner's Moon goes DOWN when everyone else is looking UP. You understand that the real treasure is buried deep — in the earth, in the psyche, in the hardest parts of human experience. You're willing to descend into darkness, to work in cramped conditions, to chip away at resistant rock, because you know that diamonds form under pressure. The crisis of this Moon is the claustrophobia of the descent — the moments when you wonder if you'll ever see daylight again. But you always do, and you always come back with treasure.",
      gifts: ["Willingness to do the deep work", "Endurance in difficult conditions", "Ability to find value in darkness", "Extracting wisdom from hard experience"],
      challenges: ["Can get trapped in the descent", "Difficulty asking for light", "May mistake suffering for progress", "Tendency to work alone in darkness"],
      soulLesson: "Learning that the mine has an exit — that going deep doesn't mean staying buried.",
      inRelationships: "You bring depth, persistence, and an ability to work through the hardest relationship challenges. Your challenge is coming up for air — sharing the treasure you've found instead of hoarding it."
    },
    Aquarius: {
      name: "Rebel Moon",
      essence: "The revolutionary crisis — when conformity becomes intolerable and freedom demands action.",
      description: "The Rebel Moon is the soul in full revolution — the moment when 'going along to get along' becomes a form of spiritual death. You cannot pretend to agree anymore. You cannot smile at injustice anymore. You cannot be polite about things that are killing the world. The crisis is in the LONELINESS of rebellion — the realization that standing for what's right often means standing alone. The Rebel's journey is learning to build community among other outcasts, to transform individual revolt into collective revolution.",
      gifts: ["Moral courage", "Willingness to stand alone for principles", "Ability to inspire collective action", "Clear vision of injustice"],
      challenges: ["Can become defined by opposition", "Difficulty cooperating even with allies", "May reject everything mainstream on principle", "Loneliness of the perpetual outsider"],
      soulLesson: "Learning that the most radical act is sometimes building, not destroying — that the rebel must eventually become the architect.",
      inRelationships: "You bring authenticity, passion, and refusal to settle for a conventional relationship. Your challenge is not rebelling against your partner — saving your revolutionary energy for the systems that actually need overthrowing."
    },
    Pisces: {
      name: "Martyr's Moon",
      essence: "Sacrificial crisis — learning the difference between sacred offering and self-destruction.",
      description: "The Martyr's Moon faces the most dangerous crisis in the Piscean journey: the temptation to sacrifice yourself completely for others. There is something genuinely holy in your willingness to give everything — your time, your energy, your identity — for those you love or for causes you believe in. The crisis comes when that giving crosses the line from sacred offering to self-destruction. The Martyr must learn that a sacrifice given from an empty cup is not holy — it's just death. True sacrifice means offering what you can AFFORD to give while keeping enough to sustain your own life.",
      gifts: ["Selfless service", "Ability to sacrifice for higher purposes", "Spiritual courage", "Inspiring compassion in others"],
      challenges: ["Self-destructive tendencies", "Difficulty distinguishing service from codependency", "May seek meaning through suffering", "Can lose identity in service to others"],
      soulLesson: "Learning that the greatest sacrifice is learning to LIVE fully — that the world needs you alive and whole, not emptied and broken.",
      inRelationships: "You give without counting. You love without conditions. Your challenge is learning that your partner wants a PARTNER, not a sacrifice — that they need you whole, not hollowed out."
    },
  },

  // ──────────────────────────────────────────────────
  // 4 · WAXING GIBBOUS — "Soul's Redemption"
  // ──────────────────────────────────────────────────
  'Waxing Gibbous': {
    Aries: {
      name: "Adventurer's Moon",
      essence: "Refining courage — the warrior who learns strategy alongside bravery.",
      description: "The Adventurer's Moon has moved beyond raw courage into something more sustainable: strategic bravery. You've learned that running headfirst into danger isn't always effective — that sometimes the bravest thing is to PREPARE, to think, to approach the challenge with both heart and mind. This Moon marks the warrior who has survived enough battles to develop wisdom. You still love adventure, but now your adventures have PURPOSE. You're refining your courage into something the world can truly use.",
      gifts: ["Strategic courage", "Ability to plan adventures that serve growth", "Inspiring others through calculated risks", "Turning experience into wisdom"],
      challenges: ["Impatience with the refinement process", "Can feel trapped by the need to plan", "May lose spontaneity", "Temptation to return to pure instinct"],
      soulLesson: "Learning that the greatest adventure is the one that transforms not just you, but everyone around you.",
      inRelationships: "You bring adventure and growth to partnerships. You push both of you to evolve. Your challenge is appreciating the quiet, safe moments without itching for the next summit."
    },
    Taurus: {
      name: "Farmer's Moon",
      essence: "Perfecting abundance — the patient cultivator who tends crops with devotion.",
      description: "The Farmer's Moon is the gardener who has graduated to full cultivation — managing an entire farm, understanding seasons and cycles, working in harmony with nature's rhythms. You've moved beyond planting seeds into the full art of sustainable abundance. Every skill you've developed, every lesson you've learned about patience and timing and care, now comes together in the creation of something that can FEED others. This is service through abundance — generosity rooted in competence.",
      gifts: ["Sustainable abundance", "Deep practical wisdom", "Ability to feed and nourish many", "Harmony with natural cycles"],
      challenges: ["Can become overly attached to the farm", "Difficulty with innovation", "May resist change even when soil is depleted", "Risk of becoming conservative"],
      soulLesson: "Learning that the greatest harvest is the one you share — that abundance hoarded is abundance wasted.",
      inRelationships: "You create a life of deep comfort and material security. Your love is nourishing and reliable. Your challenge is being open to new ways of growing alongside your partner."
    },
    Gemini: {
      name: "Mercenary's Moon",
      essence: "Honing the mind's edge — intelligence applied with precision and purpose.",
      description: "The Mercenary's Moon has refined Gemini's scattered brilliance into a focused instrument. You've learned to apply your intelligence with precision and purpose — not just knowing things, but knowing HOW and WHEN to deploy what you know. This isn't mercenary in the negative sense; it's the professional who has honed their skills to the point where those skills have genuine value. You think clearly, communicate effectively, and solve problems others can't even define. The refinement here is in moving from cleverness to wisdom.",
      gifts: ["Precision of mind", "Ability to apply knowledge effectively", "Strategic communication", "Professional expertise in communication"],
      challenges: ["Can become calculating", "May lose playfulness in pursuit of precision", "Difficulty with emotional imprecision", "Risk of using people as puzzles to solve"],
      soulLesson: "Learning that the sharpest mind is one tempered by heart — that wisdom includes things that can't be analyzed.",
      inRelationships: "You are the partner who understands dynamics, communicates clearly, and solves problems efficiently. Your challenge is remembering that love isn't a problem to be solved — it's a mystery to be lived."
    },
    Cancer: {
      name: "Life-Giver's Moon",
      essence: "Perfecting the art of nurture — creating life and sustaining it with devotion.",
      description: "The Life-Giver's Moon has refined nurturing into a true art form. You don't just care for others — you CREATE environments where life can flourish. This might manifest as parenthood, but it's bigger than that: you are the one who makes the garden grow, who makes the community thrive, who makes the organization hum with life. Your nurturing is no longer instinctive — it's SKILLED, refined through experience, and enormously effective. You know exactly what each person needs and how to provide it without depleting yourself.",
      gifts: ["Skilled nurturing", "Creating life-giving environments", "Emotional wisdom from experience", "Sustainable caregiving"],
      challenges: ["Can over-identify with the caregiver role", "Difficulty letting others nurture themselves", "May define self entirely through service", "Risk of burnout despite skill"],
      soulLesson: "Learning that the greatest life you can give is your OWN — that self-care is the foundation of all other care.",
      inRelationships: "You create a thriving, life-affirming home. Your partner and family flourish under your care. Your challenge is allowing yourself to be cared for — stepping out of the giver role long enough to receive."
    },
    Leo: {
      name: "Singer's Moon",
      essence: "Refining self-expression — the voice that has learned to move hearts.",
      description: "The Singer's Moon has moved beyond performing for applause to expressing something ESSENTIAL. Your voice — whether literal or metaphorical — has been refined by experience until it carries real emotional weight. You no longer sing to be heard; you sing because the song MUST be sung. This is creative self-expression at its most refined: authentic, polished, and deeply moving. The Singer's Moon has found the place where personal truth and universal truth overlap, and sings from that sacred intersection.",
      gifts: ["Authentic self-expression", "Ability to move others emotionally", "Creative confidence earned through practice", "Voice that carries truth"],
      challenges: ["Perfectionism about the craft", "Can lose spontaneity in refinement", "May compare self to other 'singers'", "Fear that refining means losing authenticity"],
      soulLesson: "Learning that the most beautiful song is the one only you can sing — that your unique voice IS your gift to the world.",
      inRelationships: "You bring beauty, romance, and genuine emotional expression. Your love is a song that makes your partner feel truly seen. Your challenge is listening to THEIR song with the same reverence."
    },
    Virgo: {
      name: "Housewife's Moon",
      essence: "Sacred service perfected — finding divinity in the humble routines of care.",
      description: "The Housewife's Moon (regardless of gender) has discovered something that our culture has forgotten: that maintaining a home, a body, a garden, a community is SACRED work. You've refined the art of daily care to the point where it becomes a spiritual practice. Every meal prepared with love, every room cleaned with intention, every routine maintained with devotion — these are not lesser tasks. They are the foundation upon which all great work rests. You've found God in the details.",
      gifts: ["Sacred daily practice", "Mastery of practical care", "Creating order from chaos", "Finding meaning in humble work"],
      challenges: ["May be undervalued by a culture that prizes flashiness", "Difficulty claiming the significance of your work", "Can become lost in routine", "Risk of martyrdom through service"],
      soulLesson: "Learning that your work IS worship — and that you deserve to be seen, honored, and appreciated for it.",
      inRelationships: "You create a home that is a sanctuary. Your love shows in a thousand small, daily acts. Your challenge is insisting on being seen and valued for this sacred labor, not taking it for granted."
    },
    Libra: {
      name: "Lover's Moon",
      essence: "Perfecting relationship — the art of giving and receiving love in balance.",
      description: "The Lover's Moon is Libra at its most refined — the soul that has learned through experience how to love and BE loved in equal measure. You've moved beyond the fantasy of perfect relationship into the reality of genuine partnership: two whole people choosing to share their lives. This Moon knows that love is a SKILL, not just a feeling — that it requires practice, patience, adjustment, and a willingness to grow. You've perfected the art of meeting someone exactly where they are.",
      gifts: ["Mastery of partnership dynamics", "Ability to balance giving and receiving", "Deep relational intelligence", "Creating harmony without sacrificing truth"],
      challenges: ["Can over-analyze relationships", "May seek the 'perfect' partner endlessly", "Difficulty with being alone", "Risk of defining self through relationships"],
      soulLesson: "Learning that the most perfect relationship begins with the one you have with yourself.",
      inRelationships: "You are the ideal partner — attentive, balanced, emotionally intelligent. Your challenge is allowing the relationship to be messy and imperfect sometimes, knowing that's where the real growth happens."
    },
    Scorpio: {
      name: "Cloaked One's Moon",
      essence: "Refining power — the adept who has learned to wield intensity wisely.",
      description: "The Cloaked One's Moon is Scorpio mastered — the soul that has learned to wield emotional intensity as a precision instrument rather than a blunt weapon. You've been through the fire enough times to know how to use it without being consumed. Your power is no longer something that frightens you or others; it's a refined, controlled force that you can apply with surgical precision. The cloak is not deception — it's DISCRETION. You've learned that power shared wisely is power multiplied.",
      gifts: ["Controlled intensity", "Emotional precision", "Deep psychological insight used wisely", "Ability to transform situations with minimal force"],
      challenges: ["Can become too controlling", "Difficulty letting go of hard-won power", "May become secretive out of habit", "Risk of manipulation through subtlety"],
      soulLesson: "Learning that the greatest power is the power you choose NOT to use — that restraint is the mark of true mastery.",
      inRelationships: "You bring depth, wisdom, and transformative insight. You see your partner more clearly than they see themselves. Your challenge is using that vision to empower, not to control."
    },
    Sagittarius: {
      name: "Scholar's Moon",
      essence: "Perfecting understanding — the seeker who organizes wisdom into teaching.",
      description: "The Scholar's Moon has moved from seeking to SYNTHESIZING. You've traveled far enough, read enough, experienced enough to begin organizing what you've learned into teachable wisdom. This isn't dry academia — it's LIVED knowledge, wisdom earned through experience and refined through reflection. You are the seeker who has found enough to begin sharing, the student who is becoming the teacher. Your gift is making the complex accessible without dumbing it down.",
      gifts: ["Synthesis of diverse knowledge", "Ability to teach from experience", "Philosophical depth made accessible", "Bridge between theory and practice"],
      challenges: ["Can become overly systematic", "May lose the spark of adventure in analysis", "Difficulty with subjects that resist categorization", "Risk of becoming dogmatic"],
      soulLesson: "Learning that the greatest teacher is the one who keeps learning — that wisdom includes knowing how much you don't know.",
      inRelationships: "You bring growth, perspective, and stimulating conversation. You see the big picture of the relationship. Your challenge is not always being the teacher — sometimes just being the student of your partner's wisdom."
    },
    Capricorn: {
      name: "Smith's Moon",
      essence: "Mastering the craft — forging raw material into something enduring and useful.",
      description: "The Smith's Moon is the master craftsperson — the soul that has refined its skills to the point where raw material becomes art. Like a blacksmith at the forge, you understand that beautiful things are made through heat, pressure, and patient hammering. You don't rush the process because you know that the finest blades are tempered slowly. Your work has reached a level where it speaks for itself — no marketing needed, no fanfare required. The quality IS the statement.",
      gifts: ["Master craftsmanship", "Ability to create lasting value", "Patient, skilled transformation", "Quality that speaks for itself"],
      challenges: ["Perfectionism that delays completion", "Can undervalue work that isn't 'perfect'", "Difficulty with delegation", "May sacrifice timeliness for quality"],
      soulLesson: "Learning that the masterpiece is the MAKING, not the made — that the joy is in the forge, not just the finished blade.",
      inRelationships: "You build a relationship of extraordinary quality and durability. Your love improves with time. Your challenge is remembering that a relationship is a living thing, not a finished product."
    },
    Aquarius: {
      name: "Trickster's Moon",
      essence: "Refining genius — the innovator who perfects the art of disruption.",
      description: "The Trickster's Moon is the genius who has learned to package revolutionary ideas in forms the world can actually USE. You've moved beyond mere rebellion into creative disruption — not just breaking things, but breaking them OPEN to reveal new possibilities. Like Prometheus stealing fire from the gods, you bring forbidden knowledge to the people, but now you've learned to deliver it in ways that don't get you chained to a rock. Your genius is refined enough to be effective.",
      gifts: ["Creative disruption", "Packaging innovation for mass adoption", "Strategic subversion", "Ability to change systems from within"],
      challenges: ["Can become manipulative with genius", "May lose sight of human impact in pursuit of change", "Difficulty with emotional consequences of disruption", "Risk of becoming the system you're disrupting"],
      soulLesson: "Learning that the best trick is the one that benefits everyone — that genius in service of ego is just cleverness.",
      inRelationships: "You bring excitement, innovation, and refusal to let things stagnate. Your challenge is being stable enough for your partner to feel safe, even while you're reinventing everything else."
    },
    Pisces: {
      name: "Poet's Moon",
      essence: "Perfecting vision — translating the ineffable into words that touch the soul.",
      description: "The Poet's Moon has refined Pisces' formless sensitivity into an art form. You've learned to take the vast, wordless ocean of feeling and spiritual awareness and give it FORM — through words, through images, through music, through whatever medium becomes the vessel for the unspeakable. This isn't just artistic talent; it's a sacred gift of translation. You make the invisible visible, the unspoken spoken, the felt understood. The world needs your poetry more than it knows.",
      gifts: ["Translating the ineffable into art", "Emotional precision in expression", "Spiritual vision given form", "Touching others' souls through creative work"],
      challenges: ["Perfectionism about the art", "Difficulty with the gap between vision and execution", "Can become lost in the creative process", "May sacrifice worldly needs for artistic pursuit"],
      soulLesson: "Learning that the poem doesn't have to be perfect to be TRUE — that your imperfect expression still carries the divine.",
      inRelationships: "You bring poetry, beauty, and soulful depth to your relationship. You see and express what others can't. Your challenge is being as present in the practical world as you are in the poetic one."
    },
  },

  // ──────────────────────────────────────────────────
  // 5 · FULL MOON — "Consummation"
  // ──────────────────────────────────────────────────
  'Full Moon': {
    Aries: {
      name: "Warrior's Moon",
      essence: "Courage fully illuminated — the battle is won or lost, but the warrior stands revealed.",
      description: "The Warrior's Moon is courage at full power — the soul that has been tested in battle and stands fully revealed in the light of the Full Moon. There are no more hiding places. Everyone can see who you are: your strength, your scars, your victories, and your defeats. The Full Moon demands total visibility, and the Warrior meets that demand with unflinching honesty. This is the archetype of the person who has earned their courage through action, not theory. You are the living proof that bravery is not the absence of fear but the willingness to act despite it.",
      gifts: ["Tested courage", "Complete authenticity", "Ability to lead in crisis", "Inspiring others through visible bravery"],
      challenges: ["Difficulty with peace and quiet", "May seek conflict for identity", "Can be exhausted by constant visibility", "Struggle with vulnerability"],
      soulLesson: "Learning that the warrior's greatest victory is the one that leads to peace — that strength includes the power to lay down the sword.",
      inRelationships: "You are fierce, loyal, and completely honest. Your partner always knows where they stand. Your challenge is allowing softness — learning that a warrior's arms can hold as well as fight."
    },
    Taurus: {
      name: "Earth Mother's Moon",
      essence: "Abundance made manifest — the harvest is in, the table is set, the body is honored.",
      description: "The Earth Mother's Moon is abundance in its fullest expression — the soul that has cultivated, tended, and now HARVESTS. The table is set, the house is warm, the pantry is full. You embody the generosity of the earth itself: endlessly giving, endlessly nourishing, endlessly patient. This isn't passive abundance; it's the result of lifetimes of careful cultivation. You know what it costs to bring food to the table because you've done every step of the work. Your gift is making abundance look effortless when it's anything but.",
      gifts: ["Generous abundance", "Embodied wisdom", "Creating nourishing environments", "Making the practical beautiful"],
      challenges: ["Over-identification with the provider role", "Difficulty receiving", "Can equate love with material provision", "May resist change that threatens stability"],
      soulLesson: "Learning that the greatest abundance is an open hand — that clinging to what you've grown prevents new seeds from taking root.",
      inRelationships: "You create a life of sensual abundance. Your home is a haven, your table is full, your arms are always open. Your challenge is receiving love as generously as you give it."
    },
    Gemini: {
      name: "Storyteller's Moon",
      essence: "Communication at its peak — the tale is told, the audience is rapt, the truth is spoken.",
      description: "The Storyteller's Moon is Gemini at full power — the voice that can hold a room spellbound. You don't just communicate; you WEAVE reality through language. Stories, in your hands, become medicine — they heal, they teach, they transform. The Full Moon illuminates the Storyteller's deepest gift: the ability to make the invisible visible through narrative. You understand that stories are how humans make meaning, and you wield that understanding with the skill of a master craftsperson.",
      gifts: ["Master narrative ability", "Healing through story", "Making meaning through language", "Holding attention and creating understanding"],
      challenges: ["Can become addicted to the story's power", "Difficulty with silence", "May embellish truth for dramatic effect", "Risk of living in narrative rather than reality"],
      soulLesson: "Learning that the most powerful story is the one you live, not the one you tell — that your LIFE is your greatest narrative.",
      inRelationships: "You bring conversation, humor, and the ability to narrate your shared story beautifully. Your challenge is listening as masterfully as you speak."
    },
    Cancer: {
      name: "Sea Mother's Moon",
      essence: "Emotional fullness — the great tidal wave of feeling that nourishes all it touches.",
      description: "The Sea Mother's Moon is Cancer at its most expansive — the emotional ocean at high tide, nourishing everything it touches. You feel with the full force of the moon's pull, and your emotions are not small, private things — they are tidal, collective, archetypal. When you weep, you weep for the world. When you love, your love is big enough to hold everyone in it. This isn't emotional incontinence; it's emotional SOVEREIGNTY — the soul that has become so comfortable with the full range of human feeling that nothing can overwhelm it anymore.",
      gifts: ["Vast emotional capacity", "Ability to hold space for collective feeling", "Nurturing wisdom earned through experience", "Emotional sovereignty"],
      challenges: ["Can overwhelm others with emotional intensity", "Difficulty with boundaries at this scale", "May absorb collective grief", "Risk of emotional exhaustion"],
      soulLesson: "Learning that the ocean doesn't need to hold every drop — that even the Sea Mother must let some tides go out.",
      inRelationships: "You love with oceanic depth and power. Your partner is held in something vast and warm. Your challenge is not flooding them — giving them space to swim on their own."
    },
    Leo: {
      name: "Queen's Moon",
      essence: "Royal power fulfilled — the sovereign who has earned her throne through authentic self-expression.",
      description: "The Queen's Moon is Leo at its crowning moment — the soul that has earned its authority through genuine, tested self-expression. This isn't inherited power; it's power EARNED through the courage to be completely, vulnerably, authentically yourself in front of the world. The Queen doesn't need to prove anything — her presence IS the proof. She rules not through force but through the magnetic attraction of a fully embodied human being. People follow not because they're commanded to, but because they're INSPIRED to.",
      gifts: ["Natural authority earned through authenticity", "Magnetic presence", "Inspiring leadership", "Grace under the spotlight"],
      challenges: ["The loneliness of leadership", "Difficulty showing weakness", "May be surrounded by courtiers rather than friends", "Burden of always being 'on'"],
      soulLesson: "Learning that the crown is heaviest when worn for others' approval — that true sovereignty means ruling yourself first.",
      inRelationships: "You bring regal generosity, loyalty, and the ability to make your partner feel like royalty. Your challenge is sharing the throne — letting your partner be equally powerful."
    },
    Virgo: {
      name: "Spinner's Moon",
      essence: "Service perfected — the sacred thread that connects heaven and earth through humble work.",
      description: "The Spinner's Moon is Virgo at its most sacred — the soul whose humble, daily work has become a thread connecting heaven and earth. Like the Spinner at her wheel, you create something continuous and strong from raw fiber — transforming the chaotic threads of daily life into fabric that can shelter, clothe, and warm. This is service elevated to art, work elevated to prayer. The Spinner understands that every thread matters, that the fabric of life depends on each humble contribution.",
      gifts: ["Transforming humble work into sacred practice", "Creating continuity and connection", "Finding meaning in daily routine", "Serving the whole through tending the parts"],
      challenges: ["Can become invisible in service", "Difficulty stopping the spinning", "May lose self in the work", "Risk of devaluing your contribution"],
      soulLesson: "Learning that the Spinner's thread is her own life — that the fabric you create tells YOUR story as much as anyone else's.",
      inRelationships: "You weave the relationship together through a thousand daily acts of care. Your challenge is stepping back from the loom long enough to SEE the beautiful fabric you've created."
    },
    Libra: {
      name: "Artist's Moon",
      essence: "Beauty fully expressed — the masterwork revealed, the balance achieved, the aesthetic complete.",
      description: "The Artist's Moon is Libra's crowning achievement — the soul that has created a masterwork of beauty and balance. This isn't decoration; it's the creation of MEANING through aesthetic form. You understand that beauty is not superficial — it's how the soul communicates. A perfectly balanced composition, a moment of pure harmony, a relationship of exquisite reciprocity — these are not luxuries. They are the highest expressions of what it means to be human. The Artist's Moon creates beauty that changes how people see the world.",
      gifts: ["Creating transcendent beauty", "Achieving dynamic balance", "Communicating meaning through aesthetics", "Making the ordinary extraordinary"],
      challenges: ["Can be paralyzed by the pursuit of perfection", "Difficulty with ugliness and disorder", "May prioritize form over content", "Risk of aestheticizing pain"],
      soulLesson: "Learning that the most beautiful art includes imperfection — that the crack is where the light gets in.",
      inRelationships: "You create a relationship that is itself a work of art. Every detail is considered, every moment composed. Your challenge is embracing the beautiful mess that real intimacy requires."
    },
    Scorpio: {
      name: "Priestess's Moon",
      essence: "Mystery fully embodied — the keeper of secrets who stands at the threshold between worlds.",
      description: "The Priestess's Moon is Scorpio at its most powerful — the soul that has become the living threshold between the visible and invisible worlds. You have walked through death enough times to know it as an ally, not an enemy. You hold secrets — not gossip, but genuine MYSTERIES — the kind of knowledge that can only be transmitted from initiate to initiate. Your presence alone transforms the energy in a room. People feel both drawn to you and slightly awed, because you carry a charge that comes from direct contact with the sacred.",
      gifts: ["Direct access to the mysteries", "Transformative presence", "Holding sacred space", "Initiating others into deeper truth"],
      challenges: ["Isolation from 'normal' life", "Difficulty with light, casual connection", "May become consumed by the mysteries", "Others' projections and fears"],
      soulLesson: "Learning that the greatest mystery is ordinary life — that the sacred isn't separate from the mundane but woven through it.",
      inRelationships: "You bring transformation, depth, and an almost mystical connection. Your challenge is not making your partner your acolyte — meeting them as an equal, not as a teacher."
    },
    Sagittarius: {
      name: "Priest's Moon",
      essence: "Truth proclaimed — the teacher who has walked the path and can now guide others.",
      description: "The Priest's Moon is Sagittarius at its highest expression — the soul that has traveled far enough, sought deeply enough, and understood broadly enough to become a genuine teacher of truth. You don't teach from books alone; you teach from LIFE. Every lesson you offer has been paid for in experience. Your gift is making the highest truths accessible without diminishing them — being the bridge between the divine and the human, the cosmic and the personal.",
      gifts: ["Teaching from lived experience", "Making truth accessible", "Bridging the cosmic and personal", "Inspiring faith through example"],
      challenges: ["Risk of guru syndrome", "Difficulty admitting ignorance", "May confuse personal truth with universal truth", "Burden of others' spiritual projections"],
      soulLesson: "Learning that the greatest sermon is a life well-lived — that your most powerful teaching is who you ARE, not what you say.",
      inRelationships: "You bring wisdom, vision, and the ability to see your partner's highest potential. Your challenge is being a partner, not a prophet — loving them as they are, not as they could be."
    },
    Capricorn: {
      name: "Grandmother's Moon",
      essence: "Authority earned through experience — the elder whose wisdom commands natural respect.",
      description: "The Grandmother's Moon is Capricorn at its most mature — the authority figure who needs no title, no office, no credentials because their PRESENCE commands natural respect. You've lived long enough (in soul-years if not calendar years) to have seen patterns repeat, predictions come true, and hard work pay off. Your wisdom isn't theoretical — it's been earned through decades of doing, failing, learning, and persisting. People don't follow you because they have to; they follow you because they'd be fools not to.",
      gifts: ["Earned authority", "Pattern recognition from experience", "Natural respect without force", "Wisdom that serves the community"],
      challenges: ["Can become rigid with age", "Difficulty with changing times", "May dismiss younger perspectives", "Risk of clinging to outdated methods"],
      soulLesson: "Learning that the grandmother's greatest legacy is her grandchildren's FREEDOM — that true authority empowers rather than controls.",
      inRelationships: "You bring stability, wisdom, and a long-term perspective that grounds the relationship. Your challenge is staying open to your partner's new ideas — aging gracefully while continuing to grow."
    },
    Aquarius: {
      name: "Friendship Moon",
      essence: "Connection beyond blood — the tribe united by shared vision rather than DNA.",
      description: "The Friendship Moon is Aquarius at its most beautiful — the soul that has discovered that the deepest bonds are chosen, not given. You create tribe from strangers, family from friends, community from shared vision. This isn't loneliness disguised as independence; it's a genuine EXPANSION of what 'belonging' means. You understand that the human family is bigger than any bloodline, that ideas can bind people more tightly than genetics, and that the community of the future will be built on choice, not obligation.",
      gifts: ["Creating chosen family", "Building community around shared vision", "Honoring diverse connections", "Understanding that friendship IS love"],
      challenges: ["Can deprioritize intimate partnerships", "Difficulty with exclusive bonds", "May spread connection too thin", "Risk of avoiding depth through breadth"],
      soulLesson: "Learning that the deepest friendship includes the willingness to be hurt — that real connection requires vulnerability, not just shared ideals.",
      inRelationships: "You bring freedom, respect for individuality, and a vision of partnership based on choice, not need. Your challenge is prioritizing the one alongside the many — going deep with your partner while staying wide with the world."
    },
    Pisces: {
      name: "Healer's Moon",
      essence: "Compassion made whole — the wounded healer whose own suffering becomes medicine for others.",
      description: "The Healer's Moon is Pisces at its highest calling — the wounded healer who has transformed personal suffering into medicine for the world. You haven't transcended pain; you've ALCHEMIZED it. Every wound you've carried has become a portal through which you can reach others in their suffering. Your compassion isn't theoretical — it's been forged in the fire of your own experience. When you hold someone in their darkest moment, they feel held by someone who KNOWS, who has been there, who survived and found the light.",
      gifts: ["Healing through lived compassion", "Alchemizing personal pain into medicine", "Creating sanctuary for others' healing", "Access to transpersonal love"],
      challenges: ["Risk of re-wounding through empathy", "Difficulty maintaining boundaries in healing work", "Can absorb others' pain", "May neglect own healing in service of others"],
      soulLesson: "Learning that the healer must continually heal themselves — that the medicine flows THROUGH you, not FROM you.",
      inRelationships: "You bring unconditional acceptance and an ability to heal through love. Your partner feels truly seen and held. Your challenge is being healed BY your partner — receiving the medicine you so freely give."
    },
  },

  // ──────────────────────────────────────────────────
  // 6 · WANING GIBBOUS — "The Greater Good" (Disseminating)
  // ──────────────────────────────────────────────────
  'Waning Gibbous': {
    Aries: {
      name: "Soldier's Moon",
      essence: "Courage in service — the warrior who fights not for glory but for others' freedom.",
      description: "The Soldier's Moon has moved beyond personal bravery into service. You fight not for glory, not for recognition, but because someone has to stand between the vulnerable and the threat. This is courage without ego — the hardest kind. You've seen enough of battle to have lost any romance about it, but you still show up because the cause matters more than your comfort. The Soldier's Moon is the guardian who asks for nothing in return.",
      gifts: ["Selfless courage", "Protecting others without seeking glory", "Discipline in service", "Translating warrior energy into guardianship"],
      challenges: ["Can lose self in service", "Difficulty with peacetime identity", "May not know who they are without a cause", "Risk of service becoming martyrdom"],
      soulLesson: "Learning that the bravest act is sometimes laying down the sword and teaching the next generation not to need one.",
      inRelationships: "You are the quiet protector — the one who shows up without being asked. Your challenge is letting your partner protect YOU sometimes."
    },
    Taurus: {
      name: "Builder's Moon",
      essence: "Creating structures that outlast the maker — legacy through lasting work.",
      description: "The Builder's Moon creates for eternity. You're no longer building for yourself — you're building for generations you'll never meet. Bridges, institutions, communities, traditions — the structures you create are meant to outlast you. There is a profound generosity in this Moon: the willingness to do work whose benefits you may never see. You understand that the truest legacy isn't what you keep but what you leave behind.",
      gifts: ["Creating lasting structures", "Generational thinking", "Building for the common good", "Legacy through practical contribution"],
      challenges: ["Difficulty letting go of what you've built", "Can be rigid about methods", "May sacrifice present joy for future legacy", "Risk of building monuments to ego"],
      soulLesson: "Learning that the greatest structure is the one that can stand without you — that true building includes planning your own obsolescence.",
      inRelationships: "You build a relationship meant to last forever. Your love is expressed through creating a lasting life together. Your challenge is enjoying the house while you're building it."
    },
    Gemini: {
      name: "Scribe's Moon",
      essence: "Recording wisdom for future generations — the keeper of knowledge who writes it down.",
      description: "The Scribe's Moon is the keeper of collective memory. You understand that knowledge not recorded is knowledge lost, and you've taken on the sacred task of preserving wisdom for those who come after. This might manifest as literal writing, but it's bigger than that — you're the one who documents, archives, teaches, and transmits. Your gift is making knowledge accessible and enduring. Without the Scribe, every generation would start from scratch.",
      gifts: ["Preserving and transmitting knowledge", "Making wisdom accessible", "Creating lasting records", "Connecting past wisdom to present needs"],
      challenges: ["Can hide behind the words", "Difficulty with oral, embodied knowledge", "May prefer recording to living", "Risk of becoming detached from experience"],
      soulLesson: "Learning that some wisdom can only be transmitted through PRESENCE — that not everything important can be written down.",
      inRelationships: "You document your love story beautifully — through words, memories, and shared narratives. Your challenge is being as present in the moment as you are in the recording of it."
    },
    Cancer: {
      name: "Shield-Father's Moon",
      essence: "Protective nurture extended to community — the guardian of the vulnerable.",
      description: "The Shield-Father's Moon (regardless of gender) extends the protective instinct beyond family to embrace the entire community. You are the guardian of the vulnerable — the one who creates safe spaces not just for your own children but for ALL children, all vulnerable beings, all those who need shelter. Your nurturing has expanded to a community scale, and your protective instinct has become a form of social service.",
      gifts: ["Community-scale nurturing", "Protecting the vulnerable", "Creating institutional safety nets", "Expanding the definition of family"],
      challenges: ["Can be overprotective of community", "Difficulty with tough love at scale", "May neglect inner circle for outer mission", "Risk of burnout from caring too widely"],
      soulLesson: "Learning that the greatest protection is empowerment — that shielding others forever prevents them from growing strong.",
      inRelationships: "You extend your protective love to your partner's entire world. Your challenge is keeping the intimate connection strong while your care radiates outward."
    },
    Leo: {
      name: "King's Moon",
      essence: "Leadership through generosity — the ruler who gives more than he takes.",
      description: "The King's Moon is Leo in its highest expression of leadership — the sovereign who has discovered that true power flows DOWNWARD, from ruler to people, not upward. You lead by giving — your time, your resources, your energy, your light — and this generosity creates a loyalty that force could never achieve. The King's Moon understands that the crown is not a privilege but a responsibility, and wears it accordingly.",
      gifts: ["Generous leadership", "Creating loyalty through giving", "Inspiring others to their best", "Using personal power for collective benefit"],
      challenges: ["Can give beyond capacity", "Difficulty receiving from subjects", "May lose personal desires in service to the kingdom", "Burden of constant visibility"],
      soulLesson: "Learning that even kings must rest — that sustaining the kingdom requires sustaining the king.",
      inRelationships: "You are magnanimous, generous, and deeply loyal. You treat your partner like royalty. Your challenge is allowing yourself to be cared for — kings need tenderness too."
    },
    Virgo: {
      name: "Weaver's Moon",
      essence: "Connecting disparate threads — service that creates patterns of wholeness.",
      description: "The Weaver's Moon connects what has been separated. You see patterns where others see chaos, and your gift is bringing disparate elements together into functional, beautiful wholes. This might manifest as community organizing, healing work, systems thinking, or literally weaving — any activity where separate threads become a unified fabric. Your service creates wholeness from fragmentation.",
      gifts: ["Pattern recognition", "Creating wholeness from fragments", "Systems thinking", "Connecting people and ideas into functional wholes"],
      challenges: ["Can become overwhelmed by disconnection", "Difficulty with loose ends", "May sacrifice personal expression for the pattern", "Risk of becoming invisible within the weave"],
      soulLesson: "Learning that some threads are meant to hang loose — that wholeness includes space for mystery and incompleteness.",
      inRelationships: "You weave your partner's world into yours with extraordinary skill. Your challenge is leaving some threads loose — allowing mystery and independence within the beautiful fabric."
    },
    Libra: {
      name: "Ambassador's Moon",
      essence: "Diplomacy as sacred art — bridging divides through grace and understanding.",
      description: "The Ambassador's Moon carries Libra's gift of balance into the wider world. You are the bridge-builder, the peacemaker, the one who can enter hostile territory and find common ground. This isn't people-pleasing — it's a genuine diplomatic gift that requires courage, intelligence, and an unshakable commitment to the possibility of peace. You represent the best of humanity: the belief that even enemies can find understanding.",
      gifts: ["Diplomatic courage", "Finding common ground in hostile situations", "Representing peace convincingly", "Creating understanding between opposed groups"],
      challenges: ["Exhaustion from constant mediation", "Difficulty taking sides when necessary", "May sacrifice personal truth for diplomatic mission", "Can be used by both sides"],
      soulLesson: "Learning that some conflicts cannot be mediated — that sometimes the ambassador must become a witness rather than a bridge.",
      inRelationships: "You bring peace, understanding, and an ability to navigate any conflict. Your challenge is having your OWN opinions, not just mediating between others'."
    },
    Scorpio: {
      name: "Witch's Moon",
      essence: "Power shared as healing — the practitioner who teaches transformation.",
      description: "The Witch's Moon is Scorpio's power turned outward as SERVICE — the practitioner who has mastered the dark arts of transformation and now uses them to heal others. You understand the shadow because you've lived in it. You know the medicine that grows in the darkest soil. And now, instead of hoarding that knowledge, you share it with those who are ready. The Witch heals what medicine cannot reach — the soul-level wounds that no rational treatment can touch.",
      gifts: ["Healing through shadow work", "Teaching transformation", "Working with hidden forces", "Transforming others' pain into power"],
      challenges: ["Being misunderstood or feared", "Carrying others' darkness", "Difficulty with light, surface interactions", "Risk of ego inflation through power"],
      soulLesson: "Learning that the greatest magic is love — that all the shadow work in the world serves one purpose: to clear the path to the heart.",
      inRelationships: "You bring transformative healing power to your relationships. You see and love your partner's shadow. Your challenge is allowing lightness and play — not everything needs to be healed."
    },
    Sagittarius: {
      name: "Philosopher's Moon",
      essence: "Wisdom distilled and shared — the sage who makes the complex accessible.",
      description: "The Philosopher's Moon is Sagittarius at its most generous — the thinker who has spent a lifetime gathering wisdom and now offers it freely to anyone who will listen. You've moved beyond seeking truth for yourself to sharing truth for the benefit of all. Your philosophy isn't abstract — it's LIVED, tested against reality, refined through experience. When you speak, people listen, because they can feel the authenticity behind every word.",
      gifts: ["Accessible wisdom", "Teaching through storytelling", "Making philosophy practical", "Inspiring others to think deeply"],
      challenges: ["Can become preachy", "Difficulty with people who won't listen", "May oversimplify complex truths", "Risk of thinking you've found THE answer"],
      soulLesson: "Learning that wisdom includes silence — that sometimes the most philosophical act is to listen.",
      inRelationships: "You bring perspective, meaning, and the ability to see your relationship in a cosmic context. Your challenge is not philosophizing about the relationship when your partner just needs a hug."
    },
    Capricorn: {
      name: "Grandfather's Moon",
      essence: "Authority offered as mentorship — the elder who builds the next generation.",
      description: "The Grandfather's Moon is Capricorn's authority transformed into mentorship. You've achieved enough to have nothing left to prove. Your power is no longer about climbing; it's about reaching down to help others climb. The Grandfather doesn't compete with the young — he equips them. His authority is offered as a gift, not wielded as a weapon. This is the elder who builds the next generation not in his own image, but in THEIR own image.",
      gifts: ["Mentoring the next generation", "Earned authority offered freely", "Building others' capacity", "Legacy through people, not structures"],
      challenges: ["Difficulty letting go of control", "Can be paternalistic", "May try to live through younger people", "Risk of offering outdated advice"],
      soulLesson: "Learning that the greatest mentor creates people who surpass them — that your success is measured by their independence, not their gratitude.",
      inRelationships: "You bring wisdom, stability, and a generational perspective. Your challenge is being a partner, not a parent — meeting your loved one as an equal, regardless of age or experience."
    },
    Aquarius: {
      name: "Apostle's Moon",
      essence: "Vision spread to the world — the radical teacher whose ideas change everything.",
      description: "The Apostle's Moon carries the revolutionary vision of Aquarius out into the world with missionary zeal. You're not content to have ideas — you need those ideas to SPREAD, to change lives, to transform society. Like the original apostles, you travel (literally or metaphorically) to share a message that challenges everything people thought they knew. Your gift is the ability to communicate radical ideas with enough passion and clarity to convert even skeptics.",
      gifts: ["Spreading transformative ideas", "Converting skeptics through passion", "Building movements around vision", "Making the radical accessible"],
      challenges: ["Zealotry", "Difficulty with doubt or questioning", "May alienate potential allies", "Risk of ego wrapped in mission"],
      soulLesson: "Learning that the most powerful message is the one you LIVE — that your life should be your best argument.",
      inRelationships: "You bring vision, passion, and a shared sense of purpose. Your challenge is not making your relationship a mission field — loving your partner for who they are, not what they could become."
    },
    Pisces: {
      name: "Moon of the Angel of Mercy",
      essence: "Unconditional compassion — the healer who asks nothing in return.",
      description: "The Moon of the Angel of Mercy is perhaps the most selfless archetype in the entire system. You offer compassion without condition, healing without invoice, love without expectation. This isn't martyrdom — you've evolved past that. This is genuine, sustainable compassion that flows through you like water through a channel. You've learned that you are not the SOURCE of the love — you are the VESSEL through which divine compassion reaches the world. This makes your service sustainable because you're not giving from your own reserves.",
      gifts: ["Sustainable unconditional compassion", "Channeling divine love", "Healing presence without ego", "Inspiring mercy in others"],
      challenges: ["Others may take advantage", "Difficulty with judgment when it's needed", "May lose discernment in compassion", "Risk of spiritual bypassing"],
      soulLesson: "Learning that mercy includes boundaries — that saying 'no' to one person may be saying 'yes' to many others.",
      inRelationships: "You love without conditions or expectations. Your partner feels accepted at the deepest level. Your challenge is accepting love in return — allowing yourself to be served as generously as you serve."
    },
  },

  // ──────────────────────────────────────────────────
  // 7 · LAST QUARTER — "Crisis of Consciousness"
  // ──────────────────────────────────────────────────
  'Last Quarter': {
    Aries: {
      name: "Survivor's Moon",
      essence: "The crisis of letting go of battle — the warrior who must learn peace.",
      description: "The Survivor's Moon faces the most counter-intuitive crisis for an Aries soul: the realization that the battle is OVER and yet you're still fighting. You've survived. You've won. But your nervous system doesn't know it yet. The crisis is in laying down the sword when your entire identity has been built around holding it. The Survivor must learn that peace is not weakness, that rest is not defeat, and that the greatest courage of all may be allowing yourself to be SAFE.",
      gifts: ["Resilience wisdom", "Understanding the cost of battle", "Ability to help others transition from war to peace", "Post-traumatic growth"],
      challenges: ["PTSD-like patterns", "Difficulty trusting peace", "May create conflict from habit", "Identity crisis without a fight"],
      soulLesson: "Learning that survival is not the same as living — that you've earned the right to THRIVE.",
      inRelationships: "You bring tested strength and hard-won wisdom. Your challenge is trusting that your partner is safe — that you don't need to be on guard in your own home."
    },
    Taurus: {
      name: "Merchant's Moon",
      essence: "Re-evaluating what has value — releasing attachment to material security.",
      description: "The Merchant's Moon faces the crisis of VALUE — the moment when everything you've accumulated must be weighed and much of it released. You've spent lifetimes building, collecting, securing — and now you're being asked to evaluate what truly matters versus what you've been clinging to out of habit or fear. The Merchant must learn that the most valuable things often can't be bought, sold, or stored — they can only be EXPERIENCED.",
      gifts: ["Understanding true value", "Ability to distinguish needs from wants", "Wisdom about attachment", "Generosity born from abundance"],
      challenges: ["Fear of letting go of security", "Crisis of identity without possessions", "Difficulty distinguishing value from price", "Resistance to downsizing"],
      soulLesson: "Learning that you are more than what you own — that your worth was never in the warehouse.",
      inRelationships: "You bring stability and generosity. Your challenge is learning that your partner values your PRESENCE more than your provision — that who you are matters more than what you have."
    },
    Gemini: {
      name: "Magician's Moon",
      essence: "The crisis of truth vs. illusion — using knowledge to transform rather than deceive.",
      description: "The Magician's Moon faces the ultimate test of Gemini's power: the choice between using knowledge to illuminate or to manipulate. You understand how reality works — how perception shapes experience, how words create worlds, how attention determines what exists. This knowledge gives you enormous power, and the crisis is in how you choose to wield it. The Magician who chooses truth becomes a healer. The Magician who chooses illusion becomes a trickster at best, a destroyer at worst.",
      gifts: ["Understanding perception and reality", "Ability to transform consciousness", "Mastery of symbolic communication", "Teaching through demonstration"],
      challenges: ["Temptation to manipulate", "Knowing too much about human weakness", "Difficulty with trust", "Crisis of integrity"],
      soulLesson: "Learning that the greatest magic is transparency — that showing people HOW you do it is more powerful than keeping it secret.",
      inRelationships: "You bring insight, intelligence, and an ability to transform situations through understanding. Your challenge is using your power to BUILD trust, not to test it."
    },
    Cancer: {
      name: "Widow's Moon",
      essence: "Releasing old bonds — the grief that liberates by finally letting go of the past.",
      description: "The Widow's Moon faces the most painful crisis of the Cancer journey: the release of bonds that once defined you. Whether through literal loss or metaphorical death of old identities, you are being asked to let go of who you WERE in order to become who you're BECOMING. The grief is real, and it must be honored — but it cannot be lived in forever. The Widow's journey is learning that love survives loss, that bonds transcend death, and that letting go of the form doesn't mean letting go of the love.",
      gifts: ["Wisdom through loss", "Understanding that love survives death", "Ability to help others grieve", "Deep emotional resilience"],
      challenges: ["Difficulty releasing the past", "May cling to grief as identity", "Risk of emotional isolation", "Difficulty forming new bonds after loss"],
      soulLesson: "Learning that letting go is not forgetting — that you can honor the past while walking into the future.",
      inRelationships: "You bring depth, loyalty, and an understanding of love's permanence. Your challenge is fully showing up for new love without comparing it to what was lost."
    },
    Leo: {
      name: "Usurper's Moon",
      essence: "The crisis of ego — when authority must be surrendered so something new can reign.",
      description: "The Usurper's Moon faces the Leo soul's most terrifying prospect: abdication. Not because you've failed, but because your reign is COMPLETE. You've done what you came to do, and now the throne must pass to someone else. The crisis is in accepting that stepping down is not stepping backward — that some of the greatest leaders in history are remembered not for how they seized power but for how gracefully they released it.",
      gifts: ["Grace in transition", "Understanding the cycle of power", "Ability to empower successors", "Ego maturity"],
      challenges: ["Fear of irrelevance", "Difficulty with diminished spotlight", "May sabotage successors", "Identity crisis without power"],
      soulLesson: "Learning that your light doesn't dim when you step off stage — that the sun still shines whether anyone's watching or not.",
      inRelationships: "You bring wisdom about ego and power dynamics. Your challenge is sharing leadership of the relationship gracefully — and finding your identity in being loved, not just admired."
    },
    Virgo: {
      name: "Fate's Moon",
      essence: "Acceptance of imperfection — releasing the need to fix everything.",
      description: "Fate's Moon faces the Virgoan crisis of RELEASE — the moment when you must accept that not everything can be fixed, healed, organized, or improved. Some things are simply how they are. Some suffering exists beyond the reach of any remedy. The crisis is in accepting imperfection as a fundamental feature of existence, not a personal failure. This is the moment when the perfectionist makes peace with the universe's refusal to be perfect.",
      gifts: ["Acceptance of imperfection", "Wisdom about limits of control", "Peace through surrender", "Helping others accept what cannot be changed"],
      challenges: ["Existential crisis about purpose", "Difficulty with 'good enough'", "May swing between perfectionism and apathy", "Fear that acceptance means giving up"],
      soulLesson: "Learning that acceptance is not resignation — that sometimes the most healing thing is to stop trying to heal.",
      inRelationships: "You bring acceptance and the ability to love your partner's imperfections. Your challenge is extending that acceptance to yourself — loving your own messiness as generously."
    },
    Libra: {
      name: "Judge's Moon",
      essence: "The crisis of fairness — when balance requires difficult verdicts.",
      description: "The Judge's Moon faces the hardest Libran crisis: the moment when balance requires a VERDICT. You can no longer see both sides — you must CHOOSE a side. This goes against every instinct you have, but the crisis demands it. True justice, you're learning, sometimes requires unbalanced action. The Judge must rule, and ruling means someone will be unhappy. The wisdom here is learning to make difficult decisions from a place of conscience rather than calculation.",
      gifts: ["Moral clarity under pressure", "Ability to make fair but difficult decisions", "Balancing mercy with justice", "Integrity in judgment"],
      challenges: ["Agony of decision-making", "Fear of being wrong", "Can become judgmental as overcompensation", "Difficulty living with verdicts"],
      soulLesson: "Learning that every judgment includes mercy — that the wisest judge remembers that they too will be judged.",
      inRelationships: "You bring fairness and moral clarity. Your challenge is not judging your partner — applying mercy at home even when you must apply justice in the world."
    },
    Scorpio: {
      name: "Madwoman's Moon",
      essence: "The crisis of control — when power must be surrendered to transformation.",
      description: "The Madwoman's Moon is the most intense crisis in the Last Quarter — the moment when Scorpio's iron control SHATTERS. You've held it together for so long, so tightly, with such ferocious discipline — and now the container cracks. This isn't breakdown; it's BREAKTHROUGH. The 'madness' is actually a liberation — the wild, untamed energy that has been imprisoned by your need for control finally breaking free. The Madwoman's journey is learning that some of your most sacred power lives in the parts of yourself you've been most afraid of.",
      gifts: ["Liberation through release", "Access to untamed power", "Breaking free from control patterns", "Authentic wildness"],
      challenges: ["Terrifying loss of control", "Difficulty trusting the process", "Others' fear of your wildness", "Risk of genuinely destructive behavior"],
      soulLesson: "Learning that control was the cage, not the safety — that your wild self is not your enemy but your deepest ally.",
      inRelationships: "You bring authentic rawness and the willingness to be completely unmasked. Your challenge is giving your partner time to adjust — your liberation can feel like an earthquake to those around you."
    },
    Sagittarius: {
      name: "Hunter's Moon",
      essence: "The crisis of belief — when old truths are released to make room for new understanding.",
      description: "The Hunter's Moon tracks not prey but TRUTH — and the crisis comes when the truth you've been tracking turns out to be different from what you expected. Every belief system you've built, every philosophy you've championed, every grand narrative you've constructed — all must be re-examined. Some will survive; some won't. The Hunter's courage lies in following the trail even when it leads to the death of cherished beliefs.",
      gifts: ["Courage to follow truth wherever it leads", "Releasing outdated beliefs", "Intellectual honesty", "Finding new truth in unexpected places"],
      challenges: ["Grief for lost beliefs", "Difficulty trusting new ideas", "May swing between cynicism and credulity", "Loneliness of intellectual honesty"],
      soulLesson: "Learning that the hunt for truth never ends — that the greatest truth is the willingness to keep looking.",
      inRelationships: "You bring radical honesty and the courage to question everything, including your own relationship assumptions. Your challenge is not destabilizing your partner with constant philosophical upheaval."
    },
    Capricorn: {
      name: "Miser's Moon",
      essence: "Releasing attachment to status — when accomplishments must be let go.",
      description: "The Miser's Moon faces Capricorn's deepest fear: the loss of everything you've worked for. Not because you failed, but because the universe is asking you to RELEASE it. Your career, your status, your carefully constructed life — all must be re-evaluated through the lens of this question: does this still serve the soul? The Miser's crisis is in the clinging — and the liberation is in the releasing. What remains after you let go of status is your authentic self.",
      gifts: ["Understanding the true cost of ambition", "Wisdom about attachment and status", "Generosity from a place of fullness", "Freedom from the achievement treadmill"],
      challenges: ["Terror of losing status", "Difficulty distinguishing self from accomplishments", "May hoard out of fear", "Crisis of identity without achievement"],
      soulLesson: "Learning that you are not your résumé — that the soul's value has nothing to do with worldly success.",
      inRelationships: "You bring the wisdom of someone who has learned what truly matters. Your challenge is not projecting achievement anxiety onto your partner — loving them for who they are, not what they've accomplished."
    },
    Aquarius: {
      name: "Heretic's Moon",
      essence: "The revolutionary crisis of conscience — challenging even one's own revolution.",
      description: "The Heretic's Moon faces the most uncomfortable crisis for an Aquarian soul: questioning your OWN ideology. It's one thing to rebel against the establishment — it's another to rebel against your own rebellion. The Heretic realizes that every revolution eventually becomes its own establishment, that every ideology eventually becomes its own dogma. The crisis is in maintaining intellectual honesty even when it means admitting that your side is wrong too.",
      gifts: ["Intellectual honesty at the highest level", "Ability to question all systems, including your own", "True independence of thought", "Integrity beyond ideology"],
      challenges: ["Alienation from former allies", "Feeling like you belong nowhere", "Risk of perpetual contrarianism", "Loneliness of true independence"],
      soulLesson: "Learning that the deepest freedom is freedom from your own fixed ideas — that the most revolutionary act is changing your mind.",
      inRelationships: "You bring brutal intellectual honesty and true independence. Your challenge is not heresy-testing your partner — building something together even while questioning everything."
    },
    Pisces: {
      name: "Moon of Lost Souls",
      essence: "The crisis of dissolution — surrendering identity to the collective ocean.",
      description: "The Moon of Lost Souls is the most dissolved archetype in the system — the soul at the edge of the ocean, about to merge with the infinite. This isn't pathology; it's the natural end of the Piscean journey. The ego is dissolving, the boundaries are gone, and you're becoming transparent to the divine. The crisis is in the TERROR of dissolution — the fear that if you let go completely, there will be nothing left. But the truth is that what remains after ego dissolves is something MORE, not less.",
      gifts: ["Transparency to the divine", "Complete ego surrender", "Access to collective consciousness", "Mystical union"],
      challenges: ["Loss of individual identity", "Difficulty functioning in the material world", "May appear 'lost' to others", "Risk of genuine dissolution without return"],
      soulLesson: "Learning that dissolution is not destruction — that you are the ocean pretending to be a wave, and remembering that is coming HOME.",
      inRelationships: "You bring mystical depth and an ability to merge completely. Your challenge is maintaining enough sense of self to be a partner — you can't love someone if you've dissolved completely."
    },
  },

  // ──────────────────────────────────────────────────
  // 8 · BALSAMIC — "Into the Deep"
  // ──────────────────────────────────────────────────
  'Balsamic': {
    Aries: {
      name: "Veteran's Moon",
      essence: "The elder warrior — courage refined into wisdom, scars worn as badges of honor.",
      description: "The Veteran's Moon is the warrior at the end of the journey — scarred, wise, and at peace. You've fought every battle there is to fight, and now you understand something that younger warriors can't: that the greatest victories are invisible, the hardest battles are internal, and the truest courage is the kind that comes AFTER the war. You carry your scars not as wounds but as wisdom. Your presence alone is a form of protection — not because you're still dangerous, but because you've BEEN dangerous, and now you've chosen peace.",
      gifts: ["Wisdom earned through battle", "Peace after war", "Mentoring younger warriors", "Courage refined into gentleness"],
      challenges: ["Old wounds that resurface", "Difficulty with gentleness after lifetimes of fighting", "May feel purposeless in peacetime", "Carrying others' war stories"],
      soulLesson: "Learning that the final battle is with yourself — and the victory is in surrender.",
      inRelationships: "You bring hard-won wisdom and genuine tenderness. Your challenge is allowing yourself to be held — letting your partner see the tired warrior beneath the armor."
    },
    Taurus: {
      name: "Ancestor's Moon",
      essence: "The keeper of roots — connected to the land and the lineage that came before.",
      description: "The Ancestor's Moon is connected to the deepest roots — the soil, the bloodline, the ancient rhythms of earth and season that existed long before humans had words for them. You carry ancestral memory in your body, in your bones, in your relationship with the land. This isn't nostalgia; it's a genuine CHANNELING of wisdom that flows up through generations. You know things you were never taught because the knowledge lives in your cells. Your gift to the world is remembering what everyone else has forgotten.",
      gifts: ["Ancestral connection", "Earth wisdom", "Memory of ancient knowledge", "Grounding presence rooted in deep time"],
      challenges: ["Weight of ancestral patterns", "Difficulty with modernity", "May idealize the past", "Carrying generational trauma"],
      soulLesson: "Learning that honoring the ancestors includes HEALING their wounds — that you can be the one who breaks the old patterns while keeping the old wisdom.",
      inRelationships: "You bring rootedness, ancestral wisdom, and a deep connection to place and tradition. Your challenge is being open to your partner's different roots — creating new traditions alongside the ancient ones."
    },
    Gemini: {
      name: "Teacher's Moon",
      essence: "Wisdom distilled to simplicity — the mind that has traveled far enough to speak plainly.",
      description: "The Teacher's Moon is Gemini at its most distilled — the brilliant mind that has traveled so far it has come full circle to simplicity. After a lifetime of gathering, sorting, analyzing, and communicating, you've arrived at the place where the most complex truths can be spoken in the simplest words. You don't need to prove your intelligence anymore — your clarity IS the proof. The Teacher's Moon has the rarest gift of all: the ability to make the profound accessible without dumbing it down.",
      gifts: ["Clarity of communication", "Distilling complexity to simplicity", "Teaching from deep experience", "Bridge between knowledge and understanding"],
      challenges: ["May oversimplify out of weariness", "Difficulty with students who aren't ready", "Can feel their wisdom is undervalued", "Tired of explaining"],
      soulLesson: "Learning that the final lesson you teach is your own silence — that sometimes the most powerful teaching is BEING, not explaining.",
      inRelationships: "You bring wisdom, clarity, and an ability to understand your partner at the deepest level. Your challenge is just BEING with them, without always teaching or explaining."
    },
    Cancer: {
      name: "Keeper of Memories Moon",
      essence: "Guardian of the emotional treasury — the soul that remembers everything and forgives everything.",
      description: "The Keeper of Memories is the soul entrusted with the emotional history of the family, the community, the lineage. You remember — not just facts, but FEELINGS. The joy at the wedding, the grief at the funeral, the laughter at the dinner table, the tears shed in the dark. You carry these memories not as burdens but as sacred trusts. Your gift is that nothing is lost — every love, every loss, every moment of connection is held in your vast emotional memory. And the miracle is that you've learned to hold it all with tenderness rather than pain.",
      gifts: ["Vast emotional memory", "Ability to hold collective history", "Tenderness with the past", "Healing through remembering"],
      challenges: ["Weight of all those memories", "Difficulty living in the present", "May drown in nostalgia", "Others' projection of their own memories onto you"],
      soulLesson: "Learning that memories are not prisons — that you can hold the past in an open hand rather than a clenched fist.",
      inRelationships: "You remember every detail of your shared history. You hold the emotional archive of the relationship. Your challenge is being as present for new memories as you are devoted to old ones."
    },
    Leo: {
      name: "Bard's Moon",
      essence: "The final performance — art created not for applause but as an offering to eternity.",
      description: "The Bard's Moon is Leo's final, most magnificent creative act — the performance given not for an audience but for the AGES. You've moved beyond needing applause, beyond caring about reviews, beyond performing for recognition. What remains is pure creative expression — art for art's sake, beauty for beauty's sake, truth told not because anyone is listening but because it must be told. The Bard sings at the edge of the world, and the song echoes into eternity.",
      gifts: ["Art as spiritual offering", "Creating beyond ego", "Timeless self-expression", "Inspiring others through pure creative integrity"],
      challenges: ["May feel unheard", "Difficulty with worldly irrelevance", "Can be lonely at the edge of the world", "Risk of withdrawal from life"],
      soulLesson: "Learning that the song was always for yourself — that your truest audience has always been your own soul.",
      inRelationships: "You bring soulful creativity and the beauty of a love expressed without agenda. Your challenge is remembering that your partner is HERE, in this life, and needs your presence as much as your poetry."
    },
    Virgo: {
      name: "Monk's Moon",
      essence: "Sacred simplicity — service stripped of ego, devotion purified to its essence.",
      description: "The Monk's Moon is Virgo reduced to its essence — service so pure it becomes prayer, routine so sacred it becomes ritual. You've stripped away everything unnecessary until only the essential remains: the simple, devoted act of showing up, day after day, to serve something greater than yourself. This isn't deprivation; it's LIBERATION. By releasing everything that doesn't matter, you've discovered what does. The Monk's life is simple — and that simplicity is the most profound statement of faith.",
      gifts: ["Sacred simplicity", "Devotion without ego", "Finding the divine in daily routine", "Inspiring others through example"],
      challenges: ["Can become too austere", "Difficulty with pleasure and abundance", "May judge others' complexity", "Risk of spiritual pride in simplicity"],
      soulLesson: "Learning that the most sacred act is the simplest one performed with complete presence — that washing dishes can be as holy as prayer.",
      inRelationships: "You bring devotion, simplicity, and unwavering presence. Your challenge is allowing your partner's complexity and messiness — not requiring them to match your austerity."
    },
    Libra: {
      name: "Sacred Whore's Moon",
      essence: "Love beyond judgment — the soul that has loved enough to transcend all conditions.",
      description: "The Sacred Whore's Moon (this is Kaldera's term from temple priestess traditions) represents love in its most radical form — love that has transcended ALL conditions, judgments, and limitations. You've loved so many, so deeply, in so many forms, that you've arrived at a place where love itself is your identity. Not romantic love, not sexual love, not parental love — just LOVE, in its purest, most unconditional form. You see the divine in everyone, and your presence reminds others of their own divinity.",
      gifts: ["Unconditional love", "Seeing the divine in everyone", "Love as a spiritual practice", "Liberating others from shame"],
      challenges: ["Being misunderstood", "Others projecting their shame onto you", "Difficulty with conventional relationships", "Vulnerability to exploitation"],
      soulLesson: "Learning that the highest form of love includes loving YOURSELF with the same unconditional acceptance you offer everyone else.",
      inRelationships: "You bring love so deep it can transform your partner at the soul level. Your challenge is finding a partner who can receive that depth without being overwhelmed by it."
    },
    Scorpio: {
      name: "Phoenix Moon",
      essence: "Death and rebirth mastered — the soul that rises from its own ashes, again and again.",
      description: "The Phoenix Moon is Scorpio's ultimate archetype — the soul that has died and been reborn so many times that the process itself has become a trusted ally. You don't fear death anymore — not literal death, not ego death, not the death of relationships, careers, identities, or beliefs. You know from EXPERIENCE that something always rises from the ashes. That knowledge makes you the most fearless soul in the zodiac, because you know the secret: NOTHING truly dies. It only transforms.",
      gifts: ["Mastery of transformation", "Fearlessness about endings", "Ability to help others through their 'deaths'", "Deep trust in the cycle of renewal"],
      challenges: ["Can become detached from life", "May unconsciously create destruction", "Difficulty with stability and permanence", "Others' fear of your comfort with death"],
      soulLesson: "Learning that the final death is the death of the need to die — that the Phoenix's ultimate transformation is learning to LIVE without needing to burn.",
      inRelationships: "You bring profound understanding of transformation and an ability to love through the darkest times. Your challenge is not burning down the relationship to test if it can be reborn."
    },
    Sagittarius: {
      name: "Shaman's Moon",
      essence: "Walking between worlds — the traveler who has journeyed so far inward they can heal others.",
      description: "The Shaman's Moon is the Sagittarian who has traveled so far that the journey turned inward. You started as a traveler of the outer world and became a traveler of the INNER world — the visionary who walks between dimensions, who speaks with spirits, who brings back medicine from the unseen realms. This isn't metaphor — at least, not entirely. Your consciousness genuinely operates on multiple levels simultaneously, and your gift is bringing healing wisdom from one level to another.",
      gifts: ["Interdimensional awareness", "Healing through spiritual travel", "Bridging seen and unseen worlds", "Teaching through vision"],
      challenges: ["Difficulty staying grounded", "Others' skepticism about your experience", "Risk of spiritual inflation", "Can feel alienated from 'normal' reality"],
      soulLesson: "Learning that the shaman's ultimate journey is the return — that the medicine only works when brought back to the village.",
      inRelationships: "You bring spiritual depth and an awareness that transcends the ordinary. Your challenge is being fully present in the HERE — meeting your partner in the physical world, not just the spiritual one."
    },
    Capricorn: {
      name: "Dragon's Moon",
      essence: "Ancient power guarding ancient treasure — the soul that has earned its authority through lifetimes.",
      description: "The Dragon's Moon is the oldest, most powerful archetype in the Capricorn series — the soul that has accumulated power and wisdom over what feels like LIFETIMES. Like the dragon of mythology, you guard treasure — not gold, but ancient wisdom, tested truths, hard-won understanding. Your authority doesn't come from a title or a position; it comes from the sheer weight of your experience. People sense it when they meet you — the feeling that this person has BEEN here, has SEEN things, and knows more than they're saying.",
      gifts: ["Ancient authority", "Guarding sacred wisdom", "Profound life experience", "Presence that commands respect without words"],
      challenges: ["Can become hoarding with wisdom", "Difficulty with lightness and play", "May intimidate others unintentionally", "Risk of isolation through power"],
      soulLesson: "Learning that the dragon's treasure was always meant to be shared — that hoarding wisdom serves no one, least of all the dragon.",
      inRelationships: "You bring depth, gravitas, and the safety of ancient power. Your challenge is letting your partner see the soft belly beneath the scales — the dragon who wants to be loved, not just respected."
    },
    Aquarius: {
      name: "Prophet's Moon",
      essence: "Vision beyond time — the seer whose radical ideas will only be understood in the future.",
      description: "The Prophet's Moon sees what cannot yet be seen — the future that is trying to be born through you. Your visions, your ideas, your understanding of where humanity is heading — these are so far ahead of the collective that they may not be understood in your lifetime. This is both your gift and your burden: to see so clearly, and to be so misunderstood. The Prophet doesn't seek followers; the Prophet seeks TRUTH, and trusts that truth will find its audience in time.",
      gifts: ["Vision of the future", "Seeing truths before their time", "Holding space for what's emerging", "Inspiring future generations"],
      challenges: ["Being ahead of your time", "Loneliness of the visionary", "Frustration with the present", "Risk of disconnecting from present life"],
      soulLesson: "Learning that the prophet's peace comes from trusting the SEED, not needing to see the TREE — that your work will bear fruit you may never taste.",
      inRelationships: "You bring a sense of cosmic purpose and future vision. Your challenge is being present with your partner NOW — loving what IS rather than what WILL BE."
    },
    Pisces: {
      name: "Mystic's Moon",
      essence: "Transparent to the divine — the soul that has dissolved so completely it becomes a pure channel.",
      description: "The Mystic's Moon is the final archetype in the entire 96-Moon system — the soul that has journeyed through every phase, every sign, every crisis, and every triumph, and has arrived at the place of ultimate transparency. You are no longer separate from the divine — you ARE the divine, experiencing itself through a temporary human form. This isn't ego inflation; it's ego DISSOLUTION. The mystic has no need for identity because they've discovered that they ARE everything. And from that place of cosmic unity, paradoxically, they become the most uniquely, beautifully human beings of all.",
      gifts: ["Direct divine connection", "Complete spiritual transparency", "Being a channel for grace", "Inspiring awe through simple presence"],
      challenges: ["Functioning in the material world", "Being understood by others", "Maintaining physical health and boundaries", "The loneliness of total unity"],
      soulLesson: "Learning that the mystic's final lesson is the simplest one: be here, be now, be love.",
      inRelationships: "You bring a love so vast it feels cosmic. Your partner experiences being loved by something greater than a person. Your challenge is also being the person — the one who takes out the trash, argues about bills, and falls asleep watching TV."
    },
  },
};

/** Phase chapter descriptions from Kaldera */
export const PHASE_CHAPTER_TITLES: Record<string, string> = {
  'New Moon':         'In the Beginning',
  'Waxing Crescent':  'Call to Action',
  'First Quarter':    'Internal Crisis',
  'Waxing Gibbous':   "Soul's Redemption",
  'Full Moon':        'Consummation',
  'Waning Gibbous':   'The Greater Good',
  'Last Quarter':     'Crisis of Consciousness',
  'Balsamic':         'Into the Deep',
};

/** Lookup helper: get archetype for a phase+sign combo */
export function getKalderaArchetype(phase: string, sign: string): MoonArchetype | null {
  return MOON_PHASE_SIGN_ARCHETYPES[phase]?.[sign] ?? null;
}

/** Get all 8 archetypes for a given sign (one per phase) */
export function getArchetypesForSign(sign: string): { phase: string; archetype: MoonArchetype }[] {
  const phases = Object.keys(MOON_PHASE_SIGN_ARCHETYPES);
  return phases
    .map(phase => ({ phase, archetype: MOON_PHASE_SIGN_ARCHETYPES[phase]?.[sign] }))
    .filter((entry): entry is { phase: string; archetype: MoonArchetype } => !!entry.archetype);
}

/** Get all 12 sign archetypes for a given phase */
export function getArchetypesForPhase(phase: string): { sign: string; archetype: MoonArchetype }[] {
  const phaseMap = MOON_PHASE_SIGN_ARCHETYPES[phase];
  if (!phaseMap) return [];
  return Object.entries(phaseMap).map(([sign, archetype]) => ({ sign, archetype }));
}
