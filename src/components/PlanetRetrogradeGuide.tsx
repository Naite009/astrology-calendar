import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Search, ChevronDown, Check } from "lucide-react";
import type { NatalChart } from "@/hooks/useNatalChart";
import { normalizeName } from "@/lib/nameMatching";
import { getRetrogradePeriodsForYear, getRetrogradeStatus, type RetrogradeInfo } from "@/lib/retrogradePatterns";
import * as Astronomy from "astronomy-engine";
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from "lucide-react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface PlanetRetrogradeGuideProps {
  planet: string;
  allCharts: NatalChart[];
  primaryUserName?: string;
}

// ─── TYPES & DATA ───────────────────────────────────────────────────────────

type DignityEntry = {
  sign: string;
  title: string;
  feltSense: string;
  psychology: string;
  gifts: string[];
  challenges: string[];
  bodyFeeling: string;
};

type DignityTeaching = {
  intro: string;
  analogy: string;
  domicile: DignityEntry[];
  exaltation: DignityEntry[];
  detriment: DignityEntry[];
  fall: DignityEntry[];
};

const SIGN_ORDER = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"] as const;

const PLANET_BODIES: Record<string, Astronomy.Body> = {
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

const PLANET_GLYPHS: Record<string, string> = {
  Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄",
  Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

const PLANET_COLORS: Record<string, { gradient: string; border: string; accent: string }> = {
  Venus: { gradient: "from-pink-950 via-rose-950/50 to-pink-950", border: "border-pink-500/40", accent: "text-pink-300" },
  Mars: { gradient: "from-red-950 via-orange-950/50 to-red-950", border: "border-red-500/40", accent: "text-red-300" },
  Jupiter: { gradient: "from-purple-950 via-violet-950/50 to-purple-950", border: "border-purple-500/40", accent: "text-purple-300" },
  Saturn: { gradient: "from-stone-950 via-slate-950/50 to-stone-950", border: "border-stone-500/40", accent: "text-stone-300" },
  Uranus: { gradient: "from-cyan-950 via-teal-950/50 to-cyan-950", border: "border-cyan-500/40", accent: "text-cyan-300" },
  Neptune: { gradient: "from-blue-950 via-indigo-950/50 to-blue-950", border: "border-blue-500/40", accent: "text-blue-300" },
  Pluto: { gradient: "from-slate-950 via-zinc-950/50 to-slate-950", border: "border-zinc-500/40", accent: "text-zinc-300" },
};

const PLANET_INFO: Record<string, {
  who: string;
  frequency: string;
  duration: string;
  themes: string[];
  keywords: string[];
  dignity: { domicile: string; exaltation: string; detriment: string; fall: string };
  dignityTeaching?: DignityTeaching;
  doList: string[];
  dontList: string[];
  signMeanings: Record<string, string>;
}> = {
  Venus: {
    who: "Venus is the goddess of love, beauty, values, and pleasure. She governs how we relate, what we find beautiful, how we handle money, and what brings us joy. Venus shows your love language, your aesthetic, and your relationship to self-worth. When Venus retrogrades, our values undergo review — old lovers may return, financial decisions need reassessment, and what we once found beautiful may lose its luster.",
    frequency: "Venus retrogrades approximately every 18 months, making it one of the rarest personal planet retrogrades. Each retrograde lasts about 40 days.",
    duration: "~40 days retrograde, with pre and post-shadow extending the cycle to roughly 3-4 months total.",
    themes: ["Past relationships and lovers returning", "Reassessing values and self-worth", "Financial review and budget restructuring", "Beauty and aesthetic changes", "Questioning what truly brings pleasure", "Reconciliation or final closure in relationships"],
    keywords: ["Love", "Beauty", "Values", "Money", "Relationships", "Pleasure", "Harmony", "Art", "Self-Worth", "Attraction", "Femininity", "Diplomacy", "Sensuality", "Comfort"],
    dignity: { domicile: "Taurus · Libra", exaltation: "Pisces", detriment: "Scorpio · Aries", fall: "Virgo" },
    doList: ["Reflect on what and who you truly value", "Revisit creative projects with fresh eyes", "Reconnect with old friends (carefully with exes)", "Review your budget and financial habits", "Explore what beauty means to you now", "Practice radical self-love and self-worth"],
    dontList: ["Start new romantic relationships", "Get cosmetic procedures or drastic style changes", "Make major purchases (especially luxury items)", "Sign financial contracts if avoidable", "Ignore recurring relationship patterns"],
    signMeanings: {
      Aries: "Venus retrograde in Aries: Reassessing passion, independence in relationships, and how you assert your desires. Do you fight for what you love?",
      Taurus: "Venus retrograde in Taurus (domicile): Deep review of comfort, security, and sensual pleasures. What do you truly need to feel safe and loved?",
      Gemini: "Venus retrograde in Gemini: Communication in relationships under review. Reconnecting through words, letters, and conversations.",
      Cancer: "Venus retrograde in Cancer: Emotional security in love. Family relationships and nurturing patterns revisited.",
      Leo: "Venus retrograde in Leo: Romance, creativity, and self-expression in love reviewed. Past creative flames reignite.",
      Virgo: "Venus retrograde in Virgo (fall): Love becomes analytical. Critiquing relationships can heal or harm — choose wisely.",
      Libra: "Venus retrograde in Libra (domicile): Partnerships undergo deep review. Balance, fairness, and commitment questioned.",
      Scorpio: "Venus retrograde in Scorpio (detriment): Intense emotional reckoning in love. Jealousy, trust, and power dynamics surface.",
      Sagittarius: "Venus retrograde in Sagittarius: Freedom vs. commitment tension. Cross-cultural relationships and philosophical values reassessed.",
      Capricorn: "Venus retrograde in Capricorn: Love meets ambition. Professional relationships and status in partnerships reviewed.",
      Aquarius: "Venus retrograde in Aquarius: Unconventional relationships reviewed. Friendship vs. romance boundaries blur.",
      Pisces: "Venus retrograde in Pisces (exaltation): Transcendent love. Spiritual connections return. Idealism in love peaks and may shatter beautifully.",
    },
  },
  Mars: {
    who: "Mars is the warrior — the planet of action, drive, desire, anger, and physical vitality. Mars governs how you assert yourself, fight for what you want, and express your sexual energy. When Mars retrogrades, the engine of action goes into review mode. Energy levels drop, anger may simmer beneath the surface, and past conflicts resurface for resolution. This is NOT the time to start wars — it's the time to understand why you fight.",
    frequency: "Mars retrogrades approximately every 2 years and 2 months, lasting about 2.5 months — making it relatively rare.",
    duration: "~70-80 days retrograde, with pre and post-shadow extending the total cycle to roughly 6-7 months.",
    themes: ["Energy levels fluctuating dramatically", "Past conflicts and anger resurfacing", "Reassessing how you assert yourself", "Sexual desire patterns shifting", "Physical health and exercise review", "Delayed or stalled projects"],
    keywords: ["Action", "Drive", "Anger", "Desire", "Courage", "Competition", "Physical Energy", "Sexuality", "Assertiveness", "Warrior", "Conflict", "Initiative", "Muscle", "Heat"],
    dignity: { domicile: "Taurus · Libra", exaltation: "Pisces", detriment: "Scorpio · Aries", fall: "Virgo" },
    dignityTeaching: {
      intro: "Every planet has signs where it feels at home, signs where it's honored as a guest, and signs where it struggles. Understanding WHERE Venus is when she retrogrades tells you everything about HOW that retrograde will feel. Venus has TWO home signs — Taurus and Libra — because she expresses two sides of love: the sensual-material (Taurus) and the relational-aesthetic (Libra). This means she also has TWO detriment signs — Scorpio and Aries — where her energy is most challenged.",
      analogy: "Think of Venus like a master chef. In Taurus, she's cooking in her own beautiful kitchen with the finest ingredients — everything is tactile, slow, sensual, and exactly to her taste. In Libra, she's hosting an elegant dinner party — the setting is gorgeous, the conversation flows, everyone feels seen and valued. In Scorpio (detriment), she's been locked in an underground bunker and told the food might be poisoned — she has to eat, but trust is gone, and every bite carries intensity. In Aries (detriment), someone's set a timer and told her to cook a meal in 3 minutes while people yell at her — there's no time for beauty, only urgency. In Pisces (exaltation), she's cooking a meal that makes people weep with joy — it's transcendent, beyond technique. In Virgo (fall), she's been handed a clipboard and told to grade each dish on a 47-point rubric — the magic is replaced by criticism.",
      domicile: [
        {
          sign: "Taurus",
          title: "Venus in Taurus — The Sensual Home",
          feltSense: "This feels like sinking into a warm bath with candles lit and nowhere to be. Your body relaxes. Time slows. You want to touch things — soft fabrics, warm skin, good food. There's a deep, almost animal contentment. You know what you like, and you're not apologizing for wanting it.",
          psychology: "Venus in Taurus is Venus at her most embodied. This is the love that shows up as acts of service — cooking for someone, buying them the perfect gift, creating a beautiful physical environment. Self-worth here is tied to the physical senses: 'I deserve comfort, pleasure, and security.' When retrograde here, Venus asks: what do I truly need to feel safe? What luxuries are genuine nourishment vs. numbing?",
          gifts: ["Unwavering loyalty once committed", "Natural aesthetic sense — beauty through simplicity", "Deep capacity for physical pleasure and presence", "Stabilizing effect on everyone around them", "Ability to build lasting material security"],
          challenges: ["Possessiveness — 'what I love, I own'", "Resistance to change even when change is needed", "Equating love with material provision", "Stubbornness disguised as consistency"],
          bodyFeeling: "You feel Venus-in-Taurus energy in your throat (Taurus rules the throat), in the relaxation of your shoulders, and in a grounded heaviness in your pelvis and legs. It's the opposite of anxiety. When this energy is blocked, you might clench your jaw or feel a lump in your throat."
        },
        {
          sign: "Libra",
          title: "Venus in Libra — The Relational Home",
          feltSense: "This feels like walking into a beautifully designed room where everything is in perfect proportion. There's an immediate ease in social settings. You notice colors, symmetry, the way light falls. You want connection — not the deep-dive intensity of Scorpio, but the graceful dance of two people finding harmony together. Conversations feel like art.",
          psychology: "Venus in Libra is Venus at her most relational. This is the love that expresses through partnership, diplomacy, and creating beauty together. Self-worth here is tied to relationships: 'I know who I am through how I relate.' This isn't codependence — it's the genuine human need for mirroring. When retrograde here, Venus asks: are my relationships balanced? Am I giving too much? Am I being seen as I truly am, or as I perform?",
          gifts: ["Natural diplomacy and conflict resolution", "Refined aesthetic taste — art, design, fashion", "Ability to see all sides of a situation", "Creating harmony in any environment", "Deep understanding of fairness and justice"],
          challenges: ["People-pleasing at the cost of authenticity", "Indecisiveness from seeing too many perspectives", "Avoiding necessary conflict to maintain peace", "Defining self through relationships rather than from within"],
          bodyFeeling: "You feel Venus-in-Libra energy in your lower back and kidneys (Libra's body parts), and in a lightness in your chest — an openness to connection. When balanced, there's an ease in your posture, an openness in your face. When imbalanced, you might feel lower back tension from carrying others' emotional weight, or a fluttery anxiety about whether people like you."
        },
      ],
      exaltation: [
        {
          sign: "Pisces",
          title: "Venus in Pisces — The Exaltation: Transcendent Love",
          feltSense: "This feels like falling in love with the entire universe. Boundaries between self and other dissolve — not in a scary way, but in a 'we're all connected' way. Music makes you cry. Art moves you to your core. You see beauty in broken things. Love feels like a spiritual experience, not just an emotion. There's a tender openness that can be breathtaking.",
          psychology: "Venus is exalted in Pisces because love reaches its highest spiritual expression here. This is unconditional love — love without transaction, without keeping score, without needing anything back. It's the love of the mystic, the artist, the healer. Self-worth here comes from connection to something larger: 'I am worthy because I am part of the whole.' When retrograde here, Venus asks: have I been loving from a place of genuine compassion, or from a need to be needed? Is my idealism about love protecting me from seeing reality?",
          gifts: ["Capacity for unconditional, selfless love", "Extraordinary artistic and creative sensitivity", "Deep empathy — feeling what others feel", "Ability to see the divine in imperfect people", "Natural healing presence"],
          challenges: ["Idealization of partners — falling in love with potential, not reality", "Boundary dissolution — losing yourself in relationships", "Martyrdom — sacrificing too much in the name of love", "Escapism through romance, fantasy, or substances", "Difficulty with practical aspects of relationships (money, logistics)"],
          bodyFeeling: "You feel Venus-in-Pisces energy in your feet (Pisces rules the feet) and in a softening throughout your entire body. There's a dreamy quality — like your edges are blurring. Tears come easily, not from sadness but from being moved. When imbalanced, you might feel physically drained after absorbing others' emotions, or a foggy dissociation."
        },
      ],
      detriment: [
        {
          sign: "Scorpio",
          title: "Venus in Scorpio — The Detriment: Love as Transformation",
          feltSense: "This feels like being pulled underwater. Love isn't light and pretty here — it's intense, consuming, and transformative. You want to merge completely or not at all. There's a magnetic pull toward people and experiences that most would find too intense. You can feel jealousy like a physical sensation — a tightening in the gut, a heat in the chest. Trust is everything, and once broken, it's nearly impossible to rebuild.",
          psychology: "Venus is in detriment in Scorpio because Scorpio is opposite Taurus — Venus's earthy, stable home. Instead of Taurus's 'I enjoy what I have,' Scorpio demands 'I must have ALL of you, or nothing.' This isn't dysfunction — it's Venus forced to operate through the lens of depth, power, and psychological truth. Love here is a crucible. Relationships either transform you or destroy you. Self-worth is tied to emotional power: 'I am worthy if I can hold this intensity.' When retrograde here, Venus asks: where am I using love as a weapon? Where am I confusing control with care? What would it mean to love without needing to possess?",
          gifts: ["Profound emotional depth and loyalty", "Ability to love through the darkest moments", "Seeing through pretense — detecting lies instantly", "Sexual and emotional magnetism", "Capacity for genuine transformation through love"],
          challenges: ["Possessiveness and jealousy as default settings", "All-or-nothing relationship patterns", "Using emotional intensity to control partners", "Difficulty with vulnerability — armoring up", "Confusing pain with passion"],
          bodyFeeling: "You feel Venus-in-Scorpio energy in your reproductive organs and lower belly — a deep, primal pull. There's often a tightness in the solar plexus, like guarding something precious. The body runs hot. When triggered, you might feel a surge of adrenaline, a clenching of the fists, or a sensation of being 'seen through' that's both thrilling and terrifying."
        },
        {
          sign: "Aries",
          title: "Venus in Aries — The Detriment: Love as Conquest",
          feltSense: "This feels like a fire igniting. Love arrives suddenly, intensely, and demands immediate action. You don't fall in love — you crash into it. There's an impatience with subtlety, with the slow dance of courtship. You want what you want NOW. The chase is intoxicating, but once caught, the excitement can fade. There's a rawness here — love stripped of pretense, diplomacy, and sometimes tact.",
          psychology: "Venus is in detriment in Aries because Aries is opposite Libra — Venus's relational home. Instead of Libra's 'we find beauty together,' Aries declares 'I want what I want, and I want it now.' This isn't selfish — it's Venus forced to operate through the lens of individual desire rather than partnership. The gift is radical honesty. The danger is treating love as a competition you need to win. Self-worth is tied to being desired: 'I am worthy if someone wants me.' When retrograde here, Venus asks: do I pursue love, or do I pursue the thrill of pursuit? Can I stay when the chase is over?",
          gifts: ["Fearless in love — willing to make the first move", "Passionate, exciting, never boring", "Honesty about desires — no games", "Bravery to love again after heartbreak", "Infectious enthusiasm that draws people in"],
          challenges: ["Boredom once the initial excitement fades", "Selfishness in relationships — 'my needs first'", "Impulsive romantic decisions", "Difficulty with compromise and patience", "Confusing infatuation with lasting love"],
          bodyFeeling: "You feel Venus-in-Aries energy in your head and face (Aries rules the head) — flushed cheeks, racing thoughts about the object of desire. There's a forward-leaning urgency in the body, like you're about to sprint. Heart rate increases. When imbalanced, it can manifest as headaches from frustration or a restless inability to sit still."
        },
      ],
      fall: [
        {
          sign: "Virgo",
          title: "Venus in Virgo — The Fall: Love Under the Microscope",
          feltSense: "This feels like someone handed you a magnifying glass and pointed it at your relationship. Every flaw is visible. Every imperfection bothers you — in your partner and in yourself. There's an anxious quality: 'Am I good enough? Are they good enough? Is this relationship good enough?' Love becomes a project to optimize rather than an experience to surrender to. But there's also something beautiful here — a devotion that shows up through acts of service, through noticing the small things, through trying to make everything better.",
          psychology: "Venus is in fall in Virgo because Virgo is opposite Pisces — where Venus is exalted in unconditional, boundary-dissolving love. Instead of Pisces's 'I love you as you are,' Virgo says 'I love you, but here are 17 things you could improve.' This isn't cruelty — it's Venus forced to operate through the lens of discernment and analysis. Love becomes practical, grounded, and sometimes painfully honest. Self-worth is tied to usefulness: 'I am worthy if I am helpful, productive, perfect.' When retrograde here, Venus asks: where has my critical eye destroyed what was beautiful? Can I accept imperfection — in love, in my body, in myself?",
          gifts: ["Devotion expressed through acts of service", "Noticing and remembering the small details that matter", "Helping loved ones become their best selves", "Practical love — showing up reliably, consistently", "Health-conscious approach to self-care as self-love"],
          challenges: ["Chronic self-criticism destroying self-worth", "Criticizing partners instead of accepting them", "Analysis paralysis in romantic decisions", "Difficulty receiving love — 'I don't deserve this'", "Reducing love to a checklist of behaviors"],
          bodyFeeling: "You feel Venus-in-Virgo energy in your digestive system and gut (Virgo rules the intestines). Anxiety about love manifests as stomach tension, digestive issues, or nervous energy. There's a quality of 'holding in' — containing emotions behind a composed exterior. When balanced, it feels like the quiet satisfaction of a perfectly organized space."
        },
      ],
    },
    doList: ["Reflect on what and who you truly value", "Revisit creative projects with fresh eyes", "Reconnect with old friends (carefully with exes)", "Review your budget and financial habits", "Explore what beauty means to you now", "Practice radical self-love and self-worth"],
    dontList: ["Start new romantic relationships", "Get cosmetic procedures or drastic style changes", "Make major purchases (especially luxury items)", "Sign financial contracts if avoidable", "Ignore recurring relationship patterns"],
    signMeanings: {
      Aries: "Venus retrograde in Aries: Reassessing passion, independence in relationships, and how you assert your desires. Do you fight for what you love?",
      Taurus: "Venus retrograde in Taurus (domicile): Deep review of comfort, security, and sensual pleasures. What do you truly need to feel safe and loved?",
      Gemini: "Venus retrograde in Gemini: Communication in relationships under review. Reconnecting through words, letters, and conversations.",
      Cancer: "Venus retrograde in Cancer: Emotional security in love. Family relationships and nurturing patterns revisited.",
      Leo: "Venus retrograde in Leo: Romance, creativity, and self-expression in love reviewed. Past creative flames reignite.",
      Virgo: "Venus retrograde in Virgo (fall): Love becomes analytical. Critiquing relationships can heal or harm — choose wisely.",
      Libra: "Venus retrograde in Libra (domicile): Partnerships undergo deep review. Balance, fairness, and commitment questioned.",
      Scorpio: "Venus retrograde in Scorpio (detriment): Intense emotional reckoning in love. Jealousy, trust, and power dynamics surface.",
      Sagittarius: "Venus retrograde in Sagittarius: Freedom vs. commitment tension. Cross-cultural relationships and philosophical values reassessed.",
      Capricorn: "Venus retrograde in Capricorn: Love meets ambition. Professional relationships and status in partnerships reviewed.",
      Aquarius: "Venus retrograde in Aquarius: Unconventional relationships reviewed. Friendship vs. romance boundaries blur.",
      Pisces: "Venus retrograde in Pisces (exaltation): Transcendent love. Spiritual connections return. Idealism in love peaks and may shatter beautifully.",
    },
  },
  Mars: {
    who: "Mars is the warrior — the planet of action, drive, desire, anger, and physical vitality. Mars governs how you assert yourself, fight for what you want, and express your sexual energy. When Mars retrogrades, the engine of action goes into review mode. Energy levels drop, anger may simmer beneath the surface, and past conflicts resurface for resolution. This is NOT the time to start wars — it's the time to understand why you fight.",
    frequency: "Mars retrogrades approximately every 2 years and 2 months, lasting about 2.5 months — making it relatively rare.",
    duration: "~70-80 days retrograde, with pre and post-shadow extending the total cycle to roughly 6-7 months.",
    themes: ["Energy levels fluctuating dramatically", "Past conflicts and anger resurfacing", "Reassessing how you assert yourself", "Sexual desire patterns shifting", "Physical health and exercise review", "Delayed or stalled projects"],
    keywords: ["Action", "Drive", "Anger", "Desire", "Courage", "Competition", "Physical Energy", "Sexuality", "Assertiveness", "Warrior", "Conflict", "Initiative", "Muscle", "Heat"],
    dignity: { domicile: "Aries · Scorpio", exaltation: "Capricorn", detriment: "Libra · Taurus", fall: "Cancer" },
    dignityTeaching: {
      intro: "Mars has TWO home signs — Aries and Scorpio — because he fights in two ways: the direct charge (Aries) and the strategic ambush (Scorpio). This means he has TWO detriment signs — Libra and Taurus — where his aggressive, action-oriented energy is most frustrated.",
      analogy: "Think of Mars like a soldier. In Aries, he's charging into battle with a war cry — direct, fearless, unstoppable. In Scorpio, he's the special ops agent — silent, strategic, lethal in the shadows. In Libra (detriment), someone's asked him to negotiate a peace treaty instead of fighting — he knows how, but it feels like wearing a suit two sizes too small. In Taurus (detriment), he's been told to dig a trench and wait — his muscles ache to move, but the ground won't budge. In Capricorn (exaltation), he's been promoted to general — strategic, disciplined, commanding. In Cancer (fall), he's been told to fight while holding a baby — every aggressive instinct conflicts with the need to protect.",
      domicile: [
        {
          sign: "Aries",
          title: "Mars in Aries — The Warrior at Home",
          feltSense: "Pure adrenaline. You feel it as a surge of heat through your body — a readiness to act, to move, to START. Sitting still feels physically uncomfortable. There's a clarity that comes from impulse: you know what you want before you can explain it. It's the feeling of sprinting flat out, wind in your face, zero hesitation.",
          psychology: "Mars in Aries is Mars at maximum intensity. Action is immediate, instinctive, and unapologetic. This is raw assertion — 'I exist, I want, I act.' Anger is expressed openly and burns hot but brief. There's no strategy here, just pure reaction. When retrograde, the warrior is forced to put down his sword and ask: 'Why do I fight? Is every battle worth fighting?'",
          gifts: ["Extraordinary courage and initiative", "Natural leadership in crisis", "Honest anger — you always know where you stand", "Physical vitality and athleticism", "Ability to start from nothing"],
          challenges: ["Impulsiveness — acting before thinking", "Anger that erupts explosively", "Difficulty with patience and long-term projects", "Competitiveness that alienates allies", "Burning bridges that needed crossing"],
          bodyFeeling: "Heat in the head and face, racing heart, muscles tensed and ready. Anger shows as jaw clenching, fist-making. When blocked, headaches and restless agitation."
        },
        {
          sign: "Scorpio",
          title: "Mars in Scorpio — The Strategic Warrior",
          feltSense: "This feels like calm surface water over a powerful undertow. There's an intensity that doesn't show on the outside. You're watching, calculating, feeling everything at maximum depth. When you act, it's decisive and devastating. The feeling is more 'loaded weapon' than 'wild charge.' Power comes from restraint until the perfect moment.",
          psychology: "Mars in Scorpio is Mars as psychologist-warrior. Every action has emotional depth and strategic purpose. Anger isn't expressed — it's wielded. Sexuality is intense, bonding, and transformative. This Mars never forgets a slight, but also never forgets a kindness. When retrograde, the question becomes: 'Am I using my power to control or to transform? Where am I holding grudges that are poisoning me?'",
          gifts: ["Unmatched determination and follow-through", "Psychological insight — knowing others' motivations", "Emotional courage to face what others avoid", "Strategic brilliance in conflict", "Deep, transformative sexuality"],
          challenges: ["Holding grudges and plotting revenge", "Manipulating through emotional intensity", "Obsessive fixation on perceived enemies", "Difficulty letting go of control", "Self-destructive tendencies when anger turns inward"],
          bodyFeeling: "Intensity in the lower belly and reproductive organs. A coiled, ready-to-strike tension. Jaw tight. Eyes focused. When blocked, the energy turns into resentment you can feel as a heavy weight in your gut."
        },
      ],
      exaltation: [
        {
          sign: "Capricorn",
          title: "Mars in Capricorn — The Exaltation: Disciplined Power",
          feltSense: "This feels like controlled strength — the difference between a wildfire and a forge. The heat is contained, directed, purposeful. You don't waste energy. Every action serves a long-term goal. There's a quiet authority — people instinctively move aside. It's the feeling of climbing a mountain: slow, steady, certain you'll reach the summit.",
          psychology: "Mars is exalted in Capricorn because disciplined action produces the most lasting results. This is the CEO, the architect, the military strategist. Ambition is enormous but expressed through patience and planning. When retrograde, Mars asks: 'Am I building something that matters, or am I climbing for the sake of climbing? Has my ambition cost me my humanity?'",
          gifts: ["Extraordinary self-discipline", "Ability to delay gratification for massive results", "Natural authority and command", "Strategic long-term planning", "Endurance that outlasts everyone"],
          challenges: ["Workaholism — confusing productivity with worth", "Coldness — suppressing emotion for efficiency", "Using status as a weapon", "Difficulty relaxing or being vulnerable", "Ruthlessness justified as 'necessity'"],
          bodyFeeling: "Tension in the knees and skeletal system (Capricorn's body parts). A stiffness in posture — upright, controlled. Energy is measured and deliberate. When blocked, the body feels rigid, aged, burdened."
        },
      ],
      detriment: [
        {
          sign: "Libra",
          title: "Mars in Libra — The Warrior in a Peace Treaty",
          feltSense: "This feels like wanting to punch something but smiling instead. There's a constant negotiation between what you WANT to do and what you SHOULD do. Anger gets swallowed, redirected into passive aggression or icy politeness. You might feel your body tense up in a conflict and then immediately soften your voice and say 'It's fine.' It isn't fine.",
          psychology: "Mars is in detriment in Libra because Libra is opposite Aries — Mars's most direct home. Instead of 'I act,' Libra says 'Let's discuss this.' The warrior has to fight through compromise, negotiation, and other people's needs. This isn't weakness — it's Mars learning to fight FOR relationship rather than just FOR self. When retrograde, the question is devastatingly honest: 'Where have I abandoned my own needs to keep the peace? What would happen if I actually said what I wanted?'",
          gifts: ["Fighting for fairness and justice", "Strategic social intelligence", "Ability to assert through charm rather than force", "Creating win-win outcomes", "Standing up for others when they can't stand up for themselves"],
          challenges: ["Passive aggression instead of direct confrontation", "Chronic people-pleasing that breeds resentment", "Indecisiveness about taking action", "Depending on others to fight your battles", "Resentment buildup from swallowed anger"],
          bodyFeeling: "Lower back pain and kidney tension (Libra's body parts). A feeling of being 'stuck' — wanting to move forward but feeling held back by social obligation. Shoulders pulled in, making yourself smaller."
        },
        {
          sign: "Taurus",
          title: "Mars in Taurus — The Warrior in Quicksand",
          feltSense: "This feels like trying to sprint through mud. There's enormous power here, but it's SLOW. Frustration builds not from lack of strength but from lack of speed. Once you finally get moving, nothing on earth can stop you — but getting started feels like pushing a boulder uphill. Anger doesn't erupt; it accumulates like pressure in a sealed container, and when it finally blows, it's seismic.",
          psychology: "Mars is in detriment in Taurus because Taurus is opposite Scorpio — Mars's strategic home. Instead of Scorpio's 'strike at the perfect moment,' Taurus says 'I refuse to move until I'm ready.' The warrior's speed is replaced by immovable stubbornness. The gift is endurance that outlasts any opponent. The danger is inertia disguised as patience. When retrograde: 'Where have I stopped moving out of comfort rather than strategy?'",
          gifts: ["Unstoppable once committed", "Physical strength and endurance", "Patience that wears down any opposition", "Practical, grounded action", "Building things that last"],
          challenges: ["Extreme stubbornness — unable to change course", "Slow to anger but explosive when triggered", "Laziness masked as 'waiting for the right time'", "Hoarding energy instead of using it", "Possessiveness over resources and territory"],
          bodyFeeling: "Heaviness in the throat and neck (Taurus's body parts). A physical sensation of being weighed down, anchored. Energy pools in the body rather than flowing. When the anger finally releases, it feels volcanic — full-body trembling."
        },
      ],
      fall: [
        {
          sign: "Cancer",
          title: "Mars in Cancer — The Fall: The Armored Crab",
          feltSense: "This feels like trying to fight while crying. Emotions and actions are tangled together — you can't assert yourself without FEELING everything. Anger comes out sideways: door-slamming, silent treatment, suddenly cooking an aggressive amount of food. You want to protect more than you want to attack, but when your loved ones are threatened, a ferocity emerges that surprises everyone, including you.",
          psychology: "Mars is in fall in Cancer because Cancer is opposite Capricorn — where Mars is exalted through disciplined action. Instead of Capricorn's strategic command, Cancer says 'But what about everyone's feelings?' The warrior becomes the protector, and action becomes emotional. This isn't weakness — it's Mars operating through the most powerful force on earth: a mother protecting her young. When retrograde: 'Am I using my emotions as a shield to avoid direct action? Where is my protective instinct actually smothering the people I love?'",
          gifts: ["Fierce protectiveness of loved ones", "Emotional courage — willingness to be vulnerable", "Intuitive action — acting on gut feelings", "Creating safety for others", "Tenacity — the crab never lets go once it grabs on"],
          challenges: ["Passive aggression and emotional manipulation", "Mood-dependent energy — can't act when sad", "Taking everything personally", "Retreating into the shell instead of confronting", "Using guilt as a weapon"],
          bodyFeeling: "Stomach and chest tightness (Cancer rules the chest/stomach). Emotions hit the gut first — nausea when angry, appetite changes with stress. The body holds emotion like water holds shape — it takes the form of whatever container it's in."
        },
      ],
    },
    doList: ["Review physical health routines and fitness goals", "Process old anger through therapy, journaling, or art", "Revisit stalled projects with strategic thinking", "Practice martial arts, yoga, or controlled physical activity", "Address conflict patterns in relationships honestly", "Rest when your body asks — Mars Rx can drain energy"],
    dontList: ["Start major new projects or ventures", "Pick fights or force confrontations", "Have elective surgery if avoidable", "Push through exhaustion — you'll burn out", "Make aggressive financial moves", "Ignore simmering resentments — they'll explode later"],
    signMeanings: {
      Aries: "Mars retrograde in Aries (domicile): Identity crisis around action. Who are you when you can't charge forward?",
      Taurus: "Mars retrograde in Taurus (detriment): Slowed to a crawl. Financial aggression reviewed. Stubbornness examined.",
      Gemini: "Mars retrograde in Gemini: Words become weapons — review how you argue. Mental energy scattered.",
      Cancer: "Mars retrograde in Cancer (fall): Passive-aggressive patterns surface. Family anger needs processing.",
      Leo: "Mars retrograde in Leo: Creative drive stalls. Ego battles revisited. Reclaiming authentic self-expression.",
      Virgo: "Mars retrograde in Virgo: Perfectionism exhausts. Work habits and health routines under critical review.",
      Libra: "Mars retrograde in Libra (detriment): Conflict avoidance doesn't work anymore. Relationship assertiveness reviewed.",
      Scorpio: "Mars retrograde in Scorpio (domicile): Intense psychological reckoning. Power dynamics, sexuality, and hidden anger surface.",
      Sagittarius: "Mars retrograde in Sagittarius: Philosophical battles. Righteous anger needs tempering. Travel plans disrupted.",
      Capricorn: "Mars retrograde in Capricorn (exaltation): Career ambition reviewed. Authority issues surface. Strategic patience required.",
      Aquarius: "Mars retrograde in Aquarius: Collective action stalls. Rebellion reviewed. Innovation needs patience.",
      Pisces: "Mars retrograde in Pisces: Anger dissolves into confusion. Spiritual warrior emerges. Passive resistance replaces aggression.",
    },
  },
  Jupiter: {
    who: "Jupiter is the great benefic — the planet of expansion, wisdom, faith, abundance, and higher meaning. Jupiter governs growth, optimism, travel, higher education, philosophy, and luck. When Jupiter retrogrades, external expansion pauses while inner growth accelerates. This is a time to develop your own philosophy rather than following others', and to find abundance within before seeking it without.",
    frequency: "Jupiter retrogrades once a year for approximately 4 months — it's retrograde about 30% of the time.",
    duration: "~4 months retrograde. Because Jupiter retrogrades so frequently, many people are born with Jupiter retrograde natally.",
    themes: ["Inner growth and philosophical reflection", "Reassessing beliefs and faith systems", "Reviewing educational and travel plans", "Questioning what 'abundance' truly means", "Spiritual development turning inward", "Legal matters needing review"],
    keywords: ["Expansion", "Wisdom", "Faith", "Abundance", "Philosophy", "Travel", "Higher Education", "Optimism", "Generosity", "Justice", "Growth", "Vision", "Guru", "Blessing"],
    dignity: { domicile: "Sagittarius · Pisces", exaltation: "Cancer", detriment: "Gemini · Virgo", fall: "Capricorn" },
    dignityTeaching: {
      intro: "Jupiter has TWO home signs — Sagittarius and Pisces — because expansion comes in two forms: the intellectual quest for truth (Sagittarius) and the spiritual dissolution into the infinite (Pisces). His TWO detriment signs — Gemini and Virgo — are where his grand vision gets lost in details.",
      analogy: "Think of Jupiter like a visionary professor. In Sagittarius, he's giving a TED talk to a standing ovation — big ideas, big energy, inspiring millions. In Pisces, he's in silent meditation at a monastery — expanding inward, touching the divine. In Gemini (detriment), he's been asked to proofread a 500-page technical manual — every big idea gets nitpicked into fragments. In Virgo (detriment), he's been put in charge of inventory at a warehouse — the grand vision is replaced by spreadsheets. In Cancer (exaltation), he's gathered the family for a feast — abundance flows through emotional generosity. In Capricorn (fall), he's been told his funding is cut and he must justify every expense — expansion meets restriction.",
      domicile: [
        {
          sign: "Sagittarius",
          title: "Jupiter in Sagittarius — The Philosopher King",
          feltSense: "This feels like standing on a mountaintop with the whole world spread before you. Everything is possible. Your mind is racing with connections, possibilities, grand plans. There's a restless joy — you want to explore, learn, teach, travel. The horizon keeps pulling you forward. Optimism isn't a choice; it's your default state.",
          psychology: "Jupiter in Sagittarius is expansion at full throttle. Every experience becomes a lesson, every person a teacher. The mind craves meaning — not data, but wisdom. Faith comes naturally. When retrograde: 'Have I been preaching instead of learning? Is my optimism genuine or is it avoiding pain?'",
          gifts: ["Infectious enthusiasm and optimism", "Natural teaching ability", "Philosophical depth combined with humor", "Adventurous spirit — physical and intellectual", "Ability to find meaning in any experience"],
          challenges: ["Over-promising and under-delivering", "Self-righteousness — believing your truth is THE truth", "Restlessness and inability to commit", "Exaggeration and excess in all things", "Bypassing difficult emotions with positive thinking"],
          bodyFeeling: "Expansion in the hips and thighs (Sagittarius's body parts). A physical urge to move — walk, run, travel. Energy radiates outward. Laughter comes from the belly."
        },
        {
          sign: "Pisces",
          title: "Jupiter in Pisces — The Mystic's Expansion",
          feltSense: "This feels like your consciousness is dissolving into something vast and oceanic. The boundaries of self become permeable. You feel OTHER people's joy and pain as your own. Music, art, and nature produce states of awe that are physically overwhelming. Compassion isn't a virtue you practice — it's a state you can't escape.",
          psychology: "Jupiter in Pisces expands through dissolution — the ego gets bigger by getting smaller. Spiritual growth, creativity, and compassion are boundless. But so is self-deception, escapism, and boundary confusion. When retrograde: 'Am I genuinely expanding my compassion, or am I losing myself? Is my spirituality grounded or is it escapism?'",
          gifts: ["Boundless compassion and empathy", "Profound spiritual and mystical experiences", "Creative genius — art, music, poetry", "Healing presence that transforms others", "Faith that endures even in darkness"],
          challenges: ["Spiritual bypassing — using transcendence to avoid reality", "Enabling destructive behaviors out of compassion", "Boundary confusion — where do I end and you begin?", "Escapism through substances, fantasy, or chronic idealism", "Impracticality taken to extremes"],
          bodyFeeling: "Feet and lymphatic system (Pisces's body parts). A floating, dreamy quality — as if you're not fully in your body. Tears flow easily. The body feels porous, absorbing the environment."
        },
      ],
      exaltation: [
        {
          sign: "Cancer",
          title: "Jupiter in Cancer — The Exaltation: Abundant Nurturing",
          feltSense: "This feels like coming home to a table overflowing with food, surrounded by people who love you unconditionally. Warmth radiates from the center of your chest. Generosity flows naturally through emotional care — cooking for people, remembering their stories, creating spaces where everyone belongs. Abundance here is measured in love, not money.",
          psychology: "Jupiter is exalted in Cancer because the greatest expansion happens through emotional connection and nurturing. This is the wise grandmother — enormous life experience expressed through care, food, and family. When retrograde: 'Am I expanding my family's foundation, or am I smothering them? Is my generosity genuine or am I buying love?'",
          gifts: ["Creating abundance through emotional intelligence", "Building family and community bonds", "Generous, nurturing hospitality", "Wisdom rooted in lived emotional experience", "Intuitive understanding of others' needs"],
          challenges: ["Overfeeding — emotional and literal", "Clannishness — 'my people' vs. 'outsiders'", "Sentimentality replacing genuine wisdom", "Using food/comfort as emotional manipulation", "Difficulty setting limits on giving"],
          bodyFeeling: "Warmth in the chest and stomach. A fullness — not bloating, but a satisfied, nourished feeling. The body wants to hold, feed, comfort. When imbalanced, digestive issues from emotional eating."
        },
      ],
      detriment: [
        {
          sign: "Gemini",
          title: "Jupiter in Gemini — The Philosopher in a Chat Room",
          feltSense: "This feels like your mind is in 47 browser tabs at once. Every idea sparks three more. You want to learn EVERYTHING — but finish NOTHING. Conversations are brilliant but scattered. You can talk about anything to anyone, but depth keeps eluding you. The mind buzzes with stimulation, and silence feels unbearable.",
          psychology: "Jupiter in Gemini is detriment because the big picture gets fragmented into data points. Instead of one profound truth, you have a thousand interesting facts. When retrograde: 'Am I learning for wisdom or just collecting information? Can I go deep instead of wide?'",
          gifts: ["Extraordinary versatility and adaptability", "Connecting ideas across disciplines", "Engaging communication and teaching", "Intellectual curiosity that never dies", "Seeing multiple perspectives simultaneously"],
          challenges: ["Superficiality — knowing a little about everything", "Information addiction — scrolling, reading, consuming without integrating", "Inability to commit to one path", "Saying 'yes' to everything", "Mistaking cleverness for wisdom"],
          bodyFeeling: "Restlessness in the hands and arms (Gemini's body parts). A nervous, chattery energy. The mind races ahead of the body. Difficulty sleeping from overstimulation."
        },
        {
          sign: "Virgo",
          title: "Jupiter in Virgo — The Visionary with a Clipboard",
          feltSense: "This feels like trying to see the forest while someone keeps pointing out bark beetles on individual trees. You KNOW there's a bigger picture, but the details keep pulling you down. There's a frustrating gap between what you envision and what you can practically execute. Perfectionism meets expansive vision, and neither wins.",
          psychology: "Jupiter in Virgo is detriment because grand vision gets filtered through critical analysis. Every dream must pass a feasibility study. When retrograde: 'Am I using analysis as growth, or am I using it to avoid the risk of expanding? Can I trust something before I've verified every detail?'",
          gifts: ["Making big ideas actually work", "Growth through service and practical improvement", "Expanding through helping others solve problems", "Meticulous planning that supports vision", "Health-focused wisdom"],
          challenges: ["Paralysis by analysis", "Criticizing every imperfection in a grand plan", "Missing opportunities while perfecting the pitch", "Anxiety about growth — what if it's not perfect?", "Over-working as substitute for genuine expansion"],
          bodyFeeling: "Digestive tension and gut anxiety (Virgo's body parts). A sense of constriction around the waist. The body tightens when the mind encounters something it can't organize or categorize."
        },
      ],
      fall: [
        {
          sign: "Capricorn",
          title: "Jupiter in Capricorn — The Fall: Expansion Meets the Gate",
          feltSense: "This feels like trying to throw a party in an accountant's office. The impulse to celebrate, expand, and be generous keeps bumping into rules, restrictions, and 'the budget.' There's a heaviness to optimism here — you believe things CAN get better, but only through hard work, discipline, and patience. The easy faith of Sagittarius or Cancer is replaced by earned faith.",
          psychology: "Jupiter in Capricorn is in fall because Saturn's sign restricts Jupiter's natural exuberance. Expansion must justify itself. Every opportunity is weighed against risk. When retrograde: 'Have I been so cautious that I've missed the blessing? Am I confusing pessimism with realism?'",
          gifts: ["Sustainable, earned success", "Growth through discipline and patience", "Wisdom from experience, not theory", "Building empires that last", "Teaching through example rather than words"],
          challenges: ["Pessimism masquerading as practicality", "Missing opportunities by over-analyzing risk", "Meanness with resources — emotional and financial", "Difficulty trusting in luck or grace", "Measuring everything in terms of productivity"],
          bodyFeeling: "Tension in the knees and bones (Capricorn's body parts). A sense of weight on the shoulders. The body feels older, stiffer. When balanced, it's the quiet power of a tree that's weathered many storms."
        },
      ],
    },
    doList: ["Reflect on your personal philosophy and beliefs", "Journal about what abundance truly means to you", "Review educational goals and study plans", "Develop inner faith and spiritual practices", "Reassess financial growth strategies", "Travel inwardly — meditation, retreats, contemplation"],
    dontList: ["Over-expand or take excessive risks", "Sign up for programs without thorough research", "Assume luck will carry you — do the work", "Ignore philosophical doubts — they're growth signals", "Make major legal decisions without careful review"],
    signMeanings: {
      Aries: "Jupiter retrograde in Aries: Reconsidering bold initiatives. Is your confidence authentic or performative?",
      Taurus: "Jupiter retrograde in Taurus: Material abundance reviewed. What do you truly need vs. what is excess?",
      Gemini: "Jupiter retrograde in Gemini (detriment): Information overload pauses. Quality over quantity in learning.",
      Cancer: "Jupiter retrograde in Cancer (exaltation): Deep emotional wisdom surfaces. Family blessings recognized.",
      Leo: "Jupiter retrograde in Leo: Creative expansion turns inward. Generosity and ego examined.",
      Virgo: "Jupiter retrograde in Virgo (detriment): Growth through service and health. Small improvements over grand gestures.",
      Libra: "Jupiter retrograde in Libra: Relationship growth reviewed. Justice and fairness in partnerships reconsidered.",
      Scorpio: "Jupiter retrograde in Scorpio: Deep psychological expansion. Hidden wealth — emotional and financial — surfaces.",
      Sagittarius: "Jupiter retrograde in Sagittarius (domicile): Ultimate philosophical review. What do you truly believe?",
      Capricorn: "Jupiter retrograde in Capricorn (fall): Growth meets limitation. Building sustainable structures over quick wins.",
      Aquarius: "Jupiter retrograde in Aquarius: Social vision reviewed. Community involvement and humanitarian goals reconsidered.",
      Pisces: "Jupiter retrograde in Pisces (domicile): Spiritual expansion deepens. Dreams carry profound wisdom.",
    },
  },
  Saturn: {
    who: "Saturn is the great teacher — the planet of discipline, structure, responsibility, karma, and time. Saturn governs boundaries, authority, maturity, and the hard lessons that build lasting wisdom. When Saturn retrogrades, external authority structures loosen while internal accountability deepens. Rules that felt imposed from outside become opportunities for self-discipline. Karmic debts come due — but so do karmic rewards.",
    frequency: "Saturn retrogrades once a year for approximately 4.5 months — retrograde about 36% of the time.",
    duration: "~4.5 months retrograde. Like Jupiter, many people are born with Saturn retrograde, giving them an internalized sense of discipline.",
    themes: ["Reviewing responsibilities and commitments", "Reassessing career structures and authority", "Karmic patterns surfacing for resolution", "Boundaries needing redefinition", "Authority relationships under review", "Time management and life priorities reconsidered"],
    keywords: ["Discipline", "Structure", "Responsibility", "Karma", "Time", "Authority", "Maturity", "Limitation", "Boundaries", "Mastery", "Patience", "Legacy", "Father", "Bones"],
    dignity: { domicile: "Capricorn · Aquarius", exaltation: "Libra", detriment: "Cancer · Leo", fall: "Aries" },
    dignityTeaching: {
      intro: "Saturn has TWO home signs — Capricorn and Aquarius — representing two kinds of structure: the personal empire (Capricorn) and the social framework (Aquarius). His TWO detriment signs — Cancer and Leo — are where his cold discipline clashes most with warmth and self-expression.",
      analogy: "Think of Saturn like a master architect. In Capricorn, he's building his magnum opus — a cathedral that will stand for a thousand years, every stone placed with purpose. In Aquarius, he's designing the city plan — systems, infrastructure, rules that serve the collective. In Cancer (detriment), he's been asked to build a nursery — he keeps making the walls too thick, the crib too rigid, confusing protection with control. In Leo (detriment), he's building a stage for performers — but he keeps reinforcing the structure while the performers beg for spotlight and applause. In Libra (exaltation), he's designing a courthouse — structure serves justice, fairness given form. In Aries (fall), someone handed him a skateboard and said 'just improvise' — every spontaneous bone in his body screams in protest.",
      domicile: [
        {
          sign: "Capricorn",
          title: "Saturn in Capricorn — The Master Builder",
          feltSense: "This feels like standing at the base of a mountain you've been training to climb your whole life. There's no question of turning back. Every step is deliberate. The air is cold, the path is steep, and the discipline required is immense — but you were built for this. There's a deep, quiet pride in your own endurance.",
          psychology: "Saturn in Capricorn is structure in its purest form. Ambition is enormous but expressed through patience, not force. Authority is earned through demonstrated competence. When retrograde: 'Is the empire I'm building the one I actually want? Have I confused status with meaning?'",
          gifts: ["Mastery through long apprenticeship", "Natural authority — people trust your competence", "Building institutions that outlast you", "Strategic patience and timing", "Leading by example, not by words"],
          challenges: ["Emotional coldness justified as professionalism", "Workaholism as identity", "Difficulty asking for help — 'I should handle this alone'", "Rigidity and resistance to change", "Measuring human worth by achievement"],
          bodyFeeling: "Tension in the knees, bones, and teeth (Capricorn's body parts). The body feels compressed, dense, like gravity is stronger than usual. Posture is rigid and upright. When balanced, it's the solidity of an old tree."
        },
        {
          sign: "Aquarius",
          title: "Saturn in Aquarius — The Social Architect",
          feltSense: "This feels like seeing the system — every rule, every structure, every invisible framework that society runs on — and knowing exactly where it's broken. There's a detached clarity. Emotions don't cloud the analysis. You can hold the biggest, most radical vision while simultaneously building the step-by-step plan to make it real.",
          psychology: "Saturn in Aquarius structures the collective. Rules serve humanity, not hierarchy. Innovation is disciplined. When retrograde: 'Am I building systems that truly serve everyone, or am I using intellectual detachment to avoid feeling? Where have my structures become as rigid as the ones I wanted to replace?'",
          gifts: ["Visionary pragmatism — radical ideas that actually work", "Fair-minded and impartial judgment", "Building communities and organizations", "Innovative thinking within structured frameworks", "Standing firm on principle without emotional bias"],
          challenges: ["Cold detachment from human feelings", "Intellectual superiority — 'I know better'", "Rigidity in unconventional positions — becoming what you oppose", "Difficulty with intimacy and personal warmth", "Sacrificing individuals for 'the greater good'"],
          bodyFeeling: "Tension in the ankles and circulatory system (Aquarius's body parts). A coolness throughout the body — neither hot nor cold, just neutral. The mind dominates the body. When imbalanced, circulation problems, cold extremities."
        },
      ],
      exaltation: [
        {
          sign: "Libra",
          title: "Saturn in Libra — The Exaltation: Structure Serves Justice",
          feltSense: "This feels like standing in a perfectly balanced courtroom where the scales are true. There's a profound satisfaction in fairness — not theoretical fairness, but the hard-won kind that comes from listening to both sides, weighing evidence, and making a decision that you can stand behind. Relationships are commitments, not experiments.",
          psychology: "Saturn is exalted in Libra because the best structures serve balance and justice. Commitment deepens rather than restricts. When retrograde: 'Am I committed out of love or out of duty? Is my fairness genuine or am I using rules to avoid making hard choices?'",
          gifts: ["Commitment that deepens over decades", "Fair arbitration and mediation", "Building lasting partnerships through mutual respect", "Elegance that comes from structural integrity", "Diplomatic leadership"],
          challenges: ["Staying in relationships out of obligation", "Rigidity about 'how things should be done'", "Using fairness rules to avoid emotional messiness", "Fear of being alone drives over-commitment", "Judging relationships by external standards"],
          bodyFeeling: "Lower back and kidneys (Libra's body parts). A centered, balanced feeling in the core. When imbalanced, lower back pain from carrying the weight of trying to keep everything 'fair.'"
        },
      ],
      detriment: [
        {
          sign: "Cancer",
          title: "Saturn in Cancer — The Armored Heart",
          feltSense: "This feels like wearing a suit of armor around your heart. You WANT to feel, to nurture, to be soft — but something inside says it isn't safe. Emotions are experienced as dangerous. Vulnerability feels like a trap. You might find yourself building emotional walls and then feeling desperately lonely behind them. Caring for others feels easier than letting others care for you.",
          psychology: "Saturn in Cancer puts structure around the softest part of the psyche — the emotions. Family becomes a source of obligation rather than comfort. Nurturing becomes dutiful rather than instinctive. When retrograde: 'Where did I learn that feelings are dangerous? Who taught me that needing comfort is weakness?'",
          gifts: ["Emotional maturity beyond your years", "Fierce protectiveness of family", "Building emotional security through effort", "Teaching others to be emotionally resilient", "Deep loyalty born from hard-won trust"],
          challenges: ["Emotional suppression — 'I don't need anyone'", "Cold or distant parenting from fear of spoiling", "Difficulty receiving comfort or help", "Using family obligations to avoid intimacy", "Chronic loneliness behind a composed exterior"],
          bodyFeeling: "Tightness in the chest and stomach (Cancer's body parts). The body armors around the heart center. Difficulty taking deep breaths. When the armor cracks, tears may come uncontrollably — years of stored emotion releasing at once."
        },
        {
          sign: "Leo",
          title: "Saturn in Leo — The Reluctant Star",
          feltSense: "This feels like standing in a spotlight and wanting to disappear. There's a deep desire to shine, create, and be seen — but an equally powerful fear of being judged, mocked, or found inadequate. Joy feels earned, not given. You might watch others play freely and feel a painful mix of envy and restraint. Self-expression comes with a censor attached.",
          psychology: "Saturn in Leo puts restriction on self-expression, creativity, and joy. The inner child was told to grow up too fast. When retrograde: 'Who told me I wasn't allowed to play? Where did my creative joy go? What would happen if I let myself be SEEN without performing?'",
          gifts: ["Disciplined creativity — mastery through practice", "Earned authority and leadership", "Authenticity tested through fire", "Creative work that endures and inspires", "Dignity under pressure"],
          challenges: ["Fear of humiliation paralyzes creative expression", "Joy deficit — difficulty having fun spontaneously", "Need for external validation of worth", "Controlling creative projects out of fear", "Using authority to avoid vulnerability"],
          bodyFeeling: "Tension in the upper back and heart area (Leo's body parts). The chest constricts when attention is on you. A stiffness in how you hold yourself — performative posture rather than natural ease. When the fear releases, a warmth spreads through the chest like sunlight."
        },
      ],
      fall: [
        {
          sign: "Aries",
          title: "Saturn in Aries — The Fall: Structure vs. Impulse",
          feltSense: "This feels like having the brakes and the accelerator pressed at the same time. There's an urgent desire to act, to move, to START — but an equally strong voice saying 'not yet, not ready, be careful.' It's exhausting. Every spontaneous impulse is immediately questioned. You might feel old before your time, or like you need permission to assert yourself.",
          psychology: "Saturn in Aries puts restriction on the will itself. Initiative requires permission. Assertion feels dangerous. When retrograde: 'Am I holding myself back out of wisdom or out of fear? What would I do if I knew I couldn't fail?'",
          gifts: ["Courage tested and proven through hardship", "Self-discipline in action — strategic rather than impulsive", "Earned independence and self-reliance", "Leadership forged through overcoming obstacles", "Patience with the process of becoming"],
          challenges: ["Chronic self-doubt about taking initiative", "Anger suppressed until it explodes", "Difficulty asserting needs — feeling undeserving", "Headaches and jaw tension from restrained impulse", "Comparing your pace to others' and feeling behind"],
          bodyFeeling: "Head and jaw tension (Aries's body parts). Teeth grinding. A compressed, coiled feeling like a spring that can't release. Energy gets stuck at the top of the body. When the restriction lifts, there's a rush of heat and forward motion."
        },
      ],
    },
    doList: ["Review your commitments — are they aligned with your values?", "Reassess career goals and professional boundaries", "Address authority issues with maturity", "Practice self-discipline without self-punishment", "Reflect on karmic patterns repeating in your life", "Build internal structure rather than relying on external rules"],
    dontList: ["Start new major business ventures", "Make binding commitments without thorough review", "Ignore responsibilities — they compound", "Resist necessary endings", "Fight authority for the sake of rebellion"],
    signMeanings: {
      Aries: "Saturn retrograde in Aries (fall): Identity structures tested. Impulsive action meets necessary patience.",
      Taurus: "Saturn retrograde in Taurus: Financial and material structures reviewed. Building lasting security.",
      Gemini: "Saturn retrograde in Gemini: Communication commitments assessed. Mental discipline developed.",
      Cancer: "Saturn retrograde in Cancer (detriment): Family obligations weigh heavily. Emotional boundaries needed.",
      Leo: "Saturn retrograde in Leo (detriment): Creative authority tested. Leadership responsibilities reviewed.",
      Virgo: "Saturn retrograde in Virgo: Health routines and work structures undergo serious review.",
      Libra: "Saturn retrograde in Libra (exaltation): Relationship commitments crystallize. Justice and fairness deepened.",
      Scorpio: "Saturn retrograde in Scorpio: Deep structural transformation. Financial entanglements and power structures reviewed.",
      Sagittarius: "Saturn retrograde in Sagittarius: Belief systems tested for integrity. Educational commitments assessed.",
      Capricorn: "Saturn retrograde in Capricorn (domicile): The ultimate career and life-structure review. What legacy are you building?",
      Aquarius: "Saturn retrograde in Aquarius (domicile): Social structures and collective responsibilities reviewed.",
      Pisces: "Saturn retrograde in Pisces: Spiritual discipline deepened. Dissolving structures that no longer serve.",
    },
  },
  Uranus: {
    who: "Uranus is the awakener — the planet of revolution, innovation, sudden change, and liberation. Uranus shatters what's stagnant and introduces the radically new. It governs technology, rebellion, genius, and freedom. When Uranus retrogrades, external disruptions slow while internal revolution accelerates. You process past upheavals and prepare for the next wave of change from within.",
    frequency: "Uranus retrogrades once a year for approximately 5 months — retrograde about 40% of the time.",
    duration: "~5 months retrograde. Because Uranus spends so much time retrograde, its effects are more subtle and internal.",
    themes: ["Processing past upheavals and sudden changes", "Internal revolution and awakening", "Reviewing relationship to freedom and independence", "Technology and innovation turned inward", "Questioning where you conform vs. rebel", "Integration of radical changes from the past year"],
    keywords: ["Revolution", "Innovation", "Freedom", "Awakening", "Technology", "Rebellion", "Genius", "Disruption", "Independence", "Electricity", "Future", "Eccentric", "Liberation", "Shock"],
    dignity: { domicile: "Aquarius", exaltation: "Scorpio (modern)", detriment: "Leo", fall: "Taurus (modern)" },
    doList: ["Reflect on changes you've resisted — are they actually liberating?", "Innovate internally before implementing externally", "Question assumptions and habitual thinking", "Embrace your uniqueness and eccentricities", "Review your relationship to technology", "Process any sudden changes from the past months"],
    dontList: ["Force radical external changes", "Rebel without a clear purpose", "Make impulsive decisions in the name of freedom", "Ignore the need for stability alongside change", "Dismiss conventional wisdom entirely"],
    signMeanings: {
      Aries: "Uranus retrograde in Aries: Identity revolution internalized. Who are you becoming?",
      Taurus: "Uranus retrograde in Taurus (fall): Financial and value revolution deepens. Material stability questioned from within.",
      Gemini: "Uranus retrograde in Gemini: Communication revolution. New ways of thinking process internally.",
      Cancer: "Uranus retrograde in Cancer: Home and family structures quietly revolutionized from within.",
      Leo: "Uranus retrograde in Leo (detriment): Creative and self-expression revolution turns inward.",
      Virgo: "Uranus retrograde in Virgo: Health and work innovation internalized. Systems thinking deepened.",
      Libra: "Uranus retrograde in Libra: Relationship revolution processed. New partnership paradigms gestating.",
      Scorpio: "Uranus retrograde in Scorpio (exaltation): Deep psychological revolution. Transformation of power structures from within.",
      Sagittarius: "Uranus retrograde in Sagittarius: Philosophical revolution internalized. Belief systems radically updated.",
      Capricorn: "Uranus retrograde in Capricorn: Institutional revolution. Career structures quietly reformed.",
      Aquarius: "Uranus retrograde in Aquarius (domicile): Social revolution deepens. Humanitarian vision refined internally.",
      Pisces: "Uranus retrograde in Pisces: Spiritual revolution. Mystical breakthroughs process through dreams and intuition.",
    },
  },
  Neptune: {
    who: "Neptune is the mystic — the planet of dreams, intuition, spirituality, imagination, and dissolution. Neptune governs the unseen realms: the subconscious, collective unconscious, artistic inspiration, and spiritual transcendence. But Neptune also rules illusion, deception, and escapism. When Neptune retrogrades, the fog lifts slightly — you see more clearly what was hidden, both beautiful and deceptive. Inner spiritual work deepens while external illusions may dissolve.",
    frequency: "Neptune retrogrades once a year for approximately 5-6 months — retrograde about 40% of the time.",
    duration: "~5-6 months retrograde. Neptune moves so slowly that its retrograde effects are generational and subtle, operating below conscious awareness.",
    themes: ["Illusions and deceptions becoming clearer", "Spiritual practices deepening", "Creative inspiration turning inward", "Boundaries between self and other clarifying", "Addiction patterns surfacing for healing", "Dreams becoming more vivid and meaningful"],
    keywords: ["Dreams", "Intuition", "Spirituality", "Imagination", "Illusion", "Compassion", "Dissolution", "Mysticism", "Art", "Music", "Escapism", "Transcendence", "Ocean", "Fog"],
    dignity: { domicile: "Pisces", exaltation: "Cancer/Leo (debated)", detriment: "Virgo", fall: "Capricorn/Aquarius (debated)" },
    doList: ["Deepen meditation and spiritual practices", "Pay attention to dreams — keep a dream journal", "Create art, music, or poetry", "Practice discernment in relationships", "Address escapist habits honestly", "Spend time near water"],
    dontList: ["Ignore red flags in relationships", "Make major decisions based solely on intuition without grounding", "Increase substance use as escapism", "Sign contracts without careful review (confusion possible)", "Dismiss practical concerns for idealism"],
    signMeanings: {
      Aries: "Neptune retrograde in Aries: The spiritual warrior turns inward. Idealism about identity reviewed.",
      Taurus: "Neptune retrograde in Taurus: Material illusions dissolve. Spiritual relationship to money and body deepens.",
      Gemini: "Neptune retrograde in Gemini: Mental fog lifts slightly. Communication with the unseen deepens.",
      Cancer: "Neptune retrograde in Cancer: Emotional and family illusions clarify. Ancestral healing deepens.",
      Leo: "Neptune retrograde in Leo: Creative inspiration turns mystical. Performance vs. authenticity examined.",
      Virgo: "Neptune retrograde in Virgo (detriment): Health confusion may clarify. Spiritual service refined.",
      Libra: "Neptune retrograde in Libra: Relationship illusions dissolve. Seeing partners more clearly.",
      Scorpio: "Neptune retrograde in Scorpio: Deep unconscious material surfaces. Psychological and mystical depths explored.",
      Sagittarius: "Neptune retrograde in Sagittarius: Spiritual beliefs tested for authenticity. Guru projections withdrawn.",
      Capricorn: "Neptune retrograde in Capricorn: Institutional illusions dissolve. Career and ambition dreams reviewed.",
      Aquarius: "Neptune retrograde in Aquarius: Social idealism reviewed. Collective dreams need grounding.",
      Pisces: "Neptune retrograde in Pisces (domicile): The deepest spiritual retrograde. Boundless compassion and profound inner visions.",
    },
  },
  Pluto: {
    who: "Pluto is the transformer — the planet of death, rebirth, power, and the deepest psychological processes. Pluto governs what's buried, taboo, and profoundly transformative. It rules shared resources, inheritance, sexuality at its most primal, and the cycle of destruction and regeneration. When Pluto retrogrades, the relentless outer pressure of transformation turns inward. This is when you digest, process, and integrate the profound changes Pluto has been pushing.",
    frequency: "Pluto retrogrades once a year for approximately 5-6 months — retrograde about 44% of the time, the most of any planet.",
    duration: "~5-6 months retrograde. Pluto is retrograde so often that nearly half of all people have natal Pluto retrograde.",
    themes: ["Deep psychological transformation processing", "Power dynamics reviewed internally", "Control issues surfacing for release", "Past traumas processing at a deep level", "Shadow work and hidden material surfacing", "Generational and ancestral healing"],
    keywords: ["Transformation", "Power", "Death/Rebirth", "Shadow", "Depth", "Intensity", "Control", "Obsession", "Phoenix", "Underworld", "Taboo", "Wealth", "Regeneration", "Evolution"],
    dignity: { domicile: "Scorpio", exaltation: "Leo (modern)", detriment: "Taurus", fall: "Aquarius (modern)" },
    doList: ["Engage in deep shadow work and self-inquiry", "Process old traumas with professional support", "Examine power dynamics in your relationships", "Let go of what needs to die — control, grudges, identities", "Research, investigate, and dig deep", "Practice non-attachment to outcomes"],
    dontList: ["Force transformation on others", "Manipulate or use power plays", "Ignore psychological material surfacing", "Resist necessary endings", "Suppress intense emotions — they'll erupt"],
    signMeanings: {
      Aries: "Pluto retrograde in Aries: Identity transformation deepens. Who you're becoming goes through internal purification.",
      Taurus: "Pluto retrograde in Taurus (detriment): Material and value transformation processed. Wealth and possession attachments examined.",
      Gemini: "Pluto retrograde in Gemini: Communication power reviewed. Information as power dynamics examined.",
      Cancer: "Pluto retrograde in Cancer: Family and ancestral transformation deepens. Emotional power processed.",
      Leo: "Pluto retrograde in Leo (exaltation): Creative and self-expression transformation. Personal power refined.",
      Virgo: "Pluto retrograde in Virgo: Health transformation deepens. Service and work patterns undergo deep purification.",
      Libra: "Pluto retrograde in Libra: Relationship power dynamics reviewed at the deepest level.",
      Scorpio: "Pluto retrograde in Scorpio (domicile): The most intense inner transformation. Death and rebirth at the soul level.",
      Sagittarius: "Pluto retrograde in Sagittarius: Belief system transformation deepens. Philosophical power examined.",
      Capricorn: "Pluto retrograde in Capricorn: Institutional and career transformation processed. Authority structures examined.",
      Aquarius: "Pluto retrograde in Aquarius: Social transformation deepens. Collective power dynamics in review.",
      Pisces: "Pluto retrograde in Pisces: Spiritual transformation at the deepest level. Collective unconscious processing.",
    },
  },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getAscendantSign(chart: NatalChart): string {
  const asc = chart.planets?.Ascendant;
  if (!asc?.sign) return "none";
  return asc.sign.toLowerCase();
}

function getHouseOfSign(risingSign: string, targetSign: string): number | null {
  const rIdx = SIGN_ORDER.indexOf(risingSign as any);
  const tIdx = SIGN_ORDER.indexOf(targetSign as any);
  if (rIdx === -1 || tIdx === -1) return null;
  return ((tIdx - rIdx + 12) % 12) + 1;
}

const HOUSE_THEMES: Record<number, string> = {
  1: "identity, appearance, self-expression",
  2: "money, values, self-worth, possessions",
  3: "communication, siblings, learning, daily mind",
  4: "home, family, roots, emotional foundation",
  5: "creativity, romance, children, pleasure",
  6: "health, daily routines, work, service",
  7: "partnerships, marriage, one-on-one relationships",
  8: "shared resources, intimacy, transformation, other people's money",
  9: "higher education, travel, beliefs, philosophy",
  10: "career, public reputation, authority, legacy",
  11: "friends, community, hopes, networks",
  12: "subconscious, spirituality, hidden matters, retreat",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatDeg(lon: number): string {
  const signIdx = Math.floor(lon / 30) % 12;
  const deg = lon % 30;
  const d = Math.floor(deg);
  const m = Math.floor((deg - d) * 60);
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  return `${d}°${String(m).padStart(2,'0')}' ${signs[signIdx]}`;
}

// ─── SUBCOMPONENTS ──────────────────────────────────────────────────────────

function AccordionCard({ icon, title, content, accentClass }: { icon: string; title: string; content: string; accentClass: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-xl border transition-all duration-300 cursor-pointer ${open ? `${accentClass} bg-white/5` : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-white">{title}</span>
        </div>
        <span className={`text-white/50 transition-transform duration-300 text-lg ${open ? "rotate-180" : ""}`}>▾</span>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <div className="h-px bg-white/10 mb-4" />
          <p className="text-white/80 text-sm leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function PlanetRetrogradeGuide({ planet, allCharts, primaryUserName }: PlanetRetrogradeGuideProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedChartId, setSelectedChartId] = useState("none");
  const [activeSection, setActiveSection] = useState("learn");
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(0);
  const [chartSearch, setChartSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const info = PLANET_INFO[planet];
  const colors = PLANET_COLORS[planet] || PLANET_COLORS.Saturn;
  const glyph = PLANET_GLYPHS[planet] || "⊕";
  const body = PLANET_BODIES[planet];

  const MIN_YEAR = 2020;
  const MAX_YEAR = 2035;

  // Compute retrograde periods for the selected year
  const periods = useMemo(() => {
    if (!body) return [];
    return getRetrogradePeriodsForYear(body, selectedYear);
  }, [body, selectedYear]);

  // Current status
  const currentStatus = useMemo(() => {
    if (!body) return null;
    return getRetrogradeStatus(new Date(), periods);
  }, [body, periods]);

  // Deduplicate charts
  const dedupedCharts = useMemo(() => {
    const nameMap = new Map<string, NatalChart>();
    for (const c of allCharts) {
      if (c.id.startsWith('hd_')) continue;
      const norm = normalizeName(c.name);
      if (!norm) continue;
      const existing = nameMap.get(norm);
      if (!existing) {
        nameMap.set(norm, c);
      } else {
        const existCount = existing.planets ? Object.keys(existing.planets).length : 0;
        const newCount = c.planets ? Object.keys(c.planets).length : 0;
        if (newCount > existCount) nameMap.set(norm, c);
      }
    }
    const primaryNorm = primaryUserName ? normalizeName(primaryUserName) : '';
    return Array.from(nameMap.values()).sort((a, b) => {
      const aIsUser = primaryNorm && normalizeName(a.name) === primaryNorm;
      const bIsUser = primaryNorm && normalizeName(b.name) === primaryNorm;
      if (aIsUser && !bIsUser) return -1;
      if (!aIsUser && bIsUser) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allCharts, primaryUserName]);

  const filteredCharts = useMemo(() => {
    if (!chartSearch.trim()) return dedupedCharts;
    const q = chartSearch.toLowerCase();
    return dedupedCharts.filter(c => c.name.toLowerCase().includes(q));
  }, [dedupedCharts, chartSearch]);

  const selectedChart = allCharts.find(c => c.id === selectedChartId) || null;
  const risingSign = selectedChart ? getAscendantSign(selectedChart) : "none";
  const chartName = selectedChart?.name || "";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setChartSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!info) {
    return <div className="text-center text-muted-foreground p-8">No data available for {planet}.</div>;
  }

  const selectedPeriod = periods[selectedPeriodIdx];

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    setSelectedPeriodIdx(0);
  };

  const sections = [
    { id: "learn", label: `Learn ${planet}`, icon: glyph },
    { id: "retrogrades", label: `${selectedYear} Retrogrades`, icon: "🔄" },
    { id: "current", label: "Current Status", icon: currentStatus?.isRetrograde ? "↩️" : "➡️" },
    { id: "guidance", label: "Your Guidance", icon: "✨" },
  ];

  return (
    <div className={`rounded-xl bg-gradient-to-b ${colors.gradient} text-slate-100 font-sans pb-10 -mx-4 -mt-4 md:-mx-6 md:-mt-6`}>
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 80% 10%, white, transparent), radial-gradient(1px 1px at 50% 60%, white, transparent)",
          }}
        />
        <div className="relative px-4 pt-10 pb-6 text-center">
          <div className="text-5xl mb-3 animate-pulse" style={{ animationDuration: "4s" }}>{glyph}</div>
          <h1 className={`text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70`}>
            {planet} Retrograde
          </h1>
          <p className={`${colors.accent} text-sm mt-2 max-w-sm mx-auto`}>
            Understanding {planet}'s backward journey — and what it means for you
          </p>

          {/* Chart selector */}
          <div className="mt-5 flex justify-center">
            <div className="w-72 relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between bg-white/5 border ${colors.border} text-white rounded-xl px-4 py-2.5 text-sm cursor-pointer focus:outline-none transition-colors`}
              >
                <span className="truncate">{selectedChart ? chartName : '— Select a Chart —'}</span>
                <ChevronDown size={14} className={`ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-white/20 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-white/10">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text" value={chartSearch} onChange={(e) => setChartSearch(e.target.value)}
                        placeholder="Type to filter…"
                        className="w-full bg-white/5 border border-white/10 text-white rounded-lg pl-8 pr-3 py-1.5 text-sm placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto py-1">
                    <button onClick={() => { setSelectedChartId('none'); setIsDropdownOpen(false); }} className={`w-full px-4 py-2 text-sm text-left ${selectedChartId === 'none' ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}>
                      — Select a Chart —
                    </button>
                    {filteredCharts.map(c => (
                      <button key={c.id} onClick={() => { setSelectedChartId(c.id); setIsDropdownOpen(false); setChartSearch(''); }}
                        className={`w-full px-4 py-2 text-sm text-left truncate ${selectedChartId === c.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-2xl mx-auto">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeSection === s.id ? `bg-white/15 text-white shadow-lg` : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">

        {/* ── LEARN ── */}
        {activeSection === "learn" && (
          <div className="space-y-4">
            <AccordionCard icon={glyph} title={`Who Is ${planet}?`} content={info.who} accentClass={colors.border} />
            <AccordionCard icon="🔄" title="How Often & Duration" content={`${info.frequency}\n\n${info.duration}`} accentClass={colors.border} />

            {/* Keywords */}
            <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-5`}>
              <p className={`text-xs ${colors.accent} font-semibold uppercase tracking-wider mb-3`}>{glyph} Keywords</p>
              <div className="flex flex-wrap gap-2">
                {info.keywords.map((w) => (
                  <span key={w} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">{w}</span>
                ))}
              </div>
            </div>

            {/* Dignity */}
            <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-5`}>
              <p className={`text-xs ${colors.accent} font-semibold uppercase tracking-wider mb-3`}>{glyph} {planet}'s Sign Dignity</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-emerald-900/30 border border-emerald-500/30 p-3">
                  <p className="text-emerald-300 text-xs font-bold uppercase mb-1">Domicile</p>
                  <p className="text-emerald-50">{info.dignity.domicile}</p>
                </div>
                <div className="rounded-xl bg-blue-900/30 border border-blue-500/30 p-3">
                  <p className="text-blue-300 text-xs font-bold uppercase mb-1">Exaltation</p>
                  <p className="text-blue-50">{info.dignity.exaltation}</p>
                </div>
                <div className="rounded-xl bg-rose-900/30 border border-rose-500/30 p-3">
                  <p className="text-rose-300 text-xs font-bold uppercase mb-1">Detriment</p>
                  <p className="text-rose-50">{info.dignity.detriment}</p>
                </div>
                <div className="rounded-xl bg-amber-900/30 border border-amber-500/30 p-3">
                  <p className="text-amber-300 text-xs font-bold uppercase mb-1">Fall</p>
                  <p className="text-amber-50">{info.dignity.fall}</p>
                </div>
              </div>
            </div>

            {/* Themes */}
            <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-5`}>
              <p className={`text-xs ${colors.accent} font-semibold uppercase tracking-wider mb-3`}>🌊 Retrograde Themes</p>
              <div className="space-y-2">
                {info.themes.map((t) => (
                  <div key={t} className="flex items-start gap-3 text-sm text-white/80">
                    <span className={`${colors.accent} mt-0.5 flex-shrink-0`}>✦</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RETROGRADE PERIODS ── */}
        {activeSection === "retrogrades" && (
          <div className="space-y-4">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🔄</span>
                <h2 className="text-xl font-semibold text-white">{selectedYear} {planet} Retrogrades</h2>
              </div>
              <p className={`text-sm ${colors.accent} ml-11`}>Computed from high-precision ephemeris</p>
            </div>

            {/* Year Navigator */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => handleYearChange(selectedYear - 1)}
                disabled={selectedYear <= MIN_YEAR}
                className={`p-2 rounded-full border ${colors.border} bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all`}
                aria-label="Previous year"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold text-white tracking-wider min-w-[80px] text-center">{selectedYear}</span>
              <button
                onClick={() => handleYearChange(selectedYear + 1)}
                disabled={selectedYear >= MAX_YEAR}
                className={`p-2 rounded-full border ${colors.border} bg-white/5 text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all`}
                aria-label="Next year"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {periods.length === 0 ? (
              <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-8 text-center`}>
                <p className="text-white/60">No retrograde periods found in the current range.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {periods.map((p, i) => {
                  const isNow = new Date() >= p.start && new Date() <= p.end;
                  const isShadow = new Date() >= p.preStart && new Date() <= p.postEnd;
                  const isSelected = selectedPeriodIdx === i;
                  const sign = p.sign.split('/')[0];
                  const signMeaning = info.signMeanings[sign] || '';

                  return (
                    <div key={i}>
                      <div
                        onClick={() => setSelectedPeriodIdx(isSelected ? -1 : i)}
                        className={`rounded-2xl border p-5 cursor-pointer transition-all duration-300 ${isSelected ? `${colors.border} bg-white/10 shadow-lg` : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isNow ? "bg-red-500/40 text-white border border-red-300/50" : isShadow ? "bg-amber-500/30 text-amber-100 border border-amber-400/40" : "bg-white/5 text-white/60 border border-white/10"}`}>
                              {isNow ? "● RETROGRADE NOW" : isShadow ? "◐ IN SHADOW" : p.start > new Date() ? "UPCOMING" : "PAST"}
                            </span>
                            <h3 className="text-lg font-semibold text-white mt-2">{planet} Retrograde in {p.sign}</h3>
                            <p className="text-white/60 text-sm">{p.start.getFullYear()}</p>
                          </div>
                          <span className="text-3xl opacity-40">{glyph}</span>
                        </div>
                        <div className="text-sm text-white/70 space-y-1">
                          <p>📅 {formatDate(p.start)} – {formatDate(p.end)}</p>
                          <p>📐 {p.rxDegree !== undefined ? formatDeg(p.rxDegree) : '?'} → {p.dDegree !== undefined ? formatDeg(p.dDegree) : '?'}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className={`mt-3 mb-2 rounded-2xl border ${colors.border} bg-white/5 p-6 space-y-5`}>
                          {/* Key Dates */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                              <p className="text-xs text-white/50 mb-1">🌑 Pre-Shadow</p>
                              <p className="text-sm font-medium text-white">{formatDate(p.preStart)}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                              <p className="text-xs text-white/50 mb-1">↩️ Station Retrograde</p>
                              <p className="text-sm font-medium text-white">{formatDate(p.start)}</p>
                            </div>
                            {p.cazimi && (
                              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                                <p className="text-xs text-white/50 mb-1">🌞 Cazimi</p>
                                <p className="text-sm font-medium text-white">{formatDate(p.cazimi)}</p>
                              </div>
                            )}
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                              <p className="text-xs text-white/50 mb-1">↪️ Station Direct</p>
                              <p className="text-sm font-medium text-white">{formatDate(p.end)}</p>
                            </div>
                            <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                              <p className="text-xs text-white/50 mb-1">🌕 Shadow Clears</p>
                              <p className="text-sm font-medium text-white">{formatDate(p.postEnd)}</p>
                            </div>
                          </div>

                          {/* Degree Range */}
                          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                            <p className="text-xs text-white/50 font-semibold uppercase mb-1">Degree Range — Triple Activation Zone</p>
                            <p className="text-white font-bold text-lg">
                              {p.rxDegree !== undefined ? formatDeg(p.rxDegree) : '?'} → {p.dDegree !== undefined ? formatDeg(p.dDegree) : '?'}
                            </p>
                            <p className="text-sm text-white/60 mt-2 leading-relaxed">
                              Any natal planet or angle between these degrees will be visited THREE times: once in pre-shadow (direct), once retrograde (backward), and once post-shadow (direct).
                            </p>
                          </div>

                          {/* Sign Meaning */}
                          {signMeaning && (
                            <div className={`rounded-xl ${colors.border} border bg-white/5 p-4`}>
                              <p className={`text-xs ${colors.accent} font-semibold uppercase mb-2`}>🌊 {planet} Retrograde in {sign}</p>
                              <p className="text-white/80 text-sm leading-relaxed">{signMeaning}</p>
                            </div>
                          )}

                          {/* Personalized House */}
                          {risingSign !== "none" && (() => {
                            const retroSign = sign.toLowerCase();
                            const house = getHouseOfSign(risingSign, retroSign);
                            if (!house) return null;
                            return (
                              <div className="rounded-xl bg-gradient-to-br from-fuchsia-900/40 to-violet-900/40 border border-fuchsia-400/40 p-5">
                                <p className="text-xs text-fuchsia-200 font-semibold uppercase mb-2">
                                  ✨ For {chartName} — House {house}
                                </p>
                                <p className="text-fuchsia-50 text-sm leading-relaxed">
                                  {planet} retrograde in {sign} falls in your {house}{house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house of {HOUSE_THEMES[house] || 'various themes'}. 
                                  During the retrograde, expect themes around {HOUSE_THEMES[house]} to resurface for review and integration. 
                                  Pay attention to what was happening in this area of life when {planet} first entered this zone during the pre-shadow.
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CURRENT STATUS ── */}
        {activeSection === "current" && (
          <div className="space-y-4">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{currentStatus?.isRetrograde ? "↩️" : "➡️"}</span>
                <h2 className="text-xl font-semibold text-white">
                  {planet} is {currentStatus?.isRetrograde ? "RETROGRADE" : currentStatus?.isShadow ? `in ${currentStatus.shadowType === 'pre' ? 'Pre' : 'Post'}-Shadow` : "Direct"}
                </h2>
              </div>
            </div>

            {currentStatus?.retrogradeInfo ? (
              <div className={`rounded-2xl border ${colors.border} bg-white/5 p-6 space-y-5`}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-white/50 mb-1">↩️ Station Retrograde</p>
                    <p className="text-sm font-medium text-white">{formatDate(currentStatus.retrogradeInfo.start)}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-white/50 mb-1">↪️ Station Direct</p>
                    <p className="text-sm font-medium text-white">{formatDate(currentStatus.retrogradeInfo.end)}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs text-white/50 mb-1">📍 Sign</p>
                  <p className="text-white font-bold text-lg">{currentStatus.retrogradeInfo.sign}</p>
                  <p className="text-white/60 text-sm mt-2">
                    {info.signMeanings[currentStatus.retrogradeInfo.sign.split('/')[0]] || `${planet} retrograde in ${currentStatus.retrogradeInfo.sign}`}
                  </p>
                </div>

                {currentStatus.isRetrograde && currentStatus.percentComplete !== undefined && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs text-white/50 mb-2">Progress</p>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className={`h-2 rounded-full bg-gradient-to-r from-white/30 to-white/60`} style={{ width: `${currentStatus.percentComplete}%` }} />
                    </div>
                    <p className="text-xs text-white/40 mt-1">{Math.round(currentStatus.percentComplete)}% complete · {currentStatus.daysRemaining} days remaining</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-8 text-center`}>
                <p className="text-3xl mb-3">➡️</p>
                <p className="text-white text-lg font-medium mb-2">{planet} is Currently Direct</p>
                <p className="text-white/60 text-sm">
                  {planet} is moving forward through the zodiac. No retrograde or shadow period is currently active.
                  {periods.length > 0 && (() => {
                    const next = periods.find(p => p.preStart > new Date());
                    if (next) return ` The next ${planet} retrograde pre-shadow begins ${formatDate(next.preStart)}.`;
                    return '';
                  })()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── GUIDANCE ── */}
        {activeSection === "guidance" && (
          <div className="space-y-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">✨</span>
                <h2 className="text-xl font-semibold text-white">{planet} Retrograde Guidance</h2>
              </div>
            </div>

            {/* Do's */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/20 p-5">
              <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider mb-4">✅ What To Do During {planet} Retrograde</p>
              <div className="space-y-2">
                {info.doList.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-emerald-50">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✦</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Don'ts */}
            <div className="rounded-2xl border border-rose-500/40 bg-rose-900/20 p-5">
              <p className="text-xs text-rose-300 font-semibold uppercase tracking-wider mb-4">⚠️ What To Avoid</p>
              <div className="space-y-2">
                {info.dontList.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-rose-50">
                    <span className="text-rose-400 mt-0.5 flex-shrink-0">✦</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Closing */}
            <div className={`rounded-2xl border ${colors.border} bg-white/[0.03] p-6 text-center`}>
              <p className={`text-xs ${colors.accent} font-semibold uppercase tracking-wider mb-3`}>{glyph} A {planet} Retrograde Reminder</p>
              <p className="text-white/80 text-base leading-relaxed italic">
                "Retrogrades are not punishment.<br/>
                They are the universe's invitation to pause,<br/>
                reflect, and integrate before moving forward.<br/>
                What returns to you returns for completion."
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
