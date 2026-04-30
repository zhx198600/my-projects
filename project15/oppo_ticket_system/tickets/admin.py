from django.contrib import admin
from .models import (
    TicketType,
    CustomField,
    Ticket,
    TicketFieldValue,
    TransferRecord,
    EditHistory,
)


class CustomFieldInline(admin.TabularInline):
    model = CustomField
    extra = 1
    fields = ('field_name', 'field_code', 'field_type', 'is_required', 'options', 'placeholder', 'sort_order', 'is_active')


class TicketFieldValueInline(admin.TabularInline):
    model = TicketFieldValue
    extra = 0
    readonly_fields = ('custom_field', 'value', 'created_at', 'updated_at')


class TransferRecordInline(admin.TabularInline):
    model = TransferRecord
    extra = 0
    readonly_fields = ('from_handler', 'from_department', 'to_handler', 'to_department', 'transfer_reason', 'operator', 'created_at')


class EditHistoryInline(admin.TabularInline):
    model = EditHistory
    extra = 0
    readonly_fields = ('field_name', 'old_value', 'new_value', 'operator', 'created_at')


@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'is_active', 'created_at', 'updated_at')
    search_fields = ('name', 'code')
    list_filter = ('is_active', 'created_at')
    inlines = [CustomFieldInline]


@admin.register(CustomField)
class CustomFieldAdmin(admin.ModelAdmin):
    list_display = ('ticket_type', 'field_name', 'field_code', 'field_type', 'is_required', 'is_active', 'sort_order')
    search_fields = ('field_name', 'field_code', 'ticket_type__name')
    list_filter = ('field_type', 'is_required', 'is_active', 'ticket_type')
    ordering = ('ticket_type', 'sort_order')


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_no', 'ticket_type', 'source', 'status', 'priority', 'user_name', 'user_phone', 'handler', 'created_at')
    search_fields = ('ticket_no', 'user_name', 'user_phone', 'user_email', 'handler')
    list_filter = ('ticket_type', 'source', 'status', 'priority', 'created_at')
    readonly_fields = ('ticket_no', 'created_at', 'updated_at')
    inlines = [TicketFieldValueInline, TransferRecordInline, EditHistoryInline]
    fieldsets = (
        ('基本信息', {
            'fields': ('ticket_no', 'ticket_type', 'source', 'status', 'priority')
        }),
        ('用户信息', {
            'fields': ('user_name', 'user_phone', 'user_email')
        }),
        ('处理信息', {
            'fields': ('receiver', 'handler', 'handle_department')
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(TicketFieldValue)
class TicketFieldValueAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'custom_field', 'value', 'created_at')
    search_fields = ('ticket__ticket_no', 'custom_field__field_name', 'value')
    list_filter = ('custom_field__ticket_type', 'created_at')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(TransferRecord)
class TransferRecordAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'from_handler', 'from_department', 'to_handler', 'to_department', 'operator', 'created_at')
    search_fields = ('ticket__ticket_no', 'from_handler', 'to_handler', 'operator')
    list_filter = ('created_at',)
    readonly_fields = ('created_at',)


@admin.register(EditHistory)
class EditHistoryAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'field_name', 'old_value', 'new_value', 'operator', 'created_at')
    search_fields = ('ticket__ticket_no', 'field_name', 'operator')
    list_filter = ('field_name', 'created_at')
    readonly_fields = ('created_at',)
