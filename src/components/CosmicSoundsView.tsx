import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Volume2, VolumeX, Play, Square, Music, Sparkles, Waves } from "lucide-react";
import { NatalChart } from "@/hooks/useNatalChart";

// ─── Zodiac → Chromatic note mapping (Aries = C4, ascending by semitone) ───
const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"] as const;
type ZodiacSign = typeof SIGNS[number];

const NOTE_NAMES: Record<ZodiacSign, string> = {
  Aries: "C", Taurus: "C♯", Gemini: "D", Cancer: "D♯",
  Leo: "E", Virgo: "F", Libra: "F♯", Scorpio: "G",
  Sagittarius: "G♯", Capricorn: "A", Aquarius: "A♯", Pisces: "B",
};

// C4 = 261.63 Hz, each semitone = × 2^(1/12)
const BASE_FREQ = 261.63;
const signFreq = (sign: ZodiacSign): number => {
  const idx = SIGNS.indexOf(sign);
  return BASE_FREQ * Math.pow(2, idx / 12);
};

const SIGN_COLORS: Record<ZodiacSign, string> = {
  Aries: "hsl(0 80% 55%)", Taurus: "hsl(140 50% 40%)", Gemini: "hsl(50 80% 50%)",
  Cancer: "hsl(210 60% 60%)", Leo: "hsl(35 90% 55%)", Virgo: "hsl(100 40% 45%)",
  Libra: "hsl(280 50% 55%)", Scorpio: "hsl(340 70% 40%)", Sagittarius: "hsl(270 60% 55%)",
  Capricorn: "hsl(30 30% 35%)", Aquarius: "hsl(200 70% 55%)", Pisces: "hsl(250 60% 60%)",
};

const SIGN_GLYPHS: Record<ZodiacSign, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

// ─── Aspect intervals (semitone distance on the zodiac wheel) ───
interface AspectDef {
  name: string;
  glyph: string;
  semitones: number;
  quality: string;
  color: string;
  waveform: OscillatorType;
  description: string;
}

const ASPECTS: AspectDef[] = [
  { name: "Conjunction", glyph: "☌", semitones: 0, quality: "Fusion", color: "hsl(45 90% 55%)", waveform: "sine", description: "Two planets at the same degree — pure unison, raw intensity, a new beginning" },
  { name: "Sextile", glyph: "⚹", semitones: 2, quality: "Harmony", color: "hsl(180 60% 50%)", waveform: "sine", description: "60° apart — a gentle opening, opportunity, easy flow between signs of compatible elements" },
  { name: "Square", glyph: "□", semitones: 3, quality: "Tension", color: "hsl(0 70% 50%)", waveform: "sawtooth", description: "90° apart — friction, pressure, the dissonance that forces growth and action" },
  { name: "Trine", glyph: "△", semitones: 4, quality: "Grace", color: "hsl(140 60% 45%)", waveform: "sine", description: "120° apart — natural harmony, ease, gifts that flow without effort" },
  { name: "Quincunx", glyph: "⚻", semitones: 5, quality: "Adjustment", color: "hsl(35 70% 50%)", waveform: "triangle", description: "150° apart — an awkward angle, requiring constant adjustment and creative adaptation" },
  { name: "Opposition", glyph: "☍", semitones: 6, quality: "Polarity", color: "hsl(270 60% 55%)", waveform: "square", description: "180° apart — the tritone, maximum tension, awareness through relationship with the other" },
];

// ─── Planets ───
const PLANETS = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto"] as const;
const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
};

