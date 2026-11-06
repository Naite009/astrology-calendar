import { renderToStaticMarkup } from 'react-dom/server';
import type { ReadingGuide } from './readingGuideEngine';
import { PractitionerWalkthroughSections } from '@/components/PractitionerWalkthroughSections';
import { parseBirthTime } from '@/lib/birthDataNormalization';
import { BirthTimeSensitivityNotice } from '@/components/BirthTimeSensitivityNotice';

function birthTimeLabel(value: string | undefined) {
  const time = value ? parseBirthTime(value) : null;
  if (!time) return 'Birth time not recorded';
  return `${time.hour % 12 || 12}:${String(time.minute).padStart(2, '0')} ${time.hour < 12 ? 'AM' : 'PM'}`;
}

/** Uses the displayed canonical reading, never another interpretation author. */
export function buildWalkthroughDocument(guide: ReadingGuide): string {
  const title = `${guide.subject.name || 'Chart'}: Chart Walkthrough`;
  const content = renderToStaticMarkup(
    <main>
      <header className="document-header">
        <h1>{title}</h1>
        <p>{[guide.subject.birthDate, birthTimeLabel(guide.subject.birthTime), guide.subject.birthLocation].filter(Boolean).join(' · ')}</p>
        <p>Reading level: {guide.age.stage}{guide.age.years != null ? ` · Age ${guide.age.years}` : ''}</p>
      </header>
      <BirthTimeSensitivityNotice record={guide.birthTimeSensitivity} />
      <PractitionerWalkthroughSections reading={guide.practitioner} />
    </main>,
  );
  // React escapes all chart text and names before they enter this document.
  const escapedTitle = renderToStaticMarkup(<title>{title}</title>);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${escapedTitle}
<style>
:root{--paper:#ffffff;--ink:#202622;--muted:#58635b;--accent:#315b47;--rule:#d7dfd9}
*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.7 Georgia,'Times New Roman',serif;letter-spacing:0}
main{max-width:820px;margin:0 auto;padding:36px 28px}h1{font-size:30px;line-height:1.25}h2{font-size:24px;line-height:1.35}h3{font-size:20px;line-height:1.4}h4{font:600 14px/1.5 Arial,sans-serif;color:var(--accent)}
h1,h2,h3,h4{margin:16px 0 10px}p{margin:10px 0}section{margin:30px 0;border-bottom:1px solid var(--rule);padding-bottom:24px}article{margin:22px 0;padding-left:18px;border-left:2px solid var(--rule)}
li{margin:10px 0}ul,ol{padding-left:24px}h3>span{margin-right:8px}section>ol{list-style:none;padding-left:0}.document-header{border-bottom:2px solid var(--accent);padding-bottom:18px}.document-header p,summary{font-family:Arial,sans-serif;color:var(--muted)}
details{margin:14px 0;font-size:15px}summary{cursor:pointer;font-size:14px;color:var(--accent)}details[open]{padding-bottom:10px}aside{border-left:3px solid var(--accent);padding:8px 16px;color:var(--muted)}svg{display:none}
@media(max-width:600px){main{padding:20px 16px}h1{font-size:26px}body{font-size:16px}}
@media print{@page{size:A4;margin:16mm}main{max-width:none;padding:0}body{font-size:11pt;line-height:1.5}h1{font-size:22pt}h2{font-size:17pt}h3{font-size:14pt}h1,h2,h3,h4,summary{break-after:avoid}p,li{orphans:3;widows:3}details:not([open]){display:none}}
</style></head><body>${content}</body></html>`;
}

export function downloadWalkthrough(guide: ReadingGuide): void {
  const blob = new Blob([buildWalkthroughDocument(guide)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(guide.subject.name || 'Chart').replace(/[^\p{L}\p{N} _-]/gu, '').trim() || 'Chart'} Chart Walkthrough.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}