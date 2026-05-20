from flask import Blueprint, request, jsonify, g, Response
from datetime import datetime, timedelta
from utils.database import query_db, row_to_dict
from utils.auth import login_required, role_required
import csv
import io

statistics_bp = Blueprint('statistics', __name__, url_prefix='/api/statistics')

STATUS_MAP = {
    '正常': 'normal',
    '迟到': 'late',
    '早退': 'early_leave',
    '缺勤': 'absent',
    '迟到早退': 'late_early'
}

LEAVE_TYPE_MAP = {
    '事假': 'personal_leave',
    '病假': 'sick_leave',
    '年假': 'annual_leave',
    '婚假': 'marriage_leave',
    '产假': 'maternity_leave',
    '丧假': 'bereavement_leave',
    '其他': 'other'
}


def calculate_workdays(start_date, end_date):
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    workdays = 0
    current = start
    while current <= end:
        if current.weekday() < 5:
            workdays += 1
        current += timedelta(days=1)
    return workdays


def get_date_range():
    month = request.args.get('month')
    year = request.args.get('year')
    quarter = request.args.get('quarter')

    if month:
        year_month = datetime.strptime(month, '%Y-%m')
        if year_month.month == 12:
            next_month = datetime(year_month.year + 1, 1, 1)
        else:
            next_month = datetime(year_month.year, year_month.month + 1, 1)
        start_date = year_month.strftime('%Y-%m-%d')
        end_date = (next_month - timedelta(days=1)).strftime('%Y-%m-%d')
    elif year:
        year_int = int(year)
        if quarter:
            quarter_int = int(quarter)
            quarter_start_month = (quarter_int - 1) * 3 + 1
            quarter_end_month = quarter_start_month + 2
            start_date = f'{year_int}-{quarter_start_month:02d}-01'
            if quarter_end_month == 12:
                end_date = f'{year_int}-12-31'
            else:
                next_month = datetime(year_int, quarter_end_month + 1, 1)
                end_date = (next_month - timedelta(days=1)).strftime('%Y-%m-%d')
        else:
            start_date = f'{year}-01-01'
            end_date = f'{year}-12-31'
    else:
        now = datetime.now()
        if now.month == 12:
            next_month = datetime(now.year + 1, 1, 1)
        else:
            next_month = datetime(now.year, now.month + 1, 1)
        start_date = datetime(now.year, now.month, 1).strftime('%Y-%m-%d')
        end_date = (next_month - timedelta(days=1)).strftime('%Y-%m-%d')

    return start_date, end_date


