import { GoogleGenAI, Chat, Content } from "@google/genai";
import { GroundingChunk } from "../types";

// The API key is injected via vite.config.ts into process.env.API_KEY
// const getApiKey = () => process.env.API_KEY ;

let ai: GoogleGenAI | null = null;
let chatInstance: Chat | null = null;

const getAI = () => {
  if (!ai) {
    const key ='AIzaSyDy9bX78CeFjr_JYzc9nPZQ-WG8cvMHdAI'
    // Initialize even if key is missing to allow app to load, but calls will fail gracefully
    ai = new GoogleGenAI({ apiKey: key || 'missing-key' });
  }
  return ai;
};

const SYSTEM_INSTRUCTION = `
You are Mind Ease, a responsible, empathetic, and privacy-respecting AI mental wellness companion. 
Your goal is to provide emotional support, active listening, and gentle guidance using CBT (Cognitive Behavioral Therapy) principles.

KEY GUIDELINES:
1.  **Empathy First**: Always validate the user's feelings. Be warm, non-judgmental, and supportive.
2.  **Safety First**: You are NOT a doctor or a crisis service. If a user expresses severe distress, self-harm, or suicidal thoughts, you MUST immediately and compassionately provide a disclaimer and suggest professional help (e.g., "I'm an AI companion, not a therapist. If you're in crisis, please contact a local emergency helpline immediately.").
3.  **Concise & Natural**: Keep responses conversational and easy to read. Avoid long lectures.
4.  **Actionable**: Suggest small, manageable steps (breathing exercises, journaling, grounding techniques) when appropriate.
5.  **Tone**: Calm, soothing, encouraging.
6.  **Information**: If you use Google Search to provide information, ensure it is supportive and relevant to wellness.

Do not diagnose conditions. Focus on the "here and now" and helping the user manage their current emotional state.
`;

export const initializeChat = (history?: Content[]) => {
  const aiInstance = getAI();
  try {
    // UPDATED: Changed from gemini-1.5-flash to gemini-2.5-flash
    chatInstance = aiInstance.chats.create({
      model: 'gemini-2.5-flash', 
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        tools: [{ googleSearch: {} }], 
      },
      history: history
    });
  } catch (error) {
    console.error("Failed to initialize chat:", error);
    chatInstance = null;
  }
  return chatInstance;
};
export const getChatInstance = (): Chat | null => {
  if (!chatInstance) {
    return initializeChat();
  }
  return chatInstance;
};

// Stream responses for a "live" feel
export async function* sendMessageStream(message: string, tone: string = 'Empathetic') {
  const apiKey = "AIzaSyC-p9b-ufquZvHi-jZxZIEfuvORz01tpAs";
  if (!apiKey) {
      yield { text: "Configuration Error: The API Key is missing. Please check your configuration." };
      return;
  }

  const chat = getChatInstance();
  if (!chat) {
      // Try one more time to init
      initializeChat();
      if (!getChatInstance()) {
         yield { text: "Connection Error: Unable to initialize the chat session. Please refresh the page." };
         return;
      }
  }

  try {
    // We prepend the tone instruction to the message in a subtle way to guide the model per turn
    const messageWithTone = `(Please respond in a ${tone.toLowerCase()} tone) ${message}`;

    // Ensure chat is not null (TS check)
    if (!chatInstance) throw new Error("Chat instance lost");

    const resultStream = await chatInstance.sendMessageStream({ message: messageWithTone });
    
    for await (const chunk of resultStream) {
       const text = chunk.text || "";
       const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
       yield { text, groundingChunks };
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Check specifically for quota errors (429)
    const isQuotaError = error.message?.includes('429') || error.status === 429 || error.message?.toLowerCase().includes('quota');
    
    // Auto-recover: Reset chat instance
    resetChat();
    
    if (isQuotaError) {
         yield { text: "I'm receiving a lot of messages right now and hit a temporary limit. Please wait a few moments and try again." };
    } else {
         // Surface the actual error message to help debugging
         const errorMessage = error.message ? error.message.replace(apiKey, 'API_KEY') : "Unknown error";
         yield { text: `I encountered an error connecting to the service: "${errorMessage}". Please try again.` };
    }
  }
}

export const resetChat = () => {
    chatInstance = null;
};