// ─── Audio Engine ───
class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private activeOscs: OscillatorNode[] = [];
  private masterGain: GainNode | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  playTone(freq: number, duration: number, waveform: OscillatorType = "sine", pan = 0): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    
    osc.type = waveform;
    osc.frequency.value = freq;
    panner.pan.value = pan;
    
    // Gentle envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime + duration - 0.15);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain!);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    this.activeOscs.push(osc);
    osc.onended = () => {
      this.activeOscs = this.activeOscs.filter(o => o !== osc);
    };
  }

  playChord(freqs: number[], duration: number, waveform: OscillatorType = "sine"): void {
    const perVoice = Math.min(0.2, 0.6 / freqs.length);
    const ctx = this.getCtx();
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = waveform;
      osc.frequency.value = freq;
      const pan = freqs.length > 1 ? -0.8 + (1.6 * i / (freqs.length - 1)) : 0;
      const panner = ctx.createStereoPanner();
      panner.pan.value = pan;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(perVoice, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(perVoice, ctx.currentTime + duration - 0.3);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.masterGain!);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      this.activeOscs.push(osc);
      osc.onended = () => { this.activeOscs = this.activeOscs.filter(o => o !== osc); };
    });
  }

  async playArpeggio(freqs: number[], noteDuration: number, waveform: OscillatorType = "sine"): Promise<void> {
    for (let i = 0; i < freqs.length; i++) {
      this.playTone(freqs[i], noteDuration, waveform, -0.6 + (1.2 * i / Math.max(1, freqs.length - 1)));
      await new Promise(r => setTimeout(r, noteDuration * 600));
    }
  }

  stopAll(): void {
    this.activeOscs.forEach(o => { try { o.stop(); } catch {} });
    this.activeOscs = [];
  }

  setVolume(v: number): void {
    if (this.masterGain) this.masterGain.gain.value = v;
  }
}

// ─── Component ───
interface Props {
  userNatalChart?: NatalChart | null;
  savedCharts?: NatalChart[];
}

