/**
 * Hidden QA route: /qa/accuracy
 *
 * Runs the same accuracy suite the automated tests run, in the browser, and
 * shows the scorecard. Not linked from anywhere in the app.
 */

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Copy } from 'lucide-react';
import { runAccuracySuite, formatSuiteMarkdown } from '@/lib/qa/runAccuracySuite';
import { runVedicAccuracySuite, formatVedicMarkdown } from '@/lib/qa/vedicAccuracy';
import { formatArcmin, formatLongitude } from '@/lib/qa/accuracyAudit';
import { toast } from 'sonner';

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

const ScoreBadge = ({ value }: { value: number }) => (
  <Badge variant={value >= 0.99 ? 'default' : value >= 0.9 ? 'secondary' : 'destructive'}>
    {pct(value)}
  </Badge>
);

const QaAccuracy = () => {
  const [runId, setRunId] = useState(0);
  const report = useMemo(() => {
    void runId;
    return runAccuracySuite();
  }, [runId]);
  const t = report.totals;
  const vedic = useMemo(() => {
    void runId;
    return runVedicAccuracySuite();
  }, [runId]);
  const v = vedic.totals;

  const copyVedicMarkdown = async () => {
    await navigator.clipboard.writeText(formatVedicMarkdown(vedic));
    toast.success('Vedic scorecard copied as markdown');
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(formatSuiteMarkdown(report));
    toast.success('Scorecard copied as markdown');
  };

  return (
    <main className="container mx-auto max-w-5xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Accuracy suite</h1>
        <p className="text-muted-foreground text-sm">
          {t.peopleCount} reference charts graded against independent ephemeris values, and every
          generated reading graded against {t.rulesChecked} writing rules. Readings use the sky of{' '}
          {report.skyDate} so results are repeatable.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" variant="secondary" onClick={() => setRunId((n) => n + 1)}>
            Run again
          </Button>
          <Button size="sm" variant="outline" onClick={copyMarkdown}>
            <Copy className="mr-2 h-4 w-4" /> Copy scorecard
          </Button>
          <Button size="sm" variant="outline" onClick={copyVedicMarkdown}>
            <Copy className="mr-2 h-4 w-4" /> Copy Vedic scorecard
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chart math</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{pct(t.mathScore)}</div>
            <p className="text-muted-foreground text-xs">
              {t.bodyPass} of {t.bodyChecks} positions inside tolerance, {t.bodyClose} close,{' '}
              {t.bodyFail} off
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">
              {pct(t.invariantPass / Math.max(1, t.invariantChecks))}
            </div>
            <p className="text-muted-foreground text-xs">
              {t.invariantPass} of {t.invariantChecks} structural checks held
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reading voice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-semibold">{pct(t.readingScore)}</div>
            <p className="text-muted-foreground text-xs">
              {t.lintErrors} errors and {t.lintWarnings} warnings across {t.readingBlocks} blocks
            </p>
          </CardContent>
        </Card>
      </section>

      {report.ruleBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Writing rules triggered</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {report.ruleBreakdown.map((r) => (
              <Badge key={r.rule} variant={r.severity === 'error' ? 'destructive' : 'secondary'}>
                {r.rule} ({r.hits})
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        {report.people.map((person) => {
          const problems = [
            ...person.math.bodies.filter((b) => b.status !== 'pass'),
          ];
          const brokenInvariants = person.math.invariants.filter((i) => !i.ok);
          const lintFindings = person.reading.lints.flatMap((l) =>
            l.findings.map((f) => ({ ...f, source: l.source })),
          );

          return (
            <Collapsible key={person.math.id}>
              <Card>
                <CollapsibleTrigger className="w-full text-left">
                  <CardHeader className="flex flex-row items-center justify-between gap-3 py-4">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="truncate text-base">{person.math.name}</CardTitle>
                      <p className="text-muted-foreground truncate text-xs">
                        {person.math.birthLine}
                      </p>
                      <p className="text-muted-foreground truncate text-xs italic">
                        {person.math.why}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ScoreBadge value={person.math.score} />
                      <Badge variant={person.reading.errorCount ? 'destructive' : 'secondary'}>
                        {person.reading.errorCount} writing
                      </Badge>
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <h3 className="mb-2 font-medium">Positions</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="text-muted-foreground">
                            <tr>
                              <th className="text-left font-medium">Body</th>
                              <th className="text-left font-medium">Reference</th>
                              <th className="text-left font-medium">App</th>
                              <th className="text-left font-medium">Difference</th>
                            </tr>
                          </thead>
                          <tbody>
                            {person.math.bodies.map((b) => (
                              <tr key={b.body} className="border-border/50 border-t">
                                <td className="py-1">{b.body}</td>
                                <td className="py-1">{formatLongitude(b.expected)}</td>
                                <td className="py-1">{formatLongitude(b.actual)}</td>
                                <td className="py-1">
                                  <span
                                    className={
                                      b.status === 'pass'
                                        ? 'text-muted-foreground'
                                        : 'text-destructive font-medium'
                                    }
                                  >
                                    {formatArcmin(b.deltaArcmin)} (limit {b.limit}&apos;)
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">Structure</h3>
                      <ul className="space-y-1 text-xs">
                        {person.math.invariants.map((i) => (
                          <li key={i.name} className="flex gap-2">
                            <span className={i.ok ? 'text-muted-foreground' : 'text-destructive'}>
                              {i.ok ? 'ok' : 'broken'}
                            </span>
                            <span>
                              {i.name}. <span className="text-muted-foreground">{i.detail}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-2 font-medium">
                        Writing findings ({lintFindings.length})
                      </h3>
                      {lintFindings.length === 0 ? (
                        <p className="text-muted-foreground text-xs">
                          Every generated block passed all {t.rulesChecked} rules.
                        </p>
                      ) : (
                        <ul className="space-y-2 text-xs">
                          {lintFindings.map((f, idx) => (
                            <li key={`${f.rule}-${idx}`} className="space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant={f.severity === 'error' ? 'destructive' : 'secondary'}
                                >
                                  {f.rule}
                                </Badge>
                                <span className="text-muted-foreground">{f.source}</span>
                              </div>
                              <p>{f.message}</p>
                              <p className="text-muted-foreground italic">{f.excerpt}</p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {problems.length === 0 && brokenInvariants.length === 0 && (
                      <p className="text-muted-foreground text-xs">
                        All positions and structural checks passed for this chart.
                      </p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Vedic engine</h2>
        <p className="text-muted-foreground text-sm">
          Each chart's sidereal longitudes are graded against the frozen tropical values minus the ayanamsa for the same
          UTC instant, then nakshatra, pada, whole-sign house, the Vimshottari dasha structure, all sixteen divisional
          charts and the Ashtakavarga totals are checked independently.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sidereal positions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-semibold">{pct(v.bodyPass / Math.max(1, v.bodyChecks))}</div>
              <p className="text-muted-foreground text-xs">
                {v.bodyPass} of {v.bodyChecks} inside tolerance
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Nakshatra and house</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-semibold">
                {pct((v.nakshatraPass + v.housePass) / Math.max(1, v.nakshatraChecks + v.houseChecks))}
              </div>
              <p className="text-muted-foreground text-xs">
                {v.nakshatraPass}/{v.nakshatraChecks} nakshatra and pada, {v.housePass}/{v.houseChecks} whole-sign houses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dasha, varga, bindus</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="text-2xl font-semibold">{pct(v.invariantPass / Math.max(1, v.invariantChecks))}</div>
              <p className="text-muted-foreground text-xs">
                {v.invariantPass} of {v.invariantChecks} structural checks held
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          {vedic.people.map((p) => {
            const broken = p.invariants.filter((i) => !i.ok);
            const offBodies = p.bodies.filter(
              (b) => b.status !== 'pass' || !b.signOk || !b.nakshatraOk || !b.houseOk,
            );
            const clean = broken.length === 0 && offBodies.length === 0;
            return (
              <Collapsible key={p.id}>
                <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="flex items-center gap-2">
                    <Badge variant={clean ? 'default' : 'destructive'}>{pct(p.score)}</Badge>
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 px-3 py-2">
                  <p className="text-muted-foreground text-xs">{p.birthLine}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="text-muted-foreground">
                        <tr className="text-left">
                          <th className="py-1 pr-3">Graha</th>
                          <th className="py-1 pr-3">Expected</th>
                          <th className="py-1 pr-3">App</th>
                          <th className="py-1 pr-3">Delta</th>
                          <th className="py-1 pr-3">Nakshatra</th>
                          <th className="py-1">House</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.bodies.map((b) => (
                          <tr key={b.body} className="border-t">
                            <td className="py-1 pr-3">{b.body}</td>
                            <td className="py-1 pr-3">{formatLongitude(b.expectedSidereal)}</td>
                            <td className="py-1 pr-3">
                              {b.actualSidereal === null ? 'missing' : formatLongitude(b.actualSidereal)}
                            </td>
                            <td className={`py-1 pr-3 ${b.status === 'pass' ? '' : 'text-destructive'}`}>
                              {formatArcmin(b.deltaArcmin)}
                            </td>
                            <td className={`py-1 pr-3 ${b.nakshatraOk ? '' : 'text-destructive'}`}>
                              {b.actualNakshatra ?? 'missing'} {b.actualPada ?? ''}
                            </td>
                            <td className={`py-1 ${b.houseOk ? '' : 'text-destructive'}`}>{b.actualHouse ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <ul className="space-y-1 text-xs">
                    {p.invariants.map((i) => (
                      <li key={i.name} className={i.ok ? 'text-muted-foreground' : 'text-destructive'}>
                        {i.ok ? 'OK' : 'FAIL'}: {i.name}. {i.detail}
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </section>

    </main>
  );
};

export default QaAccuracy;
