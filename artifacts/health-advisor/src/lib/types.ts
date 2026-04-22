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
  scores: Record<string, number>;
  inputs: HealthInputs;
}