def get_accessible_departments():
    if g.user_role in ['管理员', 'HR']:
        return None
    elif g.user_role == '部门经理':
        current_emp = query_db(
            'SELECT department_id FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        return current_emp['department_id'] if current_emp else -1
    return -1


def can_view_department(department_id):
    if g.user_role in ['管理员', 'HR']:
        return True
    if g.user_role == '部门经理':
        current_emp = query_db(
            'SELECT department_id FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        if current_emp and current_emp['department_id'] == department_id:
            return True
    return False


@statistics_bp.route('/personal', methods=['GET'])
@login_required
def get_personal_statistics():
    try:
        start_date, end_date = get_date_range()

        total_workdays = calculate_workdays(start_date, end_date)

        attendance_stats = query_db('''
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status IN ('正常', '迟到', '早退', '迟到早退') THEN 1 ELSE 0 END) as attendance_days,
                SUM(CASE WHEN status IN ('迟到', '迟到早退') THEN 1 ELSE 0 END) as late_count,
                SUM(late_minutes) as late_total_minutes,
                SUM(CASE WHEN status IN ('早退', '迟到早退') THEN 1 ELSE 0 END) as early_leave_count,
                SUM(early_minutes) as early_leave_total_minutes,
                SUM(CASE WHEN status = '缺勤' THEN 1 ELSE 0 END) as absent_days
            FROM attendance_records
            WHERE employee_id = ? AND attendance_date BETWEEN ? AND ?
        ''', (g.user_id, start_date, end_date), one=True)

        leave_stats = query_db('''
            SELECT 
                leave_type,
                SUM(days) as total_days
            FROM leave_requests
            WHERE employee_id = ? 
              AND status = '已通过'
              AND date(end_time) >= ?
              AND date(start_time) <= ?
            GROUP BY leave_type
        ''', (g.user_id, start_date, end_date))

        leave_by_type = {}
        total_leave_days = 0
        for leave in leave_stats:
            leave_type_en = LEAVE_TYPE_MAP.get(leave['leave_type'], leave['leave_type'])
            leave_by_type[leave_type_en] = round(leave['total_days'], 2)
            total_leave_days += leave['total_days']

        attendance_days = attendance_stats['attendance_days'] or 0
        attendance_rate = 0
        if total_workdays > 0:
            actual_work = attendance_days + total_leave_days
            attendance_rate = round((actual_work / total_workdays) * 100, 2)

        result = {
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'total_workdays': total_workdays,
            'attendance_days': attendance_days,
            'late_count': attendance_stats['late_count'] or 0,
            'late_total_minutes': attendance_stats['late_total_minutes'] or 0,
            'early_leave_count': attendance_stats['early_leave_count'] or 0,
            'early_leave_total_minutes': attendance_stats['early_leave_total_minutes'] or 0,
            'absent_days': attendance_stats['absent_days'] or 0,
            'leave_days_by_type': leave_by_type,
            'total_leave_days': round(total_leave_days, 2),
            'attendance_rate': attendance_rate
        }

        return jsonify({
            'success': True,
            'data': result,
            'message': '获取个人考勤统计成功'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取个人考勤统计失败: {str(e)}'
        }), 500


@statistics_bp.route('/department/<int:department_id>', methods=['GET'])
@login_required
def get_department_statistics(department_id):
    try:
        if not can_view_department(department_id):
            return jsonify({
                'success': False,
                'data': {},
                'message': '权限不足'
            }), 403

        start_date, end_date = get_date_range()
        total_workdays = calculate_workdays(start_date, end_date)

        department = query_db(
            'SELECT * FROM departments WHERE id = ?',
            (department_id,),
            one=True
        )
        if not department:
            return jsonify({
                'success': False,
                'data': {},
                'message': '部门不存在'
            }), 404

        employees = query_db('''
            SELECT id, name, employee_no, department_id
            FROM employees
            WHERE department_id = ?
        ''', (department_id,))
        total_employees = len(employees)

        if total_employees == 0:
            return jsonify({
                'success': True,
                'data': {
                    'department': row_to_dict(department),
                    'period': {'start_date': start_date, 'end_date': end_date},
                    'total_employees': 0,
                    'total_attendance': 0,
                    'total_late': 0,
                    'total_early_leave': 0,
                    'total_absent': 0,
                    'leave_by_type': {},
                    'avg_attendance_rate': 0,
                    'employee_details': []
                },
                'message': '获取部门考勤统计成功'
            }), 200

        employee_ids = [emp['id'] for emp in employees]
        placeholders = ','.join('?' * len(employee_ids))

        attendance_stats = query_db(f'''
            SELECT 
                employee_id,
                COUNT(*) as total_days,
                SUM(CASE WHEN status IN ('正常', '迟到', '早退', '迟到早退') THEN 1 ELSE 0 END) as attendance_days,
                SUM(CASE WHEN status IN ('迟到', '迟到早退') THEN 1 ELSE 0 END) as late_count,
                SUM(late_minutes) as late_total_minutes,
                SUM(CASE WHEN status IN ('早退', '迟到早退') THEN 1 ELSE 0 END) as early_leave_count,
                SUM(early_minutes) as early_leave_total_minutes,
                SUM(CASE WHEN status = '缺勤' THEN 1 ELSE 0 END) as absent_days
            FROM attendance_records
            WHERE employee_id IN ({placeholders}) AND attendance_date BETWEEN ? AND ?
            GROUP BY employee_id
        ''', employee_ids + [start_date, end_date])

        leave_stats = query_db(f'''
            SELECT 
                employee_id,
                leave_type,
                SUM(days) as total_days
            FROM leave_requests
            WHERE employee_id IN ({placeholders})
              AND status = '已通过'
              AND date(end_time) >= ?
              AND date(start_time) <= ?
            GROUP BY employee_id, leave_type
        ''', employee_ids + [start_date, end_date])

        emp_attendance_map = {stat['employee_id']: stat for stat in attendance_stats}
        emp_leave_map = {}
        for leave in leave_stats:
            if leave['employee_id'] not in emp_leave_map:
                emp_leave_map[leave['employee_id']] = {}
            leave_type_en = LEAVE_TYPE_MAP.get(leave['leave_type'], leave['leave_type'])
            emp_leave_map[leave['employee_id']][leave_type_en] = round(leave['total_days'], 2)

        employee_details = []
        total_attendance = 0
        total_late = 0
        total_early_leave = 0
        total_absent = 0
        total_leave_by_type = {}
        total_rate_sum = 0

        for emp in employees:
            emp_id = emp['id']
            stat = emp_attendance_map.get(emp_id, {})
            leaves = emp_leave_map.get(emp_id, {})

            attendance_days = stat['attendance_days'] if stat and 'attendance_days' in stat else 0
            late_count = stat['late_count'] if stat and 'late_count' in stat else 0
            early_leave_count = stat['early_leave_count'] if stat and 'early_leave_count' in stat else 0
            absent_days = stat['absent_days'] if stat and 'absent_days' in stat else 0
            late_total_minutes = stat['late_total_minutes'] if stat and 'late_total_minutes' in stat else 0
            early_total_minutes = stat['early_leave_total_minutes'] if stat and 'early_leave_total_minutes' in stat else 0

            total_leave_days = sum(leaves.values())
            actual_work = attendance_days + total_leave_days
            attendance_rate = round((actual_work / total_workdays) * 100, 2) if total_workdays > 0 else 0

            employee_details.append({
                'employee': {
                    'id': emp['id'],
                    'name': emp['name'],
                    'employee_no': emp['employee_no']
                },
                'attendance_days': attendance_days,
                'late_count': late_count,
                'late_total_minutes': late_total_minutes,
                'early_leave_count': early_leave_count,
                'early_leave_total_minutes': early_total_minutes,
                'absent_days': absent_days,
                'leave_days_by_type': leaves,
                'total_leave_days': round(total_leave_days, 2),
                'attendance_rate': attendance_rate
            })

            total_attendance += attendance_days
            total_late += late_count
            total_early_leave += early_leave_count
            total_absent += absent_days
            total_rate_sum += attendance_rate

            for leave_type, days in leaves.items():
                if leave_type not in total_leave_by_type:
                    total_leave_by_type[leave_type] = 0
                total_leave_by_type[leave_type] += days

        for leave_type in total_leave_by_type:
            total_leave_by_type[leave_type] = round(total_leave_by_type[leave_type], 2)

        avg_attendance_rate = round(total_rate_sum / total_employees, 2) if total_employees > 0 else 0

        result = {
            'department': row_to_dict(department),
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'total_employees': total_employees,
            'total_attendance': total_attendance,
            'total_late': total_late,
            'total_early_leave': total_early_leave,
            'total_absent': total_absent,
            'leave_by_type': total_leave_by_type,
            'avg_attendance_rate': avg_attendance_rate,
            'employee_details': employee_details
        }

        return jsonify({
            'success': True,
            'data': result,
            'message': '获取部门考勤统计成功'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取部门考勤统计失败: {str(e)}'
        }), 500


@statistics_bp.route('/company', methods=['GET'])
@role_required('管理员', 'HR')
def get_company_statistics():
    try:
        start_date, end_date = get_date_range()
        total_workdays = calculate_workdays(start_date, end_date)

        departments = query_db('SELECT * FROM departments')
        employees = query_db('SELECT id, department_id FROM employees')
        total_employees = len(employees)

        if total_employees == 0:
            return jsonify({
                'success': True,
                'data': {
                    'period': {'start_date': start_date, 'end_date': end_date},
                    'total_departments': len(departments),
                    'total_employees': 0,
                    'total_attendance': 0,
                    'total_late': 0,
                    'total_early_leave': 0,
                    'total_absent': 0,
                    'leave_by_type': {},
                    'avg_attendance_rate': 0,
                    'department_details': []
                },
                'message': '获取公司考勤统计成功'
            }), 200

        employee_ids = [emp['id'] for emp in employees]
        placeholders = ','.join('?' * len(employee_ids))

        attendance_stats = query_db(f'''
            SELECT 
                employee_id,
                SUM(CASE WHEN status IN ('正常', '迟到', '早退', '迟到早退') THEN 1 ELSE 0 END) as attendance_days,
                SUM(CASE WHEN status IN ('迟到', '迟到早退') THEN 1 ELSE 0 END) as late_count,
                SUM(CASE WHEN status IN ('早退', '迟到早退') THEN 1 ELSE 0 END) as early_leave_count,
                SUM(CASE WHEN status = '缺勤' THEN 1 ELSE 0 END) as absent_days
            FROM attendance_records
            WHERE employee_id IN ({placeholders}) AND attendance_date BETWEEN ? AND ?
            GROUP BY employee_id
        ''', employee_ids + [start_date, end_date])

        leave_stats = query_db(f'''
            SELECT 
                lr.employee_id,
                lr.leave_type,
                SUM(lr.days) as total_days
            FROM leave_requests lr
            WHERE lr.employee_id IN ({placeholders})
              AND lr.status = '已通过'
              AND date(lr.end_time) >= ?
              AND date(lr.start_time) <= ?
            GROUP BY lr.employee_id, lr.leave_type
        ''', employee_ids + [start_date, end_date])

        emp_attendance_map = {stat['employee_id']: stat for stat in attendance_stats}
        emp_leave_map = {}
        for leave in leave_stats:
            if leave['employee_id'] not in emp_leave_map:
                emp_leave_map[leave['employee_id']] = {}
            leave_type_en = LEAVE_TYPE_MAP.get(leave['leave_type'], leave['leave_type'])
            emp_leave_map[leave['employee_id']][leave_type_en] = round(leave['total_days'], 2)

        dept_emp_map = {}
        for emp in employees:
            dept_id = emp['department_id']
            if dept_id not in dept_emp_map:
                dept_emp_map[dept_id] = []
            dept_emp_map[dept_id].append(emp['id'])

        total_attendance = 0
        total_late = 0
        total_early_leave = 0
        total_absent = 0
        total_leave_by_type = {}
        total_rate_sum = 0
        department_details = []

        for dept in departments:
            dept_id = dept['id']
            dept_emp_ids = dept_emp_map.get(dept_id, [])
            dept_employee_count = len(dept_emp_ids)

            if dept_employee_count == 0:
                department_details.append({
                    'department': row_to_dict(dept),
                    'employee_count': 0,
                    'total_attendance': 0,
                    'total_late': 0,
                    'total_early_leave': 0,
                    'total_absent': 0,
                    'avg_attendance_rate': 0
                })
                continue

            dept_attendance = 0
            dept_late = 0
            dept_early_leave = 0
            dept_absent = 0
            dept_rate_sum = 0

            for emp_id in dept_emp_ids:
                stat = emp_attendance_map.get(emp_id, {})
                leaves = emp_leave_map.get(emp_id, {})

                attendance_days = stat['attendance_days'] if stat and 'attendance_days' in stat else 0
                late_count = stat['late_count'] if stat and 'late_count' in stat else 0
                early_leave_count = stat['early_leave_count'] if stat and 'early_leave_count' in stat else 0
                absent_days = stat['absent_days'] if stat and 'absent_days' in stat else 0

                total_leave_days = sum(leaves.values())
                actual_work = attendance_days + total_leave_days
                attendance_rate = round((actual_work / total_workdays) * 100, 2) if total_workdays > 0 else 0

                dept_attendance += attendance_days
                dept_late += late_count
                dept_early_leave += early_leave_count
                dept_absent += absent_days
                dept_rate_sum += attendance_rate

            dept_avg_rate = round(dept_rate_sum / dept_employee_count, 2) if dept_employee_count > 0 else 0

            department_details.append({
                'department': row_to_dict(dept),
                'employee_count': dept_employee_count,
                'total_attendance': dept_attendance,
                'total_late': dept_late,
                'total_early_leave': dept_early_leave,
                'total_absent': dept_absent,
                'avg_attendance_rate': dept_avg_rate
            })

            total_attendance += dept_attendance
            total_late += dept_late
            total_early_leave += dept_early_leave
            total_absent += dept_absent
            total_rate_sum += dept_rate_sum

            for emp_id in dept_emp_ids:
                leaves = emp_leave_map.get(emp_id, {})
                for leave_type, days in leaves.items():
                    if leave_type not in total_leave_by_type:
                        total_leave_by_type[leave_type] = 0
                    total_leave_by_type[leave_type] += days

        for leave_type in total_leave_by_type:
            total_leave_by_type[leave_type] = round(total_leave_by_type[leave_type], 2)

        avg_attendance_rate = round(total_rate_sum / total_employees, 2) if total_employees > 0 else 0

        result = {
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'total_departments': len(departments),
            'total_employees': total_employees,
            'total_attendance': total_attendance,
            'total_late': total_late,
            'total_early_leave': total_early_leave,
            'total_absent': total_absent,
            'leave_by_type': total_leave_by_type,
            'avg_attendance_rate': avg_attendance_rate,
            'department_details': department_details
        }

        return jsonify({
            'success': True,
            'data': result,
            'message': '获取公司考勤统计成功'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取公司考勤统计失败: {str(e)}'
        }), 500


@statistics_bp.route('/report', methods=['GET'])
@login_required
def get_attendance_report():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        department_id = request.args.get('department_id', type=int)
        employee_id = request.args.get('employee_id', type=int)

        if not start_date or not end_date:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请提供开始日期和结束日期'
            }), 400

        accessible_dept = get_accessible_departments()

        query = '''
            SELECT 
                ar.*,
                e.name as employee_name,
                e.employee_no,
                d.name as department_name,
                d.id as department_id
            FROM attendance_records ar
            JOIN employees e ON ar.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            WHERE ar.attendance_date BETWEEN ? AND ?
        '''
        params = [start_date, end_date]

        if employee_id:
            if g.user_role not in ['管理员', 'HR']:
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
                    if not current_emp or not target_emp or current_emp['department_id'] != target_emp['department_id']:
                        return jsonify({
                            'success': False,
                            'data': {},
                            'message': '权限不足'
                        }), 403
                elif g.user_id != employee_id:
                    return jsonify({
                        'success': False,
                        'data': {},
                        'message': '权限不足'
                    }), 403
            query += ' AND ar.employee_id = ?'
            params.append(employee_id)
        elif department_id:
            if not can_view_department(department_id):
                return jsonify({
                    'success': False,
                    'data': {},
                    'message': '权限不足'
                }), 403
            query += ' AND e.department_id = ?'
            params.append(department_id)
        else:
            if g.user_role == '普通员工':
                query += ' AND ar.employee_id = ?'
                params.append(g.user_id)
            elif g.user_role == '部门经理' and accessible_dept != -1:
                query += ' AND e.department_id = ?'
                params.append(accessible_dept)

        query += ' ORDER BY ar.attendance_date DESC, ar.id DESC'

        records = query_db(query, params)

        result = []
        for record in records:
            record_dict = dict(record)
            record_dict['status'] = STATUS_MAP.get(record_dict['status'], record_dict['status'])
            result.append(record_dict)

        return jsonify({
            'success': True,
            'data': {
                'records': result,
                'total': len(result),
                'period': {
                    'start_date': start_date,
                    'end_date': end_date
                }
            },
            'message': '获取考勤明细报表成功'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取考勤明细报表失败: {str(e)}'
        }), 500


