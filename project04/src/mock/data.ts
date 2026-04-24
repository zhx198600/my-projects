import { v4 as uuidv4 } from 'uuid';
import type { User, Order, Logistics, OrderStatus, LogisticsStatus } from '@/types';

const orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
const logisticsStatuses: LogisticsStatus[] = ['preparing', 'shipped', 'in_transit', 'delivered'];

const customerNames = [
  '张三', '李四', '王五', '赵六', 'John Smith', 'Mary Johnson',
  '陈七', '刘八', 'David Brown', 'Sarah Wilson',
  '周九', '吴十', 'Michael Davis', 'Lisa Anderson',
  '郑十一', '冯十二', 'James Taylor', 'Emma Thomas',
  '褚十三', '卫十四'
];

const productNames = [
  'MacBook Pro 14寸', 'iPhone 16 Pro', 'AirPods Pro 2',
  'iPad Air', 'Apple Watch Series 10', 'Magic Keyboard',
  'Sony WH-1000XM5', 'Samsung Galaxy S25', 'Dell XPS 15',
  'Logitech MX Master 3', '小米15 Ultra', '华为Mate 70 Pro'
];

const addresses = [
  '北京市朝阳区建国路88号', '上海市浦东新区陆家嘴环路1000号',
  '广州市天河区珠江新城', '深圳市南山区科技园',
  '杭州市西湖区文三路', '成都市武侯区天府大道',
  '武汉市江汉区解放大道', '南京市鼓楼区中山路',
  '西安市雁塔区高新路', '重庆市渝中区解放碑'
];

function generateDate(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

function generateOrderNo(index: number): string {
  const dateStr = '20260423';
  const numStr = String(index).padStart(5, '0');
  return `ORD-${dateStr}-${numStr}`;
}

function generateTrackingNo(): string {
  const randomNum = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `SF${randomNum}`;
}

export const mockUsers: User[] = [
  {
    id: uuidv4(),
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    lastLoginAt: generateDate(0),
    createdAt: generateDate(30)
  },
  {
    id: uuidv4(),
    username: 'user',
    password: 'user123',
    role: 'user',
    status: 'active',
    lastLoginAt: generateDate(1),
    createdAt: generateDate(25)
  },
  {
    id: uuidv4(),
    username: 'operator1',
    password: 'pass123',
    role: 'user',
    status: 'active',
    lastLoginAt: generateDate(2),
    createdAt: generateDate(20)
  },
  {
    id: uuidv4(),
    username: 'operator2',
    password: 'pass123',
    role: 'user',
    status: 'disabled',
    lastLoginAt: generateDate(10),
    createdAt: generateDate(15)
  },
  {
    id: uuidv4(),
    username: 'manager',
    password: 'pass123',
    role: 'admin',
    status: 'active',
    lastLoginAt: generateDate(0),
    createdAt: generateDate(35)
  }
];

function generateOrderItems(): Order[] {
  const orders: Order[] = [];
  let orderIndex = 1;

  for (let customerIndex = 0; customerIndex < customerNames.length; customerIndex++) {
    const statusIndex = customerIndex % orderStatuses.length;
    const status = orderStatuses[statusIndex];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const items: any[] = [];
    let totalAmount = 0;

    for (let j = 0; j < itemCount; j++) {
      const productName = productNames[Math.floor(Math.random() * productNames.length)];
      const price = Math.floor(Math.random() * 10000) + 100;
      const quantity = Math.floor(Math.random() * 3) + 1;
      items.push({
        id: uuidv4(),
        name: productName,
        quantity,
        price,
        image: undefined
      });
      totalAmount += price * quantity;
    }

    const daysAgo = Math.floor(Math.random() * 30);
    orders.push({
      id: uuidv4(),
      orderNo: generateOrderNo(orderIndex),
      customerName: customerNames[customerIndex],
      customerPhone: `1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      customerAddress: addresses[Math.floor(Math.random() * addresses.length)],
      totalAmount,
      status,
      items,
      createdAt: generateDate(daysAgo + 5),
      updatedAt: generateDate(daysAgo),
      notes: Math.random() > 0.5 ? '客户备注：请尽快发货' : undefined
    });

    orderIndex++;
  }

  return orders;
}

export const mockOrders: Order[] = generateOrderItems();

function generateLogistics(): Logistics[] {
  const logisticsList: Logistics[] = [];
  const shippedOrders = mockOrders.filter(o => o.status === 'shipped' || o.status === 'completed');

  for (let i = 0; i < Math.min(10, shippedOrders.length); i++) {
    const order = shippedOrders[i];
    const statusIndex = i % logisticsStatuses.length;
    const status = logisticsStatuses[statusIndex];
    const history: any[] = [];

    if (status !== 'preparing') {
      history.push({
        status: 'preparing',
        location: '仓库',
        time: generateDate(3)
      });
    }
    if (status === 'in_transit' || status === 'delivered') {
      history.push({
        status: 'shipped',
        location: '上海转运中心',
        time: generateDate(2)
      });
    }
    if (status === 'delivered') {
      history.push({
        status: 'in_transit',
        location: '北京分拣中心',
        time: generateDate(1)
      });
    }

    logisticsList.push({
      id: uuidv4(),
      trackingNo: generateTrackingNo(),
      orderId: order.id,
      orderNo: order.orderNo,
      status,
      currentLocation: status === 'delivered' ? order.customerAddress : 
                       status === 'in_transit' ? '北京市海淀区中转站' :
                       status === 'shipped' ? '上海转运中心' : '仓库',
      estimatedDelivery: generateDate(-3),
      updatedAt: generateDate(0),
      history: history.length > 0 ? history : undefined
    });
  }

  return logisticsList;
}

export const mockLogistics: Logistics[] = generateLogistics();
