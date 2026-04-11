import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Send, Loader2, Sparkles, User, Trash2, Search, Star, ChevronDown, Download, History, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NatalChart } from "@/hooks/useNatalChart";
import { toast } from "sonner";
import { getPlanetaryPositions } from "@/lib/astrology";
import { formatDateMMDDYYYY } from "@/lib/localDate";
import { generateAskPdf } from "@/lib/askPdfExport";
import { ReadingRenderer, StructuredReading } from "@/components/AskReadingRenderer";
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
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-astrology`;
const STORAGE_KEY = "ask-conversations";
const LEGACY_ACTIVE_CHAT_KEY = "ask-active-chat";
const ACTIVE_CHAT_KEY_PREFIX = "ask-active-chat:";
const ACTIVE_META_KEY = "ask-active-meta";
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

function displayBirthDate(date?: string) {
  return formatDateMMDDYYYY(date) || date || "";
}

export const AskView = ({ userNatalChart, savedCharts, selectedChartId: initialChartId }: AskViewProps) => {
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
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [chartSearch, setChartSearch] = useState("");

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
    assignThreadId(convo.chartId, convo.id);
    setActiveChartId(convo.chartId);
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

  const buildChartContext = (chart: NatalChart | null): string => {
    if (!chart) return "No chart data available.";
    const planets = chart.planets || {};
    const houseCusps = chart.houseCusps || {};
    let context = `Chart for ${chart.name}:\n`;
    context += `Birth: ${displayBirthDate(chart.birthDate)}`;
    if (chart.birthTime) context += ` at ${chart.birthTime}`;
    if (chart.birthLocation) context += ` in ${chart.birthLocation}`;
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
    Object.entries(planets).forEach(([planet, data]) => {
      if (data && typeof data === 'object' && 'sign' in data) {
        const pos = data as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
        const absDeg = ZODIAC.indexOf(pos.sign) * 30 + pos.degree + (pos.minutes || 0) / 60;
        const house = calcHouse(absDeg);
        context += `- ${planet}: ${pos.degree}°${pos.minutes || 0}' ${pos.sign}`;
        if (house) context += ` (House ${house})`;
        if (pos.isRetrograde) context += " (R)";
        context += "\n";
      }
    });
    if (Object.keys(houseCusps).length > 0) {
      context += "\nHouse Cusps:\n";
      Object.entries(houseCusps).forEach(([house, data]) => {
        if (data && typeof data === 'object' && 'sign' in data) {
          const pos = data as { sign: string; degree: number };
          const houseNum = house.replace('house', '');
          context += `- House ${houseNum}: ${pos.degree}° ${pos.sign}\n`;
        }
      });
    }
    context += "\n--- CURRENT TRANSITS (today's sky) ---\n";
    try {
      const nowPlanets = getPlanetaryPositions(new Date());
      const signGlyphMap: Record<string, string> = { '♈':'Aries','♉':'Taurus','♊':'Gemini','♋':'Cancer','♌':'Leo','♍':'Virgo','♎':'Libra','♏':'Scorpio','♐':'Sagittarius','♑':'Capricorn','♒':'Aquarius','♓':'Pisces' };
      Object.entries(nowPlanets).forEach(([key, val]: [string, any]) => {
        if (['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'].includes(key) && val) {
          const sign = val.signName || signGlyphMap[val.sign] || val.sign || 'Unknown';
          const deg = typeof val.degree === 'number' ? val.degree.toFixed(1) : val.degree || 0;
          context += `- Transiting ${key.charAt(0).toUpperCase() + key.slice(1)}: ${deg}° ${sign}\n`;
        }
      });
    } catch {}
    return context;
  };

  const handleSubmit = async () => {
    const question = input.trim();
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

    try {
      const chartContext = buildChartContext(chartForRequest);
      const apiMessages = requestEntries
        .filter(entry => entry.role === "user")
        .map(entry => ({ role: "user" as const, content: entry.content }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          chartContext,
        }),
      });

      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment and try again.");
        setIsLoading(false);
        return;
      }
      if (resp.status === 402) {
        toast.error("AI credits exhausted. Please add credits to continue.");
        setIsLoading(false);
        return;
      }
      if (!resp.ok) throw new Error("Failed to get response");

      const data = await resp.json();

      if (data.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      let assistantEntry: ChatEntry;

      if (data.sections) {
        assistantEntry = { role: "assistant", content: "", reading: data as StructuredReading };
      } else if (data.raw) {
        assistantEntry = { role: "assistant", content: data.raw };
      } else {
        assistantEntry = { role: "assistant", content: JSON.stringify(data, null, 2) };
      }

      const nextEntries = [...requestEntries, assistantEntry];
      saveActiveChat(chartIdForRequest, nextEntries);
      upsertConversationSnapshot(nextEntries, chartIdForRequest, chartNameForRequest);

      if (activeChartIdRef.current === chartIdForRequest) {
        setEntries(nextEntries);
      }
    } catch (error) {
      console.error("Ask error:", error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    clearThreadId(activeChartId);
    setEntries([]);
    setInput("");
  };

  const handleDownloadPdf = () => {
    if (!selectedChart || entries.length === 0) return;
    const readings = entries.filter(e => e.role === "assistant" && e.reading).map(e => e.reading!);
    if (readings.length === 0) {
      toast.error("No structured readings to export yet.");
      return;
    }
    generateAskPdf(selectedChart, readings);
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

  const hasAssistantReadings = entries.some(e => e.role === "assistant" && e.reading);

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
              {hasAssistantReadings && (
                <Button variant="ghost" size="sm" onClick={handleDownloadPdf} className="text-muted-foreground" title="Download as PDF">
                  <Download className="h-4 w-4 mr-1" />
                  PDF
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
                      <span className="text-xs text-muted-foreground flex-shrink-0">{selectedChart.birthDate}</span>
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
                        <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{chartOptions.primary.birthDate}</span>
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
                        <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{chart.birthDate}</span>
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
                {selectedChart.birthDate}
                {selectedChart.birthTime && ` at ${selectedChart.birthTime}`}
                {selectedChart.birthLocation && ` · ${selectedChart.birthLocation}`}
              </p>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="h-[500px] pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {entries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Ask any question about {selectedChart?.name || "the chart"}
                  </p>
                  <p className="text-sm text-muted-foreground/70 max-w-md">
                    For example: "Where does the ability to see spirits come from in this chart?"
                    or "Why is there tension between the Sun and Saturn?"
                  </p>
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
                          <ReadingRenderer reading={entry.reading} />
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
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Reading the chart...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about the chart interpretation..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="shrink-0"
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
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
