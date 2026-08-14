/**
 * Shared section export helpers.
 *
 * downloadSectionJson    → structured data file you can hand to someone else
 * downloadSectionPdf     → multi-page PDF snapshot of a rendered section
 */

export const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'report';

export function downloadSectionJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadSectionPdf(
  element: HTMLElement | null,
  filename: string,
) {
  if (!element) throw new Error('Nothing to export yet.');

  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const bg = getComputedStyle(document.body).backgroundColor || '#ffffff';

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: bg,
    windowWidth: element.scrollWidth,
  });

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 24;
  const usableW = pageW - margin * 2;
  const usableH = pageH - margin * 2;

  // Height of one PDF page expressed in source-canvas pixels.
  const sliceHeight = Math.floor((canvas.width * usableH) / usableW);
  let offset = 0;
  let first = true;

  while (offset < canvas.height) {
    const h = Math.min(sliceHeight, canvas.height - offset);
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = h;
    const sctx = slice.getContext('2d');
    if (!sctx) break;
    sctx.fillStyle = bg;
    sctx.fillRect(0, 0, slice.width, slice.height);
    sctx.drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h);

    if (!first) doc.addPage();
    first = false;
    doc.addImage(
      slice.toDataURL('image/jpeg', 0.92),
      'JPEG',
      margin,
      margin,
      usableW,
      (h * usableW) / canvas.width,
    );
    offset += h;
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
