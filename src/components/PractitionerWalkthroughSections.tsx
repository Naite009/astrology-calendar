import type { PractitionerWalkthrough, WalkthroughEvidence, PractitionerTheme } from '@/lib/readingGuide/practitionerSynthesis';
import { TryThisAction } from '@/components/TryThisAction';
import { ChevronDown, Compass, MessageCircle, Search, GitBranch } from 'lucide-react';

function EvidenceTrail({ ids, evidence, reasoning = [] }: { ids: string[]; evidence: Map<string, WalkthroughEvidence>; reasoning?: string[] }) {
  const lines = ids.flatMap(id => { const item = evidence.get(id); return item ? [item] : []; });
  return <details className="border-t border-border/60 pt-3">
    <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium text-primary"><ChevronDown className="h-3.5 w-3.5 shrink-0" /> Astrological evidence and reasoning <span className="text-muted-foreground font-normal">({lines.length})</span></summary>
    <div className="mt-3 space-y-3">
      <ul className="space-y-2">{lines.map(item => <li key={item.id} className="text-xs leading-relaxed text-muted-foreground break-words">
        <span className="text-foreground">{item.text}</span>
        {item.tier === 'secondary' && <span className="ml-1 text-primary">Secondary evidence.</span>}
        {item.layers && <ul className="mt-1 space-y-1 border-l border-border pl-3">{item.layers.slice(2).map(line => <li key={line}>{line}</li>)}</ul>}
      </li>)}</ul>
      {reasoning.length > 0 && <div className="space-y-2 border-t border-border pt-3"><p className="text-[10px] uppercase tracking-widest text-primary">How the pieces connect</p>{reasoning.map(line => <p key={line} className="text-xs leading-relaxed text-foreground">{line}</p>)}</div>}
    </div>
  </details>;
}

