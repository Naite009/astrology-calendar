import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Download, Loader2 } from 'lucide-react';
import { vertexInSign } from '@/lib/solarReturnVertex';
import { srJupiterInHouseDeep, srMercuryInHouseDeep, srVenusInHouseDeep, srMarsInHouseDeep, srSaturnInHouseDeep, srUranusInHouseDeep, srNeptuneInHouseDeep, srPlutoInHouseDeep } from '@/lib/solarReturnPlanetInHouseDeep';
import { generateSRtoNatalInterpretation, planetLifeMeanings } from '@/lib/solarReturnAspectInterp';
import { useState } from 'react';
import { moonSignDeep, moonShiftNarrative } from '@/lib/moonSignShiftData';
import { generateActionGuidance } from '@/lib/solarReturnActionGuidance';
import { generateExecutiveSummary } from '@/lib/solarReturnExecutiveSummary';
import { calculateActivationWindows } from '@/lib/solarReturnActivationWindows';
import { generateIdentityShift } from '@/lib/solarReturnIdentityShift';
import { calculateLifeDomainScores } from '@/lib/solarReturnLifeDomainScores';
import { detectContradictions } from '@/lib/solarReturnContradictions';
import { generateLunarWeatherMap } from '@/lib/solarReturnLunarWeather';
import { generatePowerPortrait } from '@/lib/solarReturnPowerPortrait';
import { generateDomainDeepDives } from '@/lib/solarReturnDomainDeepDive';
import { computeYearPriorities } from '@/lib/yearPriorityScoring';
import { computeLunarPhaseTimeline } from '@/lib/solarReturnLunarTimeline';
import { computePsychProfile, computeBlendedProfile } from '@/lib/solarReturnPsychProfile';
import { calculateSecondaryProgressions, getProgressedMoonInfo, findProgressedAspects } from '@/lib/secondaryProgressions';
import { getSabianSymbol } from '@/lib/sabianSymbols';
import { calculateAstrocartography } from '@/lib/solarReturnAstrocartography';
import { calculatePlanetaryHours, getDayRuler, PLANETARY_HOUR_MEANINGS } from '@/lib/planetaryHours';
import { parseLatitudeFromLocation } from '@/lib/solarReturnVertex';
import { buildYearSummary } from '@/lib/solarReturnYearSummary';
import { scoreAspects, generateTopThemes } from '@/lib/solarReturnAspectScoring';
import { buildHouseEmphasis } from '@/lib/solarReturnHouseEmphasis';
import { buildLunarFlow } from '@/lib/solarReturnLunarFlow';
import { buildPatternTracking } from '@/lib/solarReturnPatternTracking';
import { buildFinalAdvice } from '@/lib/solarReturnFinalAdvice';
import { generatePDFCover } from '@/lib/pdfSections/cover';
import { generatePDFTableOfContents, addTOCLinks } from '@/lib/pdfSections/tableOfContents';
import { generatePDFYearAtAGlance } from '@/lib/pdfSections/yearAtAGlance';
import { drawProfectionWheel } from '@/lib/pdfSections/profectionWheel';
import { PDFContext, createPDFContext } from '@/lib/pdfSections/pdfContext';
import { signColorThemes } from '@/lib/pdfSections/signColorThemes';
import { generateStrengthsPortrait } from '@/lib/pdfSections/strengthsPortrait';
import { generateHighlightsPage } from '@/lib/pdfSections/highlightsAndForecasts';
import { generateAffirmationCard } from '@/lib/pdfSections/affirmationCard';
import { generateHowToReadPage } from '@/lib/pdfSections/howToRead';
import { generateProfectionPersonalSection } from '@/lib/pdfSections/profectionPersonal';
import { generateKeyDatesTimeline } from '@/lib/pdfSections/keyDatesTimeline';
import { generateQuarterlySummary } from '@/lib/pdfSections/quarterlySummary';
import { generateTier1SolarReturnPDF } from '@/lib/pdfSections/tier1Report';
import { generatePlanetGallery } from '@/lib/pdfSections/planetGallery';
import { generatePDFLunarTimeline } from '@/lib/pdfSections/lunarTimeline';
import { generatePDFNatalOverlay, generatePDFAngleActivations, generatePDFYearPriority } from '@/lib/pdfSections/yearPriorityPDF';
import { generateNatalVsSRCards } from '@/lib/pdfSections/natalVsSRCards';
import { generateSaturnNodePortrait } from '@/lib/pdfSections/saturnNodePortrait';

// Planet image imports
import planetSun from '@/assets/planets/sun.png';
import planetMoon from '@/assets/planets/moon.png';
import planetMercury from '@/assets/planets/mercury.png';
import planetVenus from '@/assets/planets/venus.png';
import planetMars from '@/assets/planets/mars.png';
import planetJupiter from '@/assets/planets/jupiter.png';
import planetSaturn from '@/assets/planets/saturn.png';
import planetUranus from '@/assets/planets/uranus.png';
import planetNeptune from '@/assets/planets/neptune.png';
import planetPluto from '@/assets/planets/pluto.png';
import planetChiron from '@/assets/planets/chiron.png';
import planetNorthNode from '@/assets/planets/northnode.png';
import planetSouthNode from '@/assets/planet-southnode.png';
import planetCeres from '@/assets/planet-ceres.png';
import planetPallas from '@/assets/planet-pallas.png';
import planetJuno from '@/assets/planet-juno.png';
import planetVesta from '@/assets/planet-vesta.png';
import planetLilith from '@/assets/planet-lilith.png';

export const PLANET_IMAGES: Record<string, string> = {
  sun: planetSun, moon: planetMoon, mercury: planetMercury, venus: planetVenus,
  mars: planetMars, jupiter: planetJupiter, saturn: planetSaturn, uranus: planetUranus,
  neptune: planetNeptune, pluto: planetPluto, chiron: planetChiron, northnode: planetNorthNode,
  southnode: planetSouthNode, ceres: planetCeres, pallas: planetPallas,
  juno: planetJuno, vesta: planetVesta, lilith: planetLilith,
};
// Cake image imports
import cakeAries from '@/assets/cakes/aries.png';
import cakeTaurus from '@/assets/cakes/taurus.png';
import cakeGemini from '@/assets/cakes/gemini.png';
import cakeCancer from '@/assets/cakes/cancer.png';
import cakeLeo from '@/assets/cakes/leo.png';
import cakeVirgo from '@/assets/cakes/virgo.png';
import cakeLibra from '@/assets/cakes/libra.png';
import cakeScorpio from '@/assets/cakes/scorpio.png';
import cakeSagittarius from '@/assets/cakes/sagittarius.png';
import cakeCapricorn from '@/assets/cakes/capricorn.png';
import cakeAquarius from '@/assets/cakes/aquarius.png';
import cakePisces from '@/assets/cakes/pisces.png';

export const CAKE_IMAGES: Record<string, string> = {
  Aries: cakeAries, Taurus: cakeTaurus, Gemini: cakeGemini, Cancer: cakeCancer,
  Leo: cakeLeo, Virgo: cakeVirgo, Libra: cakeLibra, Scorpio: cakeScorpio,
  Sagittarius: cakeSagittarius, Capricorn: cakeCapricorn, Aquarius: cakeAquarius, Pisces: cakePisces,
};

export const P: Record<string, string> = {
  Sun: 'Sun', Moon: 'Moon', Mercury: 'Mercury', Venus: 'Venus', Mars: 'Mars',
  Jupiter: 'Jupiter', Saturn: 'Saturn', Uranus: 'Uranus', Neptune: 'Neptune', Pluto: 'Pluto',
  Chiron: 'Chiron', NorthNode: 'N.Node', SouthNode: 'S.Node', Ascendant: 'ASC',
  Juno: 'Juno', Ceres: 'Ceres', Pallas: 'Pallas', Vesta: 'Vesta', Lilith: 'Lilith',
};

export const S: Record<string, string> = {
  Aries: 'Ari', Taurus: 'Tau', Gemini: 'Gem', Cancer: 'Can', Leo: 'Leo', Virgo: 'Vir',
  Libra: 'Lib', Scorpio: 'Sco', Sagittarius: 'Sag', Capricorn: 'Cap', Aquarius: 'Aqu', Pisces: 'Pis',
};

export const MOON_PHASE_EXPLANATIONS: Record<string, string> = {
  'New Moon': 'Fresh start energy. A year of planting seeds and beginning new chapters. Act on impulse toward what feels genuinely alive.',
  'Waxing Crescent': 'Gathering momentum. Push through doubt. This year rewards early effort and showing up before you feel ready.',
  'First Quarter': 'Crisis of action. Decisions are required — sitting on the fence creates more stress than choosing.',
  'Waxing Gibbous': 'Refining and adjusting. The gap between where you are and where you want to be is productive. Edit, don\'t scrap.',
  'Full Moon': 'Peak illumination. Everything becomes visible — relationships, results, truths. Culmination of something that began years ago.',
  'Waning Gibbous': 'Time to teach and share. Generosity opens unexpected doors. You have something the world needs.',
  'Last Quarter': 'Old structures that no longer serve you become intolerable. The discomfort is pushing you to evolve.',
  'Balsamic': 'Completion phase. The Sun-Moon cycle is ending, and a new one begins next year. Balsamic years are historically associated with tying up unfinished business, releasing what no longer serves the next chapter, and consolidating lessons from the past several years. Energy is lower — not because something is wrong, but because the system is preparing for a reset. Practically: finish projects rather than starting new ones, reduce overcommitments, and make space. The Balsamic phase precedes a New Moon year, which will bring fresh momentum.',
  'Balsamic Moon': 'Completion phase. The Sun-Moon cycle is ending, and a new one begins next year. Balsamic years are historically associated with tying up unfinished business, releasing what no longer serves the next chapter, and consolidating lessons from the past several years. Energy is lower — not because something is wrong, but because the system is preparing for a reset. Practically: finish projects rather than starting new ones, reduce overcommitments, and make space. The Balsamic phase precedes a New Moon year, which will bring fresh momentum.',
};

export const stelliumPlanetRoles: Record<string, string> = {
  Sun: 'your core identity and sense of purpose',
  Moon: 'your emotional needs and instinctive reactions',
  Mercury: 'how you think, communicate, and process information',
  Venus: 'what you love, value, and find beautiful',
  Mars: 'your drive, ambition, and how you assert yourself',
  Jupiter: 'where you expand, grow, and find opportunity',
  Saturn: 'where you face limits, responsibility, and mastery',
  Uranus: 'where you rebel, innovate, and break free',
  Neptune: 'where you dream, dissolve boundaries, and access intuition',
  Pluto: 'where deep transformation and power dynamics play out',
  Chiron: 'your deepest wound and greatest healing gift',
  NorthNode: 'your soul\'s growth direction this lifetime',
};

export const stelliumHouseMeaning: Record<number, string> = {
  1: 'This is YOUR year. Your identity, body, and personal direction are being completely rewired. You may change your appearance, take bold action, or feel an irresistible urge to reinvent yourself.',
  2: 'Money, possessions, and self-worth are consuming your attention. Financial decisions carry enormous weight. You are being forced to answer: what do I actually VALUE?',
  3: 'Your mind is on fire. Communication, learning, writing, and daily connections absorb most of your energy. Expect more conversations that change your perspective.',
  4: 'Home and family dominate. You may move, renovate, deal with family issues, or feel a powerful pull to nest. What does "home" really mean to you?',
  5: 'Creative self-expression, romance, and joy are center stage. Multiple planets here demand you PLAY, create, and take emotional risks.',
  6: 'Daily routines, health, and work are being overhauled. Your body is sending messages — listen to them. Small daily changes create the biggest transformation.',
  7: 'Relationships are the main event. Partnerships demand your full attention. The lesson: balancing your needs with someone else\'s.',
  8: 'Deep transformation, shared finances, and psychological intensity define this year. Something needs to die so something authentic can be born.',
  9: 'Your worldview is expanding. Travel, education, publishing, and philosophical exploration absorb your energy. You are searching for MEANING.',
  10: 'Career and public reputation are being forged. The world is watching. Professional responsibilities increase, but so does recognition.',
  11: 'Community, friendships, and collective purpose are center stage. Your social circle is being reshuffled.',
  12: 'The most deeply private year possible. Inner work, spiritual exploration, and solitude are the assignment. Dreams may be vivid, intuition heightened.',
};

export const timeLordDetailedMeaning: Record<string, string> = {
  Sun: 'The Sun as Time Lord puts your IDENTITY center stage. This year is about YOU — your confidence, your creativity, your sense of purpose. You will feel more visible, more scrutinized, and more alive.',
  Moon: 'The Moon as Time Lord makes this an EMOTIONAL year. Your feelings are running the show. Intuition is stronger but so is reactivity. Home, family, and nurturing relationships dominate.',
  Mercury: 'Mercury as Time Lord makes your MIND the main character. How you think, communicate, and process information determines everything this year. Conversations, writing, contracts, and learning are amplified. When Mercury is your Time Lord AND retrograde in the SR chart, the year has a built-in "review and revise" quality — ideas from the past may hold the key to breakthroughs.',
  Venus: 'Venus as Time Lord makes this a year about RELATIONSHIPS, VALUES, and PLEASURE. What you love, who you love, and how you spend your money are all being examined. The question: does your daily life reflect what you actually value?',
  Mars: 'Mars as Time Lord brings ENERGY, DRIVE, and potentially CONFLICT. You have more fuel than usual — channel it into projects, exercise, or bold moves. The question: what are you fighting for, and is it worth it?',
  Jupiter: 'Jupiter as Time Lord is a gift — expansion, opportunity, and optimism. Something in your life is ready to grow. The danger: overcommitment or saying yes to everything.',
  Saturn: 'Saturn as Time Lord means this year is SERIOUS. Responsibilities increase. Structures you have been building are tested. Shortcuts fail. What is real survives; what is superficial collapses. The reward for doing the work: lasting achievement.',
};

export const stelliumSignMeaning: Record<string, string> = {
  'Aries': 'Identity rebuilt from scratch. Everything feels personal. Decisions faster but need impulse control.',
  'Taurus': 'Material reality dominates — money, body, possessions. Build slowly; not a year for shortcuts.',
  'Gemini': 'Mind is the main character. Learning, communicating, networking dominate.',
  'Cancer': 'Home, family, emotional foundations. Emotional world is the priority.',
  'Leo': 'Creative self-expression and visibility. Step into the spotlight.',
  'Virgo': 'Systems, health, daily function under review. Master the mundane.',
  'Libra': 'Relationships and balance of giving and receiving.',
  'Scorpio': 'Power dynamics, financial entanglements, transformation.',
  'Sagittarius': 'Expand your world. Searching for MEANING in work, beliefs, life direction.',
  'Capricorn': 'Ambition, authority, lasting structures. Career and reputation are priority.',
  'Aquarius': 'Your place in the collective. Friendships, groups, technology become central.',
  'Pisces': 'Boundaries dissolve. Creativity, spirituality, healing dominate.',
};

export const stelliumFeltSense: Record<string, string> = {
  'Aries': 'Restless energy, constant urge to START. Patience drops. Courage surges.',
  'Taurus': 'Deep craving for stability and sensory pleasure. Body wants comfort and security.',
  'Gemini': 'Mental overstimulation, racing thoughts. Mind has 40 tabs open.',
  'Cancer': 'Emotional waves, sensitivity to atmosphere. Gut tells you things before your mind catches up.',
  'Leo': 'Warm expansion in your chest, need to create and be seen.',
  'Virgo': 'Tension in stomach and shoulders, compulsion to organize and perfect.',
  'Libra': 'Heightened sensitivity to discord. Crave harmony in environment and relationships.',
  'Scorpio': 'Intensity in your gut, magnetic pull toward hidden truths.',
  'Sagittarius': 'Restlessness in your legs, urge to GO somewhere and learn something.',
  'Capricorn': 'Weight on shoulders, sobering awareness of time and responsibility.',
  'Aquarius': 'Electric buzzing under your skin, sudden insights, urge to break free.',
  'Pisces': 'Dissolving of normal boundaries, heightened empathy, vivid dreams.',
};

export const saturnHouseMeaning: Record<number, string> = {
  1: 'YOU are the project. Your body, appearance, and sense of self are being restructured from the ground up. You feel heavier, more serious, older. Others may perceive you as more authoritative. Health demands attention — dental work, bones, skin, chronic issues. The gift: genuine self-authority that no one can take from you. The test: doing the hard inner work instead of performing confidence.',
  2: 'Finances, values, and self-worth are under Saturn\'s microscope. You may earn less, spend more carefully, or face financial limits that force you to distinguish needs from wants. The real lesson: what you genuinely value vs. what you spend on out of habit or anxiety. Building a real budget, paying off debt, or establishing financial independence are the assignments.',
  3: 'Communication requires more effort and carries more weight. You may struggle to express yourself clearly, deal with difficult conversations, or face a demanding learning curve. Sibling or neighbor relationships may feel strained. The growth: learning to say what matters with precision and authority.',
  4: 'Home and family are the classroom. You may renovate, move, deal with aging parents, or confront deep family patterns that have shaped you. The domestic sphere feels heavy but productive. Building real emotional foundations — not just decorating the surface — is the assignment.',
  5: 'Creativity, romance, and fun require WORK. Joy doesn\'t come easily — spontaneity feels blocked. Dating is serious, creative projects need discipline, and your relationship to pleasure is being matured. Children may demand more responsibility. The reward: creative output with real substance and lasting relationships built on reality.',
  6: 'Daily routines, work habits, and health are being restructured. Bad habits catch up. The body insists on better care. Work may feel burdensome or demand systems you\'ve been avoiding. Building sustainable health practices and efficient work systems is the assignment.',
  7: 'Partnerships are tested. Relationships lacking real commitment or genuine reciprocity may end. Solid partnerships deepen through shared struggle. You may attract a more serious partner, or an existing partner becomes more demanding. The lesson: what does real partnership actually require?',
  8: 'Deep transformation. Shared finances, debts, inheritances, and psychological patterns are under review. Power dynamics in intimate relationships demand honest reckoning. Therapy works harder this year. The area where you\'ve been avoiding depth is exactly where Saturn insists you go.',
  9: 'Beliefs are tested against reality. Higher education demands serious commitment. Travel may be restricted or purposeful rather than recreational. You are being asked: do you actually believe what you say you believe?',
  10: 'Career and professional reputation are THE priority. Responsibilities increase — you may be promoted, scrutinized, or given more authority than you feel ready for. Professional standards are higher. The world is watching. Build something real.',
  11: 'Friendships restructured. Fair-weather friends fall away. The groups you belong to either prove their worth or become obligations. You may feel isolated or take on leadership. Quality over quantity in every social connection.',
  12: 'The most deeply internal Saturn placement. Unconscious patterns, hidden fears, and spiritual foundations are under review. Solitude may be imposed. Dreams may be heavy. Therapy, meditation, and inner work are productive but demanding.',
};

export const nodeHouseMeaning: Record<number, string> = {
  1: 'Growth edge: SELF-assertion. Your soul is being pulled toward independence and defining yourself on your own terms. Stop deferring to others. The universe rewards you every time you choose yourself — not selfishly, but authentically. What do YOU want?',
  2: 'Growth: building financial independence and clarifying your values. What is worth your time, money, and energy? Stop borrowing from others\' value systems. Develop your own resources and trust your own worth.',
  3: 'Growth: communication, learning, and intellectual curiosity. Speak up. Write. Teach. Ask questions. The growth happens in everyday conversations, not grand gestures. Your local environment holds the lessons.',
  4: 'Growth: home, family, emotional foundations. Put down roots — emotionally and literally. Stop chasing external achievement at the expense of inner security. What does "home" mean to you on a soul level?',
  5: 'Growth: creative self-expression, romance, and taking emotional risks. Stop playing it safe. Create something. Love someone. Let yourself be seen in your joy and your vulnerability.',
  6: 'Growth: daily habits, health, and service to others. Mastery of the mundane IS the spiritual path this year. Your body is your teacher. Build routines that actually serve your wellbeing.',
  7: 'Growth: partnership, collaboration, and learning to receive. Stop doing everything alone. The lesson is in the mirror of relationship — what a committed other shows you about yourself.',
  8: 'Growth: emotional depth, shared vulnerability, and letting someone truly know you. Intimacy requires surrender. Financial entanglements teach you about trust. Let something old die so something real can live.',
  9: 'Growth: expanding your worldview through travel, education, or encounter with the unfamiliar. Your current perspective is too small. Something out there — a place, an idea, a teacher — will crack you open.',
  10: 'Growth: stepping into authority and accepting public responsibility. You are being called to lead, to build, to create a legacy. Stop hiding behind others\' authority.',
  11: 'Growth: community, friendship, and collective purpose. Your individual ambitions are being redirected toward something larger. Find your people. Contribute to a cause bigger than yourself.',
  12: 'Growth: surrender, release, and spiritual trust. The ego\'s agenda is being dissolved — not destroyed, but softened. Meditation, dreams, and quiet contemplation reveal what striving cannot.',
};