export_bp = Blueprint('export', __name__, url_prefix='/api/export')


def validate_date(date_str):
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False


def create_csv_response(headers, rows, filename):
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)
    
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    
    output.seek(0)
    csv_content = output.getvalue()
    
    csv_content_with_bom = '\ufeff' + csv_content
    
    response = Response(
        csv_content_with_bom.encode('utf-8'),
        mimetype='text/csv; charset=utf-8'
    )
    from urllib.parse import quote
    encoded_filename = quote(filename, encoding='utf-8')
    response.headers['Content-Disposition'] = f"attachment; filename*=UTF-8''{encoded_filename}"
    return response


@export_bp.route('/personal', methods=['GET'])
@login_required
def export_personal_attendance():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请提供开始日期和结束日期'
            }), 400
        
        if not validate_date(start_date) or not validate_date(end_date):
            return jsonify({
                'success': False,
                'data': {},
                'message': '日期格式不正确，请使用YYYY-MM-DD格式'
            }), 400
        
        employee = query_db(
            'SELECT name FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        if not employee:
            return jsonify({
                'success': False,
                'data': {},
                'message': '员工不存在'
            }), 404
        
        records = query_db('''
            SELECT 
                attendance_date,
                clock_in_time,
                clock_out_time,
                clock_in_ip,
                clock_out_ip,
                status,
                late_minutes,
                early_minutes
            FROM attendance_records
            WHERE employee_id = ? AND attendance_date BETWEEN ? AND ?
            ORDER BY attendance_date
        ''', (g.user_id, start_date, end_date))
        
        headers = ['日期', '上班时间', '下班时间', '上班IP', '下班IP', '状态', '迟到分钟', '早退分钟']
        rows = []
        for record in records:
            rows.append([
                record['attendance_date'],
                record['clock_in_time'] or '',
                record['clock_out_time'] or '',
                record['clock_in_ip'] or '',
                record['clock_out_ip'] or '',
                record['status'] or '',
                record['late_minutes'] or 0,
                record['early_minutes'] or 0
            ])
        
        filename = f'个人考勤_{employee["name"]}_{start_date}_{end_date}.csv'
        return create_csv_response(headers, rows, filename)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'导出个人考勤数据失败: {str(e)}'
        }), 500


