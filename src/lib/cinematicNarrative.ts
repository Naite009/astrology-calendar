// Cinematic Narrative - WHO/HOW/WHERE Framework
// Tells the story of planets as characters in your personal movie

import { ChartPlanet, DignityType, computeDignity } from './chartDecoderLogic';
import { SIGN_PROPERTIES, HOUSE_TYPES } from './planetDignities';

// ============================================================================
// CHARACTER ROLES (WHO - The Planet)
// ============================================================================

export interface CharacterRole {
  role: string;
  archetype: string;
  movieAnalogy: string;
  importance: 'lead' | 'supporting' | 'background' | 'special_guest';
}

export const PLANET_ROLES: Record<string, CharacterRole> = {
  Sun: {
    role: 'The Protagonist',
    archetype: 'The Hero on their journey—the main character whose growth IS the story.',
    movieAnalogy: 'Like the lead in a hero\'s journey film. Luke Skywalker, Frodo, Dorothy—the one whose transformation we\'re watching.',
    importance: 'lead'
  },
  Moon: {
    role: 'The Emotional Lead',
    archetype: 'The heart of the story—providing emotional depth, personal drama, and the internal world.',
    movieAnalogy: 'Like the emotional core of a film. The character whose feelings ground us in the story. The inner voice, the dream sequences, the memory flashbacks.',
    importance: 'lead'
  },
  Mercury: {
    role: 'The Narrator',
    archetype: 'The voice that tells the story—how thoughts become words, how the tale is communicated.',
    movieAnalogy: 'Like the narrator in a film, or the clever sidekick who explains things. The witty dialogue, the letters read aloud, the internal monologue.',
    importance: 'lead'
  },
  Venus: {
    role: 'The Love Interest / Art Director',
    archetype: 'What makes life beautiful and worth living—love, pleasure, aesthetics, and values.',
    movieAnalogy: 'Like the love interest AND the cinematographer combined. The romance subplot AND the visual beauty of the film.',
    importance: 'supporting'
  },
  Mars: {
    role: 'The Action Hero / Warrior',
    archetype: 'The drive, the fight scenes, the courage to act—where things get physical.',
    movieAnalogy: 'Like the action sequences in a film. The chase scenes, the battles, the moments of courage and conflict.',
    importance: 'supporting'
  },
  Jupiter: {
    role: 'The Mentor / Wise Guide',
    archetype: 'The figure who expands horizons, offers wisdom, and represents growth and meaning.',
    movieAnalogy: 'Like Gandalf, Obi-Wan, or Morpheus—the wise figure who shows the hero a larger world.',
    importance: 'supporting'
  },
  Saturn: {
    role: 'The Stern Teacher / Authority',
    archetype: 'The challenges that force growth—limitations, responsibilities, and hard-won mastery.',
    movieAnalogy: 'Like the demanding mentor, the difficult test, the obstacle that must be overcome. The training montage. The "dark night of the soul."',
    importance: 'supporting'
  },
  Uranus: {
    role: 'The Revolutionary / Wild Card',
    archetype: 'The unexpected twist—rebellion, innovation, sudden change, and authentic individuality.',
    movieAnalogy: 'Like the plot twist, the rebel character, the moment everything changes unexpectedly.',
    importance: 'background'
  },
  Neptune: {
    role: 'The Dreamer / Mystic',
    archetype: 'The transcendent—dreams, imagination, spirituality, and the blurred line between real and unreal.',
    movieAnalogy: 'Like the dream sequences, the magical realism, the moments of transcendence and mystery.',
    importance: 'background'
  },
  Pluto: {
    role: 'The Transformer / Shadow',
    archetype: 'The death and rebirth—power, intensity, what must be destroyed for new life to emerge.',
    movieAnalogy: 'Like the dark antagonist who transforms the hero, the journey to the underworld, the phoenix rising.',
    importance: 'background'
  },
  Chiron: {
    role: 'The Wounded Healer',
    archetype: 'The core wound that becomes wisdom—pain transformed into the ability to help others.',
    movieAnalogy: 'Like the backstory wound that drives the hero, the scar that becomes their greatest strength.',
    importance: 'special_guest'
  },
  NorthNode: {
    role: 'The Destiny Marker',
    archetype: 'Where the story is GOING—the growth direction, the soul\'s purpose, the unfamiliar path.',
    movieAnalogy: 'Like the destination the hero doesn\'t know they\'re heading toward—the end of the hero\'s journey.',
    importance: 'special_guest'
  },
  Ascendant: {
    role: 'The Costume / First Impression',
    archetype: 'How the character APPEARS on screen—the visual presentation, the first impression.',
    movieAnalogy: 'Like the character\'s costume, the way they walk into a scene, the immediate vibe they give.',
    importance: 'special_guest'
  },
  Midheaven: {
    role: 'The Public Role / Legacy',
    archetype: 'What the character is KNOWN for—their reputation, career, public contribution.',
    movieAnalogy: 'Like what the character will be remembered for at the end of the film—their lasting impact.',
    importance: 'special_guest'
  }
};

