import { db } from '../db';
import { intentService } from './intentService';
import { Message, Session } from '../types';

class ChatService {
  public async getOrCreateSession(sessionId: string, username: string): Promise<Session> {
    let session = db.get<Session>('SELECT * FROM session WHERE id = ?', [sessionId]);
    
    if (!session) {
      db.run(
        'INSERT INTO session (id, username, status) VALUES (?, ?, ?)',
        [sessionId, username, 'active']
      );
      session = db.get<Session>('SELECT * FROM session WHERE id = ?', [sessionId])!;
    }
    
    return session;
  }

  public saveMessage(sessionId: string, message: string, sender: 'user' | 'bot'): Message {
    const result = db.run(
      'INSERT INTO conversation (session_id, message, sender) VALUES (?, ?, ?)',
      [sessionId, message, sender]
    );
    
    const messageId = result.lastInsertRowid as number;
    return db.get<Message>('SELECT * FROM conversation WHERE id = ?', [messageId])!;
  }

  public processUserMessage(sessionId: string, userMessage: string): { 
    userMessage: Message;
    botMessage: Message;
  } {
    const savedUserMessage = this.saveMessage(sessionId, userMessage, 'user');
    
    const result = intentService.processMessage(userMessage);
    
    const savedBotMessage = this.saveMessage(sessionId, result.answer, 'bot');
    
    return {
      userMessage: savedUserMessage,
      botMessage: savedBotMessage
    };
  }

  public getWelcomeMessage(username: string): string {
    return `您好，${username}！欢迎咨询，请问有什么可以帮助您的？`;
  }
}

export const chatService = new ChatService();
