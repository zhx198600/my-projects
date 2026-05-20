from flask import jsonify

class AttendanceException(Exception):
    status_code = 500
    error_code = 'INTERNAL_ERROR'
    
    def __init__(self, message, status_code=None, error_code=None, payload=None):
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        if error_code is not None:
            self.error_code = error_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['success'] = False
        rv['message'] = self.message
        rv['error_code'] = self.error_code
        rv['data'] = {}
        return rv

class ValidationException(AttendanceException):
    status_code = 400
    error_code = 'VALIDATION_ERROR'

class AuthenticationException(AttendanceException):
    status_code = 401
    error_code = 'AUTHENTICATION_FAILED'

class AuthorizationException(AttendanceException):
    status_code = 403
    error_code = 'PERMISSION_DENIED'

class NotFoundException(AttendanceException):
    status_code = 404
    error_code = 'RESOURCE_NOT_FOUND'

class ConflictException(AttendanceException):
    status_code = 409
    error_code = 'RESOURCE_CONFLICT'

def register_error_handlers(app):
    @app.errorhandler(AttendanceException)
    def handle_attendance_exception(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'message': '请求参数错误',
            'error_code': 'BAD_REQUEST',
            'data': {}
        }), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'success': False,
            'message': '未授权访问',
            'error_code': 'UNAUTHORIZED',
            'data': {}
        }), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'success': False,
            'message': '权限不足',
            'error_code': 'FORBIDDEN',
            'data': {}
        }), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': '资源不存在',
            'error_code': 'NOT_FOUND',
            'data': {}
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'message': '请求方法不允许',
            'error_code': 'METHOD_NOT_ALLOWED',
            'data': {}
        }), 405

    @app.errorhandler(409)
    def conflict(error):
        return jsonify({
            'success': False,
            'message': '资源冲突',
            'error_code': 'CONFLICT',
            'data': {}
        }), 409

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': '服务器内部错误',
            'error_code': 'INTERNAL_SERVER_ERROR',
            'data': {}
        }), 500

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        return jsonify({
            'success': False,
            'message': str(error),
            'error_code': 'UNEXPECTED_ERROR',
            'data': {}
        }), 500
