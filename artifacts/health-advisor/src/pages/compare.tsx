import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { GitCompare, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { useCurrentProfile } from "@/hooks/use-health-report";
import { compareReports, summarizeComparison, type MetricChange } from "@/lib/compare";
import { format } from "date-fns";
import { Link } from "wouter";

const dirColor: Record<MetricChange["direction"], string> = {
  improved: "text-emerald-600 dark:text-emerald-400",
  worsened: "text-destructive",
  stable: "text-muted-foreground",
  new: "text-amber-600 dark:text-amber-400",
  resolved: "text-emerald-600 dark:text-emerald-400",
};

const dirBg: Record<MetricChange["direction"], string> = {
  improved: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30",
  worsened: "bg-destructive/5 border-destructive/30",
  stable: "bg-muted/30",
  new: "bg-amber-50 dark:bg-amber-950/20 border-amber-500/30",
  resolved: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30",
};

const dirIcon: Record<MetricChange["direction"], typeof TrendingUp> = {
  improved: TrendingDown,
  worsened: TrendingUp,
  stable: Minus,
  new: AlertCircle,
  resolved: CheckCircle2,
};

const dirLabel: Record<MetricChange["direction"], string> = {
  improved: "Improved",
  worsened: "Worsened",
  stable: "No change",
  new: "New issue",
  resolved: "Resolved",
};

export default function Compare() {
  const profile = useCurrentProfile();
  const history = profile?.history ?? [];

  const [olderId, setOlderId] = useState<string>(history[1]?.id ?? "");
  const [newerId, setNewerId] = useState<string>(history[0]?.id ?? "");

  const older = history.find(h => h.id === olderId);
  const newer = history.find(h => h.id === newerId);

  const changes = useMemo(() => {
    if (!older || !newer) return [];
    return compareReports(older.report, newer.report);
  }, [older, newer]);

  const summary = useMemo(() => summarizeComparison(changes), [changes]);

  const grouped = useMemo(() => {
    const g: Record<string, MetricChange[]> = {};
    changes.forEach(c => {
      g[c.category] = g[c.category] ?? [];
      g[c.category].push(c);
    });
    return g;
  }, [changes]);

  if (history.length < 2) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <GitCompare className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Need at least 2 reports</h1>
          <p className="text-muted-foreground mb-6">
            Save 2 or more reports for {profile?.name ?? "this profile"} to compare them and see what changed.
          </p>
          <Link href="/input">
            <Button>Create a new report</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitCompare className="h-7 w-7 text-primary" />
            What Changed?
          </h1>
          <p className="text-muted-foreground mt-1">
            Pick any two of {profile?.name ?? "your"} reports to see what improved, worsened, or stayed the same.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Older report</label>
                <Select value={olderId} onValueChange={setOlderId}>
                  <SelectTrigger><SelectValue placeholder="Pick a report" /></SelectTrigger>
                  <SelectContent>
                    {history.map(h => (
                      <SelectItem key={h.id} value={h.id} disabled={h.id === newerId}>
                        {format(new Date(h.date), "PP p")} ({h.report.flags.length} markers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Newer report</label>
                <Select value={newerId} onValueChange={setNewerId}>
                  <SelectTrigger><SelectValue placeholder="Pick a report" /></SelectTrigger>
                  <SelectContent>
                    {history.map(h => (
                      <SelectItem key={h.id} value={h.id} disabled={h.id === olderId}>
                        {format(new Date(h.date), "PP p")} ({h.report.flags.length} markers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {!older || !newer ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Pick two different reports above.</CardContent></Card>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <SummaryStat label="Improved" value={summary.improved} color="text-emerald-600 dark:text-emerald-400" />
              <SummaryStat label="Worsened" value={summary.worsened} color="text-destructive" />
              <SummaryStat label="No change" value={summary.stable} color="text-muted-foreground" />
              <SummaryStat label="New issues" value={summary.newIssues} color="text-amber-600 dark:text-amber-400" />
              <SummaryStat label="Resolved" value={summary.resolved} color="text-emerald-600 dark:text-emerald-400" />
            </div>

            {(summary.topImprovements.length > 0 || summary.topConcerns.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {summary.topImprovements.length > 0 && (
                  <Card className="border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <TrendingDown className="h-4 w-4" />
                        Biggest wins
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {summary.topImprovements.map(c => (
                        <div key={c.metric} className="text-sm">
                          <span className="font-medium">{c.metric}</span>
                          <span className="text-muted-foreground"> — {fmt(c.oldValue)} → {fmt(c.newValue)} {c.unit}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
                {summary.topConcerns.length > 0 && (
                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        Watch closely
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {summary.topConcerns.map(c => (
                        <div key={c.metric} className="text-sm">
                          <span className="font-medium">{c.metric}</span>
                          <span className="text-muted-foreground"> — {fmt(c.oldValue)} → {fmt(c.newValue)} {c.unit}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Grouped changes */}
            <div className="space-y-6">
              {Object.entries(grouped).map(([category, items]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                    <CardDescription>{items.length} markers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.map(c => {
                      const Icon = dirIcon[c.direction];
                      return (
                        <div key={c.metric} className={`p-3 rounded-lg border ${dirBg[c.direction]}`}>
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm">{c.metric}</div>
                              <div className="text-sm mt-1 flex items-center gap-2 flex-wrap">
                                <span className="font-mono">{c.oldStatus === "missing" ? "—" : fmt(c.oldValue)}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="font-mono font-semibold">{c.newStatus === "missing" ? "—" : fmt(c.newValue)}</span>
                                <span className="text-muted-foreground text-xs">{c.unit}</span>
                                {c.direction !== "stable" && c.direction !== "new" && c.direction !== "resolved" && c.percentChange !== 0 && (
                                  <span className={`text-xs font-semibold ${dirColor[c.direction]}`}>
                                    {c.percentChange > 0 ? "+" : ""}{c.percentChange.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${dirColor[c.direction]}`}>
                              <Icon className="h-4 w-4" />
                              {dirLabel[c.direction]}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="py-4 text-center">
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function fmt(n: number): string {
  if (Math.abs(n) >= 100) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(2);
}
