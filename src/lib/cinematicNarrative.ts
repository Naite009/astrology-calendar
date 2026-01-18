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
    role: 'The Heart & Beauty Director',
    archetype: 'What makes life beautiful and worth living—love, pleasure, aesthetics, values, and attraction.',
    movieAnalogy: 'Like the love interest AND the cinematographer combined. The romance subplot AND the visual beauty of the film.',
    importance: 'supporting' // Note: Gets elevated to 'lead' when ruling Sun, Moon, or Ascendant
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
// SIGN EXPRESSION (HOW - The Sign)
// ============================================================================

export const SIGN_COSTUMES: Record<string, {
  costume: string;
  energy: string;
  howTheyDoIt: string;
}> = {
  Aries: {
    costume: 'an instinct to act before thinking',
    energy: 'bold, pioneering, impatient, direct',
    howTheyDoIt: 'by moving first, asking questions later, and trusting your impulses over deliberation'
  },
  Taurus: {
    costume: 'a need for stability before risk',
    energy: 'steady, sensual, stubborn, grounded',
    howTheyDoIt: 'by slowing down, trusting what you can touch, and refusing to be rushed by others\' timelines'
  },
  Gemini: {
    costume: 'a mind that needs constant input',
    energy: 'curious, adaptable, scattered, witty',
    howTheyDoIt: 'by asking questions, making connections between unrelated things, and staying mentally stimulated'
  },
  Cancer: {
    costume: 'an emotional radar scanning for safety',
    energy: 'protective, intuitive, moody, nurturing',
    howTheyDoIt: 'by reading the emotional temperature of every room before deciding how much of yourself to reveal'
  },
  Leo: {
    costume: 'a need to be seen and appreciated',
    energy: 'warm, dramatic, proud, generous',
    howTheyDoIt: 'by leading with your heart, creating from your center, and needing acknowledgment to feel real'
  },
  Virgo: {
    costume: 'an eye that catches what others miss',
    energy: 'analytical, helpful, anxious, discerning',
    howTheyDoIt: 'by improving, analyzing, and serving — sometimes to the point of self-erasure'
  },
  Libra: {
    costume: 'a nervous system calibrated to other people',
    energy: 'relational, indecisive, aesthetic, peace-seeking',
    howTheyDoIt: 'by reading others to find yourself, seeking harmony even when conflict would serve you better, and needing partnership to feel complete'
  },
  Scorpio: {
    costume: 'a psychological x-ray that sees beneath surfaces',
    energy: 'intense, private, magnetic, probing',
    howTheyDoIt: 'by testing people before trusting them, controlling what you reveal, and transforming through crisis'
  },
  Sagittarius: {
    costume: 'a restlessness that needs meaning',
    energy: 'adventurous, philosophical, blunt, optimistic',
    howTheyDoIt: 'by seeking the bigger picture, speaking truth even when it stings, and needing freedom to feel alive'
  },
  Capricorn: {
    costume: 'an awareness of how you appear to authority',
    energy: 'ambitious, guarded, responsible, strategic',
    howTheyDoIt: 'by earning respect through competence, building slowly, and hiding vulnerability behind achievement'
  },
  Aquarius: {
    costume: 'a need to be different from the group',
    energy: 'detached, innovative, stubborn, humanitarian',
    howTheyDoIt: 'by observing humanity from slight distance, valuing ideas over emotions, and resisting anything that feels like conformity'
  },
  Pisces: {
    costume: 'permeable boundaries that absorb everything',
    energy: 'empathic, dreamy, escapist, intuitive',
    howTheyDoIt: 'by feeling what others feel (whether you want to or not), needing solitude to recover, and living partly in unseen realms'
  }
};

// Psychological/esoteric Ascendant descriptions
export const RISING_SIGN_PSYCHOLOGY: Record<string, string> = {
  Aries: 'You approach life with your body first. New situations trigger action before thought. Your defense mechanism is aggression or withdrawal — rarely passivity. People experience you as direct, sometimes abrupt. You need to feel like you\'re in motion to feel alive.',
  Taurus: 'You approach life by assessing physical reality first. New situations make you slow down and evaluate. Your defense mechanism is stubborn immobility. People experience you as calm, solid, sometimes immovable. You need sensory comfort to feel safe.',
  Gemini: 'You approach life by gathering information first. New situations trigger questions. Your defense mechanism is intellectualization — thinking instead of feeling. People experience you as quick, curious, sometimes hard to pin down. You need mental stimulation to feel present.',
  Cancer: 'You approach life with your emotional antennae extended. New situations trigger a safety assessment — is this environment nurturing or threatening? Your defense mechanism is withdrawal into your shell. People experience you as warm but guarded. You need to feel emotionally held to open up.',
  Leo: 'You approach life expecting to be seen. New situations are stages where you assess your role. Your defense mechanism is pride — performing confidence when you feel unsure. People experience you as warm, dramatic, sometimes needing too much attention. You need appreciation to feel valued.',
  Virgo: 'You approach life by noticing what needs fixing. New situations trigger analysis — what\'s wrong here, and can I help? Your defense mechanism is perfectionism and self-criticism. People experience you as helpful, competent, sometimes anxious. You need to be useful to feel worthy.',
  Libra: 'You approach life through others. New situations make you scan for relational cues — who\'s here, what do they want, how do I fit? Your defense mechanism is people-pleasing and avoiding conflict. People experience you as gracious, charming, sometimes hard to know. You need partnership to feel complete.',
  Scorpio: 'You approach life expecting hidden agendas. New situations trigger surveillance — what\'s really going on beneath the surface? Your defense mechanism is control and secrecy. People experience you as intense, magnetic, sometimes intimidating. You need emotional truth to trust.',
  Sagittarius: 'You approach life as a quest for meaning. New situations trigger optimism and the question "what can I learn here?" Your defense mechanism is escapism — physical or philosophical flight. People experience you as enthusiastic, honest, sometimes preachy. You need freedom to feel alive.',
  Capricorn: 'You approach life as a test of competence. New situations trigger evaluation — how will I be judged, and how do I measure up? Your defense mechanism is emotional suppression and overwork. People experience you as capable, serious, sometimes cold. You need achievement to feel secure.',
  Aquarius: 'You approach life as an observer of humanity. New situations trigger detachment — you watch before participating. Your defense mechanism is intellectualizing emotions and maintaining distance. People experience you as friendly but aloof, interesting but unreachable. You need to feel unique to feel real.',
  Pisces: 'You approach life with dissolving boundaries. New situations flood you with impressions — moods, energies, the unspoken. Your defense mechanism is escapism, fantasy, or merging with others. People experience you as gentle, elusive, sometimes confusing. You need solitude and creative outlet to stay grounded.'
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
