import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnalysisResult, HealthInputs } from "@/lib/types";

interface HealthReportState {
  lastInputs: Partial<HealthInputs> | null;
  lastReport: AnalysisResult | null;
  disclaimerDismissed: boolean;
  setReport: (inputs: HealthInputs, report: AnalysisResult) => void;
  clearReport: () => void;
  dismissDisclaimer: () => void;
}

export const useHealthReport = create<HealthReportState>()(
  persist(
    (set) => ({
      lastInputs: null,
      lastReport: null,
      disclaimerDismissed: false,
      setReport: (inputs, report) => set({ lastInputs: inputs, lastReport: report }),
      clearReport: () => set({ lastInputs: null, lastReport: null }),
      dismissDisclaimer: () => set({ disclaimerDismissed: true }),
    }),
    {
      name: "health-advisor-storage",
    }
  )
);
