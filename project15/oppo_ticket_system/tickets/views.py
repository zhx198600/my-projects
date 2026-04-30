import json
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages
from functools import wraps

from .models import Ticket, TicketType, CustomField, TicketFieldValue, TransferRecord, EditHistory


def login_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.session.get('is_logged_in'):
            login_url = reverse('login')
            next_url = request.get_full_path()
            if next_url:
                return redirect(f'{login_url}?next={next_url}')
            return redirect(login_url)
        return view_func(request, *args, **kwargs)
    return wrapper


def login_view(request):
    if request.method == 'POST':
        role = request.POST.get('role')
        
        if role == 'super_admin':
            request.session['is_logged_in'] = True
            request.session['role'] = 'super_admin'
            request.session['username'] = '超级管理员'
            
            next_url = request.GET.get('next')
            if next_url:
                return redirect(next_url)
            return redirect('ticket_list')
        
        return render(request, 'login.html', {'error_message': '请选择有效的角色'})
    
    if request.session.get('is_logged_in'):
        return redirect('ticket_list')
    
    return render(request, 'login.html')


def logout_view(request):
    request.session.flush()
    return redirect('login')


@login_required
def ticket_list(request):
    tickets = Ticket.objects.select_related('ticket_type').order_by('-created_at')
    
    ticket_type_code = request.GET.get('ticket_type', '')
    status = request.GET.get('status', '')
    priority = request.GET.get('priority', '')
    ordering = request.GET.get('ordering', '-created_at')
    
    if ticket_type_code:
        tickets = tickets.filter(ticket_type__code=ticket_type_code)
    if status:
        tickets = tickets.filter(status=status)
    if priority:
        tickets = tickets.filter(priority=priority)
    
    if ordering in ['created_at', '-created_at']:
        tickets = tickets.order_by(ordering)
    
    ticket_types = TicketType.objects.filter(is_active=True)
    
    context = {
        'tickets': tickets,
        'ticket_types': ticket_types,
        'status_choices': Ticket.STATUS_CHOICES,
        'priority_choices': Ticket.PRIORITY_CHOICES,
        'current_ticket_type': ticket_type_code,
        'current_status': status,
        'current_priority': priority,
        'current_ordering': ordering,
    }
    return render(request, 'ticket_list.html', context)


@login_required
def ticket_create_select(request):
    ticket_types = list(TicketType.objects.filter(is_active=True).prefetch_related('custom_fields'))
    type_icons = {
        'COMPLAINT': '😠',
        'REPAIR': '🔧',
        'SUGGESTION': '💡',
        'REPORT_ISSUE': '📊',
        'PLATFORM_ERROR': '⚠️',
        'INSPECTION': '🔍',
        'APPOINTMENT': '📅',
    }
    for tt in ticket_types:
        tt.icon = type_icons.get(tt.code, '📋')
    return render(request, 'ticket_create_select.html', {
        'ticket_types': ticket_types,
    })


