import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface EclipseInfo {
  date: string;
  type: 'solar' | 'lunar';
  subtype: string;
  sign: string;
  degree: number;
  minutes: number;
  nodal: 'north' | 'south';
  title?: string;
}

interface Props {
  eclipse: EclipseInfo;
}

/**
 * Sign positions on the ecliptic (simplified 30° segments).
 * 0° Aries = 0, 0° Taurus = 30, etc.
 */
const SIGN_START: Record<string, number> = {
  Aries: 0, Taurus: 30, Gemini: 60, Cancer: 90,
  Leo: 120, Virgo: 150, Libra: 180, Scorpio: 210,
  Sagittarius: 240, Capricorn: 270, Aquarius: 300, Pisces: 330,
};

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const SIGNS_ORDER = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

function oppositeSign(sign: string): string {
  const idx = SIGNS_ORDER.indexOf(sign);
  return SIGNS_ORDER[(idx + 6) % 12];
}

/**
 * Programmatic SVG showing the astronomical alignment for this eclipse.
 * - For a LUNAR eclipse: Earth sits between Sun and Moon, casting its shadow on the Moon.
 * - For a SOLAR eclipse: Moon sits between Sun and Earth, blocking the Sun's light.
 * - The Nodes are shown on the axis, explaining WHY this alignment creates an eclipse.
 */
