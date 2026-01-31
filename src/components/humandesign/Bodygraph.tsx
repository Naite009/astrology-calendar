import { useState } from 'react';
import { HumanDesignChart, HDCenterName } from '@/types/humanDesign';
import { getGateByNumber } from '@/data/humanDesignGates';
import { getChannelByGates, HUMAN_DESIGN_CHANNELS } from '@/data/humanDesignChannels';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GateDetailModal } from './GateDetailModal';
import { ChannelDetailModal } from './ChannelDetailModal';
import { CenterDetailModal } from './CenterDetailModal';

interface BodygraphProps {
  chart: HumanDesignChart;
}

type CenterPositions = Record<HDCenterName, { x: number; y: number; shape: string }>;

// Center positions for the bodygraph (relative to 400x600 viewBox)
const CENTER_POSITIONS: CenterPositions = {
  Head: { x: 200, y: 50, shape: 'triangle' },
  Ajna: { x: 200, y: 115, shape: 'triangle-down' },
  Throat: { x: 200, y: 190, shape: 'square' },
  G: { x: 200, y: 290, shape: 'diamond' },
  Heart: { x: 280, y: 260, shape: 'triangle-small' },
  Sacral: { x: 200, y: 400, shape: 'square' },
  SolarPlexus: { x: 280, y: 360, shape: 'triangle-right' },
  Spleen: { x: 120, y: 360, shape: 'triangle-left' },
  Root: { x: 200, y: 510, shape: 'square' },
};

// Gate positions on the bodygraph - arranged around their centers
const GATE_POSITIONS: Record<number, { x: number; y: number; center: string }> = {
  // Head Center gates
  64: { x: 175, y: 25, center: 'Head' },
  61: { x: 200, y: 25, center: 'Head' },
  63: { x: 225, y: 25, center: 'Head' },
  
  // Ajna Center gates
  47: { x: 175, y: 140, center: 'Ajna' },
  24: { x: 188, y: 140, center: 'Ajna' },
  4: { x: 200, y: 90, center: 'Ajna' },
  17: { x: 225, y: 90, center: 'Ajna' },
  43: { x: 200, y: 140, center: 'Ajna' },
  11: { x: 213, y: 140, center: 'Ajna' },
  
  // Throat Center gates
  62: { x: 160, y: 175, center: 'Throat' },
  23: { x: 175, y: 175, center: 'Throat' },
  56: { x: 240, y: 175, center: 'Throat' },
  35: { x: 255, y: 192, center: 'Throat' },
  12: { x: 240, y: 210, center: 'Throat' },
  45: { x: 225, y: 210, center: 'Throat' },
  33: { x: 185, y: 165, center: 'Throat' },
  8: { x: 190, y: 210, center: 'Throat' },
  31: { x: 160, y: 195, center: 'Throat' },
  16: { x: 145, y: 192, center: 'Throat' },
  20: { x: 205, y: 165, center: 'Throat' },
  
  // G Center gates
  1: { x: 183, y: 265, center: 'G' },
  13: { x: 195, y: 255, center: 'G' },
  25: { x: 220, y: 265, center: 'G' },
  46: { x: 210, y: 315, center: 'G' },
  2: { x: 190, y: 315, center: 'G' },
  15: { x: 200, y: 330, center: 'G' },
  10: { x: 218, y: 280, center: 'G' },
  7: { x: 183, y: 280, center: 'G' },
  
  // Heart/Ego Center gates
  51: { x: 260, y: 240, center: 'Heart' },
  21: { x: 275, y: 245, center: 'Heart' },
  40: { x: 300, y: 270, center: 'Heart' },
  26: { x: 295, y: 255, center: 'Heart' },
  
  // Sacral Center gates
  5: { x: 175, y: 380, center: 'Sacral' },
  14: { x: 185, y: 375, center: 'Sacral' },
  29: { x: 195, y: 370, center: 'Sacral' },
  59: { x: 230, y: 375, center: 'Sacral' },
  9: { x: 180, y: 420, center: 'Sacral' },
  3: { x: 200, y: 430, center: 'Sacral' },
  42: { x: 215, y: 420, center: 'Sacral' },
  27: { x: 165, y: 395, center: 'Sacral' },
  34: { x: 220, y: 385, center: 'Sacral' },
  
  // Solar Plexus gates
  6: { x: 255, y: 375, center: 'Solar Plexus' },
  37: { x: 305, y: 350, center: 'Solar Plexus' },
  22: { x: 295, y: 340, center: 'Solar Plexus' },
  36: { x: 280, y: 390, center: 'Solar Plexus' },
  30: { x: 290, y: 400, center: 'Solar Plexus' },
  55: { x: 265, y: 345, center: 'Solar Plexus' },
  49: { x: 260, y: 385, center: 'Solar Plexus' },
  
  // Spleen Center gates
  48: { x: 100, y: 340, center: 'Spleen' },
  57: { x: 110, y: 350, center: 'Spleen' },
  44: { x: 130, y: 340, center: 'Spleen' },
  50: { x: 140, y: 380, center: 'Spleen' },
  32: { x: 120, y: 390, center: 'Spleen' },
  28: { x: 100, y: 380, center: 'Spleen' },
  18: { x: 95, y: 365, center: 'Spleen' },
  
  // Root Center gates
  53: { x: 165, y: 490, center: 'Root' },
  60: { x: 180, y: 540, center: 'Root' },
  52: { x: 195, y: 540, center: 'Root' },
  19: { x: 235, y: 490, center: 'Root' },
  39: { x: 245, y: 505, center: 'Root' },
  41: { x: 255, y: 520, center: 'Root' },
  38: { x: 150, y: 505, center: 'Root' },
  54: { x: 225, y: 540, center: 'Root' },
  58: { x: 170, y: 520, center: 'Root' },
};

