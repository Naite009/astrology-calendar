// Guide Navigation Utility
// Maps guide sections to view modes and provides bidirectional navigation helpers

export type GuideSection = 
  | "overview" 
  | "colors" 
  | "symbols" 
  | "moonphases" 
  | "retrogrades" 
  | "aspects" 
  | "dignities" 
  | "difficultplacements"
  | "fixedstars" 
  | "divinefeminine" 
  | "venuscycles" 
  | "vocmoon" 
  | "planetaryhours" 
  | "solararc" 
  | "progressions" 
  | "biorhythms"
  | "timing"
  | "patterns"
  | "chartdecoder"
  | "sacredscript"
  | "dwarfplanets"
  | "speeds"
  | "cosmickitchen"
  | "mercuryretrograde";

export type ViewMode = 
  | "month" 
  | "week" 
  | "year" 
  | "annual-tables" 
  | "guide" 
  | "charts" 
  | "timing" 
  | "colors" 
  | "patterns" 
  | "sacred-script" 
  | "voice-memos" 
  | "decoder" 
  | "speeds" 
  | "dwarf-planets"
  | "moon-encyclopedia";

// Maps guide sections to the corresponding app view mode
export const SECTION_TO_VIEW: Record<GuideSection, ViewMode> = {
  overview: "month",
  colors: "colors",
  symbols: "month",
  moonphases: "moon-encyclopedia",
  retrogrades: "month",
  aspects: "month",
  dignities: "decoder",
  difficultplacements: "decoder",
  fixedstars: "month",
  divinefeminine: "month",
  venuscycles: "timing",
  vocmoon: "timing",
  planetaryhours: "timing",
  solararc: "decoder",
  progressions: "decoder",
  biorhythms: "timing",
  timing: "timing",
  patterns: "patterns",
  chartdecoder: "decoder",
  sacredscript: "sacred-script",
  dwarfplanets: "dwarf-planets",
  speeds: "speeds",
  cosmickitchen: "month",
  mercuryretrograde: "guide",
};

// Maps view modes back to a relevant guide section
export const VIEW_TO_SECTION: Record<ViewMode, GuideSection> = {
  month: "overview",
  week: "overview",
  year: "overview",
  "moon-encyclopedia": "moonphases",
  "annual-tables": "overview",
  guide: "overview",
  charts: "overview",
  timing: "timing",
  colors: "colors",
  patterns: "patterns",
  "sacred-script": "sacredscript",
  "voice-memos": "overview",
  decoder: "chartdecoder",
  speeds: "speeds",
  "dwarf-planets": "dwarfplanets",
};

// Navigation item structure for the guide
export interface GuideNavItem {
  key: GuideSection;
  label: string;
  icon?: string;
}

// Ordered list of navigation items for the guide
export const GUIDE_NAV_ITEMS: GuideNavItem[] = [
  { key: "overview", label: "Overview" },
  { key: "symbols", label: "Symbols" },
  { key: "colors", label: "Colors" },
  { key: "moonphases", label: "Moon Phases" },
  { key: "vocmoon", label: "VOC Moon" },
  { key: "planetaryhours", label: "Planetary Hours" },
  { key: "aspects", label: "Aspects" },
  { key: "retrogrades", label: "Retrogrades" },
  { key: "dignities", label: "Dignities" },
  { key: "difficultplacements", label: "Difficult Placements" },
  { key: "fixedstars", label: "Fixed Stars" },
  { key: "venuscycles", label: "Venus Cycles" },
  { key: "solararc", label: "Solar Arc" },
  { key: "progressions", label: "Progressions" },
  { key: "divinefeminine", label: "Divine Feminine" },
  { key: "biorhythms", label: "Biorhythms" },
  { key: "timing", label: "Timing & Electional" },
  { key: "patterns", label: "Patterns & Cycles" },
  { key: "chartdecoder", label: "Chart Decoder" },
  { key: "sacredscript", label: "Sacred Script" },
  { key: "dwarfplanets", label: "Dwarf Planets" },
  { key: "speeds", label: "Planetary Speeds" },
  { key: "cosmickitchen", label: "Cosmic Kitchen" },
  { key: "mercuryretrograde", label: "Mercury Rx" },
];

// Get the view mode to navigate to for a given guide section
export function getViewForSection(section: GuideSection): ViewMode {
  return SECTION_TO_VIEW[section];
}

// Get the guide section to show for a given view mode
export function getSectionForView(view: ViewMode): GuideSection {
  return VIEW_TO_SECTION[view];
}

// Check if a section has a "Try It" navigation (can navigate to a feature)
export function sectionHasTryIt(section: GuideSection): boolean {
  const view = SECTION_TO_VIEW[section];
  // These views can be navigated to from the guide
  return ["colors", "timing", "patterns", "decoder", "sacred-script", "speeds", "dwarf-planets", "moon-phases"].includes(view);
}

// Get the label for the "Try It" button based on section
export function getTryItLabel(section: GuideSection): string {
  const labels: Partial<Record<GuideSection, string>> = {
    colors: "Open Colors",
    biorhythms: "Open Timing",
    timing: "Open Timing",
    patterns: "Open Patterns",
    chartdecoder: "Open Decoder",
    sacredscript: "Open Sacred Script",
    dwarfplanets: "Open TNOs",
    speeds: "Open Speeds",
    moonphases: "Open Moon Phases",
    dignities: "Open Decoder",
    difficultplacements: "Open Decoder",
    solararc: "Open Decoder",
    progressions: "Open Decoder",
    vocmoon: "Open Timing",
    planetaryhours: "Open Timing",
    venuscycles: "Open Timing",
  };
  return labels[section] || "Try It";
}
