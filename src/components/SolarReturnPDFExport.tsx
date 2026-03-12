import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

const PLANET_SYMBOLS: Record<string, string> = {
  Sun:'☉', Moon:'☽', Mercury:'☿', Venus:'♀', Mars:'♂',
  Jupiter:'♃', Saturn:'♄', Uranus:'♅', Neptune:'♆', Pluto:'♇',
  Chiron:'⚷', NorthNode:'☊', SouthNode:'☋', Ascendant:'ASC',
  Juno:'⚵', Ceres:'⚳', Pallas:'⚴', Vesta:'🜕', Lilith:'⚸',
};

const SIGN_SYMBOLS: Record<string, string> = {
  Aries:'♈', Taurus:'♉', Gemini:'♊', Cancer:'♋', Leo:'♌', Virgo:'♍',
  Libra:'♎', Scorpio:'♏', Sagittarius:'♐', Capricorn:'♑', Aquarius:'♒', Pisces:'♓',
};

const ordinal = (n: number) => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

interface Props {
  analysis: SolarReturnAnalysis;
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  narrative: string;
}

export const SolarReturnPDFExport = ({ analysis, srChart, natalChart, narrative }: Props) => {
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      // Dynamic import of html2canvas for the PDF generation
      const { default: html2canvas } = await import('html2canvas');
      
      // Create a hidden container with the full report
      const container = document.createElement('div');
      container.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;background:#0a0a0f;color:#e8e0d4;font-family:Georgia,serif;padding:60px;';
      document.body.appendChild(container);

      const a = analysis;
      const name = natalChart.name || 'Chart';
      const year = srChart.solarReturnYear;

      // Build the HTML content
      container.innerHTML = buildReportHTML(a, name, year, narrative, srChart, natalChart);

      // Render to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        backgroundColor: '#0a0a0f',
        useCORS: true,
        logging: false,
      });

      document.body.removeChild(container);

      // Convert to downloadable image (PNG — high quality, universal)
      const link = document.createElement('a');
      link.download = `Solar-Return-${year}-${name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePDF}
      disabled={generating}
      className="text-[11px] uppercase tracking-widest px-3 py-1.5 border border-border rounded-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 disabled:opacity-50"
    >
      {generating ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
      {generating ? 'Generating...' : 'Download Report'}
    </button>
  );
};

function buildReportHTML(
  a: SolarReturnAnalysis,
  name: string,
  year: number,
  narrative: string,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
): string {
  const accent = '#c4956a';
  const bg = '#0a0a0f';
  const cardBg = '#12121a';
  const borderColor = '#2a2a35';
  const textMain = '#e8e0d4';
  const textMuted = '#9a9490';
  const textDim = '#6a6560';

  const sectionTitle = (title: string) => `
    <div style="margin-top:40px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid ${borderColor};">
      <h2 style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${accent};margin:0;font-weight:500;">${title}</h2>
    </div>`;

  const card = (content: string) => `
    <div style="background:${cardBg};border:1px solid ${borderColor};border-radius:4px;padding:20px;margin-bottom:12px;">
      ${content}
    </div>`;

  const planetRow = (planet: string, sign: string, degree: string, house: string | number | null) => `
    <tr style="border-bottom:1px solid ${borderColor};">
      <td style="padding:6px 12px;font-size:13px;color:${textMain};">${PLANET_SYMBOLS[planet] || ''} ${planet}</td>
      <td style="padding:6px 12px;font-size:13px;color:${textMuted};">${SIGN_SYMBOLS[sign] || ''} ${sign}</td>
      <td style="padding:6px 12px;font-size:13px;color:${textMuted};">${degree}</td>
      <td style="padding:6px 12px;font-size:13px;color:${textMuted};">${house ? `House ${house}` : '—'}</td>
    </tr>`;

  // Build planet positions table
  const planetKeys = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];
  let planetRows = '';
  for (const p of planetKeys) {
    const pos = srChart.planets[p as keyof typeof srChart.planets];
    if (pos?.sign) {
      const deg = `${pos.degree}°${pos.minutes ? pos.minutes + "'" : ''}`;
      const house = a.planetSRHouses[p] ?? null;
      planetRows += planetRow(p, pos.sign, deg, house);
    }
  }

  // Build house overlays table
  let overlayRows = '';
  if (a.houseOverlays?.length > 0) {
    for (const o of a.houseOverlays) {
      overlayRows += `
        <tr style="border-bottom:1px solid ${borderColor};">
          <td style="padding:6px 12px;font-size:12px;color:${textMain};">${PLANET_SYMBOLS[o.planet] || ''} ${o.planet}</td>
          <td style="padding:6px 12px;font-size:12px;color:${textMuted};">${o.srSign} ${o.srDegree}</td>
          <td style="padding:6px 12px;font-size:12px;color:${textMuted};">SR House ${o.srHouse || '—'}</td>
          <td style="padding:6px 12px;font-size:12px;color:${textMuted};">Natal House ${o.natalHouse || '—'}</td>
          <td style="padding:6px 8px;font-size:11px;color:${textDim};">${o.houseTheme || ''}</td>
        </tr>`;
    }
  }

  // Moon timing rows
  let moonTimingRows = '';
  if (a.moonTimingEvents?.length > 0) {
    for (const evt of a.moonTimingEvents.slice(0, 12)) {
      moonTimingRows += `
        <tr style="border-bottom:1px solid ${borderColor};">
          <td style="padding:6px 12px;font-size:12px;color:${accent};font-weight:600;">${evt.approximateMonth}</td>
          <td style="padding:6px 12px;font-size:12px;color:${textMain};">☽ ${evt.aspectType} ${PLANET_SYMBOLS[evt.targetPlanet] || ''} ${evt.targetPlanet}</td>
          <td style="padding:6px 12px;font-size:11px;color:${textMuted};">${evt.interpretation}</td>
        </tr>`;
    }
  }

  // Stellium block
  let stelliumBlock = '';
  if (a.stelliums?.length > 0) {
    stelliumBlock = a.stelliums.map(s => {
      const planets = s.planets.map(p => `${PLANET_SYMBOLS[p] || ''} ${p}`).join(', ');
      const extras = s.extras?.length > 0 ? ` (also present: ${s.extras.map(e => `${PLANET_SYMBOLS[e] || ''} ${e}`).join(', ')})` : '';
      return `<p style="font-size:13px;color:${textMain};margin:4px 0;"><strong>${s.planets.length}-Planet Stellium in ${s.location}</strong>: ${planets}${extras}</p>`;
    }).join('');
  }

  // SR-to-Natal aspects
  let aspectRows = '';
  if (a.srToNatalAspects?.length > 0) {
    for (const asp of a.srToNatalAspects.slice(0, 12)) {
      aspectRows += `
        <tr style="border-bottom:1px solid ${borderColor};">
          <td style="padding:4px 12px;font-size:12px;color:${textMain};">SR ${PLANET_SYMBOLS[asp.planet1] || ''} ${asp.planet1}</td>
          <td style="padding:4px 12px;font-size:12px;color:${accent};">${asp.type}</td>
          <td style="padding:4px 12px;font-size:12px;color:${textMain};">Natal ${PLANET_SYMBOLS[asp.planet2] || ''} ${asp.planet2}</td>
          <td style="padding:4px 12px;font-size:12px;color:${textDim};">${asp.orb}° orb</td>
        </tr>`;
    }
  }

  // Natal degree conduits
  let conduitRows = '';
  if (a.natalDegreeConduits?.length > 0) {
    for (const c of a.natalDegreeConduits) {
      conduitRows += `<p style="font-size:12px;color:${textMuted};margin:4px 0;">SR ${PLANET_SYMBOLS[c.srPlanet] || ''} ${c.srPlanet} at ${c.srDegree}° ${c.srSign} ↔ Natal ${PLANET_SYMBOLS[c.natalPlanet] || ''} ${c.natalPlanet} at ${c.natalDegree}° ${c.natalSign} (${c.orb.toFixed(1)}° orb)</p>`;
    }
  }

  // Convert markdown narrative to simple HTML
  const narrativeHTML = narrative
    .replace(/## (.*)/g, `<h3 style="font-size:14px;letter-spacing:2px;text-transform:uppercase;color:${accent};margin-top:24px;margin-bottom:8px;font-weight:500;">$1</h3>`)
    .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${textMain};">$1</strong>`)
    .replace(/\*(.*?)\*/g, `<em>$1</em>`)
    .replace(/\n\n/g, '</p><p style="font-size:13px;line-height:1.8;color:' + textMuted + ';margin:8px 0;">')
    .replace(/\n/g, '<br/>');

  return `
    <!-- Header -->
    <div style="text-align:center;padding-bottom:30px;border-bottom:2px solid ${accent};">
      <h1 style="font-size:28px;letter-spacing:6px;text-transform:uppercase;color:${textMain};margin:0 0 8px 0;font-weight:300;">Solar Return ${year}</h1>
      <p style="font-size:16px;color:${accent};letter-spacing:2px;margin:0 0 4px 0;">${name}</p>
      <p style="font-size:11px;color:${textDim};margin:0;">Born ${natalChart.birthDate || '—'} • ${natalChart.birthLocation || '—'}</p>
      ${srChart.solarReturnLocation ? `<p style="font-size:11px;color:${textDim};margin:4px 0 0 0;">SR Location: ${srChart.solarReturnLocation}</p>` : ''}
    </div>

    <!-- Key Indicators -->
    ${sectionTitle('Year at a Glance')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
      ${card(`
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${textDim};margin:0 0 4px 0;">SR Ascendant</p>
        <p style="font-size:18px;color:${textMain};margin:0;">${SIGN_SYMBOLS[a.yearlyTheme?.ascendantSign || ''] || ''} ${a.yearlyTheme?.ascendantSign || '—'} Rising</p>
        <p style="font-size:11px;color:${textMuted};margin:4px 0 0 0;">Ruler: ${PLANET_SYMBOLS[a.yearlyTheme?.ascendantRuler || ''] || ''} ${a.yearlyTheme?.ascendantRuler || ''} in ${a.yearlyTheme?.ascendantRulerSign || ''}</p>
      `)}
      ${card(`
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${textDim};margin:0 0 4px 0;">SR Ruler in Natal Chart</p>
        ${a.srAscRulerInNatal ? `
          <p style="font-size:18px;color:${textMain};margin:0;">${PLANET_SYMBOLS[a.srAscRulerInNatal.rulerPlanet] || ''} in Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '—'}</p>
          <p style="font-size:11px;color:${textMuted};margin:4px 0 0 0;">${a.srAscRulerInNatal.rulerNatalHouseTheme || ''}</p>
        ` : '<p style="font-size:14px;color:' + textMuted + ';margin:0;">—</p>'}
      `)}
      ${card(`
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${textDim};margin:0 0 4px 0;">Profection Year</p>
        ${a.profectionYear ? `
          <p style="font-size:18px;color:${textMain};margin:0;">House ${a.profectionYear.houseNumber} (Age ${a.profectionYear.age})</p>
          <p style="font-size:11px;color:${textMuted};margin:4px 0 0 0;">Time Lord: ${PLANET_SYMBOLS[a.profectionYear.timeLord] || ''} ${a.profectionYear.timeLord}</p>
        ` : '<p style="font-size:14px;color:' + textMuted + ';margin:0;">—</p>'}
      `)}
      ${card(`
        <p style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${textDim};margin:0 0 4px 0;">Moon</p>
        <p style="font-size:18px;color:${textMain};margin:0;">${SIGN_SYMBOLS[a.moonSign] || ''} ${a.moonSign}</p>
        <p style="font-size:11px;color:${textMuted};margin:4px 0 0 0;">SR House ${a.moonHouse?.house || '—'} • ${a.moonPhase?.phase || ''}</p>
      `)}
    </div>

    <!-- SR Planet Positions -->
    ${sectionTitle('Solar Return Planet Positions')}
    <table style="width:100%;border-collapse:collapse;background:${cardBg};border:1px solid ${borderColor};border-radius:4px;">
      <thead>
        <tr style="border-bottom:2px solid ${borderColor};">
          <th style="padding:8px 12px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${textDim};text-align:left;">Planet</th>
          <th style="padding:8px 12px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${textDim};text-align:left;">Sign</th>
          <th style="padding:8px 12px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${textDim};text-align:left;">Degree</th>
          <th style="padding:8px 12px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${textDim};text-align:left;">House</th>
        </tr>
      </thead>
      <tbody>${planetRows}</tbody>
    </table>

    ${stelliumBlock ? sectionTitle('Stelliums') + card(stelliumBlock) : ''}

    <!-- Where This Year Plays Out -->
    ${a.srAscRulerInNatal ? sectionTitle('Where This Year Plays Out') + card(`
      <p style="font-size:14px;color:${textMain};margin:0 0 8px 0;">
        ${SIGN_SYMBOLS[a.srAscRulerInNatal.srAscSign] || ''} ${a.srAscRulerInNatal.srAscSign} Rising → ${PLANET_SYMBOLS[a.srAscRulerInNatal.rulerPlanet] || ''} ${a.srAscRulerInNatal.rulerPlanet} rules the year
      </p>
      <p style="font-size:12px;color:${textMuted};margin:0 0 8px 0;">
        Your natal ${a.srAscRulerInNatal.rulerPlanet} is in ${SIGN_SYMBOLS[a.srAscRulerInNatal.rulerNatalSign] || ''} ${a.srAscRulerInNatal.rulerNatalSign} in your natal ${ordinal(a.srAscRulerInNatal.rulerNatalHouse || 0)} house
      </p>
      <p style="font-size:13px;color:${textMuted};line-height:1.7;">${a.srAscRulerInNatal.interpretation}</p>
    `) : ''}

    <!-- House Overlays -->
    ${overlayRows ? sectionTitle('House Overlays — SR Planets in Natal Houses') + `
    <table style="width:100%;border-collapse:collapse;background:${cardBg};border:1px solid ${borderColor};border-radius:4px;">
      <thead>
        <tr style="border-bottom:2px solid ${borderColor};">
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Planet</th>
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Position</th>
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">SR House</th>
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Natal House</th>
          <th style="padding:6px 8px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Theme</th>
        </tr>
      </thead>
      <tbody>${overlayRows}</tbody>
    </table>` : ''}

    <!-- Natal Degree Conduits -->
    ${conduitRows ? sectionTitle('Natal Degree Connections') + card(conduitRows) : ''}

    <!-- SR-to-Natal Aspects -->
    ${aspectRows ? sectionTitle('Key SR-to-Natal Aspects') + `
    <table style="width:100%;border-collapse:collapse;background:${cardBg};border:1px solid ${borderColor};border-radius:4px;">
      <thead>
        <tr style="border-bottom:2px solid ${borderColor};">
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">SR Planet</th>
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Aspect</th>
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Natal Planet</th>
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Orb</th>
        </tr>
      </thead>
      <tbody>${aspectRows}</tbody>
    </table>` : ''}

    <!-- Moon Timing -->
    ${moonTimingRows ? sectionTitle('Moon Timing — When Things Happen') + `
    <p style="font-size:11px;color:${textDim};margin-bottom:12px;">The SR Moon advances ~1° per month. When it perfects an aspect to another planet, that month marks a turning point.</p>
    <table style="width:100%;border-collapse:collapse;background:${cardBg};border:1px solid ${borderColor};border-radius:4px;">
      <thead>
        <tr style="border-bottom:2px solid ${borderColor};">
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Month</th>
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Aspect</th>
          <th style="padding:6px 12px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${textDim};text-align:left;">Meaning</th>
        </tr>
      </thead>
      <tbody>${moonTimingRows}</tbody>
    </table>` : ''}

    <!-- Year-Ahead Narrative -->
    ${narrative ? sectionTitle('Year-Ahead Reading') + card(`
      <div style="font-size:13px;line-height:1.8;color:${textMuted};">
        <p style="font-size:13px;line-height:1.8;color:${textMuted};margin:8px 0;">${narrativeHTML}</p>
      </div>
    `) : ''}

    <!-- Footer -->
    <div style="margin-top:40px;padding-top:20px;border-top:1px solid ${borderColor};text-align:center;">
      <p style="font-size:10px;color:${textDim};letter-spacing:2px;text-transform:uppercase;margin:0;">Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>
  `;
}