// ─── How This Year Meets You (v3 section) ───────────────────────────
import type jsPDF from 'jspdf';

const HTYM_SUN_BODY: Record<number, string> = {
  1: 'Your core identity is being refreshed and redefined. People see a more authentic version of you emerging — the year amplifies who you really are. The 1st house placement puts you at the center of your own story.',
  2: 'Your energy this year flows toward finances, possessions, and defining what you truly value. The 2nd house Sun draws attention to material security and self-worth in practical, tangible ways.',
  3: 'Your mind and voice are the main characters. The 3rd house Sun activates learning, communication, writing, and everyday connections. Ideas carry unusual weight this year.',
  4: 'Home, family, and emotional roots demand your full attention. The 4th house Sun turns energy inward — toward ancestry, domestic life, and the foundations that hold everything else together.',
  5: 'Joy, creativity, and self-expression light up this year. The 5th house Sun pulls you toward play, creative risk-taking, and emotional vulnerability. Romance and children may also feature prominently — you feel most alive when creating or loving boldly.',
  6: 'Daily routines, health, and work efficiency are being restructured. The 6th house Sun sharpens your awareness of what isn\'t working in your daily life — small, consistent changes produce the biggest results, and you feel genuine satisfaction from fixing what\'s broken.',
  7: 'Relationships define this year. The 7th house Sun places partnerships — romantic, business, or creative — at the center. Growth happens through the mirror of another person.',
  8: 'Transformation runs deep. The 8th house Sun activates shared resources, psychological depth, and emotional honesty. Something old must end for something authentic to begin.',
  9: 'Your world is expanding through travel, education, or a fundamental shift in perspective. The 9th house Sun seeks meaning beyond the familiar — philosophy, culture, and big-picture thinking.',
  10: 'Career and public reputation are the priority. The 10th house Sun makes you more visible — professional responsibilities increase, but so does recognition and authority.',
  11: 'Community, friendship, and collective purpose shape the year. The 11th house Sun redirects personal ambition toward something larger — your social circle is being restructured.',
  12: 'The most introspective placement. The 12th house Sun turns energy toward solitude, spiritual practice, and unconscious patterns. Rest and inner work are not extras — they are the curriculum.',
};

// ── Sign-specific plain-language descriptions for JSON export ──
const SIGN_DESCRIPTIONS: Record<string, { sun: string; moon: string; rising: string }> = {
  Aries: {
    sun: 'You lead with courage and independence — you are someone who takes initiative, speaks directly, and needs to feel like you are forging your own path.',
    moon: 'You process emotions quickly and physically — when something upsets you, you want to act on it immediately rather than sit with the feeling.',
    rising: 'You come across as bold, direct, and energetic — people see you as someone who takes charge and is not afraid to go first.',
  },
  Taurus: {
    sun: 'You value stability, comfort, and building things that last — you are patient, sensory, and deeply loyal once you commit to something.',
    moon: 'You need emotional security and physical comfort to feel safe — change is hard for you, but once you settle in, your emotional steadiness is a gift to everyone around you.',
    rising: 'You come across as calm, grounded, and reliable — people feel safe around you and see you as someone who takes a measured, thoughtful approach to life.',
  },
  Gemini: {
    sun: 'You are driven by curiosity and communication — you need variety, intellectual stimulation, and the freedom to explore multiple interests at once.',
    moon: 'You process emotions by talking and thinking them through — writing, conversation, and mental activity are how you work through what you feel.',
    rising: 'You come across as witty, curious, and socially adaptable — people see you as someone who can talk to anyone and make connections effortlessly.',
  },
  Cancer: {
    sun: 'You are deeply nurturing and emotionally intelligent — family, home, and emotional safety are your core priorities, and you protect what you love fiercely.',
    moon: 'Your emotions run deep and your intuition is powerful — you absorb the feelings of people around you and need regular time alone to process and recharge.',
    rising: 'You come across as warm, caring, and approachable — people instinctively trust you and feel comfortable sharing their feelings with you.',
  },
  Leo: {
    sun: 'You shine when you are creating, performing, or leading — you need recognition, creative expression, and the freedom to be authentically yourself in everything you do.',
    moon: 'You need to feel special and appreciated to be emotionally secure — genuine praise and loyal love are not luxuries for you, they are necessities.',
    rising: 'You come across as confident, warm, and charismatic — people are naturally drawn to your presence and see you as someone who lights up a room.',
  },
  Virgo: {
    sun: 'You find meaning through being useful, improving things, and solving problems — you notice details others miss and hold yourself to high standards.',
    moon: 'You process emotions by analyzing them and finding practical solutions — you feel better when you can fix something, organize something, or help someone.',
    rising: 'You come across as competent, thoughtful, and detail-oriented — people see you as someone they can rely on to get things right.',
  },
  Libra: {
    sun: 'You are drawn to beauty, fairness, and meaningful partnerships — you see both sides of every situation and work hard to create harmony in your relationships.',
    moon: 'You need emotional balance and peaceful relationships to feel secure — conflict genuinely unsettles you, and you process feelings best when you can talk them through with someone you trust.',
    rising: 'You come across as gracious, diplomatic, and aesthetically attuned — people see you as someone who brings elegance and fairness to every interaction.',
  },
  Scorpio: {
    sun: 'You live with emotional intensity and psychological depth — you are drawn to truth, transformation, and understanding what lies beneath the surface of everything.',
    moon: 'Your emotions are intense, private, and all-or-nothing — you feel things deeply but rarely show it, and betrayal or dishonesty affects you more profoundly than most people understand.',
    rising: 'You come across as intense, perceptive, and magnetic — people sense your depth immediately and either feel drawn to you or slightly intimidated by your presence.',
  },
  Sagittarius: {
    sun: 'You are driven by a need for meaning, adventure, and growth — you think big, seek truth, and feel most alive when you are learning, traveling, or exploring new philosophies.',
    moon: 'You process emotions through movement, humor, and searching for meaning — when things get heavy, you instinctively look for the bigger picture or plan an escape.',
    rising: 'You come across as optimistic, adventurous, and philosophical — people see you as someone who is always looking toward the horizon and inspiring others to think bigger.',
  },
  Capricorn: {
    sun: 'You are ambitious, disciplined, and focused on building something meaningful over time — you take responsibility seriously and measure success by what you have actually accomplished.',
    moon: 'You process emotions privately and practically — you may appear stoic on the outside, but you feel things deeply and cope by staying productive and in control.',
    rising: 'You come across as serious, capable, and authoritative — people see you as someone who has their life together and can be trusted with important responsibilities.',
  },
  Aquarius: {
    sun: 'You value independence, originality, and making the world better — you think differently from most people and are drawn to innovation, social causes, and intellectual freedom.',
    moon: 'You process emotions with some detachment, preferring to understand feelings intellectually before engaging with them — you need space and freedom even in your closest relationships.',
    rising: 'You come across as unique, independent, and slightly unconventional — people see you as someone who marches to their own drum and is not afraid to be different.',
  },
  Pisces: {
    sun: 'You are deeply empathic, creative, and spiritually attuned — you absorb the emotions of the world around you and express yourself best through art, music, healing, or compassion.',
    moon: 'Your emotional world is vast and borderless — you feel everything intensely, dream vividly, and need creative or spiritual outlets to process the enormous amount of feeling you carry.',
    rising: 'You come across as gentle, dreamy, and compassionate — people see you as someone who is deeply kind and intuitively understands what others are going through.',
  },
};

const HTYM_MOON_BODY: Record<string, string> = {
  Aries: 'Your emotional landscape shifts toward directness and independence. Where your natal Moon processes feelings in its familiar way, this year the emotional body wants action, speed, and autonomy.',
  Taurus: 'Your emotional world this year craves stability, comfort, and sensory grounding. The shift is toward patience — feelings are processed slowly and deliberately.',
  Gemini: 'Your emotional processing becomes more verbal and social. You think through feelings rather than sitting with them — conversation and writing become emotional outlets.',
  Cancer: 'Your emotional world deepens significantly. Sensitivity increases, intuition sharpens, and the need for emotional safety becomes non-negotiable.',
  Leo: 'Your emotional world warms and expands. The need to feel seen, appreciated, and creatively expressed intensifies. Heart-centered decisions carry more weight.',
  Virgo: 'Your emotional processing becomes more analytical and service-oriented. Feelings are examined, organized, and channeled into practical improvements.',
  Libra: 'Your emotional world seeks balance and harmony. Relationship dynamics filter everything — discord feels physically disruptive, and the pull toward partnership strengthens until being alone feels genuinely uncomfortable.',
  Scorpio: 'Your emotional world intensifies and deepens. Surface-level engagement becomes intolerable — you find yourself probing conversations, questioning motives, and craving psychological honesty in ways that surprise even you.',
  Sagittarius: 'Your emotional world opens and lifts. Restlessness increases, optimism grows, and the need for meaning and adventure permeates your inner life — routine feels suffocating, and you process feelings by moving, learning, or debating.',
  Capricorn: 'Your emotional world becomes more disciplined and pragmatic. Feelings are managed rather than indulged — emotional maturity deepens.',
  Aquarius: 'Your emotional processing becomes more detached and cerebral. You observe feelings from a slight distance, preferring clarity and independence over intensity.',
  Pisces: 'Your emotional world becomes fluid and permeable. Boundaries thin, empathy deepens, and the unconscious sends vivid signals through dreams and intuition.',
};

const HTYM_RISING_BODY: Record<string, string> = {
  Aries: 'Your public presence shifts toward boldness, directness, and initiative. Others perceive you as more courageous and action-oriented — you feel impatient with hesitation and drawn to starting things.',
  Taurus: 'Your public presence becomes more grounded, patient, and reliable. Others see stability in you — you feel most effective when building slowly and deliberately rather than rushing.',
  Gemini: 'Your public presence becomes lighter, more curious, and verbally agile. You naturally become a connector — ideas, people, and information flow through you, and you feel most alive in conversation.',
  Cancer: 'Your public presence softens and becomes more nurturing. Others feel safe in your company — doors open through emotional intelligence and the genuine care you project.',
  Leo: 'Your public presence becomes more visible, warm, and magnetic. You feel a persistent pull to step forward and let yourself be seen — hiding feels uncomfortable and counterproductive.',
  Virgo: 'Your public presence sharpens and becomes more purposeful. You feel most confident when demonstrating precision and competence — sloppy work from others becomes harder to tolerate.',
  Libra: 'Your public presence becomes more diplomatic, graceful, and partnership-oriented. Doors open through collaboration rather than solo ambition — you find yourself naturally mediating, beautifying, and building bridges between people.',
  Scorpio: 'Your public presence deepens and becomes more intense. You carry a magnetic, transformative quality that others either gravitate toward or instinctively resist — superficial interactions feel like a waste of time.',
  Sagittarius: 'Your public presence opens and expands. You feel most effective when teaching, adventuring, or engaging philosophically with the world — routine professional obligations feel constraining.',
  Capricorn: 'Your public presence becomes more authoritative and focused. You feel a drive to take on greater responsibility and build something lasting — frivolous pursuits lose their appeal.',
  Aquarius: 'Your public presence becomes more independent and original. You feel most aligned when trusting your own unconventional vision, even when it confuses people around you.',
  Pisces: 'Your public presence becomes gentler and more intuitive. Doors open through compassion, creativity, and subtle connection — you influence others by feeling with them rather than directing them.',
};

function generateHowThisYearMeetsYou(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis,
  srChart: SolarReturnChart, natalChart: NatalChart,
) {
  const { margin, contentW, colors, pw } = ctx;
  const natalSun = natalChart.planets?.Sun?.sign || '';
  const natalMoon = natalChart.planets?.Moon?.sign || '';
  const natalRising = natalChart.houseCusps?.house1?.sign || natalChart.planets?.Ascendant?.sign || '';
  const srSunSign = srChart.planets.Sun?.sign || natalSun;
  const srMoonSign = a.moonSign || srChart.planets.Moon?.sign || '';
  const srRisingSign = srChart.houseCusps?.house1?.sign || a.yearlyTheme?.ascendantSign || srChart.planets.Ascendant?.sign || '';
  const sunH = a.sunHouse?.house || 1;

  ctx.sectionTitle(doc, 'HOW THIS YEAR MEETS YOU', 'Natal vs Solar Return');

  // Intro
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...colors.muted);
  const introLines: string[] = doc.splitTextToSize(
    'Your natal chart is who you are. Your Solar Return shows how this year\'s energy meets that.',
    contentW,
  );
  for (const l of introLines) { doc.text(l, margin, ctx.y); ctx.y += 13; }
  ctx.y += 8;

  const cards = [
    {
      label: 'YOUR SUN', natalTag: natalSun, srTag: `${srSunSign} · H${sunH}`,
      headline: `Your core self ${sunH === 1 ? 'takes center stage' : sunH === 7 ? 'meets itself through others' : sunH === 10 ? 'steps into the spotlight' : 'enters new territory'}`,
      body: HTYM_SUN_BODY[sunH] || 'Your energy is directed toward a new area of life this year.',
    },
    {
      label: 'YOUR MOON', natalTag: natalMoon, srTag: srMoonSign,
      headline: natalMoon === srMoonSign ? 'Your emotional world stays in familiar territory' : `Your emotional world shifts from ${natalMoon} to ${srMoonSign}`,
      body: HTYM_MOON_BODY[srMoonSign] || 'Your emotional world enters a new rhythm this year.',
    },
    {
      label: 'YOUR RISING', natalTag: natalRising, srTag: srRisingSign,
      headline: natalRising === srRisingSign ? 'Your natural presence amplifies' : `Your presence shifts from ${natalRising} to ${srRisingSign}`,
      body: HTYM_RISING_BODY[srRisingSign] || 'The way you show up in the world takes on a new quality.',
    },
  ];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    ctx.checkPage(110);

    // Tracked caps label
    ctx.trackedLabel(doc, card.label, margin, ctx.y, { size: 7, charSpace: 3 });

    // Tags: natal --> SR (no unicode arrows — jsPDF Times doesn't support them)
    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    const tagStr = `${card.natalTag}  -->  ${card.srTag}`;
    // Place tags with margin from right edge to prevent overflow
    const tagW = doc.getTextWidth(tagStr);
    doc.text(tagStr, Math.min(margin + contentW, pw - margin) - tagW, ctx.y);
    ctx.y += 12;

    // Headline
    doc.setFont('times', 'bold'); doc.setFontSize(11);
    doc.setTextColor(...colors.ink);
    const hlLines: string[] = doc.splitTextToSize(card.headline, contentW - 16);
    for (const hl of hlLines) { doc.text(hl, margin + 8, ctx.y); ctx.y += 14; }
    ctx.y += 4;

    // Body
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...colors.ink);
    const bdLines: string[] = doc.splitTextToSize(card.body, contentW - 16);
    for (const bl of bdLines.slice(0, 4)) { doc.text(bl, margin + 8, ctx.y); ctx.y += 13; }
    ctx.y += 4;

    // Hairline rule
    doc.setDrawColor(...colors.rule); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, margin + contentW, ctx.y);
    ctx.y += 12;
  }
}

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  narrative: string;
}

const MAJOR_BODIES = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode','SouthNode','Ascendant']);
const PLANET_ORDER = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
const SPOTLIGHT_ORDER = ['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

// Personalized stellium interpretation based on sign + house + planets
function getPersonalizedStelliumText(sign: string, house: number | null, planets: string[]): string {
  const planetNames = planets.map(p => P[p] || p).join(', ');
  const houseContext = house ? ` in your ${house}${house === 1 ? 'st' : house === 2 ? 'nd' : house === 3 ? 'rd' : 'th'} house` : '';
  
  const signPersonal: Record<string, string> = {
    'Aries': `With ${planetNames} clustered in Aries${houseContext}, your identity is being rebuilt from the ground up this year. Decisions come faster. Patience drops. Everything feels personal: career decisions feel like identity decisions, relationship conversations feel like self-definition moments. Your body may feel restless, charged, or like it needs to MOVE. The risk is impulsivity. The gift is courage you did not know you had.`,
    'Taurus': `With ${planetNames} clustered in Taurus${houseContext}, material reality is the main event. Your body, your bank account, your physical space — these are the arenas. You will feel a deep pull toward stability and things you can TOUCH. The challenge: resistance to necessary change. The gift: anything you build this year has staying power.`,
    'Gemini': `With ${planetNames} clustered in Gemini${houseContext}, your mind is the main character. You will feel mentally overstimulated — processing multiple streams of information, having conversations that shift your perspective. Writing, teaching, and networking are amplified. The challenge: scattered attention. The gift: ideas that connect dots no one else sees.`,
    'Cancer': `With ${planetNames} clustered in Cancer${houseContext}, home, family, and emotional foundations dominate. Gut instincts are louder, emotional reactions are stronger, and your need for safety is non-negotiable. Family dynamics may require your full attention. The challenge: mood swings and emotional overwhelm. The gift: deep emotional wisdom and the ability to create sanctuary.`,
    'Leo': `With ${planetNames} clustered in Leo${houseContext}, creative self-expression and visibility are the assignment. You will feel an expanding warmth, a need to CREATE and be SEEN. Whether through art, romance, children, or leadership — step forward. The challenge: needing external validation. The gift: authentic creative power that inspires.`,
    'Virgo': `With ${planetNames} clustered in Virgo${houseContext}, systems, health, and daily function are under review. You will feel a compulsion to organize, fix, and improve. Your analytical powers are at peak strength. The body sends clear messages. The challenge: paralysis through perfectionism. The gift: mastery of the practical.`,
    'Libra': `With ${planetNames} clustered in Libra${houseContext}, relationships and balance are central. You will feel heightened sensitivity to discord. Partnership decisions carry enormous weight. The challenge: people-pleasing. The gift: the ability to create genuine harmony.`,
    'Scorpio': `With ${planetNames} clustered in Scorpio${houseContext}, transformation and intensity define the year. You are pulled toward hidden truths and situations that demand depth. Surface-level engagement is not an option. The challenge: controlling tendencies. The gift: profound psychological insight and capacity for rebirth.`,
    'Sagittarius': `With ${planetNames} clustered in Sagittarius${houseContext}, your worldview is expanding. You will feel restlessness — a physical urge to GO, learn, find MEANING. Travel, education, and philosophical exploration absorb your energy. The challenge: overcommitting. The gift: breakthroughs in understanding.`,
    'Capricorn': `With ${planetNames} clustered in Capricorn${houseContext}, ambition, structure, and lasting achievement are the focus. You will feel the weight of responsibility — in your shoulders, jaw, and spine. Professional demands increase. The challenge: emotional suppression. The gift: building something that lasts.`,
    'Aquarius': `With ${planetNames} clustered in Aquarius${houseContext}, your place in the collective is being restructured. Sudden insights, unconventional ideas, and a pull toward innovation. The challenge: emotional detachment. The gift: original thinking that solves problems no one else can.`,
    'Pisces': `With ${planetNames} clustered in Pisces${houseContext}, your sensitivity is amplified — this does NOT mean your identity dissolves. It means you absorb the emotional frequency of every room. Creativity, intuition, and spiritual awareness are heightened. Dreams may be vivid and meaningful. The challenge: knowing which feelings are yours vs someone else's. Boundaries require conscious effort. The gift: access to compassion and creative vision most people never reach. Practically: you may need more solitude, and meditation or artistic expression become essential rather than optional.`,
  };
  
  return signPersonal[sign] || `${planetNames} are clustered in ${sign}${houseContext}, concentrating this year's energy into a focused area.`;
}

// ─── Chart Wheel Data Builder (for SVG rendering by external tools) ──
const SIGNS_LIST = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const WHEEL_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];

