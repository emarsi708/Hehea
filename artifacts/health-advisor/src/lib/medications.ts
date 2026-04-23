export interface MedInteraction {
  affectsMarkers: string[];
  effect: string;
  recommendation: string;
}

export interface MedDef {
  name: string;
  aliases: string[];
  category: "medication" | "supplement";
  class: string;
  interactions: MedInteraction[];
}

export const MED_DATABASE: MedDef[] = [
  {
    name: "Statin (Atorvastatin / Rosuvastatin / Simvastatin)",
    aliases: ["statin", "atorvastatin", "rosuvastatin", "simvastatin", "lipitor", "crestor", "lipvas"],
    category: "medication",
    class: "Cholesterol-lowering",
    interactions: [
      { affectsMarkers: ["alt", "ast"], effect: "Can elevate liver enzymes", recommendation: "Recheck LFT every 6 months." },
      { affectsMarkers: ["ldl", "totalCholesterol"], effect: "Lowers LDL cholesterol", recommendation: "Expected and desired effect." },
      { affectsMarkers: ["ck", "creatineKinase"], effect: "May raise CK; muscle pain warning", recommendation: "Report unexplained muscle aches to doctor." },
    ],
  },
  {
    name: "Metformin",
    aliases: ["metformin", "glucophage", "glycomet"],
    category: "medication",
    class: "Diabetes",
    interactions: [
      { affectsMarkers: ["b12", "vitaminB12"], effect: "Long-term use lowers B12", recommendation: "Test B12 yearly; consider supplementation." },
      { affectsMarkers: ["hba1c", "fastingGlucose"], effect: "Lowers blood sugar", recommendation: "Expected effect." },
      { affectsMarkers: ["creatinine", "egfr"], effect: "Caution with poor kidney function", recommendation: "Stop if eGFR drops below 30." },
    ],
  },
  {
    name: "Levothyroxine",
    aliases: ["levothyroxine", "thyroxine", "eltroxin", "synthroid", "thyronorm"],
    category: "medication",
    class: "Thyroid",
    interactions: [
      { affectsMarkers: ["tsh"], effect: "Lowers TSH", recommendation: "Recheck TSH 6-8 weeks after dose change." },
      { affectsMarkers: ["t4", "freeT4"], effect: "Raises T4", recommendation: "Take on empty stomach for consistency." },
    ],
  },
  {
    name: "ACE Inhibitor / ARB (Lisinopril / Telmisartan / Losartan)",
    aliases: ["lisinopril", "telmisartan", "losartan", "ramipril", "enalapril", "ace inhibitor", "arb"],
    category: "medication",
    class: "Blood pressure",
    interactions: [
      { affectsMarkers: ["potassium"], effect: "Can raise potassium", recommendation: "Monitor potassium periodically." },
      { affectsMarkers: ["creatinine", "egfr"], effect: "May affect kidney function", recommendation: "Recheck kidney function 1-2 weeks after starting." },
    ],
  },
  {
    name: "Diuretic (Hydrochlorothiazide / Furosemide)",
    aliases: ["hctz", "hydrochlorothiazide", "furosemide", "lasix", "diuretic"],
    category: "medication",
    class: "Blood pressure / fluid",
    interactions: [
      { affectsMarkers: ["potassium"], effect: "Can lower potassium", recommendation: "Monitor potassium; consider potassium-rich foods." },
      { affectsMarkers: ["sodium"], effect: "Can lower sodium", recommendation: "Watch for dizziness and fatigue." },
      { affectsMarkers: ["uricAcid"], effect: "Raises uric acid", recommendation: "Caution if you have gout." },
    ],
  },
  {
    name: "Warfarin",
    aliases: ["warfarin", "coumadin"],
    category: "medication",
    class: "Blood thinner",
    interactions: [
      { affectsMarkers: ["inr", "pt"], effect: "Increases INR (intended)", recommendation: "Regular INR monitoring required." },
      { affectsMarkers: ["vitaminK"], effect: "Vitamin K reverses effect", recommendation: "Keep leafy green intake consistent." },
    ],
  },
  {
    name: "Iron supplement",
    aliases: ["iron", "ferrous sulfate", "ferrous fumarate", "iron supplement"],
    category: "supplement",
    class: "Anemia",
    interactions: [
      { affectsMarkers: ["hemoglobin", "ferritin"], effect: "Raises hemoglobin and iron stores", recommendation: "Recheck iron studies after 8-12 weeks." },
    ],
  },
  {
    name: "Vitamin D3",
    aliases: ["vitamin d", "vitamin d3", "cholecalciferol"],
    category: "supplement",
    class: "Vitamin",
    interactions: [
      { affectsMarkers: ["vitaminD", "vitD"], effect: "Raises Vitamin D", recommendation: "Recheck after 8-12 weeks at therapeutic dose." },
      { affectsMarkers: ["calcium"], effect: "Can raise calcium at high doses", recommendation: "Avoid mega-doses without testing." },
    ],
  },
  {
    name: "Vitamin B12 / Methylcobalamin",
    aliases: ["b12", "vitamin b12", "methylcobalamin", "cyanocobalamin"],
    category: "supplement",
    class: "Vitamin",
    interactions: [
      { affectsMarkers: ["b12", "vitaminB12"], effect: "Raises Vitamin B12", recommendation: "Recheck after 3 months." },
    ],
  },
  {
    name: "Aspirin (low-dose)",
    aliases: ["aspirin", "ecosprin", "asa"],
    category: "medication",
    class: "Blood thinner",
    interactions: [
      { affectsMarkers: ["hemoglobin"], effect: "Long-term use can cause occult bleeding", recommendation: "Watch for unexplained anemia." },
    ],
  },
  {
    name: "Allopurinol",
    aliases: ["allopurinol", "zyloric"],
    category: "medication",
    class: "Gout",
    interactions: [
      { affectsMarkers: ["uricAcid"], effect: "Lowers uric acid", recommendation: "Recheck uric acid after 4-8 weeks." },
      { affectsMarkers: ["alt", "ast"], effect: "Rare liver enzyme elevation", recommendation: "Periodic LFT recommended." },
    ],
  },
  {
    name: "Omega-3 / Fish oil",
    aliases: ["omega 3", "omega-3", "fish oil", "epa", "dha"],
    category: "supplement",
    class: "Lipids",
    interactions: [
      { affectsMarkers: ["triglycerides"], effect: "Lowers triglycerides", recommendation: "Expected at 2-4g/day." },
    ],
  },
  {
    name: "Birth control / Hormonal contraceptive",
    aliases: ["birth control", "ocp", "oral contraceptive", "estrogen", "progesterone"],
    category: "medication",
    class: "Hormonal",
    interactions: [
      { affectsMarkers: ["triglycerides"], effect: "Can raise triglycerides", recommendation: "Monitor lipid panel yearly." },
      { affectsMarkers: ["tsh"], effect: "Can affect thyroid binding", recommendation: "Inform doctor before thyroid testing." },
    ],
  },
  {
    name: "Steroid (Prednisone / Prednisolone)",
    aliases: ["prednisone", "prednisolone", "wysolone", "steroid", "corticosteroid"],
    category: "medication",
    class: "Anti-inflammatory",
    interactions: [
      { affectsMarkers: ["fastingGlucose", "hba1c"], effect: "Raises blood sugar", recommendation: "Monitor sugar closely, especially in diabetics." },
      { affectsMarkers: ["potassium"], effect: "Can lower potassium", recommendation: "Periodic electrolyte check." },
      { affectsMarkers: ["wbc"], effect: "Can elevate WBC count", recommendation: "Don't mistake for infection." },
    ],
  },
];

