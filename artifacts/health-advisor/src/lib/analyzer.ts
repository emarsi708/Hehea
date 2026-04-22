import { ActionItem, AnalysisResult, DietPlan, ExercisePlan, Flag, FollowUp, HealthInputs, HydrationPlan, Severity, Status, SummaryDetail } from "./types";

export function analyzeHealthData(inputs: HealthInputs): AnalysisResult {
  const flags: Flag[] = [];
  const followUp: FollowUp[] = [];
  const lifestyle: string[] = [];
  const actionPlan: ActionItem[] = [];

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
  if (inputs.totalCholesterol && inputs.totalCholesterol >= 240) {
    addFlag("Total Cholesterol", inputs.totalCholesterol, "high", "warning", "High total cholesterol increases cardiovascular risk.", "lipids", "mg/dL");
  }

  // Thyroid
  if (inputs.tsh) {
    if (inputs.tsh < 0.4) addFlag("TSH", inputs.tsh, "low", "warning", "Possible hyperthyroidism (overactive thyroid).", "thyroid", "mIU/L");
    else if (inputs.tsh > 10) addFlag("TSH", inputs.tsh, "high", "critical", "Significantly elevated. Likely hypothyroidism requiring treatment.", "thyroid", "mIU/L");
    else if (inputs.tsh > 4.0) addFlag("TSH", inputs.tsh, "high", "warning", "Elevated. Possible hypothyroidism.", "thyroid", "mIU/L");
  }

  // Liver
  if (inputs.alt && inputs.alt > 40) addFlag("ALT", inputs.alt, "high", "watch", "Elevated liver enzyme. May indicate liver stress.", "liver", "U/L");
  if (inputs.ast && inputs.ast > 40) addFlag("AST", inputs.ast, "high", "watch", "Elevated liver enzyme.", "liver", "U/L");
  if (inputs.bilirubin && inputs.bilirubin > 1.2) addFlag("Bilirubin", inputs.bilirubin, "high", "watch", "Elevated bilirubin may indicate liver or bile-duct issues.", "liver", "mg/dL");

  // Kidney
  if (inputs.creatinine && inputs.creatinine > 1.2) addFlag("Creatinine", inputs.creatinine, "high", "warning", "Elevated. May indicate reduced kidney function.", "kidney", "mg/dL");
  if (inputs.urea && inputs.urea > 50) addFlag("Urea", inputs.urea, "high", "watch", "Elevated urea may indicate kidney stress or dehydration.", "kidney", "mg/dL");
  if (inputs.uricAcid && inputs.uricAcid > 7) addFlag("Uric Acid", inputs.uricAcid, "high", "watch", "Elevated. Increases risk of gout and kidney stones.", "kidney", "mg/dL");

  // CBC
  if (inputs.hemoglobin) {
    const isMale = inputs.gender === "male";
    const minHb = isMale ? 13.5 : 12.0;
    if (inputs.hemoglobin < minHb) addFlag("Hemoglobin", inputs.hemoglobin, "low", "warning", "Low hemoglobin indicates anemia.", "cbc", "g/dL");
  }
  if (inputs.platelets) {
    if (inputs.platelets < 150) addFlag("Platelets", inputs.platelets, "low", "warning", "Low platelet count. May affect clotting.", "cbc", "×10³/µL");
    else if (inputs.platelets > 450) addFlag("Platelets", inputs.platelets, "high", "watch", "Elevated platelet count. Worth a follow-up.", "cbc", "×10³/µL");
  }
  if (inputs.wbc) {
    if (inputs.wbc < 4) addFlag("WBC", inputs.wbc, "low", "watch", "Low white-cell count may reduce infection resistance.", "cbc", "×10³/µL");
    else if (inputs.wbc > 11) addFlag("WBC", inputs.wbc, "high", "watch", "Elevated WBC may suggest infection or inflammation.", "cbc", "×10³/µL");
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

  // Follow-up — richer, condition-specific suggestions with priority
  const sugarCritical = flags.some(f => f.category === "sugar" && f.severity === "critical");
  const sugarWatch = flags.some(f => f.category === "sugar" && (f.severity === "watch" || f.severity === "warning"));
  const lipidsConcern = flags.some(f => f.category === "lipids");
  const thyroidCritical = flags.some(f => f.category === "thyroid" && f.severity === "critical");
  const thyroidConcern = flags.some(f => f.category === "thyroid");
  const liverConcern = flags.some(f => f.category === "liver");
  const kidneyConcern = flags.some(f => f.category === "kidney");
  const anemiaFlag = flags.some(f => f.metric === "Hemoglobin" && f.status === "low");
  const cbcConcern = flags.some(f => f.category === "cbc");

  if (sugarCritical) {
    followUp.push({ test: "Consult an endocrinologist or primary-care doctor", when: "Within 1-2 weeks", why: "Diabetic-range blood sugar needs medical evaluation and a treatment plan.", priority: "urgent" });
    followUp.push({ test: "Repeat HbA1c & fasting glucose", when: "In 3 months", why: "To monitor control and treatment response.", priority: "soon" });
  } else if (sugarWatch) {
    followUp.push({ test: "Repeat HbA1c & fasting glucose", when: "In 3-6 months", why: "To confirm prediabetic trend and check the impact of lifestyle changes.", priority: "soon" });
  }
  if (lipidsConcern) {
    followUp.push({ test: "Repeat lipid profile", when: "In 3 months", why: "To check whether diet and exercise have improved cholesterol levels.", priority: "soon" });
  }
  if (thyroidCritical) {
    followUp.push({ test: "Consult an endocrinologist", when: "Within 2-4 weeks", why: "Significantly abnormal TSH typically requires medication and monitoring.", priority: "urgent" });
  } else if (thyroidConcern) {
    followUp.push({ test: "Repeat thyroid panel (TSH, T3, T4)", when: "In 6-8 weeks", why: "To confirm the trend and rule out a transient change.", priority: "soon" });
  }
  if (liverConcern) {
    followUp.push({ test: "Repeat liver function test", when: "In 4-6 weeks", why: "Reduce alcohol and recheck to see if enzymes normalize.", priority: "soon" });
  }
  if (kidneyConcern) {
    followUp.push({ test: "Recheck kidney panel + urine analysis", when: "In 4-6 weeks", why: "To confirm and rule out dehydration or temporary stress.", priority: "soon" });
  }
  if (anemiaFlag) {
    followUp.push({ test: "Iron studies (ferritin, TIBC) + B12/folate", when: "Within 2-4 weeks", why: "To find the cause of low hemoglobin before starting supplements.", priority: "soon" });
  } else if (cbcConcern) {
    followUp.push({ test: "Repeat CBC", when: "In 4-6 weeks", why: "To confirm whether the abnormal cell count persists.", priority: "soon" });
  }
  if (bmiCategory === "Obese") {
    followUp.push({ test: "Discuss weight management with your doctor", when: "Within the next month", why: "BMI in the obese range increases risk for several conditions; a tailored plan helps.", priority: "soon" });
  }
  if (followUp.length === 0) {
    followUp.push({ test: "Routine annual checkup", when: "In 12 months", why: "Your numbers look good — keep up annual screening.", priority: "routine" });
  }

  // Action plan — concrete first steps the person can take this week
  const criticals = flags.filter(f => f.severity === "critical");
  if (criticals.length > 0) {
    actionPlan.push({
      title: "Book a doctor's appointment this week",
      detail: `You have ${criticals.length} value${criticals.length > 1 ? "s" : ""} in the critical range (${criticals.map(c => c.metric).join(", ")}). Share this report with your physician.`,
      priority: "urgent",
    });
  }
  if (sugarWatch || sugarCritical) {
    actionPlan.push({
      title: "Cut added sugar and refined carbs",
      detail: "Swap white bread, sugary drinks, and desserts for whole grains, fruit, and water. Aim for under 25g added sugar per day.",
      priority: sugarCritical ? "urgent" : "soon",
    });
  }
  if (lipidsConcern) {
    actionPlan.push({
      title: "Shift toward heart-healthy fats",
      detail: "Replace red meat and fried foods with fatty fish (salmon, mackerel), nuts, olive oil, and oats this week.",
      priority: "soon",
    });
  }
  if (anemiaFlag) {
    actionPlan.push({
      title: "Boost iron intake",
      detail: "Add iron-rich foods (lentils, spinach, lean red meat, fortified cereals) paired with vitamin C (citrus, bell pepper) for absorption. Avoid tea/coffee with meals.",
      priority: "soon",
    });
  }
  if (liverConcern) {
    actionPlan.push({
      title: "Reduce alcohol and processed food",
      detail: "Give your liver a 4-week reset: minimal alcohol, lighter meals, and more leafy greens.",
      priority: "soon",
    });
  }
  if (kidneyConcern) {
    actionPlan.push({
      title: "Hydrate consistently and lower salt",
      detail: `Aim for ${(dailyMl / 1000).toFixed(1)}L water per day and keep added salt under 5g daily.`,
      priority: "soon",
    });
  }
  if (bmiCategory === "Overweight" || bmiCategory === "Obese") {
    actionPlan.push({
      title: "Start a sustainable movement habit",
      detail: "Begin with 30 minutes of brisk walking, 5 days a week. Build up gradually — consistency beats intensity.",
      priority: "soon",
    });
  }
  if (inputs.activityLevel === "sedentary") {
    actionPlan.push({
      title: "Break up sitting time",
      detail: "Stand or walk for 2-3 minutes every hour. Small movement adds up across the day.",
      priority: "routine",
    });
  }
  if (actionPlan.length === 0) {
    actionPlan.push({
      title: "Maintain your healthy routine",
      detail: "Your numbers look good. Keep up balanced meals, regular movement, sleep, and an annual checkup.",
      priority: "routine",
    });
  }

  // Rich summary
  const criticalCount = flags.filter(f => f.severity === "critical").length;
  const warningCount = flags.filter(f => f.severity === "warning").length;
  const watchCount = flags.filter(f => f.severity === "watch").length;
  const totalConcerns = criticalCount + warningCount + watchCount;

  let riskLevel: SummaryDetail["riskLevel"] = "low";
  if (criticalCount > 0) riskLevel = "high";
  else if (warningCount >= 2) riskLevel = "elevated";
  else if (warningCount === 1 || watchCount >= 2) riskLevel = "moderate";

  const headline =
    riskLevel === "high" ? "Important findings — please consult a doctor soon."
    : riskLevel === "elevated" ? "Several values need attention."
    : riskLevel === "moderate" ? "Mostly healthy with a few areas to monitor."
    : totalConcerns === 0 ? "Your results look healthy across the board."
    : "Your results look generally healthy.";

  const paragraphs: string[] = [];

  // Paragraph 1 — overview
  if (totalConcerns === 0) {
    paragraphs.push(`All the values you provided fall within their typical reference ranges. ${bmiValue ? `Your BMI of ${bmiValue} is in the ${bmiCategory.toLowerCase()} range. ` : ""}This is a good baseline to maintain with consistent habits.`);
  } else {
    const parts: string[] = [];
    if (criticalCount > 0) parts.push(`${criticalCount} critical`);
    if (warningCount > 0) parts.push(`${warningCount} warning`);
    if (watchCount > 0) parts.push(`${watchCount} borderline`);
    paragraphs.push(`Your report shows ${parts.join(", ")} ${totalConcerns === 1 ? "finding" : "findings"} across ${new Set(flags.map(f => f.category)).size} health categor${new Set(flags.map(f => f.category)).size === 1 ? "y" : "ies"}. ${bmiValue ? `Your BMI is ${bmiValue} (${bmiCategory.toLowerCase()}).` : ""}`.trim());
  }

  // Paragraph 2 — top concerns by category
  const topConcerns: string[] = [];
  const positives: string[] = [];

  const categoryLabels: Record<string, string> = {
    sugar: "blood sugar",
    lipids: "cholesterol/lipids",
    thyroid: "thyroid",
    liver: "liver function",
    kidney: "kidney function",
    cbc: "blood count",
  };

  Object.entries(scores).forEach(([cat, score]) => {
    const catFlags = flags.filter(f => f.category === cat);
    const label = categoryLabels[cat] ?? cat;
    if (catFlags.length === 0) {
      // Only mark as positive if at least one value in the category was provided
      const provided = hasValueInCategory(inputs, cat);
      if (provided) positives.push(label);
    } else {
      const worst = catFlags.reduce((a, b) => severityRank(b.severity) > severityRank(a.severity) ? b : a);
      topConcerns.push(`${label} (${worst.metric}: ${worst.value} ${worst.unit})`);
      void score;
    }
  });

  if (topConcerns.length > 0) {
    paragraphs.push(`Areas needing the most attention: ${topConcerns.slice(0, 4).join("; ")}. The detailed flags below explain each one.`);
  }
  if (positives.length > 0) {
    paragraphs.push(`Looking healthy: ${positives.join(", ")}.`);
  }

  // Paragraph 3 — guidance
  if (riskLevel === "high") {
    paragraphs.push("The most important next step is to share this report with a qualified healthcare professional within the next week or two. The action plan and follow-up tests below outline what to discuss.");
  } else if (riskLevel === "elevated" || riskLevel === "moderate") {
    paragraphs.push("Targeted lifestyle adjustments — outlined in the action plan below — can meaningfully improve these numbers before your next test. Recheck the flagged values in a few months to track progress.");
  } else {
    paragraphs.push("Keep maintaining your current routine and consider an annual checkup to stay on top of any changes.");
  }

  const summaryDetail: SummaryDetail = {
    headline,
    paragraphs,
    topConcerns,
    positives,
    riskLevel,
  };

  return {
    date: new Date().toISOString(),
    flags,
    diet,
    lifestyle,
    exercise,
    hydration,
    followUp,
    bmi: { value: bmiValue, category: bmiCategory },
    summary: paragraphs.join(" "),
    summaryDetail,
    actionPlan,
    scores,
    inputs
  };
}

function severityRank(s: Severity): number {
  return s === "critical" ? 4 : s === "warning" ? 3 : s === "watch" ? 2 : 1;
}

function hasValueInCategory(inputs: HealthInputs, category: string): boolean {
  switch (category) {
    case "sugar": return Boolean(inputs.fastingGlucose || inputs.postprandialGlucose || inputs.hba1c);
    case "lipids": return Boolean(inputs.totalCholesterol || inputs.ldl || inputs.hdl || inputs.triglycerides);
    case "thyroid": return Boolean(inputs.tsh || inputs.t3 || inputs.t4);
    case "liver": return Boolean(inputs.alt || inputs.ast || inputs.alp || inputs.bilirubin);
    case "kidney": return Boolean(inputs.creatinine || inputs.urea || inputs.uricAcid);
    case "cbc": return Boolean(inputs.hemoglobin || inputs.wbc || inputs.platelets || inputs.rbc);
    default: return false;
  }
}
