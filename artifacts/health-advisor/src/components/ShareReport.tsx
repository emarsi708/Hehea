import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Copy, Check, Clock } from "lucide-react";
import { AnalysisResult, HealthInputs } from "@/lib/types";
import { buildShareUrl } from "@/lib/share";
import { useToast } from "@/hooks/use-toast";

export function ShareReport({ inputs, report }: { inputs: Partial<HealthInputs>; report: AnalysisResult }) {
  const { toast } = useToast();
  const [hours, setHours] = useState(24);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const link = buildShareUrl(inputs, report, hours);
    setUrl(link);
    setCopied(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Link copied" });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog onOpenChange={o => { if (o) generate(); else setUrl(""); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 print-hide">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share this report</DialogTitle>
          <DialogDescription>
            Generates a private link with the report data baked in. The data lives only in the link itself —
            nothing is uploaded to any server.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="hours" className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Expires in</Label>
            <Input
              id="hours"
              type="number"
              min={1}
              max={168}
              value={hours}
              onChange={e => { setHours(parseInt(e.target.value) || 24); }}
              onBlur={generate}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">hours</span>
            <Button variant="ghost" size="sm" onClick={generate}>Refresh</Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link">Shareable link</Label>
            <div className="flex gap-2">
              <Input id="link" value={url} readOnly className="font-mono text-xs" />
              <Button onClick={copy} disabled={!url} className="shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1.5 text-muted-foreground">
            <p><strong className="text-foreground">How it works:</strong> the report data is encoded in the link itself.
            Anyone with the link can view the report in their browser until it expires.</p>
            <p>The recipient sees a read-only version. They cannot save it to their own account or modify it.</p>
            <p><strong className="text-foreground">Privacy tip:</strong> share through a private channel (WhatsApp, email).
            Avoid posting publicly.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
