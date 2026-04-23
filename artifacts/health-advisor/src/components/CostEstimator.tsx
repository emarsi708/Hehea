import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet } from "lucide-react";
import { LAB_COSTS, findLabCost } from "@/lib/labCosts";

const REGIONS = ["India", "USA", "UK", "UAE"];
const STORAGE_KEY = "health-advisor:cost-region";

export function CostEstimator({ followUps }: { followUps: { test: string }[] }) {
  const [region, setRegion] = useState<string>(() => {
    try { return localStorage.getItem(STORAGE_KEY) || "India"; } catch { return "India"; }
  });

  const updateRegion = (r: string) => {
    setRegion(r);
    try { localStorage.setItem(STORAGE_KEY, r); } catch { /* ignore */ }
  };

  const items = useMemo(() => {
    if (followUps.length === 0) return LAB_COSTS.map(c => ({ test: c.test, cost: c }));
    const seen = new Set<string>();
    return followUps
      .map(f => ({ test: f.test, cost: findLabCost(f.test) }))
      .filter(it => {
        if (!it.cost) return false;
        if (seen.has(it.cost.test)) return false;
        seen.add(it.cost.test);
        return true;
      });
  }, [followUps]);

  if (items.length === 0) return null;

  const total = items.reduce((acc, it) => {
    const r = it.cost?.ranges.find(x => x.region === region);
    if (r) { acc.low += r.low; acc.high += r.high; acc.currency = r.currency; }
    return acc;
  }, { low: 0, high: 0, currency: "" });

  return (
    <Card className="print-hide">
      <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Estimated Lab Costs
          </CardTitle>
          <CardDescription>Typical price ranges for your recommended follow-ups.</CardDescription>
        </div>
        <Select value={region} onValueChange={updateRegion}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((it, i) => {
            const r = it.cost!.ranges.find(x => x.region === region);
            if (!r) return null;
            return (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{it.cost!.test}</span>
                <span className="text-sm font-mono text-muted-foreground">
                  {r.currency} {r.low.toLocaleString()} – {r.high.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
        {total.currency && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
            <span className="font-semibold">Estimated total</span>
            <span className="font-mono font-bold text-primary">
              {total.currency} {total.low.toLocaleString()} – {total.high.toLocaleString()}
            </span>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-3">
          Rough estimates from common diagnostic centers. Actual prices vary by city, lab, and bundling discounts.
        </p>
      </CardContent>
    </Card>
  );
}
