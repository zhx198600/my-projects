from flask import Blueprint, request, jsonify
from utils.database import query_db, execute_db, row_to_dict
from utils.auth import login_required, role_required

departments_bp = Blueprint('departments', __name__, url_prefix='/api/departments')

@departments_bp.route('', methods=['GET'])
@login_required
def get_departments():
    try:
        departments = query_db('SELECT * FROM departments ORDER BY id')
        departments_list = [row_to_dict(dept) for dept in departments]
        
        return jsonify({
            'success': True,
            'data': departments_list,
            'message': '获取部门列表成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取部门列表失败: {str(e)}'
        }), 500

@departments_bp.route('/<int:dept_id>', methods=['GET'])
@login_required
def get_department(dept_id):
    try:
        department = query_db(
            'SELECT * FROM departments WHERE id = ?',
            (dept_id,),
            one=True
        )
        
        if not department:
            return jsonify({
                'success': False,
                'data': {},
                'message': '部门不存在'
            }), 404
        
        return jsonify({
            'success': True,
            'data': row_to_dict(department),
            'message': '获取部门详情成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取部门详情失败: {str(e)}'
        }), 500

@departments_bp.route('', methods=['POST'])
@role_required('管理员')
def create_department():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请求数据不能为空'
            }), 400
        
        name = data.get('name')
        description = data.get('description', '')
        
        if not name:
            return jsonify({
                'success': False,
                'data': {},
                'message': '部门名称不能为空'
            }), 400
        
        existing = query_db(
            'SELECT id FROM departments WHERE name = ?',
            (name,),
            one=True
        )
        if existing:
            return jsonify({
                'success': False,
                'data': {},
                'message': '部门名称已存在'
            }), 400
        
        dept_id = execute_db(
            'INSERT INTO departments (name, description) VALUES (?, ?)',
            (name, description)
        )
        
        department = query_db(
            'SELECT * FROM departments WHERE id = ?',
            (dept_id,),
            one=True
        )
        
        return jsonify({
            'success': True,
            'data': row_to_dict(department),
            'message': '创建部门成功'
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'创建部门失败: {str(e)}'
        }), 500

@departments_bp.route('/<int:dept_id>', methods=['PUT'])
@role_required('管理员')
def update_department(dept_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'data': {},
                'message': '请求数据不能为空'
            }), 400
        
        department = query_db(
            'SELECT * FROM departments WHERE id = ?',
            (dept_id,),
            one=True
        )
        
        if not department:
            return jsonify({
                'success': False,
                'data': {},
                'message': '部门不存在'
            }), 404
        
        name = data.get('name', department['name'])
        description = data.get('description', department['description'])
        
        if not name:
            return jsonify({
                'success': False,
                'data': {},
                'message': '部门名称不能为空'
            }), 400
        
        existing = query_db(
            'SELECT id FROM departments WHERE name = ? AND id != ?',
            (name, dept_id),
            one=True
        )
        if existing:
            return jsonify({
                'success': False,
                'data': {},
                'message': '部门名称已存在'
            }), 400
        
        execute_db(
            'UPDATE departments SET name = ?, description = ? WHERE id = ?',
            (name, description, dept_id)
        )
        
        department = query_db(
            'SELECT * FROM departments WHERE id = ?',
            (dept_id,),
            one=True
        )
        
        return jsonify({
            'success': True,
            'data': row_to_dict(department),
            'message': '更新部门成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'更新部门失败: {str(e)}'
        }), 500

@departments_bp.route('/<int:dept_id>', methods=['DELETE'])
@role_required('管理员')
def delete_department(dept_id):
    try:
        department = query_db(
            'SELECT * FROM departments WHERE id = ?',
            (dept_id,),
            one=True
        )
        
        if not department:
            return jsonify({
                'success': False,
                'data': {},
                'message': '部门不存在'
            }), 404
        
        execute_db('DELETE FROM departments WHERE id = ?', (dept_id,))
        
        return jsonify({
            'success': True,
            'data': {},
            'message': '删除部门成功'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'删除部门失败: {str(e)}'
        }), 500
