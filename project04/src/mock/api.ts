import { mockUsers, mockOrders, mockLogistics } from './data';
import type { User, Order, Logistics, OrderStatus, UserStatus } from '@/types';

async function delay(ms: number = Math.floor(Math.random() * 300) + 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const userApi = {
  async login(username: string, password: string): Promise<User> {
    await delay();
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('用户名或密码错误');
    }
    return { ...user, password: '' };
  },

  async getUsers(): Promise<User[]> {
    await delay();
    return mockUsers.map(u => ({ ...u, password: '' }));
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    await delay();
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('用户不存在');
    }
    mockUsers[userIndex].status = status;
    return { ...mockUsers[userIndex], password: '' };
  }
};

export const orderApi = {
  async getOrders(): Promise<Order[]> {
    await delay();
    return [...mockOrders];
  },

  async getOrderById(id: string): Promise<Order | null> {
    await delay();
    const order = mockOrders.find(o => o.id === id);
    return order ? { ...order } : null;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    await delay();
    const orderIndex = mockOrders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      throw new Error('订单不存在');
    }
    mockOrders[orderIndex].status = status;
    mockOrders[orderIndex].updatedAt = new Date().toISOString();
    return { ...mockOrders[orderIndex] };
  }
};

export const logisticsApi = {
  async getLogistics(): Promise<Logistics[]> {
    await delay();
    return [...mockLogistics];
  },

  async getLogisticsById(id: string): Promise<Logistics | null> {
    await delay();
    const logistics = mockLogistics.find(l => l.id === id);
    return logistics ? { ...logistics } : null;
  },

  async getLogisticsByOrderId(orderId: string): Promise<Logistics | null> {
    await delay();
    const logistics = mockLogistics.find(l => l.orderId === orderId);
    return logistics ? { ...logistics } : null;
  }
};

export { delay };