export const CosmicSoundsView = ({ userNatalChart, savedCharts = [] }: Props) => {
  const engineRef = useRef<CosmicAudioEngine | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [muted, setMuted] = useState(false);
  const playingRef = useRef<string | null>(null);

  const getEngine = useCallback(() => {
    if (!engineRef.current) engineRef.current = new CosmicAudioEngine();
    return engineRef.current;
  }, []);

  useEffect(() => {
    const eng = engineRef.current;
    if (eng) eng.setVolume(muted ? 0 : volume);
  }, [volume, muted]);

  const stopPlaying = useCallback(() => {
    getEngine().stopAll();
    setPlaying(null);
    playingRef.current = null;
  }, [getEngine]);

  const playSign = useCallback((sign: ZodiacSign) => {
    stopPlaying();
    setPlaying(sign);
    playingRef.current = sign;
    getEngine().playTone(signFreq(sign), 2, "sine");
    setTimeout(() => { if (playingRef.current === sign) { setPlaying(null); playingRef.current = null; } }, 2000);
  }, [getEngine, stopPlaying]);

  const playAspect = useCallback((asp: AspectDef) => {
    stopPlaying();
    const id = `aspect-${asp.name}`;
    setPlaying(id);
    playingRef.current = id;
    const f1 = BASE_FREQ; // C4
    const f2 = BASE_FREQ * Math.pow(2, asp.semitones / 12);
    getEngine().playChord([f1, f2], 3, asp.waveform);
    setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; } }, 3000);
  }, [getEngine, stopPlaying]);

  const playZodiacScale = useCallback(async () => {
    stopPlaying();
    const id = "zodiac-scale";
    setPlaying(id);
    playingRef.current = id;
    const freqs = SIGNS.map(s => signFreq(s));
    await getEngine().playArpeggio(freqs, 0.6);
    // Final chord of all 12
    if (playingRef.current === id) {
      getEngine().playChord(freqs, 4, "sine");
      setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; } }, 4000);
    }
  }, [getEngine, stopPlaying]);

  const playAspectJourney = useCallback(async () => {
    stopPlaying();
    const id = "aspect-journey";
    setPlaying(id);
    playingRef.current = id;
    for (const asp of ASPECTS) {
      if (playingRef.current !== id) break;
      const f1 = BASE_FREQ;
      const f2 = BASE_FREQ * Math.pow(2, asp.semitones / 12);
      getEngine().playChord([f1, f2], 2.2, asp.waveform);
      await new Promise(r => setTimeout(r, 2500));
    }
    if (playingRef.current === id) { setPlaying(null); playingRef.current = null; }
  }, [getEngine, stopPlaying]);

  // Natal chart chord
  const natalFreqs = useMemo(() => {
    const chart = userNatalChart || savedCharts[0];
    if (!chart?.planets) return null;
    const freqs: { planet: string; sign: ZodiacSign; freq: number }[] = [];
    for (const p of PLANETS) {
      const pos = chart.planets[p as keyof typeof chart.planets];
      if (pos?.sign && SIGNS.includes(pos.sign as ZodiacSign)) {
        freqs.push({ planet: p, sign: pos.sign as ZodiacSign, freq: signFreq(pos.sign as ZodiacSign) });
      }
    }
    return freqs.length > 0 ? freqs : null;
  }, [userNatalChart, savedCharts]);

  const playNatalChord = useCallback(() => {
    if (!natalFreqs) return;
    stopPlaying();
    const id = "natal-chord";
    setPlaying(id);
    playingRef.current = id;
    getEngine().playChord(natalFreqs.map(f => f.freq), 5, "sine");
    setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; } }, 5000);
  }, [natalFreqs, getEngine, stopPlaying]);

  const playNatalArpeggio = useCallback(async () => {
    if (!natalFreqs) return;
    stopPlaying();
    const id = "natal-arp";
    setPlaying(id);
    playingRef.current = id;
    await getEngine().playArpeggio(natalFreqs.map(f => f.freq), 0.8);
    if (playingRef.current === id) {
      getEngine().playChord(natalFreqs.map(f => f.freq), 4, "sine");
      setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; } }, 4000);
    }
  }, [natalFreqs, getEngine, stopPlaying]);

  const chartName = userNatalChart?.name || savedCharts[0]?.name;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="font-serif text-4xl md:text-5xl font-light tracking-wide text-foreground">
          Cosmic Sounds
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
          Every zodiac sign vibrates at its own frequency. Hear the chromatic scale of the heavens — 
          from the fire of Aries to the depths of Pisces. Listen to how trines sing in harmony 
          and squares clash with creative tension.
        </p>
        {/* Volume */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setMuted(!muted)} className="text-muted-foreground hover:text-foreground transition-colors">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
            onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
            className="w-32 accent-primary"
          />
          {playing && (
            <button onClick={stopPlaying} className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors">
              <Square size={12} /> Stop
            </button>
          )}
        </div>
      </div>

      {/* ── Section 1: The Zodiac Wheel of Sound ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-foreground">The Zodiac Wheel of Sound</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Each sign maps to one of the 12 chromatic notes — Aries begins at C, ascending by semitone through the zodiac. 
          Click any sign to hear its tone. Then play the full ascending scale to hear the entire wheel.
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {SIGNS.map(sign => (
            <button
              key={sign}
              onClick={() => playSign(sign)}
              className={`group relative flex flex-col items-center gap-1.5 p-4 rounded-sm border transition-all duration-300 ${
                playing === sign
                  ? "border-primary bg-primary/10 scale-[1.03]"
                  : "border-border hover:border-primary/50 bg-card hover:bg-secondary/50"
              }`}
            >
              <span className="text-3xl" style={{ textShadow: `0 0 12px ${SIGN_COLORS[sign]}` }}>
                {SIGN_GLYPHS[sign]}
              </span>
              <span className="text-xs font-medium text-foreground">{sign}</span>
              <span className="text-[10px] text-muted-foreground font-mono">{NOTE_NAMES[sign]} · {Math.round(signFreq(sign))} Hz</span>
              {playing === sign && (
                <div className="absolute inset-0 rounded-sm animate-pulse border-2 border-primary/30 pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={playZodiacScale}
            disabled={playing === "zodiac-scale"}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
              playing === "zodiac-scale"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Play size={14} />
            Play Full Zodiac Scale
          </button>
        </div>
      </section>

      {/* ── Section 2: Aspect Intervals ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Waves size={18} className="text-primary" />
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-foreground">Aspect Intervals</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Aspects are angles between planets — and each angle creates a distinct musical interval. 
          A trine (120°) spans 4 semitones — a major third, naturally harmonious. 
          A square (90°) spans 3 — a minor third that creates beautiful tension. 
          An opposition (180°) is the tritone — the most unstable interval in music, pulling toward resolution.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ASPECTS.map(asp => (
            <button
              key={asp.name}
              onClick={() => playAspect(asp)}
              className={`group text-left p-4 rounded-sm border transition-all duration-300 ${
                playing === `aspect-${asp.name}`
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border hover:border-primary/50 bg-card hover:bg-secondary/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl" style={{ color: asp.color }}>{asp.glyph}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{asp.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{asp.semitones} semitones · {asp.quality}</p>
                </div>
                <Play size={14} className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{asp.description}</p>
              {playing === `aspect-${asp.name}` && (
                <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={playAspectJourney}
            disabled={playing === "aspect-journey"}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
              playing === "aspect-journey"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Music size={14} />
            Play All Aspects (Journey from Unison to Tritone)
          </button>
        </div>
      </section>

      {/* ── Section 3: Your Natal Chart as Sound ── */}
      {natalFreqs && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Music size={18} className="text-primary" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-foreground">
              {chartName ? `${chartName}'s` : "Your"} Birth Chart as Sound
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every planet in your natal chart sits in a zodiac sign — each sign has a frequency. 
            Together, they form your unique celestial chord. This is the sound the cosmos made when you were born.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {natalFreqs.map(({ planet, sign, freq }) => (
              <div key={planet} className="flex items-center gap-2 p-2.5 rounded-sm border border-border bg-card">
                <span className="text-lg" style={{ color: SIGN_COLORS[sign] }}>{PLANET_GLYPHS[planet]}</span>
                <div>
                  <p className="text-[11px] font-medium text-foreground">{planet}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{sign} · {NOTE_NAMES[sign]} · {Math.round(freq)} Hz</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={playNatalChord}
              disabled={playing === "natal-chord"}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
                playing === "natal-chord"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Play size={14} />
              Play Birth Chord
            </button>
            <button
              onClick={playNatalArpeggio}
              disabled={playing === "natal-arp"}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
                playing === "natal-arp"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Music size={14} />
              Play Birth Arpeggio
            </button>
          </div>
        </section>
      )}

      {/* ── Section 4: Element Chords ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-foreground">Element Chords</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The four elements group three signs each — and because they're all 120° apart (trines), 
          each element forms a naturally harmonious chord. Fire blazes with major brightness, 
          Water flows in deep resonance, Air shimmers with lightness, and Earth grounds with warmth.
        </p>
        <ElementChords playing={playing} onPlay={(id, freqs, waveform) => {
          stopPlaying();
          setPlaying(id);
          playingRef.current = id;
          getEngine().playChord(freqs, 4, waveform);
          setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; } }, 4000);
        }} />
      </section>

      {/* Footer teaching */}
      <div className="text-center text-xs text-muted-foreground/70 pt-4 pb-8 border-t border-border space-y-2">
        <p>Frequencies based on the chromatic zodiac scale: Aries = C4 (261.63 Hz), ascending by semitone.</p>
        <p>This mapping follows the tradition linking the 12 chromatic notes to the 12 zodiac signs, as explored by sound healers and musical astrologers.</p>
      </div>
    </div>
  );
};

