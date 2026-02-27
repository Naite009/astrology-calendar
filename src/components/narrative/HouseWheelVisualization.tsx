import { useMemo } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';

const QUADRANT_COLORS = [
  { fill: 'hsl(var(--primary) / 0.08)', stroke: 'hsl(var(--primary) / 0.3)', label: 'Q1: I AM BECOMING' },
  { fill: 'hsl(45 80% 55% / 0.08)', stroke: 'hsl(45 80% 55% / 0.3)', label: 'Q2: I AM EXPRESSING' },
  { fill: 'hsl(200 80% 55% / 0.08)', stroke: 'hsl(200 80% 55% / 0.3)', label: 'Q3: I AM RELATING' },
  { fill: 'hsl(270 60% 55% / 0.08)', stroke: 'hsl(270 60% 55% / 0.3)', label: 'Q4: I AM ACHIEVING' },
];

const HOUSE_LABELS = [
  { num: 1, name: 'Self', type: 'Angular' },
  { num: 2, name: 'Resources', type: 'Succedent' },
  { num: 3, name: 'Communication', type: 'Cadent' },
  { num: 4, name: 'Home', type: 'Angular' },
  { num: 5, name: 'Creativity', type: 'Succedent' },
  { num: 6, name: 'Service', type: 'Cadent' },
  { num: 7, name: 'Partnership', type: 'Angular' },
  { num: 8, name: 'Transformation', type: 'Succedent' },
  { num: 9, name: 'Philosophy', type: 'Cadent' },
  { num: 10, name: 'Career', type: 'Angular' },
  { num: 11, name: 'Community', type: 'Succedent' },
  { num: 12, name: 'Transcendence', type: 'Cadent' },
];

const ANGLE_LABELS = [
  { abbr: 'AC', full: 'Ascendant', house: 1 },
  { abbr: 'IC', full: 'Imum Coeli', house: 4 },
  { abbr: 'DC', full: 'Descendant', house: 7 },
  { abbr: 'MC', full: 'Midheaven', house: 10 },
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Chiron: '⚷', NorthNode: '☊', Lilith: '⚸',
};

const ZODIAC_ORDER = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const toLon = (sign: string, deg: number, min: number = 0) => ZODIAC_ORDER.indexOf(sign) * 30 + deg + min / 60;

interface Props {
  chart: NatalChart | null;
}

