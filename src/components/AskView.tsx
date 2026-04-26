import { useState, useRef, useEffect, useMemo, useCallback } from "react"; // deterministic correction v2
import { Send, Loader2, Sparkles, User, Trash2, Search, Star, ChevronDown, Download, History, X, Plus, RefreshCw, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NatalChart } from "@/hooks/useNatalChart";
import { SolarReturnChart } from "@/hooks/useSolarReturnChart";
import { toast } from "sonner";
import { getPlanetaryPositions, isPlanetRetrograde, getDetailedJunoPosition } from "@/lib/astrology";
import { calculateTransitAspects } from "@/lib/transitAspects";
import { buildDeterministicTimingData, mergeDeterministicTimingSection } from "@/lib/deterministicTiming";
import * as Astronomy from 'astronomy-engine';
import { calculateNatalAstrocartography } from "@/lib/natalAstrocartography";
import { generateNatalPortrait } from "@/lib/natalPortraitEngine";
import { analyzeSolarReturn } from "@/lib/solarReturnAnalysis";
import { calculateAstrocartography } from "@/lib/solarReturnAstrocartography";
import { formatDateMMDDYYYY, formatLocalDateKey } from "@/lib/localDate";
import { generateAskPdf } from "@/lib/askPdfExport";
import { validateAndPrepareReadingsForExport } from "@/lib/preExportValidator";
import { buildAskValidationFactsBlock } from "@/lib/askValidationFacts";
import { formatLocationTitleCase } from "@/lib/locationFormat";
import { ReadingRenderer, StructuredReading } from "@/components/AskReadingRenderer";
import { AskQuickTopics } from "@/components/AskQuickTopics";
import { runAskJob, pollAskJob, readActiveJobId, writeActiveJobId, normalizeAskResult } from "@/lib/askJobClient";
import { supabase } from "@/integrations/supabase/client";
import { AskGenerationStatus } from "@/components/AskGenerationStatus";
import { findMatchingSolarReturn } from "@/lib/findMatchingSolarReturn";
import { correctSrPlanetsRetrograde } from "@/lib/srRetrogradeTruth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatEntry {
  role: "user" | "assistant";
  content: string; // user question text
  reading?: StructuredReading; // structured data for assistant
}

interface SavedConversation {
  id: string;
  chartName: string;
  chartId: string;
  entries: ChatEntry[];
  timestamp: number;
}

interface AskActiveMeta {
  selectedChartId: string;
  threadIds: Record<string, string>;
}

interface AskViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartId: string | null;
  solarReturnCharts?: SolarReturnChart[];
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-astrology`;
const STORAGE_KEY = "ask-conversations";
const LEGACY_ACTIVE_CHAT_KEY = "ask-active-chat";
const ACTIVE_CHAT_KEY_PREFIX = "ask-active-chat:";
const ACTIVE_META_KEY = "ask-active-meta";
const LAST_READING_KEY_PREFIX = "ask-last-reading:";
const MAX_SAVED_CONVERSATIONS = 50;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown, fallbackValue?: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[AskView] Failed to persist ${key}`, error);

    if (fallbackValue === undefined) return;

    try {
      localStorage.setItem(key, JSON.stringify(fallbackValue));
    } catch (retryError) {
      console.error(`[AskView] Failed to persist fallback for ${key}`, retryError);
    }
  }
}

function getActiveChatKey(chartId: string) {
  return `${ACTIVE_CHAT_KEY_PREFIX}${chartId}`;
}

function loadLegacyActiveChat(): { chartId: string; entries: ChatEntry[] } | null {
  const parsed = readStorage<unknown>(LEGACY_ACTIVE_CHAT_KEY, null);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }

  const record = parsed as { chartId?: unknown; entries?: unknown };
  return {
    chartId: typeof record.chartId === "string" ? record.chartId : "user",
    entries: Array.isArray(record.entries) ? (record.entries as ChatEntry[]) : [],
  };
}

function clearLegacyActiveChat() {
  try {
    localStorage.removeItem(LEGACY_ACTIVE_CHAT_KEY);
  } catch {
    // ignore cleanup failures
  }
}

function loadConversations(): SavedConversation[] {
  const parsed = readStorage<unknown>(STORAGE_KEY, []);
  const conversations = Array.isArray(parsed) ? (parsed as SavedConversation[]) : [];
  return conversations.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

function saveConversations(convos: SavedConversation[]) {
  const trimmed = convos.slice(0, MAX_SAVED_CONVERSATIONS);
  writeStorage(STORAGE_KEY, trimmed, trimmed.slice(0, 20));
}

function loadActiveMeta(): AskActiveMeta {
  const parsed = readStorage<Partial<AskActiveMeta>>(ACTIVE_META_KEY, {});
  const legacy = loadLegacyActiveChat();
  const threadIds =
    parsed.threadIds && typeof parsed.threadIds === "object" && !Array.isArray(parsed.threadIds)
      ? (parsed.threadIds as Record<string, string>)
      : {};

  return {
    selectedChartId:
      typeof parsed.selectedChartId === "string" ? parsed.selectedChartId : legacy?.chartId || "user",
    threadIds,
  };
}

function saveActiveMeta(meta: AskActiveMeta) {
  writeStorage(ACTIVE_META_KEY, meta);
}

function loadActiveChat(chartId: string): ChatEntry[] {
  const parsed = readStorage<unknown>(getActiveChatKey(chartId), []);

  if (Array.isArray(parsed) && parsed.length > 0) {
    return parsed as ChatEntry[];
  }

  const legacy = loadLegacyActiveChat();
  if (legacy?.chartId === chartId && legacy.entries.length > 0) {
    writeStorage(getActiveChatKey(chartId), legacy.entries, legacy.entries.slice(-12));
    clearLegacyActiveChat();
    return legacy.entries;
  }

  return Array.isArray(parsed) ? (parsed as ChatEntry[]) : [];
}

function saveActiveChat(chartId: string, entries: ChatEntry[]) {
  writeStorage(getActiveChatKey(chartId), entries, entries.slice(-12));
}

function removeActiveChat(chartId: string) {
  try {
    localStorage.removeItem(getActiveChatKey(chartId));
  } catch {
    // ignore storage cleanup failures
  }
}

function getLastReadingKey(chartId: string) {
  return `${LAST_READING_KEY_PREFIX}${chartId}`;
}

function evictOldAskReadings(keepKey: string) {
  // When localStorage is full, drop every other ask-last-reading:* entry to make
  // room for the one the user just generated. Without this the export silently
  // returns a stale reading from a different chart.
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(LAST_READING_KEY_PREFIX) && k !== keepKey) {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => {
      try { localStorage.removeItem(k); } catch { /* ignore */ }
    });
    return toRemove.length;
  } catch {
    return 0;
  }
}

function saveLastReading(chartId: string, chartMeta: { name: string; birthDate?: string; birthTime?: string; birthLocation?: string }, readings: StructuredReading[]) {
  const key = getLastReadingKey(chartId);
  const payload = {
    chart: chartMeta,
    savedAt: new Date().toISOString(),
    readings,
  };
  const serialized = JSON.stringify(payload);
  try {
    localStorage.setItem(key, serialized);
  } catch (err) {
    // Quota exceeded — evict every OTHER cached ask reading and retry once so
    // at least the freshly generated reading survives a page reload.
    const evicted = evictOldAskReadings(key);
    console.warn(`[AskView] localStorage quota hit while saving last reading; evicted ${evicted} older ask reading(s) and retrying`, err);
    try {
      localStorage.setItem(key, serialized);
    } catch (retryErr) {
      console.error("[AskView] Still cannot persist last reading after eviction; export will rely on in-memory state only", retryErr);
    }
  }
}

