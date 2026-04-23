import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Target, Plus, Trash2, Sparkles, Loader2, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
import { useHealthReport, useCurrentProfile, type Goal } from "@/hooks/use-health-report";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInDays, parseISO } from "date-fns";

const API = (import.meta.env.VITE_API_URL ?? "/api").replace(/\/$/, "");

const COMMON_GOALS = [
  { metric: "LDL Cholesterol", unit: "mg/dL", direction: "lower" },
  { metric: "HbA1c", unit: "%", direction: "lower" },
  { metric: "Fasting Glucose", unit: "mg/dL", direction: "lower" },
  { metric: "Triglycerides", unit: "mg/dL", direction: "lower" },
  { metric: "Weight", unit: "kg", direction: "lower" },
  { metric: "Vitamin D", unit: "ng/mL", direction: "higher" },
  { metric: "Hemoglobin", unit: "g/dL", direction: "higher" },
  { metric: "TSH", unit: "mIU/L", direction: "lower" },
];

export default function Goals() {
  const profile = useCurrentProfile();
  const { addGoal, removeGoal, lastReport } = useHealthReport();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [coachLoading, setCoachLoading] = useState<string | null>(null);
  const [coachPlans, setCoachPlans] = useState<Record<string, string>>({});

  const goals = profile?.goals ?? [];

  const goalProgress = (g: Goal) => {
    const latest = lastReport?.flags.find(f => f.metric.toLowerCase() === g.metric.toLowerCase());
    const current = latest?.value;
    if (current === undefined) return { current: g.startValue, percent: 0 };
    const goingDown = g.targetValue < g.startValue;
    let percent = 0;
    if (goingDown) {
      const total = g.startValue - g.targetValue;
      const done = g.startValue - current;
      percent = total > 0 ? Math.max(0, Math.min(100, (done / total) * 100)) : 0;
    } else {
      const total = g.targetValue - g.startValue;
      const done = current - g.startValue;
      percent = total > 0 ? Math.max(0, Math.min(100, (done / total) * 100)) : 0;
    }
    return { current, percent };
  };

  const handleAdd = (data: Omit<Goal, "id" | "createdAt">) => {
    if (!data.metric || !data.unit || isNaN(data.startValue) || isNaN(data.targetValue) || !data.deadline) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    addGoal(data);
    toast({ title: "Goal created" });
    setOpen(false);
  };

  const askCoach = async (g: Goal) => {
    setCoachLoading(g.id);
    try {
      const days = differenceInDays(parseISO(g.deadline), new Date());
      const direction = g.targetValue < g.startValue ? "lower" : "raise";
      const question = `Build a weekly micro-plan to ${direction} my ${g.metric} from ${g.startValue} ${g.unit} to ${g.targetValue} ${g.unit} in about ${days} days. Give me 4-5 concrete weekly actions (food, exercise, sleep, lifestyle) that are realistic and prioritized. Keep it brief.`;
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, context: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setCoachPlans(prev => ({ ...prev, [g.id]: data.answer || "No plan returned" }));
    } catch (e) {
      toast({ title: "Coach failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setCoachLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-7 w-7 text-primary" />
              Health Goals
            </h1>
            <p className="text-muted-foreground mt-1">
              Set targets and let your AI coach build a weekly plan to reach them.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Goal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a goal</DialogTitle>
              </DialogHeader>
              <GoalForm latest={lastReport} onSubmit={handleAdd} onCancel={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Target className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No goals yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Set a target like "lower my LDL to 100" and the AI coach will build a step-by-step weekly plan.
              </p>
              <Button onClick={() => setOpen(true)}>Create your first goal</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map(g => {
              const { current, percent } = goalProgress(g);
              const days = differenceInDays(parseISO(g.deadline), new Date());
              const goingDown = g.targetValue < g.startValue;
              const reached = (goingDown && current <= g.targetValue) || (!goingDown && current >= g.targetValue);
              return (
                <Card key={g.id} className={reached ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/10" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {goingDown ? <TrendingDown className="h-5 w-5 text-primary" /> : <TrendingUp className="h-5 w-5 text-primary" />}
                          {g.metric}
                          {reached && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                        </CardTitle>
                        <CardDescription>
                          From {g.startValue} → {g.targetValue} {g.unit} by {format(parseISO(g.deadline), "PP")}
                          {days > 0 ? ` (${days} days left)` : days === 0 ? " (today!)" : ` (${Math.abs(days)} days overdue)`}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeGoal(g.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">Current: <strong>{current.toFixed(1)} {g.unit}</strong></span>
                        <span className="font-semibold">{percent.toFixed(0)}%</span>
                      </div>
                      <Progress value={percent} />
                    </div>
                    {g.notes && <p className="text-sm text-muted-foreground">{g.notes}</p>}

                    {coachPlans[g.id] ? (
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-primary">
                          <Sparkles className="h-4 w-4" /> AI Coach Plan
                        </div>
                        <div className="text-sm whitespace-pre-wrap leading-relaxed">{coachPlans[g.id]}</div>
                        <Button variant="ghost" size="sm" className="mt-3" onClick={() => askCoach(g)} disabled={coachLoading === g.id}>
                          Regenerate plan
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => askCoach(g)} disabled={coachLoading === g.id} variant="outline" className="w-full">
                        {coachLoading === g.id ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Building plan...</>
                        ) : (
                          <><Sparkles className="h-4 w-4 mr-2" /> Get AI weekly plan</>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function GoalForm({ latest, onSubmit, onCancel }: {
  latest: ReturnType<typeof useHealthReport.getState>["lastReport"];
  onSubmit: (g: Omit<Goal, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [metric, setMetric] = useState("");
  const [unit, setUnit] = useState("");
  const [startValue, setStartValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return format(d, "yyyy-MM-dd");
  });
  const [notes, setNotes] = useState("");

  const reportMetrics = useMemo(() => latest?.flags.map(f => f.metric) ?? [], [latest]);

  const pickPreset = (g: typeof COMMON_GOALS[number]) => {
    setMetric(g.metric);
    setUnit(g.unit);
    const fromReport = latest?.flags.find(f => f.metric.toLowerCase() === g.metric.toLowerCase());
    if (fromReport) {
      setStartValue(String(fromReport.value));
      setUnit(fromReport.unit || g.unit);
    }
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({
          metric, unit,
          startValue: parseFloat(startValue),
          targetValue: parseFloat(targetValue),
          deadline, notes,
        });
      }}
      className="space-y-3"
    >
      <div>
        <Label className="mb-1.5 block">Common goals</Label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_GOALS.map(g => (
            <Button key={g.metric} type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => pickPreset(g)}>
              {g.metric}
            </Button>
          ))}
        </div>
      </div>

      {reportMetrics.length > 0 && (
        <div>
          <Label>Or pick from your report</Label>
          <Select value={metric} onValueChange={v => {
            setMetric(v);
            const f = latest?.flags.find(x => x.metric === v);
            if (f) { setStartValue(String(f.value)); setUnit(f.unit); }
          }}>
            <SelectTrigger><SelectValue placeholder="Select a metric" /></SelectTrigger>
            <SelectContent>
              {reportMetrics.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="g-metric">Metric *</Label>
          <Input id="g-metric" value={metric} onChange={e => setMetric(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="g-unit">Unit *</Label>
          <Input id="g-unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="mg/dL" required />
        </div>
        <div>
          <Label htmlFor="g-start">Current value *</Label>
          <Input id="g-start" type="number" step="0.01" value={startValue} onChange={e => setStartValue(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="g-target">Target value *</Label>
          <Input id="g-target" type="number" step="0.01" value={targetValue} onChange={e => setTargetValue(e.target.value)} required />
        </div>
      </div>

      <div>
        <Label htmlFor="g-deadline">Target date *</Label>
        <Input id="g-deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="g-notes">Notes</Label>
        <Textarea id="g-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Why this matters..." />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create goal</Button>
      </DialogFooter>
    </form>
  );
}
