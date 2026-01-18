// Deep House Interpretations
// Comprehensive house meanings including:
// - Life stage relevance (child vs adult)
// - How planets there affect the native
// - How others respond to planets there
// - Transit effects
// - Natural ruler and associations

export interface HouseInterpretation {
  number: number;
  name: string;
  naturalRuler: string;
  naturalSign: string;
  keywords: string[];
  
  // Core meaning
  core: string;
  
  // Life stage specific - how this house manifests at different ages
  lifeStages: {
    child: string;      // 0-12
    adolescent: string; // 12-21
    youngAdult: string; // 21-30
    adult: string;      // 30-50
    elder: string;      // 50+
  };
  
  // How planets in this house affect the native
  nativeExperience: string;
  
  // How others respond to planets in this house
  othersPerceive: string;
  
  // Body/appearance associations (especially relevant for 1st house)
  body?: string;
  
  // Shadow side
  shadow: string;
  
  // Growth direction
  growth: string;
}

export const DEEP_HOUSE_INTERPRETATIONS: Record<number, HouseInterpretation> = {
  1: {
    number: 1,
    name: 'House of Self',
    naturalRuler: 'Mars',
    naturalSign: 'Aries',
    keywords: ['identity', 'body', 'appearance', 'first impressions', 'self-image', 'vitality'],
    
    core: 'The 1st house is YOU — your physical body, your appearance, your vitality, and how you instinctively approach life. It is not who you think you are (that\'s the Sun) but how you show up in the world before you consciously try to be anything. Planets here are immediately visible to everyone who meets you.',
    
    lifeStages: {
      child: 'Planets here shape the child\'s constitution, physical health, and how they assert themselves. A child with strong 1st house planets is noticeable — they stand out without trying. This is where you see temperament differences from birth.',
      adolescent: 'The 1st house becomes about identity formation and physical self-consciousness. Body image issues often relate to challenging 1st house placements. This is when the native starts consciously working on their "persona."',
      youngAdult: 'The 1st house is about projecting yourself into the world — job interviews, first dates, making impressions. Planets here affect how easily you launch into new situations.',
      adult: 'The 1st house settles into your established identity and physical maintenance. You are less focused on becoming and more on being. Health and vitality become more conscious concerns.',
      elder: 'The 1st house relates to physical decline or sustained vitality. How you age is shown here. The mask you\'ve worn softens or hardens depending on how you\'ve worked with this house.',
    },
    
    nativeExperience: 'Planets in your 1st house feel like core parts of your identity — you can\'t separate yourself from them. They affect your body, your energy levels, and your automatic approach to life. You project them without trying.',
    
    othersPerceive: 'Others see your 1st house planets immediately. Before you speak, before they know your name, they pick up on this energy. It shapes whether people find you approachable, intimidating, attractive, or confusing. It IS your first impression.',
    
    body: 'The 1st house rules the physical body, especially the head and face. Transits to the 1st house often coincide with appearance changes — weight gain or loss, new style, physical vitality shifts. Venus transits can enhance attractiveness. Saturn transits can cause weight gain, skin issues, or a more serious appearance. Mars can bring injuries to the head or increased physical energy.',
    
    shadow: 'Excessive self-focus, difficulty seeing beyond your own perspective, using appearance as a shield, body obsession, or conversely, neglecting your physical vessel entirely.',
    
    growth: 'Conscious self-development — becoming who you are intentionally rather than just reacting. Learning that your appearance and energy affect others and taking responsibility for the impression you create.',
  },
  
  2: {
    number: 2,
    name: 'House of Resources',
    naturalRuler: 'Venus',
    naturalSign: 'Taurus',
    keywords: ['money', 'values', 'possessions', 'self-worth', 'talents', 'security'],
    
    core: 'The 2nd house is what you have — your money, possessions, talents, and values. It is also your sense of self-worth, independent of what others think. Planets here show how you make money, what you value, and where your material security comes from.',
    
    lifeStages: {
      child: 'The 2nd house shows the child\'s relationship with "having" — sharing toys, allowance, the feeling of "mine." Early experiences with scarcity or abundance here shape lifelong money attitudes.',
      adolescent: 'First jobs, earning your own money, developing talents that feel valuable. Self-worth becomes tied to external validation and material success.',
      youngAdult: 'Building financial independence, discovering what you\'re good at, establishing earning patterns. This is where you learn whether you can support yourself.',
      adult: 'The 2nd house is about financial stability, investments, and what you\'ve accumulated. Your values are established. You know what you\'re worth.',
      elder: 'The 2nd house becomes about what you leave behind — materially and in terms of values transmitted. Financial security in retirement. What was it all worth?',
    },
    
    nativeExperience: 'Planets in your 2nd house color how you experience money and value. You may feel rich or poor regardless of actual net worth depending on these planets. Your talents and earning capacity flow through this energy.',
    
    othersPerceive: 'Others see your 2nd house planets through what you own, how you spend, and your apparent security or insecurity. They sense whether you feel "worth it" or chronically inadequate.',
    
    shadow: 'Materialism, hoarding, tying all self-worth to money, possessiveness, or conversely, rejecting material reality as beneath you.',
    
    growth: 'Understanding that true security comes from within. Using resources wisely. Knowing your worth independent of what you own. Generosity without losing yourself.',
  },
  
  3: {
    number: 3,
    name: 'House of Communication',
    naturalRuler: 'Mercury',
    naturalSign: 'Gemini',
    keywords: ['communication', 'siblings', 'early education', 'neighbors', 'short trips', 'mind', 'learning style'],
    
    core: 'The 3rd house is your immediate environment — how you think, communicate, and interact with your local world. It rules siblings, neighbors, early schooling, and everyday mental activity. Planets here show how your mind works and how you exchange information.',
    
    lifeStages: {
      child: 'THIS IS CRITICAL FOR CHILDREN. The 3rd house shows early school experience, learning style, relationship with siblings, and communication development. A challenging 3rd house can indicate learning differences, speech delays, or sibling conflicts. A strong 3rd house child is curious, talkative, and mentally quick.',
      adolescent: 'The 3rd house rules how the teen communicates with peers, engages with school, and develops their thinking style. Social awkwardness or popularity often relates to 3rd house placements.',
      youngAdult: 'Commuting, networking, daily communication in work settings. The 3rd house determines how you navigate your local environment and immediate social sphere.',
      adult: 'The 3rd house settles into established communication patterns, relationships with siblings (often tested at this stage), and ongoing learning. How you stay mentally sharp.',
      elder: 'Mental agility in later life, keeping the mind active, staying connected to community. The 3rd house shows cognitive health patterns.',
    },
    
    nativeExperience: 'Planets in your 3rd house affect how you think and communicate every day. This is not deep philosophical thinking (9th house) but daily mental activity — emails, conversations, learning new things, getting around.',
    
    othersPerceive: 'Others experience your 3rd house through your words, your curiosity (or lack thereof), your local presence. Your siblings and neighbors know this energy intimately — it\'s how you show up in everyday life.',
    
    shadow: 'Superficiality, gossip, scattered thinking, talking without listening, sibling rivalry, restlessness.',
    
    growth: 'Learning to truly listen. Developing mental discipline without losing curiosity. Using words consciously. Healing sibling relationships. Becoming a perpetual student.',
  },
  
  4: {
    number: 4,
    name: 'House of Home',
    naturalRuler: 'Moon',
    naturalSign: 'Cancer',
    keywords: ['home', 'family', 'roots', 'mother/nurturing parent', 'ancestry', 'private self', 'emotional foundation'],
    
    core: 'The 4th house is your foundation — home, family, ancestry, and your most private self. It shows where you come from, what you retreat to, and the emotional base you operate from. Planets here often connect to the mother or nurturing parent and to inherited family patterns.',
    
    lifeStages: {
      child: 'The 4th house IS childhood for the child — their home environment, relationship with nurturing parent, sense of belonging. A challenged 4th house child may feel emotionally unsafe at home or rootless.',
      adolescent: 'The 4th house becomes something to push against — individuation requires separating from family patterns while still being supported by them.',
      youngAdult: 'Creating your own home, separate from family of origin. The 4th house shows what you recreate or deliberately reject from childhood.',
      adult: 'The 4th house is about establishing your own family patterns, homeownership, becoming the parent. Dealing with aging parents activates this house.',
      elder: 'The 4th house is about returning to roots, legacy within family, where you will live out your final years. The end of life (opposite to 10th house public achievements).',
    },
    
    nativeExperience: 'Planets in your 4th house shape your emotional foundation. You experience them in private, at home, when your guard is down. They may connect to family patterns that feel inescapable.',
    
    othersPerceive: 'Most people don\'t see your 4th house — only those who enter your private life. Family members know this energy well. It\'s who you are at home, not who you are in public.',
    
    shadow: 'Hiding from the world, excessive attachment to family, inability to leave the past, recreating childhood trauma, emotional dependency.',
    
    growth: 'Creating genuine emotional security. Healing family patterns. Building a home that reflects your soul. Becoming a source of nurturing for others.',
  },
  
  5: {
    number: 5,
    name: 'House of Creativity',
    naturalRuler: 'Sun',
    naturalSign: 'Leo',
    keywords: ['creativity', 'self-expression', 'children', 'romance', 'play', 'joy', 'hobbies', 'performance'],
    
    core: 'The 5th house is creative self-expression — what you create, how you play, romance (not marriage), children, and what brings you joy. It is the house of being seen and appreciated for what you uniquely bring forth. Planets here need an audience.',
    
    lifeStages: {
      child: 'The 5th house is essential for children — it shows how they play, what they create, their joy and spontaneity. A blocked 5th house child may struggle to play or may feel they need to perform for love.',
      adolescent: 'Romance, creative expression, and finding what makes life worth living. The 5th house is about discovering what you love to do, not what you should do.',
      youngAdult: 'Dating, creative pursuits, and possibly having children. The 5th house shows your relationship with fun, pleasure, and self-expression.',
      adult: 'Raising children, maintaining creative outlets, keeping romance alive. The 5th house can become neglected as responsibilities mount — this is where mid-life crises originate.',
      elder: 'Grandchildren, legacy through creation, the ability to still play and find joy. The 5th house shows whether aging is joyful or joyless.',
    },
    
    nativeExperience: 'Planets in your 5th house feel like your creative core — what you want to be known for, what you create, how you love romantically. They need expression and appreciation.',
    
    othersPerceive: 'Others see your 5th house through what you create and how you express yourself. They experience your playfulness or seriousness, your romantic nature, your relationship with children.',
    
    shadow: 'Drama addiction, needing constant attention, using creativity for ego gratification only, treating romance as performance, living vicariously through children.',
    
    growth: 'Creating for its own sake. Playing without needing an audience. Loving without needing validation. Letting children be themselves. Finding joy in the ordinary.',
  },
  
  6: {
    number: 6,
    name: 'House of Service',
    naturalRuler: 'Mercury',
    naturalSign: 'Virgo',
    keywords: ['work', 'health', 'daily routines', 'service', 'habits', 'employees', 'pets', 'self-improvement'],
    
    core: 'The 6th house is daily life — your work (not career), health, routines, and service to others. It shows how you maintain your body and your life, what work you do, and your relationship with those who serve you or whom you serve. Planets here are about functioning and improvement.',
    
    lifeStages: {
      child: 'The 6th house shows the child\'s health patterns, daily routines, and early relationship with chores and helping. A strong 6th house child is helpful and organized; a challenged one may have health issues or resist structure.',
      adolescent: 'First jobs, developing work habits, health consciousness. The 6th house shapes whether the teen is responsible or rebels against routine.',
      youngAdult: 'Establishing work identity (not career ambition but daily work), health habits that will last, and personal routines.',
      adult: 'The 6th house is about sustainable work, managing health, and the accumulation of daily habits. Chronic health issues often trace to 6th house patterns.',
      elder: 'Health maintenance becomes critical. The 6th house shows how well daily habits have served you and what adjustments are needed for aging.',
    },
    
    nativeExperience: 'Planets in your 6th house shape your daily experience — your work environment, your health, your routines. They are not glamorous but essential. You experience them through doing, serving, and maintaining.',
    
    othersPerceive: 'Others see your 6th house through your work ethic, your helpfulness, your health, and your attention to detail. Co-workers and employees know this energy.',
    
    shadow: 'Workaholism, perfectionism, hypochondria, martyrdom through service, using health issues for attention, controlling through details.',
    
    growth: 'Service without martyrdom. Health as self-care, not obsession. Work as contribution. Finding meaning in the mundane. Sustainable routines.',
  },
  
  7: {
    number: 7,
    name: 'House of Partnership',
    naturalRuler: 'Venus',
    naturalSign: 'Libra',
    keywords: ['marriage', 'committed partnerships', 'one-on-one relationships', 'contracts', 'open enemies', 'projection'],
    
    core: 'The 7th house is the other — committed partnerships, marriage, and how you relate one-on-one. Opposite your 1st house of self, it shows what you seek in others, what you project onto partners, and who you attract. Planets here are often experienced through your significant relationships.',
    
    lifeStages: {
      child: 'The 7th house for children shows early one-on-one relating patterns, often with best friends or perceived rivals. It can indicate what they\'ll later seek in partners.',
      adolescent: 'First serious relationships, learning to relate as an equal, experiencing others as mirrors. The 7th house shapes relationship patterns that last.',
      youngAdult: 'Marriage, committed partnerships, business partnerships. The 7th house becomes highly activated as you choose your person.',
      adult: 'Living out partnership patterns — for better or worse. The 7th house shows relationship dynamics, conflicts, and growth through other.',
      elder: 'Long partnerships, loss of partners, the legacy of how you loved. The 7th house shows relationship wisdom or repeated patterns.',
    },
    
    nativeExperience: 'Planets in your 7th house are often experienced through others — you attract or marry them. They show what you seek in partnership and what parts of yourself you may project onto partners.',
    
    othersPerceive: 'Your partners know your 7th house intimately — it\'s what you bring to relationship. Others see it through how you partner, your relationship status, and your relational patterns.',
    
    shadow: 'Losing yourself in relationships, projecting disowned parts onto partners, serial relationships, defining yourself only through others, avoiding commitment or forcing it.',
    
    growth: 'Owning your projections. Choosing partnership consciously. Relating as a whole person rather than seeking completion. Balance between independence and intimacy.',
  },
  
  8: {
    number: 8,
    name: 'House of Transformation',
    naturalRuler: 'Pluto (traditional: Mars)',
    naturalSign: 'Scorpio',
    keywords: ['death/rebirth', 'shared resources', 'other people\'s money', 'sex', 'intimacy', 'psychology', 'inheritance', 'taxes', 'crisis'],
    
    core: 'The 8th house is depth — transformation through crisis, shared resources (other people\'s money, inheritance, taxes), intimacy, sex, and death. It is where you merge with another and are changed by it. Planets here are intense, hidden, and powerful.',
    
    lifeStages: {
      child: 'The 8th house for children shows early encounters with taboo, death, family secrets, or intense family dynamics. A child with strong 8th house placements may sense what others hide.',
      adolescent: 'Sexual awakening, encounters with mortality, psychological intensity. The 8th house teen feels things deeply and may have crisis experiences.',
      youngAdult: 'Merging finances through partnership, dealing with debts and shared resources. First major transformations and potential inheritances.',
      adult: 'The 8th house is about ongoing transformation, intimacy in long-term relationships, financial complexity, and facing mortality more directly.',
      elder: 'Legacy, inheritance to leave behind, processing life\'s transformations, preparing for death. The 8th house culminates in the final transformation.',
    },
    
    nativeExperience: 'Planets in your 8th house are experienced as deep, intense, often hidden even from yourself. They emerge in intimacy, crisis, and psychological work. They color your relationship with power, sex, and death.',
    
    othersPerceive: 'Most people don\'t see your 8th house — only those who go deep with you. Intimate partners, therapists, and those who share crisis with you know this energy.',
    
    shadow: 'Power games, manipulation, obsession, controlling through intimacy, refusing to transform, using crisis for drama, financial enmeshment.',
    
    growth: 'Transformation as spiritual practice. Healthy intimacy. Releasing control. Facing death consciously. Using power for healing. Psychological integration.',
  },
  
  9: {
    number: 9,
    name: 'House of Expansion',
    naturalRuler: 'Jupiter',
    naturalSign: 'Sagittarius',
    keywords: ['philosophy', 'higher education', 'long-distance travel', 'beliefs', 'religion', 'publishing', 'law', 'meaning', 'gurus'],
    
    core: 'The 9th house is expansion — philosophy, higher education, long journeys, beliefs, and meaning-making. Opposite the 3rd house of everyday thinking, it is about wisdom, not just information. Planets here seek the big picture and life\'s ultimate meaning.',
    
    lifeStages: {
      child: 'The 9th house for children shows their relationship with religion, different cultures, and big questions about life. A strong 9th house child asks "why" constantly.',
      adolescent: 'Questioning inherited beliefs, seeking meaning, potentially encountering different cultures. The 9th house teen may reject or embrace family religion.',
      youngAdult: 'College and higher education, travel, forming your own philosophy of life. The 9th house shapes worldview.',
      adult: 'The 9th house is about living your philosophy, continuing education, travel for meaning, and potentially teaching what you\'ve learned.',
      elder: 'Wisdom gained, philosophy tested and refined, becoming a teacher or guru. The 9th house shows what meaning you\'ve made of life.',
    },
    
    nativeExperience: 'Planets in your 9th house shape your worldview, your beliefs, your relationship with expansion and meaning. You experience them through travel, learning, and seeking truth.',
    
    othersPerceive: 'Others experience your 9th house through your beliefs, your teaching, your enthusiasm for ideas. You may seem wise or preachy, adventurous or ungrounded.',
    
    shadow: 'Dogmatism, preachiness, constant escape through travel, guru complexes, imposing beliefs on others, never settling, intellectual arrogance.',
    
    growth: 'Holding beliefs lightly. Seeking truth rather than being right. Teaching through example. Grounding wisdom in daily life. Expansion that includes depth.',
  },
  
  10: {
    number: 10,
    name: 'House of Career',
    naturalRuler: 'Saturn',
    naturalSign: 'Capricorn',
    keywords: ['career', 'reputation', 'public image', 'authority', 'achievement', 'father/authority parent', 'legacy', 'status'],
    
    core: 'The 10th house is your public life — career, reputation, achievements, and how the world knows you. Opposite the 4th house of home, it is what you build in public. Planets here are visible to everyone and shape your professional path and legacy.',
    
    lifeStages: {
      child: 'The 10th house for children shows their relationship with authority figures, ambition, and what they want to be when they grow up. It often relates to the authoritative parent.',
      adolescent: 'Developing ambition, encountering authority structures, beginning to imagine a future self. The 10th house teen is thinking about career.',
      youngAdult: 'Launching career, building reputation, early encounters with professional authority. The 10th house becomes highly activated.',
      adult: 'The 10th house is peak career time — achievements, recognition, or frustration if blocked. This is where your public contribution is made.',
      elder: 'Legacy, what you\'re known for, passing authority to the next generation. The 10th house shows what you built that lasts.',
    },
    
    nativeExperience: 'Planets in your 10th house shape your ambition and career. You experience them in professional settings, in relationship with authority, and in how you build your public life.',
    
    othersPerceive: 'Everyone sees your 10th house — it\'s your public image, your reputation, your professional identity. It\'s how you\'re known in the world beyond your personal circle.',
    
    shadow: 'Workaholism, status obsession, sacrificing personal life for achievement, authoritarianism, empty ambition, defining yourself only by career.',
    
    growth: 'Achievement that serves. Authority earned through integrity. Building something that matters beyond ego. Balancing public and private life.',
  },
  
  11: {
    number: 11,
    name: 'House of Community',
    naturalRuler: 'Uranus (traditional: Saturn)',
    naturalSign: 'Aquarius',
    keywords: ['friends', 'groups', 'hopes and wishes', 'causes', 'collective', 'future', 'humanity', 'social movements'],
    
    core: 'The 11th house is collective — friends, groups, causes, and your vision for the future. Opposite the 5th house of personal creativity, it is about contributing to something larger. Planets here are experienced through community and collective endeavors.',
    
    lifeStages: {
      child: 'The 11th house for children shows friendship patterns, fitting in or standing out, relationship to groups. A challenged 11th house child may feel like an outsider.',
      adolescent: 'Friend groups become essential, finding your tribe, causes you care about. The 11th house teen is forming their social identity.',
      youngAdult: 'Networks, professional connections, group affiliations. The 11th house shapes who you know and what causes you serve.',
      adult: 'The 11th house is about your place in community, your contribution to causes, your friendships over time.',
      elder: 'Legacy within community, wisdom shared with groups, the humanity you\'ve served. The 11th house shows your collective contribution.',
    },
    
    nativeExperience: 'Planets in your 11th house are experienced through groups, friends, and causes. You may feel more yourself in community than alone. Your hopes and visions for the future live here.',
    
    othersPerceive: 'Your friends and group members know your 11th house. It\'s how you function in collective settings, your role in the tribe, your vision for the future.',
    
    shadow: 'Losing yourself in groups, detaching from personal relationships for causes, being a social chameleon, following trends, isolation disguised as independence.',
    
    growth: 'Finding your people. Contributing to causes without losing yourself. Balancing personal and collective needs. Vision that includes others.',
  },
  
  12: {
    number: 12,
    name: 'House of the Unconscious',
    naturalRuler: 'Neptune (traditional: Jupiter)',
    naturalSign: 'Pisces',
    keywords: ['unconscious', 'secrets', 'solitude', 'spirituality', 'institutions', 'karma', 'self-undoing', 'hidden enemies', 'dreams'],
    
    core: 'The 12th house is hidden — the unconscious, spirituality, what you hide from yourself, karma, institutions, and transcendence. Planets here operate behind the scenes, often invisibly even to you. They are your private spiritual life, your hidden patterns, and what undoes you.',
    
    lifeStages: {
      child: 'The 12th house for children can indicate hidden sensitivities, imaginary friends, or family secrets they absorb. A strong 12th house child may be intuitive or prone to escape into fantasy.',
      adolescent: 'Hidden struggles, private spiritual development, the unconscious shaping behavior. The 12th house teen may have secret lives or hidden pain.',
      youngAdult: 'Confronting unconscious patterns, possibly through therapy or spiritual practice. The 12th house is where self-undoing patterns emerge.',
      adult: 'The 12th house is about integrating the shadow, spiritual development, and working with what has been hidden. Possibly working in institutions.',
      elder: 'Spiritual preparation for death, accumulated karma, transcendence. The 12th house culminates in the return to source.',
    },
    
    nativeExperience: 'Planets in your 12th house operate beneath your awareness. You may not know you have them until they emerge in dreams, therapy, or crisis. They are your hidden strengths and hidden saboteurs.',
    
    othersPerceive: 'Most people don\'t see your 12th house — it\'s hidden. But it leaks out in unconscious patterns others notice before you do. Therapists, spiritual teachers, and those who see you in solitude know this energy.',
    
    shadow: 'Escapism, addiction, victimhood, self-undoing, hiding from reality, denial, getting lost in institutions or ideology.',
    
    growth: 'Making the unconscious conscious. Spiritual practice. Healthy solitude. Compassion that includes yourself. Serving the invisible. Transcendence through integration, not escape.',
  }
};