@login_required
def ticket_create(request, type_code):
    try:
        ticket_type = TicketType.objects.get(code=type_code, is_active=True)
    except TicketType.DoesNotExist:
        messages.error(request, '无效的工单类型')
        return redirect('ticket_create_select')
    
    custom_fields = list(ticket_type.custom_fields.filter(is_active=True).select_related('dependent_field').order_by('sort_order'))
    
    field_code_map = {}
    for field in custom_fields:
        field_code_map[field.field_code] = field
        
        if field.options:
            try:
                field.options_json = json.loads(field.options)
            except:
                field.options_json = []
        else:
            field.options_json = []
        field.field_key = f'custom_{field.field_code}'
        field.post_value = ''
        field.error_message = ''
        field.dependent_field_code = field.dependent_field.field_code if field.dependent_field else None
        field.dependent_value = field.dependent_value
    
    if request.method == 'POST':
        errors = {}
        
        user_name = request.POST.get('user_name', '').strip()
        if not user_name:
            errors['user_name'] = '用户姓名为必填项'
        
        source = request.POST.get('source', 'phone')
        status = request.POST.get('status', 'pending')
        priority = request.POST.get('priority', 'medium')
        
        post_data = {
            'user_name': user_name,
            'user_phone': request.POST.get('user_phone', '').strip(),
            'user_email': request.POST.get('user_email', '').strip(),
            'source': source,
            'status': status,
            'priority': priority,
            'receiver': request.POST.get('receiver', '').strip(),
            'handler': request.POST.get('handler', '').strip(),
            'handle_department': request.POST.get('handle_department', '').strip(),
        }
        
        custom_field_values = {}
        for field in custom_fields:
            value = request.POST.get(field.field_key, '').strip()
            field.post_value = value
            
            if field.is_required and not value:
                field.error_message = f'{field.field_name}为必填项'
                errors[field.field_key] = field.error_message
            
            if field.field_type == 'select' and field.options:
                try:
                    options = json.loads(field.options)
                    if value and value not in options:
                        field.error_message = f'{field.field_name}选项无效'
                        errors[field.field_key] = field.error_message
                except json.JSONDecodeError:
                    pass
            
            custom_field_values[field] = value
        
        if errors:
            return render(request, 'ticket_create.html', {
                'ticket_type': ticket_type,
                'custom_fields': custom_fields,
                'post_data': post_data,
                'errors': errors,
                'source_choices': Ticket.SOURCE_CHOICES,
                'status_choices': Ticket.STATUS_CHOICES,
                'priority_choices': Ticket.PRIORITY_CHOICES,
            })
        
        ticket = Ticket.objects.create(
            ticket_type=ticket_type,
            user_name=user_name,
            user_phone=post_data['user_phone'],
            user_email=post_data['user_email'],
            source=source,
            status=status,
            priority=priority,
            receiver=post_data['receiver'],
            handler=post_data['handler'],
            handle_department=post_data['handle_department'],
        )
        
        for field, value in custom_field_values.items():
            if value:
                TicketFieldValue.objects.create(
                    ticket=ticket,
                    custom_field=field,
                    value=value,
                )
        
        messages.success(request, f'工单创建成功，工单编号：{ticket.ticket_no}')
        return redirect('ticket_detail', pk=ticket.pk)
    
    post_data = {
        'user_name': '',
        'user_phone': '',
        'user_email': '',
        'source': 'phone',
        'status': 'pending',
        'priority': 'medium',
        'receiver': '',
        'handler': '',
        'handle_department': '',
    }
    
    return render(request, 'ticket_create.html', {
        'ticket_type': ticket_type,
        'custom_fields': custom_fields,
        'post_data': post_data,
        'errors': {},
        'source_choices': Ticket.SOURCE_CHOICES,
        'status_choices': Ticket.STATUS_CHOICES,
        'priority_choices': Ticket.PRIORITY_CHOICES,
        'department_choices': Ticket.DEPARTMENT_CHOICES,
    })


@login_required
def ticket_detail(request, pk):
    try:
        ticket = Ticket.objects.select_related('ticket_type').get(pk=pk)
    except Ticket.DoesNotExist:
        messages.error(request, '工单不存在')
        return redirect('ticket_list')
    
    custom_fields = list(ticket.ticket_type.custom_fields.filter(is_active=True).order_by('sort_order'))
    field_values = {fv.custom_field.field_code: fv.value for fv in ticket.field_values.all()}
    
    for field in custom_fields:
        field.value = field_values.get(field.field_code, '')
    
    transfer_records = list(ticket.transfer_records.all().order_by('-created_at'))
    edit_histories = list(ticket.edit_histories.all().order_by('-created_at'))
    
    return render(request, 'ticket_detail.html', {
        'ticket': ticket,
        'custom_fields': custom_fields,
        'transfer_records': transfer_records,
        'edit_histories': edit_histories,
    })


