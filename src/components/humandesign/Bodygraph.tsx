import { useState } from 'react';
import { HumanDesignChart, HDCenterName } from '@/types/humanDesign';
import { getGateByNumber } from '@/data/humanDesignGates';
import { HUMAN_DESIGN_CHANNELS } from '@/data/humanDesignChannels';
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

// Expanded viewBox (600x800) for better spacing
const CENTER_POSITIONS: CenterPositions = {
  Head: { x: 300, y: 60, shape: 'triangle' },
  Ajna: { x: 300, y: 150, shape: 'triangle-down' },
  Throat: { x: 300, y: 260, shape: 'square' },
  G: { x: 300, y: 400, shape: 'diamond' },
  Heart: { x: 420, y: 355, shape: 'triangle-small' },
  Sacral: { x: 300, y: 545, shape: 'square' },
  SolarPlexus: { x: 420, y: 490, shape: 'triangle-right' },
  Spleen: { x: 180, y: 490, shape: 'triangle-left' },
  Root: { x: 300, y: 700, shape: 'square' },
};

// Gate positions - spread out to avoid overlapping
const GATE_POSITIONS: Record<number, { x: number; y: number }> = {
  // Head Center gates (top row)
  64: { x: 255, y: 28 },
  61: { x: 300, y: 28 },
  63: { x: 345, y: 28 },
  
  // Ajna Center gates
  47: { x: 255, y: 182 },
  24: { x: 280, y: 182 },
  4: { x: 300, y: 118 },
  17: { x: 345, y: 118 },
  43: { x: 300, y: 182 },
  11: { x: 325, y: 182 },
  
  // Throat Center gates - arranged in arc
  62: { x: 220, y: 235 },
  23: { x: 248, y: 235 },
  56: { x: 352, y: 235 },
  35: { x: 380, y: 255 },
  12: { x: 352, y: 288 },
  45: { x: 328, y: 288 },
  33: { x: 268, y: 225 },
  8: { x: 268, y: 288 },
  31: { x: 220, y: 265 },
  16: { x: 198, y: 255 },
  20: { x: 318, y: 225 },
  
  // G Center gates
  1: { x: 268, y: 365 },
  13: { x: 285, y: 355 },
  25: { x: 335, y: 365 },
  46: { x: 318, y: 438 },
  2: { x: 282, y: 438 },
  15: { x: 300, y: 455 },
  10: { x: 335, y: 388 },
  7: { x: 265, y: 388 },
  
  // Heart/Ego Center gates
  51: { x: 388, y: 325 },
  21: { x: 410, y: 330 },
  40: { x: 455, y: 365 },
  26: { x: 448, y: 345 },
  
  // Sacral Center gates
  5: { x: 258, y: 515 },
  14: { x: 272, y: 508 },
  29: { x: 288, y: 500 },
  59: { x: 345, y: 515 },
  9: { x: 265, y: 575 },
  3: { x: 300, y: 585 },
  42: { x: 335, y: 575 },
  27: { x: 240, y: 540 },
  34: { x: 338, y: 530 },
  
  // Solar Plexus gates
  6: { x: 378, y: 508 },
  37: { x: 458, y: 470 },
  22: { x: 448, y: 448 },
  36: { x: 420, y: 530 },
  30: { x: 438, y: 545 },
  55: { x: 395, y: 458 },
  49: { x: 388, y: 525 },
  
  // Spleen Center gates
  48: { x: 148, y: 455 },
  57: { x: 160, y: 475 },
  44: { x: 188, y: 455 },
  50: { x: 200, y: 525 },
  32: { x: 172, y: 538 },
  28: { x: 145, y: 515 },
  18: { x: 138, y: 490 },
  
  // Root Center gates
  53: { x: 245, y: 665 },
  60: { x: 265, y: 738 },
  52: { x: 295, y: 738 },
  19: { x: 355, y: 665 },
  39: { x: 372, y: 688 },
  41: { x: 388, y: 712 },
  38: { x: 218, y: 688 },
  54: { x: 340, y: 738 },
  58: { x: 245, y: 712 },
};

