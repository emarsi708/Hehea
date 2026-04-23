import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, AlertTriangle, Clock, Info, ExternalLink } from "lucide-react";
import { parseShareFragment, type SharePayload } from "@/lib/share";
import { format } from "date-fns";

export default function Shared() {
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const { payload, expired } = parseShareFragment();
    setPayload(payload);
    setExpired(expired);
  }, []);

  if (expired) {
    return <Centered title="Link expired" body="This shared report link has expired. Please ask the sender for a fresh link." />;
  }

  if (!payload) {
    return <Centered title="No shared report" body="This page only shows reports opened from a private share link." />;
  }

  const { report, inputs } = payload;
  const critical = report.flags.filter(f => f.severity === "critical").length;
  const warning = report.flags.filter(f => f.severity === "warning").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
          <Info className="h-4 w-4 shrink-0" />
          You're viewing a shared report (read-only). Expires {format(new Date(payload.exp), "PPp")}.
        </div>

        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" />
            Shared Health Report
          </h1>
          <p className="text-muted-foreground mt-1">
            {inputs.age && `Age ${inputs.age}`} {inputs.gender && `• ${inputs.gender}`}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Card><CardContent className="py-4 text-center">
            <div className="text-3xl font-bold text-destructive">{critical}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </CardContent></Card>
          <Card><CardContent className="py-4 text-center">
            <div className="text-3xl font-bold text-amber-600">{warning}</div>
            <div className="text-sm text-muted-foreground">Warning</div>
          </CardContent></Card>
          <Card><CardContent className="py-4 text-center">
            <div className="text-3xl font-bold text-emerald-600">{report.flags.length - critical - warning}</div>
            <div className="text-sm text-muted-foreground">Watch / Normal</div>
          </CardContent></Card>
        </div>

        {report.flags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" /> Findings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.flags.map((f, i) => (
                <div key={i} className="flex items-start justify-between gap-3 p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{f.metric}</div>
                    <div className="text-xs text-muted-foreground">{f.explanation}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-sm">{f.value} {f.unit}</span>
                    <Badge variant={f.severity === "critical" ? "destructive" : "outline"}>{f.severity}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {report.lifestyle && report.lifestyle.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {report.lifestyle.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {report.followUp && report.followUp.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" /> Suggested Follow-Up
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {report.followUp.map((f, i) => (
                <div key={i} className="flex justify-between p-2 border rounded">
                  <span>{f.test}</span>
                  <Badge variant={f.priority === "urgent" ? "destructive" : "outline"}>{f.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/30">
          <CardContent className="py-5 text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">Important:</strong> This shared report is for informational purposes only.
            It is not a medical diagnosis. Always consult a qualified healthcare professional.</p>
            <p>Want to track your own labs? <Link href="/input" className="text-primary underline inline-flex items-center gap-1">
              Try HealthAdvisor <ExternalLink className="h-3 w-3" />
            </Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Centered({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <Clock className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">{body}</p>
        <Link href="/"><Button>Go home</Button></Link>
      </div>
    </div>
  );
}
