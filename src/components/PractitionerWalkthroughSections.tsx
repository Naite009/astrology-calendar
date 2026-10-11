import type { PractitionerWalkthrough, WalkthroughEvidence, PractitionerTheme } from '@/lib/readingGuide/practitionerSynthesis';
import { ChevronDown, Compass, MessageCircle, Search, GitBranch } from 'lucide-react';

function EvidenceTrail({ ids, evidence, reasoning = [] }: { ids: string[]; evidence: Map<string, WalkthroughEvidence>; reasoning?: string[] }) {
  const lines = ids.flatMap(id => { const item = evidence.get(id); return item ? [item] : []; });
  return <details className="border-t border-border/60 pt-3">
    <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-primary"><ChevronDown className="h-3.5 w-3.5 shrink-0" /> Astrological evidence and reasoning <span className="text-muted-foreground font-normal">({lines.length})</span></summary>
    <div className="mt-3 space-y-3">
      <ul className="space-y-2">{lines.map(item => <li key={item.id} className="text-xs leading-relaxed text-muted-foreground break-words">
        <span className="text-foreground">{item.text}</span>
        {item.tier === 'secondary' && <span className="ml-1 text-primary">Secondary evidence.</span>}
        {item.layers && <ul className="mt-1 space-y-1 border-l border-border pl-3">{item.layers.map(line => <li key={line}>{line}</li>)}</ul>}
      </li>)}</ul>
      {reasoning.length > 0 && <div className="space-y-2 border-t border-border pt-3"><p className="text-[10px] uppercase tracking-widest text-primary">How the pieces connect</p>{reasoning.map(line => <p key={line} className="text-xs leading-relaxed text-foreground">{line}</p>)}</div>}
    </div>
  </details>;
}

function ThemeSection({ theme, evidence, index }: { theme: PractitionerTheme; evidence: Map<string, WalkthroughEvidence>; index: number }) {
  return <article className="border-l-2 border-primary bg-secondary/20 px-5 py-5 space-y-4">
    <header><p className="text-[10px] uppercase tracking-widest text-primary">Reading thread {index + 1} · {theme.signal} signal</p><h3 className="mt-1 text-xl font-serif text-foreground">{theme.title}</h3><p className="mt-1 text-xs text-muted-foreground">{theme.question}</p></header>
    <EvidenceTrail ids={theme.evidenceIds} evidence={evidence} reasoning={theme.reasoning} />
    <div><h4 className="mb-1 text-[10px] uppercase tracking-widest text-primary">The combined human expression</h4><p className="text-sm leading-relaxed text-foreground">{theme.synthesis}</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><h4 className="mb-1 text-[10px] uppercase tracking-widest text-primary">What people may notice</h4><p className="text-sm leading-relaxed text-foreground">{theme.gift}</p></div>
      <div><h4 className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">What can coexist underneath</h4><p className="text-sm leading-relaxed text-foreground">{theme.tension}</p></div>
    </div>
    <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed text-muted-foreground">{theme.examples.map(line => <li key={line}>{line}</li>)}</ul>
    <div className="border-t border-border/60 pt-3"><p className="text-[10px] uppercase tracking-widest text-primary mb-1">Recognition check</p><p className="text-sm text-foreground">{theme.recognition}</p></div>
    <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">The capacity and its limits</p><p className="text-sm leading-relaxed text-foreground">{theme.integration}</p></div>
  </article>;
}

