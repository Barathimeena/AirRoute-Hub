
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Use 'gemini-2.5-flash' which is the standard model identifier for 2.5 series grounding
export const getTravelHelp = async (query: string, userContext: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `You are the SkyConcierge AI for Eventora Elite. Help the user with flight bookings, baggage policies, or travel requirements.
    User Context: ${userContext}
    User Query: ${query}`,
    config: {
      // Both googleSearch and googleMaps are compatible when used together
      tools: [{ googleSearch: {} }, { googleMaps: {} }],
      temperature: 0.7,
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const links: { title: string; uri: string }[] = [];

  // Extract grounding information as per guidelines
  groundingChunks.forEach((chunk: any) => {
    if (chunk.web) links.push({ title: chunk.web.title, uri: chunk.web.uri });
    if (chunk.maps) links.push({ title: chunk.maps.title || 'Venue Details', uri: chunk.maps.uri });
  });

  return {
    text: response.text || '',
    links: links
  };
};

export const getDestinationSuggestions = async (budget: number, startingCity: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3 amazing international destinations for someone flying from ${startingCity} with a budget of around ${budget} USD. Provide brief reasoning for each.`,
  });
  return response.text || '';
};

// analyzeQualification returns a structured JSON evaluation
export const analyzeQualification = async (freelancerData: string, jobData: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze if this freelancer is qualified for this job based on their background and requirements. 
    Freelancer Profile Data: ${freelancerData}
    Job Description Data: ${jobData}
    Return a valid JSON object with "score" (number from 0 to 100) and "summary" (concise explanation).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: {
            type: Type.NUMBER,
            description: 'Matching score from 0 to 100.',
          },
          summary: {
            type: Type.STRING,
            description: 'Brief justification for the score.',
          },
        },
        required: ["score", "summary"],
      },
    },
  });

  try {
    // Access response text directly from the property
    return JSON.parse(response.text || '{"score": 0, "summary": "Analysis unavailable."}');
  } catch (e) {
    return { score: 0, summary: "Error parsing qualification analysis." };
  }
};

export const chatWithAI = async (prompt: string, history: any[]) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text || '';
};

export const getTravelAdvice = async (query: string, context: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a travel expert, provide advice for the following query:
    Query: ${query}
    Context: ${context}`,
  });
  return response.text || '';
};
