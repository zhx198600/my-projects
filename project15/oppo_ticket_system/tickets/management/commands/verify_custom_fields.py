import json
from django.core.management.base import BaseCommand
from tickets.models import TicketType, CustomField


class Command(BaseCommand):
    help = '验证自定义字段配置数据'

    def handle(self, *args, **options):
        self.stdout.write('=' * 60)
        self.stdout.write('工单类型自定义字段配置验证')
        self.stdout.write('=' * 60)

        ticket_types = TicketType.objects.all().order_by('id')
        field_type_counts = {'input': 0, 'select': 0, 'textarea': 0}
        total_fields = 0
        select_fields_with_options = 0

        self.stdout.write('')
        self.stdout.write('【各工单类型的自定义字段统计】')
        self.stdout.write('-' * 60)

        for ticket_type in ticket_types:
            fields = ticket_type.custom_fields.all().order_by('sort_order')
            total_fields += len(fields)

            self.stdout.write('')
            self.stdout.write(f'工单类型: {ticket_type.name} ({ticket_type.code})')
            self.stdout.write(f'  自定义字段数量: {len(fields)}')

            if fields:
                self.stdout.write(f'  字段列表:')
                for field in fields:
                    field_type_counts[field.field_type] += 1
                    options_str = ''

                    if field.field_type == 'select':
                        if field.options:
                            try:
                                options = json.loads(field.options)
                                if isinstance(options, list) and len(options) > 0:
                                    select_fields_with_options += 1
                                    options_str = f' [选项: {options}]'
                            except json.JSONDecodeError:
                                options_str = f' [选项: JSON解析错误]'
                        else:
                            options_str = f' [选项: 无]'

                    required_mark = '*' if field.is_required else ''
                    self.stdout.write(
                        f'    {field.sort_order}. {field.field_name} ({field.field_code}) '
                        f'[{field.field_type}]{required_mark}{options_str}'
                    )

        self.stdout.write('')
        self.stdout.write('=' * 60)
        self.stdout.write('【验证结果】')
        self.stdout.write('-' * 60)

        self.stdout.write('')
        self.stdout.write(f'1. 工单类型总数: {ticket_types.count()} 种')
        all_have_fields = all(tt.custom_fields.count() > 0 for tt in ticket_types)
        status = '✓ 通过' if all_have_fields else '✗ 失败'
        self.stdout.write(f'   每种工单类型至少有1个自定义字段: {status}')

        self.stdout.write('')
        self.stdout.write(f'2. 自定义字段总数: {total_fields} 个')
        self.stdout.write(f'   控件类型分布:')
        self.stdout.write(f'     - input (输入框): {field_type_counts["input"]} 个')
        self.stdout.write(f'     - select (下拉框): {field_type_counts["select"]} 个')
        self.stdout.write(f'     - textarea (文本域): {field_type_counts["textarea"]} 个')

        all_types_used = (
            field_type_counts['input'] > 0 and
            field_type_counts['select'] > 0 and
            field_type_counts['textarea'] > 0
        )
        status = '✓ 通过' if all_types_used else '✗ 失败'
        self.stdout.write(f'   三种控件类型都被使用: {status}')

        self.stdout.write('')
        self.stdout.write(f'3. 下拉框(select)类型字段验证:')
        self.stdout.write(f'   select 字段总数: {field_type_counts["select"]} 个')
        self.stdout.write(f'   有配置选项值的 select 字段: {select_fields_with_options} 个')
        status = '✓ 通过' if select_fields_with_options == field_type_counts['select'] else '✗ 失败'
        self.stdout.write(f'   所有下拉框都有配置选项值: {status}')

        self.stdout.write('')
        self.stdout.write('=' * 60)
        overall_pass = all_have_fields and all_types_used and (
            select_fields_with_options == field_type_counts['select']
        )
        status = '✓ 全部通过' if overall_pass else '✗ 存在问题'
        self.stdout.write(f'整体验证结果: {status}')
        self.stdout.write('=' * 60)
