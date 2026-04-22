import { z } from "zod";

export const conditionsEnum = z.enum([
  "Diabetes",
  "Hypertension",
  "Hypothyroidism",
  "Hyperthyroidism",
  "High Cholesterol",
  "Kidney Disease",
  "Liver Disease",
  "Heart Disease",
  "PCOS",
  "Anemia",
  "None",
]);

export const inputSchema = z.object({
  // Profile
  age: z.coerce.number().min(18).max(120).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  height: z.coerce.number().min(100).max(250).optional(),
  weight: z.coerce.number().min(30).max(300).optional(),
  conditions: z.array(conditionsEnum).optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active"]).optional(),
  dietaryPreference: z.enum(["omnivore", "vegetarian", "vegan", "pescatarian"]).optional(),

  // Blood Sugar
  fastingGlucose: z.coerce.number().min(30).max(500).optional(),
  postprandialGlucose: z.coerce.number().min(30).max(500).optional(),
  hba1c: z.coerce.number().min(2).max(20).optional(),

  // Lipid Profile
  totalCholesterol: z.coerce.number().min(50).max(500).optional(),
  ldl: z.coerce.number().min(10).max(400).optional(),
  hdl: z.coerce.number().min(10).max(150).optional(),
  triglycerides: z.coerce.number().min(20).max(1000).optional(),

  // Thyroid
  tsh: z.coerce.number().min(0.01).max(100).optional(),
  t3: z.coerce.number().min(10).max(500).optional(),
  t4: z.coerce.number().min(1).max(30).optional(),

  // Liver
  alt: z.coerce.number().min(1).max(1000).optional(),
  ast: z.coerce.number().min(1).max(1000).optional(),
  alp: z.coerce.number().min(10).max(1000).optional(),
  bilirubin: z.coerce.number().min(0.1).max(20).optional(),

  // Kidney
  creatinine: z.coerce.number().min(0.1).max(15).optional(),
  urea: z.coerce.number().min(5).max(200).optional(),
  uricAcid: z.coerce.number().min(1).max(20).optional(),

  // CBC
  hemoglobin: z.coerce.number().min(5).max(25).optional(),
  wbc: z.coerce.number().min(0.5).max(50).optional(),
  platelets: z.coerce.number().min(10).max(1000).optional(),
  rbc: z.coerce.number().min(1).max(10).optional(),
  hematocrit: z.coerce.number().min(15).max(70).optional(),
  mcv: z.coerce.number().min(50).max(150).optional(),

  // Inflammation
  esr: z.coerce.number().min(0).max(150).optional(),
  crp: z.coerce.number().min(0).max(300).optional(),

  // Vitamins & Iron
  vitaminD: z.coerce.number().min(1).max(150).optional(),
  vitaminB12: z.coerce.number().min(50).max(2000).optional(),
  folate: z.coerce.number().min(1).max(50).optional(),
  iron: z.coerce.number().min(10).max(400).optional(),
  ferritin: z.coerce.number().min(1).max(2000).optional(),

  // Electrolytes
  sodium: z.coerce.number().min(110).max(170).optional(),
  potassium: z.coerce.number().min(2).max(8).optional(),
  calcium: z.coerce.number().min(5).max(15).optional(),
  magnesium: z.coerce.number().min(0.5).max(5).optional(),

  // Extended Lipids
  vldl: z.coerce.number().min(1).max(100).optional(),
});

export type HealthInputs = z.infer<typeof inputSchema>;

export type Severity = "info" | "watch" | "warning" | "critical";
export type Status = "low" | "normal" | "borderline" | "high";

export interface Flag {
  metric: string;
  value: number;
  status: Status;
  severity: Severity;
  explanation: string;
  category: string;
  unit: string;
}

export interface DietPlan {
  dailyCaloriesTarget: number;
  macroSplit: { protein: number; carbs: number; fat: number };
  foodsToEat: string[];
  foodsToLimit: string[];
  foodsToAvoid: string[];
  sampleDay: {
    breakfast: string;
    lunch: string;
    snack: string;
    dinner: string;
  };
}

export interface ExercisePlan {
  weeklyMinutes: number;
  intensity: string;
  suggestedActivities: string[];
  cautions: string[];
}

export interface HydrationPlan {
  dailyMl: number;
  dailyGlasses: number;
  tips: string[];
}

export interface FollowUp {
  test: string;
  when: string;
  why: string;
  priority?: "urgent" | "soon" | "routine";
}

export interface ActionItem {
  title: string;
  detail: string;
  priority: "urgent" | "soon" | "routine";
}

export interface SummaryDetail {
  headline: string;
  paragraphs: string[];
  topConcerns: string[];
  positives: string[];
  riskLevel: "low" | "moderate" | "elevated" | "high";
}

export interface AnalysisResult {
  date: string;
  flags: Flag[];
  diet: DietPlan;
  lifestyle: string[];
  exercise: ExercisePlan;
  hydration: HydrationPlan;
  followUp: FollowUp[];
  bmi: { value: number; category: string };
  summary: string;
  summaryDetail?: SummaryDetail;
  actionPlan?: ActionItem[];
  scores: Record<string, number>;
  inputs: HealthInputs;
}
