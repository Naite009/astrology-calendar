import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { EclipseMechanicsDiagram } from './EclipseMechanicsDiagram';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartSelector } from '@/components/ChartSelector';
import { NatalChart } from '@/hooks/useNatalChart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EclipseInterpretationLayer, extractNatalPoints } from './EclipseInterpretationLayer';
import { EclipseTeachingMode } from './EclipseTeachingMode';
import { buildAxisTeaching, type ZodiacSign } from '@/lib/astrology/signTeacher';
import { getProximityBadge } from '@/lib/astrology/eclipseAspects';
import { normalizeEclipseNodal } from '@/lib/astrology/eclipseNodalGuard';

// ── Types ──
export interface EclipseAspect {
  planet: string;
  type: string;
  sign: string;
  meaning: string;
}

export interface EclipseEvent {
  date: string;
  type: 'solar' | 'lunar';
  subtype: 'total' | 'annular' | 'partial' | 'penumbral' | 'annular-total';
  sign: ZodiacSign;
  degree: number;
  minutes: number;
  nodal: 'north' | 'south';
  series: string;
  description: string;
  title?: string;
  nodalTheme?: string;
  releasingThemes?: string[];
  buildingThemes?: string[];
  reflectionQuestions?: string[];
  aspects?: EclipseAspect[];
  sarosNote?: string;
}

// ── Nodal Education (exported for interpretation layer) ──
export const nodalEducation = {
  south: {
    label: "South Node Eclipse",
    emoji: "🌑",
    headline: "Release & Completion",
    shortMeaning:
      "A South Node eclipse brings something to its natural conclusion. Patterns, habits, or situations that have run their course are now visible — and ready to be released.",
    deeperMeaning:
      "The South Node represents where we've been — our comfort zone, our conditioning, and the well-worn grooves of habit. A South Node eclipse acts like a cosmic audit: it illuminates what we've been doing on autopilot and asks whether it's still serving us. This isn't punishment — it's clarity. Things end, patterns surface, and what was hidden in the background moves to the foreground so we can consciously evaluate it. South Node eclipses often bring a sense of 'I knew this was coming' — because on some level, we did.",
    howItFeels: [
      "Revelations about patterns you've been running unconsciously",
      "Endings or culminations that feel fated or long overdue",
      "A sense of wrapping up, resolving, or releasing",
      "Old situations resurfacing for final resolution",
      "Clarity about what is no longer aligned with your growth",
    ],
    guidance:
      "Don't fight what's completing. Let the audit happen. The question isn't 'how do I hold on?' — it's 'what have I learned, and what can I release with grace?'",
  },
  north: {
    label: "North Node Eclipse",
    emoji: "🌕",
    headline: "Activation & New Direction",
    shortMeaning:
      "A North Node eclipse opens a new chapter. It activates unfamiliar territory, pushing you toward growth, evolution, and a future that requires stepping beyond your comfort zone.",
    deeperMeaning:
      "The North Node represents where we're headed — the edge of our growth, the direction of our evolution. A North Node eclipse accelerates that journey. It introduces new people, circumstances, or realizations that feel fated but forward-facing. There may be an element of the unknown, even discomfort — because growth requires stepping into unfamiliar terrain. These eclipses often bring opportunities disguised as disruptions.",
    howItFeels: [
      "New beginnings that feel both exciting and uncertain",
      "People, opportunities, or circumstances arriving unexpectedly",
      "A sense of being pushed toward unfamiliar but meaningful territory",
      "Events that break open a new chapter",
      "The feeling that something important is being set in motion",
    ],
    guidance:
      "Say yes to what feels unfamiliar but resonant. The North Node asks for courage — not recklessness, but the willingness to walk toward what you haven't yet become.",
  },
};