@export_bp.route('/department/<int:department_id>', methods=['GET'])
@login_required
def export_department_attendance(department_id):
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请提供开始日期和结束日期'
            }), 400
        
        if not validate_date(start_date) or not validate_date(end_date):
            return jsonify({
                'success': False,
                'data': {},
                'message': '日期格式不正确，请使用YYYY-MM-DD格式'
            }), 400
        
        if not can_view_department(department_id):
            return jsonify({
                'success': False,
                'data': {},
                'message': '权限不足'
            }), 403
        
        department = query_db(
            'SELECT name FROM departments WHERE id = ?',
            (department_id,),
            one=True
        )
        if not department:
            return jsonify({
                'success': False,
                'data': {},
                'message': '部门不存在'
            }), 404
        
        employees = query_db('''
            SELECT id, name, employee_no FROM employees WHERE department_id = ?
        ''', (department_id,))
        
        total_workdays = calculate_workdays(start_date, end_date)
        
        headers = ['员工编号', '姓名', '部门', '出勤天数', '迟到次数', '迟到总分钟', 
                   '早退次数', '早退总分钟', '缺勤天数', '请假天数', '出勤率']
        rows = []
        
        for emp in employees:
            attendance_stats = query_db('''
                SELECT 
                    COUNT(*) as total_days,
                    SUM(CASE WHEN status IN ('正常', '迟到', '早退', '迟到早退') THEN 1 ELSE 0 END) as attendance_days,
                    SUM(CASE WHEN status IN ('迟到', '迟到早退') THEN 1 ELSE 0 END) as late_count,
                    SUM(late_minutes) as late_total_minutes,
                    SUM(CASE WHEN status IN ('早退', '迟到早退') THEN 1 ELSE 0 END) as early_leave_count,
                    SUM(early_minutes) as early_leave_total_minutes,
                    SUM(CASE WHEN status = '缺勤' THEN 1 ELSE 0 END) as absent_days
                FROM attendance_records
                WHERE employee_id = ? AND attendance_date BETWEEN ? AND ?
            ''', (emp['id'], start_date, end_date), one=True)
            
            leave_stats = query_db('''
                SELECT 
                    COALESCE(SUM(days), 0) as total_leave_days
                FROM leave_requests
                WHERE employee_id = ? 
                  AND status = '已通过'
                  AND date(end_time) >= ?
                  AND date(start_time) <= ?
            ''', (emp['id'], start_date, end_date), one=True)
            
            attendance_days = attendance_stats['attendance_days'] or 0
            total_leave_days = leave_stats['total_leave_days'] or 0
            
            attendance_rate = 0
            if total_workdays > 0:
                actual_work = attendance_days + total_leave_days
                attendance_rate = round((actual_work / total_workdays) * 100, 2)
            
            rows.append([
                emp['employee_no'],
                emp['name'],
                department['name'],
                attendance_days,
                attendance_stats['late_count'] or 0,
                attendance_stats['late_total_minutes'] or 0,
                attendance_stats['early_leave_count'] or 0,
                attendance_stats['early_leave_total_minutes'] or 0,
                attendance_stats['absent_days'] or 0,
                round(total_leave_days, 2),
                f'{attendance_rate}%'
            ])
        
        filename = f'部门考勤_{department["name"]}_{start_date}_{end_date}.csv'
        return create_csv_response(headers, rows, filename)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'导出部门考勤数据失败: {str(e)}'
        }), 500


