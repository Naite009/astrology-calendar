import { describe, it, expect } from "vitest";
import { detectChartSignature } from "../portraitSignature";

// Minimal chart shape — only the fields the detector reads.
const makeChart = (planets: Record<string, { sign: string; house?: number }>) =>
  ({ planets } as any);

describe("detectChartSignature", () => {
  it("returns default signature for an empty chart", () => {
    const sig = detectChartSignature(undefined, []);
    expect(sig.authority).toBe("default");
    expect(sig.mutualReceptionPair).toBeNull();
    expect(sig.saturnCentral).toBe(false);
    expect(sig.chironCentral).toBe(false);
    expect(sig.marsDominant).toBe(false);
  });

  it("detects Mercury–Saturn mutual reception (Ben pattern)", () => {
    // Mercury in Capricorn (ruled by Saturn), Saturn in Gemini/Virgo (ruled by Mercury)
    const chart = makeChart({
      Mercury: { sign: "Capricorn", house: 3 },
      Saturn: { sign: "Virgo", house: 12 },
    });
    const sig = detectChartSignature(chart, []);
    expect(sig.mutualReceptionPair).toBe("merc-sat");
    expect(sig.authority).toBe("merc-sat-reception");
    expect(sig.saturnCentral).toBe(true);
  });

  it("detects Mercury–Jupiter reception + Mars dominance (Ike pattern)", () => {
    const chart = makeChart({
      Mercury: { sign: "Pisces", house: 4 },
      Jupiter: { sign: "Virgo", house: 10 },
      Mars: { sign: "Aries", house: 1 },
      Sun: { sign: "Scorpio", house: 1 },
      Pluto: { sign: "Scorpio", house: 1 },
    });
    const tight = [{ a: "Sun", b: "Pluto", aspect: "conjunction", orb: 1.2 }];
    const sig = detectChartSignature(chart, tight);
    expect(sig.mutualReceptionPair).toBe("merc-jup");
    expect(sig.marsDominant).toBe(true);
    expect(sig.ikeAuthorityPattern).toBe(true);
  });

  it("does not flag ikeAuthorityPattern for unrelated charts (Lauren-style)", () => {
    const chart = makeChart({
      Mercury: { sign: "Leo", house: 5 },
      Venus: { sign: "Cancer", house: 4 },
      Mars: { sign: "Libra", house: 7 },
    });
    const sig = detectChartSignature(chart, []);
    expect(sig.ikeAuthorityPattern).toBe(false);
    expect(sig.marsDominant).toBe(false);
  });

  it("detects Mercury 12th house anchor", () => {
    const chart = makeChart({ Mercury: { sign: "Pisces", house: 12 } });
    const sig = detectChartSignature(chart, []);
    expect(sig.mercury12th).toBe(true);
  });
});
