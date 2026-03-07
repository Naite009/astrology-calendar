import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

/** 
 * Moon Faces & Phase Teachings — educational content for Foundations.
 * Covers degree conversions, the 8 phases, decanate faces, and how to read phases.
 * Sources: Raven Kaldera, Steven Forrest, traditional lunar lore.
 */

interface PhaseTeaching {
  phase: string;
  emoji: string;
  degreeRange: string;
  keyword: string;
  element: string;
  lightHalf: boolean;
  teaching: string;
  bodyPart: string;
  ritualTiming: string;
}

const PHASE_TEACHINGS: PhaseTeaching[] = [
  {
    phase: 'New Moon', emoji: '🌑', degreeRange: '0° – 45°', keyword: 'Emergence',
    element: 'Fire of Fire', lightHalf: true,
    teaching: 'The seed moment. Sun and Moon are conjunct — identity and emotion are fused. This is the phase of pure instinct, where you act before you think. People born here carry "beginner\'s mind" as a lifelong gift. The New Moon person starts cycles others will finish.',
    bodyPart: 'Head, eyes, the spark of the nervous system',
    ritualTiming: 'Best for setting intentions, planting seeds, starting new projects. Worst for harvesting results or making final decisions.',
  },
  {
    phase: 'Waxing Crescent', emoji: '🌒', degreeRange: '45° – 90°', keyword: 'Struggle',
    element: 'Earth of Fire', lightHalf: true,
    teaching: 'The push through resistance. The new impulse meets gravity — the pull of the old cycle. People born here are fighters, survivors, bootstrappers. They know how to grow through adversity because their soul chose to incarnate at the moment when the seed must crack its shell.',
    bodyPart: 'Throat, jaw, the muscles that clench under pressure',
    ritualTiming: 'Best for taking the first action step. Worst for giving up or pulling back.',
  },
  {
    phase: 'First Quarter', emoji: '🌓', degreeRange: '90° – 135°', keyword: 'Crisis in Action',
    element: 'Air of Fire', lightHalf: true,
    teaching: 'The square — productive tension. Sun and Moon are 90° apart, creating a structural stress that demands you BUILD something. This is the phase of the doer, the builder, the one who thrives when stakes are high. Crisis is not a problem for Quarter Moon people — it\'s fuel.',
    bodyPart: 'Chest, lungs, cardiovascular system — the engine that powers action',
    ritualTiming: 'Best for making hard decisions, taking stands, committing. Worst for passive reflection.',
  },
  {
    phase: 'Waxing Gibbous', emoji: '🌔', degreeRange: '135° – 180°', keyword: 'Refinement',
    element: 'Water of Fire', lightHalf: true,
    teaching: 'The editor, not the author. The light is almost full — you can see what\'s nearly complete and know exactly what adjustment is needed. People born here are analysts, perfectionists, devotees of excellence. Their gift is discernment; their trap is never feeling "ready."',
    bodyPart: 'Digestive system, hands — the instruments of precision and refinement',
    ritualTiming: 'Best for editing, improving, preparing for launch. Worst for starting from scratch.',
  },
  {
    phase: 'Full Moon', emoji: '🌕', degreeRange: '180° – 225°', keyword: 'Illumination',
    element: 'Fire of Water', lightHalf: false,
    teaching: 'Maximum light. Sun and Moon oppose — identity and emotion face each other across the sky. Everything is visible, nothing can hide. Full Moon people are mirrors: they understand themselves through relationship. Their magnetism is undeniable, but their challenge is learning to exist without an audience.',
    bodyPart: 'Heart, the eyes that see and are seen — the organs of connection',
    ritualTiming: 'Best for culmination, celebration, releasing what\'s complete. Worst for new beginnings.',
  },
  {
    phase: 'Waning Gibbous', emoji: '🌖', degreeRange: '225° – 270°', keyword: 'Dissemination',
    element: 'Earth of Water', lightHalf: false,
    teaching: 'The teacher phase. The fruit is ripe and must be shared. People born here carry knowledge that wants to overflow into others. They are mentors, writers, evangelists of meaning. Their challenge: believing they\'ve "figured it out" when the universe has more to teach.',
    bodyPart: 'Vocal cords, hips — the body parts that broadcast and carry the message forward',
    ritualTiming: 'Best for teaching, sharing, publishing, mentoring. Worst for withholding or hoarding knowledge.',
  },
  {
    phase: 'Last Quarter', emoji: '🌗', degreeRange: '270° – 315°', keyword: 'Crisis of Consciousness',
    element: 'Air of Water', lightHalf: false,
    teaching: 'The second square — but this one releases instead of builds. Sun and Moon are 90° apart in the waning direction, creating tension around what must END. Last Quarter people are revolutionaries, questioners, deconstructors. They see what\'s dying before anyone else does.',
    bodyPart: 'Knees, bones, joints — the structures that bend or break under pressure',
    ritualTiming: 'Best for letting go, clearing, ending what no longer serves. Worst for clinging to the past.',
  },
  {
    phase: 'Balsamic', emoji: '🌘', degreeRange: '315° – 360°', keyword: 'Completion',
    element: 'Water of Water', lightHalf: false,
    teaching: 'The dark before the dawn. The thinnest crescent — almost invisible. Balsamic people carry ancient wisdom and karma ready for release. They are mystics, prophets, surrenderers. Their soul is completing something that may span lifetimes. The gift is faith in what cannot be seen.',
    bodyPart: 'Feet, lymphatic system, the pineal gland — the body\'s connection to the invisible',
    ritualTiming: 'Best for meditation, dream work, surrender, composting old patterns. Worst for launching anything new.',
  },
];

