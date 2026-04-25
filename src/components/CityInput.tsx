import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { resolveCity, type ResolvedCity } from "@/lib/cityResolver";
import { cn } from "@/lib/utils";

/**
 * CityInput — text field with live city validation.
 *
 * As the user types we run the value through the city resolver. When a
 * confident match is found we surface:
 *   • a green check inside the input (right side)
 *   • a small helper line below showing the canonical form when the match
 *     differs from what the user typed (e.g. "wynwyd pa" → "Wynnewood, PA").
 *
 * The parent owns the raw string value; we additionally bubble up the
 * resolved canonical form via onResolve so the reading prompt can use the
 * corrected city name when the user submits.
 */
export interface CityInputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
  onResolve?: (resolved: ResolvedCity | null) => void;
  disabled?: boolean;
}

export const CityInput = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  onResolve,
  disabled,
}: CityInputProps) => {
  const [resolved, setResolved] = useState<ResolvedCity | null>(null);

  const trimmed = value.trim();
  const next = useMemo(() => resolveCity(trimmed), [trimmed]);

  useEffect(() => {
    setResolved(next);
    onResolve?.(next);
    // We intentionally exclude onResolve from deps to avoid re-triggering on
    // identity changes from the parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next?.canonical, next?.confidence, trimmed]);

  const showCheck = !!resolved && trimmed.length >= 2;
  // Always surface the canonical city we're going to use whenever a match is
  // active — even when the user typed it perfectly. This makes it explicit
  // what gets sent to the reading and prevents the "Using …" line from
  // disappearing as you finish typing.
  const showCanonical = showCheck;

  return (
    <div className="space-y-1">
      <label
        className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          maxLength={80}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn("text-sm pr-8", showCheck && "border-success/60")}
          aria-describedby={showCanonical ? `${id}-corrected` : undefined}
        />
        {showCheck && (
          <Check
            className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-success"
            aria-label="City recognized"
          />
        )}
      </div>
      {showCanonical && (
        <p
          id={`${id}-corrected`}
          className="text-[10px] text-success"
        >
          Using <span className="font-medium">{resolved!.canonical}</span>
        </p>
      )}
    </div>
  );
};
