import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, ArrowRight, ShieldCheck, HeartPulse, Stethoscope, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-12 text-center">
          
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight">
              Understand Your <br className="hidden sm:block" />
              <span className="text-primary">Lab Results</span>, Calmly.
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
              Turn confusing medical jargon and numbers into a clear, actionable health plan. We translate your blood work into plain-language guidance you can actually use.
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/input">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Analyze My Report
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-left mt-16">
            <Card className="bg-card/50 border-border/50 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6 space-y-3">
                <HeartPulse className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">Clear Translation</h3>
                <p className="text-sm text-muted-foreground">We explain what each marker means for your body without the medical jargon.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6 space-y-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">Actionable Plans</h3>
                <p className="text-sm text-muted-foreground">Get personalized diet, exercise, and lifestyle recommendations based on your results.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 shadow-sm backdrop-blur-sm">
              <CardContent className="p-6 space-y-3">
                <Stethoscope className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">Next Steps</h3>
                <p className="text-sm text-muted-foreground">Know exactly what to ask your doctor at your next appointment.</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 bg-secondary/30 border border-secondary rounded-2xl p-6 sm:p-8 text-left flex gap-4 items-start">
            <AlertCircle className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Important Medical Disclaimer</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This tool provides general wellness information based on common adult reference ranges. It is not medical advice and is not a substitute for consultation, diagnosis, or treatment by a qualified healthcare professional. Always consult your doctor before making changes to your diet, exercise, or medication.
              </p>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
