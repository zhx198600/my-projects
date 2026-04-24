export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export type LogisticsStatus = 'preparing' | 'shipped' | 'in_transit' | 'delivered';

export type UserRole = 'admin' | 'user';

export type UserStatus = 'active' | 'disabled';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | string;
  createdAt: Date | string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
  notes?: string;
}

export interface LogisticsHistoryItem {
  status: LogisticsStatus;
  location: string;
  time: Date | string;
}

export interface Logistics {
  id: string;
  trackingNo: string;
  orderId: string;
  orderNo: string;
  status: LogisticsStatus;
  currentLocation: string;
  estimatedDelivery: Date | string;
  updatedAt: Date | string;
  history?: LogisticsHistoryItem[];
}
