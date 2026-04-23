import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnalysisResult, HealthInputs } from "@/lib/types";

export interface SavedReport {
  id: string;
  date: string;
  inputs: Partial<HealthInputs>;
  report: AnalysisResult;
}

export interface Medication {
  id: string;
  name: string;
  dose?: string;
  frequency?: string;
  startedOn?: string;
  notes?: string;
}

export interface Goal {
  id: string;
  metric: string;
  startValue: number;
  targetValue: number;
  unit: string;
  deadline: string;
  createdAt: string;
  notes?: string;
}

export interface CheckIn {
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  sleepHours: number;
  waterGlasses: number;
  exercised: boolean;
  notes?: string;
}

export interface Profile {
  id: string;
  name: string;
  relation: string;
  history: SavedReport[];
  medications?: Medication[];
  checkIns?: CheckIn[];
  goals?: Goal[];
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

  addMedication: (med: Omit<Medication, "id">) => void;
  updateMedication: (id: string, patch: Partial<Omit<Medication, "id">>) => void;
  removeMedication: (id: string) => void;

  saveCheckIn: (checkIn: CheckIn) => void;

  addGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  removeGoal: (id: string) => void;
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

        addMedication: (med) => {
          const { profiles, currentProfileId } = get();
          const id = newId();
          set({
            profiles: profiles.map(p =>
              p.id === currentProfileId
                ? { ...p, medications: [{ ...med, id }, ...(p.medications ?? [])] }
                : p
            ),
          });
        },

        updateMedication: (id, patch) => {
          const { profiles, currentProfileId } = get();
          set({
            profiles: profiles.map(p =>
              p.id === currentProfileId
                ? { ...p, medications: (p.medications ?? []).map(m => m.id === id ? { ...m, ...patch } : m) }
                : p
            ),
          });
        },

        removeMedication: (id) => {
          const { profiles, currentProfileId } = get();
          set({
            profiles: profiles.map(p =>
              p.id === currentProfileId
                ? { ...p, medications: (p.medications ?? []).filter(m => m.id !== id) }
                : p
            ),
          });
        },

        addGoal: (goal) => {
          const { profiles, currentProfileId } = get();
          const id = newId();
          const createdAt = new Date().toISOString();
          set({
            profiles: profiles.map(p =>
              p.id === currentProfileId
                ? { ...p, goals: [{ ...goal, id, createdAt }, ...(p.goals ?? [])] }
                : p
            ),
          });
        },

        removeGoal: (id) => {
          const { profiles, currentProfileId } = get();
          set({
            profiles: profiles.map(p =>
              p.id === currentProfileId
                ? { ...p, goals: (p.goals ?? []).filter(g => g.id !== id) }
                : p
            ),
          });
        },

        saveCheckIn: (checkIn) => {
          const { profiles, currentProfileId } = get();
          set({
            profiles: profiles.map(p => {
              if (p.id !== currentProfileId) return p;
              const existing = (p.checkIns ?? []).filter(c => c.date !== checkIn.date);
              return { ...p, checkIns: [checkIn, ...existing].slice(0, 365) };
            }),
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
