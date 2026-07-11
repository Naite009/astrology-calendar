import { X } from "lucide-react";
import { useEffect } from "react";
import type { PersonalReading } from "@/lib/guidePersonalizers/divineFeminine";

interface GuideConceptModalProps {
  open: boolean;
  onClose: () => void;
  reading: PersonalReading | null;
  chartName?: string;
}

export const GuideConceptModal = ({ open, onClose, reading, chartName }: GuideConceptModalProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !reading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-border pb-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {chartName ? `Reading for ${chartName}` : "Personal reading"}
            </div>
            <h2 className="mt-1 font-serif text-2xl font-light text-foreground">
              {reading.title}
            </h2>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {reading.missing ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{reading.missing}</p>
        ) : (
          <div className="space-y-5">
            <section>
              <div className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                Placement
              </div>
              <div className="text-base text-foreground">{reading.placement}</div>
            </section>

            {reading.aspects.length > 0 && (
              <section>
                <div className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  Tightest aspects
                </div>
                <ul className="space-y-1 text-sm text-foreground">
                  {reading.aspects.map((a, i) => (
                    <li key={i}>
                      <span className="font-medium">{a.symbol}</span>{" "}
                      {a.aspect} natal {a.natalBody}{" "}
                      <span className="text-muted-foreground">(orb {a.orb}°)</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <div className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                What this means for you
              </div>
              <p className="text-sm leading-relaxed text-foreground">{reading.reading}</p>
            </section>

            <section>
              <div className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                Do this
              </div>
              <p className="text-sm leading-relaxed text-foreground">{reading.doThis}</p>
            </section>

            {reading.cadence && (
              <section className="rounded-md border border-border/60 bg-secondary/30 p-3">
                <div className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
                  How personal is this?
                </div>
                <p className="text-sm leading-relaxed text-foreground">{reading.cadence}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