// Planet effects in each house - how others respond to you
export const PLANET_IN_HOUSE_EFFECTS: Record<string, Record<number, { 
  native: string; 
  othersRespond: string;
  childContext?: string;
}>> = {
  Sun: {
    1: {
      native: 'Your identity and purpose are front and center. You shine through being yourself — your presence is naturally noticeable.',
      othersRespond: 'Others see you as confident, sometimes self-focused. They may be drawn to your vitality or intimidated by your presence.',
      childContext: 'This child is naturally visible, stands out, and may need to learn that not everything is about them.'
    },
    2: {
      native: 'Your identity is tied to what you build, own, and value. Financial security and material achievement aren\'t shallow — they express your core self.',
      othersRespond: 'Others see you as materially focused or as someone who values quality. They may seek financial advice or see you as possessive.',
      childContext: 'This child\'s self-esteem is tied to having things. Teach that worth isn\'t about possessions.'
    },
    3: {
      native: 'Your identity shines through communication. You are the eternal student and teacher — your mind and words express who you are.',
      othersRespond: 'Others experience you as talkative, curious, mentally quick. They come to you for information and conversation.',
      childContext: 'This child needs mental stimulation and may talk constantly. Honor their curiosity while teaching focus.'
    },
    4: {
      native: 'Your identity is rooted in home and family. You may be the family pillar, focused on creating a home that reflects your soul.',
      othersRespond: 'Others may not see this publicly. Family members experience your strong presence at home.',
      childContext: 'This child needs a strong home foundation. They may be heavily influenced by the nurturing parent.'
    },
    5: {
      native: 'Your identity shines through creativity and self-expression. You need an audience and to be appreciated for what you create.',
      othersRespond: 'Others see you as creative, dramatic, fun-loving. They may be drawn to your warmth or see you as attention-seeking.',
      childContext: 'This child NEEDS creative outlet and appreciation. Drama is essential, not excessive.'
    },
    6: {
      native: 'Your identity is expressed through work and service. Being useful is your path to self-realization. Health is a core concern.',
      othersRespond: 'Others see you as hardworking, helpful, possibly perfectionist. They may rely on you to fix things.',
      childContext: 'This child needs to be useful. Give them responsibilities and praise their effort.'
    },
    7: {
      native: 'Your identity is discovered through relationship. You find yourself in the mirror of others. Partnership is essential.',
      othersRespond: 'Others experience you as focused on relationship, possibly dependent, always seeking a partner.',
      childContext: 'This child defines themselves through friendships and may struggle when alone.'
    },
    8: {
      native: 'Your identity shines through intensity and transformation. Surface living isn\'t for you — you seek depth and power.',
      othersRespond: 'Others experience you as intense, mysterious, possibly intimidating. They may share secrets with you or fear your perception.',
      childContext: 'This child senses what others hide and needs help processing intensity.'
    },
    9: {
      native: 'Your identity expands through seeking meaning. Travel, philosophy, and higher learning are expressions of who you are.',
      othersRespond: 'Others see you as wise or preachy, adventurous or ungrounded. They may seek your perspective on meaning.',
      childContext: 'This child asks big questions. Feed their curiosity about the world and meaning.'
    },
    10: {
      native: 'Your identity is public. You shine through career and achievement. You are building a legacy the world will see.',
      othersRespond: 'Everyone knows your 10th house Sun — it\'s your public image. They see you as ambitious, authoritative, or status-focused.',
      childContext: 'This child is oriented toward achievement and may relate strongly to the authoritative parent.'
    },
    11: {
      native: 'Your identity shines within groups. You are the networker, the humanitarian, bringing people together for causes.',
      othersRespond: 'Others see you as the social connector, the one with ideals. They may experience you as friendly but detached.',
      childContext: 'This child needs their tribe. Help them find friends who share their values.'
    },
    12: {
      native: 'Your identity shines in hidden ways. You work behind the scenes, in spiritual or institutional contexts. Solitude is necessary.',
      othersRespond: 'Others may not see you clearly. You seem mysterious, spiritual, or hard to pin down.',
      childContext: 'This child needs solitude and may have a rich inner life others don\'t see. Don\'t force extroversion.'
    }
  },
  
  Saturn: {
    1: {
      native: 'You come across as serious, responsible, possibly older than your years. Your identity is earned through maturity and discipline.',
      othersRespond: 'Others see you as reliable but possibly cold or unapproachable. They may seek you for serious matters.',
      childContext: 'This child may seem old before their time, serious, or burdened. They need permission to be a child.'
    },
    2: {
      native: 'Financial security is hard-won. You may fear scarcity or work harder than others for money. Self-worth is a lesson.',
      othersRespond: 'Others may see you as financially cautious, frugal, or as having money struggles.',
      childContext: 'This child may worry about money or feel they don\'t have enough. Teach security from within.'
    },
    3: {
      native: 'Communication and learning may have felt blocked early on. You develop expertise through discipline. Words carry weight.',
      othersRespond: 'Others experience you as thoughtful, possibly slow to speak, but worth listening to. They may find you critical.',
      childContext: 'This child may have learning challenges, speech delays, or difficulty with siblings. Patience is essential.'
    },
    4: {
      native: 'Home and family may have felt restrictive or cold. You carry ancestral weight and must build your own emotional security.',
      othersRespond: 'Family members experience your seriousness. Others may not see this — it\'s private.',
      childContext: 'This child may feel emotionally unsupported at home or carry family burden. They need extra nurturing.'
    },
    5: {
      native: 'Play and creativity may have felt blocked. Romance is serious. You learn joy through discipline and may delay having children.',
      othersRespond: 'Others may see you as unable to relax, too serious in romance, or as a disciplined creative.',
      childContext: 'This child may struggle to play freely. Help them find structured creative outlets.'
    },
    6: {
      native: 'Work is demanding and health requires constant attention. You take responsibility seriously, possibly to a fault.',
      othersRespond: 'Others experience you as the reliable worker, possibly the one who overworks. They may rely on your discipline.',
      childContext: 'This child may have health concerns or take responsibilities very seriously. Watch for over-responsibility.'
    },
    7: {
      native: 'Relationships feel karmic and heavy. You may marry late or choose a serious partner. Commitment is not casual.',
      othersRespond: 'Partners experience you as committed but possibly demanding. Others see you as serious about relationship.',
      childContext: 'This child may have difficulty with friendships or attract older friends. Teach balanced relating.'
    },
    8: {
      native: 'Trust comes hard. Intimacy requires control to release. You face deep fears around power, death, and vulnerability.',
      othersRespond: 'Intimate partners experience your control issues. Others may sense your depth and caution.',
      childContext: 'This child may have fears around death or hidden anxieties. They need safe space to process intensity.'
    },
    9: {
      native: 'Beliefs are tested early. Education may have been delayed or difficult. You earn your wisdom through experience.',
      othersRespond: 'Others may see you as philosophically cautious, skeptical, or as having hard-won wisdom.',
      childContext: 'This child may question religion or struggle with imposed beliefs. Let them develop their own philosophy.'
    },
    10: {
      native: 'Career is serious. Success comes slowly through discipline. You fear public failure but build lasting authority.',
      othersRespond: 'The public sees you as authoritative, possibly cold. They respect your achievement but may find you unapproachable.',
      childContext: 'This child is very aware of achievement and may fear failure. Praise effort, not just results.'
    },
    11: {
      native: 'You may feel like an outsider in groups. Friendships require work. You\'re the responsible one in collective endeavors.',
      othersRespond: 'Friends experience you as reliable but possibly distant. Groups may see you as the serious one.',
      childContext: 'This child may struggle to fit in or feel like they don\'t belong. Help them find their people.'
    },
    12: {
      native: 'You carry unconscious burdens, possibly karmic. Solitude is necessary but may feel heavy. Hidden fears need facing.',
      othersRespond: 'Others may not see this — it operates behind the scenes. You may seem withdrawn or spiritually serious.',
      childContext: 'This child may have hidden fears, nightmares, or feel inexplicably burdened. They need gentle spiritual support.'
    }
  },
  
  Venus: {
    1: {
      native: 'You are naturally charming and attractive. Beauty and grace are immediately visible. You lead with harmony.',
      othersRespond: 'Others find you attractive and approachable. They may seek your company and favor.',
      childContext: 'This child is naturally charming and may use appearance to navigate the world.'
    },
    2: {
      native: 'Money flows toward you. You value beauty, comfort, and quality. Self-worth is tied to what you can attract.',
      othersRespond: 'Others may see you as materially fortunate, stylish, or focused on comfort.',
      childContext: 'This child appreciates quality and comfort. Teach that worth isn\'t about things.'
    },
    3: {
      native: 'Communication is charming and diplomatic. You attract through words and have pleasant relationships with siblings.',
      othersRespond: 'Others find your communication pleasant. Siblings and neighbors are generally harmonious.',
      childContext: 'This child communicates sweetly and may be the peacemaker with siblings.'
    },
    4: {
      native: 'Home must be beautiful and harmonious. Family relationships are generally pleasant. You nurture through comfort.',
      othersRespond: 'Family experiences your love of beauty at home. Others may not see this — it\'s private.',
      childContext: 'This child needs a beautiful, harmonious home environment.'
    },
    5: {
      native: 'Romance is abundant. Creative expression flows. Love affairs are pleasant and you attract easily.',
      othersRespond: 'Others see you as romantic, creative, possibly a bit of a heartbreaker.',
      childContext: 'This child is naturally creative and may have early "crushes." They need creative outlet.'
    },
    6: {
      native: 'Work environment must be pleasant. You bring harmony to daily routines. Health benefits from pleasure.',
      othersRespond: 'Co-workers find you pleasant and harmonizing. Others seek you to smooth work relationships.',
      childContext: 'This child needs a pleasant daily environment and may struggle with harsh routines.'
    },
    7: {
      native: 'Partnership is essential and generally beneficial. You attract partners easily. Relationships are your art form.',
      othersRespond: 'Partners experience your devotion. Others see you as the natural partner, always in relationship.',
      childContext: 'This child is very relationship-oriented and may always have a "best friend."'
    },
    8: {
      native: 'Love goes deep. You attract through intensity and may receive through inheritance or partner resources.',
      othersRespond: 'Intimate partners experience your depth. Others sense something magnetic and intense.',
      childContext: 'This child feels deeply in relationships and may have intense attachments.'
    },
    9: {
      native: 'Love needs freedom and meaning. You attract through wisdom and are drawn to foreign cultures and philosophies.',
      othersRespond: 'Others see you as adventurous in love, philosophically charming, or commitment-phobic.',
      childContext: 'This child loves learning about other cultures and may have expansive tastes.'
    },
    10: {
      native: 'Career benefits from charm. Public image is pleasant. You may work in beauty, art, or relationship-focused fields.',
      othersRespond: 'The public finds you charming. Your reputation benefits from Venusian qualities.',
      childContext: 'This child may be drawn to arts or public-facing activities. Charm helps them in social settings.'
    },
    11: {
      native: 'Friendships are pleasant and abundant. You bring harmony to groups. Social network is your pleasure.',
      othersRespond: 'Friends experience your warmth. Groups benefit from your harmonizing presence.',
      childContext: 'This child makes friends easily and enjoys group activities.'
    },
    12: {
      native: 'Love is secret or spiritual. You may have hidden relationships or find love through solitude and transcendence.',
      othersRespond: 'Others may not see your love nature — it operates in private. You may seem mysteriously romantic.',
      childContext: 'This child may have secret crushes or express love in private, hidden ways.'
    }
  }
};

