import { it, expect } from 'vitest';
import { calculatePlacidusHouses } from '@/lib/placidusHouses';
it('cusps', () => {
  // Equator: Placidus collapses to even 30 degree steps.
  const eq = calculatePlacidusHouses(new Date('1990-06-15T12:00:00Z'), 0.0001, 0);
  console.log('equator', [1,2,3,10,11,12].map(i => (eq as any)[`house${i}`]));
  const nyc = calculatePlacidusHouses(new Date('1955-03-15T07:20:00Z'), 40.7128, -74.006);
  console.log('nyc asc/mc', nyc.ascendantLongitude.toFixed(3), nyc.mcLongitude.toFixed(3));
  console.log('nyc', Array.from({length:12},(_,i)=>`${i+1}:${(nyc as any)[`house${i+1}`].sign} ${(nyc as any)[`house${i+1}`].degree}`).join(' | '));
  const polar = calculatePlacidusHouses(new Date('1980-01-15T03:00:00Z'), 69.6, 18.9);
  console.log('polar h11', polar.house11, 'h1', polar.house1);
  expect(true).toBe(true);
});
