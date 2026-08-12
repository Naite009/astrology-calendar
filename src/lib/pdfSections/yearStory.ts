/**
 * Year Story PDF sections.
 *
 * generateYearStoryPage      → opens the report with the story of the year
 * generateWhatYouNeedToKnow  → closes the report with the summary and one question
 */

import type jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { buildYearStory, YearStory } from '@/lib/solarReturnYearStory';

const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function generateYearStoryPage(
  ctx: PDFContext,
  doc: jsPDF,
  analysis: SolarReturnAnalysis,
  story?: YearStory,
) {
  const s = story || buildYearStory(analysis);

  ctx.sectionTitle(doc, 'The Story of Your Year', 'What this year is fundamentally about, before the details');
  ctx.writeBody(doc, s.coreStory, ctx.colors.bodyText, 11.5, 18);
  ctx.y += 8;

  if (s.themes.length) {
    ctx.drawGoldRule(doc);
    ctx.writeBold(doc, 'The Themes, In Order Of Weight', ctx.colors.gold, 12);
    ctx.writeBody(
      doc,
      'These are ranked by how many independent chart signatures point to them, not by how many aspects they collect.',
      ctx.colors.muted, 9.5, 14,
    );
    ctx.y += 4;

    s.themes.forEach((theme, i) => {
      ctx.drawCard(doc, () => {
        ctx.writeBold(doc, `${i + 1}. ${theme.title}`, ctx.colors.ink, 11.5);
        ctx.writeBody(doc, theme.summary, ctx.colors.bodyText, 10.5, 16);
        if (theme.signatures.length) {
          ctx.writeBody(
            doc,
            `Why: ${theme.signatures.join(' ')}`,
            ctx.colors.muted, 9, 13,
          );
        }
      });
      ctx.y += 6;
    });
  }

  if (s.hierarchy.length) {
    ctx.drawGoldRule(doc);
    ctx.writeBold(doc, 'What The Chart Emphasises Most', ctx.colors.gold, 12);
    for (const row of s.hierarchy) {
      ctx.writeLabel(doc, row.label, row.detail);
    }
  }
}

export function generateWhatYouNeedToKnow(
  ctx: PDFContext,
  doc: jsPDF,
  analysis: SolarReturnAnalysis,
  story?: YearStory,
) {
  const s = story || buildYearStory(analysis);

  ctx.sectionTitle(doc, 'What You Need To Know', 'The short version, if you read nothing else');

  for (const item of s.whatYouNeedToKnow) {
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, item.heading, ctx.colors.gold, 11);
      ctx.writeBody(doc, item.body, ctx.colors.bodyText, 10.5, 16);
    });
    ctx.y += 6;
  }

  ctx.y += 10;
  ctx.drawGoldRule(doc);
  ctx.writeBold(doc, 'One Question To Carry Through The Year', ctx.colors.gold, 12);
  ctx.writeBody(doc, s.reflectionQuestion, ctx.colors.ink, 13, 20);
}

export { ordinal };