// Transit effects by house
export const TRANSIT_HOUSE_EFFECTS: Record<number, {
  general: string;
  bodyEffects?: string;
  commonExperiences: string[];
}> = {
  1: {
    general: 'Transits to the 1st house affect your identity, appearance, and vitality directly. New beginnings and personal reinvention happen here.',
    bodyEffects: 'Physical body changes — weight fluctuation, new style, injuries to head/face, changes in vitality and energy levels. Venus transits enhance appearance; Saturn can cause weight gain, skin issues, or a more serious demeanor; Mars can bring head injuries or increased physical energy.',
    commonExperiences: [
      'New image or style changes',
      'Taking initiative on personal projects',
      'Changes in physical health or appearance',
      'Being more visible or noticed',
      'Starting new phases in life'
    ]
  },
  2: {
    general: 'Transits to the 2nd house affect money, possessions, and self-worth. Financial shifts and value clarification happen here.',
    commonExperiences: [
      'Income changes — more or less',
      'Major purchases or sales',
      'Self-worth crises or boosts',
      'Clarifying what you truly value',
      'Talent development'
    ]
  },
  3: {
    general: 'Transits to the 3rd house affect communication, learning, and local environment. Mental activity and sibling matters activate.',
    commonExperiences: [
      'Important communications or contracts',
      'Learning new skills or taking courses',
      'Changes in sibling relationships',
      'Local travel or moves',
      'Changes in daily routine and neighborhood'
    ]
  },
  4: {
    general: 'Transits to the 4th house affect home, family, and emotional foundations. Domestic changes and family matters arise.',
    commonExperiences: [
      'Moving homes or renovating',
      'Family gatherings or conflicts',
      'Dealing with parents',
      'Emotional processing and therapy',
      'Ancestry and roots exploration'
    ]
  },
  5: {
    general: 'Transits to the 5th house affect creativity, romance, and children. Self-expression and pleasure themes activate.',
    commonExperiences: [
      'New romances or dating',
      'Creative projects and inspiration',
      'Children-related events',
      'Hobbies and leisure activities',
      'Needing more joy and play'
    ]
  },
  6: {
    general: 'Transits to the 6th house affect work, health, and daily routines. Service and maintenance themes activate.',
    commonExperiences: [
      'Job changes or new work responsibilities',
      'Health issues requiring attention',
      'New routines or habits',
      'Issues with co-workers or employees',
      'Pet-related events'
    ]
  },
  7: {
    general: 'Transits to the 7th house affect partnerships and one-on-one relationships. Relationship events and changes occur.',
    commonExperiences: [
      'Marriage or commitment',
      'Relationship challenges or breakups',
      'Business partnerships',
      'Legal matters and contracts',
      'Meeting significant people'
    ]
  },
  8: {
    general: 'Transits to the 8th house affect shared resources, intimacy, and transformation. Deep change and crisis potential.',
    commonExperiences: [
      'Inheritances or debts',
      'Intimate relationship deepening',
      'Psychological transformation',
      'Dealing with death or endings',
      'Tax and insurance matters'
    ]
  },
  9: {
    general: 'Transits to the 9th house affect beliefs, travel, and higher learning. Expansion and meaning-seeking activate.',
    commonExperiences: [
      'Long-distance travel',
      'Higher education or teaching',
      'Belief system changes',
      'Legal matters',
      'Publishing or broadcasting'
    ]
  },
  10: {
    general: 'Transits to the 10th house affect career, reputation, and public life. Professional events and achievement themes.',
    commonExperiences: [
      'Career changes or advancement',
      'Public recognition or criticism',
      'Dealing with authorities',
      'Life direction clarification',
      'Reputation events'
    ]
  },
  11: {
    general: 'Transits to the 11th house affect friends, groups, and future visions. Social and collective themes activate.',
    commonExperiences: [
      'New friendships or group memberships',
      'Achieving goals and dreams',
      'Involvement in causes',
      'Technology changes',
      'Social network shifts'
    ]
  },
  12: {
    general: 'Transits to the 12th house affect the unconscious, solitude, and spiritual life. Hidden matters and endings occur.',
    commonExperiences: [
      'Need for retreat and solitude',
      'Unconscious patterns emerging',
      'Spiritual experiences',
      'Hospital or institution involvement',
      'Endings and letting go'
    ]
  }
};

