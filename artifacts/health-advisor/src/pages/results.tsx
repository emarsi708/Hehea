import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AskAI } from "@/components/AskAI";
import { DoctorSummary } from "@/components/DoctorSummary";
import { RemindersButton } from "@/components/RemindersButton";
import { ShareReport } from "@/components/ShareReport";
import { Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner";
import { useHealthReport } from "@/hooks/use-health-report";
import { exportToHtml } from "@/lib/export";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";
import { 
  AlertCircle, AlertTriangle, CheckCircle2, ChevronRight, Droplets, 
  Dumbbell, Utensils, Printer, Download, Edit, CalendarDays, Activity,
  Sparkles, ListChecks, Stethoscope, ShieldCheck, ShieldAlert
} from "lucide-react";
import { NearbySpecialists } from "@/components/NearbySpecialists";
import { MedInteractionAlert } from "@/components/MedInteractionAlert";
import { CostEstimator } from "@/components/CostEstimator";
import { format } from "date-fns";

export default function Results() {
  const [, setLocation] = useLocation();
  const { lastReport, lastInputs, saveToHistory } = useHealthReport();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveToHistory();
    setSaved(true);
    toast({ title: "Saved to history", description: "View this report anytime in Trends." });
    setTimeout(() => setSaved(false), 3000);
  };

  useEffect(() => {
    if (!lastReport) {
      setLocation("/input");
    }
  }, [lastReport, setLocation]);

  if (!lastReport) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const html = exportToHtml(lastReport);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertCircle className="h-5 w-5 text-destructive shrink-0" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case "watch": return <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />;
      default: return <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive/10 border-destructive/20 text-destructive-foreground";
      case "warning": return "bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200";
      case "watch": return "bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200";
      default: return "bg-primary/10 border-primary/20 text-primary-foreground";
    }
  };

  const radarData = Object.entries(lastReport.scores).map(([key, value]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
  }));

  const chartData = lastReport.flags.map(f => ({
    name: f.metric,
    value: f.status === "high" ? 3 : f.status === "low" ? 1 : 2, // simplified for visualization
    actual: f.value,
    status: f.status,
  }));

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      <DisclaimerBanner />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-hide">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Health Report</h1>
            <p className="text-muted-foreground mt-1">Generated on {format(new Date(lastReport.date), "MMMM d, yyyy")}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/input">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Inputs
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download HTML
            </Button>
            <Button variant={saved ? "secondary" : "default"} size="sm" onClick={handleSave} disabled={saved}>
              {saved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {saved ? "Saved" : "Save to history"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 print-hide">
          <Link href="/plan"><Button variant="outline" size="sm" className="gap-2"><Sparkles className="h-4 w-4" />Get 7-Day Plan</Button></Link>
          <DoctorSummary inputs={lastInputs ?? {}} report={lastReport} />
          <RemindersButton report={lastReport} />
          <ShareReport inputs={lastInputs ?? {}} report={lastReport} />
        </div>

        {/* Hero Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-primary text-primary-foreground border-none shadow-md overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <Activity className="w-64 h-64 -mt-10 -mr-10" />
            </div>
            <CardContent className="p-8 relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm uppercase tracking-wider font-medium opacity-90">Summary of your report</span>
              </div>
              <h2 className="text-2xl font-semibold leading-snug">
                {lastReport.summaryDetail?.headline ?? "Your Health Report"}
              </h2>
              <div className="space-y-3">
                {(lastReport.summaryDetail?.paragraphs ?? [lastReport.summary]).map((p, i) => (
                  <p key={i} className="text-base leading-relaxed text-primary-foreground/90">{p}</p>
                ))}
              </div>
              {lastReport.summaryDetail && (
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {lastReport.summaryDetail.topConcerns.length > 0 && (
                    <div className="bg-primary-foreground/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Watch closely</span>
                      </div>
                      <ul className="text-sm space-y-1 text-primary-foreground/90">
                        {lastReport.summaryDetail.topConcerns.slice(0, 4).map(c => (
                          <li key={c}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {lastReport.summaryDetail.positives.length > 0 && (
                    <div className="bg-primary-foreground/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Looking healthy</span>
                      </div>
                      <ul className="text-sm space-y-1 text-primary-foreground/90 capitalize">
                        {lastReport.summaryDetail.positives.map(p => (
                          <li key={p}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6 flex flex-col">
            <Card className="bg-card shadow-sm">
              <CardContent className="p-6 flex flex-col justify-center">
                <div className="text-center space-y-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">BMI</span>
                  <div className="text-4xl font-bold">{lastReport.bmi.value || "--"}</div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mt-2">
                    {lastReport.bmi.category}
                  </div>
                </div>
              </CardContent>
            </Card>
            {lastReport.summaryDetail && (
              <Card className="bg-card shadow-sm flex-1">
                <CardContent className="p-6 flex flex-col justify-center text-center space-y-2">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Risk</span>
                  <div className={`text-2xl font-bold capitalize ${
                    lastReport.summaryDetail.riskLevel === "high" ? "text-destructive"
                    : lastReport.summaryDetail.riskLevel === "elevated" ? "text-amber-600 dark:text-amber-400"
                    : lastReport.summaryDetail.riskLevel === "moderate" ? "text-blue-600 dark:text-blue-400"
                    : "text-primary"
                  }`}>
                    {lastReport.summaryDetail.riskLevel}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on {lastReport.flags.length} flagged value{lastReport.flags.length === 1 ? "" : "s"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Immediate Action Plan */}
        {lastReport.actionPlan && lastReport.actionPlan.length > 0 && (
          <Card className="shadow-sm border-primary/30 print-page-break">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                Your Action Plan
              </CardTitle>
              <CardDescription>Concrete next steps you can start this week, ordered by priority.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {lastReport.actionPlan.map((item, i) => {
                  const badge =
                    item.priority === "urgent" ? "bg-destructive/10 text-destructive border-destructive/20"
                    : item.priority === "soon" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                    : "bg-primary/10 text-primary border-primary/20";
                  return (
                    <li key={i} className="flex gap-4 p-4 rounded-lg border bg-background">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold">{item.title}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge}`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* System Scores Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>A score out of 100 for each major health category based on your inputs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attention Areas / Flags */}
        <div className="space-y-4 print-page-break">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Areas to Monitor
          </h3>
          
          {lastReport.flags.length === 0 ? (
            <Card className="bg-secondary/30 border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <CheckCircle2 className="h-12 w-12 text-primary mb-4 opacity-50" />
                <p>No abnormal values found in the data provided. Great job!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {lastReport.flags.map((flag, idx) => (
                <div key={idx} className={`p-4 rounded-xl border flex gap-4 ${getSeverityClass(flag.severity)}`}>
                  <div className="mt-0.5">{getSeverityIcon(flag.severity)}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-lg">{flag.metric}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium opacity-80 uppercase tracking-wide">{flag.status}</span>
                        <span className="font-mono bg-background/50 px-2 py-0.5 rounded text-sm">
                          {flag.value} {flag.unit}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed">{flag.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 print-page-break">
          {/* Diet Plan */}
          <Card className="shadow-sm flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                Nutrition Strategy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="flex justify-between items-center bg-secondary/50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Target</p>
                  <p className="text-2xl font-bold">{lastReport.diet.dailyCaloriesTarget} <span className="text-base font-normal text-muted-foreground">kcal</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Macros</p>
                  <p className="text-sm font-medium">
                    {lastReport.diet.macroSplit.protein}% P / {lastReport.diet.macroSplit.carbs}% C / {lastReport.diet.macroSplit.fat}% F
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-primary">Focus On</h4>
                  <div className="flex flex-wrap gap-2">
                    {lastReport.diet.foodsToEat.map(food => (
                      <span key={food} className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-md">{food}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-destructive">Limit / Avoid</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...lastReport.diet.foodsToLimit, ...lastReport.diet.foodsToAvoid].map(food => (
                      <span key={food} className="bg-destructive/10 text-destructive text-xs px-2.5 py-1 rounded-md">{food}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t mt-auto">
                <h4 className="text-sm font-semibold mb-3">Sample Day</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-3"><span className="font-medium w-16 shrink-0">Breakfast</span> <span className="text-muted-foreground">{lastReport.diet.sampleDay.breakfast}</span></li>
                  <li className="flex gap-3"><span className="font-medium w-16 shrink-0">Lunch</span> <span className="text-muted-foreground">{lastReport.diet.sampleDay.lunch}</span></li>
                  <li className="flex gap-3"><span className="font-medium w-16 shrink-0">Snack</span> <span className="text-muted-foreground">{lastReport.diet.sampleDay.snack}</span></li>
                  <li className="flex gap-3"><span className="font-medium w-16 shrink-0">Dinner</span> <span className="text-muted-foreground">{lastReport.diet.sampleDay.dinner}</span></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 flex flex-col">
            {/* Lifestyle & Exercise */}
            <Card className="shadow-sm flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  Lifestyle & Movement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold">Exercise Target</h4>
                    <span className="text-sm font-medium">{lastReport.exercise.weeklyMinutes} min/week</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Intensity: {lastReport.exercise.intensity}. Activities: {lastReport.exercise.suggestedActivities.join(", ")}.
                  </p>
                  {lastReport.exercise.cautions.length > 0 && (
                    <div className="bg-amber-500/10 text-amber-800 dark:text-amber-200 text-xs p-3 rounded-md">
                      <strong>Note:</strong> {lastReport.exercise.cautions.join(" ")}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Daily Habits</h4>
                  <ul className="space-y-2">
                    {lastReport.lifestyle.map((tip, i) => (
                      <li key={i} className="text-sm flex gap-2 text-muted-foreground">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Hydration */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  Hydration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="text-center shrink-0">
                    <div className="text-3xl font-bold text-primary">{lastReport.hydration.dailyMl / 1000}<span className="text-xl">L</span></div>
                    <div className="text-xs text-muted-foreground mt-1">~{lastReport.hydration.dailyGlasses} glasses</div>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {lastReport.hydration.tips.map((tip, i) => (
                      <li key={i} className="list-disc ml-4">{tip}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Medication interactions */}
        <MedInteractionAlert flags={lastReport.flags} />

        {/* Ask AI */}
        <AskAI inputs={lastInputs ?? {}} report={lastReport} />

        {/* Lab cost estimator */}
        <CostEstimator followUps={lastReport.followUp ?? []} />

        {/* Nearby Specialists */}
        <NearbySpecialists flags={lastReport.flags} />

        {/* Follow Up */}
        <Card className="shadow-sm border-primary/20 bg-primary/5 print-page-break">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Suggested Medical Follow-Ups
            </CardTitle>
            <CardDescription>Tests and consultations to discuss at your next appointment.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lastReport.followUp.map((item, i) => {
                const dot =
                  item.priority === "urgent" ? "bg-destructive"
                  : item.priority === "soon" ? "bg-amber-500"
                  : "bg-primary";
                const label =
                  item.priority === "urgent" ? "Urgent"
                  : item.priority === "soon" ? "Soon"
                  : "Routine";
                return (
                  <div key={i} className="flex gap-4 p-4 bg-background rounded-lg border shadow-sm">
                    <div className="mt-1.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-foreground">{item.test}</h4>
                        {item.priority && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border rounded-full px-2 py-0.5">
                            {label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-primary mt-0.5 flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {item.when}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{item.why}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Footer Disclaimer for Print */}
        <div className="hidden print:block mt-8 text-xs text-muted-foreground border-t pt-4">
          <p><strong>Disclaimer:</strong> This tool provides general wellness information based on common reference ranges. It is not medical advice and is not a substitute for consultation, diagnosis, or treatment by a qualified healthcare professional. Always consult your doctor before making changes to your diet, exercise, or medication.</p>
        </div>
        
      </main>
    </div>
  );
}