function loadLastReading(chartId: string): { chart: any; savedAt: string; readings: StructuredReading[] } | null {
  try {
    const raw = localStorage.getItem(getLastReadingKey(chartId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.readings) && parsed.readings.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function displayBirthDate(date?: string) {
  return formatDateMMDDYYYY(date) || date || "";
}

function formatTime12h(time?: string): string {
  if (!time) return "";
  const parts = time.split(":");
  let h = parseInt(parts[0], 10);
  const m = parts[1] || "00";
  if (isNaN(h)) return time;
  const suffix = h >= 12 ? "P.M." : "A.M.";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${m} ${suffix}`;
}

function formatSavedAt(savedAt?: string): string {
  if (!savedAt) return "";
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return savedAt;
  return date.toLocaleString([], {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const AskView = ({ userNatalChart, savedCharts, selectedChartId: initialChartId, solarReturnCharts = [] }: AskViewProps) => {
  const initialMetaRef = useRef<AskActiveMeta>(loadActiveMeta());
  const initialAskChartIdRef = useRef<string>(
    initialMetaRef.current.selectedChartId || initialChartId || "user"
  );
  const activeChartIdRef = useRef<string>(initialAskChartIdRef.current);
  const threadIdsRef = useRef<Record<string, string>>(initialMetaRef.current.threadIds || {});

  const [activeChartId, setActiveChartId] = useState<string>(initialAskChartIdRef.current);
  const [entries, setEntries] = useState<ChatEntry[]>(() => loadActiveChat(initialAskChartIdRef.current));
  const [threadIds, setThreadIds] = useState<Record<string, string>>(threadIdsRef.current);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Track when generation started + latest job status so we can show an
  // elapsed-time counter and stage messages during the 4-7 min wait.
  const [loadingStartedAt, setLoadingStartedAt] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<"submitting" | "queued" | "processing" | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setLoadingStartedAt(null);
      setJobStatus(null);
      toast.info("Generation stopped.");
    }
  };
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [chartSearch, setChartSearch] = useState("");

  // Relocation Quick Topic city inputs are now collected inline inside
  // AskQuickTopics. The userLocations object is delivered straight to
  // handleQuickTopic via the AskQuickTopics onSelect callback, so AskView
  // no longer needs to host its own city-input state.


  const syncThreadIds = useCallback((nextThreadIds: Record<string, string>) => {
    threadIdsRef.current = nextThreadIds;
    setThreadIds(nextThreadIds);
  }, []);

  const assignThreadId = useCallback((chartId: string, conversationId: string) => {
    syncThreadIds({ ...threadIdsRef.current, [chartId]: conversationId });
  }, [syncThreadIds]);

  const clearThreadId = useCallback((chartId: string) => {
    if (!(chartId in threadIdsRef.current)) return;
    const nextThreadIds = { ...threadIdsRef.current };
    delete nextThreadIds[chartId];
    syncThreadIds(nextThreadIds);
  }, [syncThreadIds]);

  useEffect(() => {
    activeChartIdRef.current = activeChartId;
  }, [activeChartId]);

  useEffect(() => {
    saveActiveMeta({ selectedChartId: activeChartId, threadIds });
  }, [activeChartId, threadIds]);

  useEffect(() => {
    if (entries.length === 0) {
      removeActiveChat(activeChartId);
      return;
    }

    saveActiveChat(activeChartId, entries);
  }, [entries, activeChartId]);

  // Auto-resume an in-flight job after page reload, tab-switch, or HMR.
  // If localStorage has an `ask-active-job:<chartId>` entry, silently poll
  // it. When complete, append the assistant entry — exactly as if the
  // original request had finished.
  useEffect(() => {
    const jobId = readActiveJobId(activeChartId);
    if (!jobId || isLoading) return;

    let cancelled = false;
    const controller = new AbortController();

    const chartForRequest = selectedChart;
    const chartIdForRequest = activeChartId;
    const chartNameForRequest = chartForRequest?.name || "Unknown";

    // Helper to apply a completed job's result to the chat.
    const applyCompletedJob = (job: any) => {
      if (job.status === "failed") {
        toast.error(job.error_message || "Previous reading failed.");
        return;
      }
      const data: any = normalizeAskResult(job.result || {});
      if (data.error) { toast.error(data.error); return; }

      let assistantEntry: ChatEntry;
      if (data.sections) {
        const currentSR = findMatchingSolarReturn(solarReturnCharts, chartForRequest, chartIdForRequest);
        const corrected = mergeDeterministicTimingSection(
          correctPlacementData(data, chartForRequest, currentSR),
          null,
        );
        assistantEntry = { role: "assistant", content: "", reading: corrected as StructuredReading };
      } else if (data.raw) {
        assistantEntry = { role: "assistant", content: data.raw };
      } else {
        assistantEntry = { role: "assistant", content: JSON.stringify(data, null, 2) };
      }

      if (activeChartIdRef.current !== chartIdForRequest) return;
      setEntries((prev) => {
        const next = [...prev, assistantEntry];
        saveActiveChat(chartIdForRequest, next);
        upsertConversationSnapshot(next, chartIdForRequest, chartNameForRequest);
        if (assistantEntry.reading && chartForRequest) {
          saveLastReading(chartIdForRequest, {
            name: chartForRequest.name,
            birthDate: chartForRequest.birthDate,
            birthTime: chartForRequest.birthTime,
            birthLocation: formatLocationTitleCase(chartForRequest.birthLocation || ""),
          }, [assistantEntry.reading]);
        }
        return next;
      });
      toast.success("Your reading is ready.");
    };

    // STEP 1: Probe the job status BEFORE showing any "resuming" UI.
    // If the job is already completed/failed, attach the result silently.
    // If it's stale (older than 15 min and still queued/processing), drop it.
    // Only show the "Resuming…" indicator if the job is genuinely in flight.
    (async () => {
      try {
        const { data: row, error } = await supabase
          .from("ask_jobs")
          .select("id,status,result,error_message,created_at,completed_at")
          .eq("id", jobId)
          .maybeSingle();

        if (cancelled) return;

        if (error || !row) {
          // Job row gone or unreadable — clear the stale key, do nothing.
          writeActiveJobId(activeChartId, null);
          return;
        }

        // Terminal states: apply immediately, no toast/timer.
        if (row.status === "completed" || row.status === "failed") {
          writeActiveJobId(activeChartId, null);
          applyCompletedJob(row);
          return;
        }

        // Still in-flight. Sanity check: drop if too old (server side cap is 10 min).
        const ageMs = Date.now() - new Date(row.created_at).getTime();
        if (row.status === "queued" && ageMs > 75 * 1000) {
          console.warn(`[AskView] Dropping queued job that never started ${jobId} (age ${Math.round(ageMs / 1000)}s)`);
          writeActiveJobId(activeChartId, null);
          toast.error("The report queue did not start. Please run it again.");
          return;
        }

        if (ageMs > 15 * 60 * 1000) {
          console.warn(`[AskView] Dropping stale active job ${jobId} (age ${Math.round(ageMs / 1000)}s)`);
          writeActiveJobId(activeChartId, null);
          return;
        }

        // Genuinely in-flight — show resume UI and start polling.
        abortControllerRef.current = controller;
        setIsLoading(true);
        setLoadingStartedAt(new Date(row.created_at).getTime());
        setJobStatus(row.status as any);
        window.__askInFlight = true;
        console.log(`[AskView] Resuming in-flight job ${jobId} for chart ${activeChartId}`);
        toast.info("Resuming your previous reading…");

        try {
          const job = await pollAskJob(jobId, {
            chartId: activeChartId,
            signal: controller.signal,
            onProgress: (status) => setJobStatus(status === "completed" || status === "failed" ? null : status),
          });
          if (cancelled) return;
          applyCompletedJob(job);
        } catch (err: any) {
          if (err?.name === "AbortError") return;
          console.error("[AskView] Resume poll error:", err);
          writeActiveJobId(activeChartId, null);
          if (String(err?.message || "") === "QUEUE_STALE") {
            toast.error("The report queue did not start. Please run it again.");
          }
        } finally {
          if (cancelled) return;
          setIsLoading(false);
          setLoadingStartedAt(null);
          setJobStatus(null);
          window.__askInFlight = false;
          abortControllerRef.current = null;
        }
      } catch (err) {
        console.error("[AskView] Resume probe error:", err);
        writeActiveJobId(activeChartId, null);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChartId]);

  const chartOptions = useMemo(() => {
    const others = savedCharts
      .filter(c => c.id !== userNatalChart?.id && !(c as any).isSolarReturn)
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return { primary: userNatalChart, others };
  }, [userNatalChart, savedCharts]);

  useEffect(() => {
    const chartExists =
      activeChartId === "user"
        ? Boolean(userNatalChart)
        : savedCharts.some(chart => chart.id === activeChartId);

    if (chartExists) return;

    const preferredSavedChartId =
      initialChartId && savedCharts.some(chart => chart.id === initialChartId)
        ? initialChartId
        : null;
    const fallbackChartId = userNatalChart ? "user" : preferredSavedChartId || savedCharts[0]?.id || "user";

    if (fallbackChartId === activeChartId) return;

    setActiveChartId(fallbackChartId);
    setEntries(loadActiveChat(fallbackChartId));
  }, [activeChartId, initialChartId, savedCharts, userNatalChart]);

  const filteredOthers = useMemo(() => {
    if (!chartSearch.trim()) return chartOptions.others;
    const q = chartSearch.toLowerCase();
    return chartOptions.others.filter(c => c.name?.toLowerCase().includes(q));
  }, [chartOptions.others, chartSearch]);

  const getSelectedChart = (): NatalChart | null => {
    if (activeChartId === "user") return userNatalChart;
    return savedCharts.find(c => c.id === activeChartId) || userNatalChart;
  };
  const selectedChart = getSelectedChart();

  const upsertConversationSnapshot = useCallback((nextEntries: ChatEntry[], chartId: string, chartName: string) => {
    if (!nextEntries.some(entry => entry.role === "assistant")) return;

    const existingThreadId = threadIdsRef.current[chartId];
    const conversationId = existingThreadId || `${chartId}-${Date.now()}`;

    if (!existingThreadId) {
      assignThreadId(chartId, conversationId);
    }

    const convo: SavedConversation = {
      id: conversationId,
      chartName,
      chartId,
      entries: [...nextEntries],
      timestamp: Date.now(),
    };

    const existing = loadConversations().filter(conversation => conversation.id !== conversationId);
    saveConversations([convo, ...existing]);
  }, [assignThreadId]);

  const selectChart = (id: string) => {
    if (id !== activeChartId) {
      setActiveChartId(id);
      setEntries(loadActiveChat(id));
    }
    setSelectorOpen(false);
    setChartSearch("");
  };

  const loadConversation = (convo: SavedConversation) => {
    // Resolve the chart id: use the saved chartId if it still exists, otherwise try to match by name
    let resolvedChartId = convo.chartId;
    const chartExists =
      convo.chartId === "user"
        ? Boolean(userNatalChart)
        : savedCharts.some(c => c.id === convo.chartId);

    if (!chartExists) {
      // Try matching by chart name
      if (userNatalChart && userNatalChart.name === convo.chartName) {
        resolvedChartId = "user";
      } else {
        const match = savedCharts.find(c => c.name === convo.chartName);
        if (match) resolvedChartId = match.id!;
      }
    }

    assignThreadId(resolvedChartId, convo.id);
    setActiveChartId(resolvedChartId);
    setEntries(convo.entries);
    setShowHistory(false);
  };

  const deleteConversation = (id: string) => {
    const existing = loadConversations();
    const deletedConversation = existing.find(conversation => conversation.id === id);
    saveConversations(existing.filter(conversation => conversation.id !== id));

    if (deletedConversation && threadIdsRef.current[deletedConversation.chartId] === id) {
      clearThreadId(deletedConversation.chartId);
    }

    toast.success("Conversation deleted");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const buildChartContext = (chart: NatalChart | null, timingContext: string = ""): string => {
    if (!chart) return "No chart data available.";
    const planets = chart.planets || {};
    const houseCusps = chart.houseCusps || {};
    let context = `Chart for ${chart.name}:\n`;
    context += `Birth: ${displayBirthDate(chart.birthDate)}`;
    if (chart.birthTime) context += ` at ${chart.birthTime}`;
    if (chart.birthLocation) context += ` in ${formatLocationTitleCase(chart.birthLocation)}`;
    context += "\n\nNATAL Planetary Positions (with calculated house placements):\n";
    const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const cuspLongitudes: number[] = [];
    if (Object.keys(houseCusps).length > 0) {
      for (let i = 1; i <= 12; i++) {
        const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
        if (cusp && typeof cusp === 'object' && 'sign' in cusp) {
          const c = cusp as { sign: string; degree: number; minutes?: number };
          cuspLongitudes.push(ZODIAC.indexOf(c.sign) * 30 + c.degree + (c.minutes || 0) / 60);
        }
      }
    }
    const calcHouse = (absDeg: number): number | null => {
      if (cuspLongitudes.length !== 12) return null;
      for (let i = 0; i < 12; i++) {
        const nextI = (i + 1) % 12;
        let start = cuspLongitudes[i];
        let end = cuspLongitudes[nextI];
        if (end < start) end += 360;
        let d = absDeg;
        if (d < start) d += 360;
        if (d >= start && d < end) return i + 1;
      }
      return 1;
    };
    // SOURCE-OF-TRUTH OVERRIDE for angles: derive Ascendant/Descendant/MC/IC
    // from houseCusps (the deterministic source) rather than chart.planets,
    // which has historically contained corrupted/swapped angle data from
    // OCR imports. This is the upstream fix for "Ascendant Aries house 1"
    // when the real angle is Libra house 1 — the wrong value was being
    // emitted into the NATAL Planetary Positions block sent to the AI,
    // causing every downstream correction pass to fight a bad input.
    const h1Override = (houseCusps as any)?.house1;
    const h7Override = (houseCusps as any)?.house7;
    const h10Override = (houseCusps as any)?.house10;
    const h4Override = (houseCusps as any)?.house4;
    const angleOverrides: Record<string, { sign: string; degree: number; minutes?: number }> = {};
    if (h1Override?.sign) angleOverrides.Ascendant = h1Override;
    if (h7Override?.sign) angleOverrides.Descendant = h7Override;
    if (h10Override?.sign) angleOverrides.Midheaven = h10Override;
    if (h4Override?.sign) angleOverrides.IC = h4Override;
    const planetEntries = Object.entries(planets) as Array<[string, any]>;
    // Ensure Ascendant/Descendant/MC/IC always emit, even if absent from planets map.
    for (const angleName of Object.keys(angleOverrides)) {
      if (!planetEntries.some(([n]) => n === angleName)) {
        planetEntries.push([angleName, angleOverrides[angleName]]);
      }
    }
    planetEntries.forEach(([planet, data]) => {
      // For the four cardinal angles, ALWAYS use houseCusps as source of truth.
      const override = angleOverrides[planet];
      const source = override ?? data;
      if (source && typeof source === 'object' && 'sign' in source) {
        const pos = source as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
        const absDeg = ZODIAC.indexOf(pos.sign) * 30 + pos.degree + (pos.minutes || 0) / 60;
        // Angles live on their own house cusp by definition.
        const house = override
          ? (planet === 'Ascendant' ? 1 : planet === 'Descendant' ? 7 : planet === 'Midheaven' ? 10 : planet === 'IC' ? 4 : calcHouse(absDeg))
          : calcHouse(absDeg);
        context += `- ${planet}: ${pos.degree}°${pos.minutes || 0}' ${pos.sign}`;
        if (house) context += ` (House ${house})`;
        if ((pos as any).isRetrograde) context += " (R)";
        context += "\n";
      }
    });
    const TRADITIONAL_RULERS: Record<string, string> = {
      Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
      Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
      Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
    };

    // Helper: compute absolute degree for any planet
    const planetAbsDeg = (name: string): number | null => {
      const p = (planets as any)[name];
      if (!p || typeof p !== 'object' || !('sign' in p)) return null;
      return ZODIAC.indexOf(p.sign) * 30 + p.degree + (p.minutes || 0) / 60;
    };

    // Helper: aspects between two planets (used for ruler-chain aspects)
    const ASPECTS: Array<{ name: string; symbol: string; angle: number; orb: number }> = [
      { name: 'conjunct', symbol: '☌', angle: 0, orb: 8 },
      { name: 'sextile', symbol: '⚹', angle: 60, orb: 5 },
      { name: 'square', symbol: '□', angle: 90, orb: 7 },
      { name: 'trine', symbol: '△', angle: 120, orb: 7 },
      { name: 'opposition', symbol: '☍', angle: 180, orb: 8 },
    ];
    const aspectBetween = (a: number, b: number) => {
      let diff = Math.abs(a - b) % 360;
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECTS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) return { ...asp, orb: orb.toFixed(2) };
      }
      return null;
    };

    if (Object.keys(houseCusps).length > 0) {
      context += "\nHouse Cusps (with traditional rulers):\n";
      for (let i = 1; i <= 12; i++) {
        const cusp = (houseCusps as any)[`house${i}`];
        if (cusp && 'sign' in cusp) {
          const ruler = TRADITIONAL_RULERS[cusp.sign] || 'Unknown';
          context += `- House ${i}: ${cusp.degree}° ${cusp.sign} — ruled by ${ruler}\n`;
        }
      }
    }

    // --- PLANETS GROUPED BY HOUSE (so AI never has to guess what's in each house) ---
    if (cuspLongitudes.length === 12) {
      const planetsByHouse: Record<number, string[]> = {};
      for (let h = 1; h <= 12; h++) planetsByHouse[h] = [];
      Object.entries(planets).forEach(([name, data]) => {
        if (data && typeof data === 'object' && 'sign' in data) {
          const p = data as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
          const abs = ZODIAC.indexOf(p.sign) * 30 + p.degree + (p.minutes || 0) / 60;
          const h = calcHouse(abs);
          if (h) planetsByHouse[h].push(`${name} ${p.degree}°${p.minutes || 0}' ${p.sign}${p.isRetrograde ? ' R' : ''}`);
        }
      });
      context += "\nPlanets In Each House:\n";
      for (let h = 1; h <= 12; h++) {
        const list = planetsByHouse[h];
        context += `- House ${h}: ${list.length ? list.join('; ') : '(empty)'}\n`;
      }
    }

    // --- RULER CHAINS for relationship-relevant houses (1, 4, 5, 7, 8, 12) ---
    // For each, resolve: cusp sign → its ruler → the ruler's sign/house → tight aspects to relational bodies.
    const RELATIONAL_HOUSES = [1, 4, 5, 7, 8, 12];
    const RELATIONAL_BODIES = ['Sun', 'Moon', 'Venus', 'Mars', 'Saturn', 'Jupiter', 'Mercury', 'Pluto', 'Neptune', 'Uranus', 'Chiron', 'Juno'];
    if (cuspLongitudes.length === 12) {
      context += "\nRuler Chains (cusp sign → ruler → where ruler lives → tight aspects):\n";
      for (const h of RELATIONAL_HOUSES) {
        const cusp = (houseCusps as any)[`house${h}`];
        if (!cusp || !('sign' in cusp)) continue;
        const cuspSign = cusp.sign;
        const ruler = TRADITIONAL_RULERS[cuspSign];
        const rulerData = (planets as any)[ruler];
        if (!rulerData || !('sign' in rulerData)) {
          context += `- House ${h} cusp: ${cuspSign} → ruler ${ruler} (position not available)\n`;
          continue;
        }
        const rulerAbs = ZODIAC.indexOf(rulerData.sign) * 30 + rulerData.degree + (rulerData.minutes || 0) / 60;
        const rulerHouse = calcHouse(rulerAbs);
        const retro = rulerData.isRetrograde ? ' R' : '';
        let line = `- House ${h} cusp: ${cusp.degree}° ${cuspSign} → ruler ${ruler} sits in ${rulerData.degree}°${rulerData.minutes || 0}' ${rulerData.sign}${retro}`;
        if (rulerHouse) line += ` (House ${rulerHouse})`;
        // Tight aspects from this ruler to relational bodies
        const tight: string[] = [];
        for (const body of RELATIONAL_BODIES) {
          if (body === ruler) continue;
          const otherAbs = planetAbsDeg(body);
          if (otherAbs == null) continue;
          const asp = aspectBetween(rulerAbs, otherAbs);
          if (asp && parseFloat(asp.orb) <= 4) {
            tight.push(`${asp.symbol} ${body} (orb ${asp.orb}°)`);
          }
        }
        if (tight.length) line += ` — tight aspects: ${tight.join(', ')}`;
        context += line + "\n";
      }
    }

    // --- KEY RELATIONSHIP POINTS (Descendant headline) ---
    const house7Cusp = houseCusps.house7 as { sign: string; degree: number } | undefined;
    if (house7Cusp) {
      const dscSign = house7Cusp.sign;
      const ruler7 = TRADITIONAL_RULERS[dscSign] || 'Unknown';
      context += `\nKey Relationship Points:\n`;
      context += `- Descendant (7th house cusp): ${house7Cusp.degree}° ${dscSign}\n`;
      context += `- 7th House Ruler: ${ruler7} (rules ${dscSign}) — see Ruler Chains above for where Saturn/this ruler actually sits and what it touches\n`;
    }

    // --- JUNO & LILITH (if available in chart data) ---
    try {
      if (chart.planets?.Juno) {
        const juno = chart.planets.Juno as { sign: string; degree: number; minutes?: number };
        const junoAbsDeg = ZODIAC.indexOf(juno.sign) * 30 + juno.degree + (juno.minutes || 0) / 60;
        const junoHouse = calcHouse(junoAbsDeg);
        context += `- Juno: ${juno.degree}°${juno.minutes || 0}' ${juno.sign}`;
        if (junoHouse) context += ` (House ${junoHouse})`;
        context += "\n";
      }
      // Lilith: HARD DATA GATE — only include if sign, degree, AND house are ALL explicitly valid
      if (chart.planets?.Lilith) {
        const raw = chart.planets.Lilith as { sign: string; degree: number; minutes?: number };
        if (ZODIAC.includes(raw.sign) && typeof raw.degree === 'number' && raw.degree >= 0 && raw.degree < 30) {
          const lilithAbsDeg = ZODIAC.indexOf(raw.sign) * 30 + raw.degree + (raw.minutes || 0) / 60;
          const lilithHouse = calcHouse(lilithAbsDeg);
          // Only include Lilith if house can be calculated (all three fields present)
          if (lilithHouse !== null) {
            context += `- Lilith: ${raw.degree}°${raw.minutes || 0}' ${raw.sign} (House ${lilithHouse})\n`;
          }
        }
      }
      // If Lilith data is missing, malformed, or house cannot be calculated, it is silently omitted.
      // No recalculation, no inference, no fallback.
    } catch {}

    context += "\n--- CURRENT TRANSITS (today's sky) ---\n";
    const PLANET_BODIES: Record<string, any> = {
      mercury: Astronomy.Body.Mercury, venus: Astronomy.Body.Venus, mars: Astronomy.Body.Mars,
      jupiter: Astronomy.Body.Jupiter, saturn: Astronomy.Body.Saturn, uranus: Astronomy.Body.Uranus,
      neptune: Astronomy.Body.Neptune, pluto: Astronomy.Body.Pluto
    };
    try {
      const now = new Date();
      const nowPlanets = getPlanetaryPositions(now);
      const signGlyphMap: Record<string, string> = { '♈':'Aries','♉':'Taurus','♊':'Gemini','♋':'Cancer','♌':'Leo','♍':'Virgo','♎':'Libra','♏':'Scorpio','♐':'Sagittarius','♑':'Capricorn','♒':'Aquarius','♓':'Pisces' };
      Object.entries(nowPlanets).forEach(([key, val]: [string, any]) => {
        if (['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(key) && val) {
          const sign = val.signName || signGlyphMap[val.sign] || val.sign || 'Unknown';
          const deg = typeof val.degree === 'number' ? val.degree.toFixed(1) : val.degree || 0;
          let line = `- Transiting ${key.charAt(0).toUpperCase() + key.slice(1)}: ${deg}° ${sign}`;
          // Add retrograde status
          const body = PLANET_BODIES[key];
          if (body) {
            try {
              if (isPlanetRetrograde(body, now)) line += ' (R)';
            } catch {}
          }
          context += line + "\n";
        }
      });

      // --- PRE-COMPUTED TRANSIT-TO-NATAL ASPECTS ---
      try {
        const transitAspects = calculateTransitAspects(now, nowPlanets, chart);
        if (transitAspects.length > 0) {
          context += "\n--- ACTIVE TRANSIT ASPECTS TO NATAL CHART ---\n";
          const sorted = [...transitAspects].sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));
          for (const ta of sorted.slice(0, 15)) {
            context += `- Transiting ${ta.transitPlanet} ${ta.transitDegree.toFixed(1)}° ${ta.transitSign} ${ta.symbol} Natal ${ta.natalPlanet} ${ta.natalDegree.toFixed(1)}° ${ta.natalSign} (orb: ${ta.orb}°) — ${ta.aspect}\n`;
          }
        }
      } catch {}

      // --- PRE-COMPUTED JUPITER RETURN WINDOW (deterministic — never let AI guess) ---
      // Jupiter returns to natal position every ~12 years and is the single
      // most significant wealth/expansion window in the chart. We compute the
      // exact next return date(s) and a ±2-month opportunity window so the AI
      // (especially in money/career readings) can cite it without hallucinating.
      try {
        const natalJ = (chart.planets || {})['Jupiter'] as
          | { sign: string; degree: number; minutes?: number; isRetrograde?: boolean }
          | undefined;
        if (natalJ && typeof natalJ.degree === 'number') {
          const ZODIAC_J = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
          const natalJupAbs = (ZODIAC_J.indexOf(natalJ.sign) * 30 + natalJ.degree + (natalJ.minutes || 0) / 60) % 360;
          const ecLongJupiter = (date: Date): number => {
            const ev = Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Jupiter, date, true));
            return ((ev.elon % 360) + 360) % 360;
          };
          const signedDelta = (a: number, b: number): number => {
            // Returns shortest signed delta from a to b in (-180, 180]
            return ((b - a + 540) % 360) - 180;
          };
          const startMs = now.getTime();
          const horizonMs = startMs + 13 * 365.25 * 86400 * 1000;
          const stepMs = 7 * 86400 * 1000;
          let prevT = startMs;
          let prevD = signedDelta(ecLongJupiter(new Date(prevT)), natalJupAbs);
          const returns: Date[] = [];
          for (let t = startMs + stepMs; t <= horizonMs && returns.length < 2; t += stepMs) {
            const curD = signedDelta(ecLongJupiter(new Date(t)), natalJupAbs);
            if (prevD * curD < 0 && Math.abs(prevD) < 90 && Math.abs(curD) < 90) {
              // Bisect to ~1-hour precision
              let lo = prevT, hi = t;
              let loD = prevD;
              for (let i = 0; i < 36; i++) {
                const mid = (lo + hi) / 2;
                const mD = signedDelta(ecLongJupiter(new Date(mid)), natalJupAbs);
                if (mD * loD < 0) { hi = mid; } else { lo = mid; loD = mD; }
              }
              returns.push(new Date((lo + hi) / 2));
            }
            prevT = t;
            prevD = curD;
          }
          if (returns.length > 0) {
            context += "\n--- NATAL JUPITER RETURN WINDOWS (deterministic) ---\n";
            context += `Natal Jupiter: ${natalJ.degree}°${natalJ.minutes || 0}' ${natalJ.sign}${natalJ.isRetrograde ? ' (R)' : ''}\n`;
            context += "USE THESE for any money/career/expansion timing claims about Jupiter returns. Do NOT compute or estimate Jupiter return dates yourself — cite only the dates below.\n";
            const fmtDate = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const fmtMonth = (d: Date) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            for (const r of returns) {
              const opens = new Date(r.getTime() - 60 * 86400 * 1000);
              const closes = new Date(r.getTime() + 60 * 86400 * 1000);
              context += `- Jupiter Return exact on ${fmtDate(r)} (opportunity window approximately ${fmtMonth(opens)} through ${fmtMonth(closes)}); transiting Jupiter conjunct natal Jupiter at ${natalJ.degree}° ${natalJ.sign}.\n`;
            }
          }
        }
      } catch {}
    } catch {}

    context += buildAskValidationFactsBlock(chart);

    if (timingContext) {
      context += timingContext;
    }

    // --- SOLAR RETURN CONTEXT ---
    // Use the shared SR matcher so a SR linked under a stale natalChartId
    // (e.g. re-imported chart) still gets found via name+birthDate fallback.
    // Without this, the AI is told there is no SR data even when one exists,
    // and SR-dependent sections regress to placeholder content.
    const currentSR = findMatchingSolarReturn(solarReturnCharts, chart, activeChartId);
    if (currentSR) {
      context += `\n--- SOLAR RETURN ${currentSR.solarReturnYear} ---\n`;
      if (currentSR.solarReturnDateTime) context += `Exact SR moment: ${currentSR.solarReturnDateTime}\n`;
      if (currentSR.solarReturnLocation) context += `SR location: ${currentSR.solarReturnLocation}\n`;
      // Override stored isRetrograde flags with the deterministic truth at the
      // exact SR moment. Stored SRs created before the auto-calculator (or
      // imported via vision/manual entry) sometimes lack retrograde flags,
      // which made the SR Planetary Positions block say e.g. "SR Mercury
      // direct" when astronomy-engine clearly shows it retrograde. The
      // placement table downstream then mismatches and the gate raises
      // RETROGRADE_STATE_MISMATCH. Recomputing here is cheap and never wrong.
      const srPlanets = correctSrPlanetsRetrograde(
        currentSR.planets || {},
        currentSR.solarReturnDateTime,
      );
      const srCusps = currentSR.houseCusps || {};
      // SR HOUSES — WHOLE SIGN (deterministic upstream fix).
      // Replit's gate uses Whole Sign houses from the SR Ascendant; if we
      // emit Placidus here it will recompute and warn for every reading.
      // Whole Sign rule: house 1 = the sign on the Ascendant, then each
      // subsequent sign = the next house. A planet's house is its sign
      // index minus the Ascendant sign index, mod 12, plus 1.
      const srAscCusp = srCusps['house1' as keyof typeof srCusps] as
        { sign: string; degree: number; minutes?: number } | undefined;
      const srAscSignIdx = srAscCusp && ZODIAC.includes(srAscCusp.sign)
        ? ZODIAC.indexOf(srAscCusp.sign)
        : -1;
      const calcSRHouse = (absDeg: number): number | null => {
        if (srAscSignIdx < 0) return null;
        const planetSignIdx = Math.floor(((absDeg % 360) + 360) % 360 / 30);
        return ((planetSignIdx - srAscSignIdx + 12) % 12) + 1;
      };
      context += "SR Planetary Positions:\n";
      Object.entries(srPlanets).forEach(([planet, data]) => {
        if (data && typeof data === 'object' && 'sign' in data) {
          const pos = data as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
          const absDeg = ZODIAC.indexOf(pos.sign) * 30 + pos.degree + (pos.minutes || 0) / 60;
          const house = calcSRHouse(absDeg);
          context += `- SR ${planet}: ${pos.degree}°${pos.minutes || 0}' ${pos.sign}`;
          if (house) context += ` (SR House ${house})`;
          if (pos.isRetrograde) context += " (R)";
          context += "\n";
        }
      });
      if (Object.keys(srCusps).length > 0) {
        context += "SR House Cusps:\n";
        Object.entries(srCusps).forEach(([house, data]) => {
          if (data && typeof data === 'object' && 'sign' in data) {
            const pos = data as { sign: string; degree: number };
            const houseNum = house.replace('house', '');
            context += `- SR House ${houseNum}: ${pos.degree}° ${pos.sign}\n`;
          }
        });
      }

      // --- PRE-COMPUTED SR-TO-NATAL ASPECTS ---
      // Same pattern as transit-to-natal, but using SR planet longitudes vs.
      // natal planet longitudes. Anything in this block is authoritative — the
      // validator must NOT strip claims like "SR Mars trine natal Venus".
      try {
        const SR_NATAL_ASPECTS = [
          { name: 'conjunct', angle: 0, orb: 8, symbol: '☌' },
          { name: 'opposition', angle: 180, orb: 8, symbol: '☍' },
          { name: 'trine', angle: 120, orb: 7, symbol: '△' },
          { name: 'square', angle: 90, orb: 7, symbol: '□' },
          { name: 'sextile', angle: 60, orb: 5, symbol: '⚹' },
        ] as const;
        const natalLongs: Array<{ name: string; sign: string; degree: number; abs: number }> = [];
        const pushNatal = (name: string, pos: any) => {
          if (!pos || typeof pos !== 'object' || !('sign' in pos)) return;
          const p = pos as { sign: string; degree: number; minutes?: number };
          if (!ZODIAC.includes(p.sign)) return;
          natalLongs.push({
            name,
            sign: p.sign,
            degree: p.degree,
            abs: ZODIAC.indexOf(p.sign) * 30 + p.degree + (p.minutes || 0) / 60,
          });
        };
        // Use corrected Ascendant from houseCusps.house1 (per project rule).
        const h1 = chart.houseCusps?.house1;
        if (h1?.sign) pushNatal('Ascendant', h1);
        const h10 = chart.houseCusps?.house10;
        if (h10?.sign) pushNatal('Midheaven', h10);
        Object.entries(chart.planets || {}).forEach(([name, pos]) => {
          if (name === 'Ascendant' || name === 'Midheaven') return;
          pushNatal(name, pos);
        });

        const srLongs: Array<{ name: string; sign: string; degree: number; abs: number }> = [];
        Object.entries(srPlanets).forEach(([planet, data]) => {
          if (!data || typeof data !== 'object' || !('sign' in data)) return;
          const p = data as { sign: string; degree: number; minutes?: number };
          if (!ZODIAC.includes(p.sign)) return;
          srLongs.push({
            name: planet,
            sign: p.sign,
            degree: p.degree,
            abs: ZODIAC.indexOf(p.sign) * 30 + p.degree + (p.minutes || 0) / 60,
          });
        });

        const srNatalAspects: Array<{ sr: typeof srLongs[number]; nat: typeof natalLongs[number]; aspect: typeof SR_NATAL_ASPECTS[number]; orb: number }> = [];
        for (const sr of srLongs) {
          for (const nat of natalLongs) {
            let diff = Math.abs(sr.abs - nat.abs) % 360;
            if (diff > 180) diff = 360 - diff;
            for (const a of SR_NATAL_ASPECTS) {
              const orb = Math.abs(diff - a.angle);
              if (orb <= a.orb) {
                srNatalAspects.push({ sr, nat, aspect: a, orb });
                break;
              }
            }
          }
        }

        if (srNatalAspects.length > 0) {
          context += "\n--- ACTIVE SOLAR RETURN-TO-NATAL ASPECTS (this year) ---\n";
          const sorted = srNatalAspects.sort((a, b) => a.orb - b.orb).slice(0, 25);
          for (const sa of sorted) {
            context += `- SR ${sa.sr.name} ${sa.sr.degree.toFixed(1)}° ${sa.sr.sign} ${sa.aspect.symbol} Natal ${sa.nat.name} ${sa.nat.degree.toFixed(1)}° ${sa.nat.sign} (orb: ${sa.orb.toFixed(1)}°) — ${sa.aspect.name}\n`;
          }
        }
      } catch {}
    }

    // --- NATAL ASTROCARTOGRAPHY (deterministic, long-term) ---
    try {
      const astrocarto = calculateNatalAstrocartography(chart);
      if (astrocarto) {
        context += "\n" + astrocarto.contextString;
      }
    } catch {}

    // --- SOLAR RETURN ASTROCARTOGRAPHY (this year only) ---
    if (currentSR) {
      try {
        const srAstrocarto = calculateAstrocartography(currentSR, chart);
        if (srAstrocarto && srAstrocarto.topCities.length > 0) {
          context += `\n--- SOLAR RETURN ${currentSR.solarReturnYear} ASTROCARTOGRAPHY (this year only, changes annually) ---\n`;
          context += 'These lines are calculated from the Solar Return chart and apply ONLY to the current birthday year.\n\n';

          if (srAstrocarto.bestBeneficCity) context += `Best overall city this year: ${srAstrocarto.bestBeneficCity}\n`;
          if (srAstrocarto.worstMaleficCity) context += `Most challenging city this year: ${srAstrocarto.worstMaleficCity}\n`;
          context += '\n';

          // Top cities with intention breakdowns
          const INTENTION_KEYS = ['love', 'career', 'healing', 'adventure', 'creativity', 'vitality'] as const;
          const beneficSR = srAstrocarto.topCities
            .filter(c => c.angularPlanets.some(ap => ['Sun','Moon','Venus','Jupiter'].includes(ap.planet)))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 15);
          const cautionSR = srAstrocarto.topCities
            .filter(c => c.angularPlanets.some(ap => ['Saturn','Mars','Pluto'].includes(ap.planet)) &&
              !c.angularPlanets.some(ap => ['Venus','Jupiter'].includes(ap.planet)))
            .sort((a, b) => a.rating - b.rating)
            .slice(0, 5);

          if (beneficSR.length > 0) {
            context += 'SR BENEFIC CITIES (this year):\n';
            for (const c of beneficSR) {
              const label = c.state ? `${c.city}, ${c.state}, ${c.country}` : `${c.city}, ${c.country}`;
              const lines = c.angularPlanets.map(ap => `${ap.planet} ${ap.angle} (${ap.orb.toFixed(1)}°)`).join('; ');
              const intentionStr = INTENTION_KEYS
                .map(k => `${k}:${(c.intentionRatings as any)?.[k] ?? '?'}`)
                .join(' ');
              context += `• ${label} — ${lines} — Overall: ${c.rating}/10 [${intentionStr}]\n`;
            }
            context += '\n';
          }
          if (cautionSR.length > 0) {
            context += 'SR CAUTION CITIES (this year):\n';
            for (const c of cautionSR) {
              const label = c.state ? `${c.city}, ${c.state}, ${c.country}` : `${c.city}, ${c.country}`;
              const lines = c.angularPlanets.map(ap => `${ap.planet} ${ap.angle} (${ap.orb.toFixed(1)}°)`).join('; ');
              context += `• ${label} — ${lines} — Rating: ${c.rating}/10\n`;
            }
            context += '\n';
          }

          // Best city per intention
          context += 'BEST CITY PER INTENTION (this year):\n';
          for (const intent of INTENTION_KEYS) {
            const best = [...srAstrocarto.topCities].sort((a, b) =>
              ((b.intentionRatings as any)?.[intent] ?? 0) - ((a.intentionRatings as any)?.[intent] ?? 0)
            )[0];
            if (best) {
              const label = best.state ? `${best.city}, ${best.state}` : `${best.city}, ${best.country}`;
              context += `• ${intent}: ${label} (${(best.intentionRatings as any)?.[intent] ?? '?'}/10)\n`;
            }
          }
          context += '\n';
        }
      } catch {}
    }

    return context;
  };

  const handleQuickTopic = (
    prompt: string,
    userLocations?: { current?: string; considering1?: string; considering2?: string },
  ) => {
    // AskQuickTopics now collects optional relocation cities inline (in the
    // same panel as the personal-context textarea). When the user picks the
    // Relocation topic and fills any city field, we receive a populated
    // userLocations object here and forward it straight to the edge function.
    void handleSubmitDirect(prompt, userLocations);
  };

  // Deterministic post-correction: overwrites ALL placement table data (sign, degrees, house, retrograde)
  // AND corrects house/sign references in narrative prose with actual chart data
  const correctPlacementData = useCallback((data: any, chart: NatalChart | null, srChart: SolarReturnChart | null) => {
    if (!data?.sections || !chart) return data;
    const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const toAbs = (pos: { sign: string; degree: number; minutes?: number }): number | null => {
      const idx = ZODIAC.indexOf(pos.sign);
      if (idx < 0) return null;
      return idx * 30 + pos.degree + (pos.minutes || 0) / 60;
    };
    const buildCusps = (cuspsObj: any): number[] => {
      const arr: number[] = [];
      for (let i = 1; i <= 12; i++) {
        const c = cuspsObj?.[`house${i}`];
        if (c && typeof c === 'object' && 'sign' in c) {
          const abs = toAbs(c as any);
          if (abs !== null) arr.push(abs); else return [];
        } else return [];
      }
      return arr.length === 12 ? arr : [];
    };
    const findHouse = (deg: number, cusps: number[]): number | null => {
      if (cusps.length !== 12) return null;
      for (let i = 0; i < 12; i++) {
        let start = cusps[i];
        let end = cusps[(i + 1) % 12];
        if (end < start) end += 360;
        let d = deg;
        if (d < start) d += 360;
        if (d >= start && d < end) return i + 1;
      }
      return 1;
    };
    const ordinal = (n: number): string => {
      if (n === 1) return '1st'; if (n === 2) return '2nd'; if (n === 3) return '3rd'; return `${n}th`;
    };

    interface PlanetTruth {
      sign: string;
      degree: number;
      minutes: number;
      house: number | null;
      isRetrograde: boolean;
      degreeStr: string; // e.g. "15°23'"
    }

    const buildTruthMap = (planets: any, cuspsObj: any): Record<string, PlanetTruth> => {
      const cusps = buildCusps(cuspsObj);
      const map: Record<string, PlanetTruth> = {};
      Object.entries(planets || {}).forEach(([name, pos]: [string, any]) => {
        if (!pos || typeof pos !== 'object' || !('sign' in pos)) return;
        const deg = pos.degree ?? 0;
        const min = pos.minutes ?? 0;
        const abs = toAbs(pos);
        const house = abs !== null ? findHouse(abs, cusps) : null;
        const isRet = pos.isRetrograde === true || pos.retrograde === true;
        map[name.toLowerCase()] = {
          sign: pos.sign,
          degree: deg,
          minutes: min,
          house,
          isRetrograde: isRet,
          degreeStr: `${deg}°${min.toString().padStart(2, '0')}'`,
        };
      });
      // Add angles from cusps
      if (cuspsObj) {
        const angleMap: Record<string, string> = { ascendant: 'house1', asc: 'house1', mc: 'house10', midheaven: 'house10', dsc: 'house7', descendant: 'house7', ic: 'house4' };
        const houseNum: Record<string, number> = { house1: 1, house10: 10, house7: 7, house4: 4 };
        Object.entries(angleMap).forEach(([angleName, cuspKey]) => {
          const c = cuspsObj[cuspKey];
          if (c && typeof c === 'object' && 'sign' in c) {
            const deg = c.degree ?? 0;
            const min = c.minutes ?? 0;
            map[angleName] = {
              sign: c.sign, degree: deg, minutes: min,
              house: houseNum[cuspKey] ?? null,
              isRetrograde: false,
              degreeStr: `${deg}°${min.toString().padStart(2, '0')}'`,
            };
          }
        });
      }
      return map;
    };

    const natalTruth = buildTruthMap(chart.planets, chart.houseCusps);
    const srTruth = srChart ? buildTruthMap(srChart.planets, srChart.houseCusps) : {};

    // Normalize planet name from AI output to our key
    const normalize = (name: string): string => {
      return name.replace(/[☉☽☿♀♂♃♄♅♆♇⚷☊☋⚸⚵🜕⚳⚴⯰]/g, '').trim().toLowerCase()
        .replace('north node', 'northnode').replace('south node', 'southnode')
        .replace('n. node', 'northnode').replace('s. node', 'southnode')
        .replace('part of fortune', 'partoffortune');
    };

    // 1. Fix placement tables: overwrite sign, degrees, house, retrograde
    for (const section of data.sections) {
      if (section.type !== 'placement_table') continue;
      const isSR = /solar return/i.test(section.title);
      const truthMap = isSR ? srTruth : natalTruth;
      if (Object.keys(truthMap).length === 0) continue;

      for (const row of section.rows || []) {
        const key = normalize(row.planet);
        const truth = truthMap[key];
        if (!truth) continue;
        // Overwrite ALL fields
        row.sign = truth.sign;
        row.degrees = truth.degreeStr;
        row.house = truth.house ?? row.house;
        // Add retrograde marker to planet name if needed
        if (truth.isRetrograde && !row.planet.includes('℞') && !row.planet.includes('Rx') && !row.planet.toLowerCase().includes('retro')) {
          row.planet = row.planet + ' ℞';
        } else if (!truth.isRetrograde) {
          row.planet = row.planet.replace(/\s*[℞]/, '').replace(/\s*\(Rx\)/, '').replace(/\s*Rx/, '');
        }
      }
    }

    // 2. Fix narrative prose: correct "X in the Nth house" and "X in Sign" references
    const allTruth = { ...natalTruth }; // Natal as default for narrative references
    // Build reverse map: planet display names to truth
    const PLANET_DISPLAY_NAMES = [
      'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
      'Uranus', 'Neptune', 'Pluto', 'Chiron', 'North Node', 'South Node',
      'Lilith', 'Juno', 'Ceres', 'Pallas', 'Vesta', 'Eris',
    ];

    const replacePlanetReferences = (
      input: string,
      truthMap: Record<string, PlanetTruth>,
      prefix?: 'SR' | 'Natal'
    ): string => {
      let fixed = input;
      const prefixPattern = prefix ? `${prefix}\\s+` : '(?<!SR\\s)(?<!Natal\\s)';
      const prefixLabel = prefix ? `${prefix} ` : '';

      for (const pName of PLANET_DISPLAY_NAMES) {
        const key = pName.toLowerCase().replace(/\s+/g, '');
        const truth = truthMap[key];
        if (!truth || truth.house === null) continue;

        const housePattern = new RegExp(
          `${prefixPattern}(${pName})\\s+(?:is\\s+)?in\\s+the\\s+(\\d+(?:st|nd|rd|th))\\s+house`,
          'gi'
        );
        fixed = fixed.replace(housePattern, (_match, planet) => {
          return `${prefixLabel}${planet} in the ${ordinal(truth.house!)} house`;
        });

        for (const wrongSign of ZODIAC) {
          if (wrongSign === truth.sign) continue;
          const signPattern = new RegExp(
            `${prefixPattern}(${pName})\\s+(?:is\\s+)?in\\s+(${wrongSign})(?!\\s+(?:the|house|rising|ascendant))`,
            'gi'
          );
          fixed = fixed.replace(signPattern, (_match, planet) => `${prefixLabel}${planet} in ${truth.sign}`);
        }
      }

      return fixed;
    };

    const fixNarrativeText = (text: string, truthMap: Record<string, PlanetTruth>): string => {
      if (!text || typeof text !== 'string') return text;

      let fixed = text;

      if (Object.keys(srTruth).length > 0) {
        fixed = replacePlanetReferences(fixed, srTruth, 'SR');
      }

      fixed = replacePlanetReferences(fixed, natalTruth, 'Natal');
      fixed = replacePlanetReferences(fixed, truthMap);

      return fixed;
    };

    // Apply narrative fixes to all text sections
    for (const section of data.sections) {
      if (section.type === 'placement_table') continue;
      const sectionTitle = (section.title || '').toLowerCase();
      const isSRFocusedSection =
        /^solar return\b/.test(sectionTitle) ||
        /this year|year in love|love activation|current year/.test(sectionTitle);
      const truthMap = isSRFocusedSection && Object.keys(srTruth).length > 0 ? srTruth : natalTruth;

      if (section.body && typeof section.body === 'string') {
        section.body = fixNarrativeText(section.body, truthMap);
      }
      if (section.bullets && Array.isArray(section.bullets)) {
        for (const bullet of section.bullets) {
          if (bullet.text && typeof bullet.text === 'string') {
            bullet.text = fixNarrativeText(bullet.text, truthMap);
          }
        }
      }
      if (section.events && Array.isArray(section.events)) {
        for (const event of section.events) {
          if (event.description && typeof event.description === 'string') {
            event.description = fixNarrativeText(event.description, truthMap);
          }
        }
      }
      if (section.content && typeof section.content === 'string') {
        section.content = fixNarrativeText(section.content, truthMap);
      }
    }

    // 3. Fix modality_element section: overwrite element/modality/polarity counts from chart data
    const ELEMENT_MAP: Record<string, string> = {
      Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
      Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
      Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
      Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
    };
    const MODALITY_MAP: Record<string, string> = {
      Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
      Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
      Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
    };
    const POLARITY_MAP: Record<string, string> = {
      Aries: 'Masculine', Taurus: 'Feminine', Gemini: 'Masculine', Cancer: 'Feminine',
      Leo: 'Masculine', Virgo: 'Feminine', Libra: 'Masculine', Scorpio: 'Feminine',
      Sagittarius: 'Masculine', Capricorn: 'Feminine', Aquarius: 'Masculine', Pisces: 'Feminine',
    };
    const CORE_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

    for (const section of data.sections) {
      if (section.type !== 'modality_element') continue;
      const elemCounts: Record<string, { count: number; planets: string[] }> = { Fire: { count: 0, planets: [] }, Earth: { count: 0, planets: [] }, Air: { count: 0, planets: [] }, Water: { count: 0, planets: [] } };
      const modCounts: Record<string, { count: number; planets: string[] }> = { Cardinal: { count: 0, planets: [] }, Fixed: { count: 0, planets: [] }, Mutable: { count: 0, planets: [] } };
      const polCounts: Record<string, { count: number; planets: string[] }> = {
        Masculine: { count: 0, planets: [] },
        Feminine: { count: 0, planets: [] },
      };

      for (const pName of CORE_PLANETS) {
        const key = pName.toLowerCase();
        const truth = natalTruth[key];
        if (!truth) continue;
        const el = ELEMENT_MAP[truth.sign];
        const mod = MODALITY_MAP[truth.sign];
        const pol = POLARITY_MAP[truth.sign];
        if (el && elemCounts[el]) { elemCounts[el].count++; elemCounts[el].planets.push(pName); }
        if (mod && modCounts[mod]) { modCounts[mod].count++; modCounts[mod].planets.push(pName); }
        if (pol && polCounts[pol]) { polCounts[pol].count++; polCounts[pol].planets.push(pName); }
      }

      if (section.elements && Array.isArray(section.elements)) {
        for (const entry of section.elements) {
          const sectionData = elemCounts[entry.name];
          if (sectionData) { entry.count = sectionData.count; entry.planets = sectionData.planets; }
        }
      }
      if (section.modalities && Array.isArray(section.modalities)) {
        for (const entry of section.modalities) {
          const sectionData = modCounts[entry.name];
          if (sectionData) { entry.count = sectionData.count; entry.planets = sectionData.planets; }
        }
      }
      if (section.polarity && Array.isArray(section.polarity)) {
        for (const entry of section.polarity) {
          const lowerName = String(entry.name || '').toLowerCase();
          const isMasculine = lowerName.includes('yang') || lowerName.includes('active') || lowerName.includes('masculine');
          const isFeminine = lowerName.includes('yin') || lowerName.includes('receptive') || lowerName.includes('feminine');
          if (isMasculine) {
            entry.count = polCounts.Masculine.count;
            entry.planets = polCounts.Masculine.planets;
          } else if (isFeminine) {
            entry.count = polCounts.Feminine.count;
            entry.planets = polCounts.Feminine.planets;
          }
        }
      }
      const domEl = Object.entries(elemCounts).sort((a, b) => b[1].count - a[1].count)[0];
      const domMod = Object.entries(modCounts).sort((a, b) => b[1].count - a[1].count)[0];
      const domPol = polCounts.Masculine.count >= polCounts.Feminine.count ? 'Masculine' : 'Feminine';
      if (domEl) section.dominant_element = domEl[0];
      if (domMod) section.dominant_modality = domMod[0];
      section.dominant_polarity = domPol;
    }

    return data;
  }, []);

  const detectReadingType = (
    question: string,
  ): 'relationship' | 'relocation' | 'career' | 'health' | 'money' | 'spiritual' | 'general' => {
    const q = question.toLowerCase();

    // Score each domain by counting distinct keyword matches. This prevents
    // incidental words (e.g. "relationship with money" inside a career prompt,
    // or "business partner" inside a relationship prompt) from misrouting the
    // reading. Whichever domain accumulates the most signal wins. Ties resolve
    // by the priority order: relocation → career → relationship → health →
    // money → spiritual → general.
    const patterns: { type: 'relocation' | 'career' | 'relationship' | 'health' | 'money' | 'spiritual'; rx: RegExp }[] = [
      { type: 'relocation', rx: /\b(relocat\w*|move to|moving to|best cit(?:y|ies)|where should i live|astrocartograph\w*|new city|new place|city for|cities (?:for|where)|relocation)\b/g },
      // Note: "relationship" alone is a weak signal because it's commonly used
      // metaphorically (relationship with money/work/self). Require it to
      // co-occur with explicit relational vocabulary to count strongly. The
      // standalone word still counts as 1 hit, but career/money keywords
      // typically outnumber it in a career prompt.
      { type: 'relationship', rx: /\b(relationship|partner|romance|romantic|dating|marriage|married|breakup|divorce|crush|attraction|synastry|spouse|husband|wife|girlfriend|boyfriend|soulmate|lover)\b/g },
      { type: 'career', rx: /\b(career|job|jobs|work|works|working|workplace|promotion|profession\w*|vocation\w*|industry|industries|occupation|coworker|boss|fired|hired|interview|leadership|10th house|midheaven|mc\b|ambition\w*|professional)\b/g },
      { type: 'health', rx: /\b(health|body|illness|sick|wellness|fitness|energy levels|sleep|nervous system|chronic|symptom|healing|medical|disease|recover\w*)\b/g },
      { type: 'money', rx: /\b(money|finance\w*|income|salary|debt|invest\w*|wealth|earn\w*|earning|budget|cash|savings|2nd house|8th house|joint ventures|resources)\b/g },
      { type: 'spiritual', rx: /\b(spiritual\w*|soul|meditation|awakening|enlighten\w*|divine|consciousness|inner work|meaning of life|faith|sacred)\b/g },
    ];

    const scores = patterns.map(p => {
      const matches = q.match(p.rx);
      return { type: p.type, score: matches ? new Set(matches).size : 0 };
    });

    // Find the highest score; if everything is 0, fall back to general.
    const top = scores.reduce((a, b) => (b.score > a.score ? b : a), { type: 'general' as any, score: 0 });
    if (top.score === 0) return 'general';

    // If career and relationship are both present, career wins when career has
    // strictly more matches OR when career and relationship are tied (because
    // "relationship" is frequently a metaphorical word inside non-relational
    // prompts).
    const career = scores.find(s => s.type === 'career')!.score;
    const rel = scores.find(s => s.type === 'relationship')!.score;
    if (career > 0 && rel > 0 && career >= rel) return 'career';

    return top.type;
  };

  // ── NATAL PORTRAIT INJECTION ─────────────────────────────────────
  // For every reading type, enrich chartContext with the pre-calculated
  // Natal Portrait. Per-type field selection: a base set goes to all
  // reading types; some types add extra domain-specific blocks.
  // Additive — placement table context is preserved.
  const isNatalReadingPrompt = (question: string): boolean => {
    if (!question) return false;
    const q = question.toLowerCase();
    return (
      q.includes('"question_type" in your json output must be exactly "natal"') ||
      q.includes("natal-only reading") ||
      q.includes("natal only reading")
    );
  };

  const isSolarReturnReadingPrompt = (question: string): boolean => {
    if (!question) return false;
    const q = question.toLowerCase();
    return (
      q.includes('"question_type" in your json output must be exactly "solar_return"') ||
      q.includes("solar return reading for this birthday year")
    );
  };

  const buildNatalPortraitBlock = (
    chart: NatalChart | null,
    readingType:
      | 'natal'
      | 'solar_return'
      | 'relationship'
      | 'relocation'
      | 'career'
      | 'health'
      | 'money'
      | 'spiritual'
      | 'general',
  ): string => {
    if (!chart) return "";
    try {
      const portrait = generateNatalPortrait(chart);

      // Base set — sent for every reading type.
      const basePayload: Record<string, unknown> = {
        lifePurpose: portrait.lifePurpose,
        dominantPlanets: portrait.dominantPlanets,
        patterns: portrait.patterns,
        minorBodyPatterns: portrait.minorBodyPatterns,
        houseEmphasis: portrait.houseEmphasis,
        lifetimeWisdom: portrait.lifetimeWisdom,
        powerPortrait: portrait.powerPortrait,
      };

      let payload: Record<string, unknown> = {};
      let headerNote = "";

      switch (readingType) {
        case 'natal':
          // Natal reading: full portrait (matches prior behavior).
          payload = {
            lifePurpose: portrait.lifePurpose,
            topThemes: portrait.topThemes,
            dominantPlanets: portrait.dominantPlanets,
            patterns: portrait.patterns,
            minorBodyPatterns: portrait.minorBodyPatterns,
            lifetimeWisdom: portrait.lifetimeWisdom,
            powerPortrait: portrait.powerPortrait,
            relationshipBlueprint: portrait.relationshipBlueprint,
            careerMoneyMap: portrait.careerMoneyMap,
            emotionalArchitecture: portrait.emotionalArchitecture,
            healthVitality: portrait.healthVitality,
            shadowGrowth: portrait.shadowGrowth,
            spiritualKarmic: portrait.spiritualKarmic,
            houseEmphasis: portrait.houseEmphasis,
          };
          headerNote =
            "For natal readings, treat this block as authoritative for patterns, dominant planets, themes, life direction, and synthesis.";
          break;

        case 'relationship':
          payload = { ...basePayload, relationshipBlueprint: portrait.relationshipBlueprint };
          headerNote =
            "For relationship readings, the relationshipBlueprint section names the natal love/partnership baseline. Treat the base portrait as the permanent who-you-are layer.";
          break;

        case 'career':
          payload = { ...basePayload, careerMoneyMap: portrait.careerMoneyMap };
          headerNote =
            "For career readings, the careerMoneyMap section names the natal vocational baseline. Treat the base portrait as the permanent who-you-are layer.";
          break;

        case 'health':
          payload = { ...basePayload, healthVitality: portrait.healthVitality };
          headerNote =
            "For health readings, the healthVitality section names the natal vitality baseline. Treat the base portrait as the permanent who-you-are layer.";
          break;

        case 'money':
          payload = { ...basePayload, careerMoneyMap: portrait.careerMoneyMap };
          headerNote =
            "For money readings, the careerMoneyMap section names the natal earning/resources baseline. Treat the base portrait as the permanent who-you-are layer.";
          break;

        case 'spiritual':
          // Spiritual: double-weight lifetimeWisdom + add spiritualKarmic.
          // Place lifetimeWisdom FIRST in payload so it appears at the top
          // of the serialized JSON, then again under the base block.
          payload = {
            lifetimeWisdom: portrait.lifetimeWisdom,
            spiritualKarmic: portrait.spiritualKarmic,
            ...basePayload,
          };
          headerNote =
            "For spiritual readings, lifetimeWisdom and spiritualKarmic carry the soul-direction signal — lifetimeWisdom is doubled here on purpose. Treat the base portrait as the permanent who-you-are layer.";
          break;

        case 'relocation':
          // Base only — powerPortrait is already in base.
          payload = { ...basePayload };
          headerNote =
            "For relocation readings, powerPortrait names the natal energy/sustainability pattern that any new location has to fit. Treat the base portrait as the permanent who-you-are layer.";
          break;

        case 'solar_return':
          payload = {
            lifePurpose: portrait.lifePurpose,
            topThemes: portrait.topThemes,
            dominantPlanets: portrait.dominantPlanets,
            patterns: portrait.patterns,
            minorBodyPatterns: portrait.minorBodyPatterns,
            houseEmphasis: portrait.houseEmphasis,
            lifetimeWisdom: portrait.lifetimeWisdom,
            powerPortrait: portrait.powerPortrait,
            relationshipBlueprint: portrait.relationshipBlueprint,
            careerMoneyMap: portrait.careerMoneyMap,
            emotionalArchitecture: portrait.emotionalArchitecture,
            healthVitality: portrait.healthVitality,
            shadowGrowth: portrait.shadowGrowth,
            spiritualKarmic: portrait.spiritualKarmic,
          };
          headerNote =
            "For Solar Return readings, the natal portrait describes the permanent baseline. The Solar Return data (separately provided) describes what THIS year is doing to that baseline. Always interpret SR placements in relationship to the natal layer below — never in isolation.";
          break;

        case 'general':
        default:
          payload = { ...basePayload };
          headerNote =
            "Treat the base portrait as the permanent who-you-are layer when answering this question.";
          break;
      }

      return (
        "\n\n--- NATAL PORTRAIT (PRE-CALCULATED — PRIMARY SOURCE OF TRUTH) ---\n" +
        "The following is deterministic, pre-computed natal-portrait data for this chart. " +
        "Use it as your primary source of truth for who this person is at the natal level. " +
        "Do NOT contradict it. When the portrait data gives you a synthesis or interpretation, " +
        "expand it into plain conversational language with one concrete real-life example rather " +
        "than repeating it verbatim. The natal portrait describes the permanent baseline. The " +
        "Solar Return data (where present) describes what this specific year is doing to that " +
        "baseline.\n" +
        headerNote + "\n\n" +
        JSON.stringify(payload, null, 2) +
        "\n--- END NATAL PORTRAIT ---\n"
      );
    } catch (err) {
      console.warn("[AskView] Failed to build natal portrait block:", err);
      return "";
    }
  };

  // Build a deterministic Solar Return analysis block — same engine that
  // powers the birthday PDF — and inject the requested fields into the
  // chart context so the AI can build prose from authoritative data
  // instead of re-deriving it from the raw placement table.
  const buildSolarReturnAnalysisBlock = (
    chart: NatalChart | null,
    srChart: SolarReturnChart | null,
  ): string => {
    if (!chart || !srChart) return "";
    try {
      const a = analyzeSolarReturn(srChart, chart);

      // Sign + degree summaries for natal/SR Sun/Moon/Rising. The "description"
      // value piggybacks on the analysis's house themes where they exist, so
      // the AI gets a one-line plain-language framing for each anchor.
      const fmtPos = (
        pos: { sign?: string; degree?: number; minutes?: number; isRetrograde?: boolean } | undefined,
      ): { sign: string; degree: number; minutes: number; isRetrograde: boolean } | null => {
        if (!pos || !pos.sign) return null;
        return {
          sign: pos.sign,
          degree: Math.floor(pos.degree ?? 0),
          minutes: Math.round(pos.minutes ?? 0),
          isRetrograde: !!pos.isRetrograde,
        };
      };

      const natalSunPos = fmtPos(chart.planets?.Sun);
      const natalMoonPos = fmtPos(chart.planets?.Moon);
      const natalRisingPos = fmtPos(chart.houseCusps?.house1 || chart.planets?.Ascendant);
      const srSunPos = fmtPos(srChart.planets?.Sun);
      const srMoonPos = fmtPos(srChart.planets?.Moon);
      const srRisingPos = fmtPos(srChart.houseCusps?.house1 || srChart.planets?.Ascendant);

      const natalSun = natalSunPos
        ? { ...natalSunPos, description: a.sunNatalHouse?.theme || "" }
        : null;
      const natalMoon = natalMoonPos
        ? { ...natalMoonPos, description: a.moonNatalHouse?.theme || "" }
        : null;
      const natalRising = natalRisingPos
        ? { ...natalRisingPos, description: `Natal ${natalRisingPos.sign} Rising — the lifelong front door.` }
        : null;
      const srSun = srSunPos
        ? { ...srSunPos, description: a.sunHouse?.theme || "" }
        : null;
      const srMoon = srMoonPos
        ? { ...srMoonPos, description: a.moonHouse?.theme || "" }
        : null;
      const srRising = srRisingPos
        ? {
            ...srRisingPos,
            description: a.yearlyTheme?.yearTheme || `${srRisingPos.sign} Rising for this Solar Return year.`,
          }
        : null;

      // srHouseThemes — synthesized from houseOverlays where present, since
      // there is no top-level themes array on the analysis. If overlays are
      // empty this is simply omitted.
      const srHouseThemes = Array.isArray(a.houseOverlays) && a.houseOverlays.length > 0
        ? a.houseOverlays.map((o: any) => ({
            house: o.house ?? o.houseNumber ?? null,
            theme: o.theme || o.description || "",
          }))
        : [];

      const solarReturnYear = (srChart as any).solarReturnYear ?? null;
      // Age = SR year − natal birth year (string slice safe for ISO dates).
      let solarReturnAge: number | null = null;
      try {
        if (typeof solarReturnYear === "number" && chart.birthDate) {
          const birthYear = parseInt(String(chart.birthDate).slice(0, 4), 10);
          if (!Number.isNaN(birthYear)) solarReturnAge = solarReturnYear - birthYear;
        }
      } catch {}
      const solarReturnLabel =
        solarReturnAge !== null
          ? `Solar Return ${solarReturnYear} (age ${solarReturnAge})`
          : solarReturnYear
            ? `Solar Return ${solarReturnYear}`
            : "Solar Return";

      const payload: Record<string, unknown> = {
        solarReturnYear,
        solarReturnAge,
        solarReturnLabel,
        yearlyTheme: a.yearlyTheme,
        profectionYear: a.profectionYear,
        lordOfTheYear: a.lordOfTheYear,
        moonPhase: a.moonPhase,
        stelliums: a.stelliums,
        srToNatalAspects: a.srToNatalAspects,
        srMoonAspects: a.srMoonAspects,
        houseOverlays: a.houseOverlays,
        srHouseThemes,
        natalSun,
        natalMoon,
        natalRising,
        srSun,
        srMoon,
        srRising,
      };

      return (
        "\n\n--- SOLAR RETURN ANALYSIS (PRE-CALCULATED — PRIMARY SOURCE OF TRUTH) ---\n" +
        "You have access to pre-calculated Solar Return data injected into this prompt. " +
        "Use it as your primary source of truth. Do not contradict it. The profection year, " +
        "Time Lord, moon phase, stelliums, and SR-to-natal aspects are already calculated — " +
        "build your prose from them rather than re-deriving. The natal portrait data gives " +
        "you the permanent baseline; the SR data tells you what this specific year is doing " +
        "to that baseline.\n\n" +
        JSON.stringify(payload, null, 2) +
        "\n--- END SOLAR RETURN ANALYSIS ---\n"
      );
    } catch (err) {
      console.warn("[AskView] Failed to build SR analysis block:", err);
      return "";
    }
  };


  // Natal and Solar Return are detected via Quick Topic markers; everything
  // else uses the existing detectReadingType() domain heuristic.
  const resolvePortraitReadingType = (
    question: string,
  ):
    | 'natal'
    | 'solar_return'
    | 'relationship'
    | 'relocation'
    | 'career'
    | 'health'
    | 'money'
    | 'spiritual'
    | 'general' => {
    if (isNatalReadingPrompt(question)) return 'natal';
    if (isSolarReturnReadingPrompt(question)) return 'solar_return';
    return detectReadingType(question);
  };


  const handleSubmitDirect = async (
    directQuestion?: string,
    userLocations?: { current?: string; considering1?: string; considering2?: string },
  ) => {
    const question = (directQuestion || input).trim();
    if (!question || isLoading) return;

    const chartIdForRequest = activeChartId;
    const chartForRequest = selectedChart;
    const chartNameForRequest = chartForRequest?.name || "Unknown";
    const userEntry: ChatEntry = { role: "user", content: question };
    const requestEntries = [...entries, userEntry];

    setEntries(requestEntries);
    saveActiveChat(chartIdForRequest, requestEntries);
    setInput("");
    setIsLoading(true);
    setLoadingStartedAt(Date.now());
    setJobStatus("submitting");

    // Block auto-reload during long Ask generations (prevents tab-switch HMR
    // errors from killing the streaming response and discarding the result).
    window.__askInFlight = true;

    try {
      const readingType = detectReadingType(question);
      const portraitReadingType = resolvePortraitReadingType(question);
      // For natal-prompt requests, route the timing scanner through the
      // 'natal' lens so the AI's "Where You Are in Your Life Cycles"
      // section is fed the same pre-computed transit windows that
      // career/relationship readings receive — preventing the AI from
      // fabricating transit positions when it has no real data.
      const timingReadingType = (portraitReadingType === 'natal' ? 'natal' : readingType) as Parameters<typeof buildDeterministicTimingData>[3];
      const timingData = buildDeterministicTimingData(chartForRequest, 18, 15, timingReadingType);
      let chartContext = buildChartContext(chartForRequest, timingData.context);
      chartContext += buildNatalPortraitBlock(chartForRequest, portraitReadingType);
      if (portraitReadingType === 'solar_return') {
        const srForRequest = findMatchingSolarReturn(solarReturnCharts, chartForRequest, chartIdForRequest);
        chartContext += buildSolarReturnAnalysisBlock(chartForRequest, srForRequest);
      }
      const apiMessages = requestEntries
        .filter(entry => entry.role === "user")
        .map(entry => ({ role: "user" as const, content: entry.content }));

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Async job: submit returns immediately with jobId, then we poll the
      // ask_jobs row. Survives tab-switch, HMR reload, and full page reload
      // because the jobId is persisted to localStorage in submitAskJob.
      const job = await runAskJob(
        {
          messages: apiMessages,
          chartContext,
          currentDate: formatLocalDateKey(new Date()),
          deterministicTiming: timingData.section,
          chartId: chartIdForRequest,
          userLocations,
        },
        {
          signal: controller.signal,
          onProgress: (status) => {
            console.log(`[AskView] Job status: ${status}`);
            if (status === "queued" || status === "processing") {
              setJobStatus(status);
              // Do NOT reset loadingStartedAt here — the visible timer must
              // reflect total wall-clock wait from submission so the user
              // doesn't think the job restarted when it transitions from
              // queued → processing.
            }
          },
        },
      );

      if (job.status === "failed") {
        toast.error(job.error_message || "Reading failed. Please try again.");
        setIsLoading(false);
        return;
      }

      const data: any = normalizeAskResult(job.result || {});

      if (data.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      let assistantEntry: ChatEntry;

      if (data.sections) {
        const currentSR = findMatchingSolarReturn(solarReturnCharts, chartForRequest, chartIdForRequest);
        const corrected = mergeDeterministicTimingSection(
          correctPlacementData(data, chartForRequest, currentSR),
          timingData.section,
        );
        assistantEntry = { role: "assistant", content: "", reading: corrected as StructuredReading };
      } else if (data.raw) {
        assistantEntry = { role: "assistant", content: data.raw };
      } else {
        assistantEntry = { role: "assistant", content: JSON.stringify(data, null, 2) };
      }

      const nextEntries = [...requestEntries, assistantEntry];
      saveActiveChat(chartIdForRequest, nextEntries);
      upsertConversationSnapshot(nextEntries, chartIdForRequest, chartNameForRequest);

      // Persist last reading for download even after timeout/reload
      const newReadings = nextEntries.filter(e => e.role === "assistant" && e.reading).map(e => e.reading!);
      if (newReadings.length > 0 && chartForRequest) {
        saveLastReading(chartIdForRequest, {
          name: chartForRequest.name,
          birthDate: chartForRequest.birthDate,
          birthTime: chartForRequest.birthTime,
          birthLocation: formatLocationTitleCase(chartForRequest.birthLocation || ""),
        }, newReadings);
      }

      if (activeChartIdRef.current === chartIdForRequest) {
        setEntries(nextEntries);
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        // User stopped intentionally — handled in handleStopGeneration
        window.__askInFlight = false;
        return;
      }
      console.error("Ask error:", error);
      const msg = String(error?.message || "");
      if (msg === "RATE_LIMIT") toast.error("Rate limit exceeded. Please wait a moment and try again.");
      else if (msg === "CREDITS_EXHAUSTED") toast.error("AI credits exhausted. Please add credits to continue.");
      else if (msg === "QUEUE_STALE") toast.error("The report queue did not start. Please run it again.");
      else if (msg.startsWith("QUEUE_RETRYABLE:")) toast.error("The report queue is temporarily busy. I retried it 3 times — please wait 2 minutes and run it again.");
      else toast.error("Failed to get response. Please try again.");
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
      setLoadingStartedAt(null);
      setJobStatus(null);
      window.__askInFlight = false;
    }
  };

  const handleSubmit = () => handleSubmitDirect();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    clearThreadId(activeChartId);
    // Clear any stale active job id so the resume-poll effect doesn't
    // immediately re-attach to a ghost in-flight reading.
    writeActiveJobId(activeChartId, null);
    setEntries([]);
    setInput("");
  };

  const startNewQuestion = () => {
    if (entries.some(e => e.role === "assistant") && selectedChart) {
      upsertConversationSnapshot(entries, activeChartId, selectedChart.name || "Unknown");
    }
    clearThreadId(activeChartId);
    // Clear any stale active job id so clicking "New" never auto-resumes
    // a previous (or ghost) generation and starts the timer on its own.
    writeActiveJobId(activeChartId, null);
    setEntries([]);
    setInput("");
  };

  const regenerateLastAnswer = async () => {
    // Find the last user question
    const lastUserEntry = [...entries].reverse().find(e => e.role === "user");
    if (!lastUserEntry || isLoading) return;

    // Remove the last assistant response (if any) so we can regenerate
    const lastAssistantIdx = entries.map(e => e.role).lastIndexOf("assistant");
    const trimmedEntries = lastAssistantIdx >= 0
      ? entries.slice(0, lastAssistantIdx)
      : [...entries];

    setEntries(trimmedEntries);
    setIsLoading(true);
    setLoadingStartedAt(Date.now());
    setJobStatus("submitting");
    window.__askInFlight = true;

    try {
      const chartForRequest = selectedChart;
      const chartIdForRequest = activeChartId;
      const chartNameForRequest = chartForRequest?.name || "Unknown";
      const lastUserQuestion = [...trimmedEntries].reverse().find(e => e.role === "user")?.content || "";
      const readingType = detectReadingType(lastUserQuestion);
      const portraitReadingType = resolvePortraitReadingType(lastUserQuestion);
      // Mirror handleSubmitDirect: route natal-prompt regenerations through
      // the 'natal' timing lens so the same transit windows are injected.
      const timingReadingType = (portraitReadingType === 'natal' ? 'natal' : readingType) as Parameters<typeof buildDeterministicTimingData>[3];
      const timingData = buildDeterministicTimingData(chartForRequest, 18, 15, timingReadingType);
      let chartContext = buildChartContext(chartForRequest, timingData.context);
      chartContext += buildNatalPortraitBlock(chartForRequest, portraitReadingType);
      if (portraitReadingType === 'solar_return') {
        const srForRequest = findMatchingSolarReturn(solarReturnCharts, chartForRequest, chartIdForRequest);
        chartContext += buildSolarReturnAnalysisBlock(chartForRequest, srForRequest);
      }
      const apiMessages = trimmedEntries
        .filter(entry => entry.role === "user")
        .map(entry => ({ role: "user" as const, content: entry.content }));

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Async job (same path as handleSubmitDirect)
      const job = await runAskJob(
        {
          messages: apiMessages,
          chartContext,
          currentDate: formatLocalDateKey(new Date()),
          deterministicTiming: timingData.section,
          chartId: chartIdForRequest,
        },
        {
          signal: controller.signal,
          onProgress: (status) => {
            console.log(`[AskView regen] Job status: ${status}`);
            if (status === "queued" || status === "processing") {
              setJobStatus(status);
              // Do NOT reset the timer on queued → processing; keep
              // wall-clock elapsed honest from submission time.
            }
          },
        },
      );

      if (job.status === "failed") {
        toast.error(job.error_message || "Reading failed. Please try again.");
        setIsLoading(false);
        return;
      }

      const data: any = normalizeAskResult(job.result || {});
      if (data.error) { toast.error(data.error); setIsLoading(false); return; }

      let assistantEntry: ChatEntry;
      if (data.sections) {
        const currentSR = findMatchingSolarReturn(solarReturnCharts, chartForRequest, chartIdForRequest);
        const corrected = mergeDeterministicTimingSection(
          correctPlacementData(data, chartForRequest, currentSR),
          timingData.section,
        );
        assistantEntry = { role: "assistant", content: "", reading: corrected as StructuredReading };
      } else if (data.raw) {
        assistantEntry = { role: "assistant", content: data.raw };
      } else {
        assistantEntry = { role: "assistant", content: JSON.stringify(data, null, 2) };
      }

      const nextEntries = [...trimmedEntries, assistantEntry];
      saveActiveChat(chartIdForRequest, nextEntries);
      upsertConversationSnapshot(nextEntries, chartIdForRequest, chartNameForRequest);

      // Persist last reading for download even after timeout/reload
      const newReadings = nextEntries.filter(e => e.role === "assistant" && e.reading).map(e => e.reading!);
      if (newReadings.length > 0 && chartForRequest) {
        saveLastReading(chartIdForRequest, {
          name: chartForRequest.name,
          birthDate: chartForRequest.birthDate,
          birthTime: chartForRequest.birthTime,
          birthLocation: formatLocationTitleCase(chartForRequest.birthLocation || ""),
        }, newReadings);
      }

      if (activeChartIdRef.current === chartIdForRequest) {
        setEntries(nextEntries);
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        window.__askInFlight = false;
        return;
      }
      console.error("Regenerate error:", error);
      const msg = String(error?.message || "");
      if (msg === "RATE_LIMIT") toast.error("Rate limit exceeded. Please wait a moment and try again.");
      else if (msg === "CREDITS_EXHAUSTED") toast.error("AI credits exhausted. Please add credits to continue.");
      else if (msg === "QUEUE_STALE") toast.error("The report queue did not start. Please run it again.");
      else if (msg.startsWith("QUEUE_RETRYABLE:")) toast.error("The report queue is temporarily busy. I retried it 3 times — please wait 2 minutes and run it again.");
      else toast.error("Failed to regenerate. Please try again.");
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
      setLoadingStartedAt(null);
      setJobStatus(null);
      window.__askInFlight = false;
    }
  };

  const getReadingsForExport = useCallback((): { chartMeta: any; readings: StructuredReading[] } | null => {
    // Export ONLY the most recent reading in the active chat. If a user runs
    // a relationship reading and then a career reading in the same session,
    // the download must contain just the career reading they just generated —
    // not every prior reading still in chat history. (Bug fix: previously
    // the export accumulated all assistant readings, so the JSON would
    // include the older relationship reading alongside the new career one.)
    const allReadings = entries.filter(e => e.role === "assistant" && e.reading).map(e => e.reading!);
    if (allReadings.length > 0 && selectedChart) {
      const mostRecent = allReadings[allReadings.length - 1];
      return {
        chartMeta: {
          name: selectedChart.name,
          birthDate: selectedChart.birthDate,
          birthTime: selectedChart.birthTime,
          birthLocation: formatLocationTitleCase(selectedChart.birthLocation || ""),
        },
        readings: [mostRecent],
      };
    }
    // Fallback: load last persisted reading (already a single most-recent snapshot)
    const lastReading = loadLastReading(activeChartId);
    if (lastReading) {
      const readings = lastReading.readings || [];
      const mostRecent = readings.length > 0 ? [readings[readings.length - 1]] : [];
      return { chartMeta: lastReading.chart, readings: mostRecent };
    }
    return null;
  }, [entries, selectedChart, activeChartId]);

  const handleDownloadPdf = () => {
    const exportData = getReadingsForExport();
    if (!exportData || !selectedChart) {
      toast.error("No readings available to export. Run a reading first.");
      return;
    }
    try {
      const validated = validateAndPrepareReadingsForExport(exportData.readings as any[]);
      generateAskPdf(selectedChart, validated as StructuredReading[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[handleDownloadPdf] Export blocked by validator", err);
      toast.error(`Export blocked: ${msg}`);
    }
  };

  const handleDownloadJson = () => {
    const exportData = getReadingsForExport();
    if (!exportData) {
      toast.error("No readings available to export. Run a reading first.");
      return;
    }
    let validatedReadings: StructuredReading[];
    try {
      validatedReadings = validateAndPrepareReadingsForExport(exportData.readings as any[]) as StructuredReading[];
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[handleDownloadJson] Export blocked by validator", err);
      toast.error(`Export blocked: ${msg}`);
      return;
    }
    const jsonData = {
      chart: exportData.chartMeta,
      exportedAt: new Date().toISOString(),
      readings: validatedReadings,
    };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Filename: <person-name>_<reading-type>_<timestamp>.json
    const slug = (s: string) =>
      (s || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const personSlug = slug(selectedChart!.name) || "chart";
    const types = Array.from(
      new Set(
        validatedReadings
          .map(r => slug(r.question_type || ""))
          .filter(Boolean)
      )
    );
    const typeSlug =
      types.length === 0 ? "reading" : types.length === 1 ? types[0] : "multi-reading";
    const ts = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .replace(/-\d{3}Z$/, "Z"); // 2026-04-19_14-32-05Z
    a.download = `${personSlug}_${typeSlug}_${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const conversations = loadConversations();

  if (showHistory) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Saved Conversations
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
            <X className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
        {conversations.length === 0 ? (
          <Card className="border-border">
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No saved conversations yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map(convo => {
              const firstQ = convo.entries.find(e => e.role === "user")?.content || "No question";
              const answerCount = convo.entries.filter(e => e.role === "assistant").length;
              return (
                <Card key={convo.id} className="border-border hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => loadConversation(convo)}>
                  <CardContent className="py-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{convo.chartName} · {new Date(convo.timestamp).toLocaleDateString()}</p>
                      <p className="text-sm text-foreground truncate">{firstQ}</p>
                      <p className="text-xs text-muted-foreground">{answerCount} answer{answerCount !== 1 ? "s" : ""}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteConversation(convo.id); }}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const lastSavedReading = loadLastReading(activeChartId);
  const hasAssistantReadings = entries.some(e => e.role === "assistant" && e.reading);
  const hasSavedReading = lastSavedReading !== null;
  const canDownload = hasAssistantReadings || hasSavedReading;
  const savedReadingTimestamp = lastSavedReading?.savedAt ? formatSavedAt(lastSavedReading.savedAt) : "";

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Ask About the Reading</CardTitle>
                <CardDescription>
                  Ask interpretive questions about {selectedChart?.name || "the chart"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {canDownload && (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={handleDownloadJson} className="text-muted-foreground" title={hasSavedReading ? "Download last saved reading as JSON" : "Download as JSON"}>
                      <Download className="h-4 w-4 mr-1" />
                      JSON{hasSavedReading ? " (saved)" : ""}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDownloadPdf} className="text-muted-foreground" title={hasSavedReading ? "Download last saved reading as PDF" : "Download as PDF"}>
                      <Download className="h-4 w-4 mr-1" />
                      PDF{hasSavedReading ? " (saved)" : ""}
                    </Button>
                  </div>
                  {savedReadingTimestamp && (
                    <p className="text-[10px] text-muted-foreground">
                      Last saved: {savedReadingTimestamp}
                    </p>
                  )}
                </div>
              )}
              {entries.some(e => e.role === "assistant") && (
                <Button variant="ghost" size="sm" onClick={regenerateLastAnswer} disabled={isLoading} className="text-muted-foreground" title="Regenerate the last answer with the same question">
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              )}
              {entries.length > 0 && (
                <Button variant="ghost" size="sm" onClick={startNewQuestion} className="text-muted-foreground" title="Start a new question (saves current to history)">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="text-muted-foreground" title="View saved conversations">
                <History className="h-4 w-4" />
              </Button>
              {entries.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chart Selector */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Reading chart for</p>
            <Popover open={selectorOpen} onOpenChange={setSelectorOpen}>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center justify-between gap-2 rounded-sm border border-border bg-card px-3 py-2.5 text-left hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    {activeChartId === "user" && <Star className="h-3.5 w-3.5 text-primary flex-shrink-0 fill-primary" />}
                    <span className="text-sm font-medium text-foreground truncate">{selectedChart?.name || "Select a chart"}</span>
                    {selectedChart?.birthDate && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">{displayBirthDate(selectedChart?.birthDate)}</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                {chartOptions.others.length > 3 && (
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search charts…"
                        value={chartSearch}
                        onChange={e => setChartSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
                <div className="max-h-[280px] overflow-y-auto">
                  {chartOptions.primary && (
                    <button
                      onClick={() => selectChart("user")}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors ${activeChartId === "user" ? "bg-primary/5" : ""}`}
                    >
                      <Star className="h-3.5 w-3.5 text-primary flex-shrink-0 fill-primary" />
                      <span className="text-sm font-medium text-foreground truncate">{chartOptions.primary.name}</span>
                      {chartOptions.primary.birthDate && (
                        <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{displayBirthDate(chartOptions.primary.birthDate)}</span>
                      )}
                    </button>
                  )}
                  {chartOptions.primary && filteredOthers.length > 0 && (
                    <div className="border-t border-border" />
                  )}
                  {filteredOthers.map(chart => (
                    <button
                      key={chart.id}
                      onClick={() => selectChart(chart.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors ${activeChartId === chart.id ? "bg-primary/5" : ""}`}
                    >
                      <span className="w-3.5 flex-shrink-0" />
                      <span className="text-sm text-foreground truncate">{chart.name}</span>
                      {chart.birthDate && (
                        <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{displayBirthDate(chart.birthDate)}</span>
                      )}
                    </button>
                  ))}
                  {filteredOthers.length === 0 && chartSearch && (
                    <p className="text-xs text-muted-foreground text-center py-3">No charts match "{chartSearch}"</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Chart Context */}
          {selectedChart && (
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{selectedChart.name}</span>
                {" · "}
                {displayBirthDate(selectedChart.birthDate)}
                {selectedChart.birthTime && ` at ${formatTime12h(selectedChart.birthTime)}`}
                {selectedChart.birthLocation && ` · ${selectedChart.birthLocation}`}
              </p>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {entries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-5">
                  <div>
                    <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-3 mx-auto" />
                    <p className="text-muted-foreground mb-1">
                      Ask any question about {selectedChart?.name || "the chart"}
                    </p>
                    <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
                      Or choose a topic for a comprehensive reading:
                    </p>
                  </div>
                  {selectedChart && (() => {
                    const matchingSR = findMatchingSolarReturn(
                      solarReturnCharts,
                      selectedChart,
                      activeChartId,
                    );
                    return (
                      <AskQuickTopics
                        onSelect={handleQuickTopic}
                        chartName={selectedChart.name || "Unknown"}
                        birthDate={selectedChart.birthDate || "unknown date"}
                        birthTime={selectedChart.birthTime || "unknown time"}
                        birthLocation={selectedChart.birthLocation || "unknown location"}
                        currentLocation={matchingSR?.solarReturnLocation || undefined}
                        disabled={isLoading}
                      />
                    );
                  })()}
                </div>
              )}

              {entries.map((entry, index) => (
                <div key={index}>
                  {entry.role === "user" && (
                    <div className="flex gap-3 justify-end">
                      <div className="max-w-[80%] rounded-lg px-4 py-3 bg-primary text-primary-foreground">
                        <p className="text-sm">{entry.content}</p>
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  {entry.role === "assistant" && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 max-w-[90%]">
                        {entry.reading ? (
                          <ReadingRenderer reading={entry.reading} onRegenerate={regenerateLastAnswer} />
                        ) : (
                          <div className="rounded-lg px-4 py-3 bg-muted">
                            <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <AskGenerationStatus
                  startedAt={loadingStartedAt ?? Date.now()}
                  jobStatus={jobStatus}
                />
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask any custom question about the chart..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            {isLoading ? (
              <Button
                onClick={handleStopGeneration}
                variant="destructive"
                className="shrink-0"
                size="icon"
                title="Stop generation"
              >
                <Square className="h-4 w-4 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!input.trim()}
                className="shrink-0"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!selectedChart && (
            <p className="text-xs text-destructive">
              No chart selected. Add a chart in the Charts tab for personalized answers.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