// Helper function to get age-appropriate house interpretation
export function getHouseInterpretationForAge(house: number, age: number): string {
  const interpretation = DEEP_HOUSE_INTERPRETATIONS[house];
  if (!interpretation) return '';
  
  if (age < 12) return interpretation.lifeStages.child;
  if (age < 21) return interpretation.lifeStages.adolescent;
  if (age < 30) return interpretation.lifeStages.youngAdult;
  if (age < 50) return interpretation.lifeStages.adult;
  return interpretation.lifeStages.elder;
}

// Get Saturn return context
export function getSaturnReturnContext(age: number): { phase: string; description: string } | null {
  if (age >= 27 && age <= 31) {
    return {
      phase: 'First Saturn Return',
      description: 'This is your initiation into true adulthood. Saturn asks: "What structures are you building? What childhood dreams must die for adult reality to emerge?" Houses with Saturn natally and by transit are under pressure to mature.'
    };
  }
  if (age >= 56 && age <= 60) {
    return {
      phase: 'Second Saturn Return',
      description: 'This is your initiation into elderhood. Saturn asks: "What is your legacy? What wisdom have you earned? What must be released for the final chapter?" Houses with Saturn are releasing what no longer serves.'
    };
  }
  if (age >= 84 && age <= 88) {
    return {
      phase: 'Third Saturn Return',
      description: 'This is rare and represents culmination of all life lessons. Saturn asks: "What was it all for? What remains?" Full integration of Saturn\'s teachings.'
    };
  }
  return null;
}
