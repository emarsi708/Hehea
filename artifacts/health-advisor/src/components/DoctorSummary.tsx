import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Stethoscope, Printer } from "lucide-react";
import { AnalysisResult, HealthInputs } from "@/lib/types";
import { format } from "date-fns";

export function DoctorSummary({ inputs, report }: { inputs: Partial<HealthInputs>; report: AnalysisResult }) {
  const [open, setOpen] = useState(false);

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>Doctor Summary</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 24px auto; padding: 0 24px; color: #111; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 14px; margin: 18px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 6px 0; }
        td, th { padding: 4px 8px; border-bottom: 1px solid #eee; text-align: left; }
        .warn { color: #b91c1c; font-weight: 600; }
        .watch { color: #b45309; }
        .small { font-size: 11px; color: #555; }
        ul { margin: 4px 0 0 18px; padding: 0; font-size: 12px; }
      </style></head><body>${document.getElementById("doctor-summary-content")?.innerHTML ?? ""}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const flagged = report.flags;
  const questions: string[] = [];
  if (flagged.some(f => f.category === "sugar" && f.severity !== "info")) questions.push("Should I be screened for diabetes / start metformin?");
  if (flagged.some(f => f.category === "lipids")) questions.push("Do I need a statin or further cardiovascular workup?");
  if (flagged.some(f => f.category === "thyroid")) questions.push("Should I see an endocrinologist about my thyroid?");
  if (flagged.some(f => f.category === "kidney")) questions.push("Do I need a urine albumin test or kidney ultrasound?");
  if (flagged.some(f => f.category === "liver")) questions.push("Could my liver enzymes be from medications, alcohol, or fatty liver?");
  if (flagged.some(f => f.category === "vitamins")) questions.push("How long should I supplement, and at what dose?");
  if (flagged.some(f => f.category === "inflammation")) questions.push("What further workup is needed for the elevated inflammation markers?");
  if (questions.length === 0) questions.push("Are there preventive screenings I should consider for my age?");

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <Stethoscope className="h-4 w-4" />
        Doctor Summary
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>One-page summary for your doctor</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div id="doctor-summary-content" className="text-sm space-y-4">
              <div>
                <h1 className="font-bold text-base">Patient summary — {format(new Date(), "PPP")}</h1>
                <p className="small text-muted-foreground">
                  {inputs.age && `Age ${inputs.age}`}
                  {inputs.gender && `, ${inputs.gender}`}
                  {inputs.height && inputs.weight && `, ${inputs.height}cm / ${inputs.weight}kg`}
                  {inputs.conditions?.length ? ` · Conditions: ${inputs.conditions.join(", ")}` : ""}
                </p>
              </div>

              <div>
                <h2 className="font-semibold">Flagged values ({flagged.length})</h2>
                {flagged.length === 0 ? (
                  <p className="text-muted-foreground">No values flagged outside reference ranges.</p>
                ) : (
                  <table className="w-full">
                    <thead><tr className="text-xs text-muted-foreground border-b"><th className="text-left py-1">Marker</th><th className="text-left py-1">Value</th><th className="text-left py-1">Status</th></tr></thead>
                    <tbody>
                      {flagged.map((f, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-1">{f.metric}</td>
                          <td className="py-1">{f.value} {f.unit}</td>
                          <td className={`py-1 ${f.severity === "critical" || f.severity === "warning" ? "warn text-destructive font-medium" : "watch text-amber-600"}`}>
                            {f.status} ({f.severity})
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div>
                <h2 className="font-semibold">Questions to ask</h2>
                <ul className="list-disc pl-5 space-y-1">
                  {questions.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>

              {report.followUp?.length > 0 && (
                <div>
                  <h2 className="font-semibold">Recommended follow-ups</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {report.followUp.map((f, i) => (
                      <li key={i}><strong>{f.test}</strong> in {f.timeframe} — {f.reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="small text-muted-foreground italic pt-2 border-t">
                Generated by HealthAdvisor. Informational only — not a medical record.
              </p>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            <Button onClick={handlePrint} className="gap-2"><Printer className="h-4 w-4" />Print / Save PDF</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
