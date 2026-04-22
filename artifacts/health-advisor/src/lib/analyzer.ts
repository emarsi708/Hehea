import { AnalysisResult, Flag, HealthInputs, FollowUp, DietPlan, ExercisePlan, HydrationPlan, Severity, Status } from "./types";

export function analyzeHealthData(inputs: HealthInputs): AnalysisResult {
  const flags: Flag[] = [];
  const followUp: FollowUp[] = [];
  const lifestyle: string[] = [];

  const scores: Record<string, number> = {
    sugar: 100,
    lipids: 100,
    thyroid: 100,
    liver: 100,
    kidney: 100,
    cbc: 100,
  };

  const addFlag = (metric: string, value: number, status: Status, severity: Severity, explanation: string, category: string, unit: string) => {
    flags.push({ metric, value, status, severity, explanation, category, unit });
    if (severity === "critical") scores[category] -= 30;
    else if (severity === "warning") scores[category] -= 20;
    else if (severity === "watch") scores[category] -= 10;
  };

  // BMI
  let bmiValue = 0;
  let bmiCategory = "Unknown";
  if (inputs.height && inputs.weight) {
    const heightM = inputs.height / 100;
    bmiValue = Number((inputs.weight / (heightM * heightM)).toFixed(1));
    if (bmiValue < 18.5) bmiCategory = "Underweight";
    else if (bmiValue < 25) bmiCategory = "Normal";
    else if (bmiValue < 30) bmiCategory = "Overweight";
    else bmiCategory = "Obese";
  }

  // Blood Sugar
  if (inputs.fastingGlucose) {
    if (inputs.fastingGlucose < 70) addFlag("Fasting Glucose", inputs.fastingGlucose, "low", "warning", "Below normal range. Can cause dizziness or confusion.", "sugar", "mg/dL");
    else if (inputs.fastingGlucose >= 100 && inputs.fastingGlucose <= 125) addFlag("Fasting Glucose", inputs.fastingGlucose, "borderline", "watch", "Prediabetic range. Consider dietary changes.", "sugar", "mg/dL");
    else if (inputs.fastingGlucose > 125) addFlag("Fasting Glucose", inputs.fastingGlucose, "high", "critical", "Diabetic range. Medical consultation advised.", "sugar", "mg/dL");
  }
  if (inputs.hba1c) {
    if (inputs.hba1c >= 5.7 && inputs.hba1c <= 6.4) addFlag("HbA1c", inputs.hba1c, "borderline", "watch", "Indicates prediabetes.", "sugar", "%");
    else if (inputs.hba1c >= 6.5) addFlag("HbA1c", inputs.hba1c, "high", "critical", "Indicates diabetes.", "sugar", "%");
  }

  // Lipids
  if (inputs.ldl) {
    if (inputs.ldl >= 130 && inputs.ldl < 160) addFlag("LDL Cholesterol", inputs.ldl, "borderline", "watch", "Borderline high. Focus on heart-healthy fats.", "lipids", "mg/dL");
    else if (inputs.ldl >= 160) addFlag("LDL Cholesterol", inputs.ldl, "high", "warning", "High. Increased cardiovascular risk.", "lipids", "mg/dL");
  }
  if (inputs.hdl && inputs.hdl < 40) {
    addFlag("HDL Cholesterol", inputs.hdl, "low", "warning", "Low 'good' cholesterol. Regular exercise can help.", "lipids", "mg/dL");
  }
  if (inputs.triglycerides && inputs.triglycerides >= 150) {
    addFlag("Triglycerides", inputs.triglycerides, "high", "watch", "Elevated. Often linked to refined carbs and alcohol.", "lipids", "mg/dL");
  }

  // Thyroid
  if (inputs.tsh) {
    if (inputs.tsh < 0.4) addFlag("TSH", inputs.tsh, "low", "warning", "Possible hyperthyroidism.", "thyroid", "mIU/L");
    else if (inputs.tsh > 4.0) addFlag("TSH", inputs.tsh, "high", "warning", "Possible hypothyroidism.", "thyroid", "mIU/L");
  }

  // Liver
  if (inputs.alt && inputs.alt > 40) addFlag("ALT", inputs.alt, "high", "watch", "Elevated liver enzyme. May indicate liver stress.", "liver", "U/L");
  if (inputs.ast && inputs.ast > 40) addFlag("AST", inputs.ast, "high", "watch", "Elevated liver enzyme.", "liver", "U/L");

  // Kidney
  if (inputs.creatinine && inputs.creatinine > 1.2) addFlag("Creatinine", inputs.creatinine, "high", "warning", "Elevated. May indicate reduced kidney function.", "kidney", "mg/dL");
  
  // CBC
  if (inputs.hemoglobin) {
    const isMale = inputs.gender === "male";
    const minHb = isMale ? 13.5 : 12.0;
    if (inputs.hemoglobin < minHb) addFlag("Hemoglobin", inputs.hemoglobin, "low", "warning", "Low hemoglobin indicates anemia.", "cbc", "g/dL");
  }

  // Normalize scores
  Object.keys(scores).forEach(k => {
    scores[k] = Math.max(0, scores[k]);
  });

  // Diet
  let bmr = 2000;
  if (inputs.age && inputs.height && inputs.weight && inputs.gender) {
    bmr = 10 * inputs.weight + 6.25 * inputs.height - 5 * inputs.age;
    bmr += inputs.gender === "male" ? 5 : -161;
  }
  const activityMult = inputs.activityLevel === "sedentary" ? 1.2 : inputs.activityLevel === "light" ? 1.375 : inputs.activityLevel === "moderate" ? 1.55 : 1.725;
  const dailyCaloriesTarget = Math.round(bmr * activityMult);

  const diet: DietPlan = {
    dailyCaloriesTarget,
    macroSplit: { protein: 25, carbs: 45, fat: 30 },
    foodsToEat: ["Leafy greens", "Lean proteins", "Whole grains", "Berries"],
    foodsToLimit: ["Processed sugars", "Saturated fats", "Refined carbohydrates"],
    foodsToAvoid: ["Trans fats", "Excessive alcohol", "Sugary beverages"],
    sampleDay: {
      breakfast: "Oatmeal with berries and a side of eggs or tofu.",
      lunch: "Mixed green salad with grilled chicken or chickpeas and olive oil dressing.",
      snack: "Handful of almonds and an apple.",
      dinner: "Baked salmon or lentils with roasted vegetables and quinoa.",
    }
  };

  // Adjust diet based on flags
  if (flags.some(f => f.metric === "LDL Cholesterol" && f.status === "high")) {
    diet.foodsToEat.push("Oats", "Fatty fish", "Walnuts");
    diet.foodsToLimit.push("Red meat", "Full-fat dairy");
  }
  if (flags.some(f => f.category === "sugar" && (f.status === "high" || f.status === "borderline"))) {
    diet.foodsToEat.push("Cinnamon", "Chia seeds", "High-fiber vegetables");
    diet.foodsToAvoid.push("White bread", "Sweetened snacks");
  }

  // Lifestyle
  lifestyle.push("Aim for 7-9 hours of quality sleep per night.");
  lifestyle.push("Practice stress management techniques like meditation or deep breathing.");
  if (inputs.activityLevel === "sedentary") {
    lifestyle.push("Take short walking breaks every hour to reduce sedentary time.");
  }

  // Exercise
  const exercise: ExercisePlan = {
    weeklyMinutes: 150,
    intensity: "Moderate",
    suggestedActivities: ["Brisk walking", "Swimming", "Cycling", "Yoga"],
    cautions: []
  };
  if (bmiCategory === "Obese" || inputs.conditions?.includes("Heart Disease")) {
    exercise.cautions.push("Start with low-impact activities to protect joints and cardiovascular system.");
  }

  // Hydration
  const weightKg = inputs.weight || 70;
  const dailyMl = Math.round(weightKg * 35);
  const hydration: HydrationPlan = {
    dailyMl,
    dailyGlasses: Math.round(dailyMl / 250),
    tips: [
      "Drink a glass of water first thing in the morning.",
      "Keep a reusable water bottle at your desk.",
      "Flavor water with lemon or cucumber if you prefer."
    ]
  };

  // Follow-up
  if (flags.some(f => f.category === "sugar" && f.severity === "critical")) {
    followUp.push({ test: "HbA1c & Fasting Glucose", when: "In 3 months", why: "To monitor blood sugar control and treatment effectiveness." });
  }
  if (flags.some(f => f.category === "lipids" && f.severity !== "info")) {
    followUp.push({ test: "Lipid Profile", when: "In 3-6 months", why: "To check if lifestyle changes have improved cholesterol levels." });
  }
  if (flags.some(f => f.category === "thyroid" && f.severity !== "info")) {
    followUp.push({ test: "Thyroid Panel", when: "In 6-8 weeks", why: "To reassess thyroid function." });
  }

  if (followUp.length === 0) {
    followUp.push({ test: "Routine Checkup", when: "In 1 year", why: "For annual health maintenance." });
  }

  const criticalCount = flags.filter(f => f.severity === "critical").length;
  let summary = `Your health profile generally looks good with a few areas to monitor.`;
  if (criticalCount > 0) {
    summary = `There are ${criticalCount} critical areas in your report that require attention. We strongly recommend discussing these results with your healthcare provider.`;
  } else if (flags.length > 0) {
    summary = `Most of your results are within normal ranges, but there are some borderline values. Small lifestyle adjustments can help optimize your health.`;
  }

  return {
    date: new Date().toISOString(),
    flags,
    diet,
    lifestyle,
    exercise,
    hydration,
    followUp,
    bmi: { value: bmiValue, category: bmiCategory },
    summary,
    scores,
    inputs
  };
}
