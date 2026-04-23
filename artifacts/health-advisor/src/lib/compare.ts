import { Flag, AnalysisResult } from "@/lib/types";

export interface MetricChange {
  metric: string;
  unit: string;
  category: string;
  oldValue: number;
  newValue: number;
  delta: number;
  percentChange: number;
  oldStatus: Flag["status"] | "missing";
  newStatus: Flag["status"] | "missing";
  direction: "improved" | "worsened" | "stable" | "new" | "resolved";
}

const STATUS_RANK: Record<Flag["status"], number> = {
  normal: 0,
  borderline: 1,
  low: 2,
  high: 2,
};

function statusDirection(oldS: Flag["status"], newS: Flag["status"]): MetricChange["direction"] {
  const o = STATUS_RANK[oldS];
  const n = STATUS_RANK[newS];
  if (n < o) return "improved";
  if (n > o) return "worsened";
  return "stable";
}

export function compareReports(older: AnalysisResult, newer: AnalysisResult): MetricChange[] {
  const oldMap = new Map(older.flags.map(f => [f.metric.toLowerCase(), f]));
  const newMap = new Map(newer.flags.map(f => [f.metric.toLowerCase(), f]));
  const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);
  const changes: MetricChange[] = [];

  for (const key of allKeys) {
    const o = oldMap.get(key);
    const n = newMap.get(key);

    if (o && n) {
      const delta = n.value - o.value;
      const percentChange = o.value !== 0 ? (delta / Math.abs(o.value)) * 100 : 0;
      changes.push({
        metric: n.metric,
        unit: n.unit,
        category: n.category,
        oldValue: o.value,
        newValue: n.value,
        delta,
        percentChange,
        oldStatus: o.status,
        newStatus: n.status,
        direction: statusDirection(o.status, n.status),
      });
    } else if (n && !o) {
      changes.push({
        metric: n.metric,
        unit: n.unit,
        category: n.category,
        oldValue: 0,
        newValue: n.value,
        delta: n.value,
        percentChange: 0,
        oldStatus: "missing",
        newStatus: n.status,
        direction: "new",
      });
    } else if (o && !n) {
      changes.push({
        metric: o.metric,
        unit: o.unit,
        category: o.category,
        oldValue: o.value,
        newValue: 0,
        delta: -o.value,
        percentChange: 0,
        oldStatus: o.status,
        newStatus: "missing",
        direction: "resolved",
      });
    }
  }

  return changes.sort((a, b) => {
    const order: Record<MetricChange["direction"], number> = { worsened: 0, new: 1, improved: 2, resolved: 3, stable: 4 };
    return order[a.direction] - order[b.direction];
  });
}

export interface ComparisonSummary {
  improved: number;
  worsened: number;
  stable: number;
  newIssues: number;
  resolved: number;
  topImprovements: MetricChange[];
  topConcerns: MetricChange[];
}

export function summarizeComparison(changes: MetricChange[]): ComparisonSummary {
  const improved = changes.filter(c => c.direction === "improved");
  const worsened = changes.filter(c => c.direction === "worsened");
  const stable = changes.filter(c => c.direction === "stable").length;
  const newIssues = changes.filter(c => c.direction === "new").length;
  const resolved = changes.filter(c => c.direction === "resolved").length;

  return {
    improved: improved.length,
    worsened: worsened.length,
    stable,
    newIssues,
    resolved,
    topImprovements: improved.slice(0, 3),
    topConcerns: [...worsened, ...changes.filter(c => c.direction === "new")].slice(0, 3),
  };
}
