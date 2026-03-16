import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const suggestProductDetails = async (base64Image: string, mimeType: string) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this office wear clothing image and provide:
  1. A catchy, SEO-optimized product title (max 60 chars).
  2. A professional, engaging product description (2-3 sentences) highlighting style and occasion.
  3. The most appropriate category (e.g., Blazers, Dresses, Skirts, Suits, Tops, Trousers).
  
  Return the result in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["title", "description", "category"]
      }
    }
  });

  return JSON.parse(response.text);
};