@export_bp.route('/leave', methods=['GET'])
@role_required('管理员', 'HR')
def export_leave_requests():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        status = request.args.get('status')
        
        if not start_date or not end_date:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请提供开始日期和结束日期'
            }), 400
        
        if not validate_date(start_date) or not validate_date(end_date):
            return jsonify({
                'success': False,
                'data': {},
                'message': '日期格式不正确，请使用YYYY-MM-DD格式'
            }), 400
        
        query = '''
            SELECT 
                lr.id,
                e.name as employee_name,
                d.name as department_name,
                lr.leave_type,
                lr.start_time,
                lr.end_time,
                lr.days,
                lr.reason,
                lr.status,
                ar.approver_id,
                a.name as approver_name,
                ar.approved_at
            FROM leave_requests lr
            JOIN employees e ON lr.employee_id = e.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN (
                SELECT leave_request_id, approver_id, approved_at
                FROM approval_records
                WHERE (leave_request_id, id) IN (
                    SELECT leave_request_id, MAX(id)
                    FROM approval_records
                    GROUP BY leave_request_id
                )
            ) ar ON lr.id = ar.leave_request_id
            LEFT JOIN employees a ON ar.approver_id = a.id
            WHERE date(lr.created_at) BETWEEN ? AND ?
        '''
        params = [start_date, end_date]
        
        if status:
            status_map = {
                'pending': '待审批',
                'approved': '已通过',
                'rejected': '已拒绝',
                'cancelled': '已撤销'
            }
            status_value = status_map.get(status, status)
            query += ' AND lr.status = ?'
            params.append(status_value)
        
        query += ' ORDER BY lr.created_at DESC'
        
        records = query_db(query, params)
        
        headers = ['申请编号', '申请人', '部门', '请假类型', '开始时间', '结束时间', 
                   '请假天数', '原因', '状态', '审批人', '审批时间']
        rows = []
        
        for record in records:
            rows.append([
                record['id'],
                record['employee_name'],
                record['department_name'] or '',
                record['leave_type'],
                record['start_time'] or '',
                record['end_time'] or '',
                record['days'] or 0,
                record['reason'] or '',
                record['status'] or '',
                record['approver_name'] or '',
                record['approved_at'] or ''
            ])
        
        filename = f'请假记录_{start_date}_{end_date}.csv'
        return create_csv_response(headers, rows, filename)
    
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'导出请假申请数据失败: {str(e)}'
        }), 500