export function PractitionerWalkthroughSections({ reading }: { reading: PractitionerWalkthrough }) {
  const evidence = new Map(reading.evidence.map(item => [item.id,item]));
  return <div className="space-y-8">
    {reading.limitations.length > 0 && <aside className="border-l-2 border-primary bg-secondary/20 p-4 text-xs leading-relaxed text-muted-foreground">{reading.limitations.map(line => <p key={line}>{line}</p>)}</aside>}
    <section className="border-b border-primary/30 pb-6 space-y-5">
      <header><p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary"><Compass className="h-4 w-4" /> The whole-chart reading</p><h2 className="mt-2 text-2xl font-serif text-foreground">What stands out first</h2></header>
      <p className="text-sm leading-relaxed text-foreground">{reading.opening.summary}</p>
      <ol className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{reading.opening.signatures.map((item,index) => <li key={item.id} className="border-t border-border pt-3 space-y-2 min-w-0">
        <h3 className="text-sm font-medium text-foreground"><span className="text-primary mr-2">{String(index+1).padStart(2,'0')}</span>{item.title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{item.meaning}</p><EvidenceTrail ids={item.evidenceIds} evidence={evidence} />
      </li>)}</ol>
    </section>
    <section className="space-y-3 border-b border-border pb-5"><h2 className="text-xl font-serif text-foreground">The chart's baseline temperament</h2><p className="text-sm leading-relaxed text-foreground">{reading.baseline.synthesis}</p><EvidenceTrail ids={reading.baseline.evidenceIds} evidence={evidence} /></section>
    {reading.chartRuler && <section className="space-y-3 border-l-2 border-primary pl-5">
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary"><GitBranch className="h-4 w-4" /> Chart ruler and the connected houses</p>
      <h2 className="text-xl font-serif text-foreground">{reading.chartRuler.title}</h2>
      <p className="text-sm leading-relaxed text-foreground">{reading.chartRuler.synthesis}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{reading.chartRuler.condition}</p>
      {reading.chartRuler.modernNote && <p className="text-xs text-muted-foreground">{reading.chartRuler.modernNote}</p>}
      <EvidenceTrail ids={reading.chartRuler.evidenceIds} evidence={evidence} reasoning={reading.chartRuler.reasoning} />
    </section>}
    {reading.developmentalSections.map(section => <section key={section.id} className="space-y-5 border-t border-border pt-6">
      <header className="space-y-2"><h2 className="text-xl font-serif text-foreground">{section.title}</h2>{section.framing && <p className="text-xs leading-relaxed text-muted-foreground">{section.framing}</p>}</header>
      {section.conclusions.map(item => <article key={item.id} className="space-y-3 border-l-2 border-primary pl-5">
        <h3 className="text-base font-medium text-foreground">{item.title}</h3>
        <div className="space-y-2">{item.evidenceIds.flatMap(id => { const line=evidence.get(id); return line ? [<p key={id} className="text-xs leading-relaxed text-muted-foreground">{line.text}</p>] : []; })}</div>
        <p className="text-sm leading-relaxed text-foreground">{item.text}</p>
        <EvidenceTrail ids={item.evidenceIds} evidence={evidence} />
      </article>)}
    </section>)}
    {reading.expressionContrasts.length > 0 && <section className="space-y-5">
      <h2 className="text-xl font-serif text-foreground">What changes the obvious expression</h2>
      {reading.expressionContrasts.map(item => <article key={item.id} className="border-l-2 border-primary pl-5 space-y-3">
        <h3 className="text-lg font-serif text-foreground">{item.title}</h3>
        <p className="text-sm leading-relaxed text-foreground">{item.synthesis}</p>
        <div className="grid gap-4 sm:grid-cols-2"><div><h4 className="text-xs font-medium text-primary mb-1">How this may look from the outside</h4><p className="text-sm leading-relaxed text-foreground">{item.outside}</p></div><div><h4 className="text-xs font-medium text-primary mb-1">What may be going on inside</h4><p className="text-sm leading-relaxed text-foreground">{item.inside}</p></div></div>
        <p className="text-xs leading-relaxed text-muted-foreground">Evidence: {item.bodies.map(body => evidence.get(`placement:${body}`)?.text).filter(Boolean).join('; ')}.</p>
        <details className="space-y-3"><summary className="cursor-pointer text-xs font-medium text-primary">The modifiers, one layer at a time</summary>
          <ul className="mt-3 space-y-4">{item.modifiers.map((modifier,index) => <li key={`${modifier.kind}:${index}`} className="space-y-2">
            <p className="text-sm leading-relaxed text-foreground">{modifier.meaning}</p>
            <EvidenceTrail ids={modifier.evidenceIds} evidence={evidence} />
          </li>)}</ul>
        </details>
        <p className="text-xs text-primary">Ask: {item.question}</p>
        <EvidenceTrail ids={item.evidenceIds} evidence={evidence} />
      </article>)}
    </section>}
    <section className="space-y-4"><h2 className="text-xl font-serif text-foreground">The strongest repeating themes</h2>{reading.themes.map((theme,index) => <ThemeSection key={theme.id} theme={theme} evidence={evidence} index={index} />)}</section>
    <section className="border-y border-border py-5 space-y-3">
      <h2 className="text-xl font-serif text-foreground">What comes first, what keeps going</h2>
      <p className="text-sm leading-relaxed text-foreground">{reading.balance.synthesis}</p>
      <p className="text-sm leading-relaxed text-foreground">{reading.balance.modality}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{reading.balance.alternative}</p>
      {reading.balance.compensation && <p className="text-xs leading-relaxed text-muted-foreground">{reading.balance.compensation}</p>}
      <EvidenceTrail ids={reading.balance.evidenceIds} evidence={evidence} />
    </section>
    {reading.configurations.length > 0 && <section className="space-y-4"><h2 className="text-xl font-serif text-foreground">Configurations and architecture</h2>
      {reading.configurations.map(pattern => <article key={pattern.id} className="border-l-2 border-primary bg-secondary/20 p-5 space-y-3">
        <header><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{pattern.tier === 'primary' ? 'Major-planet / angle pattern' : 'Secondary pattern'}</p><h3 className="mt-1 text-lg font-serif text-foreground">{pattern.name}{pattern.apex ? `, ${pattern.apex} at the focus` : ''}</h3></header>
        <p className="text-sm leading-relaxed text-foreground">{pattern.synthesis}</p><p className="text-xs leading-relaxed text-muted-foreground">{pattern.gift}</p>
        {pattern.release && <p className="text-xs leading-relaxed text-primary">Symbolic balancing point: {pattern.release.degree.toFixed(2)}° {pattern.release.sign}{pattern.release.house ? `, House ${pattern.release.house}` : ''}. {pattern.release.note}</p>}
        <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">What this adds to the natal pattern</p><p className="text-sm leading-relaxed text-foreground">{pattern.integration}</p></div>
        <EvidenceTrail ids={pattern.evidenceIds} evidence={evidence} reasoning={pattern.reasoning} />
      </article>)}
    </section>}
    {reading.hiddenPatterns.length > 0 && <section className="space-y-4"><h2 className="flex items-center gap-2 text-xl font-serif text-foreground"><Search className="h-4 w-4 text-primary" /> What the client may not notice</h2>{reading.hiddenPatterns.map(item => <article key={item.title} className="border-l-2 border-border pl-5 space-y-3"><h3 className="text-sm font-medium text-foreground">{item.title}</h3><p className="text-sm leading-relaxed text-foreground">{item.observation}</p><p className="text-xs text-primary">Ask: {item.check}</p><EvidenceTrail ids={item.evidenceIds} evidence={evidence} /></article>)}</section>}
    <section className="border-t-2 border-primary pt-6 space-y-5">
      <header><p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary"><MessageCircle className="h-4 w-4" /> Practitioner summary</p><h2 className="mt-2 text-xl font-serif text-foreground">If I were reading this chart for the client, I would keep coming back to...</h2></header>
      <ol className="space-y-4">{reading.closing.threads.map((thread,index) => <li key={thread.text} className="text-sm leading-relaxed text-foreground space-y-2"><p><span className="mr-2 text-primary">{index+1}.</span>{thread.text}</p><ul className="space-y-1">{thread.evidenceIds.flatMap(id => { const line=evidence.get(id); return line ? [<li key={id} className="text-xs leading-relaxed text-muted-foreground">{line.text}</li>] : []; })}</ul><EvidenceTrail ids={thread.evidenceIds} evidence={evidence} /></li>)}</ol>
      <div className="space-y-3"><h3 className="text-[10px] uppercase tracking-widest text-primary">Client questions worth asking</h3><ul className="space-y-4 text-sm text-foreground">{reading.closing.questions.map(q => <li key={q.text} className="space-y-2"><p>{q.text}</p><details><summary className="cursor-pointer text-xs text-primary">Chart hypothesis behind this question</summary><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{q.hypothesis}</p></details><EvidenceTrail ids={q.evidenceIds} evidence={evidence} /></li>)}</ul></div>
    </section>
    <details className="border-t border-border pt-4"><summary className="cursor-pointer text-xs text-muted-foreground">Reading priorities and limits</summary><div className="mt-3 space-y-2">{reading.methodology.map(line => <p key={line} className="text-xs leading-relaxed text-muted-foreground">{line}</p>)}</div></details>
  </div>;
}
