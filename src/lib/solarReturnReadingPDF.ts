import { buildSolarReturnReadingDocument } from './solarReturnReadingDocument';

export async function downloadSolarReturnReadingPDF(report: Record<string, any>): Promise<void> {
  const document = buildSolarReturnReadingDocument(report);
  const { default: jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 48, width = 516, bottom = 738;
  let y = margin;
  const printable = (text: string) => text.replace(/\*\*/g, '').replace(/[′’]/g, "'").replace(/[“”]/g, '"').replace(/→/g, ' to ').replace(/℞/g, ' retrograde');
  const write = (text: string, size: number, bold = false) => {
    pdf.setFont('times', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    for (const line of pdf.splitTextToSize(printable(text), width) as string[]) {
      if (y + size * 1.4 > bottom) { pdf.addPage(); y = margin; }
      pdf.text(line, margin, y);
      y += size * 1.4;
    }
    y += 9;
  };
  pdf.setProperties({ title: document.title, subject: 'Validated Solar Return reading and chart evidence' });
  write(document.title, 20, true);
  for (const section of document.sections) {
    if (y + 85 > bottom) { pdf.addPage(); y = margin; }
    write(section.title, 14, true);
    for (const paragraph of section.paragraphs) write(paragraph, 11);
  }
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i); pdf.setFont('times', 'normal'); pdf.setFontSize(9);
    pdf.text(`${i} / ${pages}`, 564, 764, { align: 'right' });
  }
  pdf.save(`SolarReturn_${String(report.name).replace(/\s+/g, '_')}_${report.solarReturnYear}_Reading.pdf`);
}