// Channel line paths (simplified - connecting centers)
const CHANNEL_PATHS: Record<string, { gates: [number, number]; path: string }> = {
  // Head to Ajna
  '64-47': { gates: [64, 47], path: 'M175,50 L175,115' },
  '61-24': { gates: [61, 24], path: 'M200,50 L200,115' },
  '63-4': { gates: [63, 4], path: 'M225,50 L225,115' },
  
  // Ajna to Throat
  '17-62': { gates: [17, 62], path: 'M215,130 L170,175' },
  '43-23': { gates: [43, 23], path: 'M200,140 L185,175' },
  '11-56': { gates: [11, 56], path: 'M220,140 L235,175' },
  
  // Throat to G
  '31-7': { gates: [31, 7], path: 'M175,210 L190,265' },
  '8-1': { gates: [8, 1], path: 'M200,210 L200,265' },
  '33-13': { gates: [33, 13], path: 'M195,210 L205,265' },
  '45-21': { gates: [45, 21], path: 'M230,210 L270,250' },
  '20-10': { gates: [20, 10], path: 'M210,210 L215,265' },
  '20-34': { gates: [20, 34], path: 'M205,210 L210,380' },
  '20-57': { gates: [20, 57], path: 'M185,210 L120,350' },
  '12-22': { gates: [12, 22], path: 'M245,210 L285,340' },
  '35-36': { gates: [35, 36], path: 'M255,210 L280,350' },
  '16-48': { gates: [16, 48], path: 'M155,200 L110,340' },
  
  // G to Sacral
  '2-14': { gates: [2, 14], path: 'M200,315 L195,375' },
  '15-5': { gates: [15, 5], path: 'M200,330 L185,380' },
  '46-29': { gates: [46, 29], path: 'M210,315 L205,375' },
  
  // G to Heart
  '25-51': { gates: [25, 51], path: 'M225,280 L265,255' },
  
  // G to Spleen
  '10-57': { gates: [10, 57], path: 'M185,290 L120,350' },
  
  // Heart to Throat
  '21-45': { gates: [21, 45], path: 'M275,255 L230,210' },
  
  // Heart to Solar Plexus
  '40-37': { gates: [40, 37], path: 'M300,270 L305,350' },
  
  // Heart to Spleen
  '26-44': { gates: [26, 44], path: 'M280,260 L140,345' },
  
  // Sacral to Root
  '9-52': { gates: [9, 52], path: 'M190,430 L200,495' },
  '3-60': { gates: [3, 60], path: 'M200,435 L190,490' },
  '42-53': { gates: [42, 53], path: 'M210,430 L180,490' },
  
  // Sacral to Solar Plexus
  '59-6': { gates: [59, 6], path: 'M235,385 L260,375' },
  
  // Sacral to Spleen
  '27-50': { gates: [27, 50], path: 'M170,395 L145,380' },
  '34-57': { gates: [34, 57], path: 'M200,385 L120,355' },
  
  // Solar Plexus to Root
  '30-41': { gates: [30, 41], path: 'M285,395 L260,495' },
  '49-19': { gates: [49, 19], path: 'M265,385 L240,495' },
  '55-39': { gates: [55, 39], path: 'M275,365 L255,495' },
  
  // Spleen to Root
  '28-38': { gates: [28, 38], path: 'M110,385 L145,495' },
  '32-54': { gates: [32, 54], path: 'M130,395 L210,495' },
  '18-58': { gates: [18, 58], path: 'M105,380 L165,495' },
  
  // Root connections
  '54-32': { gates: [54, 32], path: 'M225,520 L130,390' },
  '58-18': { gates: [58, 18], path: 'M175,515 L105,375' },
  '38-28': { gates: [38, 28], path: 'M155,505 L105,380' },
  '53-42': { gates: [53, 42], path: 'M175,495 L210,425' },
  '60-3': { gates: [60, 3], path: 'M185,530 L200,435' },
  '52-9': { gates: [52, 9], path: 'M200,530 L190,425' },
  '19-49': { gates: [19, 49], path: 'M240,500 L265,385' },
  '39-55': { gates: [39, 55], path: 'M250,505 L270,360' },
  '41-30': { gates: [41, 30], path: 'M260,515 L290,395' },
};

