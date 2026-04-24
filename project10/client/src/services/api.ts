import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

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

export interface Session {
  id: string;
  username: string;
  created_at: string;
  status: string;
  message_count?: number;
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

export const knowledgeApi = {
  async getList(search?: string): Promise<Knowledge[]> {
    const params = search ? { search } : {};
    const response = await api.get('/knowledge', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<Knowledge> {
    const response = await api.get(`/knowledge/${id}`);
    return response.data.data;
  },

  async create(data: CreateKnowledgeRequest): Promise<Knowledge> {
    const response = await api.post('/knowledge', data);
    return response.data.data;
  },

  async update(id: number, data: UpdateKnowledgeRequest): Promise<Knowledge> {
    const response = await api.put(`/knowledge/${id}`, data);
    return response.data.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/knowledge/${id}`);
  },
};

export const sessionApi = {
  async getList(status?: string): Promise<Session[]> {
    const params = status ? { status } : {};
    const response = await api.get('/sessions', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<Session> {
    const response = await api.get(`/sessions/${id}`);
    return response.data.data;
  },

  async create(data: CreateSessionRequest): Promise<Session> {
    const response = await api.post('/sessions', data);
    return response.data.data;
  },

  async getMessages(sessionId: string): Promise<Message[]> {
    const response = await api.get(`/sessions/${sessionId}/messages`);
    return response.data.data;
  },

  async addMessage(sessionId: string, data: CreateMessageRequest): Promise<Message> {
    const response = await api.post(`/sessions/${sessionId}/messages`, data);
    return response.data.data;
  },
};

export default api;
