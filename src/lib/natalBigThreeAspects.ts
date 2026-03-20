// Natal Aspects to Sun, Moon, and Rising (Ascendant)
// Detects and interprets how other planets aspect the Big Three

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getEffectiveOrb } from './aspectOrbs';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export interface BigThreeAspect {
  planet: string;           // The planet making the aspect
  planetSymbol: string;     // Symbol of aspecting planet
  target: 'Sun' | 'Moon' | 'Ascendant';
  targetSymbol: string;
  aspectType: string;       // conjunction, trine, square, etc.
  aspectSymbol: string;
  orb: number;              // How close the aspect is
  isApplying: boolean;      // For progressed/natal context
  feeling: string;          // How this aspect FEELS to the native
  manifestation: string;    // How it shows up in life
  clientDescription: string; // What to tell the client
}

// Planet symbols map
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  NorthNode: '☊',
  SouthNode: '☋',
  Chiron: '⚷',
  Lilith: '⚸',
  Ceres: '⚳',
  Pallas: '⚴',
  Juno: '⚵',
  Vesta: '⚶',
  Eris: '⯰',
  Sedna: '⯲',
  Ascendant: 'ASC',
};

// Aspect definitions with orbs
const ASPECTS = [
  { name: 'conjunction', symbol: '☌', angle: 0, nature: 'fusion' },
  { name: 'opposition', symbol: '☍', angle: 180, nature: 'tension' },
  { name: 'trine', symbol: '△', angle: 120, nature: 'flow' },
  { name: 'square', symbol: '□', angle: 90, nature: 'tension' },
  { name: 'sextile', symbol: '⚹', angle: 60, nature: 'opportunity' },
  { name: 'quincunx', symbol: '⚻', angle: 150, nature: 'adjustment' },
];

// Get absolute longitude from position
const getAbsoluteDegree = (pos: NatalPlanetPosition): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(pos.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + pos.degree + (pos.minutes || 0) / 60;
};

// Get absolute degree from house cusp
const getHouseCuspDegree = (cusp: { sign: string; degree: number; minutes?: number }): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + cusp.degree + (cusp.minutes || 0) / 60;
};

// Calculate orb between two positions
const calculateOrb = (deg1: number, deg2: number, aspectAngle: number): number => {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  return Math.abs(diff - aspectAngle);
};

// ============ DEEP INTERPRETATIONS ============

interface AspectInterpretation {
  feeling: string;
  manifestation: string;
  clientDescription: string;
}

