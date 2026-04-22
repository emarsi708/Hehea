import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnalysisResult, HealthInputs } from "@/lib/types";

export interface SavedReport {
  id: string;
  date: string;
  inputs: Partial<HealthInputs>;
  report: AnalysisResult;
}

export interface Profile {
  id: string;
  name: string;
  relation: string;
  history: SavedReport[];
}

const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const defaultProfile = (): Profile => ({
  id: newId(),
  name: "Me",
  relation: "self",
  history: [],
});

interface HealthReportState {
  profiles: Profile[];
  currentProfileId: string;
  lastInputs: Partial<HealthInputs> | null;
  lastReport: AnalysisResult | null;
  disclaimerDismissed: boolean;

  setReport: (inputs: HealthInputs, report: AnalysisResult) => void;
  saveToHistory: () => void;
  loadFromHistory: (reportId: string) => void;
  deleteFromHistory: (reportId: string) => void;
  clearReport: () => void;
  dismissDisclaimer: () => void;

  addProfile: (name: string, relation: string) => string;
  switchProfile: (id: string) => void;
  removeProfile: (id: string) => void;
  renameProfile: (id: string, name: string, relation: string) => void;
}

export const useHealthReport = create<HealthReportState>()(
  persist(
    (set, get) => {
      const initial = defaultProfile();
      return {
        profiles: [initial],
        currentProfileId: initial.id,
        lastInputs: null,
        lastReport: null,
        disclaimerDismissed: false,

        setReport: (inputs, report) => set({ lastInputs: inputs, lastReport: report }),

        saveToHistory: () => {
          const { lastInputs, lastReport, currentProfileId, profiles } = get();
          if (!lastInputs || !lastReport) return;
          const entry: SavedReport = {
            id: newId(),
            date: new Date().toISOString(),
            inputs: lastInputs,
            report: lastReport,
          };
          set({
            profiles: profiles.map(p =>
              p.id === currentProfileId ? { ...p, history: [entry, ...p.history] } : p
            ),
          });
        },

        loadFromHistory: (reportId) => {
          const { profiles, currentProfileId } = get();
          const profile = profiles.find(p => p.id === currentProfileId);
          const entry = profile?.history.find(h => h.id === reportId);
          if (entry) set({ lastInputs: entry.inputs, lastReport: entry.report });
        },

        deleteFromHistory: (reportId) => {
          const { profiles, currentProfileId } = get();
          set({
            profiles: profiles.map(p =>
              p.id === currentProfileId
                ? { ...p, history: p.history.filter(h => h.id !== reportId) }
                : p
            ),
          });
        },

        clearReport: () => set({ lastInputs: null, lastReport: null }),
        dismissDisclaimer: () => set({ disclaimerDismissed: true }),

        addProfile: (name, relation) => {
          const id = newId();
          set({ profiles: [...get().profiles, { id, name, relation, history: [] }] });
          return id;
        },

        switchProfile: (id) => {
          if (get().profiles.some(p => p.id === id)) {
            set({ currentProfileId: id, lastInputs: null, lastReport: null });
          }
        },

        removeProfile: (id) => {
          const { profiles, currentProfileId } = get();
          if (profiles.length <= 1) return;
          const remaining = profiles.filter(p => p.id !== id);
          set({
            profiles: remaining,
            currentProfileId: currentProfileId === id ? remaining[0].id : currentProfileId,
          });
        },

        renameProfile: (id, name, relation) => {
          set({
            profiles: get().profiles.map(p => p.id === id ? { ...p, name, relation } : p),
          });
        },
      };
    },
    {
      name: "health-advisor-storage-v2",
      version: 2,
    }
  )
);

export function useCurrentProfile() {
  return useHealthReport(s => s.profiles.find(p => p.id === s.currentProfileId) ?? s.profiles[0]);
}