// ─── Element Chords Sub-component ───
const ELEMENTS: { name: string; signs: ZodiacSign[]; color: string; waveform: OscillatorType; desc: string }[] = [
  { name: "🔥 Fire", signs: ["Aries", "Leo", "Sagittarius"], color: "hsl(15 80% 55%)", waveform: "sine", desc: "Cardinal fire, fixed fire, mutable fire — pure creative force" },
  { name: "🌍 Earth", signs: ["Taurus", "Virgo", "Capricorn"], color: "hsl(100 40% 40%)", waveform: "triangle", desc: "Grounded, material, the body's wisdom — stable and warm" },
  { name: "💨 Air", signs: ["Gemini", "Libra", "Aquarius"], color: "hsl(200 60% 55%)", waveform: "sine", desc: "Thought, connection, social — light and crystalline" },
  { name: "💧 Water", signs: ["Cancer", "Scorpio", "Pisces"], color: "hsl(220 60% 45%)", waveform: "sine", desc: "Feeling, intuition, the unconscious — deep and flowing" },
];

function ElementChords({ playing, onPlay }: { playing: string | null; onPlay: (id: string, freqs: number[], waveform: OscillatorType) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {ELEMENTS.map(el => {
        const id = `element-${el.name}`;
        const freqs = el.signs.map(s => signFreq(s));
        return (
          <button
            key={el.name}
            onClick={() => onPlay(id, freqs, el.waveform)}
            className={`group text-left p-4 rounded-sm border transition-all duration-300 ${
              playing === id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card hover:bg-secondary/30"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">{el.name}</span>
              <Play size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono mb-1">
              {el.signs.map(s => `${SIGN_GLYPHS[s]} ${s} (${NOTE_NAMES[s]})`).join(" · ")}
            </p>
            <p className="text-xs text-muted-foreground">{el.desc}</p>
            {playing === id && (
              <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default CosmicSoundsView;
