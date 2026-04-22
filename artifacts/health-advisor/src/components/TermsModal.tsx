import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Lock, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "health-advisor:terms-accepted-v1";

export function TermsModal() {
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const accepted = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (!accepted) setOpen(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => { /* must accept; cannot dismiss */ }}>
      <DialogContent
        className="max-w-2xl [&>button.absolute]:hidden"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Welcome to HealthAdvisor
          </DialogTitle>
          <DialogDescription>
            Please read and accept these terms before continuing.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="space-y-4 text-sm leading-relaxed">
            <section>
              <h3 className="font-semibold text-base flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Medical Disclaimer
              </h3>
              <p className="text-muted-foreground">
                HealthAdvisor is an informational wellness tool. It does NOT provide medical diagnosis, treatment, or
                advice. The analyses, suggestions, and reports it generates are based on common reference ranges and
                general guidelines and may not apply to your specific medical situation.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Always consult a qualified healthcare professional</strong> before making decisions about your
                diet, exercise, supplements, medication, or treatment. In case of a medical emergency, contact your
                local emergency services immediately. Do not delay seeking medical advice because of something you read
                here.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-base flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-primary" />
                Data Privacy
              </h3>
              <ul className="text-muted-foreground space-y-1.5 list-disc pl-5">
                <li>Your lab values, profile data and reports are stored only in your browser's local storage on this device. They are never uploaded to a server unless you explicitly use a feature that requires it.</li>
                <li>When you upload or scan a lab report, the image is sent securely to our processing service to extract values. The image is not stored after extraction.</li>
                <li>The "Find Specialists Near You" feature uses your device's location only when you tap the button. Your location is sent to OpenStreetMap to find nearby facilities and is not stored.</li>
                <li>You can clear your data anytime by clearing the app's site data in your browser.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-2">Terms of Use</h3>
              <ul className="text-muted-foreground space-y-1.5 list-disc pl-5">
                <li>You must be 18 or older to use this app.</li>
                <li>The app is provided "as is" without warranties of any kind. The creators are not liable for any decisions made based on its output.</li>
                <li>Information about nearby medical facilities comes from public OpenStreetMap data and may be inaccurate, incomplete, or outdated. Always verify before booking an appointment.</li>
                <li>You agree to use this app only for personal, non-commercial wellness reference.</li>
                <li>By accepting, you acknowledge you have read and understood the medical disclaimer above.</li>
              </ul>
            </section>
          </div>
        </ScrollArea>

        <div className="flex items-start gap-3 pt-4 border-t">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={v => setAgreed(v === true)}
            className="mt-1"
          />
          <label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
            I have read and agree to the medical disclaimer, data privacy notice, and terms of use. I understand this
            tool is not a substitute for professional medical advice.
          </label>
        </div>

        <DialogFooter>
          <Button onClick={accept} disabled={!agreed} size="lg" className="w-full sm:w-auto">
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
