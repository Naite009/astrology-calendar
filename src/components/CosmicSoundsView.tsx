import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Volume2, VolumeX, Play, Square, Music, Sparkles, Waves, Globe } from "lucide-react";
import { NatalChart } from "@/hooks/useNatalChart";
import { getPlanetaryPositions } from "@/lib/astrology";

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
const PLANETS = ["Sun","Moon","Ascendant","Mercury","Venus","Mars","Jupiter","Saturn","Uranus","Neptune","Pluto","NorthNode","Chiron","Lilith","Ceres","Pallas","Juno","Vesta"] as const;
const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉", Moon: "☽", Ascendant: "AC", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇",
  NorthNode: "☊", Chiron: "⚷", Lilith: "⚸",
  Ceres: "⚳", Pallas: "⚴", Juno: "⚵", Vesta: "⚶",
};
const PLANET_LABELS: Record<string, string> = {
  NorthNode: "North Node", Ascendant: "Ascendant",
};

// ─── Audio Engine ───
class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private activeOscs: OscillatorNode[] = [];
  private activeNodes: AudioNode[] = [];
  private masterGain: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbMix = 0.4; // 0 = dry, 1 = full reverb

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;

      // Create reverb via impulse response
      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createReverbIR(this.ctx, 3, 2.5); // 3s decay, warm

      // Reverb as additive send (dry stays full, reverb adds spaciousness)
      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.value = 1.0; // always full dry
      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = this.reverbMix;

      this.convolver = this.ctx.createConvolver();
      this.convolver.buffer = this.createReverbIR(this.ctx, 4, 2);

      this.masterGain.connect(this.dryGain);
      this.dryGain.connect(this.ctx.destination);

      this.masterGain.connect(this.convolver);
      this.convolver.connect(this.reverbGain);
      this.reverbGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
    return this.ctx;
  }

  private createReverbIR(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(2, length, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  setReverbMix(mix: number): void {
    this.reverbMix = Math.max(0, Math.min(1, mix));
    // Only adjust the reverb send level; dry stays at 1.0
    if (this.reverbGain) this.reverbGain.gain.value = this.reverbMix;
  }

  private trackOsc(osc: OscillatorNode) {
    this.activeOscs.push(osc);
    osc.onended = () => { this.activeOscs = this.activeOscs.filter(o => o !== osc); };
  }

  playTone(freq: number, duration: number, waveform: OscillatorType = "sine", pan = 0): void {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    
    osc.type = waveform;
    osc.frequency.value = freq;
    panner.pan.value = pan;
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.25, ctx.currentTime + duration - 0.15);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(this.masterGain!);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    this.trackOsc(osc);
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
      this.trackOsc(osc);
    });
  }

  // ─── Lush trine chord: singing-bowl warmth with harmonics, detuning + sub-octave ───
  playTrineChord(freqs: number[], duration: number): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const voices = freqs.length;
    const perVoice = Math.min(0.1, 0.35 / voices);

    // Temporarily boost reverb for trines
    const prevReverb = this.reverbMix;
    this.setReverbMix(Math.max(prevReverb, 0.55));

    freqs.forEach((freq, i) => {
      const pan = voices > 1 ? -0.7 + (1.4 * i / (voices - 1)) : 0;

      // Layer 1: fundamental sine — slow bloom like a singing bowl strike
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = freq;
      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0, t);
      g1.gain.linearRampToValueAtTime(perVoice, t + 1.2);
      g1.gain.exponentialRampToValueAtTime(perVoice * 0.6, t + duration - 1.5);
      g1.gain.linearRampToValueAtTime(0, t + duration);
      const p1 = ctx.createStereoPanner();
      p1.pan.value = pan;
      osc1.connect(g1); g1.connect(p1); p1.connect(this.masterGain!);
      osc1.start(t); osc1.stop(t + duration);
      this.trackOsc(osc1);

      // Layer 2: detuned sine for gentle chorus/shimmer
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.value = freq * 1.002; // +3.5 cents
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(perVoice * 0.35, t + 1.5);
      g2.gain.exponentialRampToValueAtTime(perVoice * 0.15, t + duration - 1.5);
      g2.gain.linearRampToValueAtTime(0, t + duration);
      const p2 = ctx.createStereoPanner();
      p2.pan.value = -pan * 0.6;
      osc2.connect(g2); g2.connect(p2); p2.connect(this.masterGain!);
      osc2.start(t); osc2.stop(t + duration);
      this.trackOsc(osc2);

      // Layer 3: octave harmonic (×2) — bell-like overtone
      const osc3 = ctx.createOscillator();
      osc3.type = "sine";
      osc3.frequency.value = freq * 2;
      const g3 = ctx.createGain();
      g3.gain.setValueAtTime(0, t);
      g3.gain.linearRampToValueAtTime(perVoice * 0.15, t + 0.5);
      g3.gain.exponentialRampToValueAtTime(perVoice * 0.03, t + duration - 1);
      g3.gain.linearRampToValueAtTime(0, t + duration);
      osc3.connect(g3); g3.connect(p1); // same panner as fundamental
      osc3.start(t); osc3.stop(t + duration);
      this.trackOsc(osc3);

      // Layer 4: 3rd harmonic (×3, octave+fifth) — singing bowl character
      const osc4 = ctx.createOscillator();
      osc4.type = "sine";
      osc4.frequency.value = freq * 3;
      const g4 = ctx.createGain();
      g4.gain.setValueAtTime(0, t);
      g4.gain.linearRampToValueAtTime(perVoice * 0.06, t + 0.3);
      g4.gain.exponentialRampToValueAtTime(perVoice * 0.01, t + duration * 0.5);
      g4.gain.linearRampToValueAtTime(0, t + duration);
      osc4.connect(g4); g4.connect(p2);
      osc4.start(t); osc4.stop(t + duration);
      this.trackOsc(osc4);
    });

    // Sub-octave warmth on root
    const sub = ctx.createOscillator();
    sub.type = "sine";
    sub.frequency.value = freqs[0] / 2;
    const gs = ctx.createGain();
    gs.gain.setValueAtTime(0, t);
    gs.gain.linearRampToValueAtTime(perVoice * 0.4, t + 1.5);
    gs.gain.exponentialRampToValueAtTime(perVoice * 0.15, t + duration - 2);
    gs.gain.linearRampToValueAtTime(0, t + duration);
    sub.connect(gs); gs.connect(this.masterGain!);
    sub.start(t); sub.stop(t + duration);
    this.trackOsc(sub);

    // Restore reverb after duration
    setTimeout(() => this.setReverbMix(prevReverb), duration * 1000);
  }

  // ─── Ominous square chord: dark, grinding, with beating + low drone ───
  playSquareChord(freqs: number[], duration: number): void {
    const ctx = this.getCtx();
    const t = ctx.currentTime;
    const voices = freqs.length;
    const perVoice = Math.min(0.1, 0.35 / voices);

    // Low drone foundation
    const drone = ctx.createOscillator();
    drone.type = "sawtooth";
    drone.frequency.value = freqs[0] / 2; // one octave below root
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0, t);
    droneGain.gain.linearRampToValueAtTime(perVoice * 0.6, t + 0.5);
    droneGain.gain.setValueAtTime(perVoice * 0.6, t + duration - 0.8);
    droneGain.gain.linearRampToValueAtTime(0, t + duration);
    // Low-pass filter on drone for rumble
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.value = 300;
    lpf.Q.value = 2;
    drone.connect(lpf); lpf.connect(droneGain); droneGain.connect(this.masterGain!);
    drone.start(t); drone.stop(t + duration);
    this.trackOsc(drone);
    this.activeNodes.push(lpf);

    freqs.forEach((freq, i) => {
      const pan = voices > 1 ? -0.6 + (1.2 * i / (voices - 1)) : 0;

      // Layer 1: sawtooth — gritty
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.value = freq;
      const g1 = ctx.createGain();
      g1.gain.setValueAtTime(0, t);
      g1.gain.linearRampToValueAtTime(perVoice, t + 0.3);
      g1.gain.setValueAtTime(perVoice, t + duration - 0.5);
      g1.gain.linearRampToValueAtTime(0, t + duration);
      const p1 = ctx.createStereoPanner();
      p1.pan.value = pan;
      osc1.connect(g1); g1.connect(p1); p1.connect(this.masterGain!);
      osc1.start(t); osc1.stop(t + duration);
      this.trackOsc(osc1);

      // Layer 2: detuned square wave for beating dissonance
      const osc2 = ctx.createOscillator();
      osc2.type = "square";
      osc2.frequency.value = freq * 0.99; // -17 cents for beating
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(perVoice * 0.3, t + 0.5);
      g2.gain.setValueAtTime(perVoice * 0.3, t + duration - 0.6);
      g2.gain.linearRampToValueAtTime(0, t + duration);
      const p2 = ctx.createStereoPanner();
      p2.pan.value = pan * -0.7;
      osc2.connect(g2); g2.connect(p2); p2.connect(this.masterGain!);
      osc2.start(t); osc2.stop(t + duration);
      this.trackOsc(osc2);
    });

    // Add a slow LFO tremolo to master for unease
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 3; // 3Hz tremolo
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = perVoice * 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(this.masterGain!.gain);
    lfo.start(t); lfo.stop(t + duration);
    this.trackOsc(lfo);
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
  const [highlightedPlanet, setHighlightedPlanet] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.3);
  const [muted, setMuted] = useState(false);
  const [reverb, setReverb] = useState(0.4);
  const playingRef = useRef<string | null>(null);
  
  // Chart selector
  const allCharts = useMemo(() => [
    ...(userNatalChart ? [userNatalChart] : []),
    ...savedCharts,
  ], [userNatalChart, savedCharts]);
  const [selectedChartIdx, setSelectedChartIdx] = useState(0);
  const selectedChart = allCharts[selectedChartIdx] || allCharts[0] || null;

  const getEngine = useCallback(() => {
    if (!engineRef.current) engineRef.current = new CosmicAudioEngine();
    return engineRef.current;
  }, []);

  useEffect(() => {
    const eng = engineRef.current;
    if (eng) {
      eng.setVolume(muted ? 0 : volume);
      eng.setReverbMix(reverb);
    }
  }, [volume, muted, reverb]);

  const stopPlaying = useCallback(() => {
    getEngine().stopAll();
    setPlaying(null);
    setHighlightedPlanet(null);
    playingRef.current = null;
  }, [getEngine]);

  // Toggle helper: if already playing this id, stop. Otherwise play.
  const toggleOrPlay = useCallback((id: string, playFn: () => void) => {
    if (playing === id) {
      stopPlaying();
    } else {
      playFn();
    }
  }, [playing, stopPlaying]);

  const playSign = useCallback((sign: ZodiacSign) => {
    toggleOrPlay(sign, () => {
      stopPlaying();
      setPlaying(sign);
      playingRef.current = sign;
      getEngine().playTone(signFreq(sign), 10, "sine");
      setTimeout(() => { if (playingRef.current === sign) { setPlaying(null); playingRef.current = null; } }, 10000);
    });
  }, [getEngine, stopPlaying, toggleOrPlay]);

  const playAspect = useCallback((asp: AspectDef) => {
    const id = `aspect-${asp.name}`;
    toggleOrPlay(id, () => {
      stopPlaying();
      setPlaying(id);
      playingRef.current = id;
      const f1 = BASE_FREQ;
      const f2 = BASE_FREQ * Math.pow(2, asp.semitones / 12);
      getEngine().playChord([f1, f2], 10, asp.waveform);
      setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; } }, 10000);
    });
  }, [getEngine, stopPlaying, toggleOrPlay]);

  const playZodiacScale = useCallback(async () => {
    toggleOrPlay("zodiac-scale", async () => {
      stopPlaying();
      const id = "zodiac-scale";
      setPlaying(id);
      playingRef.current = id;
      const freqs = SIGNS.map(s => signFreq(s));
      await getEngine().playArpeggio(freqs, 0.6);
      if (playingRef.current === id) { setPlaying(null); playingRef.current = null; }
    });
  }, [getEngine, stopPlaying, toggleOrPlay]);

  const playAll12 = useCallback(() => {
    toggleOrPlay("all-12", () => {
      stopPlaying();
      const id = "all-12";
      setPlaying(id);
      playingRef.current = id;
      const freqs = SIGNS.map(s => signFreq(s));
      getEngine().playChord(freqs, 10, "sine");
      setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; } }, 10000);
    });
  }, [getEngine, stopPlaying, toggleOrPlay]);

  // Grouped chord helpers — uses expressive trine/square voices
  const playGroupChord = useCallback((id: string, signs: ZodiacSign[], duration = 10, waveform: OscillatorType = "sine") => {
    toggleOrPlay(id, () => {
      stopPlaying();
      setPlaying(id);
      playingRef.current = id;
      const freqs = signs.map(s => signFreq(s));
      const isTrine = id.includes("trine");
      const isSquare = id.includes("square");
      if (isTrine) {
        getEngine().playTrineChord(freqs, duration);
      } else if (isSquare) {
        getEngine().playSquareChord(freqs, duration);
      } else {
        getEngine().playChord(freqs, duration, waveform);
      }
      setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; } }, duration * 1000);
    });
  }, [getEngine, stopPlaying, toggleOrPlay]);

  const playAspectJourney = useCallback(async () => {
    toggleOrPlay("aspect-journey", async () => {
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
    });
  }, [getEngine, stopPlaying, toggleOrPlay]);

  // ─── Guided Sonic Tour: all trines then all squares ───
  const playGuidedTour = useCallback(async () => {
    toggleOrPlay("guided-tour", async () => {
      stopPlaying();
      const id = "guided-tour";
      setPlaying(id);
      playingRef.current = id;

      // Play each trine
      for (const g of TRINE_GROUPS) {
        if (playingRef.current !== id) break;
        const tourStepId = `tour-trine-${g.label}`;
        setHighlightedPlanet(tourStepId);
        getEngine().playTrineChord(g.signs.map(s => signFreq(s)), 4);
        await new Promise(r => setTimeout(r, 4500));
      }

      // Play each square
      for (const g of SQUARE_GROUPS) {
        if (playingRef.current !== id) break;
        const tourStepId = `tour-square-${g.label}`;
        setHighlightedPlanet(tourStepId);
        getEngine().playSquareChord(g.signs.map(s => signFreq(s)), 4);
        await new Promise(r => setTimeout(r, 4500));
      }

      if (playingRef.current === id) { setPlaying(null); playingRef.current = null; setHighlightedPlanet(null); }
    });
  }, [getEngine, stopPlaying, toggleOrPlay]);

  // ─── Current Sky positions ───
  const currentSkyFreqs = useMemo(() => {
    const now = new Date();
    const positions = getPlanetaryPositions(now);
    const SKY_PLANETS: { key: keyof typeof positions; label: string; glyph: string }[] = [
      { key: "sun", label: "Sun", glyph: "☉" },
      { key: "moon", label: "Moon", glyph: "☽" },
      { key: "mercury", label: "Mercury", glyph: "☿" },
      { key: "venus", label: "Venus", glyph: "♀" },
      { key: "mars", label: "Mars", glyph: "♂" },
      { key: "jupiter", label: "Jupiter", glyph: "♃" },
      { key: "saturn", label: "Saturn", glyph: "♄" },
      { key: "uranus", label: "Uranus", glyph: "♅" },
      { key: "neptune", label: "Neptune", glyph: "♆" },
      { key: "pluto", label: "Pluto", glyph: "♇" },
      { key: "northNode", label: "North Node", glyph: "☊" },
      { key: "chiron", label: "Chiron", glyph: "⚷" },
    ];
    return SKY_PLANETS.map(p => {
      const pos = positions[p.key];
      const signName = pos?.signName as ZodiacSign | undefined;
      if (!signName || !SIGNS.includes(signName)) return null;
      return { planet: p.label, glyph: p.glyph, sign: signName, freq: signFreq(signName) };
    }).filter(Boolean) as { planet: string; glyph: string; sign: ZodiacSign; freq: number }[];
  }, []);

  const [skyHighlight, setSkyHighlight] = useState<string | null>(null);

  const playSkyChord = useCallback(() => {
    toggleOrPlay("sky-chord", () => {
      stopPlaying();
      const id = "sky-chord";
      setPlaying(id);
      playingRef.current = id;
      setSkyHighlight("all");
      getEngine().playChord(currentSkyFreqs.map(f => f.freq), 10, "sine");
      setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; setSkyHighlight(null); } }, 10000);
    });
  }, [currentSkyFreqs, getEngine, stopPlaying, toggleOrPlay]);

  const playSkyArpeggio = useCallback(async () => {
    toggleOrPlay("sky-arp", async () => {
      stopPlaying();
      const id = "sky-arp";
      setPlaying(id);
      playingRef.current = id;
      for (let i = 0; i < currentSkyFreqs.length; i++) {
        if (playingRef.current !== id) break;
        setSkyHighlight(currentSkyFreqs[i].planet);
        getEngine().playTone(currentSkyFreqs[i].freq, 0.8, "sine", -0.6 + (1.2 * i / Math.max(1, currentSkyFreqs.length - 1)));
        await new Promise(r => setTimeout(r, 500));
      }
      setSkyHighlight(null);
      if (playingRef.current === id) {
        setSkyHighlight("all");
        getEngine().playChord(currentSkyFreqs.map(f => f.freq), 10, "sine");
        setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; setSkyHighlight(null); } }, 10000);
      }
    });
  }, [currentSkyFreqs, getEngine, stopPlaying, toggleOrPlay]);

  // Natal chart chord
  const natalFreqs = useMemo(() => {
    if (!selectedChart?.planets) return null;
    const freqs: { planet: string; sign: ZodiacSign; freq: number }[] = [];
    for (const p of PLANETS) {
      const pos = selectedChart.planets[p as keyof typeof selectedChart.planets];
      if (pos?.sign && SIGNS.includes(pos.sign as ZodiacSign)) {
        freqs.push({ planet: p, sign: pos.sign as ZodiacSign, freq: signFreq(pos.sign as ZodiacSign) });
      }
    }
    return freqs.length > 0 ? freqs : null;
  }, [selectedChart]);

  const playNatalChord = useCallback(() => {
    if (!natalFreqs) return;
    toggleOrPlay("natal-chord", () => {
      stopPlaying();
      const id = "natal-chord";
      setPlaying(id);
      playingRef.current = id;
      setHighlightedPlanet("all");
      getEngine().playChord(natalFreqs.map(f => f.freq), 10, "sine");
      setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; setHighlightedPlanet(null); } }, 10000);
    });
  }, [natalFreqs, getEngine, stopPlaying, toggleOrPlay]);

  const playNatalArpeggio = useCallback(async () => {
    if (!natalFreqs) return;
    toggleOrPlay("natal-arp", async () => {
      stopPlaying();
      const id = "natal-arp";
      setPlaying(id);
      playingRef.current = id;
      for (let i = 0; i < natalFreqs.length; i++) {
        if (playingRef.current !== id) break;
        setHighlightedPlanet(natalFreqs[i].planet);
        getEngine().playTone(natalFreqs[i].freq, 0.8, "sine", -0.6 + (1.2 * i / Math.max(1, natalFreqs.length - 1)));
        await new Promise(r => setTimeout(r, 480));
      }
      setHighlightedPlanet(null);
      if (playingRef.current === id) {
        getEngine().playChord(natalFreqs.map(f => f.freq), 10, "sine");
        setHighlightedPlanet("all");
        setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; setHighlightedPlanet(null); } }, 10000);
      }
    });
  }, [natalFreqs, getEngine, stopPlaying, toggleOrPlay]);

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
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setMuted(!muted)} className="text-muted-foreground hover:text-foreground transition-colors">
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground w-10">Vol</span>
            <input
              type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume}
              onChange={e => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
              className="w-24 accent-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Waves size={16} className="text-muted-foreground" />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground w-10">Reverb</span>
            <input
              type="range" min="0" max="1" step="0.05" value={reverb}
              onChange={e => setReverb(parseFloat(e.target.value))}
              className="w-24 accent-primary"
            />
          </div>
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

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <button
            onClick={playZodiacScale}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
              playing === "zodiac-scale"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {playing === "zodiac-scale" ? <Square size={14} /> : <Play size={14} />}
            {playing === "zodiac-scale" ? "Stop" : "Play Scale (1–12)"}
          </button>
          <button
            onClick={playAll12}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
              playing === "all-12"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {playing === "all-12" ? <Square size={14} /> : <Music size={14} />}
            {playing === "all-12" ? "Stop" : "Play All 12 Together"}
          </button>
        </div>
      </section>

      {/* ── Section 2: Zodiac Chord Chart — Trines & Squares ── */}
      <ZodiacChordChart playing={playing} highlightedPlanet={highlightedPlanet} onPlayGroup={playGroupChord} onPlaySingleSign={playSign} onPlayGuidedTour={playGuidedTour} />
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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
              playing === "aspect-journey"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {playing === "aspect-journey" ? <Square size={14} /> : <Music size={14} />}
            {playing === "aspect-journey" ? "Stop" : "Play All Aspects (Journey from Unison to Tritone)"}
          </button>
        </div>
      </section>

      {/* ── Section 3: Birth Chart as Sound ── */}
      {allCharts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Music size={18} className="text-primary" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-foreground">Birth Chart as Sound</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every planet in a natal chart sits in a zodiac sign — each sign has a frequency. 
            This includes the <strong>Ascendant</strong>, <strong>Chiron</strong>, <strong>North Node</strong>, and the <strong>Goddess asteroids</strong> (Ceres, Pallas, Juno, Vesta) — 
            yes, they all vibrate! Each body adds its own harmonic voice to your birth sound.
            <strong> Birth Chord</strong> plays all tones simultaneously. 
            <strong> Birth Arpeggio</strong> plays each one in sequence, highlighting as it goes, before merging into the full chord.
          </p>

          {/* Chart selector */}
          {allCharts.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Chart:</span>
              <select
                value={selectedChartIdx}
                onChange={e => setSelectedChartIdx(Number(e.target.value))}
                className="text-xs bg-secondary border border-border rounded-sm px-3 py-1.5 text-foreground"
              >
                {allCharts.map((c, i) => (
                  <option key={c.id || i} value={i}>{c.name || `Chart ${i + 1}`}</option>
                ))}
              </select>
            </div>
          )}

          {natalFreqs ? (
            <>
              <p className="text-[10px] text-muted-foreground mb-2 italic">Click any planet to hear its tone — click again to stop.</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {natalFreqs.map(({ planet, sign, freq }) => {
                  const natalId = `natal-${planet}`;
                  const isHi = playing === natalId || highlightedPlanet === planet || highlightedPlanet === "all" || playing === "natal-chord";
                  const label = PLANET_LABELS[planet] || planet;
                  return (
                    <button
                      key={planet}
                      onClick={() => {
                        if (playing === natalId) {
                          stopPlaying();
                        } else {
                          stopPlaying();
                          const id = natalId;
                          setPlaying(id);
                          playingRef.current = id;
                          setHighlightedPlanet(planet);
                          getEngine().playTone(freq, 10, "sine");
                          setTimeout(() => { if (playingRef.current === id) { setPlaying(null); playingRef.current = null; setHighlightedPlanet(null); } }, 10000);
                        }
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-sm border transition-all duration-150 cursor-pointer select-none active:scale-95 ${
                        isHi ? "border-primary bg-primary/10 scale-[1.04] shadow-md" : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30"
                      }`}
                    >
                      <span className="text-lg" style={{ color: SIGN_COLORS[sign] }}>{PLANET_GLYPHS[planet] || "•"}</span>
                      <div className="text-left">
                        <p className="text-[11px] font-medium text-foreground">{label}</p>
                        <p className="text-[9px] text-muted-foreground font-mono">{sign} · {NOTE_NAMES[sign]} · {Math.round(freq)} Hz</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={playNatalChord}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
                    playing === "natal-chord"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {playing === "natal-chord" ? <Square size={14} /> : <Play size={14} />}
                  {playing === "natal-chord" ? "Stop" : "Play Birth Chord"}
                </button>
                <button
                  onClick={playNatalArpeggio}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
                    playing === "natal-arp"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {playing === "natal-arp" ? <Square size={14} /> : <Music size={14} />}
                  {playing === "natal-arp" ? "Stop" : "Play Birth Arpeggio"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground italic">Selected chart has no planet data.</p>
          )}
        </section>
      )}

      {/* ── Section 4: Current Sky as Sound ── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-primary" />
          <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-foreground">Current Sky — What Today Sounds Like</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          These are the live transiting positions right now. Every planet currently occupies a zodiac sign — 
          play the <strong>Sky Chord</strong> to hear all of today's cosmic frequencies simultaneously, 
          or the <strong>Sky Arpeggio</strong> to hear each planet's current voice one by one.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {currentSkyFreqs.map(({ planet, glyph, sign, freq }) => {
            const isHi = skyHighlight === planet || skyHighlight === "all";
            return (
              <div key={planet} className={`flex items-center gap-2 p-2.5 rounded-sm border transition-all duration-200 ${
                isHi ? "border-primary bg-primary/10 scale-[1.04] shadow-md" : "border-border bg-card"
              }`}>
                <span className="text-lg" style={{ color: SIGN_COLORS[sign] }}>{glyph}</span>
                <div>
                  <p className="text-[11px] font-medium text-foreground">{planet}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{sign} · {NOTE_NAMES[sign]} · {Math.round(freq)} Hz</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={playSkyChord}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
              playing === "sky-chord"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {playing === "sky-chord" ? <Square size={14} /> : <Play size={14} />}
            {playing === "sky-chord" ? "Stop" : "Play Sky Chord"}
          </button>
          <button
            onClick={playSkyArpeggio}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs uppercase tracking-widest transition-all border ${
              playing === "sky-arp"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {playing === "sky-arp" ? <Square size={14} /> : <Music size={14} />}
            {playing === "sky-arp" ? "Stop" : "Play Sky Arpeggio"}
          </button>
        </div>
      </section>

      {/* Footer teaching */}
      <div className="text-center text-xs text-muted-foreground/70 pt-4 pb-8 border-t border-border space-y-2">
        <p>Frequencies based on the chromatic zodiac scale: Aries = C4 (261.63 Hz), ascending by semitone.</p>
        <p>This mapping follows the tradition linking the 12 chromatic notes to the 12 zodiac signs, as explored by sound healers and musical astrologers.</p>
      </div>
    </div>
  );
};

// ─── Zodiac Chord Chart: Trines (Elements) & Squares (Modalities) ───

const TRINE_GROUPS: { label: string; emoji: string; signs: ZodiacSign[]; color: string; desc: string }[] = [
  { label: "Fire △", emoji: "🔥", signs: ["Aries", "Leo", "Sagittarius"], color: "hsl(15 80% 55%)", desc: "Creative force, will, spirit — naturally harmonious (major third intervals)" },
  { label: "Earth △", emoji: "🌍", signs: ["Taurus", "Virgo", "Capricorn"], color: "hsl(100 40% 40%)", desc: "Material world, body, resources — grounded stability" },
  { label: "Air △", emoji: "💨", signs: ["Gemini", "Libra", "Aquarius"], color: "hsl(200 60% 55%)", desc: "Mind, connection, ideas — light, crystalline resonance" },
  { label: "Water △", emoji: "💧", signs: ["Cancer", "Scorpio", "Pisces"], color: "hsl(220 60% 45%)", desc: "Emotion, intuition, the unconscious — deep flowing tones" },
];

const SQUARE_GROUPS: { label: string; emoji: string; signs: ZodiacSign[]; color: string; desc: string }[] = [
  { label: "Cardinal □", emoji: "⚡", signs: ["Aries", "Cancer", "Libra", "Capricorn"], color: "hsl(0 70% 50%)", desc: "Initiators — action, beginnings, leadership. 90° tension that drives change." },
  { label: "Fixed □", emoji: "🗿", signs: ["Taurus", "Leo", "Scorpio", "Aquarius"], color: "hsl(35 70% 50%)", desc: "Stabilizers — persistence, depth, resistance. Stubborn dissonance." },
  { label: "Mutable □", emoji: "🌊", signs: ["Gemini", "Virgo", "Sagittarius", "Pisces"], color: "hsl(270 50% 55%)", desc: "Adapters — flexibility, change, transitions. Restless shifting tones." },
];

interface ChordChartProps {
  playing: string | null;
  highlightedPlanet?: string | null;
  onPlayGroup: (id: string, signs: ZodiacSign[], duration?: number, waveform?: OscillatorType) => void;
  onPlaySingleSign: (sign: ZodiacSign) => void;
  onPlayGuidedTour?: () => void;
}

function ZodiacChordChart({ playing, highlightedPlanet, onPlayGroup, onPlaySingleSign, onPlayGuidedTour }: ChordChartProps) {
  const [expandedTrine, setExpandedTrine] = useState<string | null>(null);
  const [expandedSquare, setExpandedSquare] = useState<string | null>(null);

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-primary" />
        <h3 className="text-xs uppercase tracking-[0.2em] font-medium text-foreground">Zodiac Chord Chart</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        The zodiac organizes into natural chords. <strong>Trines</strong> (△ 120° apart) share an element — 
        they sound consonant and harmonious, like a major chord. <strong>Squares</strong> (□ 90° apart) share a modality — 
        they create tension and friction, like dissonant intervals clashing and driving forward.
      </p>

      {/* Note about Aspect □ vs Modality □ */}
      <div className="p-3 rounded-sm border border-border bg-card/50 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">□ Aspect Interval vs □ Modality Chord:</strong> The <em>Aspect Interval</em> section above plays a generic square interval — just two notes 3 semitones apart (C + D♯) — demonstrating what 90° <em>sounds like</em> as a pure interval. 
        The <em>Modality Chords</em> below play the <strong>actual signs</strong> that form squares around the wheel (e.g., Cardinal = Aries + Cancer + Libra + Capricorn) — all 4 notes together, showing how the real zodiac tensions stack up as a full chord.
      </div>

      {/* ── Visual Wheel Diagram ── */}
      <div className="flex justify-center">
        <ZodiacWheelDiagram playing={playing} onPlayGroup={onPlayGroup} onPlaySingleSign={onPlaySingleSign} />
      </div>

      {/* ── Trines (Elements) ── */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
          △ Trines — Element Chords <span className="text-muted-foreground/50">(harmony)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRINE_GROUPS.map(g => {
            const id = `trine-${g.label}`;
            const isExpanded = expandedTrine === g.label;
            return (
              <div key={g.label} className={`rounded-sm border transition-all duration-300 ${
                playing === id || g.signs.some(s => playing === `${id}-${s}`) ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/30"
              }`}>
                <div className="flex items-center gap-2 p-4 pb-2">
                  <button
                    onClick={() => onPlayGroup(id, g.signs, 4, "sine")}
                    className="group flex-1 text-left"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{g.emoji} {g.label}</span>
                      {playing === id ? <Square size={14} className="text-primary" /> : <Play size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />}
                    </div>
                  </button>
                  <button
                    onClick={() => setExpandedTrine(isExpanded ? null : g.label)}
                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border rounded-sm"
                  >
                    {isExpanded ? "▾ Less" : "▸ Solo"}
                  </button>
                </div>
                <div className="px-4 pb-2">
                  <p className="text-[10px] text-muted-foreground font-mono mb-1">
                    {g.signs.map(s => `${SIGN_GLYPHS[s]} ${s} (${NOTE_NAMES[s]})`).join(" · ")}
                  </p>
                  <p className="text-xs text-muted-foreground">{g.desc}</p>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-border/50 flex flex-wrap gap-2">
                    {g.signs.map(s => {
                      const soloId = `${id}-${s}`;
                      return (
                        <button
                          key={s}
                          onClick={() => onPlaySingleSign(s)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs border transition-all ${
                            playing === s ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span style={{ color: SIGN_COLORS[s] }}>{SIGN_GLYPHS[s]}</span>
                          <span>{s}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{NOTE_NAMES[s]}</span>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => onPlayGroup(id, g.signs, 4, "sine")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs border transition-all ${
                        playing === id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Music size={12} /> All Together
                    </button>
                  </div>
                )}
                {(playing === id || g.signs.some(s => playing === s)) && <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Squares (Modalities) ── */}
      <div>
        <h4 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex items-center gap-2">
          □ Squares — Modality Chords <span className="text-muted-foreground/50">(tension)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SQUARE_GROUPS.map(g => {
            const id = `square-${g.label}`;
            const isExpanded = expandedSquare === g.label;
            return (
              <div key={g.label} className={`rounded-sm border transition-all duration-300 ${
                playing === id || g.signs.some(s => playing === `${id}-${s}`) ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/30"
              }`}>
                <div className="flex items-center gap-2 p-4 pb-2">
                  <button
                    onClick={() => onPlayGroup(id, g.signs, 4, "sawtooth")}
                    className="group flex-1 text-left"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{g.emoji} {g.label}</span>
                      {playing === id ? <Square size={14} className="text-primary" /> : <Play size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />}
                    </div>
                  </button>
                  <button
                    onClick={() => setExpandedSquare(isExpanded ? null : g.label)}
                    className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border rounded-sm"
                  >
                    {isExpanded ? "▾ Less" : "▸ Solo"}
                  </button>
                </div>
                <div className="px-4 pb-2">
                  <p className="text-[10px] text-muted-foreground font-mono mb-1">
                    {g.signs.map(s => `${SIGN_GLYPHS[s]} ${s} (${NOTE_NAMES[s]})`).join(" · ")}
                  </p>
                  <p className="text-xs text-muted-foreground">{g.desc}</p>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-border/50 flex flex-wrap gap-2">
                    {g.signs.map(s => (
                      <button
                        key={s}
                        onClick={() => onPlaySingleSign(s)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs border transition-all ${
                          playing === s ? "border-primary bg-primary/10 text-foreground" : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span style={{ color: SIGN_COLORS[s] }}>{SIGN_GLYPHS[s]}</span>
                        <span>{s}</span>
                        <span className="text-[9px] font-mono text-muted-foreground">{NOTE_NAMES[s]}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => onPlayGroup(id, g.signs, 4, "sawtooth")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs border transition-all ${
                        playing === id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Music size={12} /> All Together
                    </button>
                  </div>
                )}
                {(playing === id || g.signs.some(s => playing === s)) && <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Guided Tour Button */}
      {onPlayGuidedTour && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onPlayGuidedTour}
            className={`flex items-center gap-2 px-6 py-3 rounded-sm text-xs uppercase tracking-widest transition-all border ${
              playing === "guided-tour"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {playing === "guided-tour" ? <Square size={14} /> : <Sparkles size={14} />}
            {playing === "guided-tour" ? "Stop Tour" : "🎵 Guided Sonic Tour — All Trines → All Squares"}
          </button>
          {playing === "guided-tour" && highlightedPlanet && (
            <span className="ml-3 text-xs text-primary animate-pulse self-center">
              {highlightedPlanet.replace('tour-trine-', '△ ').replace('tour-square-', '□ ')}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Interactive Zodiac Wheel Diagram ───
// SVG wheel showing all 12 signs with colored lines for trines and squares

function ZodiacWheelDiagram({ playing, onPlayGroup, onPlaySingleSign }: ChordChartProps) {
  const size = 440;
  const cx = size / 2;
  const cy = size / 2;
  const r = 155;
  const glyphR = r + 32;
  const hitR = r + 32; // clickable glyph area radius

  const signPositions = SIGNS.map((sign, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    return {
      sign,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      gx: cx + glyphR * Math.cos(angle),
      gy: cy + glyphR * Math.sin(angle),
    };
  });

  const trineLines = TRINE_GROUPS.map(g => ({
    ...g,
    indices: g.signs.map(s => SIGNS.indexOf(s)),
    id: `trine-${g.label}`,
  }));

  const squareLines = SQUARE_GROUPS.map(g => ({
    ...g,
    indices: g.signs.map(s => SIGNS.indexOf(s)),
    id: `square-${g.label}`,
  }));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />

      {/* Trine triangles — solid lines, click to play all together */}
      {trineLines.map(t => {
        const pts = t.indices.map(i => signPositions[i]);
        const d = `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
        const isActive = playing === t.id;
        return (
          <g key={t.id}>
            {/* Invisible wider hit area for easier clicking */}
            <path d={d} fill="none" stroke="transparent" strokeWidth="14"
              className="cursor-pointer" onClick={() => onPlayGroup(t.id, t.signs, 6, "sine")} />
            <path d={d}
              fill={isActive ? t.color.replace(')', ' / 0.12)').replace('hsl', 'hsl') : "none"}
              stroke={t.color} strokeWidth={isActive ? 3 : 1.5} opacity={isActive ? 1 : 0.45}
              className="cursor-pointer pointer-events-none" />
            {isActive && (
              <path d={d} fill="none" stroke={t.color} strokeWidth="5" opacity="0.2">
                <animate attributeName="opacity" values="0.2;0.4;0.2" dur="1.5s" repeatCount="indefinite" />
              </path>
            )}
          </g>
        );
      })}

      {/* Square lines — dashed, click to play all together */}
      {squareLines.map(s => {
        const pts = s.indices.map(i => signPositions[i]);
        const d = `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
        const isActive = playing === s.id;
        return (
          <g key={s.id}>
            <path d={d} fill="none" stroke="transparent" strokeWidth="14"
              className="cursor-pointer" onClick={() => onPlayGroup(s.id, s.signs, 5, "sawtooth")} />
            <path d={d}
              fill={isActive ? s.color.replace(')', ' / 0.08)').replace('hsl', 'hsl') : "none"}
              stroke={s.color} strokeWidth={isActive ? 2.5 : 1} opacity={isActive ? 1 : 0.3}
              strokeDasharray="6 4" className="pointer-events-none" />
          </g>
        );
      })}

      {/* Sign glyphs — clickable circles for individual tones */}
      {signPositions.map((pos, i) => {
        const sign = SIGNS[i];
        const isPlaying = playing === sign;
        const isHighlighted = isPlaying ||
          TRINE_GROUPS.some(g => playing === `trine-${g.label}` && g.signs.includes(sign)) ||
          SQUARE_GROUPS.some(g => playing === `square-${g.label}` && g.signs.includes(sign));
        return (
          <g key={sign} className="cursor-pointer" onClick={() => onPlaySingleSign(sign)}>
            {/* Large invisible hit area */}
            <circle cx={pos.gx} cy={pos.gy} r={18} fill="transparent" />
            {/* Glow ring on hover/active */}
            <circle cx={pos.gx} cy={pos.gy} r={15}
              fill={isHighlighted ? SIGN_COLORS[sign].replace(')', ' / 0.15)').replace('hsl', 'hsl') : "transparent"}
              stroke={isHighlighted ? SIGN_COLORS[sign] : "hsl(var(--border))"}
              strokeWidth={isHighlighted ? 2 : 0.5}
              opacity={isHighlighted ? 1 : 0.4}
            >
              {isPlaying && <animate attributeName="r" values="15;17;15" dur="0.8s" repeatCount="indefinite" />}
            </circle>
            {/* Dot on the wheel */}
            <circle cx={pos.x} cy={pos.y} r={isHighlighted ? 5 : 3} fill={SIGN_COLORS[sign]} opacity={isHighlighted ? 1 : 0.6}>
              {isHighlighted && <animate attributeName="r" values="5;7;5" dur="1s" repeatCount="indefinite" />}
            </circle>
            {/* Glyph text */}
            <text x={pos.gx} y={pos.gy} textAnchor="middle" dominantBaseline="central"
              fontSize={isHighlighted ? "18" : "15"}
              fill={isHighlighted ? SIGN_COLORS[sign] : "hsl(var(--muted-foreground))"}
              className="select-none" fontWeight={isPlaying ? "bold" : "normal"}
              style={{ transition: 'font-size 0.2s, fill 0.2s' }}>
              {SIGN_GLYPHS[sign]}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <text x={cx} y={size - 6} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" opacity="0.5">
        click glyphs = solo · click lines = full chord
      </text>
    </svg>
  );
}

export default CosmicSoundsView;
