import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { useHealthReport } from "@/hooks/use-health-report";
import { buildSevenDayPlan } from "@/lib/wellnessPlan";
import { Coffee, Utensils, Moon, Apple, Dumbbell, Droplets, Target, Printer } from "lucide-react";

export default function Plan() {
  const [, setLocation] = useLocation();
  const { lastInputs, lastReport } = useHealthReport();

  useEffect(() => {
    if (!lastReport || !lastInputs) setLocation("/input");
  }, [lastReport, lastInputs, setLocation]);

  const plan = useMemo(() => {
    if (!lastInputs || !lastReport) return [];
    return buildSevenDayPlan(lastInputs, lastReport);
  }, [lastInputs, lastReport]);

  if (!lastReport || !lastInputs) return null;

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="h-7 w-7 text-primary" />
              Your 7-Day Wellness Plan
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalized to your latest report. Swap meals freely; the principle matters more than the dish.
            </p>
          </div>
          <Button variant="outline" onClick={() => window.print()} className="gap-2 print-hide">
            <Printer className="h-4 w-4" />Print
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {plan.map(day => (
            <Card key={day.day} className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="flex items-baseline justify-between">
                  <span>Day {day.day}</span>
                  <span className="text-sm font-normal text-muted-foreground">{day.label}</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" />
                  {day.focus}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="flex gap-2"><Coffee className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" /><div><strong>Breakfast:</strong> {day.meals.breakfast}</div></div>
                <div className="flex gap-2"><Utensils className="h-4 w-4 text-orange-700 shrink-0 mt-0.5" /><div><strong>Lunch:</strong> {day.meals.lunch}</div></div>
                <div className="flex gap-2"><Apple className="h-4 w-4 text-green-700 shrink-0 mt-0.5" /><div><strong>Snack:</strong> {day.meals.snack}</div></div>
                <div className="flex gap-2"><Moon className="h-4 w-4 text-indigo-700 shrink-0 mt-0.5" /><div><strong>Dinner:</strong> {day.meals.dinner}</div></div>
                <div className="border-t pt-3 flex gap-4 flex-wrap">
                  <Badge variant="outline" className="gap-1"><Dumbbell className="h-3 w-3" />{day.movement}</Badge>
                  <Badge variant="outline" className="gap-1"><Droplets className="h-3 w-3" />{day.hydration}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">General principles for the week</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Sleep 7–9 hours every night — it directly affects sugar, hormones, and weight.</p>
            <p>• Aim for 8,000–10,000 steps daily on top of structured exercise.</p>
            <p>• Eat protein at every meal to keep blood sugar stable.</p>
            <p>• Cut visible added sugar (sweet drinks, desserts) for 7 days as an experiment.</p>
            <p>• If a recommendation contradicts your doctor's advice, follow your doctor.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
