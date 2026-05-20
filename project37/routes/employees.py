from flask import Blueprint, request, jsonify, g
from utils.database import query_db, execute_db, row_to_dict
from utils.auth import login_required, role_required, hash_password

employees_bp = Blueprint('employees', __name__, url_prefix='/api/employees')

def can_view_employee(employee_id):
    if g.user_role == '管理员':
        return True
    if g.user_role == 'HR':
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

def can_edit_employee(employee_id):
    if g.user_role == '管理员':
        return True
    if g.user_role == 'HR':
        return True
    if g.user_id == employee_id:
        return True
    return False

@employees_bp.route('', methods=['GET'])
@login_required
def get_employees():
    try:
        department_id = request.args.get('department_id', type=int)
        
        query = 'SELECT * FROM employees WHERE 1=1'
        params = []
        
        if department_id:
            query += ' AND department_id = ?'
            params.append(department_id)
        
        query += ' ORDER BY id'
        
        employees = query_db(query, params)
        employees_list = []
        
        for emp in employees:
            if can_view_employee(emp['id']):
                emp_dict = row_to_dict(emp)
                del emp_dict['password']
                
                if emp['department_id']:
                    dept = query_db(
                        'SELECT * FROM departments WHERE id = ?',
                        (emp['department_id'],),
                        one=True
                    )
                    if dept:
                        emp_dict['department'] = row_to_dict(dept)
                
                employees_list.append(emp_dict)
        
        return jsonify({
            'success': True,
            'data': employees_list,
            'message': '获取员工列表成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取员工列表失败: {str(e)}'
        }), 500

@employees_bp.route('/<int:emp_id>', methods=['GET'])
@login_required
def get_employee(emp_id):
    try:
        if not can_view_employee(emp_id):
            return jsonify({
                'success': False,
                'data': {},
                'message': '权限不足'
            }), 403
        
        employee = query_db(
            'SELECT * FROM employees WHERE id = ?',
            (emp_id,),
            one=True
        )
        
        if not employee:
            return jsonify({
                'success': False,
                'data': {},
                'message': '员工不存在'
            }), 404
        
        emp_dict = row_to_dict(employee)
        del emp_dict['password']
        
        if employee['department_id']:
            dept = query_db(
                'SELECT * FROM departments WHERE id = ?',
                (employee['department_id'],),
                one=True
            )
            if dept:
                emp_dict['department'] = row_to_dict(dept)
        
        return jsonify({
            'success': True,
            'data': emp_dict,
            'message': '获取员工详情成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取员工详情失败: {str(e)}'
        }), 500

@employees_bp.route('', methods=['POST'])
@role_required('管理员', 'HR')
def create_employee():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请求数据不能为空'
            }), 400
        
        name = data.get('name')
        employee_no = data.get('employee_no')
        password = data.get('password')
        department_id = data.get('department_id')
        role = data.get('role', '普通员工')
        email = data.get('email')
        phone = data.get('phone')
        
        if not name or not employee_no or not password:
            return jsonify({
                'success': False,
                'data': {},
                'message': '姓名、工号和密码不能为空'
            }), 400
        
        valid_roles = ['普通员工', '部门经理', 'HR', '管理员']
        if role not in valid_roles:
            return jsonify({
                'success': False,
                'data': {},
                'message': f'角色必须是: {", ".join(valid_roles)}'
            }), 400
        
        existing = query_db(
            'SELECT id FROM employees WHERE employee_no = ?',
            (employee_no,),
            one=True
        )
        if existing:
            return jsonify({
                'success': False,
                'data': {},
                'message': '工号已存在'
            }), 400
        
        if email:
            existing_email = query_db(
                'SELECT id FROM employees WHERE email = ?',
                (email,),
                one=True
            )
            if existing_email:
                return jsonify({
                    'success': False,
                    'data': {},
                    'message': '邮箱已存在'
                }), 400
        
        hashed_password = hash_password(password)
        
        emp_id = execute_db(
            'INSERT INTO employees (name, employee_no, password, department_id, role, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (name, employee_no, hashed_password, department_id, role, email, phone)
        )
        
        employee = query_db(
            'SELECT * FROM employees WHERE id = ?',
            (emp_id,),
            one=True
        )
        
        emp_dict = row_to_dict(employee)
        del emp_dict['password']
        
        return jsonify({
            'success': True,
            'data': emp_dict,
            'message': '创建员工成功'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'创建员工失败: {str(e)}'
        }), 500

@employees_bp.route('/<int:emp_id>', methods=['PUT'])
@login_required
def update_employee(emp_id):
    try:
        if not can_edit_employee(emp_id):
            return jsonify({
                'success': False,
                'data': {},
                'message': '权限不足'
            }), 403
        
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请求数据不能为空'
            }), 400
        
        employee = query_db(
            'SELECT * FROM employees WHERE id = ?',
            (emp_id,),
            one=True
        )
        
        if not employee:
            return jsonify({
                'success': False,
                'data': {},
                'message': '员工不存在'
            }), 404
        
        name = data.get('name', employee['name'])
        department_id = data.get('department_id', employee['department_id'])
        role = data.get('role', employee['role'])
        email = data.get('email', employee['email'])
        phone = data.get('phone', employee['phone'])
        
        if g.user_role not in ['管理员', 'HR'] and 'role' in data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '只有管理员和HR可以修改角色'
            }), 403
        
        if g.user_role not in ['管理员', 'HR'] and 'department_id' in data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '只有管理员和HR可以修改部门'
            }), 403
        
        valid_roles = ['普通员工', '部门经理', 'HR', '管理员']
        if role not in valid_roles:
            return jsonify({
                'success': False,
                'data': {},
                'message': f'角色必须是: {", ".join(valid_roles)}'
            }), 400
        
        if email and email != employee['email']:
            existing_email = query_db(
                'SELECT id FROM employees WHERE email = ? AND id != ?',
                (email, emp_id),
                one=True
            )
            if existing_email:
                return jsonify({
                    'success': False,
                    'data': {},
                    'message': '邮箱已存在'
                }), 400
        
        execute_db(
            'UPDATE employees SET name = ?, department_id = ?, role = ?, email = ?, phone = ? WHERE id = ?',
            (name, department_id, role, email, phone, emp_id)
        )
        
        employee = query_db(
            'SELECT * FROM employees WHERE id = ?',
            (emp_id,),
            one=True
        )
        
        emp_dict = row_to_dict(employee)
        del emp_dict['password']
        
        return jsonify({
            'success': True,
            'data': emp_dict,
            'message': '更新员工信息成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'更新员工信息失败: {str(e)}'
        }), 500

@employees_bp.route('/<int:emp_id>', methods=['DELETE'])
@role_required('管理员')
def delete_employee(emp_id):
    try:
        employee = query_db(
            'SELECT * FROM employees WHERE id = ?',
            (emp_id,),
            one=True
        )
        
        if not employee:
            return jsonify({
                'success': False,
                'data': {},
                'message': '员工不存在'
            }), 404
        
        execute_db('DELETE FROM employees WHERE id = ?', (emp_id,))
        
        return jsonify({
            'success': True,
            'data': {},
            'message': '删除员工成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'删除员工失败: {str(e)}'
        }), 500
