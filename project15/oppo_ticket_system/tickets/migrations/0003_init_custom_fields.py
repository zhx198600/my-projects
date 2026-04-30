import json
from django.db import migrations


def init_custom_fields(apps, schema_editor):
    TicketType = apps.get_model('tickets', 'TicketType')
    CustomField = apps.get_model('tickets', 'CustomField')

    custom_fields_config = [
        {
            'ticket_type_code': 'COMPLAINT',
            'fields': [
                {
                    'field_name': '投诉内容',
                    'field_code': 'complaint_content',
                    'field_type': 'textarea',
                    'is_required': True,
                    'options': None,
                    'sort_order': 1,
                },
                {
                    'field_name': '投诉产品',
                    'field_code': 'complaint_product',
                    'field_type': 'select',
                    'is_required': True,
                    'options': json.dumps(['手机', '耳机', '手表', '平板', '其他']),
                    'sort_order': 2,
                },
                {
                    'field_name': '投诉详情',
                    'field_code': 'complaint_detail',
                    'field_type': 'textarea',
                    'is_required': False,
                    'options': None,
                    'sort_order': 3,
                },
            ]
        },
        {
            'ticket_type_code': 'REPAIR',
            'fields': [
                {
                    'field_name': '故障现象',
                    'field_code': 'fault_description',
                    'field_type': 'textarea',
                    'is_required': True,
                    'options': None,
                    'sort_order': 1,
                },
                {
                    'field_name': '产品型号',
                    'field_code': 'product_model',
                    'field_type': 'input',
                    'is_required': True,
                    'options': None,
                    'sort_order': 2,
                },
                {
                    'field_name': '购买日期',
                    'field_code': 'purchase_date',
                    'field_type': 'input',
                    'is_required': False,
                    'options': None,
                    'sort_order': 3,
                },
                {
                    'field_name': '购买渠道',
                    'field_code': 'purchase_channel',
                    'field_type': 'select',
                    'is_required': False,
                    'options': json.dumps(['官网', '京东', '天猫', '线下门店', '其他']),
                    'sort_order': 4,
                },
            ]
        },
        {
            'ticket_type_code': 'SUGGESTION',
            'fields': [
                {
                    'field_name': '建议内容',
                    'field_code': 'suggestion_content',
                    'field_type': 'textarea',
                    'is_required': True,
                    'options': None,
                    'sort_order': 1,
                },
                {
                    'field_name': '建议类别',
                    'field_code': 'suggestion_category',
                    'field_type': 'select',
                    'is_required': False,
                    'options': json.dumps(['产品功能', '用户体验', '售后服务', '其他']),
                    'sort_order': 2,
                },
            ]
        },
        {
            'ticket_type_code': 'REPORT_ISSUE',
            'fields': [
                {
                    'field_name': '报表名称',
                    'field_code': 'report_name',
                    'field_type': 'input',
                    'is_required': True,
                    'options': None,
                    'sort_order': 1,
                },
                {
                    'field_name': '问题描述',
                    'field_code': 'issue_description',
                    'field_type': 'textarea',
                    'is_required': True,
                    'options': None,
                    'sort_order': 2,
                },
                {
                    'field_name': '报表模块',
                    'field_code': 'report_module',
                    'field_type': 'select',
                    'is_required': False,
                    'options': json.dumps(['销售报表', '库存报表', '财务报表', '用户报表', '其他']),
                    'sort_order': 3,
                },
            ]
        },
        {
            'ticket_type_code': 'PLATFORM_ERROR',
            'fields': [
                {
                    'field_name': '功能模块',
                    'field_code': 'function_module',
                    'field_type': 'select',
                    'is_required': True,
                    'options': json.dumps(['登录注册', '订单管理', '用户管理', '支付模块', '消息通知', '其他']),
                    'sort_order': 1,
                },
                {
                    'field_name': '异常描述',
                    'field_code': 'error_description',
                    'field_type': 'textarea',
                    'is_required': True,
                    'options': None,
                    'sort_order': 2,
                },
                {
                    'field_name': '复现步骤',
                    'field_code': 'reproduce_steps',
                    'field_type': 'textarea',
                    'is_required': False,
                    'options': None,
                    'sort_order': 3,
                },
            ]
        },
        {
            'ticket_type_code': 'INSPECTION',
            'fields': [
                {
                    'field_name': '检测项目',
                    'field_code': 'inspection_item',
                    'field_type': 'select',
                    'is_required': True,
                    'options': json.dumps(['硬件检测', '软件检测', '电池检测', '屏幕检测', '全面检测']),
                    'sort_order': 1,
                },
                {
                    'field_name': '检测要求',
                    'field_code': 'inspection_requirement',
                    'field_type': 'textarea',
                    'is_required': True,
                    'options': None,
                    'sort_order': 2,
                },
                {
                    'field_name': '设备信息',
                    'field_code': 'device_info',
                    'field_type': 'input',
                    'is_required': False,
                    'options': None,
                    'sort_order': 3,
                },
            ]
        },
        {
            'ticket_type_code': 'APPOINTMENT',
            'fields': [
                {
                    'field_name': '预约时间',
                    'field_code': 'appointment_time',
                    'field_type': 'input',
                    'is_required': True,
                    'options': None,
                    'sort_order': 1,
                },
                {
                    'field_name': '服务地址',
                    'field_code': 'service_address',
                    'field_type': 'textarea',
                    'is_required': True,
                    'options': None,
                    'sort_order': 2,
                },
                {
                    'field_name': '联系人',
                    'field_code': 'contact_person',
                    'field_type': 'input',
                    'is_required': False,
                    'options': None,
                    'sort_order': 3,
                },
                {
                    'field_name': '服务类型',
                    'field_code': 'service_type',
                    'field_type': 'select',
                    'is_required': False,
                    'options': json.dumps(['安装服务', '维修服务', '检测服务', '其他']),
                    'sort_order': 4,
                },
            ]
        },
    ]

    for config in custom_fields_config:
        ticket_type = TicketType.objects.get(code=config['ticket_type_code'])
        for field_config in config['fields']:
            CustomField.objects.get_or_create(
                ticket_type=ticket_type,
                field_code=field_config['field_code'],
                defaults={
                    'field_name': field_config['field_name'],
                    'field_type': field_config['field_type'],
                    'is_required': field_config['is_required'],
                    'options': field_config['options'],
                    'sort_order': field_config['sort_order'],
                    'is_active': True,
                }
            )


def reverse_init_custom_fields(apps, schema_editor):
    TicketType = apps.get_model('tickets', 'TicketType')
    CustomField = apps.get_model('tickets', 'CustomField')

    codes = ['COMPLAINT', 'REPAIR', 'SUGGESTION', 'REPORT_ISSUE',
             'PLATFORM_ERROR', 'INSPECTION', 'APPOINTMENT']

    ticket_types = TicketType.objects.filter(code__in=codes)
    CustomField.objects.filter(ticket_type__in=ticket_types).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('tickets', '0002_auto_20260427_2103'),
    ]

    operations = [
        migrations.RunPython(init_custom_fields, reverse_init_custom_fields),
    ]
