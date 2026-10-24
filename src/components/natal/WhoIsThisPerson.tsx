import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, Compass, Loader2, RefreshCw } from 'lucide-react';
import type { NatalChart } from '@/hooks/useNatalChart';
import { Button } from '@/components/ui/button';
import { buildChartStoryMap, storyMapChartHash, type ChartStoryMap } from '@/lib/interpretation/chartStoryMap';
import { validatePersonReading, validationContextFor, type PersonReading } from '@/lib/interpretation/personReadingValidator';
import { formatLocalDateKey } from '@/lib/localDate';
import { buildCoreThreeSummary } from '@/lib/interpretation/coreThreeSummary';

const CACHE_PREFIX = 'person-reading:v3:';

function ageOn(birthDate: string, now: Date): number | null {
  const [y, m, d] = birthDate.split('-').map(Number);
  if (!y) return null;
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

function readCache(key: string): PersonReading | null {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function WhoIsThisPerson({ chart }: { chart: NatalChart }) {
  const todayKey = formatLocalDateKey(new Date());
  const map: ChartStoryMap = useMemo(() => buildChartStoryMap(chart), [chart, todayKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const core = useMemo(() => buildCoreThreeSummary(chart), [chart]);
  const cacheKey = `${CACHE_PREFIX}${chart.id}:${storyMapChartHash(chart)}`;
  const [reading, setReading] = useState<PersonReading | null>(() => readCache(cacheKey));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const call = async (extra: Record<string, unknown> = {}) => {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/natal-person-reading`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ name: chart.name, age: ageOn(chart.birthDate, new Date()), map, ...extra }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || 'The reading could not be written.');
        return body;
      };
      let body = await call();
      // The server hands back a draft plus checker errors when a repair pass is needed.
      for (let i = 0; i < 2 && body.needsRepair; i++) body = await call({ repair: { draft: body.draft, errors: body.errors } });
      if (!body.reading) throw new Error('The written reading did not pass the accuracy check.');
      const r = body.reading as PersonReading;
      // Re-check in the browser with today's transit list.
      const errs = validatePersonReading({ ...r, transitsNow: [] }, validationContextFor(map));
      if (errs.length) throw new Error('The written reading did not pass the accuracy check.');
      localStorage.setItem(cacheKey, JSON.stringify(r));
      setReading(r);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [chart.name, chart.birthDate, map, cacheKey]);

  useEffect(() => {
    const cached = readCache(cacheKey);
    setReading(cached); setError(null);
    if (!cached) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const transitNote = (id: string) => reading?.transitsNow.find((t) => t.transitId === id);
  const chainSignature = (chainIds: string[]) =>
    reading?.signatures.find((s) => s.chainIds.some((c) => chainIds.includes(c)))?.name;

  return (
    <section className="border border-primary/40 bg-card rounded-sm p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Compass className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary">The whole person, before the details</p>
            <h2 className="text-xl font-serif text-foreground">Who {chart.name} Is</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const blob = new Blob([JSON.stringify({ report: 'Who This Person Is', generated: new Date().toISOString(), person: { name: chart.name, birthDate: chart.birthDate }, reading, storyMap: map }, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${chart.name} - Who This Person Is.json`; a.click(); URL.revokeObjectURL(a.href);
          }}>JSON</Button>
          <Button variant="outline" size="sm" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            <span className="ml-1.5">{reading ? 'Rewrite' : 'Write reading'}</span>
          </Button>
        </div>
      </div>

      {core && (
        <div className="border border-border rounded-sm p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sun, Moon and Rising</p>
          <ul className="text-sm text-foreground space-y-0.5">
            {core.lines.map((l) => (
              <li key={l.label}><span className="font-medium">{l.label}</span> {l.degree} {l.sign} <span className="text-muted-foreground">({l.element}, {l.modality})</span></li>
            ))}
          </ul>
          <p className="text-sm font-medium text-primary">{core.pattern}</p>
          <p className="text-sm leading-relaxed text-foreground">{core.meaning}</p>
        </div>
      )}

      {loading && !reading && (
        <p className="text-sm text-muted-foreground">Reading the chart as one story. This can take up to two minutes…</p>
      )}
      {error && (
        <p className="text-sm text-destructive">{error} The chart chains below are still accurate.</p>
      )}

      {reading ? (
        <>
          <div className="space-y-2">
            <p className="text-base leading-relaxed text-foreground font-serif">{reading.headline}</p>
            <p className="text-sm leading-relaxed text-foreground border-l-2 border-primary pl-3">
              <span className="font-medium">The central tension: </span>{reading.centralTension}
            </p>
          </div>

          <div className="space-y-3">
            {reading.signatures.map((s, i) => (
              <article key={s.name} className="border border-border rounded-sm p-4 space-y-2">
                <h3 className="font-serif text-lg text-foreground">{i + 1}. {s.name}</h3>
                {s.plainMeaning && <p className="text-base leading-relaxed text-foreground font-serif">{s.plainMeaning}</p>}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">The astrology</p>
                  <p className="text-sm leading-relaxed text-foreground">{s.howItWorks}</p>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">How it shows up</p>
                <dl className="grid gap-2 sm:grid-cols-2 text-sm">
                  {s.inLife && <div><dt className="text-[10px] uppercase tracking-widest text-muted-foreground">Everyday life</dt><dd className="text-foreground">{s.inLife}</dd></div>}
                  <div><dt className="text-[10px] uppercase tracking-widest text-muted-foreground">In relationships</dt><dd className="text-foreground">{s.inRelationships}</dd></div>
                  <div><dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{ageOn(chart.birthDate, new Date())! < 18 ? 'School and direction' : 'In work'}</dt><dd className="text-foreground">{s.inWork}</dd></div>
                  <div><dt className="text-[10px] uppercase tracking-widest text-muted-foreground">Under stress</dt><dd className="text-foreground">{s.underStress}</dd></div>
                  {s.inDecisions && <div><dt className="text-[10px] uppercase tracking-widest text-muted-foreground">Making decisions</dt><dd className="text-foreground">{s.inDecisions}</dd></div>}
                </dl>
                {(s.tension || s.stuckPoint) && <p className="text-sm text-foreground border-l-2 border-primary pl-3"><span className="font-medium">The tension: </span>{s.tension ?? s.stuckPoint}</p>}
                {(s.healthyExpression || s.strength) && <p className="text-sm text-foreground"><span className="font-medium">Healthy expression: </span>{s.healthyExpression ?? s.strength}</p>}
                <details>
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-primary">
                    <ChevronDown className="h-3.5 w-3.5" /> The chart evidence
                  </summary>
                  <ul className="mt-2 list-disc pl-5 space-y-0.5 text-xs text-muted-foreground">
                    {[...new Set([...s.evidenceIds, ...(s.tensionEvidenceIds ?? [])])].map((id) => <li key={id}>{map.evidence[id]?.fact ?? id}</li>)}
                  </ul>
                </details>
              </article>
            ))}
          </div>

          {reading.collisions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Where the patterns pull against each other</p>
              {reading.collisions.map((c, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground"><span className="font-medium">{c.between.join(' vs ')}: </span>{c.description}</p>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-border rounded-sm p-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">When they feel lost</p><p className="text-sm text-foreground">{reading.whenLost}</p></div>
            <div className="border border-border rounded-sm p-3"><p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">What steadies them</p><p className="text-sm text-foreground">{reading.whatSteadies}</p></div>
          </div>
        </>
      ) : !loading && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Chart chains only (no written reading yet):</p>
          {map.chains.map((c) => (
            <div key={c.id} className="text-sm"><span className="font-medium text-foreground">{c.label}: </span>
              <span className="text-muted-foreground">{c.steps.map((id) => map.evidence[id]?.fact).filter(Boolean).join(' → ')}</span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">What's moving now</p>
        {map.transits.length === 0 ? (
          <p className="text-sm text-muted-foreground">No slow-planet transit is touching these patterns in the next six months.</p>
        ) : map.transits.map((t) => {
          const note = transitNote(t.id);
          const sig = note?.signatureName ?? chainSignature(t.chainIds);
          return (
            <div key={t.id} className="text-sm">
              <p className="text-foreground">
                <span className="font-medium">{t.headline}</span>
                {sig && <span className="text-primary"> · presses on {sig}</span>}
                <span className="text-muted-foreground"> · {t.isActiveNow ? 'active now' : 'coming up'}{t.nextExact ? `, exact ${t.nextExact}` : ''} (window {t.windowStart} to {t.windowEnd})</span>
              </p>
              <p className="text-muted-foreground">{note?.meaning ?? t.meaning}</p>
            </div>
          );
        })}
      </div>

      {reading && reading.clientQuestions.length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Questions to ask in the session</p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
            {reading.clientQuestions.map((q) => <li key={q}>{q}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