// ============================================================================
// COSTUME/ROLE (HOW - The Sign)
// ============================================================================

export const SIGN_COSTUMES: Record<string, {
  costume: string;
  energy: string;
  howTheyDoIt: string;
}> = {
  Aries: {
    costume: 'the warrior\'s armor, sword drawn',
    energy: 'bold, pioneering, impatient, direct',
    howTheyDoIt: 'by CHARGING forward, initiating, taking action first'
  },
  Taurus: {
    costume: 'the artisan\'s apron, hands in the earth',
    energy: 'steady, sensual, stubborn, grounded',
    howTheyDoIt: 'by BUILDING slowly, savoring each step, refusing to rush'
  },
  Gemini: {
    costume: 'the messenger\'s wings, notebook in hand',
    energy: 'curious, chatty, versatile, restless',
    howTheyDoIt: 'by COMMUNICATING, asking questions, making connections'
  },
  Cancer: {
    costume: 'the caretaker\'s shawl, protective shell',
    energy: 'nurturing, moody, protective, intuitive',
    howTheyDoIt: 'by FEELING deeply, protecting what matters, nurturing'
  },
  Leo: {
    costume: 'the royal regalia, spotlight-ready',
    energy: 'dramatic, warm, proud, creative',
    howTheyDoIt: 'by SHINING, expressing creatively, leading with heart'
  },
  Virgo: {
    costume: 'the healer\'s bag, attention to detail',
    energy: 'analytical, helpful, perfectionist, discerning',
    howTheyDoIt: 'by REFINING, improving, serving, paying attention to what others miss'
  },
  Libra: {
    costume: 'the diplomat\'s elegant attire, scales in hand',
    energy: 'charming, indecisive, harmonizing, aesthetic',
    howTheyDoIt: 'by BALANCING, seeking beauty and fairness, partnering'
  },
  Scorpio: {
    costume: 'the detective\'s dark coat, penetrating gaze',
    energy: 'intense, secretive, transformative, probing',
    howTheyDoIt: 'by INVESTIGATING, going deep, transforming what they touch'
  },
  Sagittarius: {
    costume: 'the explorer\'s travel gear, bow aimed at stars',
    energy: 'adventurous, philosophical, blunt, optimistic',
    howTheyDoIt: 'by EXPLORING, seeking meaning, shooting for the horizon'
  },
  Capricorn: {
    costume: 'the executive\'s tailored suit, climbing gear',
    energy: 'ambitious, disciplined, cautious, strategic',
    howTheyDoIt: 'by BUILDING for the long-term, earning authority, climbing steadily'
  },
  Aquarius: {
    costume: 'the innovator\'s eccentric outfit, future-focused',
    energy: 'unconventional, humanitarian, detached, visionary',
    howTheyDoIt: 'by INNOVATING, thinking differently, serving the collective'
  },
  Pisces: {
    costume: 'the mystic\'s flowing robes, dreamy gaze',
    energy: 'imaginative, compassionate, escapist, intuitive',
    howTheyDoIt: 'by DISSOLVING boundaries, dreaming, channeling the unseen'
  }
};

// ============================================================================
// STAGE/SETTING (WHERE - The House)
// ============================================================================

