from flask import Blueprint, request, jsonify, g
from datetime import datetime, date
from utils.database import query_db, execute_db, row_to_dict
from utils.auth import login_required

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

WORK_START_TIME = datetime.strptime('09:00:00', '%H:%M:%S').time()
WORK_END_TIME = datetime.strptime('18:00:00', '%H:%M:%S').time()

def get_status_display(status):
    status_map = {
        '正常': 'normal',
        '迟到': 'late',
        '早退': 'early_leave',
        '缺勤': 'absent',
        '迟到早退': 'late_early'
    }
    return status_map.get(status, status)

def can_view_attendance(employee_id):
    if g.user_role in ['管理员', 'HR']:
        return True
    if g.user_id == employee_id:
        return True
    if g.user_role == '部门经理':
        current_emp = query_db(
            'SELECT department_id FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        target_emp = query_db(
            'SELECT department_id FROM employees WHERE id = ?',
            (employee_id,),
            one=True
        )
        if current_emp and target_emp:
            return current_emp['department_id'] == target_emp['department_id']
    return False

def get_accessible_employee_ids():
    if g.user_role in ['管理员', 'HR']:
        employees = query_db('SELECT id FROM employees')
        return [emp['id'] for emp in employees]
    if g.user_role == '部门经理':
        current_emp = query_db(
            'SELECT department_id FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        if current_emp:
            employees = query_db(
                'SELECT id FROM employees WHERE department_id = ?',
                (current_emp['department_id'],)
            )
            return [emp['id'] for emp in employees]
    return [g.user_id]

@attendance_bp.route('/clock-in', methods=['POST'])
@login_required
def clock_in():
    try:
        now = datetime.now()
        attendance_date = now.date().isoformat()
        clock_in_time = now.time()
        client_ip = request.remote_addr or '127.0.0.1'

        existing = query_db(
            'SELECT * FROM attendance_records WHERE employee_id = ? AND attendance_date = ?',
            (g.user_id, attendance_date),
            one=True
        )

        if existing:
            return jsonify({
                'success': False,
                'data': {},
                'message': '今天已经打过卡了'
            }), 400

        late_minutes = 0
        status = '正常'

        if clock_in_time > WORK_START_TIME:
            start_datetime = datetime.combine(now.date(), WORK_START_TIME)
            clock_in_datetime = datetime.combine(now.date(), clock_in_time)
            late_minutes = int((clock_in_datetime - start_datetime).total_seconds() // 60)
            status = '迟到'

        execute_db(
            '''INSERT INTO attendance_records 
               (employee_id, attendance_date, clock_in_time, clock_in_ip, status, late_minutes) 
               VALUES (?, ?, ?, ?, ?, ?)''',
            (g.user_id, attendance_date, clock_in_time.isoformat(), client_ip, status, late_minutes)
        )

        record = query_db(
            'SELECT * FROM attendance_records WHERE employee_id = ? AND attendance_date = ?',
            (g.user_id, attendance_date),
            one=True
        )

        record_dict = row_to_dict(record)
        record_dict['status'] = get_status_display(record_dict['status'])

        message = '上班打卡成功'
        if status == '迟到':
            message = f'上班打卡成功，迟到 {late_minutes} 分钟'

        return jsonify({
            'success': True,
            'data': record_dict,
            'message': message
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'上班打卡失败: {str(e)}'
        }), 500

@attendance_bp.route('/clock-out', methods=['POST'])
@login_required
def clock_out():
    try:
        now = datetime.now()
        attendance_date = now.date().isoformat()
        clock_out_time = now.time()
        client_ip = request.remote_addr or '127.0.0.1'

        existing = query_db(
            'SELECT * FROM attendance_records WHERE employee_id = ? AND attendance_date = ?',
            (g.user_id, attendance_date),
            one=True
        )

        if not existing:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请先进行上班打卡'
            }), 400

        if existing['clock_out_time']:
            return jsonify({
                'success': False,
                'data': {},
                'message': '今天已经打过下班卡了'
            }), 400

        early_minutes = 0
        status = existing['status']

        if clock_out_time < WORK_END_TIME:
            end_datetime = datetime.combine(now.date(), WORK_END_TIME)
            clock_out_datetime = datetime.combine(now.date(), clock_out_time)
            early_minutes = int((end_datetime - clock_out_datetime).total_seconds() // 60)
            if status == '迟到':
                status = '迟到早退'
            else:
                status = '早退'

        execute_db(
            '''UPDATE attendance_records 
               SET clock_out_time = ?, clock_out_ip = ?, status = ?, early_minutes = ? 
               WHERE id = ?''',
            (clock_out_time.isoformat(), client_ip, status, early_minutes, existing['id'])
        )

        record = query_db(
            'SELECT * FROM attendance_records WHERE id = ?',
            (existing['id'],),
            one=True
        )

        record_dict = row_to_dict(record)
        record_dict['status'] = get_status_display(record_dict['status'])

        message = '下班打卡成功'
        if early_minutes > 0:
            message = f'下班打卡成功，早退 {early_minutes} 分钟'

        return jsonify({
            'success': True,
            'data': record_dict,
            'message': message
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'下班打卡失败: {str(e)}'
        }), 500

@attendance_bp.route('/status', methods=['GET'])
@login_required
def get_today_status():
    try:
        attendance_date = date.today().isoformat()

        record = query_db(
            'SELECT * FROM attendance_records WHERE employee_id = ? AND attendance_date = ?',
            (g.user_id, attendance_date),
            one=True
        )

        result = {
            'date': attendance_date,
            'has_clocked_in': False,
            'has_clocked_out': False,
            'clock_in_time': None,
            'clock_out_time': None,
            'status': None,
            'late_minutes': 0,
            'early_minutes': 0
        }

        if record:
            result['has_clocked_in'] = True
            result['clock_in_time'] = record['clock_in_time']
            result['late_minutes'] = record['late_minutes']

            if record['clock_out_time']:
                result['has_clocked_out'] = True
                result['clock_out_time'] = record['clock_out_time']
                result['early_minutes'] = record['early_minutes']

            result['status'] = get_status_display(record['status'])

        return jsonify({
            'success': True,
            'data': result,
            'message': '获取打卡状态成功'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取打卡状态失败: {str(e)}'
        }), 500

@attendance_bp.route('/history', methods=['GET'])
@login_required
def get_attendance_history():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        offset = (page - 1) * per_page

        accessible_ids = get_accessible_employee_ids()
        placeholders = ','.join('?' * len(accessible_ids))

        query = f'''
            SELECT ar.*, e.name, e.employee_no, d.name as department_name
            FROM attendance_records ar
            JOIN employees e ON ar.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE ar.employee_id IN ({placeholders})
        '''
        params = list(accessible_ids)

        if start_date:
            query += ' AND ar.attendance_date >= ?'
            params.append(start_date)

        if end_date:
            query += ' AND ar.attendance_date <= ?'
            params.append(end_date)

        count_query = query.replace('SELECT ar.*, e.name, e.employee_no, d.name as department_name', 'SELECT COUNT(*) as total')
        total_result = query_db(count_query, params, one=True)
        total = total_result['total'] if total_result else 0

        query += ' ORDER BY ar.attendance_date DESC, ar.id DESC LIMIT ? OFFSET ?'
        params.extend([per_page, offset])

        records = query_db(query, params)
        records_list = []

        for record in records:
            record_dict = row_to_dict(record)
            record_dict['status'] = get_status_display(record_dict['status'])
            records_list.append(record_dict)

        return jsonify({
            'success': True,
            'data': {
                'records': records_list,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'total_pages': (total + per_page - 1) // per_page
                }
            },
            'message': '获取打卡历史成功'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取打卡历史失败: {str(e)}'
        }), 500

