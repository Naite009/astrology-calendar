import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Heart, Medal } from 'lucide-react';

interface Props {
  hdChart: any;
}

function computeHdEducation(hd: any) {
  const triggers: string[] = [];
  const traits: string[] = [];

  triggers.push(`Type: ${hd.type}`);
  if (hd.type === 'Projector') traits.push('learns best through deep study and mentorship');
  if (hd.type === 'Generator' || hd.type === 'Manifesting Generator') traits.push('learns best through hands-on doing and responding');
  if (hd.type === 'Manifestor') traits.push('learns best through self-directed exploration');
  if (hd.type === 'Reflector') traits.push('learns best in varied environments with diverse people');

  const profile = hd.profile || '';
  if (profile.startsWith('1')) { triggers.push(`Profile ${profile}`); traits.push('needs to research deeply before feeling secure in knowledge'); }
  if (profile.startsWith('3')) { triggers.push(`Profile ${profile}`); traits.push('learns through trial and error — experiential learning'); }
  if (profile.startsWith('5')) { triggers.push(`Profile ${profile}`); traits.push('others project expertise onto you — becomes a natural teacher'); }

  const definedCenters = hd.definedCenters || [];
  if (definedCenters.includes('Ajna')) { triggers.push('Ajna Defined'); traits.push('consistent way of processing information'); }
  if (!definedCenters.includes('Head')) { triggers.push('Head Open'); traits.push('inspired by many questions — avoid pressure to know everything'); }

  return { summary: traits.slice(0, 3).join('; ') + '.', triggers };
}

function computeHdAthletic(hd: any) {
  const triggers: string[] = [];
  const traits: string[] = [];

  const definedCenters = hd.definedCenters || [];
  triggers.push(`Type: ${hd.type}`);

  if (definedCenters.includes('Sacral')) { triggers.push('Sacral Defined'); traits.push('sustainable life-force energy for endurance activities'); }
  if (definedCenters.includes('Root')) { triggers.push('Root Defined'); traits.push('consistent drive and adrenaline; thrives under pressure'); }
  if (!definedCenters.includes('Sacral')) { traits.push('works in bursts — needs rest cycles between exertion'); }

  if (hd.type === 'Manifesting Generator') traits.push('multi-sport athlete; thrives with variety and speed');
  if (hd.type === 'Generator') traits.push('marathon energy; builds mastery through repetition');
  if (hd.type === 'Projector') traits.push('efficient movement; excels at technique over brute force');

  return { summary: traits.slice(0, 3).join('; ') + '.', triggers };
}

function computeHdCareer(hd: any) {
  const triggers: string[] = [];
  const traits: string[] = [];

  triggers.push(`Type: ${hd.type}`);
  if (hd.type === 'Generator') traits.push('mastery-oriented; satisfaction comes from work you love');
  if (hd.type === 'Manifesting Generator') traits.push('multi-passionate career path; efficiency expert');
  if (hd.type === 'Projector') traits.push('guide and advisor; most effective working fewer hours with deep focus');
  if (hd.type === 'Manifestor') traits.push('initiator and founder; needs autonomy in work');
  if (hd.type === 'Reflector') traits.push('barometer of organizational health; thrives in aligned environments');

  const definedCenters = hd.definedCenters || [];
  const channels = hd.definedChannels || [];

  // Check for channels to Throat (expression/manifestation)
  const throatChannels = channels.filter((ch: string) => {
    const gates = ch.split('-').map(Number);
    const throatGates = [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16];
    return gates.some(g => throatGates.includes(g));
  });
  if (throatChannels.length > 0) { triggers.push(`${throatChannels.length} channel(s) to Throat`); traits.push('natural ability to communicate and manifest in the world'); }

  if (definedCenters.includes('Heart')) { triggers.push('Heart/Will Defined'); traits.push('willpower to follow through on commitments; natural leader'); }

  return { summary: traits.slice(0, 3).join('; ') + '.', triggers };
}

function computeHdRomance(hd: any) {
  const triggers: string[] = [];
  const traits: string[] = [];

  const definedCenters = hd.definedCenters || [];
  triggers.push(`Type: ${hd.type}`);

  if (definedCenters.includes('SolarPlexus')) {
    triggers.push('Solar Plexus Defined');
    traits.push('emotional wave in relationships — needs time to gain clarity before committing');
  } else {
    triggers.push('Solar Plexus Open');
    traits.push('absorbs partner\'s emotions; may confuse others\' feelings for own');
  }

  if (definedCenters.includes('Sacral')) {
    triggers.push('Sacral Defined');
    traits.push('strong life-force and sexual energy; attraction is visceral');
  }

  const profile = hd.profile || '';
  if (profile.includes('/4')) { triggers.push(`Profile ${profile}`); traits.push('friendships become romantic; network is key to finding love'); }
  if (profile.includes('/6')) { triggers.push(`Profile ${profile}`); traits.push('three phases in love — experimenting, withdrawing, then becoming a role model'); }
  if (profile.includes('2/')) { triggers.push(`Profile ${profile}`); traits.push('needs alone time in relationships; partner must respect natural hermit tendency'); }

  return { summary: traits.slice(0, 3).join('; ') + '.', triggers };
}

export function HDLifeStyles({ hdChart }: Props) {
  const education = computeHdEducation(hdChart);
  const athletic = computeHdAthletic(hdChart);
  const career = computeHdCareer(hdChart);
  const romance = computeHdRomance(hdChart);

  const styles = [
    { key: 'education', icon: GraduationCap, label: 'Learning Style', data: education },
    { key: 'athletic', icon: Medal, label: 'Physical Style', data: athletic },
    { key: 'career', icon: Briefcase, label: 'Career Style', data: career },
    { key: 'romance', icon: Heart, label: 'Romance Style', data: romance },
  ];

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Life Styles — Human Design
          <Badge variant="outline" className="ml-2 text-[10px]">HD</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {styles.map((style) => (
          <div key={style.key} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 mb-2">
              <style.icon className="h-5 w-5 text-primary" />
              <h4 className="font-medium text-sm">{style.label}</h4>
            </div>
            <p className="text-sm text-foreground mb-2">{style.data.summary}</p>
            <div className="flex flex-wrap gap-1">
              {style.data.triggers.map((trigger, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] font-normal">
                  {trigger}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
