import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ProductSuggestion {
  title: string;
  description: string;
  category: string;
}

export async function suggestProductDetails(imageData: string, mimeType: string): Promise<ProductSuggestion> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: imageData,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this image of a professional office wear item. Provide a catchy, SEO-optimized title, a persuasive description highlighting its benefits for a professional woman, and a suitable category (e.g., Dresses, Blazers, Shoes, Accessories). Return the result in JSON format.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ["title", "description", "category"],
      },
    },
  });

  const response = await model;
  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as ProductSuggestion;
}
