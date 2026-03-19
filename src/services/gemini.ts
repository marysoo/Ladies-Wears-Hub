import { GoogleGenAI, Type } from "@google/genai";

export const suggestProductDetails = async (base64Image: string, mimeType: string) => {
  // Initialize AI inside the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3-flash-preview"; // Using recommended model from baseline
  
  const prompt = `Analyze this office wear clothing image and provide:
  1. A catchy, SEO-optimized product title (max 60 chars).
  2. A professional, engaging product description (2-3 sentences) highlighting style and occasion.
  3. The most appropriate category (e.g., Blazers, Dresses, Skirts, Suits, Tops, Trousers).
  
  Return the result in JSON format.`;

  try {
    console.log(`Sending request to Gemini (${model}) with image type: ${mimeType}`);
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

    if (!response.text) {
      console.error("Gemini returned empty response text");
      throw new Error("AI returned an empty response. Please try with a different image.");
    }

    const result = JSON.parse(response.text);
    console.log("Gemini response parsed successfully:", result);
    return result;
  } catch (error: any) {
    console.error("Gemini Product Suggestion Error Details:", {
      message: error.message,
      stack: error.stack,
      error
    });
    
    if (error.message?.includes('API key not valid')) {
      throw new Error("AI Service Error: The API key is invalid. Please contact support.");
    }
    
    throw error;
  }
};

export const suggestCouponDetails = async (storeName: string, discountType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = "gemini-3-flash-preview";
  
  const prompt = `Generate a catchy, SEO-optimized title and description for a coupon/deal for the store "${storeName}". 
  The discount type is "${discountType}".
  
  1. A catchy title (max 60 chars) that highlights the value.
  2. A compelling description (1-2 sentences) that creates urgency and excitement.
  
  Return the result in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    });

    if (!response.text) {
      throw new Error("AI returned an empty response");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Coupon Suggestion Error:", error);
    throw error;
  }
};
