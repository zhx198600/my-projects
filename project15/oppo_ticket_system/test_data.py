import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oppo_ticket_system.settings')
django.setup()

from tickets.models import Ticket, TicketType

def create_test_tickets():
    ticket_types = list(TicketType.objects.all())
    if not ticket_types:
        print("没有找到工单类型数据")
        return
    
    test_data = [
        {
            'user_name': '张三',
            'user_phone': '13800138001',
            'user_email': 'zhangsan@example.com',
            'source': 'phone',
            'status': 'pending',
            'priority': 'high',
            'receiver': '管理员A',
            'handler': '技术支持B',
            'handle_department': '技术部',
        },
        {
            'user_name': '李四',
            'user_phone': '13800138002',
            'user_email': 'lisi@example.com',
            'source': 'website',
            'status': 'processing',
            'priority': 'medium',
            'receiver': '管理员A',
            'handler': '客服C',
            'handle_department': '客服部',
        },
        {
            'user_name': '王五',
            'user_phone': '13800138003',
            'user_email': '',
            'source': 'app',
            'status': 'resolved',
            'priority': 'low',
            'receiver': '管理员B',
            'handler': '技术支持D',
            'handle_department': '技术部',
        },
        {
            'user_name': '赵六',
            'user_phone': '13800138004',
            'user_email': 'zhaoliu@example.com',
            'source': 'wechat',
            'status': 'pending',
            'priority': 'urgent',
            'receiver': '管理员B',
            'handler': '',
            'handle_department': '',
        },
        {
            'user_name': '钱七',
            'user_phone': '13800138005',
            'user_email': '',
            'source': 'offline',
            'status': 'closed',
            'priority': 'medium',
            'receiver': '管理员A',
            'handler': '技术支持B',
            'handle_department': '技术部',
        },
    ]
    
    for i, data in enumerate(test_data):
        ticket_type = ticket_types[i % len(ticket_types)]
        ticket = Ticket.objects.create(
            ticket_type=ticket_type,
            **data
        )
        print(f"创建工单: {ticket.ticket_no} - {ticket.user_name} ({ticket.ticket_type.name})")
    
    print(f"\n共创建 {len(test_data)} 条测试工单")

if __name__ == '__main__':
    create_test_tickets()
