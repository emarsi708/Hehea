import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";
import { useHealthReport, useCurrentProfile } from "@/hooks/use-health-report";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, FileText, Trash2, Eye, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { LAB_LIBRARY } from "@/lib/library";

const TRACKABLE = [
  { key: "hba1c", label: "HbA1c (%)" },
  { key: "fastingGlucose", label: "Fasting Glucose (mg/dL)" },
  { key: "ldl", label: "LDL (mg/dL)" },
  { key: "hdl", label: "HDL (mg/dL)" },
  { key: "triglycerides", label: "Triglycerides (mg/dL)" },
  { key: "totalCholesterol", label: "Total Cholesterol (mg/dL)" },
  { key: "tsh", label: "TSH (mIU/L)" },
  { key: "creatinine", label: "Creatinine (mg/dL)" },
  { key: "alt", label: "ALT (U/L)" },
  { key: "hemoglobin", label: "Hemoglobin (g/dL)" },
  { key: "vitaminD", label: "Vitamin D (ng/mL)" },
  { key: "vitaminB12", label: "Vitamin B12 (pg/mL)" },
  { key: "ferritin", label: "Ferritin (ng/mL)" },
  { key: "weight", label: "Weight (kg)" },
];

export default function History() {
  const [, setLocation] = useLocation();
  const profile = useCurrentProfile();
  const loadFromHistory = useHealthReport(s => s.loadFromHistory);
  const deleteFromHistory = useHealthReport(s => s.deleteFromHistory);

  const [selected, setSelected] = useState<string>("hba1c");

  const chartData = useMemo(() => {
    return [...profile.history]
      .reverse()
      .map(h => ({
        date: format(new Date(h.date), "MMM d"),
        value: (h.inputs as Record<string, unknown>)[selected] as number | undefined,
      }))
      .filter(d => typeof d.value === "number");
  }, [profile.history, selected]);

  const handleView = (id: string) => {
    loadFromHistory(id);
    setLocation("/results");
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" />
            History & Trends
          </h1>
          <p className="text-muted-foreground mt-1">
            Track how each marker changes over time for <strong>{profile.name}</strong>.
          </p>
        </div>

        {profile.history.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No saved reports yet.</p>
              <Button onClick={() => setLocation("/input")}>
                Create your first report <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Marker trend</CardTitle>
                <CardDescription>Choose any marker to see its history.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selected} onValueChange={setSelected}>
                  <SelectTrigger className="w-full sm:w-72"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TRACKABLE.map(t => (
                      <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {chartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">
                    No values recorded for this marker yet.
                  </p>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saved reports ({profile.history.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.history.map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition">
                    <div className="flex-1">
                      <div className="font-medium">{format(new Date(h.date), "PPP 'at' p")}</div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <Badge variant="outline">{h.report.flags.length} flags</Badge>
                        {h.report.flags.filter(f => f.severity === "warning" || f.severity === "critical").length > 0 && (
                          <Badge variant="destructive">
                            {h.report.flags.filter(f => f.severity === "warning" || f.severity === "critical").length} warnings
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleView(h.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { if (confirm("Delete this report?")) deleteFromHistory(h.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        <p className="text-xs text-muted-foreground italic">
          History is stored in this browser only. Clearing site data or switching browsers will delete it.
        </p>
        <p className="text-xs text-muted-foreground">
          Tracked markers: {LAB_LIBRARY.length}+ available — choose any from the dropdown above.
        </p>
      </main>
    </div>
  );
}
