import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateAIResponse = async (prompt: string): Promise<string> => {
  if (!API_KEY) {
    return "API ключ не найден. Пожалуйста, настройте окружение.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Ты — эксперт в водоподготовке и химических реагентах, специализирующийся на системах обратного осмоса и антискалантах (в частности, Аминат К). Твоя задача — помогать инженерам рассчитывать дозировки, объяснять принципы работы насосов-дозаторов (Seko) и решать проблемы с эксплуатацией мембран. Отвечай кратко, профессионально и по делу. Используй метрическую систему.",
      }
    });
    
    return response.text || "Не удалось получить ответ от AI.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Произошла ошибка при обращении к AI сервису.";
  }
};