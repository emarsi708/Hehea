export interface Symptom {
  id: string;
  label: string;
  group: string;
  suggests: string[];
}

export const SYMPTOMS: Symptom[] = [
  { id: "fatigue", label: "Persistent fatigue / low energy", group: "General", suggests: ["CBC (anemia)", "Vitamin D", "Vitamin B12", "Ferritin", "TSH (thyroid)", "Fasting glucose"] },
  { id: "weight-gain", label: "Unexplained weight gain", group: "General", suggests: ["TSH", "Fasting glucose", "HbA1c", "Lipid profile", "Cortisol (consult doctor)"] },
  { id: "weight-loss", label: "Unexplained weight loss", group: "General", suggests: ["TSH", "Fasting glucose", "HbA1c", "CBC", "Liver function (LFT)"] },
  { id: "fever", label: "Recurring low-grade fever", group: "General", suggests: ["CBC", "ESR", "CRP", "Urine routine"] },

  { id: "thirst", label: "Increased thirst / frequent urination", group: "Sugar / Kidneys", suggests: ["Fasting glucose", "HbA1c", "Urine routine", "Creatinine"] },
  { id: "swelling", label: "Swelling in feet/ankles", group: "Sugar / Kidneys", suggests: ["Creatinine", "Urea (BUN)", "Urine albumin", "Liver panel"] },

  { id: "chest-pain", label: "Chest discomfort or pressure", group: "Heart", suggests: ["Lipid profile", "ECG (see doctor urgently)", "HbA1c", "BP check"] },
  { id: "palpitations", label: "Palpitations / irregular heartbeat", group: "Heart", suggests: ["TSH", "Electrolytes (Na, K, Mg)", "ECG", "CBC"] },
  { id: "breathlessness", label: "Shortness of breath on mild activity", group: "Heart", suggests: ["Hemoglobin / CBC", "TSH", "Lipid profile", "ECG"] },

  { id: "tingling", label: "Tingling / numbness in hands or feet", group: "Vitamins / Nerves", suggests: ["Vitamin B12", "Vitamin D", "HbA1c (diabetic neuropathy)"] },
  { id: "hair-loss", label: "Hair loss / brittle nails", group: "Vitamins / Hormones", suggests: ["TSH", "Ferritin", "Vitamin D", "Vitamin B12", "Zinc"] },
  { id: "muscle-cramps", label: "Frequent muscle cramps", group: "Vitamins / Nerves", suggests: ["Calcium", "Magnesium", "Potassium", "Vitamin D"] },
  { id: "bone-pain", label: "Bone or joint pain", group: "Vitamins / Inflammation", suggests: ["Vitamin D", "Calcium", "Uric acid", "ESR / CRP"] },

  { id: "cold", label: "Feeling cold all the time", group: "Hormones", suggests: ["TSH", "Free T3 / T4", "Hemoglobin"] },
  { id: "heat", label: "Feeling hot, sweaty, anxious", group: "Hormones", suggests: ["TSH", "Free T3 / T4"] },
  { id: "irregular-periods", label: "Irregular menstrual cycles", group: "Hormones", suggests: ["TSH", "Prolactin", "Insulin / HbA1c (PCOS)", "Vitamin D"] },

  { id: "abdomen-pain", label: "Right-upper abdominal discomfort", group: "Digestive / Liver", suggests: ["LFT (ALT/AST/ALP)", "Bilirubin", "Ultrasound (consult doctor)"] },
  { id: "dark-urine", label: "Dark urine / yellow eyes", group: "Digestive / Liver", suggests: ["Bilirubin", "ALT/AST", "Hepatitis screen"] },
  { id: "indigestion", label: "Bloating, nausea, indigestion", group: "Digestive / Liver", suggests: ["Liver panel", "H. pylori test", "Vitamin B12"] },

  { id: "frequent-infections", label: "Catching infections frequently", group: "Immunity", suggests: ["CBC (WBC)", "Vitamin D", "HbA1c", "HIV / immune workup if persistent"] },
  { id: "easy-bruising", label: "Easy bruising or bleeding gums", group: "Blood", suggests: ["Platelets / CBC", "Vitamin K / clotting tests", "LFT"] },

  { id: "mood-low", label: "Low mood / brain fog", group: "Mental Wellness", suggests: ["TSH", "Vitamin D", "Vitamin B12", "Ferritin"] },
  { id: "poor-sleep", label: "Trouble sleeping", group: "Mental Wellness", suggests: ["TSH", "Vitamin D", "Magnesium", "Cortisol (consult doctor)"] },
];

export function suggestTests(symptomIds: string[]): { test: string; symptoms: string[] }[] {
  const map = new Map<string, Set<string>>();
  symptomIds.forEach(id => {
    const s = SYMPTOMS.find(x => x.id === id);
    if (!s) return;
    s.suggests.forEach(t => {
      if (!map.has(t)) map.set(t, new Set());
      map.get(t)!.add(s.label);
    });
  });
  return Array.from(map.entries())
    .map(([test, syms]) => ({ test, symptoms: Array.from(syms) }))
    .sort((a, b) => b.symptoms.length - a.symptoms.length);
}
