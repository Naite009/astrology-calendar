import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];
const DARK:  Color = [38,  34,  30];

const PROFECTION_DEEP: Record<number, string> = {
  1: 'House 1 profection years are the most personal. Your body, appearance, health, and sense of identity are the focal point. You may feel compelled to change how you look, how you present yourself, or fundamentally who you are. Decisions made this year have outsized personal impact — this is YOUR year to define YOUR direction.',
  2: 'House 2 profection years center on money, material security, and self-worth. Income may change — up or down. Financial decisions made this year set the tone for the next several years. More importantly, you are being asked to examine what you VALUE.',
  3: 'House 3 profection years activate your mind, communication, and immediate environment. You may write more, teach, learn something new, or have conversations that reshape your perspective.',
  4: 'House 4 profection years bring focus to home, family, roots, and emotional foundations. You may move, renovate, or deal with family dynamics that require your full attention.',
  5: 'House 5 profection years activate creativity, romance, children, and self-expression. This is a year where you are asked to CREATE. Joy and pleasure are not optional; they are the curriculum.',
  6: 'House 6 profection years focus on daily routines, physical health, and work. The mundane is the spiritual path this year. Your body is sending messages — listen to them.',
  7: 'House 7 profection years are defined by partnerships and one-on-one relationships. If single, you may meet someone significant. If partnered, the relationship demands a new level of engagement.',
  8: 'House 8 profection years bring intensity, transformation, and encounters with shared resources. Psychologically, something needs to die so something authentic can emerge.',
  9: 'House 9 profection years expand your world through travel, education, publishing, or philosophical exploration. Your current worldview is too small — this year stretches it.',
  10: 'House 10 profection years put career, public reputation, and legacy in the spotlight. Professional responsibilities increase but so does recognition.',
  11: 'House 11 profection years activate friendships, community, and collective purpose. Your social circle is being restructured.',
  12: 'House 12 profection years are the most deeply internal. Solitude, spiritual practice, and unconscious patterns are the focus. This is a completion year.',
};
const TIME_LORD_DEEP: Record<string, string> = {
  Sun: 'The Sun as your Time Lord means your IDENTITY is the story of the year. Everything that happens filters through the question: who am I becoming?',
  Moon: 'The Moon as your Time Lord makes this fundamentally an EMOTIONAL year. Your feelings are the primary navigation system.',
  Mercury: 'Mercury as your Time Lord puts your MIND at the center of everything. How you think, communicate, learn, and process information determines the quality of the year.',
  Venus: 'Venus as your Time Lord makes this a year about LOVE, VALUES, and BEAUTY. Relationships — romantic, artistic, financial — are the primary arena.',
  Mars: 'Mars as your Time Lord brings raw ENERGY, DRIVE, and potentially CONFLICT. You have more fuel than usual — the question is how you channel it.',
  Jupiter: 'Jupiter as your Time Lord is traditionally considered fortunate — expansion, opportunity, and growth are the themes.',
  Saturn: 'Saturn as your Time Lord signals a SERIOUS year. This is not a punishment — it is a promotion that comes with a test. Saturn years are when structures are tested.',
  Uranus: 'Uranus as your Time Lord brings DISRUPTION, INNOVATION, and sudden change. Plans made before this year may be overturned.',
  Neptune: 'Neptune as your Time Lord dissolves boundaries between the real and the imagined. Creativity and intuition are heightened but so is confusion.',
  Pluto: 'Pluto as your Time Lord brings deep TRANSFORMATION and encounters with power. Something in your life is being fundamentally restructured.',
};

