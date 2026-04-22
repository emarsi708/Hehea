import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { BookOpen, Search, FlaskConical } from "lucide-react";
import { LAB_LIBRARY, LabTest } from "@/lib/library";

export default function Library() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return LAB_LIBRARY;
    return LAB_LIBRARY.filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      t.aliases?.some(a => a.toLowerCase().includes(term))
    );
  }, [q]);

  const grouped = useMemo(() => {
    const map = new Map<string, LabTest[]>();
    filtered.forEach(t => {
      if (!map.has(t.category)) map.set(t.category, []);
      map.get(t.category)!.push(t);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Lab Test Library
          </h1>
          <p className="text-muted-foreground mt-1">
            What every common lab test means, in plain language.
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by name, alias, or category..."
            className="pl-9"
          />
        </div>

        {grouped.length === 0 && (
          <p className="text-muted-foreground">No tests match "{q}".</p>
        )}

        {grouped.map(([cat, tests]) => (
          <section key={cat} className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" />
              {cat}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {tests.map(t => (
                <Card key={t.key}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>{t.name}</span>
                      <Badge variant="outline" className="text-xs">{t.unit}</Badge>
                    </CardTitle>
                    {t.aliases && (
                      <CardDescription className="text-xs">Also: {t.aliases.join(", ")}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">What it is</div>
                      <p>{t.whatItIs}</p>
                    </div>
                    <div>
                      <div className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">Why it matters</div>
                      <p>{t.whyItMatters}</p>
                    </div>
                    <div>
                      <div className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">Reference ranges</div>
                      <div className="space-y-1">
                        {t.ranges.map((r, i) => (
                          <div key={i} className="flex justify-between items-center text-xs gap-2">
                            <span>{r.label}</span>
                            <Badge variant={r.severity === "warn" ? "destructive" : r.severity === "watch" ? "secondary" : "outline"}>
                              {r.range}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">Tips</div>
                      <ul className="list-disc pl-5 space-y-0.5 text-xs">
                        {t.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}

        <p className="text-xs text-muted-foreground italic">
          Reference ranges vary by lab and population. Use your lab's printed range as the source of truth.
        </p>
      </main>
    </div>
  );
}
