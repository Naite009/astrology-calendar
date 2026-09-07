/**
 * Deterministic guard for interpretive copy.
 *
 * The prompt-level standard tells the model what to do; this checks the text that
 * actually came out. It runs on AI output and on template-generated copy alike, so
 * a regression in either surfaces as a named finding instead of a vibe.
 *
 * Findings are advisory by default (features decide whether to block), but the
 * `pathology` and `determinism` categories are hard errors — those are the safety
 * rules, not style preferences.
 */

export type GuardCategory =
  | 'pathology'
  | 'determinism'
  | 'essentializing'
  | 'unsupported_claim'
  | 'filler'
  | 'flattening';

export interface GuardFinding {
  category: GuardCategory;
  severity: 'error' | 'warning';
  message: string;
  excerpt: string;
}

export interface GuardResult {
  findings: GuardFinding[];
  errorCount: number;
  warningCount: number;
  ok: boolean;
}

const excerpt = (text: string, index: number, len: number): string => {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + len + 40);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).replace(/\s+/g, ' ').trim()}${end < text.length ? '…' : ''}`;
};

interface Rule {
  category: GuardCategory;
  severity: 'error' | 'warning';
  pattern: RegExp;
  message: string;
}

/**
 * Diagnosis / pathology claims. Only flagged in the second person or as a
 * definite statement about the person; quoting the words in a rule block or in a
 * "never say" instruction is not what this scans.
 */
const RULES: Rule[] = [
  // --- Safety: pathology, diagnosis, trauma inference -----------------------
  {
    category: 'pathology', severity: 'error',
    pattern: /\b(you|he|she|they)\s+(are|is|has|have)\s+(a\s+)?(narcissist|narcissistic|manipulative|abusive|toxic|obsessive|controlling|deceptive|bipolar|autistic|adhd|neurodivergent|depressed|an addict|traumatized|codependent|avoidant|anxiously attached)\b/i,
    message: 'States a pathology/diagnosis label as fact about the person.',
  },
  {
    category: 'pathology', severity: 'error',
    pattern: /\b(childhood|early|core|attachment|ancestral|generational)\s+(trauma|wound|wounding|abuse|neglect)\b/i,
    message: 'Infers trauma, abuse, or neglect from the chart.',
  },
  {
    category: 'pathology', severity: 'error',
    pattern: /\byou (were|have been) (abused|neglected|abandoned|traumatized)\b/i,
    message: 'Asserts a life-history event the chart cannot show.',
  },
  {
    category: 'pathology', severity: 'error',
    pattern: /\b(the chart|this chart|your chart) (shows|proves|confirms) (trauma|abuse|addiction|mental illness|a disorder)\b/i,
    message: 'Claims the chart proves a clinical or life-history fact.',
  },

  // --- Safety: determinism -------------------------------------------------
  {
    category: 'determinism', severity: 'error',
    pattern: /\b(you are destined to|this guarantees|this means you will|you will always|you will never|it is inevitable that you)\b/i,
    message: 'Deterministic phrasing about a human trait or outcome.',
  },
  {
    category: 'determinism', severity: 'warning',
    pattern: /\byou (always|never) (feel|need|want|do|say|react|choose|attract)\b/i,
    message: 'Absolute always/never claim about behavior; use a tendency instead.',
  },

  // --- Quality: essentializing, filler, flattening --------------------------
  {
    category: 'essentializing', severity: 'warning',
    pattern: /\b(this is (just )?who you are|that is (just )?who you are|this is your fate|you cannot change this)\b/i,
    message: 'Identity-essentializing phrasing; prefer "this can show up as".',
  },
  {
    category: 'filler', severity: 'warning',
    pattern: /\byou are (a )?(very )?(powerful|sensitive|intuitive|special|magical|deeply spiritual)\b(?![^.]{0,120}\b(because|with|from|thanks to|Moon|Sun|Venus|Mars|Saturn|Mercury|Jupiter|house|square|trine|opposition|conjunction)\b)/i,
    message: 'Generic trait filler with no chart factor attached in the same sentence.',
  },
  {
    category: 'flattening', severity: 'warning',
    pattern: /\b(as a|being a|typical) (aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces),? (you|he|she|they) (are|is|always|never)\b/i,
    message: 'Flattens the person to a single sign.',
  },
];

/** Sentences that reference at least one concrete chart factor. */
const CHART_FACTOR = /\b(sun|moon|mercury|venus|mars|jupiter|saturn|uranus|neptune|pluto|chiron|ascendant|rising|midheaven|node|house|aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces|square|trine|sextile|opposition|conjunct|conjunction|retrograde|stellium|ruler|cusp|decan|dignity|profection)\b/i;

/** Claims strong enough that they need a chart factor nearby. */
const STRONG_CLAIM = /\b(you|he|she|they)\s+(are|is|have|has)\s+(deeply|profoundly|extremely|fundamentally|inherently)\b/i;

export interface GuardOptions {
  /**
   * Require that the copy names chart factors somewhere. Off for surfaces that
   * are deliberately jargon-free by design (plain_human voice).
   */
  requireChartFactors?: boolean;
}

export function lintInterpretiveText(text: string, opts: GuardOptions = {}): GuardResult {
  const findings: GuardFinding[] = [];
  const body = text || '';

  for (const rule of RULES) {
    const rx = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = rx.exec(body)) !== null) {
      findings.push({
        category: rule.category,
        severity: rule.severity,
        message: rule.message,
        excerpt: excerpt(body, m.index, m[0].length),
      });
      if (m[0].length === 0) break;
    }
  }

  // Strong claims with no supporting factor in the same sentence.
  for (const sentence of body.split(/(?<=[.!?])\s+/)) {
    if (STRONG_CLAIM.test(sentence) && !CHART_FACTOR.test(sentence)) {
      findings.push({
        category: 'unsupported_claim',
        severity: 'warning',
        message: 'Emphatic claim with no chart factor named in the same sentence.',
        excerpt: sentence.trim().slice(0, 160),
      });
    }
  }

  if (opts.requireChartFactors && body.trim().length > 200 && !CHART_FACTOR.test(body)) {
    findings.push({
      category: 'unsupported_claim',
      severity: 'error',
      message: 'Interpretation names no chart factor at all; nothing is traceable.',
      excerpt: body.trim().slice(0, 160),
    });
  }

  const errorCount = findings.filter(f => f.severity === 'error').length;
  return {
    findings,
    errorCount,
    warningCount: findings.length - errorCount,
    ok: errorCount === 0,
  };
}

/** Convenience: true when the copy carries no safety-level violation. */
export function isInterpretationSafe(text: string): boolean {
  return lintInterpretiveText(text).ok;
}