function buildChartWheelData(srChart: SolarReturnChart, natalChart: NatalChart, analysis: SolarReturnAnalysis) {
  const toAbs = (pos: any): number | null => {
    if (!pos?.sign) return null;
    const idx = SIGNS_LIST.indexOf(pos.sign);
    if (idx < 0) return null;
    return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
  };

  // SR planet positions in absolute degrees
  const srPlanets: Record<string, { absDeg: number; sign: string; degree: number; minutes: number; retrograde: boolean }> = {};
  for (const p of WHEEL_PLANETS) {
    const pos = srChart.planets?.[p as keyof typeof srChart.planets];
    if (!pos) continue;
    const abs = toAbs(pos);
    if (abs === null) continue;
    srPlanets[p] = { absDeg: Math.round(abs * 100) / 100, sign: pos.sign, degree: Math.floor(pos.degree), minutes: (pos as any).minutes || 0, retrograde: !!(pos as any).isRetrograde };
  }

  // Natal planet positions
  const natalPlanets: Record<string, { absDeg: number; sign: string; degree: number; minutes: number }> = {};
  for (const p of WHEEL_PLANETS) {
    const pos = natalChart.planets?.[p as keyof typeof natalChart.planets];
    if (!pos) continue;
    const abs = toAbs(pos);
    if (abs === null) continue;
    natalPlanets[p] = { absDeg: Math.round(abs * 100) / 100, sign: pos.sign, degree: Math.floor(pos.degree), minutes: (pos as any).minutes || 0 };
  }

  // SR house cusps in absolute degrees
  const srCusps: Record<string, { absDeg: number; sign: string; degree: number }> = {};
  for (let i = 1; i <= 12; i++) {
    const key = `house${i}` as keyof typeof srChart.houseCusps;
    const cusp = srChart.houseCusps?.[key];
    if (cusp) {
      const abs = toAbs(cusp);
      if (abs !== null) srCusps[`house${i}`] = { absDeg: Math.round(abs * 100) / 100, sign: cusp.sign, degree: Math.floor(cusp.degree) };
    }
  }

  // Natal house cusps
  const natalCusps: Record<string, { absDeg: number; sign: string; degree: number }> = {};
  for (let i = 1; i <= 12; i++) {
    const key = `house${i}` as keyof typeof natalChart.houseCusps;
    const cusp = natalChart.houseCusps?.[key];
    if (cusp) {
      const abs = toAbs(cusp);
      if (abs !== null) natalCusps[`house${i}`] = { absDeg: Math.round(abs * 100) / 100, sign: cusp.sign, degree: Math.floor(cusp.degree) };
    }
  }

  return {
    srPlanets,
    natalPlanets,
    srCusps,
    natalCusps,
    srAspects: (analysis.srInternalAspects || []).map((a: any) => ({
      planet1: a.planet1, planet2: a.planet2, type: a.type, orb: a.orb,
    })),
    srToNatalAspects: (analysis.srToNatalAspects || []).slice(0, 30).map((a: any) => ({
      planet1: a.planet1, planet2: a.planet2, type: a.type, orb: a.orb,
    })),
  };
}

// ─── Personal Planetary Hours Interpretation ────────────────────────
const PLANETARY_HOUR_VIBES: Record<string, { feel: string; double: string }> = {
  Sun:     { feel: 'You\'ll feel a surge of confidence and clarity — this is a year where your sense of purpose feels strong from the start. You wake up knowing who you are.', double: 'Double Sun energy makes this a powerfully self-defining year. You radiate authority and attract recognition without trying.' },
  Moon:    { feel: 'You\'ll feel emotionally heightened and deeply intuitive — this year begins with a sense of inner knowing. Trust what your body and feelings are telling you.', double: 'Double Moon energy makes this a profoundly emotional and inward year. Home, family, and your inner world take center stage.' },
  Mercury: { feel: 'You\'ll feel mentally sharp and communicative — ideas flow easily and connections happen through conversation. This is a year of learning and expressing.', double: 'Double Mercury energy makes this a year dominated by communication, learning, and mental agility. Words carry extra weight.' },
  Venus:   { feel: 'You\'ll feel magnetic, warm, and drawn to beauty — this year opens with grace and ease. Love, pleasure, and creative inspiration feel close.', double: 'Double Venus energy makes this a year saturated with beauty, love, and sensory pleasure. Relationships and creativity flourish.' },
  Mars:    { feel: 'You\'ll feel fired up and ready to act — there\'s an urgency to get things moving. Channel this energy into bold projects rather than frustration.', double: 'Double Mars energy makes this a year of intense drive and physical vitality. You have the fuel to conquer, but watch for burnout and conflicts.' },
  Jupiter: { feel: 'You\'ll feel expansive, optimistic, and lucky — opportunities seem to appear out of nowhere. This is a year where faith in the future pays off.', double: 'Double Jupiter energy makes this a year of extraordinary growth and abundance. Generosity flows both ways — give freely and receive fully.' },
  Saturn:  { feel: 'You\'ll feel grounded, serious, and focused on what matters — there\'s a mature energy that asks you to do the real work. Discipline is your superpower this year.', double: 'Double Saturn energy makes this a year of serious commitment and structural change. What you build now is meant to last decades.' },
};

function generatePersonalPlanetaryHoursInterpretation(hourPlanet: string, dayPlanet: string): string {
  if (hourPlanet === dayPlanet) {
    return PLANETARY_HOUR_VIBES[hourPlanet]?.double || `Your Solar Return occurs during a ${hourPlanet} hour on a ${dayPlanet} day — doubled planetary energy amplifies this planet's themes all year.`;
  }
  const hourVibe = PLANETARY_HOUR_VIBES[hourPlanet]?.feel || `The ${hourPlanet} hour colors your birthday moment with ${hourPlanet}'s energy.`;
  const dayVibe = PLANETARY_HOUR_VIBES[dayPlanet]?.feel || '';
  const blend = dayVibe ? ` Meanwhile, the ${dayPlanet} day adds a backdrop of ${dayPlanet.toLowerCase()} themes to the entire day.` : '';
  return `${hourVibe}${blend}`;
}

// ─── Planetary Hours at SR Moment ───────────────────────────────────
function buildPlanetaryHoursAtSR(srChart: SolarReturnChart) {
  const locationStr = srChart.solarReturnLocation || srChart.birthLocation || '';
  const lat = parseLatitudeFromLocation(locationStr);
  if (!lat) return null;

  // Estimate longitude from location (rough)
  let lng = 0;
  const coordMatch = locationStr.match(/([-]?\d+\.?\d*)\s*,\s*([-]?\d+\.?\d*)/);
  if (coordMatch) lng = parseFloat(coordMatch[2]);

  const srDateTime = srChart.solarReturnDateTime || srChart.birthDate;
  if (!srDateTime) return null;

  const srDate = new Date(srDateTime);
  if (isNaN(srDate.getTime())) return null;

  try {
    const hours = calculatePlanetaryHours(srDate, lat, lng);
    const dayRuler = getDayRuler(srDate);

    // Find which planetary hour the SR moment falls in
    const srHour = hours.find(h => srDate >= h.start && srDate < h.end);

    return {
      dayRuler: { planet: dayRuler.planet, symbol: dayRuler.symbol, dayName: dayRuler.dayName },
      srMomentHour: srHour ? {
        planet: srHour.planet,
        symbol: srHour.symbol,
        meaning: PLANETARY_HOUR_MEANINGS[srHour.planet as keyof typeof PLANETARY_HOUR_MEANINGS]?.bestFor || [],
        isDay: srHour.isDay,
      } : null,
      allHours: hours.map(h => ({
        planet: h.planet,
        symbol: h.symbol,
        isDay: h.isDay,
        start: h.start.toISOString(),
        end: h.end.toISOString(),
        bestFor: PLANETARY_HOUR_MEANINGS[h.planet as keyof typeof PLANETARY_HOUR_MEANINGS]?.bestFor || [],
      })),
      interpretation: srHour
        ? generatePersonalPlanetaryHoursInterpretation(srHour.planet, dayRuler.planet)
        : 'Planetary hour could not be determined for the Solar Return moment.',
    };
  } catch {
    return null;
  }
}

