export const ASK_VALIDATION_FACTS_START = "VALIDATION_FACTS_JSON_START";
export const ASK_VALIDATION_FACTS_END = "VALIDATION_FACTS_JSON_END";

export type ValidationFacts = {
  version?: number;
  counted_planets?: string[];
  natal_counts?: {
    elements?: Record<string, { count: number; planets?: string[] }>;
    modalities?: Record<string, { count: number; planets?: string[] }>;
    polarity?: Record<string, { count: number; planets?: string[] }>;
    dominant_element?: string | null;
    dominant_modality?: string | null;
    dominant_polarity?: string | null;
  };
  natal_aspects?: Array<{
    point1: string;
    point2: string;
    aspect: string;
    orb: number;
    separation?: number;
  }>;
  natal_aspects_meta?: {
    orb_policy?: Record<string, number>;
    house_system?: string;
    zodiac?: string;
  };
  positions?: Array<{
    name: string;
    sign: string;
    degree: number;
    minutes?: number;
    abs_degree: number;
    house?: number | null;
    is_retrograde?: boolean;
  }>;
};

export const extractValidationFacts = (chartContext?: string): ValidationFacts | null => {
  if (typeof chartContext !== "string" || !chartContext) return null;

  const startIdx = chartContext.indexOf(ASK_VALIDATION_FACTS_START);
  const endIdx = chartContext.indexOf(ASK_VALIDATION_FACTS_END);
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;

  const jsonText = chartContext
    .slice(startIdx + ASK_VALIDATION_FACTS_START.length, endIdx)
    .trim();

  if (!jsonText) return null;

  try {
    const parsed = JSON.parse(jsonText) as ValidationFacts;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    console.warn("[validationFacts] Failed to parse validation facts JSON", error);
    return null;
  }
};
