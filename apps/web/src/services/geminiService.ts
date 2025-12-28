import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Role } from '../types';
import { GEMINI_MODEL_FLASH } from '../constants/templates';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }
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
        thinkingConfig: useThinking ? { thinkingBudget: 1024 } : undefined, 
      },
    });

    const result = await chat.sendMessageStream({
      message: message
    });

    for await (const chunk of result) {
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
