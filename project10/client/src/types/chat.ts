export interface Message {
  id: string | number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface ChatMessageEvent {
  id: number;
  sessionId: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
