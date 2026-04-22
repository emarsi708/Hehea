import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Stethoscope, ArrowRight, FlaskConical, Info } from "lucide-react";
import { SYMPTOMS, suggestTests } from "@/lib/symptoms";
import { Link } from "wouter";

export default function Symptoms() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const groups = Array.from(new Set(SYMPTOMS.map(s => s.group)));
  const suggestions = suggestTests(Array.from(selected));

  return (
    <div className="min-h-[100dvh] bg-background">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-6 max-w-5xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-primary" />
            Symptom Checker
          </h1>
          <p className="text-muted-foreground mt-1">
            Pick symptoms you're experiencing and we'll suggest which lab tests to ask your doctor about.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 flex gap-3 items-start">
          <Info className="h-5 w-5 text-amber-700 dark:text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 dark:text-amber-200">
            This is for general guidance only. If you have severe symptoms (chest pain, breathlessness, fainting,
            severe bleeding), <strong>seek urgent medical care</strong> — don't rely on this tool.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {groups.map(group => (
              <Card key={group}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{group}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {SYMPTOMS.filter(s => s.group === group).map(s => (
                    <label
                      key={s.id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selected.has(s.id)}
                        onCheckedChange={() => toggle(s.id)}
                        className="mt-0.5"
                      />
                      <span className="text-sm">{s.label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  Suggested tests
                </CardTitle>
                <CardDescription>
                  {selected.size === 0 ? "Select symptoms to see suggestions." : `${selected.size} symptom(s) selected`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No suggestions yet.</p>
                ) : (
                  <>
                    {suggestions.map(s => (
                      <div key={s.test} className="border rounded-lg p-3">
                        <div className="font-medium text-sm">{s.test}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          For: {s.symptoms.join(", ")}
                        </div>
                      </div>
                    ))}
                    <Badge variant="secondary" className="text-xs">
                      Discuss this list with your doctor before testing.
                    </Badge>
                    <Link href="/input">
                      <Button className="w-full" size="sm">
                        Have results? Analyze them <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