@login_required
def ticket_edit(request, pk):
    try:
        ticket = Ticket.objects.select_related('ticket_type').get(pk=pk)
    except Ticket.DoesNotExist:
        messages.error(request, '工单不存在')
        return redirect('ticket_list')
    
    old_handler = ticket.handler
    old_department = ticket.handle_department
    
    custom_fields = list(ticket.ticket_type.custom_fields.filter(is_active=True).select_related('dependent_field').order_by('sort_order'))
    
    field_code_map = {}
    for field in custom_fields:
        field_code_map[field.field_code] = field
        if field.options:
            try:
                field.options_json = json.loads(field.options)
            except:
                field.options_json = []
        else:
            field.options_json = []
        field.field_key = f'custom_{field.field_code}'
        field.dependent_field_code = field.dependent_field.field_code if field.dependent_field else None
        field.dependent_value = field.dependent_value
    
    existing_field_values = {fv.custom_field.field_code: fv.value for fv in ticket.field_values.all()}
    
    if request.method == 'POST':
        errors = {}
        
        user_name = request.POST.get('user_name', '').strip()
        if not user_name:
            errors['user_name'] = '用户姓名为必填项'
        
        post_data = {
            'user_name': user_name,
            'user_phone': request.POST.get('user_phone', '').strip(),
            'user_email': request.POST.get('user_email', '').strip(),
            'source': request.POST.get('source', 'phone'),
            'status': request.POST.get('status', 'pending'),
            'priority': request.POST.get('priority', 'medium'),
            'receiver': request.POST.get('receiver', '').strip(),
            'handler': request.POST.get('handler', '').strip(),
            'handle_department': request.POST.get('handle_department', '').strip(),
        }
        
        for field in custom_fields:
            value = request.POST.get(field.field_key, '').strip()
            
            if field.is_required and not value:
                errors[field.field_key] = f'{field.field_name}为必填项'
            
            if field.field_type == 'select' and field.options:
                try:
                    options = json.loads(field.options)
                    if value and value not in options:
                        errors[field.field_key] = f'{field.field_name}选项无效'
                except json.JSONDecodeError:
                    pass
        
        if errors:
            for field in custom_fields:
                field.post_value = request.POST.get(field.field_key, '')
            return render(request, 'ticket_edit.html', {
                'ticket': ticket,
                'custom_fields': custom_fields,
                'post_data': post_data,
                'errors': errors,
                'source_choices': Ticket.SOURCE_CHOICES,
                'status_choices': Ticket.STATUS_CHOICES,
                'priority_choices': Ticket.PRIORITY_CHOICES,
            })
        
        changed_fields = []
        
        if ticket.user_name != post_data['user_name']:
            changed_fields.append(('user_name', ticket.user_name, post_data['user_name']))
            ticket.user_name = post_data['user_name']
        
        if ticket.user_phone != post_data['user_phone']:
            changed_fields.append(('user_phone', ticket.user_phone or '', post_data['user_phone']))
            ticket.user_phone = post_data['user_phone']
        
        if ticket.user_email != post_data['user_email']:
            changed_fields.append(('user_email', ticket.user_email or '', post_data['user_email']))
            ticket.user_email = post_data['user_email']
        
        if ticket.source != post_data['source']:
            changed_fields.append(('source', ticket.get_source_display(), dict(Ticket.SOURCE_CHOICES).get(post_data['source'], post_data['source'])))
            ticket.source = post_data['source']
        
        if ticket.status != post_data['status']:
            changed_fields.append(('status', ticket.get_status_display(), dict(Ticket.STATUS_CHOICES).get(post_data['status'], post_data['status'])))
            ticket.status = post_data['status']
        
        if ticket.priority != post_data['priority']:
            changed_fields.append(('priority', ticket.get_priority_display(), dict(Ticket.PRIORITY_CHOICES).get(post_data['priority'], post_data['priority'])))
            ticket.priority = post_data['priority']
        
        if ticket.receiver != post_data['receiver']:
            changed_fields.append(('receiver', ticket.receiver or '', post_data['receiver']))
            ticket.receiver = post_data['receiver']
        
        if ticket.handler != post_data['handler']:
            changed_fields.append(('handler', ticket.handler or '', post_data['handler']))
            ticket.handler = post_data['handler']
        
        if ticket.handle_department != post_data['handle_department']:
            changed_fields.append(('handle_department', ticket.handle_department or '', post_data['handle_department']))
            ticket.handle_department = post_data['handle_department']
        
        ticket.save()
        
        operator = request.session.get('username', '超级管理员')
        
        handler_changed = (old_handler or '') != (post_data['handler'] or '')
        dept_changed = (old_department or '') != (post_data['handle_department'] or '')
        
        if handler_changed or dept_changed:
            TransferRecord.objects.create(
                ticket=ticket,
                from_handler=old_handler,
                from_department=old_department,
                to_handler=post_data['handler'],
                to_department=post_data['handle_department'],
                operator=operator,
            )
        
        for field_name, old_val, new_val in changed_fields:
            EditHistory.objects.create(
                ticket=ticket,
                field_name=field_name,
                old_value=old_val if old_val else '',
                new_value=new_val if new_val else '',
                operator=operator,
            )
        
        for field in custom_fields:
            new_value = request.POST.get(field.field_key, '').strip()
            old_value = existing_field_values.get(field.field_code, '')
            
            if new_value != old_value:
                try:
                    fv = TicketFieldValue.objects.get(ticket=ticket, custom_field=field)
                    fv.value = new_value
                    fv.save()
                except TicketFieldValue.DoesNotExist:
                    if new_value:
                        TicketFieldValue.objects.create(
                            ticket=ticket,
                            custom_field=field,
                            value=new_value,
                        )
                
                EditHistory.objects.create(
                    ticket=ticket,
                    field_name=field.field_name,
                    old_value=old_value,
                    new_value=new_value,
                    operator=operator,
                )
        
        messages.success(request, '工单更新成功')
        return redirect('ticket_detail', pk=ticket.pk)
    
    post_data = {
        'user_name': ticket.user_name,
        'user_phone': ticket.user_phone or '',
        'user_email': ticket.user_email or '',
        'source': ticket.source,
        'status': ticket.status,
        'priority': ticket.priority,
        'receiver': ticket.receiver or '',
        'handler': ticket.handler or '',
        'handle_department': ticket.handle_department or '',
    }
    
    for field in custom_fields:
        field.post_value = existing_field_values.get(field.field_code, '')
    
    return render(request, 'ticket_edit.html', {
        'ticket': ticket,
        'custom_fields': custom_fields,
        'post_data': post_data,
        'errors': {},
        'source_choices': Ticket.SOURCE_CHOICES,
        'status_choices': Ticket.STATUS_CHOICES,
        'priority_choices': Ticket.PRIORITY_CHOICES,
        'department_choices': Ticket.DEPARTMENT_CHOICES,
    })


