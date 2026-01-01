interface MoonPhase {
  icon: string;
  name: string;
}

export const getMoonPhase = (date: Date): MoonPhase => {
  const lunationCycle = 29.530588853;
  const knownNewMoon = new Date(2000, 0, 6, 18, 14);
  const diff = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const phase = (diff % lunationCycle) / lunationCycle;
  const normalizedPhase = phase < 0 ? phase + 1 : phase;

  if (normalizedPhase < 0.0625 || normalizedPhase >= 0.9375) {
    return { icon: "🌑", name: "New Moon" };
  }
  if (normalizedPhase < 0.1875) {
    return { icon: "🌒", name: "Waxing Crescent" };
  }
  if (normalizedPhase < 0.3125) {
    return { icon: "🌓", name: "First Quarter" };
  }
  if (normalizedPhase < 0.4375) {
    return { icon: "🌔", name: "Waxing Gibbous" };
  }
  if (normalizedPhase < 0.5625) {
    return { icon: "🌕", name: "Full Moon" };
  }
  if (normalizedPhase < 0.6875) {
    return { icon: "🌖", name: "Waning Gibbous" };
  }
  if (normalizedPhase < 0.8125) {
    return { icon: "🌗", name: "Last Quarter" };
  }
  return { icon: "🌘", name: "Waning Crescent" };
};
