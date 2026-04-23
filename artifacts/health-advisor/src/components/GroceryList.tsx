import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Printer, Copy, Check } from "lucide-react";
import { buildGroceryList } from "@/lib/grocery";
import { DayPlan } from "@/lib/wellnessPlan";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "health-advisor:grocery-checked";

export function GroceryList({ plan }: { plan: DayPlan[] }) {
  const { toast } = useToast();
  const grouped = useMemo(() => buildGroceryList(plan), [plan]);
  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const toggle = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next))); } catch { /* ignore */ }
      return next;
    });
  };

  const totalItems = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);
  const checkedCount = Array.from(checked).filter(k => k.startsWith("g:")).length;

  const copyToClipboard = () => {
    const lines: string[] = ["Grocery list — HealthAdvisor 7-day plan", ""];
    Object.entries(grouped).forEach(([aisle, items]) => {
      lines.push(`== ${aisle} ==`);
      items.forEach(it => lines.push(`- ${it.name}${it.count > 1 ? ` (${it.count}x)` : ""}`));
      lines.push("");
    });
    navigator.clipboard.writeText(lines.join("\n"));
    toast({ title: "Copied to clipboard" });
  };

  const printList = () => window.print();

  if (totalItems === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Grocery List
          </CardTitle>
          <CardDescription>
            {totalItems} unique items, sorted by aisle. {checkedCount} ticked.
          </CardDescription>
        </div>
        <div className="flex gap-2 print-hide">
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={printList}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(grouped).map(([aisle, items]) => (
            <div key={aisle}>
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-2">{aisle}</h3>
              <div className="space-y-1.5">
                {items.map(it => {
                  const key = `g:${aisle}:${it.name}`;
                  const isChecked = checked.has(key);
                  return (
                    <label
                      key={key}
                      className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors ${
                        isChecked ? "opacity-50 line-through" : ""
                      }`}
                    >
                      <Checkbox checked={isChecked} onCheckedChange={() => toggle(key)} />
                      <span className="text-sm flex-1">{it.name}</span>
                      {it.count > 1 && <span className="text-xs text-muted-foreground">{it.count}x</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {checkedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => {
              setChecked(new Set());
              try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
            }}
          >
            Reset checked items
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
