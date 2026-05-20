from flask import Flask, jsonify, send_from_directory
from utils.database import close_db
from utils.errors import register_error_handlers
from routes.auth import auth_bp
from routes.departments import departments_bp
from routes.employees import employees_bp
from routes.attendance import attendance_bp
from routes.leave import leave_bp
from routes.statistics import statistics_bp, export_bp
from routes.system import system_bp
import os

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

app.teardown_appcontext(close_db)

register_error_handlers(app)

app.register_blueprint(auth_bp)
app.register_blueprint(departments_bp)
app.register_blueprint(employees_bp)
app.register_blueprint(attendance_bp)
app.register_blueprint(leave_bp)
app.register_blueprint(statistics_bp)
app.register_blueprint(export_bp)
app.register_blueprint(system_bp)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/api/')
def api_info():
    return jsonify({
        'success': True,
        'data': {
            'name': '员工考勤管理系统 API',
            'version': '1.0.0',
            'endpoints': {
                'auth': {
                    'POST /api/auth/login': '用户登录',
                    'GET /api/auth/me': '获取当前用户信息'
                },
                'departments': {
                    'GET /api/departments': '获取所有部门列表',
                    'GET /api/departments/{id}': '获取单个部门详情',
                    'POST /api/departments': '创建部门（仅管理员）',
                    'PUT /api/departments/{id}': '更新部门（仅管理员）',
                    'DELETE /api/departments/{id}': '删除部门（仅管理员）'
                },
                'employees': {
                    'GET /api/employees': '获取员工列表（支持按部门筛选）',
                    'GET /api/employees/{id}': '获取单个员工详情',
                    'POST /api/employees': '创建员工（仅管理员/HR）',
                    'PUT /api/employees/{id}': '更新员工信息（仅管理员/HR/本人）',
                    'DELETE /api/employees/{id}': '删除员工（仅管理员）'
                },
                'attendance': {
                    'POST /api/attendance/clock-in': '上班打卡',
                    'POST /api/attendance/clock-out': '下班打卡',
                    'GET /api/attendance/status': '获取当日打卡状态',
                    'GET /api/attendance/history': '获取打卡历史记录（支持分页和日期筛选）',
                    'GET /api/attendance/employee/{employee_id}': '获取指定员工的打卡记录'
                },
                'leave': {
                    'POST /api/leave/request': '创建请假申请',
                    'PUT /api/leave/request/{id}': '修改请假申请',
                    'PUT /api/leave/request/{id}/cancel': '撤销请假申请',
                    'GET /api/leave/my-requests': '获取我的请假申请列表（支持状态和日期筛选）',
                    'GET /api/leave/request/{id}': '获取请假申请详情'
                },
                'system': {
                    'POST /api/system/backup': '创建数据库备份（仅管理员）',
                    'GET /api/system/backups': '获取备份列表（仅管理员）',
                    'GET /api/system/backup/{filename}': '下载备份文件（仅管理员）',
                    'DELETE /api/system/backup/{filename}': '删除备份文件（仅管理员）'
                }
            },
            'docs': '/api/docs'
        },
        'message': '欢迎使用员工考勤管理系统 API'
    }), 200

@app.route('/api/docs/')
@app.route('/api/docs')
def api_docs():
    docs_dir = os.path.join(os.path.dirname(__file__), 'static', 'docs')
    return send_from_directory(docs_dir, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

@app.route('/favicon.ico')
def favicon():
    return '', 204

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=False)