@login_required
def custom_field_list(request):
    ticket_types = list(TicketType.objects.filter(is_active=True).prefetch_related('custom_fields'))
    type_icons = {
        'COMPLAINT': '😠',
        'REPAIR': '🔧',
        'SUGGESTION': '💡',
        'REPORT_ISSUE': '📊',
        'PLATFORM_ERROR': '⚠️',
        'INSPECTION': '🔍',
        'APPOINTMENT': '📅',
    }
    for tt in ticket_types:
        tt.icon = type_icons.get(tt.code, '📋')
        tt.field_count = tt.custom_fields.count()
    
    return render(request, 'custom_field_list.html', {
        'ticket_types': ticket_types,
    })


@login_required
def custom_field_create(request, type_code):
    try:
        ticket_type = TicketType.objects.get(code=type_code, is_active=True)
    except TicketType.DoesNotExist:
        messages.error(request, '无效的工单类型')
        return redirect('custom_field_list')
    
    existing_fields = list(CustomField.objects.filter(ticket_type=ticket_type, is_active=True).order_by('sort_order'))
    
    for f in existing_fields:
        if f.options:
            try:
                f.options_json = json.loads(f.options)
            except:
                f.options_json = []
        else:
            f.options_json = []
    
    if request.method == 'POST':
        field_name = request.POST.get('field_name', '').strip()
        field_code = request.POST.get('field_code', '').strip()
        field_type = request.POST.get('field_type', 'input')
        is_required = request.POST.get('is_required') == 'on'
        sort_order = int(request.POST.get('sort_order', 0))
        options_str = request.POST.get('options', '').strip()
        placeholder = request.POST.get('placeholder', '').strip()
        
        dependent_field_id = request.POST.get('dependent_field', '')
        dependent_value = request.POST.get('dependent_value', '').strip()
        
        errors = {}
        
        if not field_name:
            errors['field_name'] = '字段名称为必填项'
        
        if not field_code:
            errors['field_code'] = '字段代码为必填项'
        else:
            if CustomField.objects.filter(ticket_type=ticket_type, field_code=field_code).exists():
                errors['field_code'] = '该字段代码已存在'
        
        dependent_field = None
        if dependent_field_id:
            try:
                dependent_field = CustomField.objects.get(pk=dependent_field_id, ticket_type=ticket_type)
            except CustomField.DoesNotExist:
                errors['dependent_field'] = '无效的依赖字段'
        
        options = None
        if field_type == 'select' and options_str:
            try:
                options_list = [opt.strip() for opt in options_str.split('\n') if opt.strip()]
                options = json.dumps(options_list)
            except:
                errors['options'] = '选项格式有误'
        
        if errors:
            return render(request, 'custom_field_form.html', {
                'ticket_type': ticket_type,
                'is_edit': False,
                'post_data': request.POST,
                'errors': errors,
                'existing_fields': existing_fields,
            })
        
        CustomField.objects.create(
            ticket_type=ticket_type,
            field_name=field_name,
            field_code=field_code,
            field_type=field_type,
            is_required=is_required,
            options=options,
            placeholder=placeholder,
            sort_order=sort_order,
            is_active=True,
            dependent_field=dependent_field,
            dependent_value=dependent_value if dependent_field else None,
        )
        
        messages.success(request, '自定义字段创建成功')
        return redirect('custom_field_list')
    
    return render(request, 'custom_field_form.html', {
        'ticket_type': ticket_type,
        'is_edit': False,
        'post_data': {},
        'errors': {},
        'existing_fields': existing_fields,
    })