// Channel paths connecting centers
const CHANNEL_PATHS: Record<string, { gates: [number, number]; path: string }> = {
  // Head to Ajna
  '64-47': { gates: [64, 47], path: 'M265,50 L265,145' },
  '61-24': { gates: [61, 24], path: 'M300,50 L300,145' },
  '63-4': { gates: [63, 4], path: 'M335,50 L335,145' },
  
  // Ajna to Throat
  '17-62': { gates: [17, 62], path: 'M330,165 L245,240' },
  '43-23': { gates: [43, 23], path: 'M300,185 L268,240' },
  '11-56': { gates: [11, 56], path: 'M325,185 L345,240' },
  
  // Throat to G
  '31-7': { gates: [31, 7], path: 'M245,280 L275,375' },
  '8-1': { gates: [8, 1], path: 'M280,290 L280,370' },
  '33-13': { gates: [33, 13], path: 'M280,250 L295,370' },
  '45-21': { gates: [45, 21], path: 'M345,290 L400,340' },
  '20-10': { gates: [20, 10], path: 'M325,250 L330,375' },
  '20-34': { gates: [20, 34], path: 'M315,280 L330,520' },
  '20-57': { gates: [20, 57], path: 'M275,280 L170,475' },
  '12-22': { gates: [12, 22], path: 'M360,290 L435,445' },
  '35-36': { gates: [35, 36], path: 'M380,275 L415,520' },
  '16-48': { gates: [16, 48], path: 'M220,270 L160,460' },
  
  // G to Sacral
  '2-14': { gates: [2, 14], path: 'M295,430 L280,510' },
  '15-5': { gates: [15, 5], path: 'M295,455 L268,515' },
  '46-29': { gates: [46, 29], path: 'M315,435 L300,505' },
  
  // G to Heart
  '25-51': { gates: [25, 51], path: 'M340,380 L395,340' },
  
  // G to Spleen
  '10-57': { gates: [10, 57], path: 'M275,400 L175,480' },
  
  // Heart to Throat
  '21-45': { gates: [21, 45], path: 'M410,340 L345,290' },
  
  // Heart to Solar Plexus
  '40-37': { gates: [40, 37], path: 'M450,370 L455,470' },
  
  // Heart to Spleen
  '26-44': { gates: [26, 44], path: 'M415,355 L200,465' },
  
  // Sacral to Root
  '9-52': { gates: [9, 52], path: 'M280,580 L300,670' },
  '3-60': { gates: [3, 60], path: 'M300,590 L280,665' },
  '42-53': { gates: [42, 53], path: 'M330,580 L260,665' },
  
  // Sacral to Solar Plexus
  '59-6': { gates: [59, 6], path: 'M355,520 L385,510' },
  
  // Sacral to Spleen
  '27-50': { gates: [27, 50], path: 'M250,545 L210,530' },
  '34-57': { gates: [34, 57], path: 'M315,540 L175,485' },
  
  // Solar Plexus to Root
  '30-41': { gates: [30, 41], path: 'M435,555 L390,700' },
  '49-19': { gates: [49, 19], path: 'M395,530 L365,670' },
  '55-39': { gates: [55, 39], path: 'M410,475 L380,680' },
  
  // Spleen to Root
  '28-38': { gates: [28, 38], path: 'M160,525 L220,680' },
  '32-54': { gates: [32, 54], path: 'M190,545 L325,720' },
  '18-58': { gates: [18, 58], path: 'M155,505 L245,700' },
  
  // Additional paths
  '54-32': { gates: [54, 32], path: 'M340,720 L190,545' },
  '58-18': { gates: [58, 18], path: 'M255,705 L155,505' },
  '38-28': { gates: [38, 28], path: 'M230,690 L155,520' },
  '53-42': { gates: [53, 42], path: 'M255,670 L330,580' },
  '60-3': { gates: [60, 3], path: 'M275,730 L300,595' },
  '52-9': { gates: [52, 9], path: 'M300,730 L280,585' },
  '19-49': { gates: [19, 49], path: 'M365,675 L395,535' },
  '39-55': { gates: [39, 55], path: 'M375,695 L405,480' },
  '41-30': { gates: [41, 30], path: 'M390,715 L440,555' },
};

// Center colors
const CENTER_COLORS = {
  defined: {
    Head: '#F5A623',
    Ajna: '#50C878',
    Throat: '#B8860B',
    G: '#FFD700',
    Heart: '#DC143C',
    Sacral: '#FF6B35',
    SolarPlexus: '#DAA520',
    Spleen: '#8B4513',
    Root: '#A0522D',
  },
  undefined: '#ffffff',
};

