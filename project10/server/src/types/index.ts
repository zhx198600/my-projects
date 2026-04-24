export interface Knowledge {
  id: number;
  question: string;
  keywords: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeRequest {
  question: string;
  keywords: string;
  answer: string;
}

export interface UpdateKnowledgeRequest {
  question?: string;
  keywords?: string;
  answer?: string;
}

export interface MatchResult {
  knowledgeId: number;
  question: string;
  answer: string;
  matchScore: number;
  matchedKeywords: string[];
}

export interface IntentService {
  match(message: string): MatchResult | null;
  getDefaultReply(): string;
}

export interface ProcessMessageResult {
  answer: string;
  isFallback: boolean;
  matchResult?: MatchResult;
}

export interface Session {
  id: string;
  username: string;
  created_at: string;
  status: string;
}

export interface Message {
  id: number;
  session_id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface CreateSessionRequest {
  username: string;
}

export interface CreateMessageRequest {
  message: string;
  sender: 'user' | 'bot';
}

export interface JoinEvent {
  sessionId: string;
  username: string;
}

export interface ChatMessageEvent {
  sessionId: string;
  message: string;
}

export interface JoinedEvent {
  sessionId: string;
  username: string;
  welcomeMessage: string;
}

export interface ChatMessageResponse {
  id: number;
  sessionId: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface TypingEvent {
  isTyping: boolean;
}
