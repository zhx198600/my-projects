from flask import Blueprint, request, jsonify, g
from utils.database import query_db, execute_db, row_to_dict
from utils.auth import login_required
from datetime import datetime, timedelta

leave_bp = Blueprint('leave', __name__, url_prefix='/api/leave')

LEAVE_TYPE_MAP = {
    'personal_leave': '事假',
    'sick_leave': '病假',
    'annual_leave': '年假',
    'marriage_leave': '婚假',
    'maternity_leave': '产假',
    'bereavement_leave': '丧假',
    'other': '其他'
}

LEAVE_TYPE_MAP_REVERSE = {v: k for k, v in LEAVE_TYPE_MAP.items()}

STATUS_MAP = {
    'pending': '待审批',
    'in_approval': '审批中',
    'approved': '已通过',
    'rejected': '已拒绝',
    'cancelled': '已撤销'
}

STATUS_MAP_REVERSE = {v: k for k, v in STATUS_MAP.items()}


def calculate_leave_days(start_time, end_time):
    # 支持多种格式
    def parse_datetime(dt_str):
        if 'T' in dt_str:
            return datetime.strptime(dt_str, '%Y-%m-%dT%H:%M')
        elif len(dt_str) == 16:
            return datetime.strptime(dt_str, '%Y-%m-%d %H:%M')
        else:
            return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
    
    start_dt = parse_datetime(start_time)
    end_dt = parse_datetime(end_time)
    
    days = 0.0
    current = start_dt
    
    while current <= end_dt:
        if current.weekday() < 5:
            day_start = current.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = current.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            period_start = max(start_dt, day_start)
            period_end = min(end_dt, day_end)
            
            hours_diff = (period_end - period_start).total_seconds() / 3600
            days += hours_diff / 8
        
        current += timedelta(days=1)
        current = current.replace(hour=0, minute=0, second=0, microsecond=0)
    
    return round(days, 2)


def convert_leave_to_enum(leave_request):
    result = row_to_dict(leave_request)
    if result:
        if result['leave_type'] in LEAVE_TYPE_MAP_REVERSE:
            result['leave_type'] = LEAVE_TYPE_MAP_REVERSE[result['leave_type']]
        if result['status'] in STATUS_MAP_REVERSE:
            result['status'] = STATUS_MAP_REVERSE[result['status']]
    return result


