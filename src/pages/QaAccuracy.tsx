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
    </main>
  );
};

export default QaAccuracy;