export function HouseWheelVisualization({ chart }: Props) {
  const cx = 250, cy = 250;
  const outerR = 220, innerR = 120, angleR = 240;

  // Calculate planet positions in houses
  const planetsByHouse = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (let i = 1; i <= 12; i++) map[i] = [];
    if (!chart?.planets || !chart?.houseCusps) return map;

    const cusps: number[] = [];
    for (let i = 1; i <= 12; i++) {
      const c = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
      if (c?.sign) cusps.push(toLon(c.sign, c.degree, c.minutes ?? 0));
    }
    if (cusps.length < 12) return map;

    const planetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
    for (const pn of planetNames) {
      const p = chart.planets[pn as keyof typeof chart.planets];
      if (!p?.sign) continue;
      const lon = toLon(p.sign, p.degree, p.minutes ?? 0);
      for (let i = 0; i < 12; i++) {
        const cur = cusps[i], next = cusps[(i + 1) % 12];
        const inH = next < cur ? (lon >= cur || lon < next) : (lon >= cur && lon < next);
        if (inH) { map[i + 1].push(pn); break; }
      }
    }
    return map;
  }, [chart]);

  // Each house occupies 30° of visual space (equal houses visually)
  // AC at 9 o'clock (180°), houses go counter-clockwise
  const houseAngle = (houseNum: number) => {
    // House 1 starts at AC (180°), goes counter-clockwise
    return 180 - (houseNum - 1) * 30;
  };

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const polarToXY = (angleDeg: number, r: number) => ({
    x: cx + r * Math.cos(toRad(angleDeg)),
    y: cy - r * Math.sin(toRad(angleDeg)),
  });

  // Build house wedge paths
  const houseWedges = HOUSE_LABELS.map((h, i) => {
    const startAngle = houseAngle(h.num);
    const endAngle = houseAngle(h.num + 1);
    const quadrantIdx = Math.floor(i / 3);
    const color = QUADRANT_COLORS[quadrantIdx];

    // Arc path from inner to outer
    const p1 = polarToXY(startAngle, innerR);
    const p2 = polarToXY(startAngle, outerR);
    const p3 = polarToXY(endAngle, outerR);
    const p4 = polarToXY(endAngle, innerR);

    // Determine sweep direction (we go from startAngle to endAngle, counter-clockwise means endAngle < startAngle)
    const largeArc = 0;
    const sweep = 1; // clockwise in SVG (because Y is inverted)

    const path = [
      `M ${p1.x} ${p1.y}`,
      `L ${p2.x} ${p2.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} ${sweep} ${p3.x} ${p3.y}`,
      `L ${p4.x} ${p4.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${p1.x} ${p1.y}`,
      'Z',
    ].join(' ');

    // Label position - midpoint of the wedge
    const midAngle = (startAngle + endAngle) / 2;
    const labelR = (innerR + outerR) / 2;
    const labelPos = polarToXY(midAngle, labelR);
    const numPos = polarToXY(midAngle, labelR + 8);
    const namePos = polarToXY(midAngle, labelR - 10);

    // Planets in this house
    const planets = planetsByHouse[h.num] || [];
    const planetPos = polarToXY(midAngle, innerR - 20);

    return { h, path, color, labelPos, numPos, namePos, planets, planetPos, midAngle, quadrantIdx };
  });

  // Angle markers (AC, IC, DC, MC)
  const angleMarkers = ANGLE_LABELS.map(a => {
    const angle = houseAngle(a.house);
    const innerPt = polarToXY(angle, innerR - 5);
    const outerPt = polarToXY(angle, outerR + 5);
    const labelPt = polarToXY(angle, angleR);
    return { ...a, innerPt, outerPt, labelPt, angle };
  });

  // Hemisphere dividers
  const horizonLeft = polarToXY(180, outerR + 5);
  const horizonRight = polarToXY(0, outerR + 5);
  const meridianTop = polarToXY(90, outerR + 5);
  const meridianBottom = polarToXY(270, outerR + 5);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2"><span>🔭</span> Interactive House Wheel</h3>
      <p className="text-xs text-muted-foreground">
        Visual map of the 12 houses showing quadrants, hemispheres, and angles. 
        {chart ? ' Your planets are shown inside the wheel.' : ' Add a chart to see your planets placed.'}
      </p>

      <div className="flex justify-center">
        <svg viewBox="0 0 500 500" className="w-full max-w-[500px]" role="img" aria-label="Astrological house wheel">
          {/* Quadrant background fills */}
          {houseWedges.map(w => (
            <path
              key={`wedge-${w.h.num}`}
              d={w.path}
              fill={w.color.fill}
              stroke={w.color.stroke}
              strokeWidth={0.5}
              className="transition-opacity hover:opacity-80"
            />
          ))}

          {/* House divider lines */}
          {HOUSE_LABELS.map(h => {
            const angle = houseAngle(h.num);
            const p1 = polarToXY(angle, innerR);
            const p2 = polarToXY(angle, outerR);
            return (
              <line
                key={`div-${h.num}`}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="hsl(var(--border))"
                strokeWidth={h.type === 'Angular' ? 2 : 0.8}
              />
            );
          })}

          {/* Inner and outer circles */}
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="hsl(var(--border))" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={innerR} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth={1} />

          {/* Hemisphere labels */}
          <text x={cx} y={28} textAnchor="middle" className="fill-muted-foreground text-[9px] font-medium">
            SOUTHERN (Public)
          </text>
          <text x={cx} y={490} textAnchor="middle" className="fill-muted-foreground text-[9px] font-medium">
            NORTHERN (Private)
          </text>
          <text x={12} y={cy} textAnchor="start" className="fill-muted-foreground text-[9px] font-medium" dominantBaseline="middle">
            EAST (Self)
          </text>
          <text x={488} y={cy} textAnchor="end" className="fill-muted-foreground text-[9px] font-medium" dominantBaseline="middle">
            WEST (Other)
          </text>

          {/* House numbers and names */}
          {houseWedges.map(w => (
            <g key={`label-${w.h.num}`}>
              <text
                x={w.numPos.x} y={w.numPos.y}
                textAnchor="middle" dominantBaseline="middle"
                className="fill-foreground text-[11px] font-bold"
              >
                {w.h.num}
              </text>
              <text
                x={w.namePos.x} y={w.namePos.y}
                textAnchor="middle" dominantBaseline="middle"
                className="fill-muted-foreground text-[7px]"
              >
                {w.h.name}
              </text>
            </g>
          ))}

          {/* Angle markers (AC, IC, DC, MC) */}
          {angleMarkers.map(a => (
            <g key={a.abbr}>
              <line
                x1={a.innerPt.x} y1={a.innerPt.y}
                x2={a.outerPt.x} y2={a.outerPt.y}
                stroke="hsl(var(--primary))" strokeWidth={2.5}
              />
              <text
                x={a.labelPt.x} y={a.labelPt.y}
                textAnchor="middle" dominantBaseline="middle"
                className="fill-primary text-[12px] font-bold"
              >
                {a.abbr}
              </text>
            </g>
          ))}

          {/* Quadrant labels in center */}
          {QUADRANT_COLORS.map((q, i) => {
            // Position quadrant labels in the inner circle quadrants
            const angles = [225, 315, 45, 135]; // Q1 bottom-left, Q2 bottom-right, Q3 top-right, Q4 top-left
            const pos = polarToXY(angles[i], 65);
            const labelLines = q.label.split(': ');
            return (
              <g key={`q-${i}`}>
                <text
                  x={pos.x} y={pos.y - 6}
                  textAnchor="middle" dominantBaseline="middle"
                  className="fill-muted-foreground text-[8px] font-semibold"
                >
                  {labelLines[0]}
                </text>
                <text
                  x={pos.x} y={pos.y + 6}
                  textAnchor="middle" dominantBaseline="middle"
                  className="fill-muted-foreground text-[6px]"
                >
                  {labelLines[1]}
                </text>
              </g>
            );
          })}

          {/* Planet glyphs inside the wheel */}
          {chart && houseWedges.map(w => {
            if (w.planets.length === 0) return null;
            return w.planets.map((p, pi) => {
              // Spread planets within the house wedge
              const spread = w.planets.length > 1 ? (pi - (w.planets.length - 1) / 2) * 8 : 0;
              const offsetAngle = w.midAngle + spread;
              const pos = polarToXY(offsetAngle, innerR - 22 - (pi % 2) * 14);
              return (
                <text
                  key={`planet-${w.h.num}-${p}`}
                  x={pos.x} y={pos.y}
                  textAnchor="middle" dominantBaseline="middle"
                  className="fill-primary text-[12px]"
                  aria-label={p}
                >
                  {PLANET_SYMBOLS[p] || p[0]}
                </text>
              );
            });
          })}
        </svg>
      </div>

      {/* Angularity Legend */}
      <div className="flex flex-wrap gap-3 justify-center text-[10px]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary/60" /> Angular (1,4,7,10) — ACTION
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500/60" /> Succedent (2,5,8,11) — STABILITY
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-500/60" /> Cadent (3,6,9,12) — ADAPTATION
        </span>
      </div>
    </div>
  );
}