export const HOUSE_STAGES: Record<number, {
  stage: string;
  setting: string;
  volume: 'loud' | 'medium' | 'quiet';
  visibility: string;
}> = {
  1: {
    stage: 'Center Stage — The Mirror',
    setting: 'The opening scene where we first meet you. Your body, your presence, your immediate impact.',
    volume: 'loud',
    visibility: 'Maximum visibility. This character is FRONT AND CENTER whenever they appear.'
  },
  2: {
    stage: 'The Treasury / Resource Room',
    setting: 'The vault of resources—money, possessions, talents, self-worth.',
    volume: 'medium',
    visibility: 'Grounded visibility. This character shows up when resources are at stake.'
  },
  3: {
    stage: 'The Communication Hub',
    setting: 'The coffee shop, the classroom, the neighborhood. Short trips, siblings, daily conversation.',
    volume: 'medium',
    visibility: 'Busy visibility. This character is always talking, moving, connecting.'
  },
  4: {
    stage: 'The Private Home — Behind Closed Doors',
    setting: 'The family home, the roots, the private self. Where you come from; where you retreat to.',
    volume: 'quiet',
    visibility: 'Hidden visibility. This character works behind the scenes, in the private realm.'
  },
  5: {
    stage: 'The Creative Playground',
    setting: 'The stage, the romance, the playroom. Where joy, creativity, and self-expression live.',
    volume: 'loud',
    visibility: 'Dramatic visibility. This character performs, plays, and needs an audience.'
  },
  6: {
    stage: 'The Workshop — Daily Labor',
    setting: 'The office, the gym, the health clinic. Daily work, routines, service, health.',
    volume: 'medium',
    visibility: 'Practical visibility. This character shows up for work every day, quietly getting things done.'
  },
  7: {
    stage: 'The Partnership Arena',
    setting: 'The relationship, the negotiation, the one-on-one. Marriage, business partners, open enemies.',
    volume: 'loud',
    visibility: 'Mirrored visibility. This character appears through others—partners, rivals, projections.'
  },
  8: {
    stage: 'The Underworld — Deep Waters',
    setting: 'The therapist\'s couch, the bedroom, the inheritance. Shared resources, death, transformation.',
    volume: 'quiet',
    visibility: 'Buried visibility. This character operates in hidden places, in the shadows, in intimacy.'
  },
  9: {
    stage: 'The Temple / Far Horizon',
    setting: 'The university, the foreign land, the philosophy. Higher learning, travel, meaning.',
    volume: 'medium',
    visibility: 'Expansive visibility. This character appears when you travel, teach, or seek meaning.'
  },
  10: {
    stage: 'The World Stage — Peak Visibility',
    setting: 'The career, the public role, the reputation. What you\'re known for; your legacy.',
    volume: 'loud',
    visibility: 'Maximum public visibility. This character is ON THE RECORD, in the spotlight, making their mark.'
  },
  11: {
    stage: 'The Community Network',
    setting: 'The friend group, the organization, the future vision. Networks, hopes, collective belonging.',
    volume: 'medium',
    visibility: 'Collective visibility. This character appears in groups, movements, and shared visions.'
  },
  12: {
    stage: 'The Hidden Room — Behind the Veil',
    setting: 'The monastery, the hospital, the dream. Isolation, spirituality, the unconscious, hidden enemies.',
    volume: 'quiet',
    visibility: 'Invisible visibility. This character works BEHIND THE SCENES. You may not even know they\'re there. This is the director\'s booth, the dream world, the unconscious operating in silence.'
  }
};

// ============================================================================
// NARRATIVE GENERATION
// ============================================================================

export interface CharacterProfile {
  planet: ChartPlanet;
  who: {
    role: string;
    archetype: string;
    movieAnalogy: string;
    importance: 'lead' | 'supporting' | 'background' | 'special_guest';
  };
  how: {
    costume: string;
    energy: string;
    howTheyDoIt: string;
    sign: string;
  };
  where: {
    stage: string;
    setting: string;
    volume: 'loud' | 'medium' | 'quiet';
    visibility: string;
    house: number | null;
  };
  dignity: DignityType;
  dignityImpact: string;
  fullNarrative: string;
  shortSummary: string;
}

/**
 * Get dignity impact on character expression
 */
function getDignityImpact(planet: string, sign: string, dignity: DignityType): string {
  switch (dignity) {
    case 'rulership':
      return `${planet} is in their HOME SIGN—they wear this costume perfectly, no adjustments needed. This character operates at full power.`;
    case 'exaltation':
      return `${planet} is HONORED in this sign—they wear this costume like a gift. This character is elevated, idealized, operating at a high level.`;
    case 'detriment':
      return `${planet} is in their OPPOSITE sign—they\'re wearing an unfamiliar costume. This character can still perform well, but it requires conscious adaptation.`;
    case 'fall':
      return `${planet} is UNCOMFORTABLE in this sign—the costume doesn\'t quite fit. This character must work harder to express themselves, but mastery through effort is possible.`;
    case 'peregrine':
      return `${planet} is in NEUTRAL territory—the costume neither helps nor hinders. This character\'s power depends on their aspects and stage.`;
    default:
      return '';
  }
}

/**
 * Generate a complete character profile for a planet
 */
