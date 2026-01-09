import { GoogleGenAI, Type } from "@google/genai";
import { Server } from '../types';
import { MOCK_SERVERS } from '../constants';

export const getSmartRecommendation = async (userQuery: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `
    You are an expert VPN routing assistant. 
    You have access to the following server list: ${JSON.stringify(MOCK_SERVERS.map(s => ({id: s.id, country: s.country, features: s.features})))}.
    Based on the user's intent (e.g., streaming Netflix, gaming, privacy), recommend the single best server ID.
    If the intent is unclear, recommend 'us-east-1' by default.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedServerId: { type: Type.STRING },
            reason: { type: Type.STRING, description: "Short explanation for the user" }
          },
          required: ["recommendedServerId", "reason"]
        }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return JSON.stringify({ recommendedServerId: 'us-east-1', reason: 'Fallback: AI service unavailable.' });
  }
};