export function generateProfectionPersonalSection(
  ctx: PDFContext, doc: jsPDF,
  houseNumber: number, timeLord: string, age: number,
  timeLordSRHouse: number | null, timeLordSRSign: string
) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // Section header
  ctx.trackedLabel(doc, '04 · PROFECTION YEAR', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;

  // Main heading
  doc.setFont('times', 'bold'); doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text('Your Profection Year', margin, ctx.y);
  ctx.y += 14;

  // Sub-heading
  ctx.trackedLabel(doc, `HOUSE ${houseNumber} PROFECTION YEAR · AGE ${age}`, margin, ctx.y, { size: 8 });
  ctx.y += 14;

  // Theme title
  const HOUSE_FOCUS: Record<number, string> = {
    1: 'Identity & Self', 2: 'Money & Values', 3: 'Communication', 4: 'Home & Family',
    5: 'Creativity & Love', 6: 'Health & Daily Work', 7: 'Partnerships',
    8: 'Transformation', 9: 'Travel & Learning', 10: 'Career & Legacy',
    11: 'Friends & Community', 12: 'Spirituality & Inner Work',
  };
  doc.setFont('times', 'bolditalic'); doc.setFontSize(16);
  doc.setTextColor(90, 80, 68);
  doc.text(HOUSE_FOCUS[houseNumber] || '', margin, ctx.y);
  ctx.y += 12;

  // Time Lord label
  const tlName = P[timeLord] || timeLord;
  ctx.trackedLabel(doc, `TIME LORD: ${tlName.toUpperCase()}`, margin, ctx.y, { size: 7 });
  ctx.y += 16;

  // House deep dive body
  if (PROFECTION_DEEP[houseNumber]) {
    doc.setFont('times', 'normal'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    const lines: string[] = doc.splitTextToSize(PROFECTION_DEEP[houseNumber], contentW);
    for (const line of lines) {
      ctx.checkPage(16);
      doc.text(line, margin, ctx.y);
      ctx.y += 16.5;
    }
    ctx.y += 12;
  }

  // "WHY [PLANET] IS YOUR TIME LORD" sub-section
  ctx.trackedLabel(doc, `WHY ${tlName.toUpperCase()} IS YOUR TIME LORD`, margin, ctx.y);
  ctx.y += 12;
  doc.setFont('times', 'normal'); doc.setFontSize(10);
  doc.setTextColor(...INK);
  const whyText = `Your natal ${houseNumber}${houseNumber === 1 ? 'st' : houseNumber === 2 ? 'nd' : houseNumber === 3 ? 'rd' : 'th'} house cusp falls in a sign ruled by ${tlName}. In Hellenistic astrology, the planet that rules the sign on your activated profection house cusp becomes the "Time Lord" — the planet whose agenda dominates the year.`;
  const whyLines: string[] = doc.splitTextToSize(whyText, contentW);
  for (const line of whyLines) {
    ctx.checkPage(16);
    doc.text(line, margin, ctx.y);
    ctx.y += 16.5;
  }
  ctx.y += 12;

  // Time Lord detailed meaning
  if (TIME_LORD_DEEP[timeLord]) {
    ctx.checkPage(100);
    ctx.trackedLabel(doc, `${tlName.toUpperCase()} AS TIME LORD`, margin, ctx.y);
    ctx.y += 12;
    doc.setFont('times', 'normal'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    const tlLines: string[] = doc.splitTextToSize(TIME_LORD_DEEP[timeLord], contentW);
    for (const line of tlLines) {
      ctx.checkPage(16);
      doc.text(line, margin, ctx.y);
      ctx.y += 16.5;
    }
    ctx.y += 8;
  }

  // Where the Time Lord sits in the SR chart
  if (timeLordSRHouse && timeLordSRSign) {
    ctx.checkPage(60);
    ctx.trackedLabel(doc, `${tlName.toUpperCase()} IN SR HOUSE ${timeLordSRHouse} (${timeLordSRSign.toUpperCase()})`, margin, ctx.y);
    ctx.y += 12;
    doc.setFont('times', 'normal'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    const houseArea = timeLordSRHouse === 1 ? 'your identity and personal presentation' : timeLordSRHouse === 2 ? 'finances and values' : timeLordSRHouse === 3 ? 'communication and learning' : timeLordSRHouse === 4 ? 'home and family' : timeLordSRHouse === 5 ? 'creativity, romance, and self-expression' : timeLordSRHouse === 6 ? 'daily routines and health' : timeLordSRHouse === 7 ? 'partnerships and relationships' : timeLordSRHouse === 8 ? 'transformation and shared resources' : timeLordSRHouse === 9 ? 'travel, education, and beliefs' : timeLordSRHouse === 10 ? 'career and public reputation' : timeLordSRHouse === 11 ? 'friendships and community' : 'solitude and inner work';
    const srText = `Your Time Lord currently sits in the Solar Return ${timeLordSRHouse}${timeLordSRHouse === 1 ? 'st' : timeLordSRHouse === 2 ? 'nd' : timeLordSRHouse === 3 ? 'rd' : 'th'} house in ${timeLordSRSign}. This means the Time Lord's agenda plays out primarily through ${houseArea}.`;
    const srLines: string[] = doc.splitTextToSize(srText, contentW);
    for (const line of srLines) {
      ctx.checkPage(16);
      doc.text(line, margin, ctx.y);
      ctx.y += 16.5;
    }
    ctx.y += 8;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 8;
  }
}