@attendance_bp.route('/employee/<int:employee_id>', methods=['GET'])
@login_required
def get_employee_attendance(employee_id):
    try:
        if not can_view_attendance(employee_id):
            return jsonify({
                'success': False,
                'data': {},
                'message': '权限不足'
            }), 403

        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        offset = (page - 1) * per_page

        query = '''
            SELECT ar.*, e.name, e.employee_no, d.name as department_name
            FROM attendance_records ar
            JOIN employees e ON ar.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE ar.employee_id = ?
        '''
        params = [employee_id]

        if start_date:
            query += ' AND ar.attendance_date >= ?'
            params.append(start_date)

        if end_date:
            query += ' AND ar.attendance_date <= ?'
            params.append(end_date)

        count_query = query.replace('SELECT ar.*, e.name, e.employee_no, d.name as department_name', 'SELECT COUNT(*) as total')
        total_result = query_db(count_query, params, one=True)
        total = total_result['total'] if total_result else 0

        query += ' ORDER BY ar.attendance_date DESC, ar.id DESC LIMIT ? OFFSET ?'
        params.extend([per_page, offset])

        records = query_db(query, params)
        records_list = []

        for record in records:
            record_dict = row_to_dict(record)
            record_dict['status'] = get_status_display(record_dict['status'])
            records_list.append(record_dict)

        return jsonify({
            'success': True,
            'data': {
                'records': records_list,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'total_pages': (total + per_page - 1) // per_page
                }
            },
            'message': '获取员工打卡记录成功'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取员工打卡记录失败: {str(e)}'
        }), 500
