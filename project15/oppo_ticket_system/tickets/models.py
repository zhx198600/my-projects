from django.db import models
from django.utils import timezone


class TicketType(models.Model):
    name = models.CharField('类型名称', max_length=50, unique=True)
    code = models.CharField('类型代码', max_length=50, unique=True)
    description = models.TextField('描述', blank=True, null=True)
    is_active = models.BooleanField('是否启用', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '工单类型'
        verbose_name_plural = '工单类型'
        ordering = ['id']

    def __str__(self):
        return self.name


class CustomField(models.Model):
    FIELD_TYPE_CHOICES = [
        ('input', '输入框'),
        ('select', '下拉框'),
        ('textarea', '文本域'),
    ]

    ticket_type = models.ForeignKey(
        TicketType,
        on_delete=models.CASCADE,
        related_name='custom_fields',
        verbose_name='工单类型'
    )
    field_name = models.CharField('字段显示名称', max_length=100)
    field_code = models.CharField('字段代码', max_length=100)
    field_type = models.CharField('控件类型', max_length=20, choices=FIELD_TYPE_CHOICES, default='input')
    is_required = models.BooleanField('是否必填', default=False)
    options = models.TextField('选项值', blank=True, null=True)
    placeholder = models.CharField('占位符提示', max_length=200, blank=True, null=True)
    sort_order = models.IntegerField('排序顺序', default=0)
    is_active = models.BooleanField('是否启用', default=True)
    
    dependent_field = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='dependent_fields',
        verbose_name='前置依赖字段'
    )
    dependent_value = models.CharField('依赖选项值', max_length=200, blank=True, null=True)
    
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '自定义字段配置'
        verbose_name_plural = '自定义字段配置'
        ordering = ['sort_order', 'id']
        unique_together = ['ticket_type', 'field_code']

    def __str__(self):
        return f'{self.ticket_type.name} - {self.field_name}'


class Ticket(models.Model):
    SOURCE_CHOICES = [
        ('phone', '电话'),
        ('website', '网站'),
        ('app', 'APP'),
        ('wechat', '微信'),
        ('offline', '线下'),
    ]

    STATUS_CHOICES = [
        ('pending', '待受理'),
        ('processing', '处理中'),
        ('resolved', '已解决'),
        ('closed', '已关闭'),
    ]

    PRIORITY_CHOICES = [
        ('low', '低'),
        ('medium', '中'),
        ('high', '高'),
        ('urgent', '紧急'),
    ]

    DEPARTMENT_CHOICES = [
        ('技术部', '技术部'),
        ('客服部', '客服部'),
        ('销售部', '销售部'),
        ('市场部', '市场部'),
        ('运维部', '运维部'),
        ('财务部', '财务部'),
        ('人事部', '人事部'),
        ('产品部', '产品部'),
        ('其他', '其他'),
    ]

    ticket_no = models.CharField('工单编号', max_length=50, unique=True)
    ticket_type = models.ForeignKey(
        TicketType,
        on_delete=models.PROTECT,
        related_name='tickets',
        verbose_name='工单类型'
    )
    source = models.CharField('工单来源', max_length=20, choices=SOURCE_CHOICES, default='phone')
    status = models.CharField('工单状态', max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField('紧急程度', max_length=20, choices=PRIORITY_CHOICES, default='medium')
    user_name = models.CharField('用户姓名', max_length=100)
    user_phone = models.CharField('用户电话', max_length=20, blank=True, null=True)
    user_email = models.CharField('用户邮箱', max_length=100, blank=True, null=True)
    receiver = models.CharField('受理人', max_length=100, blank=True, null=True)
    handler = models.CharField('处理人', max_length=100, blank=True, null=True)
    handle_department = models.CharField('处理部门', max_length=100, blank=True, null=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '工单'
        verbose_name_plural = '工单'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.ticket_no:
            self.ticket_no = self.generate_ticket_no()
        super().save(*args, **kwargs)

    def generate_ticket_no(self):
        today = timezone.localdate()
        date_str = today.strftime('%Y%m%d')
        prefix = f'OPPO-{date_str}-'
        
        last_ticket = Ticket.objects.filter(
            ticket_no__startswith=prefix
        ).order_by('-ticket_no').first()
        
        if last_ticket:
            try:
                last_num = int(last_ticket.ticket_no.split('-')[-1])
                new_num = last_num + 1
            except (IndexError, ValueError):
                new_num = 1
        else:
            new_num = 1
        
        return f'{prefix}{new_num:04d}'

    def __str__(self):
        return f'{self.ticket_no} - {self.ticket_type.name}'


class TicketFieldValue(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='field_values',
        verbose_name='工单'
    )
    custom_field = models.ForeignKey(
        CustomField,
        on_delete=models.CASCADE,
        related_name='field_values',
        verbose_name='自定义字段'
    )
    value = models.TextField('字段值')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '工单自定义字段值'
        verbose_name_plural = '工单自定义字段值'
        unique_together = ['ticket', 'custom_field']

    def __str__(self):
        return f'{self.ticket.ticket_no} - {self.custom_field.field_name}'


class TransferRecord(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='transfer_records',
        verbose_name='工单'
    )
    from_handler = models.CharField('原处理人', max_length=100, blank=True, null=True)
    from_department = models.CharField('原处理部门', max_length=100, blank=True, null=True)
    to_handler = models.CharField('新处理人', max_length=100, blank=True, null=True)
    to_department = models.CharField('新处理部门', max_length=100, blank=True, null=True)
    transfer_reason = models.TextField('转派原因', blank=True, null=True)
    operator = models.CharField('操作人', max_length=100)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '转派记录'
        verbose_name_plural = '转派记录'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.ticket.ticket_no} - 转派记录'


class EditHistory(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='edit_histories',
        verbose_name='工单'
    )
    field_name = models.CharField('字段名称', max_length=100)
    old_value = models.TextField('原值', blank=True, null=True)
    new_value = models.TextField('新值', blank=True, null=True)
    operator = models.CharField('操作人', max_length=100)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '编辑历史记录'
        verbose_name_plural = '编辑历史记录'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.ticket.ticket_no} - {self.field_name}'
