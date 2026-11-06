import type { PractitionerWalkthrough } from '@/lib/readingGuide/practitionerSynthesis';
import { buildConsultationAgenda } from '@/lib/readingGuide/consultationAgenda';

export function ConsultationAgenda({ reading }: { reading: PractitionerWalkthrough }) {
  const agenda = buildConsultationAgenda(reading);
  const evidence = new Map(reading.evidence.map(item => [item.id, item]));
  if (!agenda.length) return null;
  return <section className="space-y-5 border-b border-border pb-6">
    <h2 className="text-xl font-serif text-foreground">Conversation priorities</h2>
    <ol className="space-y-5">{agenda.map((item, index) => <li key={item.id} className="border-l-2 border-primary pl-5 space-y-3">
      <h3 className="text-base font-medium text-foreground">{index + 1}. {item.topic}</h3>
      <p className="text-sm text-foreground">{item.question}</p>
      <p className="text-sm text-muted-foreground">{item.followUp}</p>
      <details><summary className="cursor-pointer text-xs text-primary">Possible expression and countercheck</summary><div className="mt-3 space-y-3 text-sm text-muted-foreground">
        <p>{item.possibleExpression}</p><p>{item.alternative}</p>
        <p><span className="font-medium text-foreground">Working hypothesis: </span>{item.hypothesis}</p>
        <p><span className="font-medium text-foreground">Practitioner thread: </span>{item.takeaway}</p>
        <ul className="space-y-1 text-xs">{item.evidenceIds.map(id => <li key={id}>{evidence.get(id)?.text}</li>)}</ul>
      </div></details>
    </li>)}</ol>
  </section>;
}