export function findMedDef(name: string): MedDef | null {
  const q = name.trim().toLowerCase();
  if (!q) return null;
  return MED_DATABASE.find(m =>
    m.name.toLowerCase() === q ||
    m.aliases.some(a => a === q || q.includes(a) || a.includes(q))
  ) ?? null;
}

const MARKER_ALIASES: Record<string, string[]> = {
  alt: ["alt", "sgpt"],
  ast: ["ast", "sgot"],
  ldl: ["ldl"],
  totalCholesterol: ["totalcholesterol", "totalchol", "tc"],
  hba1c: ["hba1c", "a1c"],
  fastingGlucose: ["fastingglucose", "fbs", "glucose"],
  b12: ["b12", "vitaminb12"],
  vitaminD: ["vitamind", "vitd", "25ohd"],
  tsh: ["tsh"],
  t4: ["t4", "freet4"],
  potassium: ["potassium", "k"],
  sodium: ["sodium", "na"],
  creatinine: ["creatinine"],
  egfr: ["egfr"],
  uricAcid: ["uricacid"],
  hemoglobin: ["hemoglobin", "hb", "hgb"],
  ferritin: ["ferritin"],
  triglycerides: ["triglycerides", "tg"],
  calcium: ["calcium"],
  inr: ["inr"],
  pt: ["pt", "prothrombin"],
  ck: ["ck", "creatinekinase", "cpk"],
  wbc: ["wbc"],
};

function matchesMarker(flagMetric: string, markerKeys: string[]): boolean {
  const norm = flagMetric.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const key of markerKeys) {
    const aliases = MARKER_ALIASES[key] ?? [key];
    if (aliases.some(a => norm.includes(a))) return true;
  }
  return false;
}

export interface InteractionWarning {
  medication: string;
  flaggedMetric: string;
  effect: string;
  recommendation: string;
}

export function findInteractions(
  medications: { name: string }[],
  flags: { metric: string }[],
): InteractionWarning[] {
  const warnings: InteractionWarning[] = [];
  for (const med of medications) {
    const def = findMedDef(med.name);
    if (!def) continue;
    for (const interaction of def.interactions) {
      for (const flag of flags) {
        if (matchesMarker(flag.metric, interaction.affectsMarkers)) {
          warnings.push({
            medication: def.name,
            flaggedMetric: flag.metric,
            effect: interaction.effect,
            recommendation: interaction.recommendation,
          });
        }
      }
    }
  }
  return warnings;
}