// Defined center colors
const CENTER_COLORS = {
  defined: {
    Head: '#F5A623',
    Ajna: '#7ED321',
    Throat: '#B8860B',
    G: '#F5D02F',
    Heart: '#E74C3C',
    Sacral: '#E67E22',
    'Solar Plexus': '#B8860B',
    Spleen: '#B8860B',
    Root: '#B8860B',
  },
  undefined: '#ffffff',
};

export const Bodygraph = ({ chart }: BodygraphProps) => {
  const [selectedGate, setSelectedGate] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<[number, number] | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<HDCenterName | null>(null);

  // Get all activated gates from chart
  const activatedGates = new Set<number>();
  const consciousGates = new Set<number>();
  const unconsciousGates = new Set<number>();

  chart.personalityActivations.forEach(a => {
    activatedGates.add(a.gate);
    consciousGates.add(a.gate);
  });
  chart.designActivations.forEach(a => {
    activatedGates.add(a.gate);
    unconsciousGates.add(a.gate);
  });

  // Check if a channel is defined (both gates activated)
  const isChannelDefined = (gates: [number, number]) => {
    return activatedGates.has(gates[0]) && activatedGates.has(gates[1]);
  };

  // Get gate color based on activation
  const getGateColor = (gateNum: number) => {
    const isConscious = consciousGates.has(gateNum);
    const isUnconscious = unconsciousGates.has(gateNum);
    if (isConscious && isUnconscious) return 'harmonic'; // Both
    if (isConscious) return 'conscious'; // Black
    if (isUnconscious) return 'unconscious'; // Red
    return 'inactive';
  };

  // Render center shape
  const renderCenter = (name: HDCenterName) => {
    const pos = CENTER_POSITIONS[name];
    if (!pos) return null;

    const isDefined = chart.definedCenters.includes(name);
    const fillColor = isDefined 
      ? CENTER_COLORS.defined[name as keyof typeof CENTER_COLORS.defined] || '#F5A623'
      : CENTER_COLORS.undefined;
    const strokeColor = isDefined ? 'none' : 'hsl(var(--muted-foreground))';

    const handleClick = () => setSelectedCenter(name);

    switch (pos.shape) {
      case 'triangle':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x},${pos.y - 25} ${pos.x - 30},${pos.y + 20} ${pos.x + 30},${pos.y + 20}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'triangle-down':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x - 30},${pos.y - 15} ${pos.x + 30},${pos.y - 15} ${pos.x},${pos.y + 25}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'diamond':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x},${pos.y - 30} ${pos.x + 35},${pos.y} ${pos.x},${pos.y + 30} ${pos.x - 35},${pos.y}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'square':
        return (
          <TooltipTrigger asChild>
            <rect
              x={pos.x - 30}
              y={pos.y - 25}
              width="60"
              height="50"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'triangle-small':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x},${pos.y - 15} ${pos.x - 20},${pos.y + 15} ${pos.x + 20},${pos.y + 15}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'triangle-right':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x - 20},${pos.y - 25} ${pos.x + 25},${pos.y} ${pos.x - 20},${pos.y + 25}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'triangle-left':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x + 20},${pos.y - 25} ${pos.x - 25},${pos.y} ${pos.x + 20},${pos.y + 25}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth="1"
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative w-full max-w-md mx-auto">
        <svg viewBox="0 0 400 580" className="w-full h-auto">
          {/* Background */}
          <rect width="400" height="580" fill="transparent" />

          {/* Channel lines */}
          {HUMAN_DESIGN_CHANNELS.map((channel) => {
            const key = `${channel.gates[0]}-${channel.gates[1]}`;
            const reverseKey = `${channel.gates[1]}-${channel.gates[0]}`;
            const pathData = CHANNEL_PATHS[key] || CHANNEL_PATHS[reverseKey];
            
            if (!pathData) return null;

            const defined = isChannelDefined(channel.gates);
            
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <path
                    d={pathData.path}
                    fill="none"
                    stroke={defined ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)'}
                    strokeWidth={defined ? 3 : 1}
                    strokeDasharray={defined ? 'none' : '4,4'}
                    className="cursor-pointer hover:stroke-primary/70 transition-colors"
                    onClick={() => setSelectedChannel(channel.gates)}
                  />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="font-medium">{channel.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Gates {channel.gates[0]}-{channel.gates[1]} • {defined ? 'Defined' : 'Undefined'}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Centers */}
          {(Object.keys(CENTER_POSITIONS) as HDCenterName[]).map((centerName) => (
            <Tooltip key={centerName}>
              {renderCenter(centerName)}
              <TooltipContent>
                <p className="font-medium">{centerName === 'SolarPlexus' ? 'Solar Plexus' : centerName}</p>
                <p className="text-xs text-muted-foreground">
                  {chart.definedCenters.includes(centerName) ? 'Defined' : 'Undefined'}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}

          {/* Gate numbers */}
          {Object.entries(GATE_POSITIONS).map(([gateStr, pos]) => {
            const gateNum = parseInt(gateStr);
            const colorType = getGateColor(gateNum);
            const isActive = colorType !== 'inactive';
            
            let textColor = 'hsl(var(--muted-foreground) / 0.4)';
            let fontWeight = 'normal';
            
            if (colorType === 'conscious') {
              textColor = 'hsl(var(--foreground))';
              fontWeight = 'bold';
            } else if (colorType === 'unconscious') {
              textColor = '#dc2626';
              fontWeight = 'bold';
            } else if (colorType === 'harmonic') {
              textColor = 'hsl(var(--primary))';
              fontWeight = 'bold';
            }

            return (
              <Tooltip key={gateNum}>
                <TooltipTrigger asChild>
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill={textColor}
                    fontWeight={fontWeight}
                    className="cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => setSelectedGate(gateNum)}
                  >
                    {gateNum}
                  </text>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">Gate {gateNum}</p>
                  <p className="text-xs text-muted-foreground">
                    {getGateByNumber(gateNum)?.name || ''} • {isActive ? (colorType === 'conscious' ? 'Conscious' : colorType === 'unconscious' ? 'Unconscious' : 'Harmonic') : 'Inactive'}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Legend */}
          <g transform="translate(10, 550)">
            <circle cx="10" cy="0" r="5" fill="hsl(var(--foreground))" />
            <text x="20" y="4" fontSize="8" fill="hsl(var(--muted-foreground))">Conscious</text>
            
            <circle cx="80" cy="0" r="5" fill="#dc2626" />
            <text x="90" y="4" fontSize="8" fill="hsl(var(--muted-foreground))">Unconscious</text>
            
            <circle cx="165" cy="0" r="5" fill="hsl(var(--primary))" />
            <text x="175" y="4" fontSize="8" fill="hsl(var(--muted-foreground))">Harmonic</text>
          </g>
        </svg>

        {/* Modals */}
        {selectedGate && (
          <GateDetailModal
            gateNumber={selectedGate}
            chart={chart}
            onClose={() => setSelectedGate(null)}
          />
        )}

        {selectedChannel && (
          <ChannelDetailModal
            gates={selectedChannel}
            chart={chart}
            onClose={() => setSelectedChannel(null)}
          />
        )}

        {selectedCenter && (
          <CenterDetailModal
            centerName={selectedCenter}
            chart={chart}
            onClose={() => setSelectedCenter(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
};