// ── Eclipse Series Data ──
const ECLIPSE_SERIES: Record<string, { label: string; glyphs: string; period: string; status: string; description: string; bigPicture?: string; events: EclipseEvent[] }> = {
  'Aries-Libra': {
    label: 'Aries ↔ Libra',
    glyphs: '♈ ♎',
    period: '2023–2025',
    status: 'ending',
    description: 'Self vs. Other — identity, independence, relationships, and compromise. This series is winding down with its final eclipse in March 2025.',
    bigPicture: 'The Aries-Libra eclipse series asked us to find the right balance between self-assertion and accommodation. Where had we abandoned ourselves to keep the peace? Where had we been so focused on our own path that we forgot how much we need each other? These eclipses triggered pivotal chapters in relationships, identity reckonings that led to greater authenticity, and moments where partnership dynamics were fundamentally reset.',
    events: [
      {
        date: '2023-04-20', type: 'solar', subtype: 'annular-total', sign: 'Aries', degree: 29, minutes: 50, nodal: 'north', series: 'Aries-Libra',
        title: 'New Chapter in Identity',
        description: 'A rare hybrid eclipse at the final, most urgent degree of Aries. This opening shot of the Aries-Libra series asked: who are you, really, when no one else is watching?',
        nodalTheme: 'North Node in Aries: The universe is pushing you toward greater independence and self-definition. New beginnings in identity, courage, and personal direction are being activated.',
        releasingThemes: ['Over-dependence on others for self-validation', 'Relationships that required you to make yourself smaller', 'Indecision born from constantly weighing everyone else\'s needs over your own'],
        buildingThemes: ['Authentic self-expression and independent identity', 'The courage to initiate without waiting for permission', 'New beginnings in personal direction and physical vitality'],
        reflectionQuestions: ['Where have I been waiting for someone else to give me permission to begin?', 'What version of myself have I been hiding in my relationships?', 'What would I pursue if I stopped measuring myself against others?'],
      },
      {
        date: '2023-10-14', type: 'solar', subtype: 'annular', sign: 'Libra', degree: 21, minutes: 8, nodal: 'south', series: 'Aries-Libra',
        title: 'Relationship Audit',
        description: 'A South Node solar eclipse in Libra — existing relationship dynamics, agreements, and social contracts come under review. What partnerships are built on genuine equality, and which are running on outdated terms?',
        nodalTheme: 'South Node in Libra: Old relationship patterns, codependencies, and ways of \'keeping the peace\' at the expense of truth are ready to complete. Endings, revisions, and honest reckonings in partnership.',
        releasingThemes: ['People-pleasing and chronic accommodation', 'Relationships maintained out of obligation rather than genuine connection', 'The need for constant external validation to feel okay'],
        buildingThemes: ['Clarity about which relationships are genuinely reciprocal', 'The wisdom gained from past relationship cycles', 'A more honest foundation for future partnerships'],
        reflectionQuestions: ['Which relationships in my life require me to constantly compromise my truth?', 'Where have I confused keeping the peace with being genuinely at peace?', 'What agreements — spoken or unspoken — am I ready to renegotiate?'],
      },
      {
        date: '2024-03-25', type: 'lunar', subtype: 'penumbral', sign: 'Libra', degree: 5, minutes: 7, nodal: 'south', series: 'Aries-Libra',
        title: 'Quiet Emotional Reckoning',
        description: 'A subtle but significant penumbral lunar eclipse in Libra. The shift is internal — emotional clarity arrives softly about what you\'ve been tolerating in your closest relationships.',
        nodalTheme: 'South Node in Libra: Emotional patterns around approval-seeking and relationship dependency surface for gentle but honest review.',
        releasingThemes: ['Emotional dependency on partnership for a sense of self', 'The habit of adjusting your feelings to match others\' comfort'],
        buildingThemes: ['Emotional self-sufficiency', 'Clarity about what you actually need from partnership'],
        reflectionQuestions: ['Am I in my relationships because I want to be, or because I\'m afraid of being alone?', 'Where do I override my own emotional needs to avoid conflict?'],
      },
      {
        date: '2024-04-08', type: 'solar', subtype: 'total', sign: 'Aries', degree: 19, minutes: 24, nodal: 'north', series: 'Aries-Libra',
        title: 'Total Reset in Identity',
        description: 'The most powerful eclipse of this series — a total solar eclipse in Aries. A dramatic new chapter opens in themes of identity, independence, and personal direction. Events triggered here unfold for months.',
        nodalTheme: 'North Node in Aries: A fated acceleration toward greater independence, personal courage, and authentic self-expression. New people, opportunities, and chapters in identity arrive.',
        releasingThemes: ['Patterns of self-abandonment in relationships', 'Identity built around others\' definitions of you'],
        buildingThemes: ['A new, more authentic version of yourself', 'The courage to pursue what you want without constant consultation', 'New chapters in physical vitality, personal projects, and direction'],
        reflectionQuestions: ['Who am I becoming — separate from who others need me to be?', 'What would I begin right now if I knew it was supported by the universe?', 'Where has over-compromise kept me from my own growth?'],
        aspects: [{ planet: 'Chiron', type: 'conjunction', sign: 'Aries', meaning: 'Deep healing available around wounds of self-worth and identity. Old wounds around being seen, valued, and being enough rise for integration.' }],
      },
      {
        date: '2024-10-02', type: 'solar', subtype: 'annular', sign: 'Libra', degree: 10, minutes: 4, nodal: 'south', series: 'Aries-Libra',
        title: 'Final Partnership Review',
        description: 'The final major Libra eclipse of this series. Relationship chapters in revision since 2023 now reach a point of resolution. What was renegotiated? What was released?',
        nodalTheme: 'South Node in Libra: This is the conclusion of a long review of your relationship patterns. What have you learned about what you truly need from partnership?',
        releasingThemes: ['Outdated relationship contracts and dynamics', 'The belief that you must earn love through constant accommodation'],
        buildingThemes: ['A clearer sense of what genuine partnership looks like for you', 'The wisdom to enter future relationships from wholeness, not need'],
        reflectionQuestions: ['What relationship lesson from the last two years are you ready to integrate?', 'What do you now know about yourself in relationship that you didn\'t before?'],
      },
      {
        date: '2025-03-29', type: 'solar', subtype: 'partial', sign: 'Aries', degree: 9, minutes: 0, nodal: 'north', series: 'Aries-Libra',
        title: 'Closing Chapter, New Beginning',
        description: 'The final eclipse of the Aries-Libra series. A gentle partial solar eclipse — a closing note on the identity and relationship themes activated since 2023.',
        nodalTheme: 'North Node in Aries: One last push toward independent self-expression as this series closes. The seeds of who you\'ve become are ready to be carried forward.',
        releasingThemes: ['Any remaining hesitation about claiming your own direction'],
        buildingThemes: ['Consolidating the identity growth of this two-year cycle', 'Carrying forward the clarity gained in relationship'],
        reflectionQuestions: ['Who have I become since April 2023?', 'What relationship wisdom am I taking with me into this next chapter?'],
      },
    ],
  },
  'Virgo-Pisces': {
    label: 'Virgo ↔ Pisces',
    glyphs: '♍ ♓',
    period: '2024–2027',
    status: 'active',
    description: 'Service vs. Surrender — health, routines, analysis, spirituality, intuition, and letting go. These LUNAR eclipses overlap with the Leo-Aquarius solar eclipses.',
    bigPicture: 'The Virgo-Pisces eclipse series asks us to find the right relationship between the tangible and the transcendent — the daily system and the deeper purpose behind it. Virgo asks: what\'s actually working? Pisces asks: why are you doing any of this? Together, they invite us to build lives that are both practically sound and spiritually meaningful. Cause and effect become visible. What we have tended — with care or neglect — now shows its results.',
    events: [
      {
        date: '2024-09-18', type: 'lunar', subtype: 'partial', sign: 'Pisces', degree: 25, minutes: 41, nodal: 'south', series: 'Virgo-Pisces',
        title: 'Letting Go of What We Can\'t Control',
        description: 'The opening lunar eclipse of the Virgo-Pisces series, in Pisces. Emotional completions around themes of loss, sacrifice, and spiritual surrender. What you\'ve been holding that was never truly yours to carry becomes visible.',
        nodalTheme: 'South Node in Pisces: Old patterns of self-dissolution, martyrdom, and escape are ready to complete. Where have you been giving everything away — your energy, your boundaries, your clarity — without replenishment?',
        releasingThemes: ['Patterns of escapism or chronic avoidance of practical reality', 'Martyrdom — giving beyond capacity and quietly resenting it', 'Confusion maintained because clarity feels too confronting', 'Spiritual bypassing — using spirituality to avoid dealing with real life'],
        buildingThemes: ['Emotional clarity about what you\'ve been avoiding', 'A more grounded approach to spiritual practice', 'The groundwork for healthier daily habits'],
        reflectionQuestions: ['Where have I been the martyr — giving beyond my capacity and resenting it?', 'What am I using as an escape from the practical reality I need to face?', 'Where have I dissolved my own needs into someone else\'s story?'],
      },
      {
        date: '2025-03-14', type: 'lunar', subtype: 'total', sign: 'Virgo', degree: 23, minutes: 57, nodal: 'north', series: 'Virgo-Pisces',
        title: 'The Great Realignment',
        description: 'A powerful total lunar eclipse in Virgo — the Moon turns red as the Earth\'s shadow falls across it. Major revelations around health, daily habits, work routines, and the systems structuring your life. What has your daily life actually been producing?',
        nodalTheme: 'North Node in Virgo: Growth is calling you toward greater discernment, healthier daily habits, and a more intentional relationship with your body and work. New chapters in health, service, and practical craft are opening.',
        releasingThemes: ['Vague, unmeasured effort that looks busy but produces little', 'The dream without the method'],
        buildingThemes: ['Systems and routines that genuinely support your wellbeing', 'Work that is aligned with skill, craft, and real contribution', 'A more honest relationship with your physical body'],
        reflectionQuestions: ['What is my daily life actually producing — and is that what I want to be creating?', 'Where has perfectionism kept me paralyzed instead of moving forward?', 'What practical step have I been postponing that would change everything?'],
        aspects: [{ planet: 'Saturn', type: 'conjunction', sign: 'Pisces', meaning: 'Saturn conjunct the Sun adds weight and seriousness to what needs to be restructured. Reality checks are stark but clarifying.' }],
      },
      {
        date: '2025-09-07', type: 'lunar', subtype: 'total', sign: 'Pisces', degree: 15, minutes: 23, nodal: 'south', series: 'Virgo-Pisces',
        title: 'Emotional Release & Spiritual Completion',
        description: 'A total lunar eclipse in Pisces — emotional, karmic, and deeply felt. Completions in themes of sacrifice, spiritual practice, and the long emotional threads we\'ve been carrying. The Moon in Pisces dissolves what no longer needs to be held.',
        nodalTheme: 'South Node in Pisces: A deep karmic completion. Old stories around victimhood, emotional chaos, or spiritual confusion reach their natural end. What you\'ve been dreaming about without acting on — this eclipse asks why.',
        releasingThemes: ['Long-held grief or emotional heaviness ready to be released', 'Old dreams that belong to a previous version of you', 'The habit of suffering in silence or carrying others\' emotional weight'],
        buildingThemes: ['Emotional freedom through conscious completion', 'A cleaner relationship to intuition — one that doesn\'t spiral into confusion'],
        reflectionQuestions: ['What grief have I been carrying that I haven\'t allowed myself to fully process?', 'Which of my \'dreams\' are genuinely mine — and which belong to who I used to be?', 'Where am I choosing romantic illusion over practical truth?'],
      },
      {
        date: '2025-09-21', type: 'solar', subtype: 'partial', sign: 'Virgo', degree: 29, minutes: 5, nodal: 'north', series: 'Virgo-Pisces',
        title: 'New Health & Work Chapter',
        description: 'A partial solar eclipse at the final degree of Virgo — urgent, liminal energy at the threshold of a sign. New chapters in health, daily life, work, and service open. Intentions set here carry powerful forward momentum.',
        nodalTheme: 'North Node in Virgo: A fated opening to new chapters in physical wellbeing, daily practice, and meaningful work. The universe supports building systems that truly serve your health and genuine contribution.',
        releasingThemes: ['The final remnants of patterns identified in the 2025 lunar eclipses'],
        buildingThemes: ['New health protocols and body-honoring daily routines', 'Work and service aligned with your actual skills and values', 'The practical infrastructure for the life you want to be living'],
        reflectionQuestions: ['What one daily habit, if implemented consistently, would most change the trajectory of my health?', 'What kind of work would feel like genuine service — using my real skills?'],
      },
      {
        date: '2026-03-03', type: 'lunar', subtype: 'total', sign: 'Virgo', degree: 12, minutes: 54, nodal: 'south', series: 'Virgo-Pisces',
        title: 'The Harvest Audit',
        description: 'A total lunar eclipse in Virgo — the Blood Moon. A South Node eclipse brings what has been forming in the background directly in front of you. The harvest is now visible: what have your daily habits, routines, and systems actually produced? This is not a judgment — it is a revelation. The eclipse illuminates both what is working beautifully and what has been running on autopilot past its expiration date.',
        nodalTheme: 'South Node in Virgo: A cosmic audit of the systems, routines, and habits that have become unconscious. Where have you been efficient at functioning inside someone else\'s expectations while neglecting your own natural rhythm? What is ready to be released, streamlined, or let go entirely?',
        releasingThemes: ['Routines and habits that have become automatic but no longer serve you', 'Over-optimizing for productivity at the expense of your wellbeing', 'Perfectionism as avoidance — endless refining that prevents completion', 'Work or service that drains without replenishing', 'Functioning well inside a system that isn\'t actually yours'],
        buildingThemes: ['Clarity about what in your daily life is genuinely working', 'The practical wisdom accumulated through years of refinement', 'A foundation of discernment to carry into the next chapter'],
        reflectionQuestions: ['What does my daily life actually look like — and is it aligned with what I say I value?', 'Where have I been tending a system that serves someone else\'s vision more than my own?', 'What habit or routine has quietly been draining me that I\'ve been ignoring?', 'Where has functioning well replaced living in alignment?', 'What is my body trying to tell me that I keep overriding with productivity?'],
        aspects: [
          { planet: 'Jupiter', type: 'sextile', sign: 'Cancer', meaning: 'Jupiter in Cancer sextiles the Moon, offering perspective and generous support. It clarifies where your everyday efforts create real value versus where you\'re pouring energy into a bottomless well. An opening sextile suggests: try a different approach. The method may need updating even if the goal is right.' },
          { planet: 'Jupiter', type: 'trine', sign: 'Cancer', meaning: 'Jupiter trines the Sun in Pisces, illuminating the bigger picture of your goals and the deeper meaning behind your daily efforts. What is the \'why\' behind everything you\'ve been building?' },
        ],
        sarosNote: 'Check events from approximately March 2008 for thematic echoes — what was happening in your health, work, or daily life that connects to what surfaces now?',
      },
      {
        date: '2026-08-28', type: 'lunar', subtype: 'partial', sign: 'Pisces', degree: 4, minutes: 54, nodal: 'south', series: 'Virgo-Pisces',
        title: 'Gentle Emotional Release',
        description: 'A partial lunar eclipse in Pisces — a quieter, more internal completion. Emotional threads and spiritual patterns that have been in transition since 2024 reach their gentle conclusion.',
        nodalTheme: 'South Node in Pisces: The softer, final completion of emotional and spiritual patterns this series has been resolving. A time for quiet release, not dramatic endings.',
        releasingThemes: ['Residual emotional heaviness from the 2024–2026 cycle', 'The last traces of confusion or avoidance around practical reality'],
        buildingThemes: ['Emotional integration and spiritual maturity', 'A quieter, more sustainable spiritual practice'],
        reflectionQuestions: ['What emotional weight am I finally ready to set down?', 'How has my relationship to spirituality changed since this series began?'],
      },
      {
        date: '2027-02-20', type: 'lunar', subtype: 'penumbral', sign: 'Virgo', degree: 2, minutes: 6, nodal: 'north', series: 'Virgo-Pisces',
        title: 'Quiet Closing Note',
        description: 'Final penumbral lunar eclipse in Virgo — gentle closing of the Virgo-Pisces cycle. The quietest eclipse of the series, sealing the lessons of three years of health, service, and discernment work.',
        nodalTheme: 'North Node in Virgo: A final, gentle nudge toward the practical growth this series has been building. The seeds planted throughout this cycle are now part of your foundation.',
        releasingThemes: ['The final threads of the Virgo-Pisces story'],
        buildingThemes: ['The integrated wisdom of three years of practical and spiritual growth'],
        reflectionQuestions: ['What has this entire Virgo-Pisces series taught me about the relationship between my daily life and my deeper purpose?'],
      },
    ],
  },
  'Leo-Aquarius': {
    label: 'Leo ↔ Aquarius',
    glyphs: '♌ ♒',
    period: '2026–2028',
    status: 'upcoming',
    description: 'Self-Expression vs. Community — creativity, heart, leadership, individuality, group consciousness, and humanitarian vision. All SOLAR eclipses fall on this axis.',
    bigPicture: 'The Leo-Aquarius series will ask: where do personal creative expression and collective vision meet? Where have you been hiding your light to fit in — and where have you lost yourself in group identity? These eclipses bring new chapters in creative leadership, authentic self-expression, and the question of how individual genius serves the collective good.',
    events: [
      {
        date: '2026-02-17', type: 'solar', subtype: 'annular', sign: 'Aquarius', degree: 28, minutes: 50, nodal: 'south', series: 'Leo-Aquarius',
        title: 'Releasing Collective Conditioning',
        description: 'The opening eclipse of the Leo-Aquarius series. Old group identities, collective belief systems, and social conditioning that have limited your self-expression are ready to be released.',
        nodalTheme: 'South Node in Aquarius: Patterns of conforming to group identity, hiding individuality to fit in, or defining yourself entirely through your tribe are completing.',
        releasingThemes: ['Over-identification with group identity at the expense of individual expression', 'Revolutionary ideas kept safely theoretical rather than lived', 'Emotional detachment used as a shield against real intimacy'],
        buildingThemes: ['Clarity about what you genuinely believe versus what you\'ve absorbed from your communities', 'The groundwork for more authentic self-expression'],
        reflectionQuestions: ['Where have I shaped my identity around what my community approves of?', 'What part of me have I kept hidden because it didn\'t fit my group\'s image?'],
      },
      {
        date: '2026-08-12', type: 'solar', subtype: 'total', sign: 'Leo', degree: 20, minutes: 2, nodal: 'north', series: 'Leo-Aquarius',
        title: 'Total Creative Activation',
        description: 'A total solar eclipse in Leo — the most dramatic of this series. A major new chapter opens in creative expression, leadership, romance, joy, and the courage to be fully, unapologetically yourself.',
        nodalTheme: 'North Node in Leo: The universe is activating your creative heart. New chapters in self-expression, creative work, romance, and the courage to be seen in your full radiance are opening.',
        releasingThemes: ['Dimming your light to make others comfortable', 'Waiting for permission to create, lead, or love fully'],
        buildingThemes: ['Creative projects and expressions that are unmistakably yours', 'Leadership from the heart — generosity and genuine warmth', 'New chapters in love, joy, and what makes life feel worth living'],
        reflectionQuestions: ['What would I create if I stopped worrying about how it would be received?', 'Where have I been waiting for permission to fully show up?', 'What does it mean to lead from love rather than from performance?'],
      },
      {
        date: '2027-02-06', type: 'solar', subtype: 'annular', sign: 'Aquarius', degree: 17, minutes: 38, nodal: 'south', series: 'Leo-Aquarius',
        title: 'Reforming Group Identity',
        description: 'A second South Node eclipse in Aquarius — releasing outdated collective identities and social roles that have limited authentic self-expression.',
        nodalTheme: 'South Node in Aquarius: The group structures and social identities that have defined you are being reformed. What communities, ideologies, or collective roles are you ready to release or renegotiate?',
        releasingThemes: ['Communities or roles that require you to suppress your individuality', 'Ideological rigidity masquerading as principle'],
        buildingThemes: ['Communities that celebrate individual expression within collective vision', 'A clearer sense of which groups genuinely resonate with who you are'],
        reflectionQuestions: ['Which of my communities nurture my full self — and which require me to shrink?', 'Where am I confusing loyalty to a group with living my truth?'],
      },
      {
        date: '2027-08-02', type: 'solar', subtype: 'total', sign: 'Leo', degree: 9, minutes: 55, nodal: 'north', series: 'Leo-Aquarius',
        title: 'Heart in Full Expression',
        description: 'A second total solar eclipse in Leo — the creative, heart-centered chapter deepens. New directions in creative work, romantic love, play, and authentic leadership consolidate and expand.',
        nodalTheme: 'North Node in Leo: The fated acceleration of your creative and expressive life continues. Go further into what lights you up.',
        releasingThemes: ['Any remaining self-censorship in creative work or personal expression'],
        buildingThemes: ['Creative mastery and deeper expression of your unique gifts', 'Love and creative work that flows from genuine joy rather than approval-seeking'],
        reflectionQuestions: ['What has my creative life become since August 2026?', 'Where am I expressing myself most fully — and where am I still holding back?'],
      },
      {
        date: '2027-08-17', type: 'lunar', subtype: 'penumbral', sign: 'Aquarius', degree: 24, minutes: 12, nodal: 'south', series: 'Leo-Aquarius',
        title: 'Quiet Collective Completion',
        description: 'A penumbral lunar eclipse in Aquarius — subtle inner shifts around group identity, friendships, and collective purpose. Old community patterns fade quietly.',
        nodalTheme: 'South Node in Aquarius: A gentle completion of old group dynamics and collective patterns.',
        releasingThemes: ['Friendships and communities that no longer reflect who you\'ve become'],
        buildingThemes: ['Clarity about the communities and causes genuinely worth your energy'],
        reflectionQuestions: ['Which friendships and communities are growing with me — and which have I outgrown?'],
      },
      {
        date: '2028-01-26', type: 'solar', subtype: 'annular', sign: 'Aquarius', degree: 6, minutes: 11, nodal: 'south', series: 'Leo-Aquarius',
        title: 'Final Chapter of Group Identity',
        description: 'The closing eclipse of the Leo-Aquarius series. What has been learned about individual authenticity and collective belonging reaches its final integration.',
        nodalTheme: 'South Node in Aquarius: The completion of the Leo-Aquarius lesson — you don\'t have to choose between being yourself and belonging. The right communities celebrate your full expression.',
        releasingThemes: ['The final belief that creative self-expression is incompatible with community'],
        buildingThemes: ['The integrated wisdom: your unique creative voice is your greatest contribution to the collective'],
        reflectionQuestions: ['What have I learned about the relationship between my individual expression and my place in community?', 'How has the last two years transformed how I understand creativity, leadership, and belonging?'],
      },
    ],
  },
  'Cancer-Capricorn': {
    label: 'Cancer ↔ Capricorn',
    glyphs: '♋ ♑',
    period: '2027–2029',
    status: 'next',
    description: 'Home vs. Career — emotional security, family, nurturing, ambition, public reputation, and authority. The next major axis to activate.',
    bigPicture: 'The Cancer-Capricorn eclipse series will examine the relationship between our private emotional life and our public ambitions. Where have we sacrificed genuine belonging for achievement? Where have we used the comfort of home as a retreat from contribution? These eclipses activate themes of family, emotional foundation, career, legacy, and the question of what truly nourishes us.',
    events: [
      {
        date: '2027-07-18', type: 'lunar', subtype: 'penumbral', sign: 'Capricorn', degree: 25, minutes: 49, nodal: 'south', series: 'Cancer-Capricorn',
        title: 'Career Patterns Coming to Light',
        description: 'The opening eclipse of the Cancer-Capricorn series. Subtle but real shifts in how you relate to career, authority, and public achievement begin to surface.',
        nodalTheme: 'South Node in Capricorn: Old patterns of achievement for achievement\'s sake, workaholism, and defining worth through status are beginning to surface for review.',
        releasingThemes: ['The belief that productivity determines worthiness', 'Career structures maintained past their expiration date'],
        buildingThemes: ['The beginning of a recalibration between outer achievement and inner nourishment'],
        reflectionQuestions: ['Where have I been climbing toward a goal that no longer feels meaningful?', 'Am I achieving for myself — or performing achievement for external validation?'],
      },
      {
        date: '2028-01-12', type: 'lunar', subtype: 'partial', sign: 'Cancer', degree: 21, minutes: 28, nodal: 'north', series: 'Cancer-Capricorn',
        title: 'Emotional Foundations Activated',
        description: 'A partial lunar eclipse in Cancer — emotional revelations about home, family, belonging, and what you truly need to feel safe and genuinely nourished.',
        nodalTheme: 'North Node in Cancer: Growth is calling you toward deeper emotional roots, genuine belonging, and the courage to prioritize nourishment over status.',
        releasingThemes: ['Emotional unavailability disguised as strength', 'The belief that needing nurturing is weakness'],
        buildingThemes: ['Deeper emotional intimacy and genuine home life', 'Career and ambition in service of real life, not the other way around'],
        reflectionQuestions: ['What do I actually need to feel emotionally safe — and am I allowing myself to have it?', 'How has the pursuit of achievement affected my experience of home and family?'],
      },
      {
        date: '2028-07-06', type: 'lunar', subtype: 'partial', sign: 'Capricorn', degree: 15, minutes: 11, nodal: 'south', series: 'Cancer-Capricorn',
        title: 'Authority & Legacy Review',
        description: 'A partial lunar eclipse in Capricorn — old authority structures, career patterns, and legacy frameworks come under review.',
        nodalTheme: 'South Node in Capricorn: The structures of achievement that have defined your public identity are being examined. What legacy do you actually want to leave?',
        releasingThemes: ['Career paths chosen for status over meaning', 'Relationships with authority figures that keep you small'],
        buildingThemes: ['A redefinition of success that includes emotional richness', 'Legacy built from genuine contribution rather than image management'],
        reflectionQuestions: ['What would I be doing with my career if no one was watching?', 'What legacy am I actually building — and does it align with what matters most to me?'],
      },
      {
        date: '2028-07-22', type: 'solar', subtype: 'total', sign: 'Cancer', degree: 29, minutes: 51, nodal: 'north', series: 'Cancer-Capricorn',
        title: 'Total Emotional Renewal',
        description: 'A total solar eclipse at the final degree of Cancer — the most powerful eclipse of this series. A dramatic new chapter in home, family, emotional foundation, and the question of where you truly belong.',
        nodalTheme: 'North Node in Cancer: A fated new beginning in emotional life, home, family, and genuine belonging. The universe is activating what actually nourishes you.',
        releasingThemes: ['The armor that achievement has become', 'The version of home or family that was inherited rather than consciously chosen'],
        buildingThemes: ['A new emotional foundation — one that genuinely nourishes', 'Home as sanctuary, not just logistics', 'A career in true alignment with what you need to feel whole'],
        reflectionQuestions: ['What would home feel like if I built it entirely around what nourishes me?', 'Am I ready to let achievement serve my life — rather than be my life?'],
      },
      {
        date: '2028-12-31', type: 'lunar', subtype: 'total', sign: 'Cancer', degree: 10, minutes: 33, nodal: 'north', series: 'Cancer-Capricorn',
        title: 'New Year\'s Eve Blood Moon',
        description: 'A total lunar eclipse in Cancer on New Year\'s Eve — powerfully symbolic. Emotional revelations about home, belonging, and what truly nourishes surface as one year ends and another begins.',
        nodalTheme: 'North Node in Cancer: A profound emotional culmination at the turn of the year. What has this series shown you about what home, family, and genuine belonging mean to you?',
        releasingThemes: ['The year — and the emotional patterns — that are completing', 'Any remaining ambivalence about prioritizing genuine nourishment'],
        buildingThemes: ['Entering the new year with emotional clarity and deeper roots', 'A vision for life where achievement and belonging coexist'],
        reflectionQuestions: ['As this year ends, what emotional truth have I been avoiding that I\'m finally ready to face?', 'What does \'home\' mean to me now — and am I living in a way that reflects that?'],
      },
      {
        date: '2029-06-26', type: 'lunar', subtype: 'total', sign: 'Capricorn', degree: 4, minutes: 50, nodal: 'south', series: 'Cancer-Capricorn',
        title: 'Final Achievement Audit',
        description: 'The closing eclipse of the Cancer-Capricorn series. The final integration of what this series taught about the relationship between ambition and belonging.',
        nodalTheme: 'South Node in Capricorn: The completion of the Cancer-Capricorn lesson: genuine achievement is only meaningful when rooted in genuine belonging.',
        releasingThemes: ['Any remaining belief that success requires sacrificing emotional wellbeing'],
        buildingThemes: ['The integrated wisdom: a life where career and home mutually nourish rather than compete'],
        reflectionQuestions: ['What have the last two years taught me about what I\'m actually building my life around?', 'How have my definitions of success and home changed since 2027?'],
      },
    ],
  },
};

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const TEACHING_TAGS: Record<string, string[]> = {
  '2026-03-03': ['System audit', 'Cause & effect', 'Mutable Earth refinement'],
};

