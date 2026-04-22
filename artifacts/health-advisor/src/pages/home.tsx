import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity, ArrowRight, ShieldCheck, HeartPulse, Stethoscope, AlertCircle,
  Target, TrendingUp, Calculator, BookOpen, MessageCircle, CalendarPlus, Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const FEATURES = [
  { icon: HeartPulse, title: "Plain-Language Translation", desc: "We explain every marker without medical jargon." },
  { icon: ShieldCheck, title: "Personalized Action Plan", desc: "Diet, exercise, and lifestyle suggestions matched to your numbers." },
  { icon: Target, title: "7-Day Wellness Plan", desc: "A ready-to-follow week of meals, movement and hydration goals.", href: "/plan" },
  { icon: TrendingUp, title: "Trends & History", desc: "Save reports over time and chart how each marker changes.", href: "/history" },
  { icon: Stethoscope, title: "Symptom → Test Guide", desc: "Pick symptoms; we suggest which tests to ask your doctor about.", href: "/symptoms" },
  { icon: Calculator, title: "Risk Calculators", desc: "BMI, BMR, ASCVD heart risk, FINDRISC diabetes risk in one tap.", href: "/calculators" },
  { icon: BookOpen, title: "Lab Test Library", desc: "What every common test means, plus tips to improve each.", href: "/library" },
  { icon: MessageCircle, title: "Ask AI About Your Report", desc: "Chat about your specific values in plain language." },
  { icon: CalendarPlus, title: "Re-test Reminders", desc: "Export follow-up reminders straight to your calendar." },
  { icon: Users, title: "Family Profiles", desc: "Track reports for parents, partner, kids — separately." },
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">

          <section className="text-center space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">
              Understand Your <br className="hidden sm:block" />
              <span className="text-primary">Lab Results</span>, Calmly.
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
              Turn confusing medical jargon and numbers into a clear, actionable health plan you can actually use.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/input">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                  Analyze My Report <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/symptoms">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
                  No report? Start with symptoms
                </Button>
              </Link>
            </div>
          </section>

          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold">Everything you get</h2>
              <p className="text-muted-foreground mt-2">Designed to help you take charge of your health.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                const inner = (
                  <Card className="bg-card/50 border-border/50 shadow-sm h-full hover:shadow-md hover:border-primary/40 transition cursor-default">
                    <CardContent className="p-6 space-y-3">
                      <Icon className="h-8 w-8 text-primary" />
                      <h3 className="font-semibold text-lg">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                );
                return f.href ? <Link key={i} href={f.href}>{inner}</Link> : <div key={i}>{inner}</div>;
              })}
            </div>
          </section>

          <section className="bg-secondary/30 border border-secondary rounded-2xl p-6 sm:p-8 flex gap-4 items-start">
            <AlertCircle className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Important Medical Disclaimer</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This tool provides general wellness information based on common adult reference ranges. It is not medical
                advice and is not a substitute for consultation, diagnosis, or treatment by a qualified healthcare
                professional. Always consult your doctor before making changes to your diet, exercise, or medication.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