export function generateCharacterProfile(
  planet: ChartPlanet,
  useTraditional: boolean = true
): CharacterProfile {
  const role = PLANET_ROLES[planet.name] || {
    role: 'Supporting Character',
    archetype: 'A meaningful presence in the story',
    movieAnalogy: 'A character who contributes to the narrative',
    importance: 'supporting' as const
  };
  
  const costume = SIGN_COSTUMES[planet.sign] || {
    costume: 'their own unique attire',
    energy: 'distinctive',
    howTheyDoIt: 'in their own way'
  };
  
  const stage = planet.house ? HOUSE_STAGES[planet.house] : {
    stage: 'Various Settings',
    setting: 'Appearing throughout the story',
    volume: 'medium' as const,
    visibility: 'Variable presence'
  };
  
  const dignity = computeDignity(planet.name, planet.sign, useTraditional);
  const dignityImpact = getDignityImpact(planet.name, planet.sign, dignity);
  
  // Generate full narrative
  const volumeText = stage.volume === 'loud' 
    ? 'speaks with a LOUD voice—impossible to ignore'
    : stage.volume === 'quiet'
      ? 'speaks with a QUIET voice—you have to listen carefully'
      : 'speaks at a moderate volume—present but not overwhelming';
  
  const retrogradeNote = planet.retrograde 
    ? ` Because ${planet.name} is retrograde, this character processes internally before expressing outward—their energy is reflective, revisiting, and deeper than it appears on the surface.`
    : '';
  
  const fullNarrative = `In your story, **${planet.name}** is **${role.role}**—${role.archetype}

They show up wearing **${planet.sign}\'s costume** (${costume.costume}), which means they express ${costume.howTheyDoIt}.

Their stage is **${stage.stage}** (House ${planet.house || '?'})—${stage.setting}

On this stage, ${planet.name} ${volumeText}.

${dignityImpact}${retrogradeNote}`;

  const shortSummary = `${planet.name} is ${role.role} wearing ${planet.sign}'s costume, performing on the ${stage.stage} stage.`;

  return {
    planet,
    who: role,
    how: {
      ...costume,
      sign: planet.sign
    },
    where: {
      ...stage,
      house: planet.house
    },
    dignity,
    dignityImpact,
    fullNarrative,
    shortSummary
  };
}

/**
 * Generate the "Director's Notes" - practical guidance based on character insights
 */
export function generateDirectorsNotes(profiles: CharacterProfile[]): string[] {
  const notes: string[] = [];
  
  // Find the quiet characters (12th house, cadent houses)
  const quietCharacters = profiles.filter(p => 
    p.where.house && [3, 6, 9, 12].includes(p.where.house)
  );
  
  // Find the loud characters (angular houses)
  const loudCharacters = profiles.filter(p => 
    p.where.house && [1, 4, 7, 10].includes(p.where.house)
  );
  
  // Find characters in challenging costumes (detriment/fall)
  const challengedCharacters = profiles.filter(p => 
    p.dignity === 'detriment' || p.dignity === 'fall'
  );
  
  if (loudCharacters.length > 0) {
    const leadingLoud = loudCharacters.slice(0, 2);
    notes.push(`**Your Loudest Characters:** ${leadingLoud.map(p => p.planet.name).join(' and ')} are in angular houses—these energies are prominent and VISIBLE in your life. Lean into them.`);
  }
  
  if (quietCharacters.length > 0) {
    const mercury12 = profiles.find(p => p.planet.name === 'Mercury' && p.where.house === 12);
    if (mercury12) {
      notes.push(`**Your Narrator Speaks Quietly:** Mercury in the 12th means your inner voice is profound but harder for OTHERS to hear. Journaling, art, and meditative practices help you access your own narration.`);
    }
    
    const quietNames = quietCharacters.slice(0, 2).map(p => p.planet.name);
    if (!mercury12 || quietCharacters.length > 1) {
      notes.push(`**Behind-the-Scenes Players:** ${quietNames.join(' and ')} work in cadent houses—their gifts are subtler, expressed through refinement, service, or spiritual practice.`);
    }
  }
  
  if (challengedCharacters.length > 0) {
    notes.push(`**Characters Needing Costume Adjustments:** ${challengedCharacters.map(p => p.planet.name).join(', ')} are in challenging signs—they can still perform brilliantly, but require more conscious work.`);
  }
  
  // Add retrograde notes
  const retrogradeCharacters = profiles.filter(p => p.planet.retrograde);
  if (retrogradeCharacters.length > 0) {
    notes.push(`**Inward-Facing Characters:** ${retrogradeCharacters.map(p => p.planet.name).join(', ')} are retrograde—they process internally first. Honor their need for reflection before action.`);
  }
  
  return notes;
}
