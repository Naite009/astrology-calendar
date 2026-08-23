import { it } from 'vitest';
import { buildReferenceChart } from '@/lib/qa/accuracyAudit';
import { REFERENCE_PEOPLE } from '@/test/fixtures/referencePeople';
it('dump', () => {
  const c = buildReferenceChart(REFERENCE_PEOPLE[0]);
  console.log(JSON.stringify(c.houseCusps));
  console.log((c as any).derivedBodies);
});
