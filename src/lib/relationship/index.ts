/**
 * Canonical relationship / synastry layer.
 *
 * Import relationship logic from here. Legacy modules (synastry.ts,
 * synastryAdvanced.ts, relationshipFocusAnalysis.ts…) are kept for advanced
 * technical tools, but context, aspects, house overlays, scoring, language and
 * the pair reading all come from this folder.
 */

export {
  buildRelationshipContext,
  personContext,
  isSectionVisible,
  needsFamilyRelation,
  FAMILY_RELATION_LABELS,
} from './relationshipContext';
export type {
  RelationshipKind,
  FamilyRelation,
  PersonContext,
  RelationshipContext,
  RelationshipSectionKey,
  BuildContextOptions,
} from './relationshipContext';

export {
  CORE_SYNASTRY_BODIES,
  ADVANCED_SYNASTRY_BODIES,
  PERSONAL_BODIES,
  collectSynastryLongitudes,
  calculateCrossAspects,
  coreAspects,
  rankTopContacts,
  describeAspect,
  involves,
  involvesBoth,
  isAutomaticNodalMirror,
  separationBetween,
} from './synastryEngine';
export type { CrossAspect, CrossAspectOptions, AspectTone, CoreSynastryBody } from './synastryEngine';

export {
  calculateHouseOverlaysAccurate,
  overlaysFor,
  overlayClusters,
  resolveOverlayHouse,
} from './houseOverlayEngine';
export type { HouseOverlayContact, OverlayCluster, OverlayMethod } from './houseOverlayEngine';

export { scoreRelationship } from './contextScoring';
export type { ContextScore, ScoredDimension, DimensionKey, ScoreBand } from './contextScoring';

export {
  sanitizeRelationshipText,
  sanitizeRelationshipDeep,
  findForbiddenRelationshipPhrases,
  collectStrings,
  FORBIDDEN_RELATIONSHIP_PHRASES,
  FORBIDDEN_NON_ROMANTIC_PHRASES,
} from './relationshipLanguage';

export { buildPairReading } from './pairReading';
export type { PairReading, PairSection, ReadingItem, SymbolicLayer, PairReadingOptions } from './pairReading';

// Legacy-vocabulary bridge (focus strings, FamilyRelationshipContext).
export { kindFromFocus, familyRelationFrom, legacyKarmicFocus } from './legacyBridge';

export { describeDirectionalContact, describeDirectionalFromParts, directionalEvidenceLines } from './directionalRoles';
export type { DirectionalContact, DirectionalRole } from './directionalRoles';

export {
  SYMBOLIC_LENS_HEADING,
  SYMBOLIC_LENS_NOTE,
  SYMBOLIC_THEMES,
  FORBIDDEN_SYMBOLIC_PHRASES,
  symbolicTheme,
  symbolicEmphasisLabel,
  symbolicEmphasisLine,
  symbolicShareLine,
} from './symbolicFraming';
export type { SymbolicTheme, SymbolicThemeKey } from './symbolicFraming';
