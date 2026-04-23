export interface LabCost {
  test: string;
  aliases: string[];
  ranges: { region: string; currency: string; low: number; high: number }[];
}

export const LAB_COSTS: LabCost[] = [
  { test: "Lipid Panel", aliases: ["lipid", "cholesterol panel", "ldl", "hdl"], ranges: [
    { region: "India", currency: "INR", low: 400, high: 1500 },
    { region: "USA", currency: "USD", low: 30, high: 150 },
    { region: "UK", currency: "GBP", low: 25, high: 80 },
    { region: "UAE", currency: "AED", low: 80, high: 300 },
  ]},
  { test: "HbA1c", aliases: ["hba1c", "a1c", "glycated"], ranges: [
    { region: "India", currency: "INR", low: 350, high: 900 },
    { region: "USA", currency: "USD", low: 30, high: 90 },
    { region: "UK", currency: "GBP", low: 30, high: 70 },
    { region: "UAE", currency: "AED", low: 60, high: 200 },
  ]},
  { test: "Thyroid (TSH/T3/T4)", aliases: ["tsh", "thyroid", "t3", "t4"], ranges: [
    { region: "India", currency: "INR", low: 350, high: 1200 },
    { region: "USA", currency: "USD", low: 35, high: 150 },
    { region: "UK", currency: "GBP", low: 40, high: 100 },
    { region: "UAE", currency: "AED", low: 100, high: 350 },
  ]},
  { test: "Liver Function (LFT)", aliases: ["lft", "liver function", "alt", "ast", "sgpt", "sgot", "bilirubin"], ranges: [
    { region: "India", currency: "INR", low: 400, high: 1200 },
    { region: "USA", currency: "USD", low: 40, high: 130 },
    { region: "UK", currency: "GBP", low: 35, high: 90 },
    { region: "UAE", currency: "AED", low: 100, high: 300 },
  ]},
  { test: "Kidney Function (KFT)", aliases: ["kft", "kidney function", "creatinine", "urea", "egfr", "bun"], ranges: [
    { region: "India", currency: "INR", low: 400, high: 1200 },
    { region: "USA", currency: "USD", low: 30, high: 110 },
    { region: "UK", currency: "GBP", low: 35, high: 85 },
    { region: "UAE", currency: "AED", low: 90, high: 280 },
  ]},
  { test: "Complete Blood Count (CBC)", aliases: ["cbc", "complete blood count", "hemoglobin", "wbc", "platelet"], ranges: [
    { region: "India", currency: "INR", low: 200, high: 600 },
    { region: "USA", currency: "USD", low: 20, high: 80 },
    { region: "UK", currency: "GBP", low: 20, high: 60 },
    { region: "UAE", currency: "AED", low: 50, high: 180 },
  ]},
  { test: "Vitamin D (25-OH)", aliases: ["vitamin d", "vitd", "25-oh"], ranges: [
    { region: "India", currency: "INR", low: 800, high: 2500 },
    { region: "USA", currency: "USD", low: 40, high: 200 },
    { region: "UK", currency: "GBP", low: 50, high: 130 },
    { region: "UAE", currency: "AED", low: 150, high: 450 },
  ]},
  { test: "Vitamin B12", aliases: ["b12", "vitamin b12", "cobalamin"], ranges: [
    { region: "India", currency: "INR", low: 600, high: 1800 },
    { region: "USA", currency: "USD", low: 35, high: 150 },
    { region: "UK", currency: "GBP", low: 40, high: 100 },
    { region: "UAE", currency: "AED", low: 120, high: 350 },
  ]},
  { test: "Iron Studies", aliases: ["iron", "ferritin", "tibc"], ranges: [
    { region: "India", currency: "INR", low: 800, high: 2200 },
    { region: "USA", currency: "USD", low: 40, high: 180 },
    { region: "UK", currency: "GBP", low: 45, high: 120 },
    { region: "UAE", currency: "AED", low: 130, high: 400 },
  ]},
  { test: "CRP (Inflammation)", aliases: ["crp", "c-reactive", "inflammation"], ranges: [
    { region: "India", currency: "INR", low: 350, high: 900 },
    { region: "USA", currency: "USD", low: 25, high: 90 },
    { region: "UK", currency: "GBP", low: 25, high: 70 },
    { region: "UAE", currency: "AED", low: 70, high: 220 },
  ]},
  { test: "Electrolytes Panel", aliases: ["electrolyte", "sodium", "potassium", "chloride"], ranges: [
    { region: "India", currency: "INR", low: 400, high: 1100 },
    { region: "USA", currency: "USD", low: 30, high: 100 },
    { region: "UK", currency: "GBP", low: 30, high: 80 },
    { region: "UAE", currency: "AED", low: 90, high: 260 },
  ]},
  { test: "Uric Acid", aliases: ["uric acid", "urate"], ranges: [
    { region: "India", currency: "INR", low: 200, high: 600 },
    { region: "USA", currency: "USD", low: 20, high: 70 },
    { region: "UK", currency: "GBP", low: 20, high: 50 },
    { region: "UAE", currency: "AED", low: 50, high: 180 },
  ]},
];

export function findLabCost(testName: string): LabCost | null {
  const q = testName.toLowerCase();
  return LAB_COSTS.find(c =>
    c.test.toLowerCase() === q ||
    c.aliases.some(a => q.includes(a) || a.includes(q))
  ) ?? null;
}
