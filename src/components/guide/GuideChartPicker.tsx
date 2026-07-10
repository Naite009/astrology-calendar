import { useMemo, useState } from "react";
import { Star, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { NatalChart } from "@/hooks/useNatalChart";

interface GuideChartPickerProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  activeChartId: string | null;
  onSelect: (id: string) => void;
}

// Shared "Reading for…" picker used across Guide sections.
// Primary user is pinned to the top with an amber star, everyone else is alphabetical.
export function GuideChartPicker({
  userNatalChart,
  savedCharts,
  activeChartId,
  onSelect,
}: GuideChartPickerProps) {
  const [open, setOpen] = useState(false);

  const people = useMemo(() => {
    const list: { id: string; chart: NatalChart; isPrimary: boolean }[] = [];
    if (userNatalChart) {
      list.push({ id: "user", chart: userNatalChart, isPrimary: true });
    }
    const rest = [...savedCharts]
      .filter((c) => c && c.name)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    for (const c of rest) {
      list.push({ id: c.id!, chart: c, isPrimary: false });
    }
    return list;
  }, [userNatalChart, savedCharts]);

  const selected = people.find((p) => p.id === activeChartId) || null;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
        Reading for
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full sm:w-[260px] justify-between font-normal"
          >
            <span className="truncate flex items-center gap-1.5">
              {selected ? (
                <>
                  {selected.isPrimary && (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  )}
                  {selected.chart.name}
                </>
              ) : (
                "Select a person"
              )}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0 z-50 bg-background" align="start">
          <Command>
            <CommandInput placeholder="Search people..." />
            <CommandList className="max-h-[320px]">
              <CommandEmpty>No person found.</CommandEmpty>
              <CommandGroup>
                {people.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.chart.name ?? p.id}
                    onSelect={() => {
                      onSelect(p.id);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        activeChartId === p.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {p.isPrimary && (
                      <Star className="mr-1.5 h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    )}
                    <span className="truncate">{p.chart.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
