export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface UserStats {
  borrowed: number;
  returned: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description: string;
  stock: number;
  cover: string;
  created_at: string;
}

export interface BorrowRecord {
  id: number;
  user_id: number;
  book_id: number;
  book?: {
    title: string;
    author: string;
    cover: string;
  };
  user?: {
    username: string;
    email: string;
  };
  borrow_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface BooksResponse {
  books: Book[];
  total: number;
  page: number;
  limit: number;
}