const DEGREE_CONVERSION_TABLE = [
  { signSep: 'Same sign', degrees: '0°–30°', note: 'Conjunction zone → New Moon or late Balsamic' },
  { signSep: '1 sign apart', degrees: '30°–60°', note: 'New Moon to Crescent boundary' },
  { signSep: '2 signs apart', degrees: '60°–90°', note: 'Crescent phase, approaching First Quarter' },
  { signSep: '3 signs apart', degrees: '90°–120°', note: 'First Quarter → square energy' },
  { signSep: '4 signs apart', degrees: '120°–150°', note: 'Late First Quarter, entering Gibbous' },
  { signSep: '5 signs apart', degrees: '150°–180°', note: 'Gibbous → quincunx energy, approaching Full' },
  { signSep: '6 signs apart (opposite)', degrees: '180°', note: 'Full Moon → opposition, maximum illumination' },
  { signSep: '7 signs apart', degrees: '210°–240°', note: 'Disseminating (Waning Gibbous)' },
  { signSep: '8 signs apart', degrees: '240°–270°', note: 'Late Disseminating, approaching Last Quarter' },
  { signSep: '9 signs apart', degrees: '270°–300°', note: 'Last Quarter → waning square' },
  { signSep: '10 signs apart', degrees: '300°–330°', note: 'Late Last Quarter, entering Balsamic' },
  { signSep: '11 signs apart', degrees: '330°–360°', note: 'Balsamic → dark moon, approaching New' },
];

const LUNAR_FACES = [
  { face: 'Light Half (Waxing)', phases: 'New → Crescent → First Quarter → Gibbous', 
    meaning: 'The waxing half is about BUILDING. Energy increases, visibility grows, projects gain momentum. People born in the light half are initiators, builders, strivers — they push outward into the world.' },
  { face: 'Dark Half (Waning)', phases: 'Full → Disseminating → Last Quarter → Balsamic', 
    meaning: 'The waning half is about DISTRIBUTING and RELEASING. Energy decreases, internalization deepens, wisdom consolidates. People born in the dark half are teachers, healers, revolutionaries, mystics — they pull meaning inward from experience.' },
  { face: 'Angular Phases (Cardinal)', phases: 'New Moon (0°) + Full Moon (180°)', 
    meaning: 'The conjunction and opposition — the two most potent moments. New Moon people fuse identity and emotion; Full Moon people polarize them. Both carry intense, concentrated energy.' },
  { face: 'Succedent Phases (Fixed)', phases: 'Crescent (45°) + Disseminating (225°)', 
    meaning: 'The phases of persistence and stabilization. Crescent builds momentum through struggle; Disseminating sustains meaning through teaching. Both are tenacious and committed.' },
  { face: 'Cadent Phases (Mutable)', phases: 'Quarter (90°/270°) + Gibbous (135°) + Balsamic (315°)', 
    meaning: 'The phases of crisis and transition. Quarter phases create structural tension; Gibbous refines; Balsamic dissolves. All three navigate change and transformation.' },
];

