import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, ShieldCheck, CircleDashed, MinusCircle } from 'lucide-react';
import {
  verifyChartAgainstEphemeris,
  formatPosition,
  formatDelta,
  type BodyVerification,
  type VerifyPosition,
} from '@/lib/chartEphemerisVerify';

interface ChartVerificationPanelProps {
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  timezoneOffset?: number | null;
  planets?: Record<string, VerifyPosition | undefined>;
  /** Optional: let the user copy a single ephemeris value into the form. */
  onApplyValue?: (body: string, position: VerifyPosition) => void;
}

const STATUS_STYLE: Record<string, { icon: React.ReactNode; text: string; row: string }> = {
  verified: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    text: 'Double verified',
    row: 'bg-emerald-500/5',
  },
  close: {
    icon: <ShieldCheck className="h-4 w-4 text-sky-600" />,
    text: 'Agrees within rounding',
    row: 'bg-sky-500/5',
  },
  mismatch: {
    icon: <AlertTriangle className="h-4 w-4 text-destructive" />,
    text: 'Does not match',
    row: 'bg-destructive/5',
  },
  missing: {
    icon: <CircleDashed className="h-4 w-4 text-amber-600" />,
    text: 'Not read from the file',
    row: '',
  },
  unavailable: {
    icon: <MinusCircle className="h-4 w-4 text-muted-foreground" />,
    text: 'Cannot be checked',
    row: '',
  },
};

export const ChartVerificationPanel: React.FC<ChartVerificationPanelProps> = ({
  birthDate,
  birthTime,
  birthLocation,
  timezoneOffset,
  planets,
  onApplyValue,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [autoFilledCount, setAutoFilledCount] = useState(0);

  const report = useMemo(
    () => verifyChartAgainstEphemeris({ birthDate, birthTime, birthLocation, timezoneOffset, planets }),
    [birthDate, birthTime, birthLocation, timezoneOffset, planets],
  );

  // Auto-fill: anything the scan never read gets the calculated value applied
  // straight away, so the chart is never left incomplete waiting on a click.
  // Entered values are untouched; only 'missing' rows are written.
  const filledRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!onApplyValue) return;
    const toFill = report.results.filter(
      r => r.status === 'missing' && r.computed && !filledRef.current.has(r.body),
    );
    if (!toFill.length) return;
    toFill.forEach(r => {
      filledRef.current.add(r.body);
      onApplyValue(r.body, r.computed!, { silent: true });
    });
    setAutoFilledCount(filledRef.current.size);
  }, [report, onApplyValue]);


  if (report.blockedReason) {
    return (
      <Card className="border-border">
        <CardContent className="py-4 text-xs text-muted-foreground">{report.blockedReason}</CardContent>
      </Card>
    );
  }

  const problems = report.results.filter(r => r.status === 'mismatch' || r.retrogradeMismatch);
  const checked = report.results.filter(r => r.status === 'verified' || r.status === 'close');
  const missing = report.results.filter(r => r.status === 'missing');

  const rows: BodyVerification[] = showAll
    ? report.results
    : [...problems, ...checked.slice(0, 6)];

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-serif flex items-center gap-2">
          <ShieldCheck size={16} />
          Independent ephemeris check
        </CardTitle>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Nothing is overwritten. The chart is recalculated from {report.birthDate}
          {report.birthTime ? ` at ${report.birthTime}` : ' (no birth time, noon used)'}
          {report.birthLocation ? ` in ${report.birthLocation}` : ''}
          {report.timezoneOffset !== null ? `, UTC${report.timezoneOffset >= 0 ? '+' : ''}${report.timezoneOffset}` : ''},
          then compared to what the scan or your typing produced.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <Badge variant="outline" className="border-emerald-500/40 text-emerald-700">
            {checked.length} verified
          </Badge>
          {problems.length > 0 && (
            <Badge variant="outline" className="border-destructive/40 text-destructive">
              {problems.length} flagged
            </Badge>
          )}
          {missing.length > 0 && (
            <Badge variant="outline" className="border-amber-500/40 text-amber-700">
              {missing.length} filling in
            </Badge>
          )}
          {autoFilledCount > 0 && (
            <Badge variant="outline" className="border-sky-500/40 text-sky-700">
              {autoFilledCount} added from the ephemeris
            </Badge>
          )}
        </div>

        {autoFilledCount > 0 && (
          <p className="rounded-md border border-sky-500/30 bg-sky-500/5 px-3 py-2 text-[11px] text-muted-foreground">
            Anything the file did not contain was calculated and filled in automatically, so the chart is
            complete. Values that were read from your file or typed by hand are never replaced.
          </p>
        )}




        <div className="divide-y divide-border rounded-md border border-border overflow-hidden">
          {rows.map((r) => {
            const style = STATUS_STYLE[r.status] || STATUS_STYLE.unavailable;
            const isProblem = r.status === 'mismatch' || r.retrogradeMismatch;
            return (
              <div key={r.body} className={`px-3 py-2 text-xs ${isProblem ? STATUS_STYLE.mismatch.row : style.row}`}>
                <div className="flex items-center gap-2">
                  {isProblem ? STATUS_STYLE.mismatch.icon : style.icon}
                  <span className="font-medium w-32 truncate">{r.label}</span>
                  <span className="flex-1 tabular-nums">
                    {r.entered ? formatPosition(r.entered) : <span className="text-muted-foreground">not read</span>}
                  </span>
                  <span className="flex-1 tabular-nums text-muted-foreground">
                    {r.computed ? formatPosition(r.computed) : '—'}
                  </span>
                  {r.deltaArcmin !== null && (
                    <span className="w-14 text-right text-muted-foreground">{formatDelta(r.deltaArcmin)}</span>
                  )}
                </div>
                {(isProblem || r.status === 'missing') && (
                  <div className="pl-6 pt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>
                      {r.retrogradeMismatch && r.status !== 'mismatch'
                        ? 'The retrograde marker disagrees with the ephemeris.'
                        : r.status === 'missing'
                          ? 'The ephemeris value is available if you want it.'
                          : `The ephemeris puts it at ${formatPosition(r.computed)}.`}
                    </span>
                    {onApplyValue && r.computed && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => onApplyValue(r.body, r.computed!)}
                      >
                        Use ephemeris value
                      </Button>
                    )}
                  </div>
                )}
                {r.note && r.status !== 'verified' && (
                  <div className="pl-6 pt-0.5 text-[10px] text-muted-foreground">{r.note}</div>
                )}
              </div>
            );
          })}
        </div>

        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowAll(v => !v)}>
          {showAll ? 'Show only what matters' : `Show all ${report.results.length} bodies`}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChartVerificationPanel;
