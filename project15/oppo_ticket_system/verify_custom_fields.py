import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oppo_ticket_system.settings')
django.setup()

from tickets.models import TicketType, CustomField

print('=' * 60)
print('工单类型自定义字段配置验证')
print('=' * 60)

ticket_types = TicketType.objects.all().order_by('id')
field_type_counts = {'input': 0, 'select': 0, 'textarea': 0}
total_fields = 0
select_fields_with_options = 0

print('\n【各工单类型的自定义字段统计】')
print('-' * 60)

for ticket_type in ticket_types:
    fields = ticket_type.custom_fields.all().order_by('sort_order')
    total_fields += len(fields)
    
    print(f'\n工单类型: {ticket_type.name} ({ticket_type.code})')
    print(f'  自定义字段数量: {len(fields)}')
    
    if fields:
        print(f'  字段列表:')
        for field in fields:
            field_type_counts[field.field_type] += 1
            has_options = False
            options_str = ''
            
            if field.field_type == 'select':
                if field.options:
                    try:
                        options = json.loads(field.options)
                        if isinstance(options, list) and len(options) > 0:
                            has_options = True
                            select_fields_with_options += 1
                            options_str = f' [选项: {options}]'
                    except json.JSONDecodeError:
                        options_str = f' [选项: JSON解析错误]'
                else:
                    options_str = f' [选项: 无]'
            
            required_mark = '*' if field.is_required else ''
            print(f'    {field.sort_order}. {field.field_name} ({field.field_code}) [{field.field_type}]{required_mark}{options_str}')

print('\n' + '=' * 60)
print('【验证结果】')
print('-' * 60)

print(f'\n1. 工单类型总数: {ticket_types.count()} 种')
print(f'   每种工单类型至少有1个自定义字段: ', end='')
all_have_fields = all(tt.custom_fields.count() > 0 for tt in ticket_types)
print('✓ 通过' if all_have_fields else '✗ 失败')

print(f'\n2. 自定义字段总数: {total_fields} 个')
print(f'   控件类型分布:')
print(f'     - input (输入框): {field_type_counts["input"]} 个')
print(f'     - select (下拉框): {field_type_counts["select"]} 个')
print(f'     - textarea (文本域): {field_type_counts["textarea"]} 个')

all_types_used = (field_type_counts['input'] > 0 and 
                  field_type_counts['select'] > 0 and 
                  field_type_counts['textarea'] > 0)
print(f'   三种控件类型都被使用: ', end='')
print('✓ 通过' if all_types_used else '✗ 失败')

print(f'\n3. 下拉框(select)类型字段验证:')
print(f'   select 字段总数: {field_type_counts["select"]} 个')
print(f'   有配置选项值的 select 字段: {select_fields_with_options} 个')
print(f'   所有下拉框都有配置选项值: ', end='')
print('✓ 通过' if select_fields_with_options == field_type_counts['select'] else '✗ 失败')

print('\n' + '=' * 60)
overall_pass = all_have_fields and all_types_used and (select_fields_with_options == field_type_counts['select'])
print(f'整体验证结果: {"✓ 全部通过" if overall_pass else "✗ 存在问题"}')
print('=' * 60)
