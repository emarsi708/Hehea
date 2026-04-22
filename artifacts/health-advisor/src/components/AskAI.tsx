import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Loader2, Sparkles } from "lucide-react";
import { AnalysisResult, HealthInputs } from "@/lib/types";

const API = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

interface Msg { role: "user" | "model"; content: string; }

const SUGGESTED = [
  "Why is my LDL high?",
  "What foods help lower my creatinine?",
  "Should I worry about this report?",
  "What lifestyle changes will help most?",
];

export function AskAI({ inputs, report }: { inputs: Partial<HealthInputs>; report: AnalysisResult }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const buildContext = () => {
    const parts: string[] = [];
    if (inputs.age) parts.push(`Age: ${inputs.age}`);
    if (inputs.gender) parts.push(`Gender: ${inputs.gender}`);
    if (inputs.weight && inputs.height) parts.push(`Weight: ${inputs.weight}kg, Height: ${inputs.height}cm`);
    if (inputs.conditions?.length) parts.push(`Conditions: ${inputs.conditions.join(", ")}`);
    parts.push("\nFlagged values:");
    report.flags.forEach(f => {
      parts.push(`- ${f.metric}: ${f.value} ${f.unit} (${f.status}, ${f.severity})`);
    });
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
      const data = await res.json();
      setMessages([...newHistory, { role: "model", content: data.answer || "Sorry, I couldn't generate a response." }]);
    } catch {
      setMessages([...newHistory, { role: "model", content: "Network error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="print-hide">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Ask about your report
        </CardTitle>
        <CardDescription>
          Get plain-language answers about your specific values. Not medical advice.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-4 w-4" /> Try one of these
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map(s => (
                <Button key={s} variant="outline" size="sm" onClick={() => send(s)} disabled={loading}>
                  {s}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-80 pr-4" ref={scrollRef as never}>
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-3"><Loader2 className="h-4 w-4 animate-spin" /></div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          className="flex gap-2 items-end"
        >
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            placeholder="Ask anything about your numbers..."
            className="min-h-[44px] max-h-32 resize-none"
            disabled={loading}
          />
          <Button type="submit" disabled={!input.trim() || loading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