@login_required
def custom_field_edit(request, pk):
    try:
        field = CustomField.objects.select_related('ticket_type', 'dependent_field').get(pk=pk)
    except CustomField.DoesNotExist:
        messages.error(request, '自定义字段不存在')
        return redirect('custom_field_list')
    
    ticket_type = field.ticket_type
    
    existing_fields = list(CustomField.objects.filter(ticket_type=ticket_type, is_active=True).exclude(pk=pk).order_by('sort_order'))
    
    for f in existing_fields:
        if f.options:
            try:
                f.options_json = json.loads(f.options)
            except:
                f.options_json = []
        else:
            f.options_json = []
    
    if request.method == 'POST':
        field_name = request.POST.get('field_name', '').strip()
        field_code = request.POST.get('field_code', '').strip()
        field_type = request.POST.get('field_type', 'input')
        is_required = request.POST.get('is_required') == 'on'
        sort_order = int(request.POST.get('sort_order', 0))
        options_str = request.POST.get('options', '').strip()
        placeholder = request.POST.get('placeholder', '').strip()
        is_active = request.POST.get('is_active') == 'on'
        
        dependent_field_id = request.POST.get('dependent_field', '')
        dependent_value = request.POST.get('dependent_value', '').strip()
        
        errors = {}
        
        if not field_name:
            errors['field_name'] = '字段名称为必填项'
        
        if not field_code:
            errors['field_code'] = '字段代码为必填项'
        else:
            if CustomField.objects.filter(ticket_type=ticket_type, field_code=field_code).exclude(pk=pk).exists():
                errors['field_code'] = '该字段代码已存在'
        
        dependent_field = None
        if dependent_field_id:
            try:
                dependent_field = CustomField.objects.get(pk=dependent_field_id, ticket_type=ticket_type)
            except CustomField.DoesNotExist:
                errors['dependent_field'] = '无效的依赖字段'
        
        options = None
        if field_type == 'select':
            if options_str:
                try:
                    options_list = [opt.strip() for opt in options_str.split('\n') if opt.strip()]
                    options = json.dumps(options_list)
                except:
                    errors['options'] = '选项格式有误'
            else:
                options = None
        
        if errors:
            return render(request, 'custom_field_form.html', {
                'ticket_type': ticket_type,
                'field': field,
                'is_edit': True,
                'post_data': request.POST,
                'errors': errors,
                'existing_fields': existing_fields,
            })
        
        field.field_name = field_name
        field.field_code = field_code
        field.field_type = field_type
        field.is_required = is_required
        field.options = options
        field.placeholder = placeholder
        field.sort_order = sort_order
        field.is_active = is_active
        field.dependent_field = dependent_field
        field.dependent_value = dependent_value if dependent_field else None
        field.save()
        
        messages.success(request, '自定义字段更新成功')
        return redirect('custom_field_list')
    
    options_str = ''
    if field.options:
        try:
            options_list = json.loads(field.options)
            options_str = '\n'.join(options_list)
        except:
            options_str = ''
    
    post_data = {
        'field_name': field.field_name,
        'field_code': field.field_code,
        'field_type': field.field_type,
        'is_required': field.is_required,
        'sort_order': field.sort_order,
        'options': options_str,
        'placeholder': field.placeholder or '',
        'is_active': field.is_active,
        'dependent_field': field.dependent_field_id,
        'dependent_value': field.dependent_value or '',
    }
    
    return render(request, 'custom_field_form.html', {
        'ticket_type': ticket_type,
        'field': field,
        'is_edit': True,
        'post_data': post_data,
        'errors': {},
        'existing_fields': existing_fields,
    })


@login_required
def custom_field_delete(request, pk):
    try:
        field = CustomField.objects.select_related('ticket_type').get(pk=pk)
    except CustomField.DoesNotExist:
        messages.error(request, '自定义字段不存在')
        return redirect('custom_field_list')
    
    if request.method == 'POST':
        field_name = field.field_name
        type_name = field.ticket_type.name
        field.delete()
        messages.success(request, f'已删除 [{type_name}] 的自定义字段: {field_name}')
        return redirect('custom_field_list')
    
    return render(request, 'custom_field_delete.html', {
        'field': field,
    })