// Sun aspect interpretations - how it feels to have planets aspecting your Sun
const SUN_ASPECT_INTERPRETATIONS: Record<string, Record<string, AspectInterpretation>> = {
  Moon: {
    conjunction: {
      feeling: 'Your emotions and identity are fused—what you feel IS who you are. There\'s no separation between your inner emotional world and your outer expression.',
      manifestation: 'You respond to life instinctively. Emotions immediately become actions. Others experience you as authentic and immediate.',
      clientDescription: 'Your Sun and Moon are together, meaning your conscious will and unconscious needs are aligned. You\'re emotionally present in everything you do—for better or worse, you can\'t hide how you feel.',
    },
    opposition: {
      feeling: 'There\'s a pull between what you WANT to be and what you NEED emotionally. You may feel torn between your identity and your comfort zone.',
      manifestation: 'Relationships often mirror this internal split. You might attract partners who embody your emotional nature while you play out your Sun.',
      clientDescription: 'Your Sun and Moon are opposite, creating an internal tug-of-war between who you\'re becoming and where you\'re comfortable. Integrating these is your life\'s work.',
    },
    trine: {
      feeling: 'Ease between your will and your feelings. What you want and what you need flow together naturally.',
      manifestation: 'Things tend to work out. Your instincts support your goals. Emotional self-trust comes naturally.',
      clientDescription: 'Your Sun and Moon support each other beautifully. What you want and what you need are aligned, giving you an inner harmony many people envy.',
    },
    square: {
      feeling: 'Friction between who you\'re trying to be and what you emotionally need. Inner tension drives growth but creates stress.',
      manifestation: 'You may sabotage success because it doesn\'t feel safe, or sacrifice emotional needs for achievement. Crisis forces integration.',
      clientDescription: 'Your Sun and Moon are in tension. What you want and what you need don\'t naturally align—you have to consciously work to honor both.',
    },
    sextile: {
      feeling: 'Gentle support between conscious and unconscious. Opportunities to align will and feeling arise naturally.',
      manifestation: 'Emotional intelligence supports your goals when you make the effort to connect them.',
      clientDescription: 'Your Sun and Moon have an easy connection that you can activate with intention. Aligning your goals with your feelings comes naturally when you try.',
    },
  },
  Mercury: {
    conjunction: {
      feeling: 'Your mind and identity are inseparable. You think your way into being—communication IS self-expression.',
      manifestation: 'You may be perceived as intellectual, witty, or constantly processing. Your voice is your identity.',
      clientDescription: 'Your mind and identity are fused. You process yourself through thinking and talking. Be careful not to over-identify with your thoughts.',
    },
    square: {
      feeling: 'Your mind can work against your self-expression. You may overthink or have trouble communicating who you really are.',
      manifestation: 'May speak before thinking, or think so much you can\'t speak. Communication style may conflict with how you want to be seen.',
      clientDescription: 'There\'s friction between your thoughts and your identity. Learning to bridge this creates powerful self-awareness.',
    },
  },
  Venus: {
    conjunction: {
      feeling: 'Your identity is wrapped up in love, beauty, and harmony. You NEED to be liked. Aesthetics and relationship are core to who you are.',
      manifestation: 'Naturally charming, artistic, or relationship-focused. May struggle with people-pleasing or valuing yourself only through others.',
      clientDescription: 'Venus on your Sun makes love and beauty central to your identity. You shine when you\'re creating beauty or being loved. Just make sure you also love yourself.',
    },
    opposition: {
      feeling: 'You may project your need for love onto others, or struggle to integrate pleasure with purpose.',
      manifestation: 'Relationships can eclipse identity. You may attract partners who embody the pleasure or ease you deny yourself.',
      clientDescription: 'Your sense of self and your relationship needs can feel at odds. Finding yourself WITHIN relationship is your growth edge.',
    },
    trine: {
      feeling: 'Ease, grace, and natural charm. Beauty and harmony flow through your self-expression.',
      manifestation: 'Artistic gifts, social ease, and romantic luck. Things may come too easily—conscious effort deepens these gifts.',
      clientDescription: 'Venus flows beautifully with your Sun—you have natural charm, artistic sensibility, and ease in relationships.',
    },
    square: {
      feeling: 'Tension between self-assertion and the need for harmony. You may give yourself away for love or struggle to value yourself.',
      manifestation: 'Relationship challenges that force you to clarify values. May vacillate between too much independence and too much accommodation.',
      clientDescription: 'There\'s creative tension between your identity and your relationships. You\'re learning to hold onto yourself while connecting with others.',
    },
  },
  Mars: {
    conjunction: {
      feeling: 'Your identity IS action. Competitive, assertive, driven—you are what you DO. Resting feels like death.',
      manifestation: 'High energy, quick temper, natural leadership. May be accident-prone or aggressive without realizing it.',
      clientDescription: 'Mars on your Sun gives you tremendous drive and energy. You\'re here to ACT. Just watch the temper and make sure your actions match your true self.',
    },
    opposition: {
      feeling: 'You may attract or project aggression. Others seem to fight with you, or you fight against yourself.',
      manifestation: 'Conflict in relationships teaches you about your own anger. Learning to assert directly is the work.',
      clientDescription: 'Mars opposite your Sun means you often meet yourself through conflict with others. Owning your own aggression is the path to integration.',
    },
    trine: {
      feeling: 'Natural confidence and easy energy. You assert yourself without starting wars.',
      manifestation: 'Physical vitality, courage, ability to go after what you want without burning bridges.',
      clientDescription: 'Mars supports your Sun beautifully—you have healthy confidence and natural ability to pursue your goals.',
    },
    square: {
      feeling: 'Inner warrior is at odds with your identity. You may fight yourself or feel like your drives sabotage your goals.',
      manifestation: 'Conflict, impulsive actions, anger issues that require conscious work. Great energy once mastered.',
      clientDescription: 'Mars squares your Sun, creating internal friction. You have powerful drive but it can work against you until you learn to channel it consciously.',
    },
  },
  Jupiter: {
    conjunction: {
      feeling: 'Your identity is expansive, optimistic, and meaning-seeking. You may feel larger than life or entitled to more.',
      manifestation: 'Luck, opportunity, and natural confidence. Can be excessive or overconfident.',
      clientDescription: 'Jupiter on your Sun gives you an expanded sense of self and natural optimism. You attract opportunity—just watch for overreaching.',
    },
    trine: {
      feeling: 'Ease and good fortune flow through your self-expression. Faith and optimism come naturally.',
      manifestation: 'Things tend to work out. Natural wisdom and luck support your goals.',
      clientDescription: 'Jupiter blesses your Sun with ease, faith, and natural abundance. Trust this gift while continuing to grow.',
    },
    square: {
      feeling: 'Tension between who you are and what you believe. Faith may be tested. Tendency to overreach or under-believe.',
      manifestation: 'Growth through challenge. May swing between inflation and doubt. Life lessons expand consciousness.',
      clientDescription: 'Jupiter squares your Sun—you\'re learning about faith, meaning, and right-sized confidence through life\'s challenges.',
    },
  },
  Saturn: {
    conjunction: {
      feeling: 'Your identity is shaped by responsibility, limitation, and hard work. You may feel old before your time or burdened by expectations.',
      manifestation: 'Serious, disciplined, potentially fearful or self-limiting. Authority issues with father or authority figures.',
      clientDescription: 'Saturn on your Sun means you were born with a sense of responsibility. Life may have felt heavy early on, but you\'re building lasting structures through discipline.',
    },
    opposition: {
      feeling: 'You may feel opposed by authority or responsible for everyone else. The world seems to demand too much.',
      manifestation: 'Relationship to authority figures is key. Learning to be your own authority is the work.',
      clientDescription: 'Saturn opposite your Sun creates pressure from external expectations. Your work is to internalize authority and become your own boss.',
    },
    trine: {
      feeling: 'Discipline and structure support your identity naturally. Hard work feels satisfying.',
      manifestation: 'Practical wisdom, earned respect, ability to build lasting things with patience.',
      clientDescription: 'Saturn supports your Sun with natural discipline and patience. You build things that last because you know how to work steadily.',
    },
    square: {
      feeling: 'Heavy pressure between who you are and what\'s expected. You may feel inadequate or over-responsible.',
      manifestation: 'Father/authority issues, depression, sense of never being good enough. Eventually builds tremendous strength.',
      clientDescription: 'Saturn squares your Sun—you\'ve faced serious pressure to prove yourself. This is hard but builds character no one can take from you.',
    },
  },
  Uranus: {
    conjunction: {
      feeling: 'Your identity is unconventional, rebellious, electric. You\'re not like others and you know it.',
      manifestation: 'Need for freedom and originality. May be disruptive, genius, or both. Unpredictable life path.',
      clientDescription: 'Uranus on your Sun makes you an original—there\'s no one quite like you. You\'re here to break molds, not fit them.',
    },
    opposition: {
      feeling: 'Others may seem to disrupt your life, or you project your need for freedom onto them.',
      manifestation: 'Sudden relationship changes, attraction to unconventional partners, learning freedom through others.',
      clientDescription: 'Uranus opposite your Sun brings sudden changes through others. Your freedom lessons come through relationship.',
    },
    square: {
      feeling: 'Rebellious energy conflicts with your established identity. You may fight yourself or resist your own need for change.',
      manifestation: 'Life disruptions, sudden changes, learning to embrace your own uniqueness through crisis.',
      clientDescription: 'Uranus squares your Sun—life regularly disrupts your plans. You\'re learning to embrace change and your own unique genius.',
    },
  },
  Neptune: {
    conjunction: {
      feeling: 'Your identity is permeable, dreamy, artistic, or spiritually oriented. Hard to pin down who you "really" are.',
      manifestation: 'Creative and spiritual gifts, but potential for confusion, escapism, or victim/savior dynamics.',
      clientDescription: 'Neptune on your Sun makes you highly intuitive and artistic, but your identity can feel unclear. You\'re learning to be spiritual AND grounded.',
    },
    opposition: {
      feeling: 'You may project idealization onto others or feel confused about where you end and they begin.',
      manifestation: 'Relationship idealization/disillusionment. Learning to see yourself and others clearly.',
      clientDescription: 'Neptune opposite your Sun brings confusion through relationships. Seeing others—and yourself—clearly is your work.',
    },
    square: {
      feeling: 'Creative/spiritual sensitivity conflicts with your sense of self. You may feel lost or sacrifice yourself for ideals.',
      manifestation: 'Disillusionment, confusion, but also deep creativity and compassion. Learning to hold a self while remaining open.',
      clientDescription: 'Neptune squares your Sun—you may struggle with clarity about who you are. Grounding your spirituality and creativity is the path.',
    },
  },
  Pluto: {
    conjunction: {
      feeling: 'Your identity is intense, powerful, and transformative. You\'ve been to hell and back, probably more than once.',
      manifestation: 'Personal power, psychological depth, control issues. Death/rebirth cycles in identity.',
      clientDescription: 'Pluto on your Sun gives you incredible depth and intensity. You transform through crisis and have power others can sense.',
    },
    opposition: {
      feeling: 'Power struggles with others reveal your own need for control. You may attract intense, controlling people.',
      manifestation: 'Relationship power dynamics. Learning to own your own power by seeing it in others.',
      clientDescription: 'Pluto opposite your Sun brings power lessons through others. Owning your own intensity stops the projection.',
    },
    square: {
      feeling: 'Your drive for power conflicts with your conscious identity. You may fear your own intensity.',
      manifestation: 'Crisis, power struggles, obsessive patterns. Incredible transformation once you embrace your own depth.',
      clientDescription: 'Pluto squares your Sun—you\'ve faced power struggles and crisis. Embracing your own intensity is the path to freedom.',
    },
  },
  Chiron: {
    conjunction: {
      feeling: 'Your identity is marked by a wound—but this wound becomes your gift. You heal through being who you are.',
      manifestation: 'May feel fundamentally "broken" but becomes a powerful healer by simply being authentic.',
      clientDescription: 'Chiron on your Sun means your wound is visible and central to who you are. By accepting it, you become a healer for others with similar pain.',
    },
    square: {
      feeling: 'Your wound conflicts with your sense of self. You may hide your pain or feel it undermines your identity.',
      manifestation: 'Healing crisis, confronting the wound through life circumstances. Growth through acceptance.',
      clientDescription: 'Chiron squares your Sun—your wound and identity are in tension. Integrating your pain into who you are brings healing.',
    },
  },
  NorthNode: {
    conjunction: {
      feeling: 'Your identity IS your soul\'s purpose. Being yourself is the destiny.',
      manifestation: 'Life path involves becoming more fully who you already are. Following authentic self-expression.',
      clientDescription: 'The North Node on your Sun means your soul\'s purpose is to BE YOURSELF fully. Following your heart IS the path.',
    },
  },
};

