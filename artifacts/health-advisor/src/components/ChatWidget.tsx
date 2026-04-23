import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2, Sparkles, X, Bot } from "lucide-react";
import { useHealthReport } from "@/hooks/use-health-report";
import { cn } from "@/lib/utils";

const API = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

interface Msg { role: "user" | "model"; content: string; }

const SUGGESTED_WITH_REPORT = [
  "Explain my report in simple terms",
  "Why is my LDL high?",
  "What foods help lower my creatinine?",
  "What lifestyle changes will help most?",
];

const SUGGESTED_GENERAL = [
  "What is HbA1c and why does it matter?",
  "How can I improve my cholesterol naturally?",
  "What does a high TSH mean?",
  "Tips for better sleep and stress",
];

export function ChatWidget() {
  const { lastInputs, lastReport } = useHealthReport();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 50);
    }
  }, [messages, loading, open]);

  const hasReport = !!lastReport;
  const suggested = hasReport ? SUGGESTED_WITH_REPORT : SUGGESTED_GENERAL;

  const buildContext = () => {
    if (!lastReport) return "";
    const parts: string[] = [];
    if (lastInputs?.age) parts.push(`Age: ${lastInputs.age}`);
    if (lastInputs?.gender) parts.push(`Gender: ${lastInputs.gender}`);
    if (lastInputs?.weight && lastInputs?.height) parts.push(`Weight: ${lastInputs.weight}kg, Height: ${lastInputs.height}cm`);
    if (lastInputs?.conditions?.length) parts.push(`Conditions: ${lastInputs.conditions.join(", ")}`);
    if (lastReport.flags?.length) {
      parts.push("\nFlagged values:");
      lastReport.flags.forEach(f => {
        parts.push(`- ${f.metric}: ${f.value} ${f.unit} (${f.status}, ${f.severity})`);
      });
    }
    return parts.join("\n");
  };

  const send = async (q: string) => {
    if (!q.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: q };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          context: buildContext(),
          history: messages.slice(-6),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setMessages([...newHistory, { role: "model", content: data.answer || "Sorry, I couldn't generate a response." }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error. Please try again.";
      setMessages([...newHistory, { role: "model", content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          "print-hide fixed z-50 bottom-5 right-5 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all",
          "bg-primary text-primary-foreground hover:scale-105 active:scale-95",
          open && "scale-90"
        )}
        aria-label={open ? "Close chat" : "Open chat"}
        data-testid="button-chat-toggle"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="print-hide fixed z-40 bottom-24 right-5 w-[calc(100vw-2.5rem)] sm:w-[400px] max-w-[400px] h-[min(600px,calc(100vh-8rem))] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          data-testid="panel-chat"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b bg-primary/5 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">HealthAdvisor AI</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {hasReport ? "Knows your latest report" : "General wellness Q&A"}
              </p>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMessages([])}
              >
                Clear
              </Button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollRef as never}>
              <div className="p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="space-y-3">
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
                      Hi! I'm your HealthAdvisor assistant.{" "}
                      {hasReport
                        ? "I can see your latest report — ask me anything about your numbers."
                        : "Ask me about lab tests, healthy habits, or any wellness topic. Generate a report to get personalized answers."}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 pt-2">
                      <Sparkles className="h-3 w-3" /> Try asking
                    </p>
                    <div className="flex flex-col gap-2">
                      {suggested.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => send(s)}
                          disabled={loading}
                          className="text-left text-sm border rounded-xl px-3 py-2 hover:bg-accent transition-colors disabled:opacity-50"
                          data-testid="button-suggested"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((m, i) => (
                      <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                          m.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted rounded-tl-sm"
                        )}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Input */}
          <form
            onSubmit={e => { e.preventDefault(); send(input); }}
            className="p-3 border-t flex gap-2 items-end bg-background"
          >
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
              }}
              placeholder="Ask anything about health..."
              className="min-h-[40px] max-h-32 resize-none text-sm"
              disabled={loading}
              rows={1}
              data-testid="input-chat"
            />
            <Button
              type="submit"
              disabled={!input.trim() || loading}
              size="icon"
              className="shrink-0"
              data-testid="button-chat-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground px-3 pb-2">
            Not medical advice. Always consult your doctor.
          </p>
        </div>
      )}
    </>
  );
}