function ThemeSection({ theme, evidence, index }: { theme: PractitionerTheme; evidence: Map<string, WalkthroughEvidence>; index: number }) {
  return <article className="border-l-2 border-primary bg-secondary/20 px-5 py-5 space-y-4">
    <header><p className="text-[10px] uppercase tracking-widest text-primary">Reading thread {index + 1} · {theme.signal} signal</p><h3 className="mt-1 text-xl font-serif text-foreground">{theme.title}</h3><p className="mt-1 text-xs text-muted-foreground">{theme.question}</p></header>
    <p className="text-sm leading-relaxed text-foreground">{theme.synthesis}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><h4 className="mb-1 text-[10px] uppercase tracking-widest text-primary">The gift</h4><p className="text-sm leading-relaxed text-foreground">{theme.gift}</p></div>
      <div><h4 className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">The tension</h4><p className="text-sm leading-relaxed text-foreground">{theme.tension}</p></div>
    </div>
    <ul className="list-disc pl-4 space-y-1 text-xs leading-relaxed text-muted-foreground">{theme.examples.map(line => <li key={line}>{line}</li>)}</ul>
    <div className="border-t border-border/60 pt-3"><p className="text-[10px] uppercase tracking-widest text-primary mb-1">Recognition check</p><p className="text-sm text-foreground">{theme.recognition}</p></div>
    <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">What helps</p><p className="text-sm leading-relaxed text-foreground">{theme.integration}</p><TryThisAction action={theme.tryThis} /></div>
    <EvidenceTrail ids={theme.evidenceIds} evidence={evidence} reasoning={theme.reasoning} />
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
    {reading.chartRuler && <section className="space-y-3 border-l-2 border-primary pl-5">
      <p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary"><GitBranch className="h-4 w-4" /> Chart ruler and the connected houses</p>
      <h2 className="text-xl font-serif text-foreground">{reading.chartRuler.title}</h2>
      <p className="text-sm leading-relaxed text-foreground">{reading.chartRuler.synthesis}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{reading.chartRuler.condition}</p>
      {reading.chartRuler.modernNote && <p className="text-xs text-muted-foreground">{reading.chartRuler.modernNote}</p>}
      <EvidenceTrail ids={reading.chartRuler.evidenceIds} evidence={evidence} reasoning={reading.chartRuler.reasoning} />
    </section>}
    <section className="space-y-4"><h2 className="text-xl font-serif text-foreground">The themes that connect the chart</h2>{reading.themes.map((theme,index) => <ThemeSection key={theme.id} theme={theme} evidence={evidence} index={index} />)}</section>
    <section className="border-y border-border py-5 space-y-3">
      <h2 className="text-xl font-serif text-foreground">What comes first, what keeps going</h2>
      <p className="text-sm leading-relaxed text-foreground">{reading.balance.synthesis}</p>
      <p className="text-sm leading-relaxed text-foreground">{reading.balance.modality}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{reading.balance.alternative}</p>
      {reading.balance.compensation && <p className="text-xs leading-relaxed text-muted-foreground">{reading.balance.compensation}</p>}
      <TryThisAction action={reading.balance.tryThis} /><EvidenceTrail ids={reading.balance.evidenceIds} evidence={evidence} />
    </section>
    {reading.configurations.length > 0 && <section className="space-y-4"><h2 className="text-xl font-serif text-foreground">Configurations: the complete circuit</h2>
      {reading.configurations.map(pattern => <article key={pattern.id} className="border-l-2 border-primary bg-secondary/20 p-5 space-y-3">
        <header><p className="text-[10px] uppercase tracking-widest text-muted-foreground">{pattern.tier === 'primary' ? 'Major-planet / angle pattern' : 'Secondary pattern'}</p><h3 className="mt-1 text-lg font-serif text-foreground">{pattern.name}{pattern.apex ? `, ${pattern.apex} at the focus` : ''}</h3></header>
        <p className="text-sm leading-relaxed text-foreground">{pattern.synthesis}</p><p className="text-xs leading-relaxed text-muted-foreground">{pattern.gift}</p>
        {pattern.release && <p className="text-xs leading-relaxed text-primary">Symbolic balancing point: {pattern.release.degree.toFixed(2)}° {pattern.release.sign}{pattern.release.house ? `, House ${pattern.release.house}` : ''}. {pattern.release.note}</p>}
        <div><p className="text-[10px] uppercase tracking-widest text-primary mb-1">What helps</p><p className="text-sm leading-relaxed text-foreground">{pattern.integration}</p><TryThisAction action={pattern.tryThis} /></div>
        <EvidenceTrail ids={pattern.evidenceIds} evidence={evidence} />
      </article>)}
    </section>}
    {reading.hiddenPatterns.length > 0 && <section className="space-y-4"><h2 className="flex items-center gap-2 text-xl font-serif text-foreground"><Search className="h-4 w-4 text-primary" /> What the client may not notice</h2>{reading.hiddenPatterns.map(item => <article key={item.title} className="border-l-2 border-border pl-5 space-y-3"><h3 className="text-sm font-medium text-foreground">{item.title}</h3><p className="text-sm leading-relaxed text-foreground">{item.observation}</p><p className="text-xs text-primary">Ask: {item.check}</p><EvidenceTrail ids={item.evidenceIds} evidence={evidence} /></article>)}</section>}
    <section className="border-t-2 border-primary pt-6 space-y-5">
      <header><p className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-primary"><MessageCircle className="h-4 w-4" /> Practitioner summary</p><h2 className="mt-2 text-xl font-serif text-foreground">If I were reading this chart for the client, I would keep coming back to...</h2></header>
      <ol className="space-y-3">{reading.closing.threads.map((thread,index) => <li key={thread.text} className="text-sm leading-relaxed text-foreground"><span className="mr-2 text-primary">{index+1}.</span>{thread.text}</li>)}</ol>
      <div className="space-y-2"><h3 className="text-[10px] uppercase tracking-widest text-primary">Client questions worth asking</h3><ul className="list-disc pl-4 space-y-2 text-sm text-foreground">{reading.closing.questions.map(q => <li key={q.text}>{q.text}</li>)}</ul></div>
      <div className="space-y-4 border-t border-border pt-4">{[['What to practice',reading.closing.practice],['What to watch for',reading.closing.watchFor],['What to build',reading.closing.build]].map(([label,text],index) => <div key={label}><p className="text-sm leading-relaxed text-foreground"><span className="font-medium">{label}:</span> {text}</p><TryThisAction action={reading.closing.actions[index]} /></div>)}</div>
    </section>
    <details className="border-t border-border pt-4"><summary className="cursor-pointer text-xs text-muted-foreground">Reading priorities and limits</summary><div className="mt-3 space-y-2">{reading.methodology.map(line => <p key={line} className="text-xs leading-relaxed text-muted-foreground">{line}</p>)}</div></details>
  </div>;
}
