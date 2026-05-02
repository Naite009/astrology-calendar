/**
 * Hand-authored Parent ↔ Child interpretations.
 *
 * Lookup shape: PARENT_CHILD_INTERPRETATIONS[framingKey][aspectName]
 *   framingKey examples: "sun-moon", "mars-moon", "saturn-sun"
 *   aspectName: "conjunction" | "opposition" | "trine" | "square" | "sextile"
 *
 * Voice rules:
 *  - Behavior-first. "What the child feels", not "the child's archetypal wound".
 *  - Never pathologize the child.
 *  - "What helps" = a concrete parenting move, not a platitude.
 */

export interface ParentChildInterpretation {
  /** Used in essence headline (e.g. "calms", "ignites", "blueprints"). */
  essenceVerb: string;
  /** What the receiving person experiences, in body/behavior terms. */
  childExperience: string;
  /** What the giving person tends not to see about how they're landing. */
  parentBlindSpot: string;
  /** 2–4 concrete moves the giving person can make. */
  whatHelps: string[];
}

type Aspect = "conjunction" | "opposition" | "trine" | "square" | "sextile";

export const PARENT_CHILD_INTERPRETATIONS: Record<
  string,
  Partial<Record<Aspect, ParentChildInterpretation>>
> = {
  // ──────────────────────────────────────────────────────────────────
  // Sun → Moon  (parent's identity → child's emotional needs)
  // ──────────────────────────────────────────────────────────────────
  "sun-moon": {
    conjunction: {
      essenceVerb: "fuses with",
      childExperience:
        "Your child feels you the way they feel weather. Your mood is their mood before they know what they think. When you light up, they light up; when you go quiet, they go quiet inside.",
      parentBlindSpot:
        "You may not realize how much of their emotional baseline is downstream of yours. They're not 'sensitive' — they're tuned to your frequency.",
      whatHelps: [
        "Name your own state out loud before assuming theirs ('I'm tired today, that's not about you').",
        "Give them a private corner — physical or emotional — that isn't shaped by your energy.",
        "Watch for them mirroring your emotions instead of having their own.",
      ],
    },
    trine: {
      essenceVerb: "warms",
      childExperience:
        "They feel safe being themselves around you. Your presence reads as 'home base' to their nervous system. They borrow confidence from you without needing to ask.",
      parentBlindSpot:
        "Because the connection is easy, you may underestimate how much you're the emotional reference point. They may not push back even when they should.",
      whatHelps: [
        "Invite their actual opinion, especially when it differs from yours.",
        "Praise effort and quirks, not just achievements that look like you.",
      ],
    },
    sextile: {
      essenceVerb: "supports",
      childExperience:
        "When you show up, their internal weather steadies. Conversations with you tend to leave them feeling more like themselves, not less.",
      parentBlindSpot:
        "The flow is easy enough that you may forget to actively check in. Sextiles need a small nudge to activate.",
      whatHelps: [
        "Initiate one-on-one time on purpose — it won't happen by accident.",
      ],
    },
    square: {
      essenceVerb: "rubs against",
      childExperience:
        "Your way of being on top of things can feel like pressure to them. They love you and feel scrutinized at the same time. They may pull away when they actually want closeness.",
      parentBlindSpot:
        "Your default mode of expressing care reads as critique to their feeling-body, even when your words are kind.",
      whatHelps: [
        "Lead with curiosity ('how was that?') before strategy ('here's what to do').",
        "Apologize when your tone lands harder than you meant — they remember tone over content.",
        "Let them be in a different mood than you without needing to fix it.",
      ],
    },
    opposition: {
      essenceVerb: "mirrors and challenges",
      childExperience:
        "You see each other clearly — sometimes too clearly. They feel both deeply known and deeply pushed against. Your presence asks them to define themselves.",
      parentBlindSpot:
        "What feels like normal directness from you can feel like a referendum on who they are.",
      whatHelps: [
        "Take the long view: this is a lifetime relationship of mutual sharpening, not a problem to solve this year.",
        "When they push back hard, treat it as healthy individuation, not rejection.",
      ],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Sun → Sun  (identity overlap)
  // ──────────────────────────────────────────────────────────────────
  "sun-sun": {
    conjunction: {
      essenceVerb: "echoes",
      childExperience:
        "They are made of similar stuff. They will be told they're 'just like you' their whole life — sometimes as a compliment, sometimes as a cage.",
      parentBlindSpot:
        "It's tempting to assume they want what you wanted at their age. They may need permission to NOT be your replay.",
      whatHelps: [
        "Notice the small differences out loud — name them as good.",
        "Tell them about a time you took a different path than your own parent.",
      ],
    },
    square: {
      essenceVerb: "competes with",
      childExperience:
        "Two of the same kind of fire in one room. They feel you taking up the air they were going to use. Their identity tries to form against yours.",
      parentBlindSpot:
        "You may experience their pushback as disrespect when it's actually identity formation.",
      whatHelps: [
        "Carve out a domain that is theirs — a sport, an art, a friend group — that you don't try to optimize.",
      ],
    },
    trine: {
      essenceVerb: "mirrors",
      childExperience:
        "They see a version of themselves further down the road when they look at you. This is gift and pressure at once.",
      parentBlindSpot:
        "Easy resonance can blur where you end and they begin.",
      whatHelps: [
        "Ask what they want, not what you would want for them.",
      ],
    },
    opposition: {
      essenceVerb: "balances",
      childExperience:
        "You're cut from related cloth but face opposite directions. They feel completed and challenged by you in the same breath.",
      parentBlindSpot: "You may push them to choose your side of a polarity that's actually theirs to integrate.",
      whatHelps: ["Hold both sides; let them try on yours and theirs without verdict."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Moon → Sun  (parent's emotional landscape → child's identity)
  // ──────────────────────────────────────────────────────────────────
  "moon-sun": {
    conjunction: {
      essenceVerb: "shelters",
      childExperience:
        "Your emotional weather wraps around their sense of self like a blanket. When you're settled, they feel solid. When you're not, they feel less themselves.",
      parentBlindSpot:
        "They may take responsibility for keeping you okay before they know they're doing it.",
      whatHelps: [
        "Process your own hard feelings with another adult, not them.",
        "Tell them explicitly that your mood is your job, not theirs.",
      ],
    },
    square: {
      essenceVerb: "clouds",
      childExperience:
        "Your unspoken feelings reach them before your words do. They learn to scan you for weather and adjust themselves accordingly.",
      parentBlindSpot: "What you think you're hiding from them, they can already feel.",
      whatHelps: [
        "Name what's happening for you in a sentence ('I'm anxious about work, not you').",
        "Let them see you take care of your feelings; that teaches them theirs are okay too.",
      ],
    },
    trine: {
      essenceVerb: "warms",
      childExperience: "Your moods feel like home to them. They can come back to you without explaining themselves.",
      parentBlindSpot: "The ease can mean less explicit verbal connection.",
      whatHelps: ["Say the warm thing out loud sometimes, even when it's already felt."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Moon → Moon  (emotional rhythm match)
  // ──────────────────────────────────────────────────────────────────
  "moon-moon": {
    conjunction: {
      essenceVerb: "syncs with",
      childExperience: "You feel things on the same wavelength. Comfort is wordless between you.",
      parentBlindSpot: "Shared sensitivity can mean shared overwhelm — neither of you is regulating the other.",
      whatHelps: ["When you're both flooded, one of you needs to step out and reset first."],
    },
    square: {
      essenceVerb: "destabilizes",
      childExperience:
        "Your needs and theirs ask for opposite things at the same moment. They can feel like they're failing you for having a different feeling.",
      parentBlindSpot: "You may interpret their different feeling as them rejecting yours.",
      whatHelps: [
        "Validate the feeling before negotiating the response.",
        "Name out loud that two true feelings can exist at once.",
      ],
    },
    opposition: {
      essenceVerb: "complements",
      childExperience: "Where you need quiet, they need movement, or the reverse. You complete each other when you let it.",
      parentBlindSpot: "Their different rhythm is not wrong; it's the other half.",
      whatHelps: ["Build the day so each rhythm gets honored, not just the louder one."],
    },
    trine: {
      essenceVerb: "resonates with",
      childExperience: "Your home runs on a shared emotional current. Hard things metabolize faster between you.",
      parentBlindSpot: "Easy resonance can crowd out other voices in the family.",
      whatHelps: ["Make room for the family member who doesn't share your rhythm."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Ascendant → Sun  (your way of moving through the world → their identity)
  // ──────────────────────────────────────────────────────────────────
  "asc-sun": {
    conjunction: {
      essenceVerb: "shapes",
      childExperience:
        "How you walk into a room becomes the template for how they think a person is supposed to walk into a room. Your social style is their first language.",
      parentBlindSpot: "They may copy your style even when it doesn't fit them, because it's what they learned 'normal' looks like.",
      whatHelps: [
        "Show them other people's styles and frame them as also okay.",
        "Tell them when you faked it; they need to know the surface isn't the whole story.",
      ],
    },
    square: {
      essenceVerb: "presses on",
      childExperience: "Your manner reads to them as 'the way you have to be' — and it doesn't fit them. They feel wrong for not matching you.",
      parentBlindSpot: "Your social defaults are not universal. They may need a different one.",
      whatHelps: ["Let them be quieter, weirder, or louder than you in public without correcting it."],
    },
    trine: {
      essenceVerb: "models",
      childExperience: "They learn ease from watching you. Your manner is a gift they'll inherit naturally.",
      parentBlindSpot: "Easy modeling can skip over teaching them how — they just absorb.",
      whatHelps: ["Narrate why you do what you do sometimes; don't make them guess the source."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Mars → Moon  (your drive/anger → their nervous system)
  // ──────────────────────────────────────────────────────────────────
  "mars-moon": {
    conjunction: {
      essenceVerb: "ignites",
      childExperience:
        "Your urgency lands directly in their belly. When you're frustrated — even at traffic, at the email — their body braces. They learn early to track your tone before words.",
      parentBlindSpot:
        "What feels like normal venting to you is felt as a near-miss in their nervous system.",
      whatHelps: [
        "Name the target out loud ('I'm mad at the situation, not at you').",
        "Apologize for tone, not just content.",
        "Move your body before talking when you're activated.",
      ],
    },
    square: {
      essenceVerb: "startles",
      childExperience:
        "Your sharpness comes faster than they can process. They may freeze, fawn, or go quiet — and then carry the residue for hours.",
      parentBlindSpot:
        "You may experience the moment as 'over' the second you've moved on. They're still in it.",
      whatHelps: [
        "Slow your pace by half when you feel pressure rising.",
        "Let them have their reaction without interpreting it as drama.",
        "Re-enter softly later: 'That came out hard. You okay?'",
      ],
    },
    opposition: {
      essenceVerb: "pushes against",
      childExperience: "Your drive and their feelings face off across the table. They feel pulled to react against you, even when they agree.",
      parentBlindSpot: "You may misread their reactivity as defiance instead of self-protection.",
      whatHelps: ["Let them say no first; say yes second."],
    },
    trine: {
      essenceVerb: "energizes",
      childExperience: "Your drive feels motivating to them, not threatening. They borrow your fire and use it.",
      parentBlindSpot: "Don't assume the easy version means there's no impact — there's still impact, just well-tolerated.",
      whatHelps: ["Channel shared energy into a thing you do together (sport, build, project)."],
    },
    sextile: {
      essenceVerb: "stirs",
      childExperience: "Your push wakes something up in them in a friendly way.",
      parentBlindSpot: "Sextile = needs a little activation; without invitation it stays latent.",
      whatHelps: ["Invite them to act with you, not just watch."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Mercury → Moon  (your words → their feelings)
  // ──────────────────────────────────────────────────────────────────
  "mercury-moon": {
    conjunction: {
      essenceVerb: "soothes (or stirs)",
      childExperience:
        "Your words land directly in their emotional body. The right sentence from you can settle them faster than anyone else's. The wrong one can ring for days.",
      parentBlindSpot:
        "You may not realize that your throwaway comments are being archived as truths about them.",
      whatHelps: [
        "Slow down the casual remarks about appearance, intelligence, or 'always' / 'never'.",
        "Repair small word-wounds explicitly; don't assume they let it go.",
      ],
    },
    trine: {
      essenceVerb: "calms",
      childExperience: "Talking to you regulates them. Your tone is a steadier than they yet have on their own.",
      parentBlindSpot: "You may be the only adult who can talk them down — that's a gift and a workload.",
      whatHelps: ["Teach them, in words, what your tone is doing. So they can do it for themselves later."],
    },
    square: {
      essenceVerb: "miscues",
      childExperience: "Your words go past their feelings or land on a different feeling than the one you meant.",
      parentBlindSpot: "You're explaining when they need acknowledgment first.",
      whatHelps: [
        "Reflect the feeling back ('that sounds hard') BEFORE problem-solving.",
      ],
    },
    sextile: {
      essenceVerb: "connects with",
      childExperience: "Conversation with you lifts their mood gently.",
      parentBlindSpot: "Easy to under-use — needs initiation.",
      whatHelps: ["Make a no-agenda talking ritual: car ride, walk, dishes."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Saturn → Sun  (your authority/discipline → their identity)
  // ──────────────────────────────────────────────────────────────────
  "saturn-sun": {
    conjunction: {
      essenceVerb: "weights",
      childExperience:
        "You feel large to them in the way authority feels large. They want your approval more than they will admit, and your disappointment lands as heavy.",
      parentBlindSpot:
        "Standards you think you're holding lightly are felt by them as the bar.",
      whatHelps: [
        "Praise the effort, not just the outcome.",
        "Tell them when you're proud — out loud, by name.",
        "Watch for perfectionism showing up as a way they try to earn you.",
      ],
    },
    square: {
      essenceVerb: "limits",
      childExperience: "Your structure and their self-expression keep bumping. They feel you saying no to who they are without you saying it.",
      parentBlindSpot: "Your 'realism' lands as 'you don't believe in me.'",
      whatHelps: [
        "Lead with what's possible, then add the practical edge.",
        "Tell them about a time you took a risk that worked.",
      ],
    },
    opposition: {
      essenceVerb: "tests",
      childExperience: "Your authority and their selfhood line up across from each other. The relationship matures by you actually negotiating, not just deciding.",
      parentBlindSpot: "Treating them as the child past the age it serves.",
      whatHelps: ["Hand over decisions on a real timeline. Trust grows when you let go on purpose."],
    },
    trine: {
      essenceVerb: "anchors",
      childExperience: "Your steadiness gives them a spine to lean against. They take you as proof that adulthood is doable.",
      parentBlindSpot: "They may not say it, but they're modeling on you.",
      whatHelps: ["Show them how you handle your own setbacks; that's the lesson."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Saturn → Moon
  // ──────────────────────────────────────────────────────────────────
  "saturn-moon": {
    conjunction: {
      essenceVerb: "cools",
      childExperience:
        "Their feelings meet your steadiness, and steadiness can read as coldness when they're small. They may learn to hold feelings in to keep things even.",
      parentBlindSpot: "You may think you're modeling composure; they may be reading 'feelings aren't safe here.'",
      whatHelps: [
        "Welcome the feeling out loud ('big feelings allowed') before regulating it.",
        "Tell them when you're feeling something — even small things.",
      ],
    },
    square: {
      essenceVerb: "constrains",
      childExperience: "Their emotional bigness meets your structure and feels squeezed. They may stop bringing the feeling to you.",
      parentBlindSpot: "Your reasonable response can land as dismissal.",
      whatHelps: ["Drop the lesson; pick it up tomorrow. Tonight is just for being heard."],
    },
    trine: {
      essenceVerb: "steadies",
      childExperience: "Your reliability gives their emotions a container they trust.",
      parentBlindSpot: "Quiet competence can be invisible to them as care.",
      whatHelps: ["Name the care behind the structure occasionally."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Moon → Venus  (your moods → their sense of being lovable)
  // ──────────────────────────────────────────────────────────────────
  "moon-venus": {
    conjunction: {
      essenceVerb: "tunes",
      childExperience: "How you feel toward them becomes how they feel about being lovable. Your warmth is their first mirror for self-worth.",
      parentBlindSpot: "Withdrawn moods can be read as withdrawn love, even when you're just tired.",
      whatHelps: [
        "Reassure the relationship when you withdraw ('I need quiet — I love you').",
        "Catch them being themselves and like that out loud.",
      ],
    },
    trine: {
      essenceVerb: "blesses",
      childExperience: "Affection flows easily. They learn that love is allowed to feel good.",
      parentBlindSpot: "Easy = under-named.",
      whatHelps: ["Say the affectionate thing out loud sometimes."],
    },
    square: {
      essenceVerb: "confuses",
      childExperience: "Your moods and their need for affection don't always meet at the same hour. They may chase or pull away.",
      parentBlindSpot: "You may not register that they're tracking your availability.",
      whatHelps: ["Make a small ritual of connection that doesn't depend on your mood (bedtime line, weekly outing)."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Venus → Moon  (your love-style → their nervous system)
  // ──────────────────────────────────────────────────────────────────
  "venus-moon": {
    conjunction: {
      essenceVerb: "softens",
      childExperience: "The way you express affection settles them at the body level. They feel chosen.",
      parentBlindSpot: "Your love language may not be theirs; check that the form is landing.",
      whatHelps: ["Ask, occasionally, 'what makes you feel most loved?' and remember the answer."],
    },
    trine: {
      essenceVerb: "delights",
      childExperience: "You're easy to be around and easy to love. They take pleasure in your company.",
      parentBlindSpot: "Pleasantness can mask that they still need depth from you.",
      whatHelps: ["Don't only give the easy stuff; show up for the hard stuff with the same warmth."],
    },
    square: {
      essenceVerb: "mismatches",
      childExperience: "Your way of giving affection and their way of receiving it cross wires.",
      parentBlindSpot: "Your favorite gesture may be their least-felt one.",
      whatHelps: ["Switch love languages on purpose for a week and watch what they respond to."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Jupiter → Sun  (your generosity → their identity)
  // ──────────────────────────────────────────────────────────────────
  "jupiter-sun": {
    conjunction: {
      essenceVerb: "expands",
      childExperience: "You make them feel bigger than they are. Your belief in them becomes a real-world resource.",
      parentBlindSpot: "Big optimism can override real concerns. They may not feel allowed to be small around you.",
      whatHelps: [
        "Pair encouragement with realistic check-ins ('I believe in you AND that test is hard').",
        "Make space for them to fail without losing your faith.",
      ],
    },
    trine: {
      essenceVerb: "blesses",
      childExperience: "Doors open around you and they stand in the slipstream.",
      parentBlindSpot: "Easy luck can mean they don't learn the muscle of pushing through.",
      whatHelps: ["Let them struggle with small things to build the muscle."],
    },
    square: {
      essenceVerb: "overshoots",
      childExperience: "Your big plans for them can feel like more than they are.",
      parentBlindSpot: "Your enthusiasm sometimes lands as pressure.",
      whatHelps: ["Match their actual scale; expand only when invited."],
    },
    sextile: {
      essenceVerb: "encourages",
      childExperience: "When you're around, they feel a little more possible.",
      parentBlindSpot: "Needs activation — won't trigger by itself.",
      whatHelps: ["Be the one who suggests the big idea out loud."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Pluto → Sun / Moon  (intensity → identity / nervous system)
  // ──────────────────────────────────────────────────────────────────
  "pluto-sun": {
    conjunction: {
      essenceVerb: "intensifies",
      childExperience: "You feel huge to them. They may form themselves both with you and against you. Power is the unspoken theme.",
      parentBlindSpot: "Control you don't think you're exerting is still being felt.",
      whatHelps: [
        "Hand them real power over real decisions, age-appropriate, on purpose.",
        "Watch for them shrinking themselves to keep peace.",
      ],
    },
    square: {
      essenceVerb: "pressurizes",
      childExperience: "Power struggles get personal fast. They feel unmade and remade by your reactions.",
      parentBlindSpot: "Your intensity 'about something else' still lands on them.",
      whatHelps: ["Name when you're intense and that it's not theirs to fix."],
    },
    trine: {
      essenceVerb: "deepens",
      childExperience: "You can talk about real things together. They feel met at depth.",
      parentBlindSpot: "Don't only meet them in heavy places — also be light.",
      whatHelps: ["Make room for play, not only depth."],
    },
  },
  "pluto-moon": {
    conjunction: {
      essenceVerb: "magnifies",
      childExperience: "Their feelings feel huge in your presence — yours amplify theirs. Closeness can feel consuming.",
      parentBlindSpot: "What feels like normal closeness to you can flood them.",
      whatHelps: [
        "Give them physical and emotional space without making it a punishment.",
        "Don't process your own intensity at them.",
      ],
    },
    square: {
      essenceVerb: "destabilizes",
      childExperience: "Your moods and theirs spiral together. They may not know where you end and they begin.",
      parentBlindSpot: "Your 'I'm fine' lands as 'something is very wrong.'",
      whatHelps: ["Be honest in plain words; ambiguity is louder than the truth."],
    },
    trine: {
      essenceVerb: "grounds",
      childExperience: "Even hard feelings feel survivable around you. You don't flinch.",
      parentBlindSpot: "Your steadiness with depth is rarer than you think — they need you to teach them how.",
      whatHelps: ["Show them how YOU process intense feelings."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Neptune → Sun / Moon  (idealization & merging)
  // ──────────────────────────────────────────────────────────────────
  "neptune-sun": {
    conjunction: {
      essenceVerb: "idealizes",
      childExperience: "They may feel both seen-as-special and unseen-as-themselves. The image of them is strong; the reality is harder for them to feel.",
      parentBlindSpot: "Your projection of who they are can be louder than who they actually are.",
      whatHelps: ["Notice the actual person in front of you; describe them, don't imagine them."],
    },
    square: {
      essenceVerb: "blurs",
      childExperience: "It's hard for them to know what you actually want from them. They may invent a version to match.",
      parentBlindSpot: "Vague guidance feels supportive to you and unmoored to them.",
      whatHelps: ["Be specific. 'I want you to take a 20-minute walk' beats 'try to take care of yourself.'"],
    },
    trine: {
      essenceVerb: "inspires",
      childExperience: "You add a magic to their sense of self. They feel believed-in at a soul level.",
      parentBlindSpot: "Magic alone doesn't pay rent — also help them with the practical.",
      whatHelps: ["Pair belief with concrete next steps."],
    },
  },
  "neptune-moon": {
    conjunction: {
      essenceVerb: "merges",
      childExperience: "They feel you the way they feel weather. Your unspoken state is loud in their body.",
      parentBlindSpot: "Your 'just a hard day' can become their day.",
      whatHelps: ["Process your hard feelings with another adult before they reach the family room."],
    },
    square: {
      essenceVerb: "fogs",
      childExperience: "They can't get a clear read on you, so they over-read tiny signals.",
      parentBlindSpot: "Saying 'nothing's wrong' when something's wrong is louder than telling them what's wrong.",
      whatHelps: ["Name what's happening even in vague terms; ambiguity is worse than the truth."],
    },
    trine: {
      essenceVerb: "softens",
      childExperience: "Around you, they can dream and rest.",
      parentBlindSpot: "Don't only meet them in the dreamy place; structure also.",
      whatHelps: ["Provide rhythm and routine alongside the softness."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Chiron → Sun / Moon  (inherited wound spots)
  // ──────────────────────────────────────────────────────────────────
  "chiron-sun": {
    conjunction: {
      essenceVerb: "echoes a wound through",
      childExperience: "Where you were hurt about being seen, they may feel unseen in the same exact place — without anyone meaning it.",
      parentBlindSpot: "You may project your old hurt onto situations that aren't actually wounding them.",
      whatHelps: [
        "Notice when your reaction is bigger than the moment — it's probably old material.",
        "Tell them, age-appropriately, that some of what comes up for you isn't about them.",
      ],
    },
    square: {
      essenceVerb: "snags on",
      childExperience: "Their natural way of being touches your sore spot, and they feel the recoil they didn't cause.",
      parentBlindSpot: "Your flinch is real. Their shining is also real. Both can be true.",
      whatHelps: ["Get support for your own version of that wound, separately from them."],
    },
    trine: {
      essenceVerb: "heals through",
      childExperience: "You give them a way to be themselves that you didn't have.",
      parentBlindSpot: "This is the lineage healing. Notice it.",
      whatHelps: ["Tell them, when they're ready, what you didn't get that you're giving them."],
    },
  },
  "chiron-moon": {
    conjunction: {
      essenceVerb: "touches the tender place in",
      childExperience: "Their feelings activate yours in a sensitive way. Comfort can be hard to give because the same place hurts in you.",
      parentBlindSpot: "You may withdraw exactly when they need you closest, because their feeling is too much like yours.",
      whatHelps: [
        "Stay even if you can't fix it. Presence beats solution.",
        "Process your version of the feeling separately, with another adult.",
      ],
    },
    square: {
      essenceVerb: "rubs",
      childExperience: "Their emotional needs press right where you've been hurt — they don't know they're doing it.",
      parentBlindSpot: "Their request feels bigger than it is because of your history.",
      whatHelps: ["Pause; ask whether the feeling you're having is from now or from before."],
    },
    trine: {
      essenceVerb: "tends",
      childExperience: "You know how to be tender exactly where they need it.",
      parentBlindSpot: "You probably learned this the hard way; it's a real gift.",
      whatHelps: ["Trust your instinct here."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // North Node → Sun / Moon  (purpose pulls)
  // ──────────────────────────────────────────────────────────────────
  "node-sun": {
    conjunction: {
      essenceVerb: "calls forward",
      childExperience: "Being around you points them toward who they're becoming. You're a destiny-marker for them, not just a parent.",
      parentBlindSpot: "Don't decide what their direction is — be the doorway, not the road.",
      whatHelps: ["Show them many doors; don't only point to yours."],
    },
    trine: {
      essenceVerb: "guides",
      childExperience: "Your direction and theirs run alongside; you make their growth easier.",
      parentBlindSpot: "Easy alignment doesn't mean automatic — invite the conversation.",
      whatHelps: ["Have explicit conversations about what they want."],
    },
  },
  "node-moon": {
    conjunction: {
      essenceVerb: "homes",
      childExperience: "You feel like soul-family to them. Being near you feels like being on the right path.",
      parentBlindSpot: "This depth of connection has its own weight.",
      whatHelps: ["Honor the bond without making it the only home they know."],
    },
    trine: {
      essenceVerb: "supports",
      childExperience: "Their emotional growth gets a tailwind from you.",
      parentBlindSpot: "Don't underestimate how much steady warmth shapes purpose.",
      whatHelps: ["Keep showing up; consistency IS the gift."],
    },
  },

  // ──────────────────────────────────────────────────────────────────
  // Mercury ↔ Mercury  (sibling-only framing for shared style of mind)
  // ──────────────────────────────────────────────────────────────────
  "mercury-mercury": {
    conjunction: {
      essenceVerb: "thinks alongside",
      childExperience: "You speak each other's language without translating. Conversations move fast and the inside jokes are deep.",
      parentBlindSpot: "Easy fluency can mean less curiosity about each other's actual differences.",
      whatHelps: ["Ask each other real questions, not just shorthand ones."],
    },
    square: {
      essenceVerb: "talks past",
      childExperience: "You both want to be heard at the same time. Conversations escalate fast and resolve slow.",
      parentBlindSpot: "Same speed, opposite tracks.",
      whatHelps: ["Slow down; reflect what you heard before answering."],
    },
    trine: {
      essenceVerb: "syncs with",
      childExperience: "You think together. Brainstorms are productive; problem-solving is collaborative.",
      parentBlindSpot: "Easy thinking-together can stop you from challenging each other.",
      whatHelps: ["Push back on each other's ideas on purpose."],
    },
  },
};
