/**
 * Synastry PDF Export
 * Creates a professional printable PDF summary of relationship analysis
 */

import { useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { AdvancedSynastryReport, HouseOverlay, KarmicIndicator } from '@/lib/synastryAdvanced';
import { FocusAnalysis } from '@/lib/relationshipFocusAnalysis';
import { RelationshipFocus } from '@/lib/focusAwareInterpretations';
import { Button } from '@/components/ui/button';
import { FileDown, Printer, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface SynastryPDFExportProps {
  chart1: NatalChart;
  chart2: NatalChart;
  report: AdvancedSynastryReport;
  focusAnalysis: FocusAnalysis | null;
  houseOverlays: HouseOverlay[];
  karmicIndicators: KarmicIndicator[];
  focus: RelationshipFocus;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', SouthNode: '☋', Chiron: '⚷'
};

export const SynastryPDFExport = ({
  chart1,
  chart2,
  report,
  focusAnalysis,
  houseOverlays,
  karmicIndicators,
  focus
}: SynastryPDFExportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handlePrint = () => {
    setIsGenerating(true);
    
    // Create printable content
    const printContent = generatePrintableHTML(
      chart1, chart2, report, focusAnalysis, houseOverlays, karmicIndicators, focus
    );
    
    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        setIsGenerating(false);
      }, 500);
    } else {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button onClick={handlePrint} disabled={isGenerating} variant="outline" className="gap-2">
      {isGenerating ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Printer size={14} />
      )}
      Print / Export PDF
    </Button>
  );
};

