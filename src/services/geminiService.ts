import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey! });

export interface NewsVerificationResult {
  isReal: boolean;
  confidence: number;
  reasoning: string;
  sources?: string[];
}

export async function verifyNews(headline: string, body: string): Promise<NewsVerificationResult> {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Analyze the following news content and determine if it is likely to be real or fake.
    Headline: ${headline}
    Body: ${body}

    Provide a detailed reasoning for your classification, considering factors like:
    - Source credibility (if mentioned)
    - Logical consistency
    - Presence of emotional or sensational language
    - Cross-referencing with known facts (use your internal knowledge)
    - Writing style and grammar

    Return the result in JSON format with the following structure:
    {
      "isReal": boolean,
      "confidence": number (0-1),
      "reasoning": "Detailed explanation in markdown format",
      "sources": ["List of potential sources or fact-checking sites to verify"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isReal: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            sources: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["isReal", "confidence", "reasoning"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Error verifying news:", error);
    throw new Error("Failed to verify news. Please try again later.");
  }
}

export async function chatWithAI(message: string, context?: string): Promise<string> {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `
    You are Authentic Samachar AI, a helpful assistant specialized in news verification and media literacy.
    Your goal is to help users understand how to spot fake news and provide insights into news authenticity.
    Be polite, professional, and objective.
    ${context ? `Context about the news being discussed: ${context}` : ""}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts: [{ text: message }] }],
      config: {
        systemInstruction,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Error in AI chat:", error);
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }
}
