from flask import Blueprint, request, jsonify, g
from utils.database import query_db, execute_db, row_to_dict
from utils.auth import verify_password, generate_token, login_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请求数据不能为空'
            }), 400
        
        employee_no = data.get('employee_no')
        password = data.get('password')
        
        if not employee_no or not password:
            return jsonify({
                'success': False,
                'data': {},
                'message': '工号和密码不能为空'
            }), 400
        
        employee = query_db(
            'SELECT * FROM employees WHERE employee_no = ?',
            (employee_no,),
            one=True
        )
        
        if not employee:
            return jsonify({
                'success': False,
                'data': {},
                'message': '工号或密码错误'
            }), 401
        
        if not verify_password(password, employee['password']):
            return jsonify({
                'success': False,
                'data': {},
                'message': '工号或密码错误'
            }), 401
        
        token = generate_token(employee['id'], employee['role'])
        
        employee_dict = row_to_dict(employee)
        del employee_dict['password']
        
        return jsonify({
            'success': True,
            'data': {
                'token': token,
                'user': employee_dict
            },
            'message': '登录成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'登录失败: {str(e)}'
        }), 500

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    try:
        employee = query_db(
            'SELECT * FROM employees WHERE id = ?',
            (g.user_id,),
            one=True
        )
        
        if not employee:
            return jsonify({
                'success': False,
                'data': {},
                'message': '用户不存在'
            }), 404
        
        employee_dict = row_to_dict(employee)
        del employee_dict['password']
        
        department = query_db(
            'SELECT * FROM departments WHERE id = ?',
            (employee['department_id'],),
            one=True
        )
        if department:
            employee_dict['department'] = row_to_dict(department)
        
        return jsonify({
            'success': True,
            'data': employee_dict,
            'message': '获取用户信息成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取用户信息失败: {str(e)}'
        }), 500
