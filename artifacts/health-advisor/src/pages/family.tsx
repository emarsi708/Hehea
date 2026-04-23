import { useMemo } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users, AlertTriangle, CheckCircle2, ArrowRight, Pill, Calendar, FilePlus2, ShieldAlert,
} from "lucide-react";
import { useHealthReport } from "@/hooks/use-health-report";
import { formatDistanceToNow } from "date-fns";

export default function Family() {
  const { profiles, switchProfile } = useHealthReport();

  const summaries = useMemo(() => {
    return profiles.map(p => {
      const latest = p.history[0];
      const flags = latest?.report.flags ?? [];
      const critical = flags.filter(f => f.severity === "critical").length;
      const warning = flags.filter(f => f.severity === "warning").length;
      const watch = flags.filter(f => f.severity === "watch").length;
      const followUps = latest?.report.followUp ?? [];
      const urgent = followUps.filter(f => f.priority === "urgent").length;
      const meds = p.medications?.length ?? 0;
      const lastCheckIn = p.checkIns?.[0];

      let status: "critical" | "warning" | "watch" | "good" | "no-data" = "no-data";
      if (!latest) status = "no-data";
      else if (critical > 0 || urgent > 0) status = "critical";
      else if (warning > 0) status = "warning";
      else if (watch > 0) status = "watch";
      else status = "good";

      return { profile: p, latest, critical, warning, watch, urgent, meds, followUpCount: followUps.length, lastCheckIn, status };
    });
  }, [profiles]);

  const totals = useMemo(() => {
    return {
      needAttention: summaries.filter(s => s.status === "critical" || s.status === "warning").length,
      noReport: summaries.filter(s => s.status === "no-data").length,
      doingWell: summaries.filter(s => s.status === "good").length,
    };
  }, [summaries]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Family Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            All {profiles.length} {profiles.length === 1 ? "profile" : "profiles"} at a glance.
          </p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard icon={ShieldAlert} label="Need attention" value={totals.needAttention} color="text-destructive" bg="bg-destructive/10" />
          <StatCard icon={CheckCircle2} label="Doing well" value={totals.doingWell} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-500/10" />
          <StatCard icon={FilePlus2} label="No report yet" value={totals.noReport} color="text-muted-foreground" bg="bg-muted" />
        </div>

        {/* Family member cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {summaries.map(s => (
            <Card key={s.profile.id} className={`relative overflow-hidden ${
              s.status === "critical" ? "border-destructive/50" :
              s.status === "warning" ? "border-amber-500/50" :
              s.status === "good" ? "border-emerald-500/50" : ""
            }`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                s.status === "critical" ? "bg-destructive" :
                s.status === "warning" ? "bg-amber-500" :
                s.status === "watch" ? "bg-amber-400" :
                s.status === "good" ? "bg-emerald-500" : "bg-muted"
              }`} />
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl">{s.profile.name}</CardTitle>
                    <CardDescription className="capitalize">{s.profile.relation}</CardDescription>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {s.latest ? (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <MiniStat label="Critical" value={s.critical} color={s.critical > 0 ? "text-destructive" : ""} />
                      <MiniStat label="Warning" value={s.warning} color={s.warning > 0 ? "text-amber-600 dark:text-amber-400" : ""} />
                      <MiniStat label="Watch" value={s.watch} color={s.watch > 0 ? "text-amber-500" : ""} />
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Last report
                        </span>
                        <span className="font-medium">{formatDistanceToNow(new Date(s.latest.date))} ago</span>
                      </div>
                      {s.urgent > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            Urgent follow-ups
                          </span>
                          <span className="font-bold text-destructive">{s.urgent}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Pill className="h-3.5 w-3.5" />
                          Medications
                        </span>
                        <span className="font-medium">{s.meds}</span>
                      </div>
                      {s.lastCheckIn && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Last check-in</span>
                          <span className="font-medium">{formatDistanceToNow(new Date(s.lastCheckIn.date))} ago</span>
                        </div>
                      )}
                    </div>

                    {/* Top flags preview */}
                    {s.latest.report.flags.filter(f => f.severity === "critical" || f.severity === "warning").slice(0, 3).length > 0 && (
                      <div className="border-t pt-3 space-y-1">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Top concerns</p>
                        {s.latest.report.flags
                          .filter(f => f.severity === "critical" || f.severity === "warning")
                          .slice(0, 3)
                          .map(f => (
                            <div key={f.metric} className="flex items-center justify-between text-sm">
                              <span>{f.metric}</span>
                              <span className="font-mono font-semibold text-destructive">{f.value} {f.unit}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No report saved yet.</p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => switchProfile(s.profile.id)}
                  >
                    Switch to {s.profile.name}
                  </Button>
                  {s.latest ? (
                    <Link href="/results" className="flex-1">
                      <Button size="sm" className="w-full" onClick={() => switchProfile(s.profile.id)}>
                        View report <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/input" className="flex-1">
                      <Button size="sm" className="w-full" onClick={() => switchProfile(s.profile.id)}>
                        Add report
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: {
  icon: typeof ShieldAlert; label: string; value: number; color: string; bg: string;
}) {
  return (
    <Card>
      <CardContent className="py-4 flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div>
      <div className={`text-xl font-bold ${color || "text-muted-foreground"}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: "critical" | "warning" | "watch" | "good" | "no-data" }) {
  const styles = {
    critical: "bg-destructive text-destructive-foreground",
    warning: "bg-amber-500 text-white",
    watch: "bg-amber-200 text-amber-900",
    good: "bg-emerald-500 text-white",
    "no-data": "bg-muted text-muted-foreground",
  };
  const labels = {
    critical: "Needs attention",
    warning: "Watch",
    watch: "Monitor",
    good: "Healthy",
    "no-data": "No data",
  };
  return (
    <span className={`text-[10px] uppercase font-bold tracking-wider rounded-full px-2 py-1 ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
