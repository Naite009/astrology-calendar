import type { NatalChart } from '@/hooks/useNatalChart';
import { buildSymbolicDevelopment } from '@/lib/interpretation/symbolicDevelopment';

export function SymbolicDevelopmentPanel({ chart }: { chart: NatalChart }) {
  const reading = buildSymbolicDevelopment(chart);
  return <section className="space-y-4 border-y border-border py-5">
    <h3 className="text-xl font-serif text-foreground">Growth through practice</h3>
    <p className="text-sm text-muted-foreground">{reading.frame}</p>
    {reading.saturn && <div className="space-y-2">
      <h4 className="font-medium">Saturn: standards, limits and steady progress</h4>
      <p className="text-xs text-primary">{reading.saturn.evidence}</p>
      <p className="text-sm">{reading.saturn.practice}</p>
      <p className="text-sm">{reading.saturn.example}</p>
      {reading.saturn.contacts.map(contact => <details key={contact.id} className="text-sm">
        <summary className="cursor-pointer">{contact.evidence}</summary>
        <p className="mt-2">{contact.example}</p><p>{contact.tension}</p><p>{contact.integration}</p>
      </details>)}
      <p className="text-sm font-medium">Try this: {reading.saturn.takeaway}</p>
    </div>}
    <div className="space-y-2">
      <h4 className="font-medium">Element practice</h4>
      <p className="text-xs text-primary">{Object.entries(reading.elements.counts).map(([el, count]) => `${el} ${count}`).join(' · ')} (major planets only)</p>
      <p className="text-sm">{reading.elements.summary}</p>
      {reading.elements.individual.map(item => <p className="text-sm" key={item.element}><strong>{item.element} practice:</strong> {item.support}</p>)}
    </div>
  </section>;
}