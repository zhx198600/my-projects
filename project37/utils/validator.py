import re
from datetime import datetime

def validate_date(date_str):
    if not date_str:
        return False, '日期不能为空'
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True, None
    except ValueError:
        return False, '日期格式错误，应为 YYYY-MM-DD'

def validate_datetime(datetime_str):
    if not datetime_str:
        return False, '日期时间不能为空'
    try:
        datetime.strptime(datetime_str, '%Y-%m-%d %H:%M:%S')
        return True, None
    except ValueError:
        return False, '日期时间格式错误，应为 YYYY-MM-DD HH:MM:SS'

def validate_email(email):
    if not email:
        return False, '邮箱不能为空'
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if re.match(pattern, email):
        return True, None
    return False, '邮箱格式错误'

def validate_phone(phone):
    if not phone:
        return False, '手机号不能为空'
    pattern = r'^1[3-9]\d{9}$'
    if re.match(pattern, phone):
        return True, None
    return False, '手机号格式错误，应为11位有效手机号'

def validate_required(data, fields):
    missing_fields = []
    for field in fields:
        if field not in data or data[field] is None or (isinstance(data[field], str) and data[field].strip() == ''):
            missing_fields.append(field)
    if missing_fields:
        return False, f'缺少必填字段: {", ".join(missing_fields)}'
    return True, None

def validate_positive_integer(value, field_name):
    try:
        num = int(value)
        if num > 0:
            return True, None
        return False, f'{field_name}必须是正整数'
    except (ValueError, TypeError):
        return False, f'{field_name}必须是有效整数'

def validate_string_length(value, field_name, min_len=0, max_len=None):
    if not isinstance(value, str):
        return False, f'{field_name}必须是字符串'
    if len(value) < min_len:
        return False, f'{field_name}长度不能少于{min_len}个字符'
    if max_len is not None and len(value) > max_len:
        return False, f'{field_name}长度不能超过{max_len}个字符'
    return True, None