export function MoonFacesTeachings() {
  const [expandedSection, setExpandedSection] = useState<string | null>('phases');

  const sections = [
    { key: 'phases', label: '☽ The 8 Phases — Deep Teaching', icon: '🌙' },
    { key: 'degrees', label: '☉–☽ Degree Conversion Table', icon: '📐' },
    { key: 'faces', label: '☽ Lunar Faces — Light & Dark', icon: '🌓' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1">☽ Moon Phase Teachings</h3>
        <p className="text-sm text-muted-foreground">
          How to read the 8 lunar phases, convert sign separations to degrees, and understand the ancient system of lunar "faces."
        </p>
      </div>

      {sections.map(section => (
        <Collapsible key={section.key} open={expandedSection === section.key} onOpenChange={open => setExpandedSection(open ? section.key : null)}>
          <CollapsibleTrigger className="w-full">
            <Card className={`cursor-pointer transition-all hover:border-primary/30 ${expandedSection === section.key ? 'border-primary/40' : ''}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{section.icon}</span>
                  <span className="text-sm font-medium text-foreground">{section.label}</span>
                </div>
                {expandedSection === section.key ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </CardContent>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 p-4 rounded-lg border border-border bg-card">
              {section.key === 'phases' && (
                <div className="space-y-4">
                  {PHASE_TEACHINGS.map(pt => (
                    <div key={pt.phase} className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xl">{pt.emoji}</span>
                        <h4 className="font-serif font-semibold text-foreground">{pt.phase}</h4>
                        <Badge variant="outline" className="text-[10px]">{pt.degreeRange}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{pt.keyword}</Badge>
                        <Badge variant={pt.lightHalf ? 'default' : 'outline'} className="text-[9px]">
                          {pt.lightHalf ? '☀ Light Half' : '☾ Dark Half'}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{pt.teaching}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-secondary/50">
                          <span className="text-muted-foreground">Body:</span> <span className="text-foreground">{pt.bodyPart}</span>
                        </div>
                        <div className="p-2 rounded bg-accent/30">
                          <span className="text-muted-foreground">Ritual Timing:</span> <span className="text-foreground">{pt.ritualTiming}</span>
                        </div>
                      </div>
                      {pt.phase !== 'Balsamic' && <Separator className="mt-2" />}
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground italic mt-2">— Raven Kaldera & Steven Forrest</p>
                </div>
              )}

              {section.key === 'degrees' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-3">
                    Quick reference: count how many signs the Moon is ahead of the Sun (counter-clockwise through the zodiac) 
                    to estimate the Sun–Moon separation and lunar phase.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Sign Separation</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Approx. Degrees</th>
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Phase / Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEGREE_CONVERSION_TABLE.map((row, i) => (
                          <tr key={i} className="border-b border-border/50 last:border-0">
                            <td className="py-2 px-3 font-mono text-xs text-foreground">{row.signSep}</td>
                            <td className="py-2 px-3 font-mono text-xs text-foreground">{row.degrees}</td>
                            <td className="py-2 px-3 text-xs text-muted-foreground">{row.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-muted-foreground italic">
                    Note: These are approximations using sign midpoints (15°). Your exact degree within each sign matters — 
                    the app calculates your precise separation to the decimal.
                  </p>
                </div>
              )}

              {section.key === 'faces' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    The lunar cycle divides into structural "faces" — ancient groupings that reveal whether your Moon 
                    energy is building, sustaining, or releasing.
                  </p>
                  {LUNAR_FACES.map((face, i) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border space-y-1">
                      <h4 className="text-sm font-semibold text-foreground">{face.face}</h4>
                      <p className="text-[10px] text-muted-foreground">{face.phases}</p>
                      <p className="text-sm text-foreground leading-relaxed">{face.meaning}</p>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground italic">— Traditional lunar lore, synthesized from Kaldera & Forrest</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
