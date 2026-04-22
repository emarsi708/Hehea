import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

const baseURL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

const ai = baseURL && apiKey
  ? new GoogleGenAI({ apiKey, httpOptions: { baseUrl: baseURL } })
  : null;

const EXTRACTION_PROMPT = `You are a medical lab report parser. Extract numerical values from this medical/lab report image.

Return ONLY a JSON object with these optional keys (omit any key whose value is not present in the report):

{
  "age": number,
  "gender": "male" | "female" | "other",
  "height": number (cm),
  "weight": number (kg),
  "fastingGlucose": number (mg/dL — convert from mmol/L if needed by multiplying by 18),
  "postprandialGlucose": number (mg/dL),
  "hba1c": number (%),
  "totalCholesterol": number (mg/dL),
  "ldl": number (mg/dL),
  "hdl": number (mg/dL),
  "triglycerides": number (mg/dL),
  "tsh": number (mIU/L),
  "t3": number,
  "t4": number,
  "alt": number (U/L — also known as SGPT),
  "ast": number (U/L — also known as SGOT),
  "alp": number (U/L),
  "bilirubin": number (mg/dL),
  "creatinine": number (mg/dL),
  "urea": number (mg/dL — convert from BUN if needed),
  "uricAcid": number (mg/dL),
  "hemoglobin": number (g/dL),
  "wbc": number (×10³/µL),
  "platelets": number (×10³/µL — if reported as 250000, return 250),
  "rbc": number (×10⁶/µL)
}

Rules:
- Return ONLY the JSON object, no prose, no markdown fences.
- Convert units if the report uses different units than specified above.
- For ranges (e.g. "120-130"), use the average.
- Omit any field you cannot find or are unsure about.
- If the image is not a medical report, return {}.`;

router.post("/extract-report", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "AI service not configured" });
  }

  const { imageBase64, mimeType } = req.body as { imageBase64?: string; mimeType?: string };

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: "imageBase64 and mimeType are required" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: EXTRACTION_PROMPT },
          { inlineData: { mimeType, data: imageBase64 } },
        ],
      }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "{}";
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, "").trim());
    } catch {
      parsed = {};
    }

    return res.json({ extracted: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    req.log?.error({ err }, "extract-report failed");
    return res.status(500).json({ error: message });
  }
});

export default router;
