import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NatalChart } from "@/hooks/useNatalChart";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { getPlanetaryPositions } from "@/lib/astrology";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AskViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartId: string | null;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-astrology`;

export const AskView = ({ userNatalChart, savedCharts, selectedChartId }: AskViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Get the selected chart for context
  const getSelectedChart = (): NatalChart | null => {
    if (!selectedChartId || selectedChartId === "general") return userNatalChart;
    if (selectedChartId === "user") return userNatalChart;
    return savedCharts.find(c => c.id === selectedChartId) || userNatalChart;
  };
  
  const selectedChart = getSelectedChart();
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildChartContext = (chart: NatalChart | null): string => {
    if (!chart) return "No chart data available.";
    
    const planets = chart.planets || {};
    const houseCusps = chart.houseCusps || {};
    
    let context = `Chart for ${chart.name}:\n`;
    context += `Birth: ${chart.birthDate}`;
    if (chart.birthTime) context += ` at ${chart.birthTime}`;
    if (chart.birthLocation) context += ` in ${chart.birthLocation}`;
    context += "\n\nNATAL Planetary Positions:\n";
    
    Object.entries(planets).forEach(([planet, data]) => {
      if (data && typeof data === 'object' && 'sign' in data) {
        const pos = data as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
        context += `- ${planet}: ${pos.degree}° ${pos.sign}`;
        if (pos.minutes) context += ` ${pos.minutes}'`;
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
    
    // Add CURRENT TRANSIT positions so the AI knows where planets are NOW
    context += "\n--- CURRENT TRANSITS (today's sky) ---\n";
    context += "IMPORTANT: These are the REAL current planetary positions calculated from ephemeris. Use these if the user asks about current transits or 'where is [planet] right now'.\n";
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
    } catch (e) {
      // Fallback: transit data unavailable
    }
    
    return context;
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    let assistantContent = "";
    
    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };
    
    try {
      const chartContext = buildChartContext(selectedChart);
      
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
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
      
      if (!resp.ok || !resp.body) {
        throw new Error("Failed to get response");
      }
      
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
      
      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch { /* ignore */ }
        }
      }
      
    } catch (error) {
      console.error("Ask error:", error);
      toast.error("Failed to get response. Please try again.");
      // Remove the pending assistant message if it exists
      setMessages(prev => {
        if (prev[prev.length - 1]?.role === "assistant" && !prev[prev.length - 1]?.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
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
    setMessages([]);
    setInput("");
  };

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
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chart Context Info */}
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
          
          {/* Messages Area */}
          <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
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
              
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input Area */}
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
