import type { NatalChart } from '@/hooks/useNatalChart';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const pos = (n: number) => ({ sign: signs[Math.floor(n / 30)], degree: Math.floor(n % 30), minutes: Math.round((n % 1) * 60) });
export const laurenNatal = {
  id: 'user', name: 'Lauren Newman', birthDate: '1976-10-21', birthTime: '07:12', birthLocation: 'Washington, DC', timezoneId: 'America/New_York', timezoneOffset: -4,
  planets: Object.fromEntries(Object.entries({Sun:208.183333, Moon:183.55, Mercury:196.933333, Venus:240.9, Mars:218.6, Jupiter:59.566667, Saturn:135.6, Uranus:216.883333, Neptune:252.1, Pluto:192.233333, Chiron:29.633333, Ascendant:204.933333}).map(([k,v]) => [k,pos(v)])),
  houseCusps: Object.fromEntries([204.933333,232.95,264.683333,298.85,331.933333,0.883333,24.933333,52.95,84.683333,118.85,151.933333,180.883333].map((n,i) => [`house${i+1}`,pos(n)])),
} as unknown as NatalChart;
export const laurenReturn = {
  ...laurenNatal, id: '1792247780021', name:'SR 2026 Lauren Newman', natalChartId:'user', solarReturnYear:2026, solarReturnLocation:'Washington, DC (US)', solarReturnDateTime:'', timezoneId: undefined, timezoneOffset: undefined,
  planets: Object.fromEntries(Object.entries({Sun:208.183333, Moon:330.633333, Mercury:230.516667, Venus:212.3, Mars:133.2, Jupiter:142.933333, Saturn:9.983333, Uranus:65.016667, Neptune:2.316667, Pluto:303.066667, Chiron:28.55, Ascendant:236.95, NorthNode:328.05, SouthNode:148.05}).map(([k,v]) => [k,{...pos(v), isRetrograde:['Venus','Saturn','Uranus','Neptune','Chiron'].includes(k)}])),
  houseCusps: Object.fromEntries([236.95,267.916667,303.933333,340.433333,11.583333,36.416667,56.95,87.916667,123.933333,160.433333,191.583333,216.416667].map((n,i) => [`house${i+1}`,pos(n)])),
} as SolarReturnChart;