export const Bodygraph = ({ chart }: BodygraphProps) => {
  const [selectedGate, setSelectedGate] = useState<number | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<[number, number] | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<HDCenterName | null>(null);

  // Get all activated gates
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

  const isChannelDefined = (gates: [number, number]) => {
    return activatedGates.has(gates[0]) && activatedGates.has(gates[1]);
  };

  const getGateColor = (gateNum: number) => {
    const isConscious = consciousGates.has(gateNum);
    const isUnconscious = unconsciousGates.has(gateNum);
    if (isConscious && isUnconscious) return 'harmonic';
    if (isConscious) return 'conscious';
    if (isUnconscious) return 'unconscious';
    return 'inactive';
  };

  const renderCenter = (name: HDCenterName) => {
    const pos = CENTER_POSITIONS[name];
    if (!pos) return null;

    const isDefined = chart.definedCenters.includes(name);
    const fillColor = isDefined 
      ? CENTER_COLORS.defined[name as keyof typeof CENTER_COLORS.defined] || '#F5A623'
      : CENTER_COLORS.undefined;
    const strokeColor = isDefined ? 'rgba(0,0,0,0.3)' : 'hsl(var(--muted-foreground))';
    const strokeWidth = isDefined ? 2 : 1.5;

    const handleClick = () => setSelectedCenter(name);

    // Increased sizes for better visibility
    switch (pos.shape) {
      case 'triangle':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x},${pos.y - 35} ${pos.x - 42},${pos.y + 28} ${pos.x + 42},${pos.y + 28}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'triangle-down':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x - 42},${pos.y - 20} ${pos.x + 42},${pos.y - 20} ${pos.x},${pos.y + 35}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'diamond':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x},${pos.y - 42} ${pos.x + 48},${pos.y} ${pos.x},${pos.y + 42} ${pos.x - 48},${pos.y}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'square':
        return (
          <TooltipTrigger asChild>
            <rect
              x={pos.x - 42}
              y={pos.y - 35}
              width="84"
              height="70"
              rx="4"
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'triangle-small':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x},${pos.y - 22} ${pos.x - 28},${pos.y + 22} ${pos.x + 28},${pos.y + 22}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'triangle-right':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x - 28},${pos.y - 35} ${pos.x + 35},${pos.y} ${pos.x - 28},${pos.y + 35}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md"
              onClick={handleClick}
            />
          </TooltipTrigger>
        );
      case 'triangle-left':
        return (
          <TooltipTrigger asChild>
            <polygon
              points={`${pos.x + 28},${pos.y - 35} ${pos.x - 35},${pos.y} ${pos.x + 28},${pos.y + 35}`}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer hover:opacity-80 transition-opacity drop-shadow-md"
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
      <div className="relative w-full max-w-lg mx-auto">
        <svg viewBox="0 0 600 800" className="w-full h-auto" style={{ minHeight: '500px' }}>
          {/* Subtle background gradient */}
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--card))" />
              <stop offset="100%" stopColor="hsl(var(--muted))" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="600" height="800" fill="url(#bgGradient)" rx="8" />

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
                    stroke={defined ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.25)'}
                    strokeWidth={defined ? 4 : 2}
                    strokeDasharray={defined ? 'none' : '6,4'}
                    strokeLinecap="round"
                    className="cursor-pointer hover:stroke-primary/70 transition-colors"
                    onClick={() => setSelectedChannel(channel.gates)}
                    filter={defined ? 'url(#glow)' : undefined}
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

          {/* Gate numbers with backgrounds for readability */}
          {Object.entries(GATE_POSITIONS).map(([gateStr, pos]) => {
            const gateNum = parseInt(gateStr);
            const colorType = getGateColor(gateNum);
            const isActive = colorType !== 'inactive';
            
            let textColor = 'hsl(var(--muted-foreground))';
            let bgColor = 'transparent';
            let fontWeight = '400';
            let fontSize = '11';
            
            if (colorType === 'conscious') {
              textColor = '#ffffff';
              bgColor = 'hsl(var(--foreground))';
              fontWeight = '600';
              fontSize = '12';
            } else if (colorType === 'unconscious') {
              textColor = '#ffffff';
              bgColor = '#dc2626';
              fontWeight = '600';
              fontSize = '12';
            } else if (colorType === 'harmonic') {
              textColor = '#ffffff';
              bgColor = 'hsl(var(--primary))';
              fontWeight = '700';
              fontSize = '12';
            }

            return (
              <Tooltip key={gateNum}>
                <TooltipTrigger asChild>
                  <g
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedGate(gateNum)}
                  >
                    {isActive && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="12"
                        fill={bgColor}
                        className="drop-shadow-sm"
                      />
                    )}
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={fontSize}
                      fill={textColor}
                      fontWeight={fontWeight}
                      fontFamily="system-ui, -apple-system, sans-serif"
                    >
                      {gateNum}
                    </text>
                  </g>
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
          <g transform="translate(20, 760)">
            <rect x="0" y="-10" width="560" height="35" rx="6" fill="hsl(var(--card))" fillOpacity="0.9" />
            
            <circle cx="30" cy="7" r="8" fill="hsl(var(--foreground))" />
            <text x="45" y="12" fontSize="11" fill="hsl(var(--foreground))" fontWeight="500">Conscious</text>
            
            <circle cx="145" cy="7" r="8" fill="#dc2626" />
            <text x="160" y="12" fontSize="11" fill="hsl(var(--foreground))" fontWeight="500">Unconscious</text>
            
            <circle cx="275" cy="7" r="8" fill="hsl(var(--primary))" />
            <text x="290" y="12" fontSize="11" fill="hsl(var(--foreground))" fontWeight="500">Harmonic</text>
            
            <rect x="385" y="-1" width="16" height="16" rx="2" fill="#FFD700" stroke="rgba(0,0,0,0.2)" />
            <text x="408" y="12" fontSize="11" fill="hsl(var(--foreground))" fontWeight="500">Defined</text>
            
            <rect x="485" y="-1" width="16" height="16" rx="2" fill="#ffffff" stroke="hsl(var(--muted-foreground))" />
            <text x="508" y="12" fontSize="11" fill="hsl(var(--foreground))" fontWeight="500">Open</text>
          </g>
        </svg>

        {/* Modals - conditionally rendered */}
        {selectedGate !== null && (
          <GateDetailModal
            gateNumber={selectedGate}
            chart={chart}
            onClose={() => setSelectedGate(null)}
          />
        )}
        {selectedChannel !== null && (
          <ChannelDetailModal
            gates={selectedChannel}
            chart={chart}
            onClose={() => setSelectedChannel(null)}
          />
        )}
        {selectedCenter !== null && (
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