function getSignGlyph(sign: string): string {
  const glyphs: Record<string, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
    Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
  };
  return glyphs[sign] || '';
}

function getHouseForDegree(sign: string, degree: number, chart: NatalChart): number | null {
  if (!chart.houseCusps) return null;
  const signIdx = ZODIAC_ORDER.indexOf(sign);
  if (signIdx === -1) return null;
  const longitude = signIdx * 30 + degree;

  const cusps: { house: number; lng: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const key = `house${i}` as keyof typeof chart.houseCusps;
    const c = chart.houseCusps[key];
    if (!c?.sign) return null;
    const cIdx = ZODIAC_ORDER.indexOf(c.sign);
    cusps.push({ house: i, lng: cIdx * 30 + (c.degree || 0) + ((c.minutes || 0) / 60) });
  }

  for (let i = 0; i < 12; i++) {
    const start = cusps[i].lng;
    const end = cusps[(i + 1) % 12].lng;
    const adjustedEnd = end <= start ? end + 360 : end;
    const adjustedLng = longitude < start ? longitude + 360 : longitude;
    if (adjustedLng >= start && adjustedLng < adjustedEnd) return cusps[i].house;
  }
  return 1;
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const HOUSE_LIFE_AREAS: Record<number, string> = {
  1: 'Identity, body, self-image, how others see you',
  2: 'Money, possessions, self-worth, personal resources',
  3: 'Communication, siblings, local travel, learning',
  4: 'Home, family, roots, emotional foundations',
  5: 'Romance, creativity, children, joy, self-expression',
  6: 'Health, daily routines, work, service, pets',
  7: 'Partnerships, marriage, one-on-one relationships',
  8: 'Shared resources, transformation, intimacy, death/rebirth',
  9: 'Higher education, travel, philosophy, beliefs, publishing',
  10: 'Career, public reputation, legacy, authority',
  11: 'Friends, groups, hopes, wishes, community',
  12: 'Spirituality, solitude, hidden matters, the unconscious',
};

const LS_KEYS = {
  tab: 'eclipseExplorer.activeTab',
  eclipse: 'eclipseExplorer.selectedEclipseDate',
  chart: 'eclipseExplorer.selectedChartId',
};

interface Props {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

export function EclipseEncyclopediaExplorer({ userNatalChart, savedCharts }: Props) {
  const [selectedChartId, setSelectedChartId] = useState<string | null>(() => {
    try { return localStorage.getItem(LS_KEYS.chart); } catch { return null; }
  });
  const [activeSeriesTab, setActiveSeriesTab] = useState(() => {
    try { return localStorage.getItem(LS_KEYS.tab) || 'all'; } catch { return 'all'; }
  });
  const [selectedEclipse, setSelectedEclipse] = useState<EclipseEvent | null>(null);
  const [teachingMode, setTeachingMode] = useState(false);
  const teacherRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const allEclipsesSorted = useMemo(() => {
    const all: EclipseEvent[] = [];
    Object.values(ECLIPSE_SERIES).forEach(s => all.push(...s.events));
    return all.map(normalizeEclipseNodal).sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const nextUpcomingEclipse = useMemo(() => {
    const now = new Date().toISOString().slice(0, 10);
    return allEclipsesSorted.find(e => e.date >= now) ?? allEclipsesSorted[0] ?? null;
  }, [allEclipsesSorted]);

  useEffect(() => {
    try {
      const savedDate = localStorage.getItem(LS_KEYS.eclipse);
      if (savedDate) {
        const found = allEclipsesSorted.find(e => e.date === savedDate);
        if (found) setSelectedEclipse(found);
      }
    } catch { /* ignore */ }
  }, [allEclipsesSorted]);

  useEffect(() => {
    try { localStorage.setItem(LS_KEYS.tab, activeSeriesTab); } catch { /* */ }
  }, [activeSeriesTab]);

  useEffect(() => {
    try {
      if (selectedEclipse?.date) localStorage.setItem(LS_KEYS.eclipse, selectedEclipse.date);
    } catch { /* */ }
  }, [selectedEclipse?.date]);

  useEffect(() => {
    try {
      if (selectedChartId) localStorage.setItem(LS_KEYS.chart, selectedChartId);
      else localStorage.removeItem(LS_KEYS.chart);
    } catch { /* */ }
  }, [selectedChartId]);

  const handleSelectEclipse = useCallback((e: EclipseEvent) => {
    setSelectedEclipse(e);
    requestAnimationFrame(() => teacherRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  const scrollToTimeline = useCallback(() => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const activeEclipse = selectedEclipse || nextUpcomingEclipse;

  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userNatalChart) charts.push(userNatalChart);
    savedCharts.forEach(c => {
      if (!userNatalChart || c.name !== userNatalChart.name) charts.push(c);
    });
    return charts;
  }, [userNatalChart, savedCharts]);

  const selectedChart = useMemo(() => {
    if (!selectedChartId) return null;
    // ChartSelector uses 'user' as id for userNatalChart, chart.id for saved charts
    if (selectedChartId === 'user' && userNatalChart) return userNatalChart;
    return allCharts.find(c => c.id === selectedChartId || c.name === selectedChartId) || null;
  }, [selectedChartId, allCharts, userNatalChart]);

  const activeSeries = ECLIPSE_SERIES[activeSeriesTab];

  const currentList = useMemo(() => {
    if (activeSeriesTab === 'all') return allEclipsesSorted;
    return activeSeries?.events ?? allEclipsesSorted;
  }, [activeSeriesTab, activeSeries, allEclipsesSorted]);

  const natalPoints = useMemo(() => {
    if (!selectedChart) return null;
    return extractNatalPoints(selectedChart);
  }, [selectedChart]);

  const proximityByDate = useMemo(() => {
    if (!natalPoints) return new Map<string, string>();
    const m = new Map<string, string>();
    for (const e of allEclipsesSorted) {
      const badge = getProximityBadge(e, natalPoints);
      if (badge) m.set(e.date, badge);
    }
    return m;
  }, [allEclipsesSorted, natalPoints]);

  const personalizedEvents = useMemo(() => {
    if (!selectedChart?.houseCusps || !activeSeries) return null;
    return activeSeries.events.map(e => {
      const house = getHouseForDegree(e.sign, e.degree, selectedChart);
      const oppositeSign = ZODIAC_ORDER[(ZODIAC_ORDER.indexOf(e.sign) + 6) % 12];
      const oppositeHouse = getHouseForDegree(oppositeSign, e.degree, selectedChart);
      return { ...e, house, oppositeHouse };
    });
  }, [selectedChart, activeSeries]);

  const renderProximityBadge = (date: string) => {
    const prox = proximityByDate.get(date);
    if (!prox) return null;
    return <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">🧲 {prox}</Badge>;
  };

  const renderEclipseCard = (e: EclipseEvent & { house?: number | null; oppositeHouse?: number | null }, idx: number, seriesEvents?: EclipseEvent[]) => {
    const dateObj = new Date(e.date + 'T12:00:00');
    const formatted = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const now = new Date();
    const isPast = dateObj < now;
    const events = seriesEvents || allEclipsesSorted;
    const isNext = !isPast && (idx === 0 || new Date(events[idx - 1]?.date + 'T12:00:00') < now);
    const house = 'house' in e ? e.house : (selectedChart?.houseCusps ? getHouseForDegree(e.sign, e.degree, selectedChart) : null);
    const oppositeSign = ZODIAC_ORDER[(ZODIAC_ORDER.indexOf(e.sign) + 6) % 12];
    const oppositeHouse = 'oppositeHouse' in e ? e.oppositeHouse : (selectedChart?.houseCusps ? getHouseForDegree(oppositeSign, e.degree, selectedChart) : null);

    return (
      <Card key={`${e.date}-${idx}`} onClick={() => handleSelectEclipse(e)} className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${e.type === 'solar' ? 'border-l-primary' : 'border-l-accent'} ${isPast ? 'opacity-50' : ''} ${isNext ? 'ring-2 ring-primary/30' : ''} ${selectedEclipse?.date === e.date ? 'ring-2 ring-accent' : ''}`}>
        <CardContent className="py-4 flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex items-center gap-2 min-w-[140px]">
            <span className="text-2xl">{e.type === 'solar' ? '🌑' : '🌕'}</span>
            <div>
              <p className="font-semibold text-sm capitalize">{e.subtype} {e.type}</p>
              <p className="text-xs text-muted-foreground">{formatted}</p>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {e.degree}°{e.minutes > 0 ? e.minutes.toString().padStart(2, '0') + "'" : ''} {getSignGlyph(e.sign)} {e.sign}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {e.nodal === 'north' ? '☊ North Node' : '☋ South Node'}
              </Badge>
              {!seriesEvents && <Badge variant="outline" className="text-[10px]">{e.series}</Badge>}
              {isPast && <Badge className="text-xs bg-muted text-muted-foreground">Past</Badge>}
              {isNext && <Badge className="text-xs bg-primary text-primary-foreground">Next</Badge>}
              {renderProximityBadge(e.date)}
            </div>
            {e.title && (
              <p className="text-sm font-semibold text-foreground">{e.title}</p>
            )}
            <p className="text-sm text-muted-foreground">{e.description}</p>
            {e.sarosNote && (
              <p className="text-xs text-primary/80 italic mt-1">🔄 {e.sarosNote}</p>
            )}
            {TEACHING_TAGS[e.date] && (
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Teaching Tags:</span>
                {TEACHING_TAGS[e.date].map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px] bg-accent/10 text-accent-foreground">{tag}</Badge>
                ))}
              </div>
            )}
            {(() => {
              const axisData = buildAxisTeaching(e.sign);
              return (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {axisData.axisStirredLine(e.sign)}
                </p>
              );
            })()}
            {house && (
              <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium">
                  ✨ Falls in your <strong>{getOrdinalSuffix(house)} House</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {HOUSE_LIFE_AREAS[house]}
                </p>
                {oppositeHouse && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Axis activation: also stirring <strong>{getOrdinalSuffix(oppositeHouse)} House</strong> themes ({HOUSE_LIFE_AREAS[oppositeHouse]?.split(',')[0]})
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* ── Education Section ── */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">🌑</span> Understanding Eclipses
          </CardTitle>
          <p className="text-muted-foreground">
            Eclipses are the most powerful lunation events in astrology — cosmic wildcards that accelerate fate, reveal hidden truths, and open portals to major life changes.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="multiple" defaultValue={['what', 'solar-vs-lunar', 'nodes']}>
            <AccordionItem value="what">
              <AccordionTrigger className="text-lg font-semibold">What Are Eclipses?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  Eclipses happen when New Moons or Full Moons align closely with the <strong>Lunar Nodes</strong> — the points where the Moon's orbit crosses the Sun's path (the ecliptic). This alignment creates a literal shadow event: the light of the Sun or Moon is temporarily blocked.
                </p>
                <p>
                  Astrologically, eclipses represent <strong>fate-accelerating events</strong>. They open and close chapters of your life, often bringing sudden revelations, endings, or beginnings that feel "meant to be." Unlike regular New and Full Moons, eclipse effects can unfold over <strong>6 months to a year</strong>.
                </p>
                <p>
                  Eclipses travel in pairs along an <strong>axis</strong> (two opposite signs), cycling through each axis for about 18 months before moving on.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="overlap">
              <AccordionTrigger className="text-lg font-semibold">Why Eclipse Series Overlap</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  One of the most confusing things about eclipses is that <strong>multiple series run simultaneously</strong>. As the nodes shift from one axis to the next, there's a transition period where eclipses from the old and new axes interleave.
                </p>
                <p>
                  Right now (2025–2027), this is exactly what's happening: the <strong>Virgo-Pisces lunar eclipses</strong> continue alongside the new <strong>Leo-Aquarius solar eclipses</strong>. The solar eclipses have moved to Leo-Aquarius, but the lunar eclipses are still completing the Virgo-Pisces story.
                </p>
                <p>
                  This means two different axes of your chart are being activated at the same time — a more complex but rich period of growth.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="solar-vs-lunar">
              <AccordionTrigger className="text-lg font-semibold">Solar vs. Lunar Eclipses</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-card/50 border-primary/20">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <span className="text-2xl">🌑</span> Solar Eclipse
                      </div>
                      <p className="text-sm text-muted-foreground">Occurs at a <strong>New Moon</strong> near a Node</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                        <li><strong>Theme:</strong> New beginnings, fresh starts, doors opening</li>
                        <li><strong>Energy:</strong> External events catalyze change — fate knocks on your door</li>
                        <li><strong>Timing:</strong> Effects unfold over 6 months forward</li>
                        <li><strong>Advice:</strong> Don't manifest or do rituals — observe what the universe brings to you</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 border-accent/20">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <span className="text-2xl">🌕</span> Lunar Eclipse
                      </div>
                      <p className="text-sm text-muted-foreground">Occurs at a <strong>Full Moon</strong> near a Node</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                        <li><strong>Theme:</strong> Culminations, revelations, emotional breakthroughs</li>
                        <li><strong>Energy:</strong> Internal shifts — what was hidden comes to light</li>
                        <li><strong>Timing:</strong> Effects can reach back 6 months to a prior solar eclipse</li>
                        <li><strong>Advice:</strong> Process emotions, let go of what's completed</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* ── Current Eclipse Diagram ── */}
                {(() => {
                  const now = new Date();
                  const twoWeeksBefore = (e: { date: string }) => {
                    const d = new Date(e.date + 'T12:00:00');
                    return new Date(d.getTime() - 14 * 86400000);
                  };
                  // Show the eclipse we're within 2 weeks of, or the next upcoming, or the most recent past
                  const activeForDiagram = allEclipsesSorted.find(e => {
                    const d = new Date(e.date + 'T12:00:00');
                    return now >= twoWeeksBefore(e) && now <= new Date(d.getTime() + 7 * 86400000);
                  }) || nextUpcomingEclipse || allEclipsesSorted[allEclipsesSorted.length - 1];

                  if (!activeForDiagram) return null;
                  const eclipseDate = new Date(activeForDiagram.date + 'T12:00:00');
                  const isToday = now.toDateString() === eclipseDate.toDateString();
                  const daysUntil = Math.ceil((eclipseDate.getTime() - now.getTime()) / 86400000);
                  const isActive = daysUntil >= -7 && daysUntil <= 14;

                  return (
                    <div className="mt-6 space-y-2">
                      {isToday && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/30 animate-pulse">
                          <span className="text-lg">⚡</span>
                          <p className="text-xs font-semibold text-primary">This eclipse is happening TODAY</p>
                        </div>
                      )}
                      {!isToday && isActive && daysUntil > 0 && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 border border-accent/30">
                          <span className="text-lg">📡</span>
                          <p className="text-xs font-medium text-accent-foreground">Next eclipse in {daysUntil} day{daysUntil !== 1 ? 's' : ''}</p>
                        </div>
                      )}
                      <EclipseMechanicsDiagram eclipse={activeForDiagram} />
                    </div>
                  );
                })()}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="nodes">
              <AccordionTrigger className="text-lg font-semibold">The Lunar Nodes & Eclipse Families</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  The <strong>North Node (☊)</strong> represents your soul's growth direction — where you're being pulled toward. The <strong>South Node (☋)</strong> represents past patterns, comfort zones, and what you're releasing.
                </p>
                <p>
                  Eclipses near the <strong>North Node</strong> tend to bring <em>new opportunities and growth experiences</em> — sometimes uncomfortable ones that push you forward. Eclipses near the <strong>South Node</strong> tend to bring <em>endings, releases, and karmic completions</em>.
                </p>
                <p>
                  The nodes move backwards through the zodiac, spending about <strong>18 months in each sign axis</strong>. This is why eclipse series last about 2 years in one pair of signs before shifting.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="types">
              <AccordionTrigger className="text-lg font-semibold">Types of Eclipses</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: 'Total Solar', icon: '🌑', desc: 'The Moon fully covers the Sun. The most powerful type — complete reset. Visible along a narrow path on Earth.' },
                    { name: 'Annular Solar', icon: '💍', desc: '"Ring of fire" — the Moon is too far to fully cover the Sun. Strong but slightly less intense than total. Still a major new beginning.' },
                    { name: 'Partial Solar', icon: '🌘', desc: 'Only part of the Sun is obscured. A gentler nudge rather than a dramatic reset. Themes emerge more slowly.' },
                    { name: 'Total Lunar', icon: '🌕', desc: 'The "Blood Moon" — Earth\'s shadow turns the Moon red. Full emotional revelation. The most potent lunar eclipse.' },
                    { name: 'Partial Lunar', icon: '🌗', desc: 'Part of the Moon enters Earth\'s shadow. Moderate emotional insight and release.' },
                    { name: 'Penumbral Lunar', icon: '🌖', desc: 'Moon passes through Earth\'s faint outer shadow. Subtlest type — quiet inner shifts that may not be obvious immediately.' },
                  ].map(t => (
                    <div key={t.name} className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-to-read">
              <AccordionTrigger className="text-lg font-semibold">How Eclipses Affect Your Chart</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-3">
                <p>
                  To understand how an eclipse affects <em>you</em>, look at <strong>which house</strong> the eclipse falls in your natal chart. That house's life themes become activated for the next 6 months.
                </p>
                <ul className="space-y-2 list-disc pl-4 text-sm">
                  <li><strong>Conjunction to natal planet (±3°):</strong> The most personal hit — that planet's themes are supercharged.</li>
                  <li><strong>Conjunct your Ascendant/Descendant:</strong> Major identity or relationship shifts.</li>
                  <li><strong>Conjunct your MC/IC:</strong> Career or home/family turning points.</li>
                  <li><strong>Near your natal nodes:</strong> Deeply karmic — a "nodal return" eclipse can redirect your life path.</li>
                </ul>
                <p className="text-sm italic">
                  Traditional advice: <strong>Don't manifest during eclipses.</strong> Unlike regular New Moons, eclipses are about receiving what fate has in store, not projecting your will. Observe, accept, and adapt.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="saros">
              <AccordionTrigger className="text-lg font-semibold">Eclipse Cycles: Saros, Metonic & More</AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-6">
                {/* Saros */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">🔄</span> The Saros Cycle — 18 years, 11 days
                  </h4>
                  <p>
                    The Saros cycle is an <strong>astronomical pattern</strong>, not an astrological invention. It's based on a remarkable coincidence of three lunar cycles syncing up almost perfectly:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>The Moon's orbit around Earth — <strong>29.5 days</strong> (synodic month)</li>
                    <li>The Moon's orbital wobble — <strong>27.2 days</strong> (anomalistic month)</li>
                    <li>The Moon crossing the ecliptic — <strong>27.2 days</strong> (draconic month)</li>
                  </ul>
                  <p>
                    Every <strong>18 years, 11 days, and 8 hours</strong>, these three cycles realign. When they do, the Sun, Earth, and Moon return to nearly identical positions — which means an eclipse that happened 18 years ago will <strong>repeat at roughly the same degree</strong>, with the same character (total, partial, annular).
                  </p>
                  <p>
                    That's the Saros. It's a <strong>family of eclipses</strong>, each one 18 years apart, sharing the same astronomical DNA.
                  </p>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground">📖 Example: March 3, 2026 Eclipse</p>
                    <p className="text-sm">
                      The March 2026 eclipse at 12° Virgo belongs to a Saros family that had an eclipse around <strong>March 2008</strong> — at a similar degree, similar type. Astrologers use this as a <em>"thematic echo"</em> — not that the same events repeat, but that <strong>similar themes surface for resolution or continuation</strong>.
                    </p>
                    <p className="text-sm italic">
                      Try it: Journal back to March 2008. What was happening in your health, daily routines, or work life? It often rhymes with what this eclipse is activating now.
                    </p>
                  </div>
                </div>

                {/* Metonic */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">📅</span> The Metonic Cycle — 19 years
                  </h4>
                  <p>
                    Every 19 years, an eclipse returns to almost the <strong>exact same calendar date and same zodiac degree</strong>. This is slightly different from the Saros — it's more <em>calendar-precise</em> rather than astronomically precise.
                  </p>
                  <p>
                    You may have heard of this cycle in Jewish or lunar calendar traditions. Astrologers use it the same way as the Saros: <strong>check what was happening 19 years ago</strong> for thematic echoes.
                  </p>
                </div>

                {/* Nodal */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">☊</span> The Nodal Cycle — 18.6 years
                  </h4>
                  <p>
                    This is the cycle astrologers use most. The <strong>Lunar Nodes</strong> — the intersection points of the Moon's orbit with the Sun's path — take <strong>18.6 years</strong> to travel all the way around the zodiac.
                  </p>
                  <p>
                    Every ~18–19 years, the Nodes return to the same signs, and the eclipse themes you lived through then <strong>echo again</strong>. This is why the Virgo-Pisces axis was also active in 2006–2007 — the Nodes were in the same signs, producing eclipses with similar themes.
                  </p>
                  <p className="text-sm italic">
                    The Nodal cycle, the Saros, and the Metonic all hover around 18–19 years. They're not identical cycles, but they overlap enough that looking back ~18 years from any eclipse tends to reveal meaningful connections.
                  </p>
                </div>

                {/* Semester */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">⏳</span> The Semester Cycle — 6 months
                  </h4>
                  <p>
                    This is the most <strong>practical cycle for everyday astrology</strong>. Eclipses always come in pairs or triplets, spaced roughly 6 months apart, along the same nodal axis.
                  </p>
                  <p>
                    That's why you get a Virgo eclipse in September and a Pisces eclipse in March — they're part of the <strong>same 6-month pulse</strong>. The same life themes activate, then 6 months later you get another hit on the same story from the opposite angle.
                  </p>
                  <p className="text-sm italic">
                    Think of each 6-month pair as one conversation: the first eclipse asks the question, the second eclipse reveals the answer.
                  </p>
                </div>

                {/* Inex */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <span className="text-xl">🌐</span> The Inex Cycle — 29 years
                  </h4>
                  <p>
                    Less talked about but astronomically significant. Every <strong>29 years</strong>, an eclipse of the same type (total, annular, etc.) occurs in the same general family. The Inex and Saros together form a larger <strong>600-year grid</strong> of eclipse families that astronomers use to map every eclipse in history.
                  </p>
                  <p className="text-sm">
                    For personal use, the 29-year cycle mirrors the Saturn Return — check what was happening around ages 29, 58, or 87 for deep structural echoes in your eclipse story.
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground text-sm mb-3">Quick Reference: Eclipse Cycles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Semester</span><span className="font-medium">6 months — same axis, opposite angle</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Saros</span><span className="font-medium">18 yrs 11 days — same degree & type</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Nodal</span><span className="font-medium">18.6 yrs — same signs activated</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Metonic</span><span className="font-medium">19 yrs — same calendar date</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Inex</span><span className="font-medium">29 yrs — same type family</span></div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* ── Teaching Mode Toggle + Chart Selector + Interpretation Layer ── */}
      <div ref={teacherRef}>
        {activeEclipse && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <Button
              variant={teachingMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTeachingMode(!teachingMode)}
              className="gap-2 shrink-0"
            >
              📖 {teachingMode ? 'Teaching Mode On' : 'Teaching Mode'}
            </Button>
            {allCharts.length > 0 && (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <ChartSelector
                  userNatalChart={userNatalChart}
                  savedCharts={savedCharts}
                  selectedChartId={selectedChartId || ''}
                  onSelect={setSelectedChartId}
                  label="Personalize for"
                  className="flex-1 min-w-[160px]"
                />
                {!selectedChart && (
                  <p className="text-xs text-primary shrink-0">← Select a chart to personalize</p>
                )}
              </div>
            )}
            {teachingMode && selectedChart && (
              <p className="text-xs text-muted-foreground shrink-0">Personalized for {selectedChart.name}</p>
            )}
          </div>
        )}

        {teachingMode && activeEclipse ? (
          <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
            <CardContent className="pt-6">
              <EclipseTeachingMode
                eclipse={activeEclipse}
                userNatalChart={selectedChart}
              />
            </CardContent>
          </Card>
        ) : (
          <EclipseInterpretationLayer
            selectedEclipse={activeEclipse}
            userNatalChart={selectedChart}
            onBackToTimeline={scrollToTimeline}
            currentList={currentList}
            onSelectEclipse={handleSelectEclipse}
          />
        )}
      </div>

      {/* ── Eclipse Timeline by Series ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-2xl">📅</span> Eclipse Timeline by Series
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Eclipse series overlap — multiple axes are active simultaneously. Select a series to see its eclipses and how they land in your chart.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {allCharts.length > 0 && (
            <div className="mb-4">
              <ChartSelector
                userNatalChart={userNatalChart}
                savedCharts={savedCharts}
                selectedChartId={selectedChart?.name || ''}
                onSelect={setSelectedChartId}
              />
            </div>
          )}

          <div ref={timelineRef}>
            <Tabs value={activeSeriesTab} onValueChange={setActiveSeriesTab}>
              <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full h-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm py-2 flex flex-col gap-0.5">
                  <span>📅</span>
                  <span className="hidden sm:inline">All Eclipses</span>
                  <Badge variant="default" className="text-[10px] mt-0.5">Timeline</Badge>
                </TabsTrigger>
                {Object.entries(ECLIPSE_SERIES).map(([key, s]) => (
                  <TabsTrigger key={key} value={key} className="text-xs sm:text-sm py-2 flex flex-col gap-0.5">
                    <span>{s.glyphs}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                    <Badge variant={s.status === 'active' ? 'default' : s.status === 'upcoming' ? 'secondary' : 'outline'} className="text-[10px] mt-0.5">
                      {s.status === 'ending' ? 'Ending' : s.status === 'active' ? 'Active Now' : s.status === 'upcoming' ? 'Starting' : 'Next Up'}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-4 space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <h3 className="font-semibold text-lg">📅 Complete Eclipse Timeline (2023–2029)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Every eclipse in chronological order across all series. Solar eclipses happen at New Moons, lunar eclipses at Full Moons.</p>
                </div>
                <div className="space-y-3">
                  {allEclipsesSorted.map((e, idx) => renderEclipseCard(e, idx))}
                </div>
              </TabsContent>

              {Object.entries(ECLIPSE_SERIES).map(([key, series]) => (
                <TabsContent key={key} value={key} className="mt-4 space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-2">
                    <h3 className="font-semibold text-lg">{series.glyphs} {series.label} ({series.period})</h3>
                    <p className="text-sm text-muted-foreground">{series.description}</p>
                    {series.bigPicture && (
                      <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Big Picture</p>
                        <p className="text-sm text-muted-foreground italic">{series.bigPicture}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {(key === activeSeriesTab ? (personalizedEvents || series.events) : series.events).map((eclipse, idx) => {
                      const e = eclipse as EclipseEvent & { house?: number | null; oppositeHouse?: number | null };
                      return renderEclipseCard(e, idx, series.events);
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {!selectedChart?.houseCusps && allCharts.length > 0 && (
            <p className="mt-4 text-sm text-muted-foreground italic text-center">
              ℹ️ Enter birth data with a birth time to see which houses these eclipses activate in your chart.
            </p>
          )}
          {allCharts.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground italic text-center">
              ℹ️ Add a birth chart to see personalized eclipse house activations.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