@leave_bp.route('/request', methods=['POST'])
@login_required
def create_leave_request():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请求数据不能为空'
            }), 400
        
        leave_type = data.get('leave_type')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        reason = data.get('reason')
        
        if not all([leave_type, start_time, end_time, reason]):
            return jsonify({
                'success': False,
                'data': {},
                'message': '请假类型、开始时间、结束时间和原因不能为空'
            }), 400
        
        if leave_type not in LEAVE_TYPE_MAP:
            return jsonify({
                'success': False,
                'data': {},
                'message': '无效的请假类型'
            }), 400
        
        try:
            # 支持多种格式: YYYY-MM-DDTHH:MM, YYYY-MM-DD HH:MM, YYYY-MM-DD HH:MM:SS
            def parse_datetime(dt_str):
                if 'T' in dt_str:
                    # 浏览器datetime-local格式: YYYY-MM-DDTHH:MM
                    return datetime.strptime(dt_str, '%Y-%m-%dT%H:%M')
                elif len(dt_str) == 16:  # YYYY-MM-DD HH:MM
                    return datetime.strptime(dt_str, '%Y-%m-%d %H:%M')
                else:  # YYYY-MM-DD HH:MM:SS
                    return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
            
            start_dt = parse_datetime(start_time)
            end_dt = parse_datetime(end_time)
            
            # 标准化为统一格式存储
            start_time = start_dt.strftime('%Y-%m-%d %H:%M:%S')
            end_time = end_dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({
                'success': False,
                'data': {},
                'message': '时间格式错误，请使用 YYYY-MM-DD HH:MM 格式'
            }), 400
        
        if end_dt <= start_dt:
            return jsonify({
                'success': False,
                'data': {},
                'message': '结束时间必须大于开始时间'
            }), 400
        
        now = datetime.now()
        if start_dt < now:
            return jsonify({
                'success': False,
                'data': {},
                'message': '不能申请过去的时间'
            }), 400
        
        days = calculate_leave_days(start_time, end_time)
        
        leave_type_chinese = LEAVE_TYPE_MAP[leave_type]
        
        # 根据天数自动设置审批级别和状态
        if days > 3:
            # 超过3天需要二级审批
            status_chinese = STATUS_MAP['in_approval']
            approval_level = 2
        else:
            # 3天及以内只需一级审批
            status_chinese = STATUS_MAP['pending']
            approval_level = 1
        
        leave_id = execute_db(
            '''INSERT INTO leave_requests 
               (employee_id, leave_type, start_time, end_time, days, reason, status, current_approval_level)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (g.user_id, leave_type_chinese, start_time, end_time, days, reason, status_chinese, approval_level)
        )
        
        leave_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (leave_id,),
            one=True
        )
        
        return jsonify({
            'success': True,
            'data': convert_leave_to_enum(leave_request),
            'message': '请假申请提交成功'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'提交请假申请失败: {str(e)}'
        }), 500


@leave_bp.route('/request/<int:request_id>', methods=['PUT'])
@login_required
def update_leave_request(request_id):
    try:
        leave_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (request_id,),
            one=True
        )
        
        if not leave_request:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请假申请不存在'
            }), 404
        
        if leave_request['employee_id'] != g.user_id:
            return jsonify({
                'success': False,
                'data': {},
                'message': '只能修改自己的请假申请'
            }), 403
        
        if leave_request['status'] != STATUS_MAP['pending']:
            return jsonify({
                'success': False,
                'data': {},
                'message': '只能修改待审批状态的申请'
            }), 400
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请求数据不能为空'
            }), 400
        
        leave_type = data.get('leave_type', LEAVE_TYPE_MAP_REVERSE.get(leave_request['leave_type']))
        start_time = data.get('start_time', leave_request['start_time'])
        end_time = data.get('end_time', leave_request['end_time'])
        reason = data.get('reason', leave_request['reason'])
        
        if leave_type not in LEAVE_TYPE_MAP:
            return jsonify({
                'success': False,
                'data': {},
                'message': '无效的请假类型'
            }), 400
        
        try:
            # 支持多种格式: YYYY-MM-DDTHH:MM, YYYY-MM-DD HH:MM, YYYY-MM-DD HH:MM:SS
            def parse_datetime(dt_str):
                if 'T' in dt_str:
                    # 浏览器datetime-local格式: YYYY-MM-DDTHH:MM
                    return datetime.strptime(dt_str, '%Y-%m-%dT%H:%M')
                elif len(dt_str) == 16:  # YYYY-MM-DD HH:MM
                    return datetime.strptime(dt_str, '%Y-%m-%d %H:%M')
                else:  # YYYY-MM-DD HH:MM:SS
                    return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
            
            start_dt = parse_datetime(start_time)
            end_dt = parse_datetime(end_time)
            
            # 标准化为统一格式存储
            start_time = start_dt.strftime('%Y-%m-%d %H:%M:%S')
            end_time = end_dt.strftime('%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({
                'success': False,
                'data': {},
                'message': '时间格式错误，请使用 YYYY-MM-DD HH:MM 格式'
            }), 400
        
        if end_dt <= start_dt:
            return jsonify({
                'success': False,
                'data': {},
                'message': '结束时间必须大于开始时间'
            }), 400
        
        now = datetime.now()
        if start_dt < now:
            return jsonify({
                'success': False,
                'data': {},
                'message': '不能申请过去的时间'
            }), 400
        
        days = calculate_leave_days(start_time, end_time)
        
        leave_type_chinese = LEAVE_TYPE_MAP[leave_type]
        
        execute_db(
            '''UPDATE leave_requests 
               SET leave_type = ?, start_time = ?, end_time = ?, days = ?, reason = ?
               WHERE id = ?''',
            (leave_type_chinese, start_time, end_time, days, reason, request_id)
        )
        
        leave_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (request_id,),
            one=True
        )
        
        return jsonify({
            'success': True,
            'data': convert_leave_to_enum(leave_request),
            'message': '请假申请修改成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'修改请假申请失败: {str(e)}'
        }), 500


@leave_bp.route('/request/<int:request_id>/cancel', methods=['PUT'])
@login_required
def cancel_leave_request(request_id):
    try:
        leave_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (request_id,),
            one=True
        )
        
        if not leave_request:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请假申请不存在'
            }), 404
        
        if leave_request['employee_id'] != g.user_id:
            return jsonify({
                'success': False,
                'data': {},
                'message': '只能撤销自己的请假申请'
            }), 403
        
        execute_db(
            'UPDATE leave_requests SET status = ? WHERE id = ?',
            (STATUS_MAP['cancelled'], request_id)
        )
        
        leave_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (request_id,),
            one=True
        )
        
        return jsonify({
            'success': True,
            'data': convert_leave_to_enum(leave_request),
            'message': '请假申请撤销成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'撤销请假申请失败: {str(e)}'
        }), 500


@leave_bp.route('/my-requests', methods=['GET'])
@login_required
def get_my_requests():
    try:
        status_filter = request.args.get('status')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = 'SELECT * FROM leave_requests WHERE employee_id = ?'
        params = [g.user_id]
        
        if status_filter:
            if status_filter not in STATUS_MAP:
                return jsonify({
                    'success': False,
                    'data': {},
                    'message': '无效的状态筛选值'
                }), 400
            query += ' AND status = ?'
            params.append(STATUS_MAP[status_filter])
        
        if start_date:
            query += ' AND date(start_time) >= ?'
            params.append(start_date)
        
        if end_date:
            query += ' AND date(end_time) <= ?'
            params.append(end_date)
        
        query += ' ORDER BY created_at DESC'
        
        leave_requests = query_db(query, tuple(params))
        
        result = [convert_leave_to_enum(req) for req in leave_requests]
        
        return jsonify({
            'success': True,
            'data': {
                'requests': result,
                'total': len(result)
            },
            'message': '获取请假申请列表成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取请假申请列表失败: {str(e)}'
        }), 500


@leave_bp.route('/request/<int:request_id>', methods=['GET'])
@login_required
def get_leave_request_detail(request_id):
    try:
        leave_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (request_id,),
            one=True
        )
        
        if not leave_request:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请假申请不存在'
            }), 404
        
        if leave_request['employee_id'] != g.user_id:
            current_user = query_db(
                'SELECT department_id, role FROM employees WHERE id = ?',
                (g.user_id,),
                one=True
            )
            
            is_approver = False
            
            if current_user:
                # 部门经理：查看本部门员工的一级审批申请
                if current_user['role'] == '部门经理':
                    leave_employee = query_db(
                        'SELECT department_id FROM employees WHERE id = ?',
                        (leave_request['employee_id'],),
                        one=True
                    )
                    if leave_employee and leave_employee['department_id'] == current_user['department_id']:
                        if leave_request['current_approval_level'] == 1 and leave_request['status'] == STATUS_MAP['pending']:
                            is_approver = True
                
                # HR和管理员：查看二级审批申请
                elif current_user['role'] in ['HR', '管理员']:
                    if leave_request['current_approval_level'] == 2 and leave_request['status'] == STATUS_MAP['in_approval']:
                        is_approver = True
            
            if not is_approver:
                return jsonify({
                    'success': False,
                    'data': {},
                    'message': '无权查看此请假申请'
                }), 403
        
        return jsonify({
            'success': True,
            'data': convert_leave_to_enum(leave_request),
            'message': '获取请假申请详情成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取请假申请详情失败: {str(e)}'
        }), 500


@leave_bp.route('/pending', methods=['GET'])
@login_required
def get_pending_approvals():
    try:
        current_user = query_db(
            'SELECT id, department_id, role FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        
        if not current_user:
            return jsonify({
                'success': False,
                'data': {},
                'message': '用户不存在'
            }), 404
        
        query = '''
            SELECT lr.*, e.name as employee_name, e.employee_no, d.name as department_name
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE 1=1
        '''
        params = []
        
        if current_user['role'] == '部门经理':
            query += ' AND e.department_id = ? AND lr.current_approval_level = ? AND lr.status = ?'
            params.extend([current_user['department_id'], 1, STATUS_MAP['pending']])
        elif current_user['role'] in ['HR', '管理员']:
            query += ' AND lr.current_approval_level = ? AND lr.status = ?'
            params.extend([2, STATUS_MAP['in_approval']])
        else:
            return jsonify({
                'success': False,
                'data': {},
                'message': '权限不足'
            }), 403
        
        query += ' ORDER BY lr.created_at DESC'
        
        leave_requests = query_db(query, tuple(params))
        
        result = []
        for req in leave_requests:
            req_dict = dict(req)
            if req_dict['leave_type'] in LEAVE_TYPE_MAP_REVERSE:
                req_dict['leave_type'] = LEAVE_TYPE_MAP_REVERSE[req_dict['leave_type']]
            if req_dict['status'] in STATUS_MAP_REVERSE:
                req_dict['status'] = STATUS_MAP_REVERSE[req_dict['status']]
            result.append(req_dict)
        
        return jsonify({
            'success': True,
            'data': {
                'requests': result,
                'total': len(result)
            },
            'message': '获取待审批列表成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取待审批列表失败: {str(e)}'
        }), 500


@leave_bp.route('/request/<int:request_id>/approve-level1', methods=['PUT'])
@login_required
def approve_level1(request_id):
    try:
        current_user = query_db(
            'SELECT id, department_id, role FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        
        if not current_user or current_user['role'] != '部门经理':
            return jsonify({
                'success': False,
                'data': {},
                'message': '只有部门经理可以执行此操作'
            }), 403
        
        leave_request = query_db(
            'SELECT lr.*, e.department_id FROM leave_requests lr JOIN employees e ON lr.employee_id = e.id WHERE lr.id = ?',
            (request_id,),
            one=True
        )
        
        if not leave_request:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请假申请不存在'
            }), 404
        
        if leave_request['department_id'] != current_user['department_id']:
            return jsonify({
                'success': False,
                'data': {},
                'message': '只能审批本部门员工的申请'
            }), 403
        
        if leave_request['current_approval_level'] != 1:
            return jsonify({
                'success': False,
                'data': {},
                'message': '当前申请不在部门经理审批阶段'
            }), 400
        
        if leave_request['status'] != STATUS_MAP['pending']:
            return jsonify({
                'success': False,
                'data': {},
                'message': '申请状态不是待审批'
            }), 400
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请求数据不能为空'
            }), 400
        
        approval_status = data.get('status')
        comment = data.get('comment', '')
        
        if approval_status not in ['approved', 'rejected']:
            return jsonify({
                'success': False,
                'data': {},
                'message': '无效的审批状态'
            }), 400
        
        if approval_status == 'approved':
            if leave_request['days'] > 3:
                new_status = STATUS_MAP['in_approval']
                new_level = 2
            else:
                new_status = STATUS_MAP['approved']
                new_level = 1
            
            execute_db(
                'UPDATE leave_requests SET status = ?, current_approval_level = ? WHERE id = ?',
                (new_status, new_level, request_id)
            )
        else:
            execute_db(
                'UPDATE leave_requests SET status = ?, current_approval_level = 1 WHERE id = ?',
                (STATUS_MAP['rejected'], request_id)
            )
        
        approval_status_chinese = STATUS_MAP[approval_status]
        execute_db(
            '''INSERT INTO approval_records 
               (leave_request_id, approver_id, approval_level, status, comment, approved_at)
               VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)''',
            (request_id, g.user_id, 1, approval_status_chinese, comment)
        )
        
        updated_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (request_id,),
            one=True
        )
        
        return jsonify({
            'success': True,
            'data': convert_leave_to_enum(updated_request),
            'message': f'审批{approval_status_chinese}'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'审批失败: {str(e)}'
        }), 500


@leave_bp.route('/request/<int:request_id>/approve-level2', methods=['PUT'])
@login_required
def approve_level2(request_id):
    try:
        current_user = query_db(
            'SELECT id, department_id, role FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        
        if not current_user or current_user['role'] not in ['HR', '管理员']:
            return jsonify({
                'success': False,
                'data': {},
                'message': '只有HR或管理员可以执行此操作'
            }), 403
        
        leave_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (request_id,),
            one=True
        )
        
        if not leave_request:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请假申请不存在'
            }), 404
        
        if leave_request['current_approval_level'] != 2:
            return jsonify({
                'success': False,
                'data': {},
                'message': '当前申请不在HR审批阶段'
            }), 400
        
        if leave_request['status'] != STATUS_MAP['in_approval']:
            return jsonify({
                'success': False,
                'data': {},
                'message': '申请状态不是审批中'
            }), 400
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请求数据不能为空'
            }), 400
        
        approval_status = data.get('status')
        comment = data.get('comment', '')
        
        if approval_status not in ['approved', 'rejected']:
            return jsonify({
                'success': False,
                'data': {},
                'message': '无效的审批状态'
            }), 400
        
        approval_status_chinese = STATUS_MAP[approval_status]
        execute_db(
            'UPDATE leave_requests SET status = ?, current_approval_level = 2 WHERE id = ?',
            (approval_status_chinese, request_id)
        )
        
        execute_db(
            '''INSERT INTO approval_records 
               (leave_request_id, approver_id, approval_level, status, comment, approved_at)
               VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)''',
            (request_id, g.user_id, 2, approval_status_chinese, comment)
        )
        
        updated_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (request_id,),
            one=True
        )
        
        return jsonify({
            'success': True,
            'data': convert_leave_to_enum(updated_request),
            'message': f'审批{approval_status_chinese}'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'审批失败: {str(e)}'
        }), 500


@leave_bp.route('/request/<int:request_id>/approvals', methods=['GET'])
@login_required
def get_approval_history(request_id):
    try:
        leave_request = query_db(
            'SELECT * FROM leave_requests WHERE id = ?',
            (request_id,),
            one=True
        )
        
        if not leave_request:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请假申请不存在'
            }), 404
        
        if leave_request['employee_id'] != g.user_id:
            current_user = query_db(
                'SELECT department_id, role FROM employees WHERE id = ?',
                (g.user_id,),
                one=True
            )
            
            is_approver = False
            
            if current_user:
                # 部门经理：查看本部门员工的一级审批申请
                if current_user['role'] == '部门经理':
                    leave_employee = query_db(
                        'SELECT department_id FROM employees WHERE id = ?',
                        (leave_request['employee_id'],),
                        one=True
                    )
                    if leave_employee and leave_employee['department_id'] == current_user['department_id']:
                        if leave_request['current_approval_level'] == 1:
                            is_approver = True
                
                # HR和管理员：查看二级审批申请
                elif current_user['role'] in ['HR', '管理员']:
                    if leave_request['current_approval_level'] == 2:
                        is_approver = True
            
            if not is_approver:
                return jsonify({
                    'success': False,
                    'data': {},
                    'message': '无权查看此审批历史'
                }), 403
        
        approval_records = query_db(
            '''SELECT ar.*, e.name as approver_name, e.employee_no as approver_employee_no
               FROM approval_records ar
               JOIN employees e ON ar.approver_id = e.id
               WHERE ar.leave_request_id = ?
               ORDER BY ar.created_at ASC''',
            (request_id,)
        )
        
        result = []
        for record in approval_records:
            record_dict = dict(record)
            if record_dict['status'] in STATUS_MAP_REVERSE:
                record_dict['status'] = STATUS_MAP_REVERSE[record_dict['status']]
            result.append(record_dict)
        
        return jsonify({
            'success': True,
            'data': {
                'approvals': result,
                'total': len(result)
            },
            'message': '获取审批历史成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取审批历史失败: {str(e)}'
        }), 500


@leave_bp.route('/approval-history', methods=['GET'])
@login_required
def get_my_approval_history():
    try:
        current_user = query_db(
            'SELECT id, department_id, role FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        
        if not current_user:
            return jsonify({
                'success': False,
                'data': {},
                'message': '用户不存在'
            }), 404
        
        if current_user['role'] not in ['部门经理', 'HR', '管理员']:
            return jsonify({
                'success': False,
                'data': {},
                'message': '权限不足'
            }), 403
        
        approval_records = query_db(
            '''SELECT 
                ar.*, 
                e.name as employee_name,
                e.employee_no,
                d.name as department_name,
                lr.leave_type,
                lr.start_time,
                lr.end_time,
                lr.days,
                lr.reason
               FROM approval_records ar
               JOIN leave_requests lr ON ar.leave_request_id = lr.id
               JOIN employees e ON lr.employee_id = e.id
               LEFT JOIN departments d ON e.department_id = d.id
               WHERE ar.approver_id = ?
               ORDER BY ar.created_at DESC''',
            (g.user_id,)
        )
        
        result = []
        for record in approval_records:
            record_dict = dict(record)
            if record_dict['status'] in STATUS_MAP_REVERSE:
                record_dict['status'] = STATUS_MAP_REVERSE[record_dict['status']]
            result.append(record_dict)
        
        return jsonify({
            'success': True,
            'data': {
                'history': result,
                'total': len(result)
            },
            'message': '获取我的审批历史成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取我的审批历史失败: {str(e)}'
        }), 500
