import { X } from "lucide-react";
import { useHealthReport } from "@/hooks/use-health-report";

export function DisclaimerBanner() {
  const { disclaimerDismissed, dismissDisclaimer } = useHealthReport();

  if (disclaimerDismissed) return null;

  return (
    <div className="bg-secondary/50 border-b border-secondary text-secondary-foreground text-sm py-3 px-4 relative print-hide">
      <div className="container mx-auto pr-8">
        <p className="font-medium">
          <strong>Disclaimer:</strong> This tool provides general wellness information based on common reference ranges. It is not medical advice and is not a substitute for consultation, diagnosis, or treatment by a qualified healthcare professional. Always consult your doctor before making changes to your diet, exercise, or medication.
        </p>
      </div>
      <button 
        onClick={dismissDisclaimer}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Dismiss disclaimer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