export function EclipseMechanicsDiagram({ eclipse }: Props) {
  const isLunar = eclipse.type === 'lunar';
  const isSolar = eclipse.type === 'solar';

  // The sign the MOON is in = eclipse sign
  const moonSign = eclipse.sign;
  // For lunar: Sun is opposite. For solar: Sun is in same sign as Moon (New Moon).
  const sunSign = isLunar ? oppositeSign(moonSign) : moonSign;

  // South Node is in the sign where the eclipse is if nodal='south', otherwise opposite
  const southNodeSign = eclipse.nodal === 'south' ? moonSign : oppositeSign(moonSign);
  const northNodeSign = oppositeSign(southNodeSign);

  const dateObj = new Date(eclipse.date + 'T12:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Positions on SVG (horizontal layout)
  // For lunar eclipse: Sun (left) → Earth (center) → Moon (right), shadow goes right
  // For solar eclipse: Sun (left) → Moon (center) → Earth (right), Moon blocks Sun
  const cx = 300; // center
  const cy = 180;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>{isLunar ? '🌕' : '🌑'}</span>
          {eclipse.title || `${eclipse.subtype} ${eclipse.type} eclipse`}
        </h4>
        <Badge variant="secondary" className="text-xs">
          {dateStr} · {eclipse.degree}°{String(eclipse.minutes).padStart(2, '0')}' {SIGN_GLYPHS[moonSign]} {moonSign}
        </Badge>
      </div>

      {/* SVG Diagram */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <svg viewBox="0 0 600 360" className="w-full h-auto" role="img" aria-label={`Diagram of the ${dateStr} ${eclipse.type} eclipse`}>
          <defs>
            {/* Sun glow */}
            <radialGradient id="sunGlow">
              <stop offset="0%" stopColor="hsl(45, 100%, 60%)" />
              <stop offset="70%" stopColor="hsl(40, 100%, 50%)" />
              <stop offset="100%" stopColor="hsl(35, 90%, 40%)" />
            </radialGradient>
            {/* Earth */}
            <radialGradient id="earthGrad">
              <stop offset="0%" stopColor="hsl(210, 60%, 55%)" />
              <stop offset="100%" stopColor="hsl(150, 50%, 35%)" />
            </radialGradient>
            {/* Moon */}
            <radialGradient id="moonGrad">
              <stop offset="0%" stopColor="hsl(0, 0%, 85%)" />
              <stop offset="100%" stopColor="hsl(0, 0%, 60%)" />
            </radialGradient>
            {/* Shadow cone */}
            <linearGradient id="shadowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(0, 0%, 10%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(0, 0%, 10%)" stopOpacity="0.05" />
            </linearGradient>
            {/* Blood moon tint for total lunar */}
            <radialGradient id="bloodMoon">
              <stop offset="0%" stopColor="hsl(0, 70%, 45%)" />
              <stop offset="100%" stopColor="hsl(0, 60%, 30%)" />
            </radialGradient>
            {/* Moon color transition for lunar eclipse */}
            <radialGradient id="moonPreShadow">
              <stop offset="0%" stopColor="hsl(0, 0%, 90%)" />
              <stop offset="100%" stopColor="hsl(0, 0%, 70%)" />
            </radialGradient>
          </defs>

          {/* Starfield dots */}
          {[
            [45, 30], [120, 55], [530, 40], [480, 320], [90, 300], [350, 25],
            [560, 90], [40, 200], [550, 250], [200, 340], [420, 45], [260, 20],
          ].map(([sx, sy], i) => (
            <circle key={i} cx={sx} cy={sy} r={0.8} fill="hsl(0, 0%, 50%)" opacity={0.4 + (i % 3) * 0.2} />
          ))}

          {/* Background: dark space */}
          <rect width="600" height="360" fill="hsl(230, 25%, 8%)" rx="12" />

          {/* Ecliptic line */}
          <line x1="30" y1={cy} x2="570" y2={cy} stroke="hsl(220, 20%, 25%)" strokeWidth="1" strokeDasharray="6 4" />

          {/* Node axis line */}
          <line x1="30" y1={cy} x2="570" y2={cy} stroke="hsl(280, 40%, 40%)" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.6" />

          {isLunar ? (
            /* ═══ LUNAR ECLIPSE LAYOUT ═══ */
            /* Sun (left) → Earth (center) → Moon (right) */
            <>
              {/* Shadow cone from Earth to Moon — fades in as Moon arrives */}
              <polygon
                points={`${cx + 20},${cy - 22} ${cx + 175},${cy - 35} ${cx + 175},${cy + 35} ${cx + 20},${cy + 22}`}
                fill="url(#shadowGrad)"
                opacity="0"
              >
                <animate attributeName="opacity" values="0;0;0.6;0.6" keyTimes="0;0.4;0.7;1" dur="6s" fill="freeze" />
              </polygon>

              {/* Sun */}
              <circle cx={cx - 170} cy={cy} r={38} fill="url(#sunGlow)" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
                const rad = (angle * Math.PI) / 180;
                const x1 = (cx - 170) + Math.cos(rad) * 42;
                const y1 = cy + Math.sin(rad) * 42;
                const x2 = (cx - 170) + Math.cos(rad) * 52;
                const y2 = cy + Math.sin(rad) * 52;
                return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(45, 100%, 60%)" strokeWidth="2" opacity="0.7" />;
              })}
              <text x={cx - 170} y={cy + 4} textAnchor="middle" fill="hsl(30, 80%, 20%)" fontSize="13" fontWeight="700">☉</text>
              <text x={cx - 170} y={cy + 58} textAnchor="middle" fill="hsl(45, 80%, 70%)" fontSize="11" fontWeight="600">Sun</text>
              <text x={cx - 170} y={cy + 72} textAnchor="middle" fill="hsl(45, 60%, 55%)" fontSize="10">
                {SIGN_GLYPHS[sunSign]} {sunSign}
              </text>

              {/* Earth (center) */}
              <circle cx={cx} cy={cy} r={28} fill="url(#earthGrad)" />
              <text x={cx} y={cy + 4} textAnchor="middle" fill="hsl(0, 0%, 95%)" fontSize="14" fontWeight="700">🌍</text>
              <text x={cx} y={cy + 48} textAnchor="middle" fill="hsl(200, 50%, 70%)" fontSize="11" fontWeight="600">Earth</text>

              {/* ═══ ANIMATED MOON GROUP ═══ */}
              {/* Moon starts 80px to the right (off-axis) and slides left into the shadow */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="80,40;0,0"
                  dur="5s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.25 0.1 0.25 1"
                />

                {/* Moon body — color transitions from bright silver to blood red (total) or dimmed (partial) */}
                <circle cx={cx + 170} cy={cy} r={22} fill="url(#moonPreShadow)" strokeWidth="1.5" stroke="hsl(0, 0%, 50%)">
                  {eclipse.subtype === 'total' ? (
                    <animate attributeName="fill" values="url(#moonPreShadow);url(#moonPreShadow);url(#bloodMoon);url(#bloodMoon)" keyTimes="0;0.5;0.8;1" dur="6s" fill="freeze" />
                  ) : (
                    <animate attributeName="opacity" values="1;1;0.6;0.6" keyTimes="0;0.5;0.8;1" dur="6s" fill="freeze" />
                  )}
                  {eclipse.subtype === 'total' && (
                    <animate attributeName="stroke" values="hsl(0, 0%, 50%);hsl(0, 50%, 50%)" dur="6s" fill="freeze" />
                  )}
                </circle>

                {/* Blood Moon label — fades in */}
                {eclipse.subtype === 'total' && (
                  <text x={cx + 170} y={cy - 30} textAnchor="middle" fill="hsl(0, 70%, 60%)" fontSize="9" fontWeight="600" opacity="0">
                    🩸 Blood Moon
                    <animate attributeName="opacity" values="0;0;0;1" keyTimes="0;0.6;0.8;1" dur="6s" fill="freeze" />
                  </text>
                )}

                <text x={cx + 170} y={cy + 5} textAnchor="middle" fill="hsl(0, 0%, 80%)" fontSize="12" fontWeight="700">☽</text>
                <text x={cx + 170} y={cy + 48} textAnchor="middle" fill="hsl(0, 0%, 75%)" fontSize="11" fontWeight="600">Moon</text>
                <text x={cx + 170} y={cy + 62} textAnchor="middle" fill="hsl(0, 0%, 60%)" fontSize="10">
                  {SIGN_GLYPHS[moonSign]} {moonSign} {eclipse.degree}°{String(eclipse.minutes).padStart(2, '0')}'
                </text>
              </g>

              {/* Light rays from Sun — dim as shadow forms */}
              {[[-25, -20], [0, 0], [25, 20]].map(([dy1, dy2], i) => (
                <line key={i} x1={cx - 130} y1={cy + dy1} x2={cx - 20} y2={cy + dy2} stroke="hsl(45, 100%, 60%)" strokeWidth="1" opacity="0.3">
                  <animate attributeName="opacity" values="0.5;0.5;0.15;0.15" keyTimes="0;0.4;0.7;1" dur="6s" fill="freeze" />
                </line>
              ))}

              {/* Annotation — fades in after Moon arrives */}
              <text x={cx} y={cy - 55} textAnchor="middle" fill="hsl(220, 30%, 65%)" fontSize="10" fontStyle="italic" opacity="0">
                Earth's shadow falls on the Moon
                <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.6;0.85;1" dur="6s" fill="freeze" />
              </text>
            </>
          ) : (
            /* ═══ SOLAR ECLIPSE LAYOUT ═══ */
            /* Sun (left) → Moon (center, blocking) → Earth (right) */
            <>
              {/* Sun — rays dim as Moon crosses */}
              <circle cx={cx - 170} cy={cy} r={38} fill="url(#sunGlow)" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
                const rad = (angle * Math.PI) / 180;
                const x1 = (cx - 170) + Math.cos(rad) * 42;
                const y1 = cy + Math.sin(rad) * 42;
                const x2 = (cx - 170) + Math.cos(rad) * 52;
                const y2 = cy + Math.sin(rad) * 52;
                return (
                  <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(45, 100%, 60%)" strokeWidth="2" opacity="0.7">
                    <animate attributeName="opacity" values="0.7;0.7;0.2;0.2" keyTimes="0;0.4;0.75;1" dur="5s" fill="freeze" />
                  </line>
                );
              })}
              <text x={cx - 170} y={cy + 4} textAnchor="middle" fill="hsl(30, 80%, 20%)" fontSize="13" fontWeight="700">☉</text>
              <text x={cx - 170} y={cy + 58} textAnchor="middle" fill="hsl(45, 80%, 70%)" fontSize="11" fontWeight="600">Sun</text>
              <text x={cx - 170} y={cy + 72} textAnchor="middle" fill="hsl(45, 60%, 55%)" fontSize="10">
                {SIGN_GLYPHS[sunSign]} {sunSign}
              </text>

              {/* ═══ ANIMATED MOON — slides from right to center ═══ */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="120,35;0,0"
                  dur="4.5s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.25 0.1 0.25 1"
                />
                <circle cx={cx} cy={cy} r={24} fill="hsl(0, 0%, 10%)" stroke="hsl(0, 0%, 35%)" strokeWidth="1.5" />
                {eclipse.subtype === 'annular' && (
                  <circle cx={cx} cy={cy} r={26} fill="none" stroke="hsl(45, 100%, 50%)" strokeWidth="2" opacity="0">
                    <animate attributeName="opacity" values="0;0;0.7;0.7" keyTimes="0;0.6;0.85;1" dur="5s" fill="freeze" />
                  </circle>
                )}
                <text x={cx} y={cy + 5} textAnchor="middle" fill="hsl(0, 0%, 70%)" fontSize="12" fontWeight="700">☽</text>
                <text x={cx} y={cy + 48} textAnchor="middle" fill="hsl(0, 0%, 75%)" fontSize="11" fontWeight="600">Moon</text>
                <text x={cx} y={cy + 62} textAnchor="middle" fill="hsl(0, 0%, 60%)" fontSize="10">
                  {SIGN_GLYPHS[moonSign]} {moonSign} {eclipse.degree}°
                </text>

                {/* Shadow cone — appears after Moon arrives */}
                <polygon
                  points={`${cx + 24},${cy - 18} ${cx + 175},${cy - 30} ${cx + 175},${cy + 30} ${cx + 24},${cy + 18}`}
                  fill="url(#shadowGrad)"
                  opacity="0"
                >
                  <animate attributeName="opacity" values="0;0;0.4;0.4" keyTimes="0;0.5;0.8;1" dur="5s" fill="freeze" />
                </polygon>
              </g>

              {/* Earth (right) */}
              <circle cx={cx + 170} cy={cy} r={28} fill="url(#earthGrad)" />
              <text x={cx + 170} y={cy + 4} textAnchor="middle" fill="hsl(0, 0%, 95%)" fontSize="14" fontWeight="700">🌍</text>
              <text x={cx + 170} y={cy + 48} textAnchor="middle" fill="hsl(200, 50%, 70%)" fontSize="11" fontWeight="600">Earth</text>

              {/* Annotation — fades in */}
              <text x={cx} y={cy - 45} textAnchor="middle" fill="hsl(220, 30%, 65%)" fontSize="10" fontStyle="italic" opacity="0">
                Moon blocks the Sun's light
                <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.65;0.9;1" dur="5s" fill="freeze" />
              </text>
            </>
          )}

          {/* ═══ NODE INDICATORS ═══ */}
          {/* South Node indicator */}
          <g>
            <circle cx={85} cy={cy + 110} r={14} fill="hsl(280, 30%, 20%)" stroke="hsl(280, 40%, 50%)" strokeWidth="1.5" />
            <text x={85} y={cy + 114} textAnchor="middle" fill="hsl(280, 60%, 75%)" fontSize="12" fontWeight="700">☋</text>
            <text x={85} y={cy + 135} textAnchor="middle" fill="hsl(280, 40%, 65%)" fontSize="9" fontWeight="600">South Node</text>
            <text x={85} y={cy + 147} textAnchor="middle" fill="hsl(280, 30%, 55%)" fontSize="9">
              {SIGN_GLYPHS[southNodeSign]} {southNodeSign}
            </text>
            <text x={85} y={cy + 159} textAnchor="middle" fill="hsl(280, 20%, 50%)" fontSize="8" fontStyle="italic">Release</text>
          </g>

          {/* North Node indicator */}
          <g>
            <circle cx={515} cy={cy + 110} r={14} fill="hsl(160, 30%, 20%)" stroke="hsl(160, 40%, 50%)" strokeWidth="1.5" />
            <text x={515} y={cy + 114} textAnchor="middle" fill="hsl(160, 60%, 75%)" fontSize="12" fontWeight="700">☊</text>
            <text x={515} y={cy + 135} textAnchor="middle" fill="hsl(160, 40%, 65%)" fontSize="9" fontWeight="600">North Node</text>
            <text x={515} y={cy + 147} textAnchor="middle" fill="hsl(160, 30%, 55%)" fontSize="9">
              {SIGN_GLYPHS[northNodeSign]} {northNodeSign}
            </text>
            <text x={515} y={cy + 159} textAnchor="middle" fill="hsl(160, 20%, 50%)" fontSize="8" fontStyle="italic">Growth</text>
          </g>

          {/* Node axis label */}
          <line x1={110} y1={cy + 110} x2={500} y2={cy + 110} stroke="hsl(280, 30%, 35%)" strokeWidth="1" strokeDasharray="4 6" opacity="0.5" />
          <text x={cx} y={cy + 105} textAnchor="middle" fill="hsl(260, 25%, 55%)" fontSize="8">
            ← Nodal Axis →
          </text>

          {/* Eclipse type label at top */}
          <text x={cx} y={28} textAnchor="middle" fill="hsl(0, 0%, 80%)" fontSize="14" fontWeight="700">
            {eclipse.subtype === 'total' ? 'Total' : eclipse.subtype === 'annular' ? 'Annular' : eclipse.subtype === 'partial' ? 'Partial' : 'Penumbral'} {isLunar ? 'Lunar' : 'Solar'} Eclipse
          </text>
          <text x={cx} y={44} textAnchor="middle" fill="hsl(0, 0%, 55%)" fontSize="10">
            {isLunar ? 'Full Moon — Earth blocks sunlight from reaching the Moon' : 'New Moon — Moon passes between Earth and Sun'}
          </text>
        </svg>
      </div>

      {/* Educational explanation below the diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            {isLunar ? '🌕' : '🌑'} What's Happening
          </p>
          {isLunar ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Sun is in <strong>{SIGN_GLYPHS[sunSign]} {sunSign}</strong> and the Moon is directly opposite in <strong>{SIGN_GLYPHS[moonSign]} {moonSign}</strong> — a Full Moon.
              But this isn't a regular Full Moon. Because the Moon is close to the <strong>Lunar Nodes</strong> (the invisible points where the Moon's orbit crosses the Sun's path),
              the Earth lines up <em>perfectly</em> between them and casts its shadow on the Moon.
              {eclipse.subtype === 'total' && ' The Moon turns deep red — a "Blood Moon" — because the only light reaching it is filtered through Earth\'s atmosphere, bending red wavelengths around the planet.'}
              {eclipse.subtype === 'penumbral' && ' The Moon passes through Earth\'s faint outer shadow (the penumbra), creating a subtle dimming rather than a dramatic darkening.'}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              The Sun and Moon are both in <strong>{SIGN_GLYPHS[moonSign]} {moonSign}</strong> — a New Moon.
              But because the Moon is near the <strong>Lunar Nodes</strong>, it passes <em>directly</em> between Earth and Sun,
              {eclipse.subtype === 'total' ? ' completely blocking the Sun\'s light. For observers on Earth in the path of totality, day briefly becomes night.' :
               eclipse.subtype === 'annular' ? ' but it\'s too far from Earth to fully cover the Sun, creating a spectacular "ring of fire" effect.' :
               ' partially blocking the Sun\'s disk.'}
            </p>
          )}
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            ☊ Why the Nodes Matter
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Eclipses <em>only</em> happen near the Nodes. The Moon's orbit is tilted about 5° from the Sun's path.
            Most New and Full Moons, the Moon passes above or below the Sun's path — no eclipse.
            But twice a year, the Moon crosses the Sun's path at the <strong>Nodes</strong>, and if a New or Full Moon happens at that moment, we get an eclipse.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Right now the <strong>North Node ☊ is in {SIGN_GLYPHS[northNodeSign]} {northNodeSign}</strong> (growth direction) and the <strong>South Node ☋ is in {SIGN_GLYPHS[southNodeSign]} {southNodeSign}</strong> (release direction).
            This eclipse falls near the <strong>{eclipse.nodal === 'north' ? 'North' : 'South'} Node</strong> — meaning it's a{eclipse.nodal === 'north' ? ' growth and activation' : ' release and completion'} eclipse.
          </p>
        </div>
      </div>
    </div>
  );
}