// Moon aspect interpretations - how it feels to have planets aspecting your Moon
const MOON_ASPECT_INTERPRETATIONS: Record<string, Record<string, AspectInterpretation>> = {
  Mercury: {
    conjunction: {
      feeling: 'Your thoughts and feelings are one—you think emotionally and feel thoughtfully. Mind and heart are fused.',
      manifestation: 'Natural emotional intelligence, but may over-rationalize feelings or become emotionally attached to ideas.',
      clientDescription: 'Mercury and Moon together means you process emotions through thought and express thoughts emotionally. You\'re naturally intuitive.',
    },
    square: {
      feeling: 'Your mind and emotions don\'t naturally agree. You may rationalize away feelings or feelings may overwhelm logic.',
      manifestation: 'Anxiety, difficulty expressing emotions clearly, or difficulty thinking clearly when upset.',
      clientDescription: 'There\'s friction between your thoughts and feelings. Learning to honor both—not let one override the other—is your work.',
    },
  },
  Venus: {
    conjunction: {
      feeling: 'Emotional needs and love/pleasure are fused. You feel loved when comfortable, and comfort when loved.',
      manifestation: 'Naturally warm, nurturing, aesthetically sensitive. May confuse love with comfort.',
      clientDescription: 'Venus and Moon together give you a deeply loving, gentle emotional nature. Beauty and comfort nurture you.',
    },
    square: {
      feeling: 'What you need emotionally and what you want in love may conflict. Love can feel unsafe.',
      manifestation: 'Relationship patterns that recreate unmet needs. Learning to have both safety and pleasure.',
      clientDescription: 'There\'s tension between your emotional needs and your desire for love and pleasure. You\'re learning they can coexist.',
    },
  },
  Mars: {
    conjunction: {
      feeling: 'Emotions ARE actions. You respond immediately and instinctively. Strong passions.',
      manifestation: 'Quick temper, passionate reactions, courage. May need to slow down before responding.',
      clientDescription: 'Mars on your Moon means your emotions are fierce and immediate. You feel strongly and act on those feelings—learning pause is helpful.',
    },
    opposition: {
      feeling: 'You may attract aggression or conflict when you\'re emotionally vulnerable. Others seem to attack when you\'re soft.',
      manifestation: 'Relationship conflict around emotional needs. Learning to protect yourself without closing down.',
      clientDescription: 'Mars opposite your Moon brings conflict around vulnerability. Learning to be both soft and strong is the work.',
    },
    square: {
      feeling: 'Your need for safety conflicts with your need for action. Emotions may drive impulsive behavior.',
      manifestation: 'Anger issues, emotional volatility, self-sabotage when stressed. Great passion once channeled.',
      clientDescription: 'Mars squares your Moon—strong emotions drive you but can create problems. Channeling that passion consciously brings power.',
    },
  },
  Jupiter: {
    conjunction: {
      feeling: 'Emotional nature is expansive, generous, and optimistic. Big feelings, big needs.',
      manifestation: 'Emotional abundance, but may over-give or expect too much. Natural generosity.',
      clientDescription: 'Jupiter on your Moon gives you a big, generous heart. You feel things deeply and expansively—just watch for emotional excess.',
    },
    trine: {
      feeling: 'Faith and emotional security flow together. You trust that things will work out.',
      manifestation: 'Emotional resilience, natural optimism, ability to bounce back from difficulty.',
      clientDescription: 'Jupiter supports your Moon beautifully—you have natural emotional faith and resilience.',
    },
  },
  Saturn: {
    conjunction: {
      feeling: 'Emotional nature is controlled, serious, perhaps depressed. You may have learned early that feelings weren\'t safe.',
      manifestation: 'Emotional maturity but also emotional restriction. May need permission to feel. Mother/caretaker issues.',
      clientDescription: 'Saturn on your Moon means you learned to control your emotions early. You\'re emotionally mature but may need to unclench.',
    },
    opposition: {
      feeling: 'You may feel responsible for others\' emotions or controlled by external demands on your feelings.',
      manifestation: 'Emotional boundaries in relationship. Learning to feel without taking responsibility for everyone.',
      clientDescription: 'Saturn opposite your Moon brings pressure around emotional caretaking. Learning to feel for yourself, not everyone else.',
    },
    square: {
      feeling: 'Emotional needs conflict with duty/responsibility. You may suppress feelings to function, or feel guilty for having needs.',
      manifestation: 'Depression, emotional restriction, difficulty asking for nurturing. Builds emotional strength over time.',
      clientDescription: 'Saturn squares your Moon—your emotional needs and your sense of duty don\'t naturally align. Learning to honor both is the work.',
    },
  },
  Uranus: {
    conjunction: {
      feeling: 'Emotional nature is unusual, detached, or electric. You may feel emotions differently than others.',
      manifestation: 'Need for emotional freedom, unusual home life, sudden emotional changes. Mother may have been unconventional.',
      clientDescription: 'Uranus on your Moon gives you an unusual emotional nature. You need freedom in how you feel and relate. Convention doesn\'t work for you.',
    },
    square: {
      feeling: 'Need for security conflicts with need for freedom. You may bolt when things get too close.',
      manifestation: 'Sudden emotional changes, anxiety, relationship instability. Learning to have both security and freedom.',
      clientDescription: 'Uranus squares your Moon—you want both safety and freedom but they seem to fight. You\'re learning they can coexist.',
    },
  },
  Neptune: {
    conjunction: {
      feeling: 'Emotional body is extremely porous, sensitive, and intuitive. You absorb others\' feelings as your own.',
      manifestation: 'Psychic sensitivity, artistic gifts, but difficulty with boundaries. May escape through substances or fantasy.',
      clientDescription: 'Neptune on your Moon makes you deeply intuitive but also extremely sensitive. Learning to shield and ground is essential.',
    },
    square: {
      feeling: 'Confusion about what you actually feel. You may idealize nurturing figures or escape emotions through fantasy.',
      manifestation: 'Emotional confusion, escapism, but also deep compassion and artistic sensitivity.',
      clientDescription: 'Neptune squares your Moon—you may struggle to know what you actually feel vs. what you absorb. Grounding practices help.',
    },
  },
  Pluto: {
    conjunction: {
      feeling: 'Emotional nature is intense, volcanic, and transformative. You feel EVERYTHING deeply.',
      manifestation: 'Powerful emotions, control issues around feelings, deep psychological insight. Mother may have been intense or controlling.',
      clientDescription: 'Pluto on your Moon gives you incredibly intense emotions. You transform through emotional crisis. Your feelings are powerful—own them.',
    },
    opposition: {
      feeling: 'Others may try to control you emotionally, or you may project your intensity onto them.',
      manifestation: 'Power struggles in intimate relationships. Learning to own your own emotional power.',
      clientDescription: 'Pluto opposite your Moon brings power dynamics into your emotional life. Owning your own intensity stops the projection.',
    },
    square: {
      feeling: 'Deep emotions conflict with your sense of safety. You may fear your own intensity.',
      manifestation: 'Emotional crisis, power struggles with mother/family, obsessive patterns. Great depth once integrated.',
      clientDescription: 'Pluto squares your Moon—your emotions are powerful but may feel threatening. Embracing your own depth brings freedom.',
    },
  },
  Chiron: {
    conjunction: {
      feeling: 'Your emotional nature carries a wound—but this sensitivity becomes healing power.',
      manifestation: 'May feel emotionally wounded but becomes a healer for others through empathy.',
      clientDescription: 'Chiron on your Moon means your emotional wound is deep. By accepting it, you become a powerful emotional healer for others.',
    },
  },
};