function generatePrintableHTML(
  chart1: NatalChart,
  chart2: NatalChart,
  report: AdvancedSynastryReport,
  focusAnalysis: FocusAnalysis | null,
  houseOverlays: HouseOverlay[],
  karmicIndicators: KarmicIndicator[],
  focus: RelationshipFocus
): string {
  const focusTitle = focus === 'all' ? 'Comprehensive' : focus.charAt(0).toUpperCase() + focus.slice(1);
  const today = format(new Date(), 'MMMM d, yyyy');
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${focusTitle} Relationship Analysis: ${chart1.name} & ${chart2.name}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      line-height: 1.6;
      color: #1a1a1a;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      border-bottom: 2px solid #8b5cf6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 28px;
      color: #4c1d95;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 18px;
      color: #6b7280;
    }
    
    .header .date {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 8px;
    }
    
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    
    .section h2 {
      font-size: 18px;
      color: #4c1d95;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    
    .section h3 {
      font-size: 14px;
      color: #374151;
      margin: 12px 0 8px 0;
    }
    
    .score-box {
      text-align: center;
      background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    
    .score-box .score {
      font-size: 48px;
      font-weight: bold;
      color: #7c3aed;
    }
    
    .score-box .label {
      font-size: 14px;
      color: #6b7280;
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
    }
    
    .card-title {
      font-weight: bold;
      font-size: 14px;
      color: #1f2937;
      margin-bottom: 8px;
    }
    
    .card-content {
      font-size: 13px;
      color: #4b5563;
    }
    
    .indicator-list {
      list-style: none;
    }
    
    .indicator-list li {
      padding: 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    
    .indicator-list .name {
      font-weight: bold;
      font-size: 14px;
      color: #1f2937;
    }
    
    .indicator-list .interpretation {
      font-size: 12px;
      color: #4b5563;
      margin-top: 4px;
    }
    
    .indicator-list .badge {
      display: inline-block;
      background: #8b5cf6;
      color: white;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 8px;
    }
    
    .indicator-list .badge.absent {
      background: #9ca3af;
    }
    
    .indicator-list .badge.strong {
      background: #10b981;
    }
    
    .indicator-list .badge.moderate {
      background: #f59e0b;
    }
    
    .house-overlay {
      padding: 18px 20px;
      background: #f8fbff;
      border-left: 4px solid #60a5fa;
      border-radius: 0 10px 10px 0;
      margin-bottom: 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }
    
    .house-overlay .overlay-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    
    .house-overlay .overlay-planet {
      font-size: 15px;
      font-weight: bold;
      color: #1e40af;
    }
    
    .house-overlay .overlay-arrow {
      font-size: 18px;
      color: #93c5fd;
    }
    
    .house-overlay .overlay-house {
      font-size: 15px;
      font-weight: bold;
      color: #1e3a5f;
    }
    
    .house-overlay .overlay-owner {
      font-size: 11px;
      color: #64748b;
      font-style: italic;
    }
    
    .house-overlay .overlay-interp {
      font-size: 13px;
      color: #334155;
      line-height: 1.7;
    }
    
    .karmic-indicator {
      padding: 12px;
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    
    .recommendations {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 16px;
    }
    
    .recommendations ul {
      margin-left: 20px;
    }
    
    .recommendations li {
      font-size: 13px;
      color: #166534;
      margin-bottom: 6px;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 11px;
      color: #9ca3af;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${focusTitle} Relationship Analysis</h1>
    <div class="subtitle">${chart1.name} & ${chart2.name}</div>
    <div class="date">Generated on ${today}</div>
  </div>
  
  <div class="section">
    <div class="score-box">
      <div class="score">${report.overallCompatibility}%</div>
      <div class="label">Overall Compatibility</div>
    </div>
    <p style="text-align: center; color: #4b5563; font-size: 14px;">${report.whyDrawnTogether}</p>
  </div>
  
  ${focusAnalysis ? `
  <div class="section">
    <h2>${focusAnalysis.title}</h2>
    <div class="score-box" style="padding: 16px;">
      <div class="score" style="font-size: 36px;">${focusAnalysis.overallStrength}%</div>
      <div class="label">${focus.charAt(0).toUpperCase() + focus.slice(1)} Partnership Score</div>
    </div>
    <p style="font-size: 14px; color: #4b5563; margin-bottom: 16px;">${focusAnalysis.summary}</p>
    
    <h3>Key Indicators</h3>
    <ul class="indicator-list">
      ${focusAnalysis.indicators.slice(0, 8).map(ind => `
        <li>
          <span class="name">${ind.name}</span>
          <span class="badge ${ind.strength}">${ind.strength}</span>
          ${ind.aspect ? `<span class="badge">${ind.aspect.type} (${ind.aspect.orb}°)</span>` : ''}
          <div class="interpretation">${ind.interpretation}</div>
        </li>
      `).join('')}
    </ul>
    
    ${focusAnalysis.recommendations.length > 0 ? `
    <div class="recommendations">
      <h3 style="margin-top: 0; color: #166534;">Recommendations</h3>
      <ul>
        ${focusAnalysis.recommendations.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
  </div>
  ` : ''}
  
  <div class="section">
    <h2>Relationship Type Compatibility</h2>
    <div class="grid">
      ${report.bestRelationshipTypes.slice(0, 6).map(type => `
        <div class="card">
          <div class="card-title">${type.icon} ${type.label} - ${type.score}%</div>
          <div class="card-content">${type.description}</div>
        </div>
      `).join('')}
    </div>
  </div>
  
  ${houseOverlays.length > 0 ? `
  <div class="section">
    <h2>House Overlays</h2>
    <p style="font-size: 13px; color: #64748b; margin-bottom: 16px; line-height: 1.6;">
      When one person's planet lands in another person's house, it activates that life area between you.
      These are the strongest activations in your charts.
    </p>
    ${houseOverlays.slice(0, 8).map(overlay => `
      <div class="house-overlay">
        <div class="overlay-header">
          <span class="overlay-owner">${overlay.planetOwner}'s</span>
          <span class="overlay-planet">${overlay.planet}</span>
          <span class="overlay-arrow">&rarr;</span>
          <span class="overlay-house">${overlay.houseOwner}'s ${overlay.house}${overlay.house === 1 ? 'st' : overlay.house === 2 ? 'nd' : overlay.house === 3 ? 'rd' : 'th'} House</span>
        </div>
        <div class="overlay-interp">${overlay.interpretation}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  ${karmicIndicators.length > 0 ? `
  <div class="section">
    <h2>Soul Connections & Karmic Indicators</h2>
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">
      ${report.soulContractTheme}
    </p>
    ${karmicIndicators.slice(0, 6).map(k => `
      <div class="karmic-indicator">
        <div class="card-title">${k.name} (${k.aspectType})</div>
        <div class="card-content">${k.interpretation}</div>
        <div style="font-size: 11px; color: #7c3aed; margin-top: 8px;">💡 Lesson: ${k.lessonToLearn}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  <div class="section">
    <h2>Growth Opportunities</h2>
    <div class="grid">
      <div class="card">
        <div class="card-title">Relationship Purpose</div>
        <div class="card-content">${report.relationshipPurpose}</div>
      </div>
      <div class="card">
        <div class="card-title">Key Areas for Growth</div>
        <div class="card-content">
          <ul style="margin-left: 16px; font-size: 12px;">
            ${report.growthOpportunities.slice(0, 4).map(g => `<li>${g}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </div>
  
  ${report.watchOutFor.length > 0 ? `
  <div class="section">
    <h2>Points of Awareness</h2>
    <div class="card" style="background: #fffbeb; border-color: #fcd34d;">
      <ul style="margin-left: 16px; font-size: 13px; color: #92400e;">
        ${report.watchOutFor.slice(0, 4).map(w => `<li>${w}</li>`).join('')}
      </ul>
    </div>
  </div>
  ` : ''}
  
  <div class="footer">
    <p>This analysis is based on astrological synastry between the provided birth charts.</p>
    <p>Generated by Cosmic Calendar • ${today}</p>
  </div>
</body>
</html>
  `;
}
