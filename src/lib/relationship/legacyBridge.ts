/**
 * Bridge between the legacy relationship UI vocabulary and the canonical
 * relationship context.
 *
 * The legacy screens speak in `RelationshipFocus` ('all' | 'romantic' | ...) and
 * `FamilyRelationshipContext`. The canonical layer speaks in `RelationshipKind`
 * plus an exact `FamilyRelation`. Everything is funnelled through here so there
 * is exactly one place where those vocabularies meet — and so 'all' can never
 * silently become 'romance' again.
 */

import type { RelationshipFocus } from '@/lib/focusAwareInterpretations';
import type { FamilyRelationshipContext, FamilyRelationType } from '@/lib/familyRelationshipTypes';
import type { FamilyRelation, RelationshipKind } from './relationshipContext';

/** Legacy focus → canonical kind. 'all' stays neutral. */
export function kindFromFocus(focus: RelationshipFocus): RelationshipKind {
  switch (focus) {
    case 'romantic':
      return 'romantic';
    case 'friendship':
      return 'friendship';
    case 'business':
      return 'business';
    case 'creative':
      return 'creative';
    case 'family':
      return 'family';
    case 'all':
    default:
      // Neutral. Never romance.
      return 'neutral';
  }
}

const FAMILY_RELATION_MAP: Record<FamilyRelationType, FamilyRelation> = {
  'parent-child': 'parent-child',
  'child-parent': 'parent-child',
  siblings: 'siblings',
  'step-sibling': 'siblings',
  'grandparent-grandchild': 'grandparent-grandchild',
  'grandchild-grandparent': 'grandparent-grandchild',
  'aunt-uncle-niece-nephew': 'extended-family',
  'niece-nephew-aunt-uncle': 'extended-family',
  cousins: 'extended-family',
  'in-law-parent': 'in-law',
  'in-law-child': 'in-law',
  'in-law-sibling': 'in-law',
  'step-parent': 'parent-child',
  'step-child': 'parent-child',
  other: 'other-family',
};

/** Legacy family context → canonical exact relation (null when not chosen yet). */
export function familyRelationFrom(
  ctx: FamilyRelationshipContext | null | undefined
): FamilyRelation | null {
  if (!ctx?.relationType) return null;
  return FAMILY_RELATION_MAP[ctx.relationType] ?? 'other-family';
}

/**
 * Karmic/legacy analysers only accept their own focus union and have no neutral
 * member. Neutral maps to 'friendship' — the least presumptuous of the legacy
 * options — never to 'romance'.
 */
export function legacyKarmicFocus(
  kind: RelationshipKind
): 'romance' | 'friendship' | 'business' | 'family' | 'creative' {
  switch (kind) {
    case 'romantic':
      return 'romance';
    case 'business':
      return 'business';
    case 'creative':
      return 'creative';
    case 'family':
      return 'family';
    case 'friendship':
    case 'neutral':
    default:
      return 'friendship';
  }
}
