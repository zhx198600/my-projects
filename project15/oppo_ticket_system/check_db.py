import sqlite3
import json
import os

db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

lines = []
lines.append('=' * 60)
lines.append('工单类型自定义字段配置验证 (直接读取数据库)')
lines.append('=' * 60)

cursor.execute("SELECT id, name, code FROM tickets_tickettype ORDER BY id")
ticket_types = cursor.fetchall()

field_type_counts = {'input': 0, 'select': 0, 'textarea': 0}
total_fields = 0
select_fields_with_options = 0

lines.append('')
lines.append('【各工单类型的自定义字段统计】')
lines.append('-' * 60)

for tt in ticket_types:
    tt_id, tt_name, tt_code = tt
    
    cursor.execute("""
        SELECT field_name, field_code, field_type, is_required, options, sort_order 
        FROM tickets_customfield 
        WHERE ticket_type_id = ? 
        ORDER BY sort_order
    """, [tt_id])
    fields = cursor.fetchall()
    
    total_fields += len(fields)
    
    lines.append('')
    lines.append(f'工单类型: {tt_name} ({tt_code})')
    lines.append(f'  自定义字段数量: {len(fields)}')
    
    if fields:
        lines.append(f'  字段列表:')
        for field in fields:
            field_name, field_code, field_type, is_required, options, sort_order = field
            field_type_counts[field_type] += 1
            options_str = ''
            
            if field_type == 'select':
                if options:
                    try:
                        opts = json.loads(options)
                        if isinstance(opts, list) and len(opts) > 0:
                            select_fields_with_options += 1
                            options_str = f' [选项: {opts}]'
                    except json.JSONDecodeError:
                        options_str = f' [选项: JSON解析错误]'
                else:
                    options_str = f' [选项: 无]'
            
            required_mark = '*' if is_required else ''
            lines.append(
                f'    {sort_order}. {field_name} ({field_code}) '
                f'[{field_type}]{required_mark}{options_str}'
            )

lines.append('')
lines.append('=' * 60)
lines.append('【验证结果】')
lines.append('-' * 60)

lines.append('')
lines.append(f'1. 工单类型总数: {len(ticket_types)} 种')

all_have_fields = True
for tt in ticket_types:
    tt_id = tt[0]
    cursor.execute("SELECT COUNT(*) FROM tickets_customfield WHERE ticket_type_id = ?", [tt_id])
    count = cursor.fetchone()[0]
    if count == 0:
        all_have_fields = False
        break

status = '✓ 通过' if all_have_fields else '✗ 失败'
lines.append(f'   每种工单类型至少有1个自定义字段: {status}')

lines.append('')
lines.append(f'2. 自定义字段总数: {total_fields} 个')
lines.append(f'   控件类型分布:')
lines.append(f'     - input (输入框): {field_type_counts["input"]} 个')
lines.append(f'     - select (下拉框): {field_type_counts["select"]} 个')
lines.append(f'     - textarea (文本域): {field_type_counts["textarea"]} 个')

all_types_used = (
    field_type_counts['input'] > 0 and
    field_type_counts['select'] > 0 and
    field_type_counts['textarea'] > 0
)
status = '✓ 通过' if all_types_used else '✗ 失败'
lines.append(f'   三种控件类型都被使用: {status}')

lines.append('')
lines.append(f'3. 下拉框(select)类型字段验证:')
lines.append(f'   select 字段总数: {field_type_counts["select"]} 个')
lines.append(f'   有配置选项值的 select 字段: {select_fields_with_options} 个')
status = '✓ 通过' if select_fields_with_options == field_type_counts['select'] else '✗ 失败'
lines.append(f'   所有下拉框都有配置选项值: {status}')

lines.append('')
lines.append('=' * 60)
overall_pass = all_have_fields and all_types_used and (
    select_fields_with_options == field_type_counts['select']
)
status = '✓ 全部通过' if overall_pass else '✗ 存在问题'
lines.append(f'整体验证结果: {status}')
lines.append('=' * 60)

conn.close()

result = '\n'.join(lines)
print(result)

with open('db_verification_result.txt', 'w', encoding='utf-8') as f:
    f.write(result)
print('\n结果已保存到 db_verification_result.txt')
