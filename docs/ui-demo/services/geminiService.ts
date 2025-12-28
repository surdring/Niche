import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from '../types';
import { GEMINI_MODEL_FLASH, GEMINI_MODEL_PRO } from '../constants';

// Initialize the API client
// Note: In a real environment, ensure process.env.API_KEY is set.
// For this demo, we assume the environment is correctly configured.
const getClient = () => {
    // Fallback for demo purposes if env is missing (User should provide their own in a real app)
    const apiKey = process.env.API_KEY || ''; 
    return new GoogleGenAI({ apiKey });
};

interface StreamOptions {
  model?: string;
  systemInstruction?: string;
  history: Message[];
  message: string;
  useThinking?: boolean;
}

export const streamGeminiResponse = async (
  options: StreamOptions,
  onChunk: (text: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) => {
  const { 
    model = GEMINI_MODEL_FLASH, 
    systemInstruction, 
    history, 
    message,
    useThinking = false
  } = options;

  try {
    const ai = getClient();
    
    // Transform history to Gemini format (excluding system messages which go into config)
    const chatHistory = history
      .filter(m => m.role !== Role.SYSTEM)
      .map(m => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

    const chat = ai.chats.create({
      model: model,
      history: chatHistory,
      config: {
        systemInstruction: systemInstruction,
        // If thinking is requested and supported by the model (Gemini 3 series)
        thinkingConfig: useThinking ? { thinkingBudget: 1024 } : undefined, 
      },
    });

    const result = await chat.sendMessageStream({
      message: message
    });

    for await (const chunk of result) {
       // Type assertion based on SDK guidance
       const responseChunk = chunk as GenerateContentResponse;
       const text = responseChunk.text;
       if (text) {
         onChunk(text);
       }
    }

    onComplete();

  } catch (error) {
    console.error("Gemini API Error:", error);
    onError(error instanceof Error ? error : new Error("Unknown Gemini error"));
  }
};
