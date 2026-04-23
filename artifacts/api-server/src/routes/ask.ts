import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

const baseURL = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

const ai = baseURL && apiKey
  ? new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "", baseUrl: baseURL } })
  : null;

const SYSTEM_PROMPT = `You are HealthAdvisor's friendly assistant.

You help the user understand their lab values in plain language. Stay grounded in the values they share. You may give general wellness, diet, and lifestyle suggestions but you are NOT a doctor. Always:
- Be concise (2-4 short paragraphs max).
- Use plain language. Avoid jargon unless you also explain it.
- Include 1-3 concrete tips when relevant.
- Always end by reminding them to consult their doctor for any decision.
- Refuse to diagnose, prescribe, or interpret as medical advice.
- If asked something unrelated to health/wellness/their report, politely steer back.`;

router.post("/ask", async (req, res) => {
  if (!ai) return res.status(503).json({ error: "AI service not configured" });

  const { question, context, history, languageInstruction } = req.body as {
    question?: string;
    context?: string;
    history?: { role: "user" | "model"; content: string }[];
    languageInstruction?: string;
  };

  if (!question?.trim()) {
    return res.status(400).json({ error: "question is required" });
  }

  try {
    const contents = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Understood. I'll be concise, grounded in their values, and remind them to see their doctor." }] },
      ...(context
        ? [
            { role: "user" as const, parts: [{ text: `Here is the user's current report context:\n\n${context}` }] },
            { role: "model" as const, parts: [{ text: "Got it. I'll reference these values when answering." }] },
          ]
        : []),
      ...(history ?? []).map(m => ({ role: m.role, parts: [{ text: m.content }] })),
      { role: "user" as const, parts: [{ text: languageInstruction ? `${languageInstruction}\n\n${question}` : question }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: { maxOutputTokens: 1024 },
    });

    return res.json({ answer: response.text ?? "" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    req.log?.error({ err }, "ask failed");
    return res.status(500).json({ error: message });
  }
});

export default router;
