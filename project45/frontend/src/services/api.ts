import axios from 'axios';
import type { Book, BorrowRecord, User, LoginResponse, LoginData, RegisterData, BooksResponse, UserStats } from '../types';
import { showToastGlobal } from '../components/Toast';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showToastGlobal('登录已过期，请重新登录', 'warning');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      showToastGlobal(error.response.data?.message || '权限不足', 'error');
    } else if (error.response?.status === 404) {
      showToastGlobal(error.response.data?.message || '请求的资源不存在', 'error');
    } else if (error.response?.status === 400) {
      showToastGlobal(error.response.data?.message || '请求参数错误', 'error');
    } else if (error.response?.status >= 500) {
      showToastGlobal(error.response.data?.message || '服务器错误，请稍后重试', 'error');
    } else if (!error.response) {
      showToastGlobal('网络错误，请检查网络连接', 'error');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data: LoginData) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterData) => api.post<User>('/auth/register', data),
};

export const booksAPI = {
  getBooks: (page: number = 1, limit: number = 10) => api.get<BooksResponse>('/books', { params: { page, limit } }),
  getBook: (id: number) => api.get<Book>(`/books/${id}`),
  createBook: (data: Omit<Book, 'id' | 'created_at'>) => api.post<Book>('/books', data),
  updateBook: (id: number, data: Partial<Book>) => api.put<Book>(`/books/${id}`, data),
  deleteBook: (id: number) => api.delete(`/books/${id}`),
};

export const borrowAPI = {
  getBorrowRecords: () => api.get<BorrowRecord[]>('/borrow-records'),
  borrowBook: (bookId: number) => api.post<BorrowRecord>(`/borrow/${bookId}`),
  returnBook: (bookId: number) => api.post<BorrowRecord>(`/return/${bookId}`),
  checkBorrowStatus: (bookId: number) => api.get<{ borrowed: boolean; recordId?: number }>(`/status/${bookId}`),
};

export const usersAPI = {
  getUsers: () => api.get<User[]>('/users'),
  getCurrentUser: () => api.get<User>('/users/me'),
  getUserStats: () => api.get<UserStats>('/users/me/stats'),
  getUser: (id: number) => api.get<User>(`/users/${id}`),
  updateUser: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
};

export default api;
