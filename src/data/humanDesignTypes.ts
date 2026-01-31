// Complete Human Design Types Encyclopedia
// All 5 Types with comprehensive analysis

export interface HDTypeData {
  type: string;
  percentage: string;
  auraDescription: string;
  strategy: string;
  strategyDetailed: string;
  signature: string;
  notSelfTheme: string;
  overview: string;
  howEnergyWorks: string;
  roleInWorld: string;
  decisionMaking: string;
  commonConditioning: string[];
  deconditioningPractices: string[];
  relationshipDynamics: string;
  workAndCareer: string;
  healthAndRest: string;
  successIndicators: string[];
  specificGuidance: {
    title: string;
    points: string[];
  }[];
}

export const TYPE_DATA: Record<string, HDTypeData> = {
  'Manifestor': {
    type: 'Manifestor',
    percentage: '~9% of population',
    auraDescription: 'Closed and repelling aura that pushes against others. This aura is designed to create space for initiation without interference. Others may feel uncertain about you or pushed away until you inform them.',
    strategy: 'Inform before Acting',
    strategyDetailed: 'Before you initiate any action that will impact others, tell them what you\'re about to do. This isn\'t asking permission - it\'s giving others a heads up so they can adjust. Informing reduces resistance and anger.',
    signature: 'Peace - When living correctly, you experience inner peace and smooth initiation',
    notSelfTheme: 'Anger - When not informing and hitting resistance, you experience anger',
    overview: 'Manifestors are the only Type designed to initiate. You\'re here to start things, to set things in motion, to make an impact. You don\'t need to wait for anything - you have the energetic design to begin.',
    howEnergyWorks: 'Unlike Generators, you don\'t have sustainable work energy. You have powerful bursts for initiating, but you need significant rest between initiatives. Your energy is about impact, not endurance.',
    roleInWorld: 'You\'re here to initiate what the rest of us need. You start the fires that others tend. You break ground that others build upon. You\'re not meant to do everything - you\'re meant to begin things.',
    decisionMaking: 'Your Authority determines how you make decisions (Emotional, Splenic, or Ego). But once you have clarity, you simply inform and act. You don\'t need to respond or wait for invitation.',
    commonConditioning: [
      'Being told to wait for permission or approval',
      'Being taught that initiating is selfish or aggressive',
      'Feeling guilty for your independence',
      'Being forced to work sustainably like a Generator',
      'Being punished for your closed aura',
      'Learning to ask permission instead of informing'
    ],
    deconditioningPractices: [
      'Practice informing even when it feels unnecessary',
      'Notice your anger as a sign you didn\'t inform',
      'Give yourself permission to rest between initiatives',
      'Reclaim your right to initiate without approval',
      'Stop apologizing for your impact',
      'Learn to inform without asking permission'
    ],
    relationshipDynamics: 'Your closed aura can feel intimidating or dismissive to others. By informing, you bring others into your world. In relationships, communicate your plans - partners need to know, not approve.',
    workAndCareer: 'You need freedom to initiate. Jobs that require response or approval will make you angry. Leadership roles where you can start things and delegate the maintenance are ideal.',
    healthAndRest: 'You are NOT designed for sustainable work. Take significant rest between bursts of initiation. Your energy is for impact, not endurance. Burnout happens when you push like a Generator.',
    successIndicators: [
      'Feeling peace even when others don\'t understand',
      'Smooth initiation without unexpected resistance',
      'Others adjusting to your impact gracefully',
      'Energy for bursts of powerful initiation',
      'Freedom to act independently',
      'Anger decreasing as informing becomes natural'
    ],
    specificGuidance: [
      {
        title: 'Informing Practice',
        points: [
          'Informing is not asking permission - it\'s a heads-up',
          'Inform anyone who will be impacted by your action',
          'Simple informing: "I\'m going to..." or "I\'ve decided to..."',
          'Notice resistance? You probably forgot to inform someone',
          'Even small initiations benefit from informing'
        ]
      },
      {
        title: 'Impact Awareness',
        points: [
          'Your aura naturally creates impact and pushes on others',
          'This isn\'t aggression - it\'s your design',
          'Informing helps others prepare for your impact',
          'You don\'t need to soften your initiation, just communicate it',
          'Your independence is a gift, not a problem'
        ]
      },
      {
        title: 'Anger as Feedback',
        points: [
          'Anger signals you\'ve hit resistance you didn\'t expect',
          'Usually means you didn\'t inform (or inform enough)',
          'Don\'t suppress anger - use it as information',
          'Peace returns when informing becomes natural',
          'The goal isn\'t to never feel anger, but to reduce unnecessary resistance'
        ]
      }
    ]
  },
  
  'Generator': {
    type: 'Generator',
    percentage: '~37% of population',
    auraDescription: 'Open and enveloping aura that pulls life toward you. Your aura is designed to draw opportunities and people to you. When you\'re lit up, others want to be around you.',
    strategy: 'Wait to Respond',
    strategyDetailed: 'Wait for something to show up in your reality - a question, an opportunity, an invitation, a sign - and then check your Sacral response. You don\'t initiate; life brings things to you.',
    signature: 'Satisfaction - When responding correctly, you feel deeply satisfied with your work and life',
    notSelfTheme: 'Frustration - When initiating or doing the wrong work, you feel frustrated',
    overview: 'Generators are the life force of the planet. You have sustainable energy for work when it\'s the right work - work that your Sacral says "uh-huh" to. You\'re here to master and build.',
    howEnergyWorks: 'You have a defined Sacral Center, giving you sustainable, regenerating energy for work. But this energy is specifically for what lights you up. Wrong work drains you; right work energizes you.',
    roleInWorld: 'You\'re here to build, master, and bring things to completion. You don\'t start things from nothing - you respond to what shows up and invest your powerful energy in building it.',
    decisionMaking: 'Your Sacral responds with sounds: "uh-huh" (yes), "uhn-uhn" (no), or silence (wait). Trust this response over your mind. If you\'re Emotional, wait through your wave before acting on the Sacral response.',
    commonConditioning: [
      'Being taught to initiate like a Manifestor',
      'Being told your gut responses are "just feelings"',
      'Saying yes to be polite when your Sacral says no',
      'Working at the wrong things because you "should"',
      'Pushing through frustration instead of re-evaluating',
      'Not waiting for things to respond to'
    ],
    deconditioningPractices: [
      'Practice responding with sounds before words',
      'Start small: respond to daily things with your gut',
      'Notice frustration as a sign you\'re doing the wrong thing',
      'Give yourself permission to say no when your Sacral says no',
      'Wait for things to show up instead of chasing',
      'Go to bed exhausted so your Sacral can regenerate'
    ],
    relationshipDynamics: 'Your energy is magnetic when you\'re satisfied. Partners need to understand your need to respond, not initiate. Healthy relationships allow for your Sacral to guide what you engage with.',
    workAndCareer: 'Find work that your Sacral says "uh-huh" to. You have energy for mastery - commit to becoming great at what lights you up. Wrong work leads to burnout; right work is sustainable for life.',
    healthAndRest: 'You need to USE your Sacral energy daily. Go to bed exhausted so you can regenerate fully. Unused Sacral energy becomes frustration. Physical activity is essential.',
    successIndicators: [
      'Deep satisfaction with your work',
      'Sustainable energy throughout the day',
      'Going to bed tired and waking up refreshed',
      'Clear Sacral responses to life',
      'Frustration decreasing as you respond correctly',
      'Mastery in areas you love'
    ],
    specificGuidance: [
      {
        title: 'Sacral Response Training',
        points: [
          'Ask yourself yes/no questions and notice the gut response',
          'The response comes BEFORE thought',
          'Sounds: "uh-huh/mm-hmm" = yes, "uhn-uhn" = no, silence = wait',
          'You can\'t respond to abstract future things - only what\'s present',
          'Practice making sounds instead of immediately using words'
        ]
      },
      {
        title: 'Frustration as Feedback',
        points: [
          'Frustration means you\'re doing the wrong work or not responding',
          'It\'s not a problem to solve - it\'s information',
          'When frustrated, ask: "What am I doing that doesn\'t light me up?"',
          'You can quit things that no longer get a Sacral yes',
          'Satisfaction is the goal, not just productivity'
        ]
      },
      {
        title: 'Waiting to Respond',
        points: [
          'You don\'t need to make things happen - life brings things to you',
          'Something to respond to could be: a question, an offer, a sign, a feeling',
          'Waiting doesn\'t mean passive - it means receptive',
          'Your open aura is drawing opportunities constantly',
          'Trust that what\'s correct for you will show up'
        ]
      }
    ]
  },
  
  'Manifesting Generator': {
    type: 'Manifesting Generator',
    percentage: '~33% of population',
    auraDescription: 'Open and enveloping aura (like Generators) but with an initiating quality. Your aura draws opportunities to you, and you move quickly once you respond. Energy can feel more intense than pure Generators.',
    strategy: 'Wait to Respond, then Inform',
    strategyDetailed: 'Like Generators, wait for something to respond to with your Sacral. Unlike Generators, you have a connection to manifestation, so after responding, inform those who will be impacted before you act.',
    signature: 'Satisfaction - When responding correctly and informing, you feel satisfied and free',
    notSelfTheme: 'Frustration and/or Anger - Frustration when not responding, anger when not informing',
    overview: 'Manifesting Generators are multi-passionate, fast-moving beings with the endurance of a Generator and the initiating quality of a Manifestor. You skip steps, juggle multiple interests, and move quickly.',
    howEnergyWorks: 'You have sustainable Sacral energy like Generators, but it wants to move fast. You may skip steps, change direction quickly, and juggle multiple projects. This isn\'t scattered - it\'s your design.',
    roleInWorld: 'You\'re here to be efficient, multi-passionate, and fast. You model that it\'s okay to have many interests, to pivot when something is no longer correct, and to move at your own rapid pace.',
    decisionMaking: 'Your Sacral responds first. Check for "uh-huh" before committing. If Emotional, wait through your wave. Once clear, inform before acting quickly. Your speed is a gift when response comes first.',
    commonConditioning: [
      'Being told to slow down and focus on one thing',
      'Shame about pivoting or changing directions',
      'Pushing forward without responding first',
      'Not informing because you move too fast',
      'Thinking your multi-passionate nature is scattered',
      'Forcing yourself to complete things that no longer light you up'
    ],
    deconditioningPractices: [
      'Embrace being multi-passionate - it\'s your design',
      'Still wait for Sacral response before each new thing',
      'Practice quick informing before your fast moves',
      'Give yourself permission to skip steps if they don\'t serve',
      'Quit things that no longer get a Sacral "uh-huh"',
      'Celebrate your efficiency and speed'
    ],
    relationshipDynamics: 'Partners need to keep up or understand your pace. You may have many interests, including in relationships. Informing helps others adjust to your quick movements.',
    workAndCareer: 'Multi-faceted careers suit you. You may have multiple jobs, businesses, or evolving career paths. Efficiency is your gift - you get things done faster than others expect.',
    healthAndRest: 'Like Generators, use your energy daily and go to bed tired. But be aware you can push too fast and ignore signals. Your speed doesn\'t mean skipping rest.',
    successIndicators: [
      'Satisfaction with multiple areas of life',
      'Freedom to move quickly and pivot as needed',
      'Others adjusting to your informed rapid action',
      'Using efficiency as a gift, not a compulsion',
      'Clear Sacral responses guiding your many interests',
      'Frustration and anger both decreasing'
    ],
    specificGuidance: [
      {
        title: 'Response + Inform Process',
        points: [
          'Always check Sacral response first, even when excited',
          'Once you have "uh-huh," quickly inform before acting',
          'Informing can be brief: "I\'m going to..." "FYI..."',
          'Speed is fine AFTER response and informing',
          'Don\'t skip these steps even when you want to move fast'
        ]
      },
      {
        title: 'Multi-Passionate Navigation',
        points: [
          'Having many interests is correct for you',
          'Each interest still needs a Sacral response',
          'It\'s okay to pivot when "uh-huh" becomes "uhn-uhn"',
          'You don\'t need to finish everything - just what stays lit up',
          'Others may not understand your variety - that\'s okay'
        ]
      },
      {
        title: 'Skipping Steps Correctly',
        points: [
          'Your efficiency often means skipping steps others need',
          'Only skip steps that don\'t serve - still do essential ones',
          'Sometimes you\'ll need to go back and fill in what you skipped',
          'This isn\'t laziness - it\'s energetic efficiency',
          'Trust your body\'s sense of the most direct path'
        ]
      },
      {
        title: 'Frustration + Anger Awareness',
        points: [
          'Frustration signals not responding to the right things',
          'Anger signals not informing before acting',
          'Both can occur simultaneously - check both strategies',
          'Don\'t push through these feelings - they\'re information',
          'Peace and satisfaction come from Response + Inform'
        ]
      }
    ]
  },
  
  'Projector': {
    type: 'Projector',
    percentage: '~20% of population',
    auraDescription: 'Focused and penetrating aura that goes deep into one person at a time. You see others deeply and can guide them, but only when they invite this focused attention.',
    strategy: 'Wait for the Invitation',
    strategyDetailed: 'Wait to be recognized and invited before sharing your guidance, especially for the big things in life: career, relationships, relocation. Small daily interactions don\'t need formal invitations.',
    signature: 'Success - When invited and recognized, you experience success and feel valued',
    notSelfTheme: 'Bitterness - When giving unrecognized guidance or not waiting for invitations, you become bitter',
    overview: 'Projectors are here to guide and manage the energy of others. You see deeply into how things work and how they could work better. But your guidance only lands when you\'re invited.',
    howEnergyWorks: 'You don\'t have consistent Sacral energy. You work in focused bursts and need significant rest. You\'re not designed to work like Generators - your value is in guidance, not labor.',
    roleInWorld: 'You\'re here to guide, direct, and manage. You see what others don\'t see. When recognized and invited, your insights can transform people, organizations, and situations.',
    decisionMaking: 'Your specific Authority (Emotional, Splenic, Ego Projected, Self-Projected, or Mental) determines how you make decisions. But the context is always: wait for the invitation before acting on big things.',
    commonConditioning: [
      'Trying to work like a Generator',
      'Giving unsolicited advice (not waiting for invitation)',
      'Feeling bitter when guidance isn\'t recognized',
      'Initiating in big life areas without invitation',
      'Not resting enough because it feels "lazy"',
      'Seeking any attention instead of right recognition'
    ],
    deconditioningPractices: [
      'Wait for invitations for big things (career, relationships, moves)',
      'Rest 3-4 hours more than Generators - this is your design',
      'Study what interests you - this attracts right recognition',
      'Notice bitterness as a sign you weren\'t invited',
      'Practice being asked before advising',
      'Build your expertise to attract proper invitations'
    ],
    relationshipDynamics: 'You need partners who recognize you and want your guidance. Without recognition, you\'ll become bitter. The right relationship is one where you feel seen and valued.',
    workAndCareer: 'You need to be invited into career roles. Job-hunting can be bitter work; being recognized and invited is the goal. Roles that use your insight without demanding Generator work hours are ideal.',
    healthAndRest: 'You need 3-4 hours more rest per day than Generators. This isn\'t laziness - it\'s your design. Working like a Generator will burn you out. Honor your need for rest.',
    successIndicators: [
      'Feeling recognized for who you are',
      'Being invited into opportunities that value your insight',
      'Enough rest without guilt',
      'Bitterness decreasing as invitations become natural',
      'Success in your field through recognition',
      'Energy for focused guidance without burnout'
    ],
    specificGuidance: [
      {
        title: 'Invitation Recognition',
        points: [
          'Big invitations: career, relationships, moving, major changes',
          'Small daily interactions don\'t need formal invitations',
          'An invitation is being asked, not just being included',
          'Correct invitations feel recognizing, not just convenient',
          'You can influence your invitation field through expertise'
        ]
      },
      {
        title: 'Success Without Sacral Energy',
        points: [
          'You cannot and should not work like a Generator',
          'Your value is insight and guidance, not hours of labor',
          'Work in focused bursts on what you\'re invited to',
          'Take afternoon rests if possible - they\'re restorative',
          'Success comes from leverage, not endurance'
        ]
      },
      {
        title: 'Rest Requirements',
        points: [
          'You need 3-4 hours more rest daily than Sacral beings',
          'This can be actual sleep, naps, or restorative rest',
          'Lying down before fully tired helps - don\'t wait for exhaustion',
          'Alone time is often necessary to discharge others\' energy',
          'Rest is productive for Projectors - it\'s where you integrate'
        ]
      },
      {
        title: 'Bitterness as Feedback',
        points: [
          'Bitterness signals unrecognized guidance or lack of invitation',
          'It\'s not wrong to feel bitter - it\'s information',
          'Ask: "Did I wait for the invitation here?"',
          'Bitterness decreases as you trust the invitation process',
          'Being seen and valued is your birthright when you wait'
        ]
      }
    ]
  },
  
  'Reflector': {
    type: 'Reflector',
    percentage: '~1% of population',
    auraDescription: 'Resistant and sampling aura that reflects the health of environments. You take in and amplify everything around you, acting as a mirror for your community.',
    strategy: 'Wait 29 Days',
    strategyDetailed: 'Wait through a complete lunar cycle before making major decisions. The moon moves through all gates and centers, giving you every perspective on the decision before clarity emerges.',
    signature: 'Surprise - When living correctly, life continually surprises and delights you',
    notSelfTheme: 'Disappointment - When rushing decisions or in the wrong environment, you feel disappointed',
    overview: 'Reflectors are the rarest Type, with all centers undefined. You\'re here to be the mirror for your community, reflecting back its health or dysfunction. You\'re deeply connected to the lunar cycle.',
    howEnergyWorks: 'You don\'t have consistent energy from any center. Your experience changes daily based on who you\'re with and where the moon is. This isn\'t instability - it\'s your sampling nature.',
    roleInWorld: 'You\'re here to be a barometer for your community. When you\'re thriving, it means the environment is healthy. When you\'re not, something is wrong with the place or people, not with you.',
    decisionMaking: 'Wait through a complete lunar cycle (29+ days) for major decisions. Track how you feel as the moon moves through different gates. What remains consistent throughout the cycle is your truth.',
    commonConditioning: [
      'Trying to be consistent like defined types',
      'Making quick decisions without lunar waiting',
      'Staying in wrong environments hoping to change',
      'Thinking your changing nature is a problem',
      'Identifying too strongly with any energy you sample',
      'Expecting to have a stable identity'
    ],
    deconditioningPractices: [
      'Track the moon and your experience for several months',
      'Wait 29 days for all major decisions - non-negotiable',
      'Pay enormous attention to your environment',
      'Don\'t identify with sampled energy - it\'s not yours',
      'Find communities where you thrive',
      'Celebrate your unique, ever-changing nature'
    ],
    relationshipDynamics: 'You experience relationships very differently based on the day and environment. Partners need to understand your changing nature. Community is especially important for you.',
    workAndCareer: 'Environment is everything. A good job in a wrong environment will be miserable. A less-perfect role in a healthy community could be magical. Always prioritize place.',
    healthAndRest: 'Your wellbeing is tied to environment. In the wrong place, you\'ll feel sick. You need alone time to discharge sampled energy. The lunar cycle affects your energy significantly.',
    successIndicators: [
      'Feeling continually surprised and delighted by life',
      'Being in environments where you naturally thrive',
      'Patience with your 29-day decision process',
      'Disappointment decreasing as you honor your nature',
      'Community that values your reflection',
      'Comfort with your ever-changing experience'
    ],
    specificGuidance: [
      {
        title: '29-Day Decision Process',
        points: [
          'Major decisions REQUIRE a full lunar cycle of waiting',
          'Track the moon\'s position and your feelings daily',
          'Notice what stays consistent vs. what fluctuates',
          'What remains true throughout the cycle is your answer',
          'Don\'t let others pressure you into faster decisions'
        ]
      },
      {
        title: 'Environmental Sensitivity',
        points: [
          'You are extremely affected by environment',
          'Physical place matters more for you than almost anyone',
          'The people around you deeply impact your experience',
          'Wrong environment = wrong life, regardless of other factors',
          'Prioritize environment in every major decision'
        ]
      },
      {
        title: 'Community Discernment',
        points: [
          'You reflect the health of your community',
          'If you\'re not thriving, check your environment first',
          'Find communities where you naturally flourish',
          'Your gift to community is being an honest mirror',
          'You don\'t need to fix what you reflect - just show it'
        ]
      },
      {
        title: 'Disappointment as Feedback',
        points: [
          'Disappointment signals wrong environment or rushed decisions',
          'It\'s not about you - it\'s about where you are',
          'Surprise and delight are your natural state in right places',
          'Don\'t stay in disappointing environments hoping they\'ll change',
          'Trust the lunar cycle to reveal what\'s correct'
        ]
      }
    ]
  }
};

// Get type data by type string
export const getTypeData = (type: string): HDTypeData | undefined => {
  return TYPE_DATA[type];
};

// Get all types
export const ALL_TYPES = Object.keys(TYPE_DATA);
