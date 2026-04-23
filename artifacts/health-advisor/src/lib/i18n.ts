import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "en" | "hi" | "es" | "ar";

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "ar", label: "Arabic", native: "العربية" },
];

type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = {
  en: {
    "chat.title": "AI Health Coach",
    "chat.subtitle.report": "Knows your latest report",
    "chat.subtitle.general": "General wellness Q&A",
    "chat.placeholder": "Ask about your results, diet, exercise...",
    "chat.empty.title": "Ask me anything about your health",
    "chat.empty.body": "Diet, lifestyle, what your numbers mean — I'm here to help.",
    "chat.send": "Send",
    "chat.clear": "Clear",
    "chat.read": "Read aloud",
    "chat.stop": "Stop",
    "chat.disclaimer": "AI guidance only, not medical advice. Consult a doctor.",
    "lang.label": "Language",
  },
  hi: {
    "chat.title": "एआई स्वास्थ्य सलाहकार",
    "chat.subtitle.report": "आपकी नवीनतम रिपोर्ट जानता है",
    "chat.subtitle.general": "सामान्य स्वास्थ्य प्रश्नोत्तर",
    "chat.placeholder": "अपने परिणाम, आहार, व्यायाम के बारे में पूछें...",
    "chat.empty.title": "अपने स्वास्थ्य के बारे में कुछ भी पूछें",
    "chat.empty.body": "आहार, जीवनशैली, आपके आंकड़ों का अर्थ — मैं मदद के लिए हूं।",
    "chat.send": "भेजें",
    "chat.clear": "साफ़ करें",
    "chat.read": "ज़ोर से पढ़ें",
    "chat.stop": "रोकें",
    "chat.disclaimer": "केवल एआई मार्गदर्शन, चिकित्सा सलाह नहीं। डॉक्टर से सलाह लें।",
    "lang.label": "भाषा",
  },
  es: {
    "chat.title": "Asesor de Salud IA",
    "chat.subtitle.report": "Conoce tu informe más reciente",
    "chat.subtitle.general": "Preguntas generales de bienestar",
    "chat.placeholder": "Pregunta sobre tus resultados, dieta, ejercicio...",
    "chat.empty.title": "Pregúntame lo que sea sobre tu salud",
    "chat.empty.body": "Dieta, estilo de vida, qué significan tus números — estoy aquí para ayudar.",
    "chat.send": "Enviar",
    "chat.clear": "Limpiar",
    "chat.read": "Leer en voz alta",
    "chat.stop": "Detener",
    "chat.disclaimer": "Solo orientación de IA, no consejo médico. Consulta a un médico.",
    "lang.label": "Idioma",
  },
  ar: {
    "chat.title": "مستشار الصحة الذكي",
    "chat.subtitle.report": "يعرف تقريرك الأخير",
    "chat.subtitle.general": "أسئلة وأجوبة العافية العامة",
    "chat.placeholder": "اسأل عن نتائجك، الحمية، التمارين...",
    "chat.empty.title": "اسألني أي شيء عن صحتك",
    "chat.empty.body": "الحمية، نمط الحياة، ماذا تعني أرقامك — أنا هنا للمساعدة.",
    "chat.send": "إرسال",
    "chat.clear": "مسح",
    "chat.read": "اقرأ بصوت عال",
    "chat.stop": "توقف",
    "chat.disclaimer": "إرشادات ذكاء اصطناعي فقط، وليست نصيحة طبية. استشر طبيباً.",
    "lang.label": "اللغة",
  },
};

interface I18nState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),
    }),
    { name: "health-advisor:lang" }
  )
);

export function useT() {
  const { lang } = useI18n();
  return (key: string) => dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;
}

export function getLanguageName(code: Lang): string {
  return LANGUAGES.find(l => l.code === code)?.label ?? "English";
}

export function isRTL(code: Lang): boolean {
  return code === "ar";
}
