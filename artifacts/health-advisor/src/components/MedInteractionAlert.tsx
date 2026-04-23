import { AlertTriangle, Pill } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useCurrentProfile } from "@/hooks/use-health-report";
import { findInteractions } from "@/lib/medications";
import { useMemo } from "react";

export function MedInteractionAlert({ flags }: { flags: { metric: string }[] }) {
  const profile = useCurrentProfile();
  const meds = profile?.medications ?? [];

  const warnings = useMemo(
    () => (flags.length && meds.length ? findInteractions(meds, flags) : []),
    [meds, flags],
  );

  if (meds.length === 0) {
    return (
      <Card className="border-dashed bg-muted/30 print-hide">
        <CardContent className="py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Pill className="h-4 w-4" />
            <span>Add your medications to detect possible lab interactions.</span>
          </div>
          <Link href="/medications">
            <Button variant="outline" size="sm">Manage meds</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (warnings.length === 0) return null;

  return (
    <Card className="border-amber-500/50 bg-amber-50/40 dark:bg-amber-950/20 print-hide">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-200 text-lg">
          <AlertTriangle className="h-5 w-5" />
          Medication-Lab Interactions ({warnings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {warnings.slice(0, 4).map((w, i) => (
          <div key={i} className="bg-background rounded-lg border p-3 text-sm">
            <div className="font-medium">
              <span className="text-amber-700 dark:text-amber-300">{w.medication.split(" (")[0]}</span>
              {" → "}
              <span>{w.flaggedMetric}</span>
            </div>
            <p className="text-muted-foreground mt-1">{w.effect}. {w.recommendation}</p>
          </div>
        ))}
        {warnings.length > 4 && (
          <Link href="/medications">
            <Button variant="ghost" size="sm">View all {warnings.length} interactions</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
