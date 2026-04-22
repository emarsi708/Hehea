export interface CalcResult {
  value: number;
  unit: string;
  category: string;
  severity: "good" | "watch" | "warn";
  explanation: string;
}

export function calcBmi(weightKg: number, heightCm: number): CalcResult {
  const h = heightCm / 100;
  const bmi = +(weightKg / (h * h)).toFixed(1);
  let category = "Normal", severity: CalcResult["severity"] = "good", explanation = "Healthy weight range.";
  if (bmi < 18.5) { category = "Underweight"; severity = "watch"; explanation = "Below healthy weight."; }
  else if (bmi < 25) { category = "Normal"; severity = "good"; explanation = "Healthy weight range."; }
  else if (bmi < 30) { category = "Overweight"; severity = "watch"; explanation = "Above healthy weight."; }
  else if (bmi < 35) { category = "Obese (Class I)"; severity = "warn"; explanation = "Obesity raises many health risks."; }
  else { category = "Obese (Class II+)"; severity = "warn"; explanation = "Significant health risk."; }
  return { value: bmi, unit: "kg/m²", category, severity, explanation };
}

export function calcBmr(weightKg: number, heightCm: number, age: number, gender: "male" | "female"): CalcResult {
  const bmr = gender === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return {
    value: Math.round(bmr),
    unit: "kcal/day",
    category: "Resting energy",
    severity: "good",
    explanation: "Calories your body needs at complete rest. Multiply by activity factor for total needs.",
  };
}

export function calcIdealWeight(heightCm: number, gender: "male" | "female"): CalcResult {
  const inchesOver5ft = Math.max(0, heightCm / 2.54 - 60);
  const ideal = gender === "male"
    ? 50 + 2.3 * inchesOver5ft
    : 45.5 + 2.3 * inchesOver5ft;
  return {
    value: +ideal.toFixed(1),
    unit: "kg",
    category: "Devine formula",
    severity: "good",
    explanation: "Estimated ideal weight for your height. Use as a rough reference.",
  };
}

export interface AscvdInputs {
  age: number;
  gender: "male" | "female";
  totalCholesterol: number;
  hdl: number;
  systolicBP: number;
  smoker: boolean;
  diabetic: boolean;
  bpTreated: boolean;
}

export function calcAscvd(i: AscvdInputs): CalcResult {
  const ln = Math.log;
  const age = i.age, tc = i.totalCholesterol, hdl = i.hdl, sbp = i.systolicBP;
  let s, mean;
  if (i.gender === "female") {
    s = (-29.799 * ln(age))
      + (4.884 * Math.pow(ln(age), 2))
      + (13.540 * ln(tc))
      + (-3.114 * ln(age) * ln(tc))
      + (-13.578 * ln(hdl))
      + (3.149 * ln(age) * ln(hdl))
      + ((i.bpTreated ? 2.019 : 1.957) * ln(sbp))
      + (i.smoker ? 7.574 : 0)
      + (i.smoker ? -1.665 * ln(age) : 0)
      + (i.diabetic ? 0.661 : 0);
    mean = -29.18;
    const risk = 1 - Math.pow(0.9665, Math.exp(s - mean));
    return wrapAscvd(risk);
  } else {
    s = (12.344 * ln(age))
      + (11.853 * ln(tc))
      + (-2.664 * ln(age) * ln(tc))
      + (-7.990 * ln(hdl))
      + (1.769 * ln(age) * ln(hdl))
      + ((i.bpTreated ? 1.797 : 1.764) * ln(sbp))
      + (i.smoker ? 7.837 : 0)
      + (i.smoker ? -1.795 * ln(age) : 0)
      + (i.diabetic ? 0.658 : 0);
    mean = 61.18;
    const risk = 1 - Math.pow(0.9144, Math.exp(s - mean));
    return wrapAscvd(risk);
  }
}

function wrapAscvd(risk: number): CalcResult {
  const pct = +(Math.max(0, Math.min(1, risk)) * 100).toFixed(1);
  let category = "Low", severity: CalcResult["severity"] = "good", explanation = "Less than 5% 10-year risk of heart attack or stroke.";
  if (pct >= 20) { category = "High"; severity = "warn"; explanation = "20%+ 10-year risk. Strongly consider statins and lifestyle change."; }
  else if (pct >= 7.5) { category = "Intermediate"; severity = "warn"; explanation = "7.5–20% 10-year risk. Discuss prevention with your doctor."; }
  else if (pct >= 5) { category = "Borderline"; severity = "watch"; explanation = "5–7.5% 10-year risk. Lifestyle changes recommended."; }
  return { value: pct, unit: "% (10-year risk)", category, severity, explanation };
}

export interface FindriscInputs {
  age: number;
  bmi: number;
  waistCm: number;
  gender: "male" | "female";
  exercise30minDaily: boolean;
  veggiesDaily: boolean;
  bpMeds: boolean;
  highGlucoseHistory: boolean;
  familyDiabetes: "none" | "second-degree" | "first-degree";
}

export function calcFindrisc(i: FindriscInputs): CalcResult {
  let score = 0;
  if (i.age >= 65) score += 4;
  else if (i.age >= 55) score += 3;
  else if (i.age >= 45) score += 2;

  if (i.bmi >= 30) score += 3;
  else if (i.bmi >= 25) score += 1;

  if (i.gender === "male") {
    if (i.waistCm >= 102) score += 4;
    else if (i.waistCm >= 94) score += 3;
  } else {
    if (i.waistCm >= 88) score += 4;
    else if (i.waistCm >= 80) score += 3;
  }

  if (!i.exercise30minDaily) score += 2;
  if (!i.veggiesDaily) score += 1;
  if (i.bpMeds) score += 2;
  if (i.highGlucoseHistory) score += 5;
  if (i.familyDiabetes === "first-degree") score += 5;
  else if (i.familyDiabetes === "second-degree") score += 3;

  let category = "Low", severity: CalcResult["severity"] = "good", explanation = "About 1% chance of type 2 diabetes in 10 years.";
  if (score >= 20) { category = "Very high"; severity = "warn"; explanation = "About 50% chance in 10 years. Talk to your doctor about prevention."; }
  else if (score >= 15) { category = "High"; severity = "warn"; explanation = "About 33% chance in 10 years."; }
  else if (score >= 12) { category = "Moderate"; severity = "watch"; explanation = "About 17% chance in 10 years."; }
  else if (score >= 7) { category = "Slightly elevated"; severity = "watch"; explanation = "About 4% chance in 10 years."; }

  return { value: score, unit: "points", category, severity, explanation };
}
