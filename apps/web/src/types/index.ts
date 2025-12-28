export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isThinking?: boolean;
  citations?: Citation[];
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  snippet: string;
  source: 'RAGFlow' | 'GoogleSearch' | 'KnowledgeBase';
}

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemInstruction: string;
  capabilities: {
    rag: boolean;
    webSearch: boolean;
    reasoning: boolean;
    coding: boolean;
  };
  suggestedPrompts: string[];
}

export enum AppState {
  TEMPLATE_SELECTION = 'TEMPLATE_SELECTION',
  CHAT_SESSION = 'CHAT_SESSION'
}

export interface ChatSession {
  id: string;
  title: string;
  templateId: string;
  updatedAt: number;
}