function getSolarReturnReferenceDate(srChart: SolarReturnChart, natalChart: NatalChart) {
  if (srChart.solarReturnDateTime) {
    const parsed = new Date(srChart.solarReturnDateTime);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (natalChart.birthDate) {
    const [, month, day] = natalChart.birthDate.split('-').map(Number);
    if (month && day) {
      return new Date(Date.UTC(srChart.solarReturnYear, month - 1, day, 12, 0, 0));
    }
  }

  return new Date();
}

function buildPsychologicalProfileExport(natalChart: NatalChart, srChart: SolarReturnChart) {
  const natal = computePsychProfile(natalChart as any);
  const solarReturn = computePsychProfile(srChart as any);
  const blended = computeBlendedProfile(natalChart as any, srChart as any);
  return { natal, solarReturn, sr: solarReturn, blended };
}

function buildSecondaryProgressionsExport(natalChart: NatalChart, srChart: SolarReturnChart) {
  const referenceDate = getSolarReturnReferenceDate(srChart, natalChart);
  const progressions = calculateSecondaryProgressions(natalChart, referenceDate);
  if (!progressions) return null;

  const moonInfo = getProgressedMoonInfo(progressions, natalChart);
  const aspects = findProgressedAspects(progressions, natalChart, 2);

  return {
    referenceDate: referenceDate.toISOString(),
    progressedDate: progressions.progressedDate.toISOString(),
    ageInYears: Number(progressions.ageInYears.toFixed(4)),
    planets: progressions.planets,
    moonInfo: moonInfo ? {
      sign: moonInfo.sign,
      degree: moonInfo.degree,
      house: moonInfo.house,
      phase: moonInfo.phase,
      detailedPhase: moonInfo.detailedPhase,
      monthsUntilSignChange: moonInfo.monthsUntilSignChange,
      signChangeDate: moonInfo.signChangeDate?.toISOString(),
      nextSign: moonInfo.nextSign,
      currentExperience: moonInfo.currentExperience,
      upcomingShift: moonInfo.upcomingShift,
    } : null,
    aspects: aspects.slice(0, 10),
  };
}

function buildSynthesisSectionsExport(sections: SolarReturnAnalysis['synthesisSections']) {
  return (sections || []).map((section) => ({
    ...section,
    content: (section as any).content || section.narrative || section.interpretation || '',
  }));
}

// ── Standalone Birthday Gift JSON export (no AI, no component state needed) ──
export function downloadBirthdayJSONStandalone(
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  aiReadings?: { plain: string; astro: string }
) {
  // Correct Ascendant in planet positions — houseCusps.house1 is definitive
  const correctedNatalPlanets = { ...natalChart.planets };
  if (natalChart.houseCusps?.house1?.sign && correctedNatalPlanets.Ascendant) {
    correctedNatalPlanets.Ascendant = { ...correctedNatalPlanets.Ascendant, sign: natalChart.houseCusps.house1.sign, degree: natalChart.houseCusps.house1.degree, minutes: natalChart.houseCusps.house1.minutes || 0 };
  }
  const correctedSrPlanets = { ...srChart.planets };
  if (srChart.houseCusps?.house1?.sign && (correctedSrPlanets as any).Ascendant) {
    (correctedSrPlanets as any).Ascendant = { ...(correctedSrPlanets as any).Ascendant, sign: srChart.houseCusps.house1.sign, degree: srChart.houseCusps.house1.degree, minutes: srChart.houseCusps.house1.minutes || 0 };
  }

  const mappedPlanetPositions = Object.entries(correctedNatalPlanets || {}).map(([planet, data]) => ({
    planet,
    natalPosition: `${(data as any).sign} ${Math.floor((data as any).degree || 0)}°`,
    natalHouse: String((data as any).house || '').replace(/^H/, ''),
    srPosition: (() => {
      const srPlanet = (correctedSrPlanets as any)?.[planet];
      return srPlanet ? `${srPlanet.sign} ${Math.floor(srPlanet.degree || 0)}°` : '';
    })(),
    srHouse: String(analysis.planetSRHouses?.[planet] || '').replace(/^H/, ''),
    shift: (() => {
      const natal = (data as any).sign;
      const sr = (correctedSrPlanets as any)?.[planet]?.sign;
      return (!sr || natal === sr) ? 'Same sign' : `${natal} → ${sr}`;
    })(),
  }));

  const mappedSrToNatalAspects = (analysis.srToNatalAspects || []).map((a: any) => {
    const base: Record<string, any> = {
      srPlanet: a.planet1 || a.srPlanet || '',
      natalPlanet: a.planet2 || a.natalPlanet || '',
      aspectType: a.type || a.aspect || a.aspectType || '',
      orb: a.orb ?? null,
      interpretation: a.interpretation || '',
    };
    if (a.exactDate) base.exactDate = a.exactDate;
    return base;
  });

  const profYear = analysis.profectionYear;
  const mappedProfectionYear = profYear ? {
    ...profYear,
    house: (profYear as any).house || (profYear as any).houseNumber || null,
  } : null;

  // Permanent cake image URL from cloud storage
  const natalSun = natalChart.planets?.Sun?.sign || '';
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const cakeImageUrl = natalSun
    ? `${SUPABASE_URL}/storage/v1/object/public/cakes/${natalSun.toLowerCase()}.png`
    : '';

  // Calculate the effective Solar Return year. If srChart.solarReturnYear is missing,
  // invalid, or matches the birth year (which would mean age 0 — never a real SR),
  // fall back to the current calendar year so we never export a birth-year SR.
  const birthYear = natalChart.birthDate ? parseInt(natalChart.birthDate.slice(0, 4), 10) : NaN;
  const rawSrYear = Number(srChart.solarReturnYear);
  const currentYear = new Date().getFullYear();
  const isValidSrYear = Number.isFinite(rawSrYear)
    && rawSrYear > 1900 && rawSrYear < 2200
    && (isNaN(birthYear) || rawSrYear !== birthYear);
  const effectiveSrYear = isValidSrYear ? rawSrYear : currentYear;
  const srAge = !isNaN(birthYear) ? effectiveSrYear - birthYear : null;

  const payload = {
    report_type: "solar_return_birthday",
    data: {
      name: natalChart.name || '',
      cakeImageUrl,
      birthDate: natalChart.birthDate || '',
      birthLocation: natalChart.birthLocation || '',
      solarReturnYear: effectiveSrYear,
      solarReturnYearSpan: '',
      solarReturnAge: srAge,
      solarReturnLabel: srAge !== null
        ? `Solar Return Year ${srAge}`
        : `Solar Return`,
      natalSun: natalChart.planets?.Sun?.sign || '',
      natalSunDesc: SIGN_DESCRIPTIONS[natalChart.planets?.Sun?.sign || '']?.sun || '',
      natalMoon: natalChart.planets?.Moon?.sign || '',
      natalMoonDesc: SIGN_DESCRIPTIONS[natalChart.planets?.Moon?.sign || '']?.moon || '',
      natalRising: natalChart.houseCusps?.house1?.sign || '',
      natalRisingDesc: SIGN_DESCRIPTIONS[natalChart.houseCusps?.house1?.sign || '']?.rising || '',
      srSun: natalChart.planets?.Sun?.sign || '',
      srMoon: analysis.moonSign || '',
      srMoonDesc: SIGN_DESCRIPTIONS[analysis.moonSign || '']?.moon || '',
      srRising: analysis.yearlyTheme?.ascendantSign || '',
      srRisingDesc: SIGN_DESCRIPTIONS[analysis.yearlyTheme?.ascendantSign || '']?.rising || '',
      yearlyTheme: analysis.yearlyTheme,
      sunHouse: analysis.sunHouse,
      sunNatalHouse: analysis.sunNatalHouse,
      moonHouse: analysis.moonHouse,
      moonNatalHouse: analysis.moonNatalHouse,
      profectionYear: mappedProfectionYear,
      lordOfTheYear: analysis.lordOfTheYear,
      moonPhase: analysis.moonPhase,
      moonAngularity: analysis.moonAngularity,
      moonLateDegree: analysis.moonLateDegree,
      moonVOC: analysis.moonVOC,
      moonMetonicAges: analysis.moonMetonicAges,
      srMoonAspects: analysis.srMoonAspects,
      stelliums: analysis.stelliums,
      srToNatalAspects: mappedSrToNatalAspects,
      srInternalAspects: analysis.srInternalAspects,
      angularPlanets: analysis.angularPlanets,
      angularPlanetsDetailed: analysis.angularPlanetsDetailed,
      planetPositions: mappedPlanetPositions,
      houseOverlays: analysis.houseOverlays,
      elementBalance: analysis.elementBalance,
      modalityBalance: analysis.modalityBalance,
      hemisphericEmphasis: analysis.hemisphericEmphasis,
      saturnFocus: analysis.saturnFocus,
      nodesFocus: analysis.nodesFocus,
      retrogrades: analysis.retrogrades,
      srAscRulerInNatal: analysis.srAscRulerInNatal,
      srAscInNatalHouse: analysis.srAscInNatalHouse,
      natalDegreeConduits: analysis.natalDegreeConduits,
      repeatedThemes: analysis.repeatedThemes,
      planetSRHouses: analysis.planetSRHouses,
      vertex: analysis.vertex,
      // Tier 4
      mutualReceptions: analysis.mutualReceptions,
      dignityReport: analysis.dignityReport,
      healthOverlay: analysis.healthOverlay,
      eclipseSensitivity: analysis.eclipseSensitivity,
      enhancedRetrogrades: analysis.enhancedRetrogrades,
      quarterlyFocus: analysis.quarterlyFocus,
      dominantPlanets: analysis.dominantPlanets,
      // Tier 5
      fixedStars: analysis.fixedStars,
      arabicParts: analysis.arabicParts,
      firdaria: analysis.firdaria,
      antisciaContacts: analysis.antisciaContacts,
      solarArcs: analysis.solarArcs,
      synthesisSections: buildSynthesisSectionsExport(analysis.synthesisSections),
      midpointHits: analysis.midpointHits,
      prenatalEclipse: analysis.prenatalEclipse,
      planetarySpeeds: analysis.planetarySpeeds,
      heliacalRising: analysis.heliacalRising,
      // New: Executive Summary, Action Guidance, Activation Windows
      executiveSummary: generateExecutiveSummary(analysis, natalChart),
      actionGuidance: (() => {
        const srPlanets: Record<string, { sign?: string; isRetrograde?: boolean }> = {};
        for (const [key, val] of Object.entries(srChart.planets || {})) {
          if (val) srPlanets[key] = { sign: (val as any).sign, isRetrograde: (val as any).isRetrograde };
        }
        return generateActionGuidance(analysis.planetSRHouses, srPlanets);
      })(),
      activationWindows: (() => {
        const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
        const toAbs = (pos: any): number | null => {
          if (!pos?.sign) return null;
          const idx = SIGNS.indexOf(pos.sign);
          if (idx < 0) return null;
          return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
        };
        const srPositions: Record<string, number> = {};
        const keyTargets = ['Sun', 'Moon', 'Ascendant', 'Mars', 'Jupiter', 'Saturn', 'Venus', 'Mercury'];
        for (const p of keyTargets) {
          const pos = srChart.planets?.[p as keyof typeof srChart.planets];
          const deg = pos ? toAbs(pos) : null;
          if (deg !== null) srPositions[p] = deg;
        }
        const bd = natalChart.birthDate || '';
        const parts = bd.split('-');
        const bMonth = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : 0;
        const bDay = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
        const data = calculateActivationWindows(srPositions, srChart.solarReturnYear, bMonth, bDay);
        // Serialize dates to strings for JSON
        return {
          peakPeriods: data.peakPeriods,
          monthlyThemes: data.monthlyThemes.map(m => ({
            ...m,
            transitHits: m.transitHits.map(h => ({
              ...h,
              exactDate: h.exactDate.toISOString(),
              windowStart: h.windowStart.toISOString(),
              windowEnd: h.windowEnd.toISOString(),
            })),
          })),
          transitHitCount: data.transitHits.length,
          windowCount: data.activationWindows.length,
        };
      })(),
      identityShift: generateIdentityShift(analysis, srChart, natalChart),
      lifeDomainScores: calculateLifeDomainScores(analysis),
      powerPortrait: generatePowerPortrait(analysis, natalChart, srChart),
      domainDeepDives: generateDomainDeepDives(analysis, natalChart, srChart).map(d => ({
        ...d,
        narrative: d.synthesis.paragraph,
        drivers: d.keyPlanets.map(p => ({ planet: p.planet, sign: p.sign, house: p.house, role: p.role, tone: p.tone })),
      })),
      psychologicalProfile: buildPsychologicalProfileExport(natalChart, srChart),
      secondaryProgressions: buildSecondaryProgressionsExport(natalChart, srChart),
      sabianSymbols: (() => {
        const results: Record<string, { degree: number; sign: string; symbol: string; meaning: string; interpretation: string }> = {};
        const targets = [
          { key: 'srSun', pos: srChart.planets?.Sun, label: 'Solar Return Sun' },
          { key: 'srMoon', pos: srChart.planets?.Moon, label: 'Solar Return Moon' },
          { key: 'srAscendant', pos: srChart.houseCusps?.house1, label: 'Solar Return Ascendant' },
          { key: 'natalSun', pos: natalChart.planets?.Sun, label: 'Natal Sun' },
          { key: 'natalMoon', pos: natalChart.planets?.Moon, label: 'Natal Moon' },
          { key: 'natalAscendant', pos: natalChart.houseCusps?.house1, label: 'Natal Ascendant' },
        ];
        for (const { key, pos, label } of targets) {
          if (pos?.sign && pos?.degree != null) {
            const sabian = getSabianSymbol(pos.degree, pos.sign);
            const interpText = sabian.meaning
              ? `Your ${label} at ${Math.floor(pos.degree)}° ${pos.sign} carries this symbol's energy. ${sabian.meaning}`
              : `This degree activates subtle ${pos.sign} themes through your ${label}.`;
            results[key] = { degree: Math.floor(pos.degree), sign: pos.sign, ...sabian, interpretation: interpText };
          }
        }
        return results;
      })(),
      contradictions: detectContradictions(analysis, srChart),
      lunarWeatherMap: generateLunarWeatherMap(analysis, srChart, natalChart),
      astrocartography: calculateAstrocartography(srChart, natalChart),
      chartWheelData: buildChartWheelData(srChart, natalChart, analysis),
      planetaryHoursAtSR: buildPlanetaryHoursAtSR(srChart),
      // AI-generated readings (both modes, if available)
      aiReadingPlain: aiReadings?.plain || null,
      aiReadingAstro: aiReadings?.astro || null,
      // ─── Structured summary objects ───
      yearSummary: buildYearSummary(analysis, natalChart, srChart),
      scoredAspects: (() => {
        const bd = natalChart.birthDate || '';
        const bMonth = bd.split('-').length >= 2 ? parseInt(bd.split('-')[1], 10) - 1 : 0;
        return scoreAspects(analysis.srToNatalAspects || [], bMonth);
      })(),
      topThemes: (() => {
        const bd = natalChart.birthDate || '';
        const bMonth = bd.split('-').length >= 2 ? parseInt(bd.split('-')[1], 10) - 1 : 0;
        return generateTopThemes(scoreAspects(analysis.srToNatalAspects || [], bMonth));
      })(),
      houseEmphasis: buildHouseEmphasis(analysis),
      lunarFlow: buildLunarFlow(analysis, srChart, natalChart),
      patternTracking: buildPatternTracking(analysis, natalChart, srChart),
      finalAdvice: buildFinalAdvice(analysis, natalChart, srChart),
      reportStructureOrder: [
        'yearSummary', 'topThemes', 'identityDirection', 'relationships',
        'careerMoney', 'emotionalMoon', 'healthEnergy', 'houseEmphasis',
        'majorAspectsRanked', 'activationWindows', 'monthlyOverview',
        'advancedTechniques', 'patternTracking', 'finalAdvice',
      ],
    }
  };

  const cleaned = stripDashesDeep(stripEmpty(payload) || payload, natalChart.name);
  const blob = new Blob([JSON.stringify(cleaned, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SolarReturn_Birthday_${(natalChart.name || 'chart').replace(/\s+/g, '_')}_${effectiveSrYear}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Build full JSON data object (reusable, no download) ──
export function buildFullJsonStandalone(
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  aiReadings?: { plain: string; astro: string }
): Record<string, any> {
  // Correct Ascendant in planet positions — houseCusps.house1 is definitive
  const correctedNatalPlanets2 = { ...natalChart.planets };
  if (natalChart.houseCusps?.house1?.sign && correctedNatalPlanets2.Ascendant) {
    correctedNatalPlanets2.Ascendant = { ...correctedNatalPlanets2.Ascendant, sign: natalChart.houseCusps.house1.sign, degree: natalChart.houseCusps.house1.degree, minutes: natalChart.houseCusps.house1.minutes || 0 };
  }
  const correctedSrPlanets2 = { ...srChart.planets };
  if (srChart.houseCusps?.house1?.sign && (correctedSrPlanets2 as any).Ascendant) {
    (correctedSrPlanets2 as any).Ascendant = { ...(correctedSrPlanets2 as any).Ascendant, sign: srChart.houseCusps.house1.sign, degree: srChart.houseCusps.house1.degree, minutes: srChart.houseCusps.house1.minutes || 0 };
  }

  const mappedPlanetPositions = Object.entries(correctedNatalPlanets2 || {}).map(([planet, data]) => ({
    planet,
    natalPosition: `${(data as any).sign} ${Math.floor((data as any).degree || 0)}°`,
    natalHouse: String((data as any).house || '').replace(/^H/, ''),
    srPosition: (() => {
      const srPlanet = (correctedSrPlanets2 as any)?.[planet];
      return srPlanet ? `${srPlanet.sign} ${Math.floor(srPlanet.degree || 0)}°` : '';
    })(),
    srHouse: String(analysis.planetSRHouses?.[planet] || '').replace(/^H/, ''),
    shift: (() => {
      const natal = (data as any).sign;
      const sr = (correctedSrPlanets2 as any)?.[planet]?.sign;
      return (!sr || natal === sr) ? 'Same sign' : `${natal} → ${sr}`;
    })(),
  }));

  const mappedSrToNatalAspects = (analysis.srToNatalAspects || []).map((a: any) => {
    const base: Record<string, any> = {
      srPlanet: a.planet1 || a.srPlanet || '',
      natalPlanet: a.planet2 || a.natalPlanet || '',
      aspectType: a.type || a.aspect || a.aspectType || '',
      orb: a.orb ?? null,
      interpretation: a.interpretation || '',
    };
    if (a.exactDate) base.exactDate = a.exactDate;
    return base;
  });

  const profYear = analysis.profectionYear;
  const mappedProfectionYear = profYear ? {
    ...profYear,
    house: (profYear as any).house || (profYear as any).houseNumber || null,
  } : null;

  const natalSun = natalChart.planets?.Sun?.sign || '';
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const cakeImageUrl = natalSun
    ? `${SUPABASE_URL}/storage/v1/object/public/cakes/${natalSun.toLowerCase()}.png`
    : '';

  // Calculate the effective Solar Return year (see downloadBirthdayJSONStandalone for rationale).
  const birthYear2 = natalChart.birthDate ? parseInt(natalChart.birthDate.slice(0, 4), 10) : NaN;
  const rawSrYear2 = Number(srChart.solarReturnYear);
  const currentYear2 = new Date().getFullYear();
  const isValidSrYear2 = Number.isFinite(rawSrYear2)
    && rawSrYear2 > 1900 && rawSrYear2 < 2200
    && (isNaN(birthYear2) || rawSrYear2 !== birthYear2);
  const effectiveSrYear2 = isValidSrYear2 ? rawSrYear2 : currentYear2;
  const srAge2 = !isNaN(birthYear2) ? effectiveSrYear2 - birthYear2 : null;

  return {
    name: natalChart.name || '',
    cakeImageUrl,
    birthDate: natalChart.birthDate || '',
    birthLocation: natalChart.birthLocation || '',
    solarReturnYear: effectiveSrYear2,
    solarReturnYearSpan: '',
    solarReturnAge: srAge2,
    solarReturnLabel: srAge2 !== null
      ? `Solar Return Year ${srAge2}`
      : `Solar Return`,
    natalSun: natalChart.planets?.Sun?.sign || '',
    natalSunDesc: SIGN_DESCRIPTIONS[natalChart.planets?.Sun?.sign || '']?.sun || '',
    natalMoon: natalChart.planets?.Moon?.sign || '',
    natalMoonDesc: SIGN_DESCRIPTIONS[natalChart.planets?.Moon?.sign || '']?.moon || '',
    natalRising: natalChart.houseCusps?.house1?.sign || '',
    natalRisingDesc: SIGN_DESCRIPTIONS[natalChart.houseCusps?.house1?.sign || '']?.rising || '',
    srSun: natalChart.planets?.Sun?.sign || '',
    srMoon: analysis.moonSign || '',
    srMoonDesc: SIGN_DESCRIPTIONS[analysis.moonSign || '']?.moon || '',
    srRising: analysis.yearlyTheme?.ascendantSign || '',
    srRisingDesc: SIGN_DESCRIPTIONS[analysis.yearlyTheme?.ascendantSign || '']?.rising || '',
    yearlyTheme: analysis.yearlyTheme,
    sunHouse: analysis.sunHouse,
    sunNatalHouse: analysis.sunNatalHouse,
    moonHouse: analysis.moonHouse,
    moonNatalHouse: analysis.moonNatalHouse,
    profectionYear: mappedProfectionYear,
    lordOfTheYear: analysis.lordOfTheYear,
    moonPhase: analysis.moonPhase,
    moonAngularity: analysis.moonAngularity,
    moonLateDegree: analysis.moonLateDegree,
    moonVOC: analysis.moonVOC,
    moonMetonicAges: analysis.moonMetonicAges,
    srMoonAspects: analysis.srMoonAspects,
    stelliums: analysis.stelliums,
    srToNatalAspects: mappedSrToNatalAspects,
    srInternalAspects: analysis.srInternalAspects,
    angularPlanets: analysis.angularPlanets,
    angularPlanetsDetailed: analysis.angularPlanetsDetailed,
    planetPositions: mappedPlanetPositions,
    houseOverlays: analysis.houseOverlays,
    elementBalance: analysis.elementBalance,
    modalityBalance: analysis.modalityBalance,
    hemisphericEmphasis: analysis.hemisphericEmphasis,
    saturnFocus: analysis.saturnFocus,
    nodesFocus: analysis.nodesFocus,
    retrogrades: analysis.retrogrades,
    vertex: analysis.vertex,
    srAscRulerInNatal: analysis.srAscRulerInNatal,
    srAscInNatalHouse: analysis.srAscInNatalHouse,
    natalDegreeConduits: analysis.natalDegreeConduits,
    repeatedThemes: analysis.repeatedThemes,
    planetSRHouses: analysis.planetSRHouses,
    mutualReceptions: analysis.mutualReceptions,
    dignityReport: analysis.dignityReport,
    healthOverlay: analysis.healthOverlay,
    eclipseSensitivity: analysis.eclipseSensitivity,
    enhancedRetrogrades: analysis.enhancedRetrogrades,
    quarterlyFocus: analysis.quarterlyFocus,
    dominantPlanets: analysis.dominantPlanets,
    fixedStars: analysis.fixedStars,
    arabicParts: analysis.arabicParts,
    firdaria: analysis.firdaria,
    antisciaContacts: analysis.antisciaContacts,
    solarArcs: analysis.solarArcs,
    synthesisSections: buildSynthesisSectionsExport(analysis.synthesisSections),
    midpointHits: analysis.midpointHits,
    prenatalEclipse: analysis.prenatalEclipse,
    planetarySpeeds: analysis.planetarySpeeds,
    heliacalRising: analysis.heliacalRising,
    executiveSummary: generateExecutiveSummary(analysis, natalChart),
    actionGuidance: (() => {
      const srPlanets: Record<string, { sign?: string; isRetrograde?: boolean }> = {};
      for (const [key, val] of Object.entries(srChart.planets || {})) {
        if (val) srPlanets[key] = { sign: (val as any).sign, isRetrograde: (val as any).isRetrograde };
      }
      return generateActionGuidance(analysis.planetSRHouses, srPlanets);
    })(),
    activationWindows: (() => {
      const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
      const toAbs = (pos: any): number | null => {
        if (!pos?.sign) return null;
        const idx = SIGNS.indexOf(pos.sign);
        if (idx < 0) return null;
        return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
      };
      const srPositions: Record<string, number> = {};
      const keyTargets = ['Sun', 'Moon', 'Ascendant', 'Mars', 'Jupiter', 'Saturn', 'Venus', 'Mercury'];
      for (const p of keyTargets) {
        const pos = srChart.planets?.[p as keyof typeof srChart.planets];
        const deg = pos ? toAbs(pos) : null;
        if (deg !== null) srPositions[p] = deg;
      }
      const bd = natalChart.birthDate || '';
      const parts = bd.split('-');
      const bMonth = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : 0;
      const bDay = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
      const data = calculateActivationWindows(srPositions, srChart.solarReturnYear, bMonth, bDay);
      return {
        peakPeriods: data.peakPeriods,
        monthlyThemes: data.monthlyThemes.map(m => ({
          ...m,
          transitHits: m.transitHits.map(h => ({
            ...h,
            exactDate: h.exactDate.toISOString(),
            windowStart: h.windowStart.toISOString(),
            windowEnd: h.windowEnd.toISOString(),
          })),
        })),
        transitHitCount: data.transitHits.length,
        windowCount: data.activationWindows.length,
      };
    })(),
    identityShift: generateIdentityShift(analysis, srChart, natalChart),
    lifeDomainScores: calculateLifeDomainScores(analysis),
    powerPortrait: generatePowerPortrait(analysis, natalChart, srChart),
    domainDeepDives: generateDomainDeepDives(analysis, natalChart, srChart).map(d => ({
      ...d,
      narrative: d.synthesis.paragraph,
      drivers: d.keyPlanets.map(p => ({ planet: p.planet, sign: p.sign, house: p.house, role: p.role, tone: p.tone })),
    })),
    psychologicalProfile: buildPsychologicalProfileExport(natalChart, srChart),
    secondaryProgressions: buildSecondaryProgressionsExport(natalChart, srChart),
    sabianSymbols: (() => {
      const results: Record<string, { degree: number; sign: string; symbol: string; meaning: string; interpretation: string }> = {};
      const targets = [
        { key: 'srSun', pos: srChart.planets?.Sun, label: 'Solar Return Sun' },
        { key: 'srMoon', pos: srChart.planets?.Moon, label: 'Solar Return Moon' },
        { key: 'srAscendant', pos: srChart.houseCusps?.house1, label: 'Solar Return Ascendant' },
        { key: 'natalSun', pos: natalChart.planets?.Sun, label: 'Natal Sun' },
        { key: 'natalMoon', pos: natalChart.planets?.Moon, label: 'Natal Moon' },
        { key: 'natalAscendant', pos: natalChart.houseCusps?.house1, label: 'Natal Ascendant' },
      ];
      for (const { key, pos, label } of targets) {
        if (pos?.sign && pos?.degree != null) {
          const sabian = getSabianSymbol(pos.degree, pos.sign);
          const interpText = sabian.meaning
            ? `Your ${label} at ${Math.floor(pos.degree)}° ${pos.sign} carries this symbol's energy. ${sabian.meaning}`
            : `This degree activates subtle ${pos.sign} themes through your ${label}.`;
          results[key] = { degree: Math.floor(pos.degree), sign: pos.sign, ...sabian, interpretation: interpText };
        }
      }
      return results;
    })(),
    contradictions: detectContradictions(analysis, srChart),
    lunarWeatherMap: generateLunarWeatherMap(analysis, srChart, natalChart),

    // Year priorities (ranked themes with scores and confidence levels)
    yearPriorities: computeYearPriorities(analysis, natalChart, srChart),

    // Lunar phase timeline (29-year SR Moon phase cycle)
    lunarPhaseTimeline: (() => {
      const sun = natalChart.planets?.Sun;
      if (!sun) return [];
      return computeLunarPhaseTimeline(sun.sign, sun.degree, sun.minutes, natalChart.birthDate, srChart.solarReturnYear);
    })(),

    // Natal house cusps (for rendering wheels)
    natalHouseCusps: natalChart.houseCusps,

    // SR house cusps
    srHouseCusps: srChart.houseCusps,

    // Full natal planet data (raw)
    natalPlanetsRaw: natalChart.planets,

    // Full SR planet data (raw)
    srPlanetsRaw: srChart.planets,

    // Lookup data for rendering plain-language explanations
    lookups: {
      planetBrings: {
        Sun: 'your main focus and where you put the most effort',
        Moon: 'your emotional attention and daily mood',
        Mercury: 'conversations, decisions, and mental energy',
        Venus: 'pleasure, connection, and what you enjoy',
        Mars: 'drive, action, and where you push hardest',
        Jupiter: 'growth, luck, and expansion',
        Saturn: 'responsibility, pressure, and hard work',
        Uranus: 'surprises, changes, and restlessness',
        Neptune: 'dreams, imagination, and possible confusion',
        Pluto: 'deep change and intensity',
        Ascendant: 'how you approach the entire year',
      },
      houseExamples: {
        1: 'decisions about your appearance, fitness, personal direction, and "who am I now?" moments',
        2: 'conversations about money, spending decisions, salary negotiations, and questions about what matters to you',
        3: 'emails, phone calls, texts, learning something new, trips around town, and interactions with siblings or neighbors',
        4: 'home renovations, family gatherings, moving decisions, cooking, and emotional processing in private',
        5: 'dates, creative projects, time with children, hobbies, and moments of pure fun or self-expression',
        6: 'doctor appointments, new workout routines, work projects, organizing your schedule, and health changes',
        7: 'relationship conversations, partnership decisions, contracts, and one-on-one dynamics with important people',
        8: 'bills, shared finances, insurance, therapy sessions, honest conversations about trust, and letting go of old baggage',
        9: 'travel plans, taking a class, reading books that change your mind, and rethinking what you believe',
        10: 'job interviews, promotions, public recognition, career pivots, and being seen by a wider audience',
        11: 'group events, friendships forming or shifting, volunteer work, and thinking about your long-term future',
        12: 'alone time, dreams, meditation, therapy, hospital visits, and quiet inner processing',
      },
      houseMeanings: {
        1: 'Identity, body, self-definition',
        2: 'Money, resources, self-worth',
        3: 'Communication, learning, siblings',
        4: 'Home, family, roots, private life',
        5: 'Creativity, romance, children, pleasure',
        6: 'Work, routines, health, daily systems',
        7: 'Relationships, partnership, agreements',
        8: 'Shared resources, intimacy, transformation',
        9: 'Beliefs, travel, higher learning, meaning',
        10: 'Career, calling, status, reputation',
        11: 'Friends, networks, communities, future goals',
        12: 'Rest, retreat, healing, spirituality',
      },
    },

    // Astrocartography — where to spend your birthday
    astrocartography: calculateAstrocartography(srChart, natalChart),

    // Chart wheel rendering data (positions in absolute degrees for SVG rendering)
    chartWheelData: buildChartWheelData(srChart, natalChart, analysis),

    // Planetary hours at the SR moment
    planetaryHoursAtSR: buildPlanetaryHoursAtSR(srChart),

    // AI-generated readings (both modes)
    aiReadingPlain: aiReadings?.plain || null,
    aiReadingAstro: aiReadings?.astro || null,

    // ─── Structured summary objects ───
    yearSummary: buildYearSummary(analysis, natalChart, srChart),
    scoredAspects: (() => {
      const bd = natalChart.birthDate || '';
      const bMonth = bd.split('-').length >= 2 ? parseInt(bd.split('-')[1], 10) - 1 : 0;
      return scoreAspects(analysis.srToNatalAspects || [], bMonth);
    })(),
    topThemes: (() => {
      const bd = natalChart.birthDate || '';
      const bMonth = bd.split('-').length >= 2 ? parseInt(bd.split('-')[1], 10) - 1 : 0;
      return generateTopThemes(scoreAspects(analysis.srToNatalAspects || [], bMonth));
    })(),
    houseEmphasis: buildHouseEmphasis(analysis),
    lunarFlow: buildLunarFlow(analysis, srChart, natalChart),
    patternTracking: buildPatternTracking(analysis, natalChart, srChart),
    finalAdvice: buildFinalAdvice(analysis, natalChart, srChart),
    reportStructureOrder: [
      'yearSummary', 'topThemes', 'identityDirection', 'relationships',
      'careerMoney', 'emotionalMoon', 'healthEnergy', 'houseEmphasis',
      'majorAspectsRanked', 'activationWindows', 'monthlyOverview',
      'advancedTechniques', 'patternTracking', 'finalAdvice',
    ],
  };
}

// ── Replace em-dashes and en-dashes with proper punctuation ──
function stripDashes(text: string, _personName?: string): string {
  if (typeof text !== 'string') return text;
  // Skip label-only strings (single short capitalized token like "Aquarius", "Sun",
  // "Conjunction"). These are raw field values and must be returned untouched —
  // do NOT append a trailing period or apply prose-cleanup to them.
  const rawTrimmed = text.trim();
  if (/^[A-Z][a-zA-Z]{1,20}\.?$/.test(rawTrimmed)) {
    // Strip any trailing period that may already be present so the value is the
    // raw label only (e.g. "Aquarius" not "Aquarius.").
    return rawTrimmed.replace(/\.$/, '');
  }
  let result = text
    .replace(/\s*[\u2014]\s*/g, '. ')   // em-dash → period + space
    .replace(/\s*[\u2013]\s*/g, ', ')    // en-dash → comma + space
    // Fix bad ordinals: 1th→1st, 2th→2nd, 3th→3rd, but keep 11th/12th/13th
    .replace(/(\d+)th\b/g, (m, num) => {
      const n = parseInt(num, 10);
      const lastTwo = n % 100;
      if (lastTwo >= 11 && lastTwo <= 13) return m; // 11th, 12th, 13th stay
      const lastOne = n % 10;
      if (lastOne === 1) return `${n}st`;
      if (lastOne === 2) return `${n}nd`;
      if (lastOne === 3) return `${n}rd`;
      return m;
    })
    // Fix periods before lowercase (likely should be commas): "Jupiter. the planet" → "Jupiter, the planet"
    .replace(/\.\s+([a-z])/g, (_, ch) => `, ${ch}`)
    // Fix truncated sentences: add period if string ends without punctuation
    .replace(/([a-zA-Z0-9])\s*$/, '$1.')
    .replace(/\.\s*\./g, '.')            // clean up double periods
    .replace(/,\s*\./g, '.')             // clean up comma-period
    .replace(/\.\s*,/g, '.')             // clean up period-comma
    .replace(/\s{2,}/g, ' ')             // collapse multiple spaces
    .trim();
  return result;
}

// ── Remove all but the first occurrence of the person's name in AI text ──
function deduplicateName(text: string, personName: string): string {
  if (!personName || typeof text !== 'string') return text;
  const firstName = personName.trim().split(/\s+/)[0];
  if (!firstName || firstName.length < 2) return text;
  // Match name with optional surrounding punctuation: "Ike," "Ike." "Ike "
  const nameRegex = new RegExp(`\\b${firstName}\\b`, 'gi');
  let count = 0;
  return text.replace(nameRegex, (match) => {
    count++;
    return count === 1 ? match : 'you';
  });
}

// ── Expand jargon fragment sentences into proper prose ──
const FRAGMENT_EXPANSIONS: Record<string, string> = {
  'culmination energy': 'The things you have been building are reaching a natural peak and becoming visible to others.',
  'growth period': 'This is a time when multiple areas of your life are expanding and developing in meaningful ways.',
  'transformation energy': 'Something deep inside you is shifting, and old patterns are making room for a stronger version of who you are.',
  'expansion energy': 'Your world is getting bigger — new opportunities, new perspectives, and new possibilities are opening up.',
  'release energy': 'This is a time to let go of what no longer serves you so that something better can take its place.',
  'new beginnings': 'Fresh starts are available to you now — the seeds you plant during this time will grow for years to come.',
};

function expandFragments(text: string): string {
  if (typeof text !== 'string') return text;
  // Skip label-only strings (single short capitalized token, with or without trailing period).
  // These are field values like sign names ("Aquarius") or planet names ("Sun"), not prose,
  // and must NOT be wrapped with phrase templates.
  const trimmed = text.trim();
  if (/^[A-Z][a-zA-Z]{1,20}\.?$/.test(trimmed)) return text;
  // Skip very short strings overall — only run this expansion on real prose (≥ 30 chars).
  if (trimmed.length < 30) return text;
  // Replace standalone fragment sentences (2-3 words ending in period) only when they
  // match a known FRAGMENT_EXPANSIONS key. Never inject a generic "This is a time of …"
  // wrapper, since that mangles raw field values that happen to be short.
  return text.replace(/(?:^|(?<=\.\s))([A-Z][a-z]+(?:\s[a-z]+){0,2})\.\s*/g, (match, fragment) => {
    const key = fragment.toLowerCase().trim();
    if (FRAGMENT_EXPANSIONS[key]) return FRAGMENT_EXPANSIONS[key] + ' ';
    return match;
  });
}

// ── Recursively clean all string values in an object ──
function stripDashesDeep(obj: any, personName?: string): any {
  if (typeof obj === 'string') return expandFragments(stripDashes(obj));
  if (Array.isArray(obj)) return obj.map(v => stripDashesDeep(v, personName));
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: any = {};
    for (const [k, v] of Object.entries(obj)) {
      let cleaned = stripDashesDeep(v, personName);
      // Deduplicate name specifically in AI reading fields
      if (personName && typeof cleaned === 'string' && (k === 'aiReadingPlain' || k === 'aiReadingAstro')) {
        cleaned = deduplicateName(cleaned, personName);
      }
      result[k] = cleaned;
    }
    return result;
  }
  return obj;
}

// ── Strip empty/null fields from JSON export ──
function stripEmpty(obj: any): any {
  if (Array.isArray(obj)) {
    const cleaned = obj.map(stripEmpty).filter(v => v !== undefined);
    return cleaned.length > 0 ? cleaned : undefined;
  }
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: any = {};
    for (const [k, v] of Object.entries(obj)) {
      const cleaned = stripEmpty(v);
      if (cleaned !== undefined) result[k] = cleaned;
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
  if (obj === '' || obj === null) return undefined;
  return obj;
}

// ── Birthday Gift Print PDF (comprehensive, no AI narrative required) ──
export async function generateBirthdayGiftPDF(
  analysis: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
  personalMessage?: string,
) {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentW = pw - margin * 2;

  const sunSign = natalChart.planets?.Sun?.sign || '';
  const signTheme = sunSign ? signColorThemes[sunSign] : undefined;
  const ctx = createPDFContext(doc, pw, ph, margin, contentW, signTheme);

  // 1. COVER
  await generatePDFCover(ctx, doc, analysis, srChart, natalChart, true, personalMessage || '', CAKE_IMAGES);

  // 2. TABLE OF CONTENTS
  doc.addPage(); ctx.y = margin;
  const tocPageNumber = doc.getNumberOfPages();
  const tocEntries = generatePDFTableOfContents(ctx, doc, analysis, '', true);

  // 3. HOW TO READ
  doc.addPage(); ctx.y = margin;
  ctx.sectionPages.set('HOW TO READ THIS REPORT', doc.getNumberOfPages());
  generateHowToReadPage(ctx, doc);

  // 4. BIG THREE — comprehensive merged section (natal + SR in depth)
  doc.addPage(); ctx.y = margin;
  ctx.sectionPages.set('YOUR BIG THREE', doc.getNumberOfPages());
  generateStrengthsPortrait(ctx, doc, natalChart, analysis, srChart);

  // 5. (removed — merged into Big Three above)

  // 6. YEAR AT A GLANCE — REMOVED (redundant: every item has its own dedicated section)

  // 7. SOLAR RETURN MOON PHASE TIMELINE
  doc.addPage(); ctx.y = margin;
  ctx.sectionPages.set('LUNAR PHASE TIMELINE', doc.getNumberOfPages());
  ctx.sectionPages.set('SR MOON PHASE BY YEAR', doc.getNumberOfPages());
  generatePDFLunarTimeline(ctx, doc, analysis, srChart, natalChart);

  // 8. NATAL OVERLAY + ANGLE ACTIVATIONS + YEAR PRIORITY
  doc.addPage(); ctx.y = margin;
  ctx.sectionPages.set('NATAL OVERLAY', doc.getNumberOfPages());
  ctx.sectionPages.set('NATAL OVERLAY AND ANGLE ACTIVATIONS', doc.getNumberOfPages());
  generatePDFNatalOverlay(ctx, doc, analysis);
  generatePDFAngleActivations(ctx, doc, natalChart, srChart, 1);
  doc.addPage(); ctx.y = margin;
  ctx.sectionPages.set('YEAR PRIORITY ENGINE', doc.getNumberOfPages());
  generatePDFYearPriority(ctx, doc, analysis, natalChart, srChart);

  // 9. MOON SHIFT
  {
    const natalMoonSign = natalChart.planets?.Moon?.sign || '';
    const srMoonSignFull = analysis.moonSign || srChart.planets.Moon?.sign || '';
    if (natalMoonSign && srMoonSignFull) {
      doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
      ctx.sectionPages.set('MOON SHIFT', doc.getNumberOfPages());
      ctx.sectionPages.set('MOON SIGN SHIFT', doc.getNumberOfPages());

      // Compact single-page header
      ctx.y += 10;
      ctx.trackedLabel(doc, 'MOON SIGN SHIFT', margin, ctx.y, { size: 7, charSpace: 3.5 });
      ctx.y += 8;
      doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
      doc.line(margin, ctx.y, margin + contentW, ctx.y);
      ctx.y += 14;

      doc.setFont('times', 'normal'); doc.setFontSize(22);
      doc.setTextColor(...ctx.colors.ink);
      doc.text('Emotional recalibration', margin, ctx.y);
      ctx.y += 14;

      doc.setFont('times', 'italic'); doc.setFontSize(10);
      doc.setTextColor(...ctx.colors.muted);
      doc.text(`${natalMoonSign} --> ${srMoonSignFull}`, margin, ctx.y);
      ctx.y += 16;

      const natalDeep = moonSignDeep[natalMoonSign];
      const srDeep = moonSignDeep[srMoonSignFull];
      const halfW = (contentW - 16) / 2;
      const colTop = ctx.y;

      // Left column
      ctx.trackedLabel(doc, 'NATAL MOON', margin + 8, ctx.y, { size: 6.5, charSpace: 3 });
      ctx.trackedLabel(doc, 'SOLAR RETURN MOON', margin + halfW + 24, ctx.y, { size: 6.5, charSpace: 3 });
      ctx.y += 12;

      doc.setFont('times', 'bold'); doc.setFontSize(14);
      doc.setTextColor(...ctx.colors.ink);
      doc.text(natalMoonSign.toUpperCase(), margin + 8, ctx.y);
      doc.text(srMoonSignFull.toUpperCase(), margin + halfW + 24, ctx.y);
      ctx.y += 12;

      doc.setFont('times', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...ctx.colors.ink);
      const natalMoonLines = doc.splitTextToSize(natalDeep?.emotional || '', halfW - 16);
      const srMoonLines = doc.splitTextToSize(srDeep?.emotional || '', halfW - 16);
      const maxLines = Math.max(Math.min(natalMoonLines.length, 4), Math.min(srMoonLines.length, 4));
      for (let li = 0; li < maxLines; li++) {
        if (natalMoonLines[li]) doc.text(natalMoonLines[li], margin + 8, ctx.y);
        if (srMoonLines[li]) doc.text(srMoonLines[li], margin + halfW + 24, ctx.y);
        ctx.y += 10;
      }
      doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
      doc.line(margin + halfW + 8, colTop, margin + halfW + 8, ctx.y - 2);
      ctx.y += 10;

      if (natalMoonSign !== srMoonSignFull) {
        const shiftY = ctx.y;
        const shiftH = 64;
        doc.setFillColor(...ctx.colors.cardBg);
        doc.roundedRect(margin, shiftY, contentW, shiftH, 3, 3, 'F');
        doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
        doc.roundedRect(margin, shiftY, contentW, shiftH, 3, 3, 'S');
        doc.setFillColor(...ctx.colors.gold);
        doc.rect(margin, shiftY, 3, shiftH, 'F');

        let sy = shiftY + 12;
        doc.setFont('times', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...ctx.colors.ink);
        doc.text(`The Shift: ${natalMoonSign} --> ${srMoonSignFull}`, margin + 10, sy);
        sy += 11;

        doc.setFont('times', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...ctx.colors.ink);
        const specificNarrative = moonShiftNarrative[natalMoonSign]?.[srMoonSignFull] || '';
        const shiftLines = doc.splitTextToSize(specificNarrative, contentW - 22);
        for (const line of shiftLines.slice(0, 3)) {
          doc.text(line, margin + 10, sy);
          sy += 9;
        }

        if (srDeep?.body || srDeep?.apply) {
          sy += 2;
          doc.setFont('times', 'italic'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.gold);
          if (srDeep?.body) doc.text(`Body: ${srDeep.body}`, margin + 10, sy);
          if (srDeep?.apply) doc.text(`Apply: ${srDeep.apply}`, margin + contentW / 2, sy);
        }

        ctx.y = shiftY + shiftH + 10;
      }

      // Moon aspects - compact rows so everything stays on one page
      if (analysis.srMoonAspects && analysis.srMoonAspects.length > 0) {
        doc.setFont('times', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...ctx.colors.ink);
        doc.text('Moon Aspects This Year', margin, ctx.y);
        ctx.y += 10;

        for (const asp of analysis.srMoonAspects.slice(0, 4)) {
          const rowY = ctx.y;
          const rowH = 24;
          doc.setFillColor(...ctx.colors.cream);
          doc.roundedRect(margin, rowY, contentW, rowH, 2.5, 2.5, 'F');
          doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.2);
          doc.roundedRect(margin, rowY, contentW, rowH, 2.5, 2.5, 'S');
          doc.setFillColor(...ctx.colors.gold);
          doc.rect(margin, rowY, 2.5, rowH, 'F');

          doc.setFont('times', 'bold'); doc.setFontSize(9.5); doc.setTextColor(...ctx.colors.ink);
          doc.text(`Moon ${asp.aspectType} ${P[asp.targetPlanet] || asp.targetPlanet}`, margin + 9, rowY + 9);

          doc.setFont('times', 'normal'); doc.setFontSize(8); doc.setTextColor(...ctx.colors.muted);
          const aspectLines = doc.splitTextToSize(asp.interpretation, contentW - 18);
          for (const line of aspectLines.slice(0, 1)) {
            doc.text(line, margin + 9, rowY + 18);
          }

          ctx.y = rowY + rowH + 6;
        }
      }
    }
  }

  // 10. NATAL VS SOLAR RETURN — visual card layout
  ctx.sectionPages.set('SOLAR RETURN VS NATAL', doc.getNumberOfPages() + 1);
  ctx.sectionPages.set('NATAL VS SOLAR RETURN', doc.getNumberOfPages() + 1);
  generateNatalVsSRCards(ctx, doc, analysis, natalChart, srChart, PLANET_IMAGES);

  // 11. STELLIUMS
  if (analysis.stelliums.length > 0) {
    const signStelliums = analysis.stelliums.filter(s => !/^\d+$/.test(String(s.location)) && !s.location.startsWith('House'));
    const houseStelliums = analysis.stelliums.filter(s => /^\d+$/.test(String(s.location)) || s.location.startsWith('House'));

    const renderStelliumCard = (s: typeof analysis.stelliums[0]) => {
      const planets = s.planets.map(pp => P[pp] || pp).join(', ');
      const isHouseStellium = /^\d+$/.test(String(s.location)) || s.location.startsWith('House');
      const houseNum = parseInt(String(s.location).replace('House ', '').replace('House', ''));
      const planetHouses = s.planets.map(pp => analysis.planetSRHouses?.[pp]).filter(Boolean) as number[];
      const primaryHouse = planetHouses.length > 0 ? planetHouses[0] : null;

      ctx.drawCard(doc, () => {
        ctx.writeBold(doc, `${s.planets.length}-Planet Stellium in ${isHouseStellium ? 'House ' + houseNum : s.location}`);
        ctx.y += 2;
        doc.setFont('times', 'bold'); doc.setFontSize(10); doc.setTextColor(...ctx.colors.ink);
        doc.text(planets, margin + 8, ctx.y);
        ctx.y += 16;

        if (!isHouseStellium) {
          const personalizedStellium = getPersonalizedStelliumText(s.location, primaryHouse, s.planets);
          ctx.writeBody(doc, personalizedStellium, ctx.colors.bodyText, 9.5, 13);
          ctx.y += 4;
          const felt = stelliumFeltSense[s.location];
          if (felt) ctx.writeCardSection(doc, 'How You Will Feel This', felt, ctx.colors.accentGreen);
        } else if (!isNaN(houseNum)) {
          const houseMeaning = stelliumHouseMeaning[houseNum];
          if (houseMeaning) ctx.writeBody(doc, houseMeaning, ctx.colors.bodyText, 9.5, 13);
        }
      });
      ctx.y += 4;
    };

    if (signStelliums.length > 0) {
      ctx.sectionTitle(doc, 'STELLIUMS -- YOUR POWER ZONES');
      ctx.sectionPages.set('STELLIUMS', doc.getNumberOfPages());
      for (const s of signStelliums) renderStelliumCard(s);
    }
    if (houseStelliums.length > 0) {
      if (signStelliums.length > 0) { ctx.checkPage(200); ctx.y += 10; ctx.drawRule(doc); ctx.y += 16; }
      else { ctx.sectionTitle(doc, 'STELLIUMS -- YOUR POWER ZONES'); ctx.sectionPages.set('STELLIUMS', doc.getNumberOfPages()); }
      for (const s of houseStelliums) renderStelliumCard(s);
    }
  }

  // 12. ELEMENT, MODALITY & ENERGY
  {
    const hasElements = !!analysis.elementBalance;
    const hasHemisphere = !!analysis.hemisphericEmphasis;
    if (hasElements || hasHemisphere) {
      ctx.sectionTitle(doc, 'ELEMENT, MODALITY & ENERGY');
      ctx.sectionPages.set('ELEMENT AND MODALITY', doc.getNumberOfPages());
      if (hasHemisphere) ctx.sectionPages.set('WHERE YOUR ENERGY LIVES', doc.getNumberOfPages());
    }
    if (hasElements) {
      const eb = analysis.elementBalance;
      const mb = analysis.modalityBalance;
      ctx.checkPage(190);

      ctx.writeBold(doc, 'Elemental Balance');
      ctx.y += 10;
      const elemW = (contentW - 24) / 4;
      const elemH = 72;
      const ELEM_BG: Record<string, [number, number, number]> = { Fire: [255, 230, 220], Earth: [225, 245, 225], Air: [225, 235, 255], Water: [220, 235, 250] };
      const elements = [{ name: 'Fire', val: eb.fire }, { name: 'Earth', val: eb.earth }, { name: 'Air', val: eb.air }, { name: 'Water', val: eb.water }];
      const elemStartY = ctx.y;
      elements.forEach((el, i) => {
        const x = margin + 2 + i * (elemW + 4);
        const isDom = el.name.toLowerCase() === (eb.dominant || '').toLowerCase();
        const bg = ELEM_BG[el.name] || ctx.colors.cardBg;
        doc.setFillColor(...bg);
        doc.roundedRect(x, elemStartY, elemW, elemH, 4, 4, 'F');
        if (isDom) { doc.setDrawColor(...ctx.colors.gold); doc.setLineWidth(1.2); doc.roundedRect(x, elemStartY, elemW, elemH, 4, 4, 'S'); }
        doc.setFont('times', 'bold'); doc.setFontSize(28); doc.setTextColor(...(isDom ? ctx.colors.ink : ctx.colors.muted));
        doc.text(String(el.val), x + elemW / 2, elemStartY + 32, { align: 'center' });
        doc.setFont('times', 'normal'); doc.setFontSize(10); doc.setTextColor(...ctx.colors.ink);
        doc.text(el.name, x + elemW / 2, elemStartY + 48, { align: 'center' });
        if (isDom) ctx.trackedLabel(doc, 'DOMINANT', x + elemW / 2, elemStartY + 62, { align: 'center', size: 6.5, charSpace: 2 });
      });
      ctx.y = elemStartY + elemH + 16;

      ctx.writeBold(doc, 'Modality Balance');
      ctx.y += 10;
      const modW = (contentW - 16) / 3;
      const modH = 68;
      const modalities = [{ name: 'Cardinal', val: mb.cardinal, desc: 'Initiating' }, { name: 'Fixed', val: mb.fixed, desc: 'Sustaining' }, { name: 'Mutable', val: mb.mutable, desc: 'Adapting' }];
      const modStartY = ctx.y;
      modalities.forEach((mod, i) => {
        const x = margin + 2 + i * (modW + 4);
        const isDom = mod.name.toLowerCase() === (mb.dominant || '').toLowerCase();
        doc.setFillColor(...ctx.colors.cardBg);
        doc.roundedRect(x, modStartY, modW, modH, 4, 4, 'F');
        if (isDom) { doc.setDrawColor(...ctx.colors.gold); doc.setLineWidth(1.2); } else { doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.3); }
        doc.roundedRect(x, modStartY, modW, modH, 4, 4, 'S');
        doc.setFont('times', 'bold'); doc.setFontSize(26); doc.setTextColor(...(isDom ? ctx.colors.ink : ctx.colors.muted));
        doc.text(String(mod.val), x + modW / 2, modStartY + 30, { align: 'center' });
        doc.setFont('times', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...ctx.colors.ink);
        doc.text(`${mod.name} -- ${mod.desc}`, x + modW / 2, modStartY + 48, { align: 'center' });
      });
      ctx.y = modStartY + modH + 12;
    }
  }

  // 13. YOUR TIME LORD + PROFECTION WHEEL (combined page)
  if (analysis.profectionYear?.timeLord) {
    doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
    ctx.sectionPages.set('YOUR TIME LORD', doc.getNumberOfPages());
    ctx.sectionPages.set('LORD OF THE YEAR', doc.getNumberOfPages());
    ctx.sectionTitle(doc, 'YOUR TIME LORD');
    const tlPlanet = analysis.profectionYear.timeLord;
    const tlSRHouse = analysis.profectionYear.timeLordSRHouse;
    const tlSRSign = analysis.profectionYear.timeLordSRSign;
    const houseNum = analysis.profectionYear.houseNumber;
    const tlSRPos = srChart.planets[tlPlanet as keyof typeof srChart.planets];
    const tlIsRetro = !!(tlSRPos as any)?.isRetrograde;
    const tlDignity = (analysis.lordOfTheYear && analysis.lordOfTheYear.planet === tlPlanet) ? analysis.lordOfTheYear.dignity : '';

    // Find the sign on the natal house cusp to explain the ruler connection
    const natalCuspSign = natalChart.houseCusps?.[`house${houseNum}` as keyof typeof natalChart.houseCusps]?.sign || '';
    const SIGN_RULERS: Record<string, string> = {
      Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon', Leo: 'Sun',
      Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars', Sagittarius: 'Jupiter',
      Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
    };

    doc.setFont('times', 'bold'); doc.setFontSize(18); doc.setTextColor(...ctx.colors.ink);
    doc.text(`${P[tlPlanet] || tlPlanet}`, margin + 8, ctx.y);
    doc.setFont('times', 'normal'); doc.setFontSize(11); doc.setTextColor(...ctx.colors.ink);
    doc.text(`${tlSRSign || '--'} -- SR House ${tlSRHouse || '--'}`, margin + 8, ctx.y + 18);
    if (tlDignity) { doc.setFont('times', 'italic'); doc.setFontSize(9); doc.setTextColor(...ctx.colors.muted); doc.text(`Dignity: ${tlDignity}`, margin + contentW, ctx.y, { align: 'right' }); }
    if (tlIsRetro) ctx.trackedLabel(doc, 'RETROGRADE', margin + contentW, ctx.y + 12, { align: 'right', size: 7, charSpace: 2 });
    ctx.y += 30;
    doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, margin + contentW, ctx.y);
    ctx.y += 14;

    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, `Why ${P[tlPlanet] || tlPlanet} Is Your Lord of the Year`, ctx.colors.gold, 11);
      ctx.y += 2;
      // Explain the chain: Age → House → Natal cusp sign → Ruler = Time Lord
      const ordH = `${houseNum}${houseNum === 1 ? 'st' : houseNum === 2 ? 'nd' : houseNum === 3 ? 'rd' : 'th'}`;
      let explanation = `You are ${analysis.profectionYear!.age} years old, placing you in a ${ordH} house profection year.`;
      if (natalCuspSign) {
        explanation += ` Your natal ${ordH} house cusp is in ${natalCuspSign}.`;
        const expectedRuler = SIGN_RULERS[natalCuspSign];
        if (expectedRuler) {
          explanation += ` ${natalCuspSign} is ruled by ${expectedRuler}, which makes ${expectedRuler} the planet running the show this year.`;
        }
      } else {
        explanation += ` The traditional ruler of your natal ${ordH} house cusp is ${P[tlPlanet] || tlPlanet}, making it the planet running the show.`;
      }
      ctx.writeBody(doc, explanation, ctx.colors.bodyText, 10, 14);
    });

    const detailedMeaning = timeLordDetailedMeaning[tlPlanet];
    if (detailedMeaning) {
      ctx.drawCard(doc, () => {
        ctx.writeBold(doc, 'What This Means For Your Year', ctx.colors.accentGreen, 11);
        ctx.y += 2;
        ctx.writeBody(doc, detailedMeaning, ctx.colors.bodyText, 10, 14);
      });
    }

    // Profection wheel on the same page (or next if needed)
    ctx.checkPage(280);
    ctx.sectionPages.set('PROFECTION WHEEL', doc.getNumberOfPages());
    drawProfectionWheel(ctx, doc, analysis.profectionYear.age, analysis.profectionYear.houseNumber, analysis.profectionYear.timeLord);
  }

  // 15. PROFECTION PERSONAL DEEP DIVE
  if (analysis.profectionYear) {
    doc.addPage(); ctx.y = margin;
    ctx.sectionPages.set('PROFECTION YEAR', doc.getNumberOfPages());
    generateProfectionPersonalSection(ctx, doc, analysis.profectionYear.houseNumber, analysis.profectionYear.timeLord, analysis.profectionYear.age, analysis.profectionYear.timeLordSRHouse || null, analysis.profectionYear.timeLordSRSign || '');
  }

  // 16. KEY DATES TIMELINE (note: generateKeyDatesTimeline creates its own first page)
  if (analysis.profectionYear) {
    ctx.sectionPages.set('KEY DATES', doc.getNumberOfPages() + 1);
    generateKeyDatesTimeline(ctx, doc, analysis.profectionYear.timeLord, natalChart, srChart);
  }

  // 17. SATURN & NORTH NODE — dramatic portrait cards
  generateSaturnNodePortrait(doc, ctx, margin, contentW, pw, analysis.saturnFocus, analysis.nodesFocus);

  // 18. KEY ASPECTS (Birthday Gift: 2° orb max, no quincunx)
  if (analysis.srToNatalAspects.length > 0) {
    const allAspects = analysis.srToNatalAspects.filter(asp => {
      if (asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction') return false;
      if (asp.type === 'Quincunx' || asp.type === 'quincunx' || asp.type === 'Semi-Sextile' || asp.type === 'semi-sextile') return false;
      if (typeof asp.orb === 'number' && asp.orb > 2) return false;
      if (typeof asp.orb === 'string' && parseFloat(asp.orb) > 2) return false;
      return true;
    });
    const majorAspects = allAspects.filter(asp => MAJOR_BODIES.has(asp.planet1) && MAJOR_BODIES.has(asp.planet2));
    if (majorAspects.length > 0) {
    doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
    ctx.sectionPages.set('KEY ASPECTS', doc.getNumberOfPages());
    ctx.sectionTitle(doc, 'KEY ASPECTS', 'Planet-to-planet contacts between your Solar Return and natal charts (within 2°)');
    for (let i = 0; i < Math.min(majorAspects.length, 10); i++) {
      const asp = majorAspects[i];
      const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
      ctx.checkPage(120);
      ctx.drawCard(doc, () => {
        doc.setFont('times', 'bold'); doc.setFontSize(10); doc.setTextColor(...ctx.colors.ink);
        doc.text(`SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}`, margin + 8, ctx.y);
        doc.setFont('times', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ctx.colors.muted);
        const srH = analysis.planetSRHouses?.[asp.planet1];
        doc.text(`${asp.orb}° orb${srH ? `  |  SR H${srH}` : ''}`, margin + contentW, ctx.y, { align: 'right' });
        ctx.y += 14;
        ctx.writeCardSection(doc, 'How It Feels', interp.howItFeels);
        ctx.writeCardSection(doc, 'What It Means', interp.whatItMeans);
        ctx.writeCardSection(doc, 'What To Do', interp.whatToDo);
      });
    }
    }
  }

  // 19. YOUR MOON THIS YEAR — REMOVED (redundant with Emotional Climate box + Moon Sign Shift)

  // 20. VERTEX
  if (analysis.vertex) {
    ctx.checkPage(200);
    if (ctx.y > margin + 100) { doc.addPage(); ctx.y = margin; ctx.pageBg(doc); }
    ctx.sectionPages.set('VERTEX', doc.getNumberOfPages());
    ctx.sectionTitle(doc, 'VERTEX -- FATED ENCOUNTERS');
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, `Vertex: ${analysis.vertex!.sign} ${analysis.vertex!.degree}' ${analysis.vertex!.house ? `(House ${analysis.vertex!.house})` : ''}`);
      const vSign = vertexInSign[analysis.vertex!.sign];
      if (vSign) {
        ctx.writeCardSection(doc, 'Fated Theme', vSign.fatedTheme);
        ctx.writeCardSection(doc, 'Who May Appear', vSign.encounters);
      }
    });
  }

  // 21. PLANET GALLERY
  ctx.sectionPages.set('PLANET SPOTLIGHT', doc.getNumberOfPages() + 1);
  generatePlanetGallery(ctx, doc, analysis, PLANET_IMAGES, srChart);

  // 22. HIGHLIGHTS & MONTHLY FORECASTS
  doc.addPage(); ctx.y = margin;
  ctx.sectionPages.set('BEST MONTHS AND HIGHLIGHTS', doc.getNumberOfPages());
  generateHighlightsPage(ctx, doc, analysis, srChart, natalChart);

  // 23. QUARTERLY SUMMARY
  doc.addPage(); ctx.y = margin;
  ctx.sectionPages.set('YOUR YEAR IN FOUR SEASONS', doc.getNumberOfPages());
  generateQuarterlySummary(ctx, doc, analysis, srChart, natalChart);

  // 24. TAKE THIS WITH YOU — combined closing page
  if (ctx.y > margin + 10) doc.addPage();
  ctx.y = margin;
  ctx.sectionPages.set('TAKE THIS WITH YOU', doc.getNumberOfPages());
  ctx.sectionPages.set('BIRTHDAY AFFIRMATION CARD', doc.getNumberOfPages());
  generateAffirmationCard(ctx, doc, analysis, natalChart, srChart);

  // GOLD BORDERS on all pages
  {
    const totalPages = doc.getNumberOfPages();
    const realGold: [number, number, number] = [190, 155, 80];
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...realGold); doc.setLineWidth(2.5);
      doc.rect(18, 18, pw - 36, ph - 36);
      doc.setLineWidth(0.8);
      doc.rect(23, 23, pw - 46, ph - 46);
      const corners = [[27, 27], [pw - 27, 27], [27, ph - 27], [pw - 27, ph - 27]];
      doc.setFillColor(...realGold);
      for (const [cx2, cy2] of corners) doc.circle(cx2, cy2, 3.5, 'F');
    }
  }

  // TOC links
  addTOCLinks(doc, tocPageNumber, tocEntries, ctx);

  const name2 = natalChart.name || 'Chart';
  doc.save(`Birthday-Gift-${srChart.solarReturnYear}-${name2.replace(/\s+/g, '-')}.pdf`);
}

