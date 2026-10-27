/** Pair-only copy is withheld: a valid aspect is not enough to invent its life area or a guaranteed feeling. */
export const aspectTypeMeanings: Record<string,{glyph:string;keyword:string;feeling:string;childExplain:string}>=Object.fromEntries([['Conjunction','☌','Combined'],['Sextile','⚹','Connection'],['Square','□','Adjustment'],['Trine','△','Connection'],['Opposition','☍','Contrast'],['Quincunx','⚻','Adjustment'],['Semi-sextile','⚺','Adjacent']].map(([type,glyph,keyword])=>[type,{glyph,keyword,feeling:'',childExplain:''}]));
export const planetLifeMeanings:Record<string,{rules:string;inYourLife:string;bodyFeeling:string}>={};
export function generateSRtoNatalInterpretation(srPlanet:string,natalPlanet:string,aspectType:string,orb:number):{headline:string;howItFeels:string;whatItMeans:string;whatToDo:string} {
 return {headline:`SR ${srPlanet} ${aspectType} natal ${natalPlanet} (${orb.toFixed(2)}° orb)`,howItFeels:'',whatItMeans:'',whatToDo:''};
}
