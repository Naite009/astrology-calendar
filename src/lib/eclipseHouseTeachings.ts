/**
 * Deep house teachings for eclipse personalization.
 * "3rd grade to dissertation" — each house gets:
 *   simpleExplanation: one sentence a child could understand
 *   deeperMeaning: the psychological/behavioral layer
 *   eclipseSolar: what a solar eclipse does here
 *   eclipseLunar: what a lunar eclipse does here
 *   examples: concrete real-life scenarios
 *   soulQuestion: the question this activation asks
 *   dangerZone: what goes wrong when you resist
 *   axisTeaching: how the opposite house is implicated
 */

export interface EclipseHouseTeaching {
  simpleExplanation: string;
  deeperMeaning: string;
  eclipseSolar: string;
  eclipseLunar: string;
  examples: string[];
  soulQuestion: string;
  dangerZone: string;
  axisTeaching: string;
}

export const ECLIPSE_HOUSE_TEACHINGS: Record<number, EclipseHouseTeaching> = {
  1: {
    simpleExplanation: "The 1st house is YOU — your body, your face, the first thing people see when you walk into a room. It's the 'I am' house.",
    deeperMeaning: "This house governs your identity at its most fundamental level — not who you think you should be or who others want you to be, but the raw, instinctive version of yourself that shows up before you have time to edit. It includes your physical vitality, your personal brand (whether intentional or not), your default behavioral patterns, and the mask you wear so automatically you've forgotten it's a mask. When planets or eclipses activate this house, they're asking: who are you when nobody is watching, and does that match who you are when everyone is?",
    eclipseSolar: "A solar eclipse in your 1st house is a hard reset on identity. Something about the way you've been presenting yourself, the role you've been playing, or the version of 'you' you've been maintaining is ending — and a new chapter of self-definition is beginning. This can feel like an identity crisis because it IS one. The old self-image no longer fits. You may change your appearance, your name, your personal brand, your health approach, or simply realize that the person you've been isn't the person you're becoming.",
    eclipseLunar: "A lunar eclipse in your 1st house brings an emotional reckoning with your self-image. Something about how you see yourself — or how others see you — becomes impossible to ignore. Feelings you've been suppressing about your body, your confidence, your independence, or your personal direction come to the surface. This is the universe holding up a mirror and saying: this is who you've actually become. Do you like what you see?",
    examples: [
      "Deciding to leave a job title that defined your identity for years",
      "A health wake-up call that forces you to pay attention to your body",
      "Realizing the 'strong one' persona you've maintained is exhausting you",
      "Cutting your hair, changing your style, or physically marking a new chapter",
      "Finally introducing yourself the way YOU want — not the way you were taught to"
    ],
    soulQuestion: "Am I living as the person I actually am — or performing a version of myself that was built to survive someone else's expectations?",
    dangerZone: "Resisting a 1st house eclipse means clinging to an outdated self-image. You keep introducing yourself the old way, dressing the old way, and reacting the old way — even though it stopped fitting months ago. The danger is becoming a museum exhibit of who you used to be.",
    axisTeaching: "The 1st–7th axis is the 'self vs. other' equation. When eclipses hit your 1st house, your relationships are also in play — because changing who you are inevitably changes who you're with and how they relate to you. Partners may feel destabilized by your evolution. That's not a reason to stop."
  },
  2: {
    simpleExplanation: "The 2nd house is what you OWN — your money, your stuff, but also what you think you're worth. It's the 'I have' house.",
    deeperMeaning: "This house governs your relationship with resources, security, and self-worth at the deepest level. It's not just your bank account — it's the internal thermostat that determines what you believe you deserve. Your pricing, your savings habits, your willingness to ask for a raise, your attachment to objects, your comfort eating, your relationship with luxury vs. scarcity — all 2nd house territory. The core issue is always: do I believe I'm enough, and does my material life reflect that belief?",
    eclipseSolar: "A solar eclipse in your 2nd house restructures your financial life or your value system. An income stream may end and a new one begins. A spending pattern that seemed normal is revealed as unsustainable. Or more profoundly: something you thought was valuable turns out to be worthless, and something you dismissed turns out to be the real asset.",
    eclipseLunar: "A lunar eclipse in your 2nd house brings an emotional reckoning with money, possessions, or self-worth. You feel the gap between what you earn and what you're worth. A financial situation reaches its climax. Or you realize that the things you've been accumulating aren't actually making you feel secure — they're substitutes for something deeper.",
    examples: [
      "Losing a client or income source and being forced to reassess your pricing",
      "Realizing you've been undercharging because you don't believe you're worth more",
      "A possession breaking or being lost that forces you to examine your attachment to things",
      "Finally opening that savings account — or finally spending on yourself without guilt",
      "Quitting a well-paying job because it was costing you something money can't buy"
    ],
    soulQuestion: "Am I building security based on what I actually value — or am I accumulating things to fill a void that has nothing to do with money?",
    dangerZone: "Resisting a 2nd house eclipse means staying in the underpaid job, the undervalued relationship, or the scarcity mindset because familiar poverty feels safer than unfamiliar abundance. You know you're worth more, but acting on it requires a self-worth upgrade you haven't installed yet.",
    axisTeaching: "The 2nd–8th axis is the 'mine vs. ours' equation. When eclipses hit your 2nd house, shared finances, debts, inheritances, or dependencies on others' resources are also stirred. You can't change what you think you're worth without renegotiating what you share."
  },
  3: {
    simpleExplanation: "The 3rd house is how you THINK and TALK — your daily conversations, your neighborhood, your siblings, your commute. It's the 'I communicate' house.",
    deeperMeaning: "This house governs the operating system of your mind — how you process information, what stories you tell yourself, and the quality of your everyday exchanges. It includes your learning style, your writing, your social media presence, your relationship with siblings or neighbors, and the mundane logistics of daily movement. The 3rd house is where you either think clearly or talk yourself into loops. When activated by eclipses, it disrupts the narratives you've been running on autopilot.",
    eclipseSolar: "A solar eclipse in your 3rd house rewires how you think, learn, or communicate. You may start writing, teaching, or studying something new. A sibling relationship shifts. The way you process information or make daily decisions undergoes a significant change. New information arrives that changes your understanding of something fundamental.",
    eclipseLunar: "A lunar eclipse in your 3rd house brings an emotional crescendo to a communication dynamic, a learning process, or a sibling relationship. You say the thing you've been holding back. A conversation reaches its breaking point. Or you realize the story you've been telling yourself about a situation isn't true.",
    examples: [
      "Starting a blog, podcast, or course — finding your voice in a new medium",
      "A sibling conflict coming to a head and either resolving or breaking",
      "Changing your commute, your neighborhood, or your daily routine in a way that shifts your perspective",
      "Discovering information that reframes your understanding of a family dynamic",
      "Realizing you've been explaining yourself to people who aren't listening"
    ],
    soulQuestion: "Am I saying what I actually think — or am I narrating my life in a script someone else wrote?",
    dangerZone: "Resisting a 3rd house eclipse means clinging to outdated mental models. You keep telling the same story about why things are the way they are, even when evidence contradicts it. The danger is becoming someone who talks but never updates.",
    axisTeaching: "The 3rd–9th axis is 'information vs. wisdom.' When eclipses hit your 3rd house, your beliefs (9th) are also challenged — because new facts demand revised philosophy."
  },
  4: {
    simpleExplanation: "The 4th house is your HOME — your family, your roots, where you feel safe. It's the 'I belong' house.",
    deeperMeaning: "This house governs your emotional foundation — the internal sense of home that exists whether or not you have a physical one. It includes your relationship with your parents (especially the more nurturing one), your family patterns, your ancestry, your living situation, and the private self nobody sees. The 4th house is where you go when the world is too much. When eclipses activate it, the foundation shakes — sometimes literally (a move, a renovation), sometimes emotionally (a family reckoning).",
    eclipseSolar: "A solar eclipse in your 4th house begins a new domestic chapter. You may move, renovate, start or end a living situation, welcome a family member, or fundamentally restructure your relationship with 'home.' At the deepest level, this eclipse asks you to build a new emotional foundation — one based on who you are now, not who you were raised to be.",
    eclipseLunar: "A lunar eclipse in your 4th house brings an emotional climax in family matters or your living situation. Suppressed feelings about a parent, a home, or your sense of belonging surface. Something that was hidden in the family becomes visible. The private life can no longer remain private.",
    examples: [
      "Moving to a new home that better reflects your current life",
      "A parent relationship reaching a turning point — either healing or honest distance",
      "Discovering a family secret or pattern that explains your own behavior",
      "Deciding to create your own definition of 'family' rather than accepting the inherited one",
      "Feeling homesick for a version of home that doesn't exist yet"
    ],
    soulQuestion: "Am I building my life on a foundation I chose — or one I inherited by default?",
    dangerZone: "Resisting a 4th house eclipse means staying in the childhood role long past its expiration date — the good child, the responsible one, the invisible one. You keep the peace in a family system that costs you your peace.",
    axisTeaching: "The 4th–10th axis is 'private life vs. public life.' When eclipses hit your 4th house, your career and public reputation are also stirred — because you can't change where you live without changing how you show up in the world."
  },
  5: {
    simpleExplanation: "The 5th house is what makes you HAPPY — fun, creativity, romance, kids, anything that feels like play. It's the 'I create' house.",
    deeperMeaning: "This house governs joy, creative expression, and the courage to put something of yourself into the world without guarantees. It includes romantic attraction (the butterflies phase, not the commitment phase), children, hobbies, gambling, performance, and anything where you risk being seen for who you authentically are. The 5th house is where ego meets vulnerability — because creating something, loving someone, or playing fully all require you to drop the mask and be visible.",
    eclipseSolar: "A solar eclipse in your 5th house opens a new creative or romantic chapter. A pregnancy, a creative project, a love affair, or a new form of self-expression begins. The universe is saying: it's time to make something — a child, a painting, a business, a performance — that couldn't exist without your unique spark.",
    eclipseLunar: "A lunar eclipse in your 5th house brings a creative or romantic situation to its emotional peak. A love affair reaches its climax. A creative project is completed or abandoned. Your relationship with fun, pleasure, or children hits a turning point. Joy that was being suppressed demands acknowledgment.",
    examples: [
      "Falling in love — or realizing you've been performing love instead of feeling it",
      "Starting a creative project that scares you because it's genuinely yours",
      "A child-related milestone that shifts your identity",
      "Quitting a hobby that was about showing off and starting one that's about joy",
      "Realizing you haven't played — genuinely played — in years"
    ],
    soulQuestion: "When was the last time I created something just because it wanted to exist — not because it was productive or impressive?",
    dangerZone: "Resisting a 5th house eclipse means killing joy preemptively because vulnerability feels dangerous. You refuse to play, create, or love without guarantees. Life becomes efficient but joyless.",
    axisTeaching: "The 5th–11th axis is 'personal joy vs. collective belonging.' When eclipses hit your 5th house, your friendships and group affiliations are also stirred — because what brings you joy privately may conflict with what your social circle approves of."
  },
  6: {
    simpleExplanation: "The 6th house is your DAILY LIFE — your job, your health, your habits, your pets. It's the 'I improve' house.",
    deeperMeaning: "This house governs the systems that keep your life running — your health routines, your work habits, your daily schedule, your relationship with service and duty, and the gap between what you should be doing and what you're actually doing. The 6th house is where the body keeps score. Stress shows up here as illness, burnout, or the quiet desperation of a routine that serves everyone except you. When eclipses activate this house, the daily machine breaks down — so it can be rebuilt to actually serve you.",
    eclipseSolar: "A solar eclipse in your 6th house restructures your daily life. A new job, a new health protocol, a new routine, or a new relationship with service begins. The way you've been getting through each day is being upgraded — or forcibly replaced.",
    eclipseLunar: "A lunar eclipse in your 6th house brings an emotional reckoning with your health, your work, or your daily habits. The stress you've been managing catches up. A work situation reaches its breaking point. Your body sends a message you can no longer ignore.",
    examples: [
      "A health diagnosis that forces you to change how you eat, move, or rest",
      "Quitting a job where you were useful but miserable",
      "Adopting a pet that restructures your daily schedule around care",
      "Realizing your 'productive' routine is actually a control mechanism",
      "Starting therapy, acupuncture, or a practice that treats the root instead of the symptom"
    ],
    soulQuestion: "Is my daily routine sustaining me — or is it slowly consuming me while looking responsible from the outside?",
    dangerZone: "Resisting a 6th house eclipse means doubling down on the grind — working harder at a system that's already broken, ignoring body signals, treating exhaustion as a character flaw instead of a design problem.",
    axisTeaching: "The 6th–12th axis is 'function vs. surrender.' When eclipses hit your 6th house, your spiritual life, your subconscious patterns, and your need for rest are also stirred — because you can't fix the daily machine without addressing the invisible forces draining it."
  },
  7: {
    simpleExplanation: "The 7th house is your RELATIONSHIPS — your partner, your best friend, anyone you commit to one-on-one. It's the 'I relate' house.",
    deeperMeaning: "This house governs committed partnerships of all kinds — romantic, business, legal, therapeutic. It's also the house of open enemies and projections: the qualities you see most clearly in others are often the ones you've disowned in yourself. The 7th house is a mirror. When eclipses activate it, the mirror cracks — revealing what's really going on behind the polite facade of your most important relationships.",
    eclipseSolar: "A solar eclipse in your 7th house begins a new chapter in partnership. You may meet someone significant, commit to or leave a relationship, start a business partnership, or fundamentally redefine what you need from a committed other. The old relationship contract is being rewritten.",
    eclipseLunar: "A lunar eclipse in your 7th house brings a relationship to its emotional climax. Something that's been building between you and a partner — spoken or unspoken — can no longer be contained. A relationship ends, transforms, or finally becomes honest.",
    examples: [
      "Meeting someone who changes your understanding of what partnership can be",
      "A marriage or business partnership reaching a crossroads",
      "Realizing you've been attracting the same type of partner because you haven't changed",
      "A legal dispute or contract negotiation that forces you to define your boundaries",
      "Choosing yourself in a relationship dynamic that required you to disappear"
    ],
    soulQuestion: "In my closest relationships, am I showing up as a whole person — or am I editing myself to keep the peace?",
    dangerZone: "Resisting a 7th house eclipse means staying in a relationship that requires you to be less than you are — or refusing to enter one because vulnerability feels like loss of control.",
    axisTeaching: "The 1st–7th axis is 'self vs. other.' When eclipses hit your 7th house, your identity is also in play — because who you're with shapes who you become, and who you become determines who you attract."
  },
  8: {
    simpleExplanation: "The 8th house is the DEEP stuff — shared money, trust, loss, and the things nobody talks about at dinner. It's the 'I transform' house.",
    deeperMeaning: "This house governs the territory most people avoid: intimacy, shared resources, power dynamics, psychological depths, inheritance, debt, taxes, sexuality, and death. The 8th house is where you either merge with another person's reality or get consumed by it. It's where trust is tested at the deepest level — not 'do I trust you with my feelings' but 'do I trust you with my bank account, my body, my secrets.' When eclipses activate this house, something buried comes to the surface.",
    eclipseSolar: "A solar eclipse in your 8th house opens a new chapter in shared resources, intimacy, or psychological transformation. A debt is restructured. An inheritance arrives. A sexual or emotional dynamic begins that requires surrender of control. Something ends so something deeper can begin.",
    eclipseLunar: "A lunar eclipse in your 8th house brings a crisis of trust, a financial entanglement to its peak, or an emotional truth that can no longer be buried. Secrets surface. Power dynamics shift. Something you've been avoiding dealing with demands to be dealt with now.",
    examples: [
      "An inheritance, insurance payout, or debt restructuring that changes your financial landscape",
      "A betrayal or trust violation that forces you to rebuild from the ground",
      "Therapy breakthroughs that surface childhood material you didn't know was running your life",
      "A sexual relationship that requires a level of vulnerability you've been avoiding",
      "Letting go of control in a situation where you have no choice but to trust someone else"
    ],
    soulQuestion: "What am I refusing to look at — and what is it costing me to keep it buried?",
    dangerZone: "Resisting an 8th house eclipse means maintaining surface-level intimacy while hoarding the real stuff. You share bodies but not bank accounts. You share houses but not fears. The danger is dying with your secrets intact and your relationships half-lived.",
    axisTeaching: "The 2nd–8th axis is 'mine vs. ours.' When eclipses hit your 8th house, your personal finances and self-worth are also stirred — because you can't merge resources with someone else until you know what you're worth on your own."
  },
  9: {
    simpleExplanation: "The 9th house is the BIG PICTURE — travel, education, beliefs, and the meaning of life. It's the 'I believe' house.",
    deeperMeaning: "This house governs your philosophical operating system — the beliefs, worldview, and meaning-making frameworks that determine how you interpret everything that happens to you. It includes higher education, long-distance travel, publishing, legal matters, religion, and mentorship. The 9th house is where you ask 'why am I here?' and either find a satisfying answer or realize you've been borrowing someone else's. When eclipses activate this house, your belief system gets stress-tested.",
    eclipseSolar: "A solar eclipse in your 9th house begins a new chapter in education, travel, beliefs, or publishing. You may enroll in a program, plan a life-changing trip, start writing something significant, or have an experience that fundamentally shifts what you believe is possible.",
    eclipseLunar: "A lunar eclipse in your 9th house brings a crisis of meaning. A belief you've held crumbles. A mentor disappoints. A legal situation reaches its peak. Or a travel experience forces you to see your life from a distance — and you don't like the view.",
    examples: [
      "Enrolling in a degree program or certification that redirects your career",
      "A trip to another country that permanently changes how you see your own culture",
      "Leaving a religion or belief system that no longer fits",
      "Publishing something that puts your ideas into the world for the first time",
      "A legal case that forces you to define what you actually stand for"
    ],
    soulQuestion: "Are the beliefs I'm living by actually mine — or did I inherit them before I was old enough to question them?",
    dangerZone: "Resisting a 9th house eclipse means clinging to beliefs that no longer serve you because revising your worldview feels like losing your identity. You double down on dogma because uncertainty is unbearable.",
    axisTeaching: "The 3rd–9th axis is 'information vs. meaning.' When eclipses hit your 9th house, your communication style and daily thinking are also stirred — because new beliefs require new language."
  },
  10: {
    simpleExplanation: "The 10th house is your CAREER — what you're known for, your reputation, your biggest achievements. It's the 'I achieve' house.",
    deeperMeaning: "This house governs your public identity — the role you play in the wider world, your career trajectory, your relationship with authority (both being one and submitting to one), and your legacy. The 10th house is the mountain you're climbing. When eclipses activate it, they reveal whether you're climbing the right mountain — or whether you've been so focused on reaching the top that you forgot to check if the view is worth the climb.",
    eclipseSolar: "A solar eclipse in your 10th house begins a new professional chapter. A career change, a promotion, a public role, or a complete redirection of your ambition. The old professional identity is making way for a new one. What you're known for is about to change.",
    eclipseLunar: "A lunar eclipse in your 10th house brings your career or public reputation to a climax. A professional situation peaks — you're recognized, fired, promoted, or exposed. Your relationship with authority or ambition reaches its emotional crescendo.",
    examples: [
      "Getting promoted into a role that forces you to become someone new",
      "Being publicly recognized for work you've done privately for years",
      "Leaving a prestigious position because the prestige stopped being worth the cost",
      "A public failure that, in hindsight, redirected you toward your actual purpose",
      "Realizing you've been building your parent's dream career instead of your own"
    ],
    soulQuestion: "If I stripped away the title, the salary, and what other people think — would I still choose this path?",
    dangerZone: "Resisting a 10th house eclipse means protecting a professional identity that has become your entire identity. You define yourself by your achievements so completely that losing the role feels like losing yourself.",
    axisTeaching: "The 4th–10th axis is 'private life vs. public life.' When eclipses hit your 10th house, your home, family, and emotional foundation are also stirred — because your career choices shape your domestic reality, whether you acknowledge it or not."
  },
  11: {
    simpleExplanation: "The 11th house is your COMMUNITY — your friends, your groups, your hopes for the future. It's the 'I envision' house.",
    deeperMeaning: "This house governs your relationship with the collective — the groups you belong to, the friendships that shape your worldview, the causes you support, and your vision of the future. The 11th house is where personal identity meets collective belonging. When eclipses activate it, they disrupt your social ecosystem — revealing which friendships are real, which group affiliations serve you, and whether your hopes for the future are genuinely yours or socially inherited.",
    eclipseSolar: "A solar eclipse in your 11th house begins a new chapter in your social life, community involvement, or relationship with the future. You may join a new group, leave an old one, meet a friend who changes your trajectory, or fundamentally redefine what you're hoping for.",
    eclipseLunar: "A lunar eclipse in your 11th house brings a friendship or group dynamic to its emotional peak. A social circle outgrows you — or you outgrow it. A hope you've been holding is either realized or released. Your relationship with 'fitting in' reaches its breaking point.",
    examples: [
      "Leaving a friend group that required you to be smaller than you are",
      "Joining a community that finally reflects who you've become",
      "A friendship breakup that hurts as much as a romantic one",
      "Realizing your 'dreams for the future' are actually someone else's expectations",
      "Finding your people — the ones who don't need you to perform"
    ],
    soulQuestion: "Am I surrounded by people who see me — or people I've trained to see a version of me?",
    dangerZone: "Resisting an 11th house eclipse means staying in social groups where you fit but don't belong. You keep showing up to the party, laughing at the jokes, and going home feeling emptier than when you arrived.",
    axisTeaching: "The 5th–11th axis is 'personal joy vs. collective belonging.' When eclipses hit your 11th house, your creative life and personal pleasures are also stirred — because what you create in private needs a community to receive it."
  },
  12: {
    simpleExplanation: "The 12th house is the INVISIBLE world — your dreams, your fears, the parts of yourself you hide. It's the 'I surrender' house.",
    deeperMeaning: "This house governs everything that operates below conscious awareness — your subconscious patterns, your self-sabotage mechanisms, your spiritual life, your relationship with solitude, your hidden enemies (including the one inside you), and the things you do when nobody is watching. The 12th house is where the ego dissolves and something larger takes over. When eclipses activate it, the veil thins — and what's been running your life from behind the scenes steps into the light.",
    eclipseSolar: "A solar eclipse in your 12th house begins a new chapter in your inner life. A spiritual practice, a therapeutic journey, a retreat, or a period of deliberate solitude begins. The outer world gets quieter so the inner world can speak. Something is being prepared in the invisible realm that won't be visible until eclipses hit your 1st house.",
    eclipseLunar: "A lunar eclipse in your 12th house brings subconscious material to the surface with force. Dreams become vivid. Anxieties you've been managing break through. A secret is revealed — yours or someone else's. Something you've been carrying in silence demands acknowledgment.",
    examples: [
      "Starting meditation, therapy, or a spiritual practice that changes your relationship with yourself",
      "A period of isolation — chosen or forced — that turns out to be transformative",
      "A dream or synchronicity so vivid it changes your understanding of reality",
      "Discovering a self-sabotage pattern you've been running for decades without knowing",
      "Forgiving someone — not for them, but because carrying it was destroying you from the inside"
    ],
    soulQuestion: "What am I carrying in silence — and what would happen if I set it down?",
    dangerZone: "Resisting a 12th house eclipse means drowning out the inner voice with noise, busyness, and distraction. You fill every silence because what lives in the silence terrifies you. The danger is functioning perfectly while falling apart invisibly.",
    axisTeaching: "The 6th–12th axis is 'function vs. surrender.' When eclipses hit your 12th house, your daily routines and health habits are also stirred — because the invisible stress of the 12th house always shows up in the body eventually."
  }
};