// Ascendant aspect interpretations
const ASC_ASPECT_INTERPRETATIONS: Record<string, Record<string, AspectInterpretation>> = {
  Sun: {
    conjunction: {
      feeling: 'Your identity and your appearance/approach are aligned. What you see is what you get.',
      manifestation: 'Strong personal presence. Others see your Sun clearly. You may dominate your environment.',
      clientDescription: 'Sun on your Ascendant means your true self and your outer presentation are aligned. You radiate your Sun sign openly.',
    },
  },
  Moon: {
    conjunction: {
      feeling: 'Your emotions show on your face. You appear nurturing, moody, or maternal to others.',
      manifestation: 'Emotional expressiveness visible to all. May attract those who want mothering.',
      clientDescription: 'Moon on your Ascendant means your emotions are visible to everyone. You appear sensitive, nurturing, or moody depending on how you feel.',
    },
  },
  Mercury: {
    conjunction: {
      feeling: 'You appear intelligent, communicative, youthful. Your mind leads your presence.',
      manifestation: 'Quick movements, talkative first impression, intellectual approach to the world.',
      clientDescription: 'Mercury on your Ascendant makes you appear quick, clever, and communicative. You meet the world with your mind first.',
    },
  },
  Venus: {
    conjunction: {
      feeling: 'You appear attractive, charming, and pleasant. Beauty and grace are visible.',
      manifestation: 'Natural beauty or charm, attractive to others, pleasing demeanor.',
      clientDescription: 'Venus on your Ascendant gives you natural charm and attractiveness. Others find you pleasing and may seek your company.',
    },
  },
  Mars: {
    conjunction: {
      feeling: 'You appear bold, aggressive, or athletic. Your energy is immediately visible.',
      manifestation: 'Strong physical presence, quick reactions, may seem confrontational or dynamic.',
      clientDescription: 'Mars on your Ascendant gives you a strong, active presence. You appear assertive and others may feel your energy immediately.',
    },
  },
  Jupiter: {
    conjunction: {
      feeling: 'You appear expansive, optimistic, and larger than life. Natural confidence radiates.',
      manifestation: 'May gain weight easily but also attracts luck. Appears philosophical or jovial.',
      clientDescription: 'Jupiter on your Ascendant makes you appear optimistic and expansive. You radiate faith and may seem lucky to others.',
    },
  },
  Saturn: {
    conjunction: {
      feeling: 'You appear serious, mature, or reserved. A weight or responsibility is visible.',
      manifestation: 'May look older than you are, serious demeanor, respected but perhaps unapproachable.',
      clientDescription: 'Saturn on your Ascendant gives you a serious, mature appearance. You may seem reserved but earn respect through your presence.',
    },
  },
  Uranus: {
    conjunction: {
      feeling: 'You appear unusual, eccentric, or electric. Something about you is different.',
      manifestation: 'Unconventional appearance or manner, unpredictable first impression, independence visible.',
      clientDescription: 'Uranus on your Ascendant makes you appear unique and unconventional. Others immediately sense you\'re different.',
    },
  },
  Neptune: {
    conjunction: {
      feeling: 'You appear dreamy, mystical, or hard to pin down. Others may project onto you.',
      manifestation: 'Chameleon-like quality, may seem glamorous or confusing. Psychic presence visible.',
      clientDescription: 'Neptune on your Ascendant gives you a mystical, dreamy quality. Others may project their fantasies onto you.',
    },
  },
  Pluto: {
    conjunction: {
      feeling: 'You appear intense, powerful, and magnetic. Others sense your depth immediately.',
      manifestation: 'Penetrating gaze, powerful presence, may intimidate or attract intensely.',
      clientDescription: 'Pluto on your Ascendant gives you an intense, magnetic presence. Others sense your power and depth immediately.',
    },
  },
};

