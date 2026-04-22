import { AnalysisResult, HealthInputs } from "./types";

export interface DayPlan {
  day: number;
  label: string;
  meals: { breakfast: string; lunch: string; dinner: string; snack: string };
  movement: string;
  hydration: string;
  focus: string;
}

const BREAKFASTS_BY_FLAG: Record<string, string[]> = {
  sugar: ["Steel-cut oats with cinnamon, walnuts and berries", "Veggie omelet with whole-grain toast", "Greek yogurt with chia and a few almonds"],
  lipids: ["Oatmeal with flaxseed and apple", "Avocado toast on whole grain", "Smoothie: spinach, berries, oats, walnut"],
  vitamins: ["Boiled eggs + sautéed spinach + orange", "Fortified cereal with milk + banana", "Paneer/tofu scramble with bell peppers"],
  electrolytes: ["Banana, almonds and yogurt bowl", "Coconut water + 2 boiled eggs + tomato slices", "Smoothie with banana, spinach, dates"],
  default: ["Veggie omelet, whole grain toast, fruit", "Yogurt parfait with oats and berries", "Whole-grain porridge with seeds"],
};

const LUNCHES_BY_FLAG: Record<string, string[]> = {
  sugar: ["Grilled chicken/paneer salad with olive oil dressing", "Lentil soup + side salad", "Mixed-bean bowl with quinoa"],
  lipids: ["Grilled fish + steamed broccoli + brown rice (small)", "Chickpea & vegetable curry + 1 chapati", "Tuna salad with olive oil"],
  kidney: ["Vegetable khichdi (less salt) + cucumber raita", "Grilled paneer wrap with greens", "Brown rice + dal + sautéed greens"],
  default: ["Grilled lean protein + 2 vegetables + small grain", "Mixed dal + chapati + salad", "Buddha bowl: quinoa, beans, veggies"],
};

const DINNERS_BY_FLAG: Record<string, string[]> = {
  sugar: ["Stir-fried tofu/chicken with veggies + small portion brown rice", "Vegetable soup + grilled fish", "Lentil stew + side salad"],
  lipids: ["Baked salmon + roast vegetables", "Vegetable stew with beans + 1 small chapati", "Grilled chicken + sautéed greens"],
  liver: ["Steamed fish + broccoli + sweet potato", "Vegetable soup + small dal", "Grilled tofu + leafy greens"],
  default: ["Lean protein + veggies + small grain", "Soup + salad + protein", "Stir-fry with veggies and tofu/chicken"],
};

const SNACKS = ["Handful of almonds and walnuts", "Apple with peanut butter", "Carrot/cucumber sticks with hummus", "Greek yogurt + berries", "Roasted chickpeas"];

const MOVEMENT_BY_LEVEL: Record<string, string[]> = {
  sedentary: ["10-min walk after each meal", "Gentle stretching (10 min)", "20-min easy walk", "10-min walk + 5-min mobility", "Light yoga (15 min)", "30-min relaxed walk", "Rest + 10-min stretching"],
  light: ["20-min brisk walk", "Beginner strength workout (15 min)", "30-min brisk walk", "Yoga or pilates (20 min)", "30-min cycle", "40-min walk + bodyweight squats", "Active rest: stretching"],
  moderate: ["30-min brisk walk + core work", "Strength workout (30 min)", "30-min jog/cycle", "Yoga (30 min)", "Strength workout (30 min)", "45-min cardio of choice", "Active rest"],
  active: ["45-min run", "Heavy strength + mobility", "Interval training (30 min)", "Yoga + 30-min cardio", "Strength workout", "Long cardio (60 min)", "Mobility + light walk"],
  default: ["20-min walk", "15-min strength", "20-min walk", "15-min yoga", "20-min cardio", "30-min walk", "Active rest"],
};

function pick<T>(arr: T[], day: number) { return arr[(day - 1) % arr.length]; }

function topFlag(report: AnalysisResult): string {
  const counts: Record<string, number> = {};
  report.flags.forEach(f => { counts[f.category] = (counts[f.category] ?? 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? "default";
}

export function buildSevenDayPlan(inputs: Partial<HealthInputs>, report: AnalysisResult): DayPlan[] {
  const flag = topFlag(report);
  const breakfasts = BREAKFASTS_BY_FLAG[flag] ?? BREAKFASTS_BY_FLAG.default;
  const lunches = LUNCHES_BY_FLAG[flag] ?? LUNCHES_BY_FLAG.default;
  const dinners = DINNERS_BY_FLAG[flag] ?? DINNERS_BY_FLAG.default;
  const movement = MOVEMENT_BY_LEVEL[inputs.activityLevel ?? "light"] ?? MOVEMENT_BY_LEVEL.default;

  const baseHydration = inputs.weight ? Math.round((inputs.weight * 33) / 100) / 10 : 2.5;

  const focusAreas: string[] = [];
  if (report.flags.some(f => f.category === "sugar")) focusAreas.push("Watch portions of rice, bread, sweets");
  if (report.flags.some(f => f.category === "lipids")) focusAreas.push("Cook with olive oil, eat fish 2x/week");
  if (report.flags.some(f => f.category === "vitamins")) focusAreas.push("15-min sun exposure, leafy greens daily");
  if (report.flags.some(f => f.category === "kidney")) focusAreas.push("Hydrate steadily, moderate protein");
  if (report.flags.some(f => f.category === "liver")) focusAreas.push("No alcohol, no unnecessary supplements");
  if (focusAreas.length === 0) focusAreas.push("Build consistent habits and sleep 7+ hrs");

  const labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return Array.from({ length: 7 }, (_, i) => {
    const day = i + 1;
    return {
      day,
      label: labels[i],
      meals: {
        breakfast: pick(breakfasts, day),
        lunch: pick(lunches, day),
        dinner: pick(dinners, day),
        snack: pick(SNACKS, day),
      },
      movement: pick(movement, day),
      hydration: `${baseHydration.toFixed(1)} L water`,
      focus: pick(focusAreas, day),
    };
  });
}