export const SolarReturnPDFExport = ({ analysis, srChart, natalChart, narrative }: Props) => {
  const [generating, setGenerating] = useState(false);
  const [generatingTier1, setGeneratingTier1] = useState(false);
  const [birthdayMode, setBirthdayMode] = useState(true);
  const [personalMessage, setPersonalMessage] = useState('');
  const [goldBorders, setGoldBorders] = useState(false);

  const generateTier1 = async () => {
    setGeneratingTier1(true);
    try {
      await generateTier1SolarReturnPDF(analysis, srChart, natalChart, birthdayMode, personalMessage, CAKE_IMAGES);
    } catch (err) {
      console.error('Tier 1 PDF error:', err);
    } finally {
      setGeneratingTier1(false);
    }
  };

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const margin = 50;
      const contentW = pw - margin * 2;

      // Always apply sign-specific color theme keyed to NATAL SUN SIGN
      const sunSign = natalChart.planets?.Sun?.sign || '';
      const signTheme = sunSign ? signColorThemes[sunSign] : undefined;
      const ctx = createPDFContext(doc, pw, ph, margin, contentW, signTheme);

      // =============================================
      // PAGE 1: COVER
      // =============================================
      await generatePDFCover(ctx, doc, analysis, srChart, natalChart, birthdayMode, personalMessage, CAKE_IMAGES);

      // =============================================
      // PAGE 2: TABLE OF CONTENTS
      // =============================================
      doc.addPage(); ctx.y = margin;
      const tocPageNumber = doc.getNumberOfPages();
      const tocEntries = generatePDFTableOfContents(ctx, doc, analysis, narrative, birthdayMode);

      // =============================================
      // HOW TO READ THIS REPORT
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('HOW TO READ THIS REPORT', doc.getNumberOfPages());
      generateHowToReadPage(ctx, doc);

      // =============================================
      // BIG THREE
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('YOUR BIG THREE', doc.getNumberOfPages());
      generateStrengthsPortrait(ctx, doc, natalChart, analysis);

      // =============================================
      // HOW THIS YEAR MEETS YOU (new v3 section)
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('HOW THIS YEAR MEETS YOU', doc.getNumberOfPages());
      generateHowThisYearMeetsYou(ctx, doc, analysis, srChart, natalChart);

      // =============================================
      // PAGE 3+: YEAR AT A GLANCE (own page)
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('YEAR AT A GLANCE', doc.getNumberOfPages());
      generatePDFYearAtAGlance(ctx, doc, analysis, srChart, natalChart);

      // =============================================
      // 29-YEAR LUNAR PHASE TIMELINE
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('LUNAR PHASE TIMELINE', doc.getNumberOfPages());
      ctx.sectionPages.set('SR MOON PHASE BY YEAR', doc.getNumberOfPages());
      generatePDFLunarTimeline(ctx, doc, analysis, srChart, natalChart);

      // =============================================
      // NATAL OVERLAY — How This Year Lands
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('NATAL OVERLAY', doc.getNumberOfPages());
      ctx.sectionPages.set('NATAL OVERLAY AND ANGLE ACTIVATIONS', doc.getNumberOfPages());
      generatePDFNatalOverlay(ctx, doc, analysis);

      // =============================================
      // ANGLE ACTIVATIONS — clean card layout
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('PLANETARY ACTIVATIONS', doc.getNumberOfPages());
      generatePDFAngleActivations(ctx, doc, natalChart, srChart);

      // =============================================
      // YEAR PRIORITY ENGINE
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('YEAR PRIORITY ENGINE', doc.getNumberOfPages());
      generatePDFYearPriority(ctx, doc, analysis, natalChart, srChart);

      // =============================================
      // PROFECTION WHEEL — on its own or after priority
      // =============================================
      if (analysis.profectionYear) {
        ctx.checkPage(280);
        ctx.sectionPages.set('PROFECTION WHEEL', doc.getNumberOfPages());
        drawProfectionWheel(ctx, doc, analysis.profectionYear.age, analysis.profectionYear.houseNumber, analysis.profectionYear.timeLord);

        // PERSONAL PROFECTION DEEP DIVE
        generateProfectionPersonalSection(ctx, doc,
          analysis.profectionYear.houseNumber,
          analysis.profectionYear.timeLord,
          analysis.profectionYear.age,
          analysis.profectionYear.timeLordSRHouse ?? null,
          analysis.profectionYear.timeLordSRSign || ''
        );
      }

      // =============================================
      // KEY DATES — When Time Lord activates natal planets
      // =============================================
      if (analysis.profectionYear) {
        generateKeyDatesTimeline(ctx, doc, analysis.profectionYear.timeLord, natalChart, srChart);
      }

      // ==============================================
      // MOON SIGN SHIFT — own page
      // =============================================
      const natalMoonSign = natalChart.planets.Moon?.sign;
      const srMoonSignFull = analysis.moonSign;
      if (natalMoonSign && srMoonSignFull) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('MOON SIGN SHIFT', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'MOON SIGN SHIFT', 'Your Emotional Year');

        const halfW = (contentW - 16) / 2;
        const natalDeep = moonSignDeep[natalMoonSign];
        const srDeep = moonSignDeep[srMoonSignFull];

        // Natal Moon
        ctx.trackedLabel(doc, 'NATAL MOON', margin + 8, ctx.y, { size: 7, charSpace: 3 });
        doc.setFont('times', 'normal'); doc.setFontSize(8);
        doc.setTextColor(...ctx.colors.muted);
        doc.text(`THIS YEAR'S MOON`, margin + halfW + 24, ctx.y);
        ctx.y += 10;
        
        doc.setFont('times', 'bold'); doc.setFontSize(14);
        doc.setTextColor(...ctx.colors.ink);
        doc.text(natalMoonSign.toUpperCase(), margin + 8, ctx.y);
        doc.text(srMoonSignFull.toUpperCase(), margin + halfW + 24, ctx.y);
        ctx.y += 14;

        // Two-column body
        doc.setFont('times', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...ctx.colors.ink);
        const natalMoonLines = doc.splitTextToSize(natalDeep?.emotional || '', halfW - 16);
        const srMoonLines = doc.splitTextToSize(srDeep?.emotional || '', halfW - 16);
        const maxLines = Math.max(natalMoonLines.length, srMoonLines.length);
        for (let li = 0; li < Math.min(maxLines, 6); li++) {
          if (natalMoonLines[li]) doc.text(natalMoonLines[li], margin + 8, ctx.y);
          if (srMoonLines[li]) doc.text(srMoonLines[li], margin + halfW + 24, ctx.y);
          ctx.y += 11;
        }
        // Vertical divider
        doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
        doc.line(margin + halfW + 8, ctx.y - maxLines * 11 - 14, margin + halfW + 8, ctx.y);
        ctx.y += 8;

        if (natalMoonSign !== srMoonSignFull) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `The Shift: ${natalMoonSign} --> ${srMoonSignFull}`);
            ctx.y += 2;
            const specificNarrative = moonShiftNarrative[natalMoonSign]?.[srMoonSignFull];
            if (specificNarrative) ctx.writeBody(doc, specificNarrative);
            ctx.y += 4;
            if (srDeep) {
              ctx.writeCardSection(doc, 'Body', srDeep.body);
              ctx.writeCardSection(doc, 'Apply', srDeep.apply);
              ctx.writeCardSection(doc, 'Daily Life', srDeep.looksLike);
            }
          });
        } else {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `Moon Stays in ${natalMoonSign} — Emotional Continuity`);
            ctx.writeBody(doc, 'Your SR Moon matches natal. This year amplifies your emotional instincts. Trust your gut.');
          });
        }
      }

      // =============================================
      // NATAL VS SOLAR RETURN — visual card layout
      // =============================================
      ctx.sectionPages.set('SOLAR RETURN VS NATAL', doc.getNumberOfPages() + 1);
      ctx.sectionPages.set('NATAL VS SOLAR RETURN', doc.getNumberOfPages() + 1);
      generateNatalVsSRCards(ctx, doc, analysis, natalChart, srChart, PLANET_IMAGES);

      // =============================================
      // STELLIUMS — personalized with house context (own title page)
      // =============================================
      if (analysis.stelliums.length > 0) {
        // Separate stelliums into sign vs house groups
        const signStelliums = analysis.stelliums.filter(s => !/^\d+$/.test(String(s.location)) && !s.location.startsWith('House'));
        const houseStelliums = analysis.stelliums.filter(s => /^\d+$/.test(String(s.location)) || s.location.startsWith('House'));

        // Helper to render a single stellium card (compact)
        const renderStelliumCard = (s: typeof analysis.stelliums[0]) => {
          const planets = s.planets.map(pp => P[pp] || pp).join(', ');
          const isHouseStellium = /^\d+$/.test(String(s.location)) || s.location.startsWith('House');
          const houseNum = parseInt(String(s.location).replace('House ', '').replace('House', ''));
          const planetHouses = s.planets.map(pp => analysis.planetSRHouses?.[pp]).filter(Boolean) as number[];
          const primaryHouse = planetHouses.length > 0 ? planetHouses[0] : null;

          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, `${s.planets.length}-Planet Stellium in ${isHouseStellium ? 'House ' + houseNum : s.location}`);
            ctx.y += 2;

            // Planet list
            doc.setFont('times', 'bold'); doc.setFontSize(10); doc.setTextColor(...ctx.colors.ink);
            doc.text(planets, margin + 8, ctx.y);
            ctx.y += 16;

            if (!isHouseStellium) {
              const signName = s.location;
              const signHouse = primaryHouse;
              ctx.writeBold(doc, 'What This Means For You', ctx.colors.deepBrown, 10);
              const personalizedStellium = getPersonalizedStelliumText(signName, signHouse, s.planets);
              ctx.writeBody(doc, personalizedStellium, ctx.colors.bodyText, 9.5, 13);
              ctx.y += 4;

              const felt = stelliumFeltSense[s.location];
              if (felt) {
                ctx.writeCardSection(doc, 'How You Will Feel This', felt, ctx.colors.accentGreen);
              }

              // Compact planet roles — inline list instead of individual boxes
              const roleLines = s.planets.map(pp => {
                const role = stelliumPlanetRoles[pp];
                const ppH = analysis.planetSRHouses?.[pp];
                const houseTag = ppH ? `  •  SR House ${ppH}` : '';
                return role ? `${P[pp] || pp}${houseTag} — ${role}` : null;
              }).filter(Boolean);
              
              if (roleLines.length > 0) {
                ctx.writeBold(doc, 'Planet Roles:', ctx.colors.gold, 9.5);
                for (const line of roleLines) {
                  ctx.writeBody(doc, `• ${line}`, ctx.colors.bodyText, 9, 12);
                }
              }
            } else if (!isNaN(houseNum)) {
              const houseMeaning = stelliumHouseMeaning[houseNum];
              if (houseMeaning) ctx.writeBody(doc, houseMeaning, ctx.colors.bodyText, 9.5, 13);
            }
          });
          ctx.y += 4; // minimal gap between cards
        };

        // --- SIGN STELLIUMS --- (force new page with title)
        if (signStelliums.length > 0) {
          doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
          ctx.sectionTitle(doc, 'STELLIUMS — YOUR POWER ZONES');
          ctx.sectionPages.set('STELLIUMS', doc.getNumberOfPages());
          
          if (signStelliums.length > 1) {
            ctx.writeBody(doc, `You have ${signStelliums.length} sign stelliums this year — concentrated energy demanding attention.`, ctx.colors.dimText, 9.5);
            ctx.y += 6;
          }
          for (const s of signStelliums) {
            renderStelliumCard(s);
          }
        }

        // --- HOUSE STELLIUMS (new page only if sign stelliums already used space) ---
        if (houseStelliums.length > 0) {
          if (signStelliums.length > 0) {
            // Check if there's room, otherwise new page
            ctx.checkPage(200);
            ctx.y += 10;
            ctx.drawRule(doc); ctx.y += 16;
            ctx.trackedLabel(doc, 'STELLIUMS BY HOUSE', margin, ctx.y);
            ctx.y += 16;
          } else {
            doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
            ctx.sectionTitle(doc, 'STELLIUMS — YOUR POWER ZONES');
            ctx.sectionPages.set('STELLIUMS', doc.getNumberOfPages());
          }
          for (const s of houseStelliums) {
            renderStelliumCard(s);
          }
        }
      }

      // =============================================
      // ELEMENT & MODALITY + WHERE YOUR ENERGY LIVES + ANGULAR — one page
      // =============================================
      {
        const hasElements = !!analysis.elementBalance;
        const hasHemisphere = !!analysis.hemisphericEmphasis;
        
        if (hasElements || hasHemisphere) {
          doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
          ctx.sectionTitle(doc, 'ELEMENT, MODALITY & ENERGY');
          ctx.sectionPages.set('ELEMENT AND MODALITY', doc.getNumberOfPages());
          if (hasHemisphere) ctx.sectionPages.set('WHERE YOUR ENERGY LIVES', doc.getNumberOfPages());
        }

        if (hasElements) {
          const eb = analysis.elementBalance;
          const mb = analysis.modalityBalance;

          if (ctx.y + 190 > ph - 62) {
            doc.addPage();
            ctx.y = margin;
            ctx.pageBg(doc);
          }

          // ── Element colors ──
          const ELEM_BG: Record<string, [number, number, number]> = {
            Fire: [255, 230, 220],
            Earth: [225, 245, 225],
            Air: [225, 235, 255],
            Water: [220, 235, 250],
          };

          // ── Elemental Balance ──
          ctx.writeBold(doc, 'Elemental Balance');
          ctx.y += 10;
          const elemW = (contentW - 24) / 4;
          const elemH = 72;
          const elemStartY = ctx.y;
          const elements = [
            { name: 'Fire', val: eb.fire },
            { name: 'Earth', val: eb.earth },
            { name: 'Air', val: eb.air },
            { name: 'Water', val: eb.water },
          ];
          elements.forEach((el, i) => {
            const x = margin + 2 + i * (elemW + 4);
            const isDom = el.name.toLowerCase() === (eb.dominant || '').toLowerCase();
            const bg = ELEM_BG[el.name] || ctx.colors.cardBg;

            doc.setFillColor(...bg);
            doc.roundedRect(x, elemStartY, elemW, elemH, 4, 4, 'F');

            if (isDom) {
              doc.setDrawColor(...ctx.colors.gold); doc.setLineWidth(1.2);
              doc.roundedRect(x, elemStartY, elemW, elemH, 4, 4, 'S');
            }

            doc.setFont('times', 'bold'); doc.setFontSize(28);
            doc.setTextColor(...(isDom ? ctx.colors.ink : ctx.colors.muted));
            doc.text(String(el.val), x + elemW / 2, elemStartY + 32, { align: 'center' });

            doc.setFont('times', 'normal'); doc.setFontSize(10);
            doc.setTextColor(...ctx.colors.ink);
            doc.text(el.name, x + elemW / 2, elemStartY + 48, { align: 'center' });

            if (isDom) {
              ctx.trackedLabel(doc, 'DOMINANT', x + elemW / 2, elemStartY + 62, { align: 'center', size: 6.5, charSpace: 2 });
            }
          });
          ctx.y = elemStartY + elemH + 16;

          // ── Modality Balance ──
          ctx.writeBold(doc, 'Modality Balance');
          ctx.y += 10;
          const modW = (contentW - 16) / 3;
          const modH = 68;
          const modalities = [
            { name: 'Cardinal', val: mb.cardinal, desc: 'Initiating' },
            { name: 'Fixed', val: mb.fixed, desc: 'Sustaining' },
            { name: 'Mutable', val: mb.mutable, desc: 'Adapting' },
          ];
          const modStartY = ctx.y;
          modalities.forEach((mod, i) => {
            const x = margin + 2 + i * (modW + 4);
            const isDom = mod.name.toLowerCase() === (mb.dominant || '').toLowerCase();

            doc.setFillColor(...ctx.colors.cardBg);
            doc.roundedRect(x, modStartY, modW, modH, 4, 4, 'F');

            if (isDom) {
              doc.setDrawColor(...ctx.colors.gold); doc.setLineWidth(1.2);
            } else {
              doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.3);
            }
            doc.roundedRect(x, modStartY, modW, modH, 4, 4, 'S');

            doc.setFont('times', 'bold'); doc.setFontSize(26);
            doc.setTextColor(...(isDom ? ctx.colors.ink : ctx.colors.muted));
            doc.text(String(mod.val), x + modW / 2, modStartY + 30, { align: 'center' });

            doc.setFont('times', 'normal'); doc.setFontSize(9.5);
            doc.setTextColor(...ctx.colors.ink);
            doc.text(`${mod.name} · ${mod.desc}`, x + modW / 2, modStartY + 48, { align: 'center' });
          });
          ctx.y = modStartY + modH + 12;
        }

        // ── WHERE YOUR ENERGY LIVES ──
        if (hasHemisphere) {
          const hem = analysis.hemisphericEmphasis;
          const total = hem.totalCounted;
          const quadPlanets: Record<string, string[]> = { upper: [], lower: [], east: [], west: [] };
          for (const p of PLANET_ORDER) {
            const h = analysis.planetSRHouses?.[p];
            if (h == null) continue;
            if (h >= 7 && h <= 12) quadPlanets.upper.push(P[p] || p); else quadPlanets.lower.push(P[p] || p);
            if (h >= 10 || h <= 3) quadPlanets.east.push(P[p] || p); else quadPlanets.west.push(P[p] || p);
          }

          if (ctx.y + 250 > ph - 62) {
            doc.addPage();
            ctx.y = margin;
            ctx.pageBg(doc);
          }

          ctx.drawGoldRule(doc);
          ctx.y += 16;
          ctx.writeBold(doc, 'Where Your Energy Lives');
          ctx.y += 12;

          const HEMI_BG: Record<string, [number, number, number]> = {
            upper: [225, 235, 255],
            lower: [255, 240, 230],
            east: [225, 248, 235],
            west: [252, 235, 240],
          };

          const boxW = (contentW - 20) / 2;
          const boxH = 80;
          const gridData = [
            { key: 'upper', label: 'UPPER', sub: 'Public & Visible', count: hem.upper, planets: quadPlanets.upper, row: 0, col: 0 },
            { key: 'lower', label: 'LOWER', sub: 'Private & Internal', count: hem.lower, planets: quadPlanets.lower, row: 0, col: 1 },
            { key: 'east', label: 'EASTERN', sub: 'Self-Initiated', count: hem.east, planets: quadPlanets.east, row: 1, col: 0 },
            { key: 'west', label: 'WESTERN', sub: 'Other-Oriented', count: hem.west, planets: quadPlanets.west, row: 1, col: 1 },
          ];
          const gridStartY = ctx.y;
          for (const g of gridData) {
            const x = margin + g.col * (boxW + 12);
            const by = gridStartY + g.row * (boxH + 8);
            const isDom = g.count > total / 2;
            const bg = HEMI_BG[g.key] || ctx.colors.cardBg;

            doc.setFillColor(...bg);
            doc.roundedRect(x, by, boxW, boxH, 4, 4, 'F');
            doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.3);
            doc.roundedRect(x, by, boxW, boxH, 4, 4, 'S');

            doc.setFillColor(...ctx.colors.gold);
            doc.rect(x, by, 3.5, boxH, 'F');

            doc.setFont('times', 'bold'); doc.setFontSize(24);
            doc.setTextColor(...(isDom ? ctx.colors.ink : ctx.colors.muted));
            doc.text(String(g.count), x + 16, by + 28);

            doc.setFont('times', 'bold'); doc.setFontSize(10);
            doc.setTextColor(...ctx.colors.ink);
            doc.text(g.label, x + 48, by + 20);
            doc.setFont('times', 'italic'); doc.setFontSize(8.5);
            doc.setTextColor(...ctx.colors.muted);
            doc.text(g.sub, x + 48, by + 32);

            if (g.planets.length > 0) {
              doc.setFont('times', 'normal'); doc.setFontSize(8);
              doc.setTextColor(...ctx.colors.ink);
              const planetLines = doc.splitTextToSize(g.planets.join(', '), boxW - 30);
              planetLines.slice(0, 3).forEach((line: string, li: number) => doc.text(line, x + 16, by + 48 + li * 11));
            }

            if (isDom) {
              ctx.trackedLabel(doc, 'DOMINANT', x + boxW - 10, by + 14, { align: 'right', size: 6.5, charSpace: 2 });
            }
          }
          ctx.y = gridStartY + (boxH + 8) * 2 + 10;

          // ── Angular Planets ──
          if (analysis.angularPlanets && analysis.angularPlanets.length > 0) {
            if (ctx.y + 140 > ph - 62) {
              doc.addPage();
              ctx.y = margin;
              ctx.pageBg(doc);
            }

            ctx.y += 4;
            doc.setDrawColor(...ctx.colors.gold); doc.setLineWidth(0.5);
            doc.line(margin, ctx.y, margin + contentW, ctx.y);
            ctx.y += 16;
            ctx.writeBold(doc, 'Angular Planets — Most Powerful This Year');
            ctx.y += 12;

            const ANG_BG: [number, number, number][] = [
              [245, 241, 234], [252, 235, 240], [225, 248, 235], [225, 235, 255],
            ];

            const angCount = Math.max(1, Math.min(analysis.angularPlanets.length, 2));
            const angBoxW = (contentW - (angCount - 1) * 12) / angCount;
            const angBoxH = 92;
            const angStartY = ctx.y;

            analysis.angularPlanets.slice(0, 4).forEach((ap, i) => {
              const col = i % angCount;
              const row = Math.floor(i / angCount);
              const x = margin + col * (angBoxW + 12);
              const by = angStartY + row * (angBoxH + 10);
              const bg = ANG_BG[i % ANG_BG.length];

              doc.setFillColor(...bg);
              doc.roundedRect(x, by, angBoxW, angBoxH, 4, 4, 'F');
              doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.3);
              doc.roundedRect(x, by, angBoxW, angBoxH, 4, 4, 'S');

              doc.setFillColor(...ctx.colors.gold);
              doc.rect(x, by, 3.5, angBoxH, 'F');

              doc.setFont('times', 'bold'); doc.setFontSize(14);
              doc.setTextColor(...ctx.colors.gold);
              doc.text(P[ap] || ap, x + 14, by + 24);

              const pm = planetLifeMeanings[ap] || planetLifeMeanings[ap.replace('NorthNode', 'North Node')];
              if (pm) {
                doc.setFont('times', 'normal'); doc.setFontSize(9);
                doc.setTextColor(...ctx.colors.ink);
                const pmLines = doc.splitTextToSize(pm.inYourLife, angBoxW - 30);
                pmLines.slice(0, 5).forEach((line: string, li: number) => doc.text(line, x + 14, by + 42 + li * 11));
              }
            });
            ctx.y = angStartY + Math.ceil(Math.min(analysis.angularPlanets.length, 4) / angCount) * (angBoxH + 10);
          }
        }
      }

      // =============================================
      // YOUR TIME LORD + PROFECTION WHEEL — same page
      // =============================================
      if (analysis.profectionYear?.timeLord) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('YOUR TIME LORD', doc.getNumberOfPages());
        ctx.sectionPages.set('LORD OF THE YEAR', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'YOUR TIME LORD (LORD OF THE YEAR)');

        const tlPlanet = analysis.profectionYear.timeLord;
        const tlSRHouse = analysis.profectionYear.timeLordSRHouse;
        const tlSRSign = analysis.profectionYear.timeLordSRSign;
        const houseNum = analysis.profectionYear.houseNumber;
        
        const tlSRPos = srChart.planets[tlPlanet as keyof typeof srChart.planets];
        const tlIsRetro = !!(tlSRPos as any)?.isRetrograde;
        const tlDignity = (analysis.lordOfTheYear && analysis.lordOfTheYear.planet === tlPlanet) 
          ? analysis.lordOfTheYear.dignity : '';

        // Header
        doc.setFont('times', 'bold'); doc.setFontSize(18);
        doc.setTextColor(...ctx.colors.ink);
        doc.text(`${P[tlPlanet] || tlPlanet}`, margin + 8, ctx.y);
        doc.setFont('times', 'normal'); doc.setFontSize(11);
        doc.text(`${tlSRSign || '--'} — SR House ${tlSRHouse || '--'}`, margin + 8, ctx.y + 18);
        if (tlDignity) {
          doc.setFont('times', 'italic'); doc.setFontSize(9);
          doc.setTextColor(...ctx.colors.muted);
          doc.text(`Dignity: ${tlDignity}`, margin + contentW, ctx.y, { align: 'right' });
        }
        if (tlIsRetro) {
          ctx.trackedLabel(doc, 'RETROGRADE', margin + contentW, ctx.y + 12, { align: 'right', size: 7, charSpace: 2 });
        }
        ctx.y += 30;
        doc.setDrawColor(...ctx.colors.rule); doc.setLineWidth(0.25);
        doc.line(margin, ctx.y, margin + contentW, ctx.y);
        ctx.y += 14;

        // Why this planet
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, `Why ${P[tlPlanet] || tlPlanet} Is Your Lord of the Year`, ctx.colors.gold, 11);
          ctx.y += 2;
          ctx.writeBody(doc, `You are ${analysis.profectionYear!.age} years old, placing you in a ${houseNum}${houseNum === 1 ? 'st' : houseNum === 2 ? 'nd' : houseNum === 3 ? 'rd' : 'th'} house profection year. The traditional ruler of your natal ${houseNum}${houseNum === 1 ? 'st' : houseNum === 2 ? 'nd' : houseNum === 3 ? 'rd' : 'th'} house cusp is ${P[tlPlanet] || tlPlanet}, making it the planet running the show — every transit to or from ${P[tlPlanet] || tlPlanet} hits harder this year.`, ctx.colors.bodyText, 10, 14);
        });

        // Detailed meaning
        const detailedMeaning = timeLordDetailedMeaning[tlPlanet];
        if (detailedMeaning) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'What This Means For Your Year', ctx.colors.accentGreen, 11);
            ctx.y += 2;
            ctx.writeBody(doc, detailedMeaning, ctx.colors.bodyText, 10, 14);
          });
        }

        // Profection Wheel — on the SAME page as Time Lord
        ctx.checkPage(280);
        ctx.sectionPages.set('PROFECTION WHEEL', doc.getNumberOfPages());
        drawProfectionWheel(ctx, doc, analysis.profectionYear.age, analysis.profectionYear.houseNumber, analysis.profectionYear.timeLord);

        // Dignity/retrograde badges — compact
        if (tlDignity === 'Detriment' || tlDignity === 'Fall') {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Dignity Warning', ctx.colors.accentRust, 10);
            ctx.writeBody(doc, `Your Lord of the Year is in ${tlDignity}. ${P[tlPlanet] || tlPlanet} is working outside its comfort zone — plans may require more effort.`, ctx.colors.bodyText, 10);
          }, ctx.colors.accentRust);
        }
        if (tlDignity === 'Domicile' || tlDignity === 'Exaltation') {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Dignity Advantage', ctx.colors.accentGreen, 10);
            ctx.writeBody(doc, `Your Lord of the Year is in ${tlDignity} — ${P[tlPlanet] || tlPlanet} at ${tlDignity === 'Domicile' ? 'full strength' : 'peak performance'}. Results come with less friction.`, ctx.colors.bodyText, 10);
          }, ctx.colors.accentGreen);
        }
        if (tlIsRetro) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Retrograde Effect', ctx.colors.accentRust, 10);
            ctx.writeBody(doc, `${P[tlPlanet] || tlPlanet} retrograde as Lord of the Year means a built-in "review and revise" quality. Things from the past resurface — old projects, unfinished conversations. New initiatives may stall until you address what was left incomplete.`, ctx.colors.bodyText, 10);
          }, ctx.colors.accentRust);
        }
      }

      // =============================================
      // SATURN & NORTH NODE — dramatic portrait cards
      // =============================================
      generateSaturnNodePortrait(doc, ctx, margin, contentW, pw, analysis.saturnFocus, analysis.nodesFocus);

      // =============================================
      // KEY ASPECTS — own page with box layout (2° orb)
      // =============================================
      if (analysis.srToNatalAspects.length > 0) {
        const allAspects = analysis.srToNatalAspects.filter(asp => {
          if (asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction') return false;
          if (asp.type === 'Quincunx' || asp.type === 'quincunx' || asp.type === 'Semi-Sextile' || asp.type === 'semi-sextile') return false;
          if (typeof asp.orb === 'number' && asp.orb > 2) return false;
          if (typeof asp.orb === 'string' && parseFloat(asp.orb) > 2) return false;
          return true;
        });
        const majorAspects = allAspects.filter(asp => MAJOR_BODIES.has(asp.planet1) && MAJOR_BODIES.has(asp.planet2));
        
        if (majorAspects.length > 0) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('KEY ASPECTS', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'KEY ASPECTS', 'Planet-to-planet contacts between your Solar Return and natal charts (within 2°)');

        for (let i = 0; i < Math.min(majorAspects.length, 10); i++) {
          const asp = majorAspects[i];
          const interp = generateSRtoNatalInterpretation(asp.planet1, asp.planet2, asp.type, asp.orb);
          const srH = analysis.planetSRHouses?.[asp.planet1];
          const natalH = analysis.houseOverlays?.find(o => o.planet === asp.planet2)?.natalHouse;
          
          ctx.checkPage(120);
          
          ctx.drawCard(doc, () => {
            doc.setFont('times', 'bold'); doc.setFontSize(10);
            doc.setTextColor(...ctx.colors.ink);
            doc.text(`SR ${P[asp.planet1] || asp.planet1}  ${asp.type}  Natal ${P[asp.planet2] || asp.planet2}`, margin + 8, ctx.y);
            doc.setFont('times', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ctx.colors.muted);
            const orbHouse = `${asp.orb}° orb${srH ? `  |  SR H${srH}` : ''}${natalH ? `  |  Natal H${natalH}` : ''}`;
            doc.text(orbHouse, margin + contentW, ctx.y, { align: 'right' });
            ctx.y += 14;

            ctx.writeCardSection(doc, 'How It Feels', interp.howItFeels);
            ctx.writeCardSection(doc, 'What It Means', interp.whatItMeans);
            ctx.writeCardSection(doc, 'What To Do', interp.whatToDo);
          });
        }
        }
      }

      // =============================================
      // YOUR MOON THIS YEAR — own page
      // =============================================
      if (analysis.srMoonAspects || analysis.moonVOC || analysis.moonAngularity) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('YOUR MOON THIS YEAR', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'YOUR MOON THIS YEAR', 'Emotional Climate');

        // Moon VOC
        if (analysis.moonVOC) {
          ctx.drawCard(doc, () => {
            ctx.writeBold(doc, 'Moon Void of Course — The Unaspected Moon');
            ctx.y += 6;
            ctx.writeBody(doc, 'Your Solar Return Moon makes no major aspects to any other planet in the SR chart. This is a rare and significant condition.');
            ctx.y += 4;
            ctx.writeCardSection(doc, 'What This Means', 'An unaspected SR Moon operates in isolation — your emotional life this year runs on its own track. Feelings are vivid but disconnected from the rest of the chart\'s story.');
            ctx.writeCardSection(doc, 'The Gift', 'Without planetary aspects pulling it in different directions, the Moon is free. Your emotional compass this year is entirely your own.');
            ctx.writeCardSection(doc, 'The Challenge', 'Without aspects to ground or activate the Moon, emotional needs may go unmet unless you consciously name and honor them.');
          });
        }

        // Angularity
        if (analysis.moonAngularity) {
          const angDesc: Record<string, string> = {
            angular: 'Your SR Moon is angular (close to an angle). Emotional responses are instinctive, automatic, and highly reactive. You are close to every situation — perspective is harder, but feelings are powerfully felt and visible to others.',
            succedent: 'Your SR Moon is in a succedent house. Emotional responses are stable and grounded this year. You can step back and examine situations without being overwhelmed.',
            cadent: 'Your SR Moon is in a cadent house. Emotional responses are more adaptive this year. You process feelings internally, preparing rather than reacting.',
          };
          ctx.drawCard(doc, () => {
            doc.setFont('times', 'bold'); doc.setFontSize(11); doc.setTextColor(...ctx.colors.ink);
            doc.text(`Moon: ${analysis.moonSign || ''} in House ${analysis.moonHouse?.house || '--'}`, margin + 8, ctx.y);
            ctx.y += 14;
            ctx.writeBody(doc, angDesc[analysis.moonAngularity!]);
            if (analysis.moonLateDegree) {
              ctx.y += 4;
              ctx.writeCardSection(doc, 'Late-Degree Moon', 'Your SR Moon is in the late degrees of its sign (25+). Something emotional is reaching completion or about to change. Endings, transitions, and a sense of "moving on" characterize the year.', ctx.colors.accentRust);
            }
            if (analysis.moonMetonicAges && analysis.moonMetonicAges.length > 0) {
              ctx.y += 4;
              ctx.writeCardSection(doc, '19-Year Metonic Cycle', `Your SR Moon was in approximately this position at age${analysis.moonMetonicAges.length > 1 ? 's' : ''} ${analysis.moonMetonicAges.join(', ')}. The emotional themes of this year echo those earlier chapters.`, ctx.colors.gold);
            }
          });
        }

        // SR Moon aspects
        if (analysis.srMoonAspects && analysis.srMoonAspects.length > 0) {
          ctx.y += 6;
          ctx.writeBold(doc, 'Moon Aspects This Year');
          ctx.y += 6;
          for (const asp of analysis.srMoonAspects.slice(0, 6)) {
            const isHard = ['Square', 'Opposition', 'Quincunx'].includes(asp.aspectType);
            ctx.checkPage(80);
            ctx.drawCard(doc, () => {
              doc.setFont('times', 'bold'); doc.setFontSize(9.5);
              doc.setTextColor(...ctx.colors.ink);
              doc.text(`Moon ${asp.aspectType} ${P[asp.targetPlanet] || asp.targetPlanet}`, margin + 8, ctx.y);
              doc.setFont('times', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...ctx.colors.muted);
              doc.text(`${asp.orb}' orb${asp.targetSRHouse ? `  |  H${asp.targetSRHouse}` : ''}`, margin + contentW, ctx.y, { align: 'right' });
              ctx.y += 12;
              ctx.writeBody(doc, asp.interpretation);
            });
          }
        }
      }

      // =============================================
      // VERTEX
      // =============================================
      if (analysis.vertex) {
        ctx.checkPage(200);
        if (ctx.y > margin + 100) { doc.addPage(); ctx.y = margin; ctx.pageBg(doc); }
        ctx.sectionPages.set('VERTEX', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'VERTEX — FATED ENCOUNTERS');
        ctx.drawCard(doc, () => {
          ctx.writeBold(doc, `Vertex: ${analysis.vertex!.sign} ${analysis.vertex!.degree}' ${analysis.vertex!.house ? `(House ${analysis.vertex!.house})` : ''}`);
          const vSign = vertexInSign[analysis.vertex!.sign];
          if (vSign) {
            ctx.writeCardSection(doc, 'Fated Theme', vSign.fatedTheme);
            ctx.writeCardSection(doc, 'Who May Appear', vSign.encounters);
          }
        });
      }

      // =============================================
      // PLANET GALLERY — 4x3 grid with images
      // =============================================
      ctx.sectionPages.set('PLANET SPOTLIGHT', doc.getNumberOfPages() + 1);
      generatePlanetGallery(ctx, doc, analysis, PLANET_IMAGES, srChart);

      // =============================================
      // NARRATIVE
      // =============================================
      if (narrative) {
        doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
        ctx.sectionPages.set('YEAR-AHEAD READING', doc.getNumberOfPages());
        ctx.sectionTitle(doc, 'YEAR-AHEAD READING', 'Your Year in Full');
        ctx.drawGoldRule(doc);
        ctx.y += 22;

        const lines = narrative.split('\n');
        let paraBuffer: string[] = [];

        const flushParagraph = () => {
          if (paraBuffer.length === 0) return;

          const fullText = paraBuffer
            .join(' ')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/[^\x00-\x7F]/g, '');

          const paragraphLines = doc.splitTextToSize(fullText, contentW) as string[];
          ctx.checkPage(paragraphLines.length * 20 + 18);

          doc.setFont('times', 'normal'); doc.setFontSize(12.5);
          doc.setTextColor(...ctx.colors.ink);
          for (const paragraphLine of paragraphLines) {
            ctx.checkPage(20);
            doc.text(paragraphLine, margin, ctx.y);
            ctx.y += 19;
          }

          ctx.y += 18;
          paraBuffer = [];
        };

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed) {
            flushParagraph();
            continue;
          }

          if (trimmed.startsWith('## ')) {
            flushParagraph();
            ctx.checkPage(58);
            ctx.y += 6;
            ctx.trackedLabel(doc, trimmed.replace('## ', '').toUpperCase(), margin, ctx.y, { size: 7.5, charSpace: 2.8 });
            ctx.y += 8;
            doc.setDrawColor(...ctx.colors.rule);
            doc.setLineWidth(0.3);
            doc.line(margin, ctx.y, pw - margin, ctx.y);
            ctx.y += 16;
            continue;
          }

          paraBuffer.push(trimmed.replace(/\*\*/g, '').replace(/\*/g, ''));
        }

        flushParagraph();
      }

      // =============================================
      // YEAR-AHEAD HIGHLIGHTS & MONTHLY FORECASTS
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('BEST MONTHS AND HIGHLIGHTS', doc.getNumberOfPages());
      generateHighlightsPage(ctx, doc, analysis, srChart, natalChart);

      // =============================================
      // QUARTERLY SUMMARY — YOUR YEAR IN FOUR SEASONS
      // =============================================
      doc.addPage(); ctx.y = margin;
      ctx.sectionPages.set('YOUR YEAR IN FOUR SEASONS', doc.getNumberOfPages());
      generateQuarterlySummary(ctx, doc, analysis, srChart, natalChart);

      // =============================================
      // BIRTHDAY AFFIRMATION CARD (birthday mode)
      // =============================================
      if (birthdayMode) {
        // Only add a new page if we're not already at the top of one
        if (ctx.y > margin + 10) {
          doc.addPage();
        }
        ctx.y = margin;
        ctx.sectionPages.set('TAKE THIS WITH YOU', doc.getNumberOfPages());
        ctx.sectionPages.set('BIRTHDAY AFFIRMATION CARD', doc.getNumberOfPages());
        generateAffirmationCard(ctx, doc, analysis, natalChart, srChart);
      }

      // =============================================
      // GOLD BORDERS on all pages
      // =============================================
      if (goldBorders) {
        const totalPages = doc.getNumberOfPages();
        const realGold: [number, number, number] = [190, 155, 80];
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setDrawColor(...realGold); doc.setLineWidth(2.5);
          doc.rect(18, 18, pw - 36, ph - 36);
          doc.setLineWidth(0.8);
          doc.rect(23, 23, pw - 46, ph - 46);
          // Corner ornaments
          const corners = [[27, 27], [pw - 27, 27], [27, ph - 27], [pw - 27, ph - 27]];
          doc.setFillColor(...realGold);
          for (const [cx2, cy2] of corners) {
            doc.circle(cx2, cy2, 3.5, 'F');
          }
          // Small diamond ornaments at midpoints
          const midX = pw / 2;
          const midY = ph / 2;
          doc.setFillColor(...realGold);
          // Top center
          doc.triangle(midX, 15, midX - 4, 20, midX + 4, 20, 'F');
          doc.triangle(midX, 25, midX - 4, 20, midX + 4, 20, 'F');
          // Bottom center
          doc.triangle(midX, ph - 15, midX - 4, ph - 20, midX + 4, ph - 20, 'F');
          doc.triangle(midX, ph - 25, midX - 4, ph - 20, midX + 4, ph - 20, 'F');
        }
      }

      // Add clickable links to the Table of Contents
      addTOCLinks(doc, tocPageNumber, tocEntries, ctx);

      // No page numbers per v3 spec

      const name2 = natalChart.name || 'Chart';
      doc.save(`Solar-Return-${srChart.solarReturnYear}-${name2.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Shared base data builder (no AI fields)
  const buildBaseData = () => {
    // Correct Ascendant — houseCusps.house1 is definitive
    const cNatal = { ...natalChart.planets };
    if (natalChart.houseCusps?.house1?.sign && cNatal.Ascendant) {
      cNatal.Ascendant = { ...cNatal.Ascendant, sign: natalChart.houseCusps.house1.sign, degree: natalChart.houseCusps.house1.degree, minutes: natalChart.houseCusps.house1.minutes || 0 };
    }
    const cSr = { ...srChart.planets };
    if (srChart.houseCusps?.house1?.sign && (cSr as any).Ascendant) {
      (cSr as any).Ascendant = { ...(cSr as any).Ascendant, sign: srChart.houseCusps.house1.sign, degree: srChart.houseCusps.house1.degree, minutes: srChart.houseCusps.house1.minutes || 0 };
    }

    const mappedPlanetPositions = Object.entries(cNatal || {}).map(([planet, data]) => ({
      planet,
      natalPosition: `${(data as any).sign} ${Math.floor((data as any).degree || 0)}°`,
      natalHouse:    String((data as any).house || '').replace(/^H/, ''),
      srPosition:    (() => {
        const srPlanet = (cSr as any)?.[planet];
        return srPlanet ? `${srPlanet.sign} ${Math.floor(srPlanet.degree || 0)}°` : '';
      })(),
      srHouse: String(analysis.planetSRHouses?.[planet] || '').replace(/^H/, ''),
      shift: (() => {
        const natal = (data as any).sign;
        const sr    = (cSr as any)?.[planet]?.sign;
        return (!sr || natal === sr) ? 'Same sign' : `${natal} → ${sr}`;
      })(),
    }));

    const mappedSrToNatalAspects = (analysis.srToNatalAspects || []).map((a: any) => ({
      srPlanet:    a.planet1  || a.srPlanet    || '',
      natalPlanet: a.planet2  || a.natalPlanet || '',
      aspect:      a.type     || a.aspect      || '',
      aspectType:  a.type     || a.aspectType  || '',
      orb:         a.orb      ?? null,
      interpretation: a.interpretation || '',
      exactDate:   a.exactDate || '',
    }));

    const profYear = analysis.profectionYear;
    const mappedProfectionYear = profYear ? {
      ...profYear,
      house: (profYear as any).house || (profYear as any).houseNumber || null,
    } : null;

    // Compute the effective Solar Return year — fall back to the current calendar
    // year if srChart.solarReturnYear is missing, invalid, or accidentally equal
    // to the birth year (which would yield age 0 — never a real SR).
    const birthYear3 = natalChart.birthDate ? parseInt(natalChart.birthDate.slice(0, 4), 10) : NaN;
    const rawSrYear3 = Number(srChart.solarReturnYear);
    const currentYear3 = new Date().getFullYear();
    const isValidSrYear3 = Number.isFinite(rawSrYear3)
      && rawSrYear3 > 1900 && rawSrYear3 < 2200
      && (isNaN(birthYear3) || rawSrYear3 !== birthYear3);
    const effectiveSrYear3 = isValidSrYear3 ? rawSrYear3 : currentYear3;

    return {
      name: natalChart.name || '',
      birthDate: natalChart.birthDate || '',
      birthLocation: natalChart.birthLocation || '',
      solarReturnYear: effectiveSrYear3,
      natalSun:    natalChart.planets?.Sun?.sign   || '',
      natalMoon:   natalChart.planets?.Moon?.sign  || '',
      natalRising: natalChart.houseCusps?.house1?.sign || '',
      srSun:       natalChart.planets?.Sun?.sign   || '',
      srMoon:      analysis.moonSign               || '',
      srRising:    analysis.yearlyTheme?.ascendantSign || '',
      personalMessage: birthdayMode ? personalMessage : '',
      yearlyTheme: analysis.yearlyTheme,
      sunHouse:     analysis.sunHouse,
      sunNatalHouse:analysis.sunNatalHouse,
      moonHouse:    analysis.moonHouse,
      moonNatalHouse:analysis.moonNatalHouse,
      profectionYear: mappedProfectionYear,
      lordOfTheYear: analysis.lordOfTheYear,
      moonPhase:           analysis.moonPhase,
      moonAngularity:      analysis.moonAngularity,
      moonLateDegree:      analysis.moonLateDegree,
      moonVOC:             analysis.moonVOC,
      moonMetonicAges:     analysis.moonMetonicAges,
      srMoonAspects:       analysis.srMoonAspects,
      stelliums: analysis.stelliums,
      srToNatalAspects:   mappedSrToNatalAspects,
      srInternalAspects:  analysis.srInternalAspects,
      angularPlanets:     analysis.angularPlanets,
      angularPlanetsDetailed: analysis.angularPlanetsDetailed,
      planetPositions:    mappedPlanetPositions,
      houseOverlays: analysis.houseOverlays,
      elementBalance:      analysis.elementBalance,
      modalityBalance:     analysis.modalityBalance,
      hemisphericEmphasis: analysis.hemisphericEmphasis,
      saturnFocus: analysis.saturnFocus,
      nodesFocus:  analysis.nodesFocus,
      retrogrades: analysis.retrogrades,
      vertex: analysis.vertex,
      // Tier 4
      mutualReceptions: analysis.mutualReceptions,
      dignityReport: analysis.dignityReport,
      healthOverlay: analysis.healthOverlay,
      eclipseSensitivity: analysis.eclipseSensitivity,
      enhancedRetrogrades: analysis.enhancedRetrogrades,
      quarterlyFocus: analysis.quarterlyFocus,
      dominantPlanets: analysis.dominantPlanets,
      // Tier 5
      fixedStars: analysis.fixedStars,
      arabicParts: analysis.arabicParts,
      firdaria: analysis.firdaria,
      antisciaContacts: analysis.antisciaContacts,
      solarArcs: analysis.solarArcs,
      synthesisSections: buildSynthesisSectionsExport(analysis.synthesisSections),
      midpointHits: analysis.midpointHits,
      prenatalEclipse: analysis.prenatalEclipse,
      planetarySpeeds: analysis.planetarySpeeds,
      heliacalRising: analysis.heliacalRising,
      // Strategy & Timing
      cakeImageUrl: (() => {
        const natalSun = natalChart.planets?.Sun?.sign || '';
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        return natalSun ? `${SUPABASE_URL}/storage/v1/object/public/cakes/${natalSun.toLowerCase()}.png` : '';
      })(),
      executiveSummary: generateExecutiveSummary(analysis, natalChart),
      actionGuidance: (() => {
        const srPlanets: Record<string, { sign?: string; isRetrograde?: boolean }> = {};
        for (const [key, val] of Object.entries(srChart.planets || {})) {
          if (val) srPlanets[key] = { sign: (val as any).sign, isRetrograde: (val as any).isRetrograde };
        }
        return generateActionGuidance(analysis.planetSRHouses, srPlanets);
      })(),
      activationWindows: (() => {
        const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
        const toAbs = (pos: any): number | null => {
          if (!pos?.sign) return null;
          const idx = SIGNS.indexOf(pos.sign);
          if (idx < 0) return null;
          return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
        };
        const srPositions: Record<string, number> = {};
        const keyTargets = ['Sun', 'Moon', 'Ascendant', 'Mars', 'Jupiter', 'Saturn', 'Venus', 'Mercury'];
        for (const p of keyTargets) {
          const pos = srChart.planets?.[p as keyof typeof srChart.planets];
          const deg = pos ? toAbs(pos) : null;
          if (deg !== null) srPositions[p] = deg;
        }
        const bd = natalChart.birthDate || '';
        const parts = bd.split('-');
        const bMonth = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : 0;
        const bDay = parts.length >= 3 ? parseInt(parts[2], 10) : 1;
        const data = calculateActivationWindows(srPositions, srChart.solarReturnYear, bMonth, bDay);
        return {
          peakPeriods: data.peakPeriods,
          monthlyThemes: data.monthlyThemes.map(m => ({
            ...m,
            transitHits: m.transitHits.map(h => ({
              ...h,
              exactDate: h.exactDate.toISOString(),
              windowStart: h.windowStart.toISOString(),
              windowEnd: h.windowEnd.toISOString(),
            })),
          })),
          transitHitCount: data.transitHits.length,
          windowCount: data.activationWindows.length,
        };
      })(),
      identityShift: generateIdentityShift(analysis, srChart, natalChart),
      lifeDomainScores: calculateLifeDomainScores(analysis),
      powerPortrait: generatePowerPortrait(analysis, natalChart, srChart),
      domainDeepDives: generateDomainDeepDives(analysis, natalChart, srChart),
      psychologicalProfile: buildPsychologicalProfileExport(natalChart, srChart),
      secondaryProgressions: buildSecondaryProgressionsExport(natalChart, srChart),
      contradictions: detectContradictions(analysis, srChart),
      lunarWeatherMap: generateLunarWeatherMap(analysis, srChart, natalChart),
      // New structured summary objects
      yearSummary: buildYearSummary(analysis, natalChart, srChart),
      scoredAspects: (() => {
        const bd = natalChart.birthDate || '';
        const bMonth = bd.split('-').length >= 2 ? parseInt(bd.split('-')[1], 10) - 1 : 0;
        return scoreAspects(analysis.srToNatalAspects || [], bMonth);
      })(),
      topThemes: (() => {
        const bd = natalChart.birthDate || '';
        const bMonth = bd.split('-').length >= 2 ? parseInt(bd.split('-')[1], 10) - 1 : 0;
        return generateTopThemes(scoreAspects(analysis.srToNatalAspects || [], bMonth));
      })(),
      houseEmphasis: buildHouseEmphasis(analysis),
      lunarFlow: buildLunarFlow(analysis, srChart, natalChart),
      patternTracking: buildPatternTracking(analysis, natalChart, srChart),
      finalAdvice: buildFinalAdvice(analysis, natalChart, srChart),
      reportStructureOrder: [
        'yearSummary', 'topThemes', 'identityDirection', 'relationships',
        'careerMoney', 'emotionalMoon', 'healthEnergy', 'houseEmphasis',
        'majorAspectsRanked', 'activationWindows', 'monthlyOverview',
        'advancedTechniques', 'patternTracking', 'finalAdvice',
      ],
    };
  };

  const downloadFile = (data: object, suffix: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `SolarReturn_${suffix}_${(natalChart.name || 'chart').replace(/\s+/g, '_')}_${srChart.solarReturnYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Button 1: Birthday Gift JSON — analysis as-is, no AI fields
  const downloadBirthdayJSON = () => {
    downloadFile({ report_type: "solar_return_birthday", data: buildBaseData() }, 'Birthday');
  };

  // Button 2: Full JSON — base + AI-generated fields if they exist
  const downloadFullJSON = () => {
    const base = buildBaseData();
    const aiFields = {
      yearAheadReading:   (analysis as any).narrativeReading   || (analysis as any).yearAheadReading || '',
      affirmation:        (analysis as any).affirmationText    || (analysis as any).affirmation || '',
      affirmationAuthor:  (analysis as any).affirmationAuthor  || '',
      affirmationQuote:   (analysis as any).affirmationQuote   || '',
      monthlyForecasts:   (analysis as any).monthlyForecasts   || [],
      fourSeasons:        (analysis as any).quarterlySeasons   || (analysis as any).fourSeasons || [],
      keyDates:           (analysis as any).keyDates           || [],
    };
    downloadFile({ report_type: "solar_return_full", data: { ...base, ...aiFields } }, 'Full');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={birthdayMode} onChange={(e) => setBirthdayMode(e.target.checked)}
            className="rounded border-border accent-primary w-4 h-4" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Birthday Gift Mode</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={goldBorders} onChange={(e) => setGoldBorders(e.target.checked)}
            className="rounded border-border accent-primary w-4 h-4" />
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Decorative Gold Borders</span>
        </label>
      </div>

      {birthdayMode && (
        <div className="border border-primary/20 rounded-sm p-3 bg-primary/5 space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-primary block">Personal Message</label>
          <textarea value={personalMessage} onChange={(e) => setPersonalMessage(e.target.value)}
            placeholder="Happy birthday! Wishing you an amazing year ahead..." rows={3}
            className="w-full border border-border bg-background text-foreground rounded-sm px-3 py-2 text-sm resize-none placeholder:text-muted-foreground/50" />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {narrative && narrative.trim().length > 0 && (
          <button onClick={downloadFullJSON}
            className="text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-sm inline-flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white border border-amber-600">
            <Download size={12} />
            Download JSON for PDF
          </button>
        )}
      </div>
    </div>
  );
};