// Main function to detect aspects to Big Three
export const detectBigThreeAspects = (chart: NatalChart): BigThreeAspect[] => {
  const aspects: BigThreeAspect[] = [];
  
  const sun = chart.planets.Sun;
  const moon = chart.planets.Moon;
  
  // Get Ascendant position
  let ascPos: NatalPlanetPosition | null = null;
  if (chart.houseCusps?.house1) {
    ascPos = {
      sign: chart.houseCusps.house1.sign,
      degree: chart.houseCusps.house1.degree,
      minutes: chart.houseCusps.house1.minutes || 0,
      seconds: 0,
    };
  } else if (chart.planets.Ascendant) {
    ascPos = chart.planets.Ascendant;
  }
  
  // Planets to check (excluding the Big Three themselves)
  const planetsToCheck = [
    'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode'
  ];
  
  // Also check Moon-Sun aspects
  if (sun && moon) {
    const sunDeg = getAbsoluteDegree(sun);
    const moonDeg = getAbsoluteDegree(moon);
    
    for (const aspectDef of ASPECTS) {
      const orb = calculateOrb(sunDeg, moonDeg, aspectDef.angle);
      if (orb <= getEffectiveOrb('Sun', 'Moon', aspectDef.name)) {
        const interp = SUN_ASPECT_INTERPRETATIONS['Moon']?.[aspectDef.name];
        if (interp) {
          aspects.push({
            planet: 'Moon',
            planetSymbol: '☽',
            target: 'Sun',
            targetSymbol: '☉',
            aspectType: aspectDef.name,
            aspectSymbol: aspectDef.symbol,
            orb: Math.round(orb * 100) / 100,
            isApplying: false,
            ...interp,
          });
        }
      }
    }
  }
  
  // Check aspects to Sun
  if (sun) {
    const sunDeg = getAbsoluteDegree(sun);
    
    for (const planetName of planetsToCheck) {
      const planet = chart.planets[planetName as keyof typeof chart.planets];
      if (!planet) continue;
      
      const planetDeg = getAbsoluteDegree(planet);
      
      for (const aspectDef of ASPECTS) {
        const orb = calculateOrb(sunDeg, planetDeg, aspectDef.angle);
        if (orb <= getEffectiveOrb('Sun', planetName, aspectDef.name)) {
          const interp = SUN_ASPECT_INTERPRETATIONS[planetName]?.[aspectDef.name];
          if (interp) {
            aspects.push({
              planet: planetName,
              planetSymbol: PLANET_SYMBOLS[planetName] || '?',
              target: 'Sun',
              targetSymbol: '☉',
              aspectType: aspectDef.name,
              aspectSymbol: aspectDef.symbol,
              orb: Math.round(orb * 100) / 100,
              isApplying: false,
              ...interp,
            });
          }
        }
      }
    }
  }
  
  // Check aspects to Moon
  if (moon) {
    const moonDeg = getAbsoluteDegree(moon);
    
    for (const planetName of planetsToCheck) {
      if (planetName === 'Moon') continue; // Skip self
      const planet = chart.planets[planetName as keyof typeof chart.planets];
      if (!planet) continue;
      
      const planetDeg = getAbsoluteDegree(planet);
      
      for (const aspectDef of ASPECTS) {
        const orb = calculateOrb(moonDeg, planetDeg, aspectDef.angle);
        if (orb <= aspectDef.orb) {
          const interp = MOON_ASPECT_INTERPRETATIONS[planetName]?.[aspectDef.name];
          if (interp) {
            aspects.push({
              planet: planetName,
              planetSymbol: PLANET_SYMBOLS[planetName] || '?',
              target: 'Moon',
              targetSymbol: '☽',
              aspectType: aspectDef.name,
              aspectSymbol: aspectDef.symbol,
              orb: Math.round(orb * 100) / 100,
              isApplying: false,
              ...interp,
            });
          }
        }
      }
    }
  }
  
  // Check aspects to Ascendant (only conjunctions for now)
  if (ascPos) {
    const ascDeg = getAbsoluteDegree(ascPos);
    
    // Include Sun and Moon for ASC aspects
    const allPlanets = ['Sun', 'Moon', ...planetsToCheck];
    
    for (const planetName of allPlanets) {
      const planet = chart.planets[planetName as keyof typeof chart.planets];
      if (!planet) continue;
      
      const planetDeg = getAbsoluteDegree(planet);
      
      // Only check conjunction to Ascendant for now (most impactful)
      const conjOrb = calculateOrb(ascDeg, planetDeg, 0);
      if (conjOrb <= 8) {
        const interp = ASC_ASPECT_INTERPRETATIONS[planetName]?.['conjunction'];
        if (interp) {
          aspects.push({
            planet: planetName,
            planetSymbol: PLANET_SYMBOLS[planetName] || '?',
            target: 'Ascendant',
            targetSymbol: 'ASC',
            aspectType: 'conjunction',
            aspectSymbol: '☌',
            orb: Math.round(conjOrb * 100) / 100,
            isApplying: false,
            ...interp,
          });
        }
      }
    }
  }
  
  // Sort by target (Sun first, then Moon, then Ascendant) then by orb
  const targetOrder = { Sun: 0, Moon: 1, Ascendant: 2 };
  return aspects.sort((a, b) => {
    const targetDiff = targetOrder[a.target] - targetOrder[b.target];
    if (targetDiff !== 0) return targetDiff;
    return a.orb - b.orb;
  });
};
