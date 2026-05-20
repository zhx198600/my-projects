from flask_restx import Api, Namespace, fields

authorizations = {
    'Bearer': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': 'JWT Bearer token 格式: Bearer {token}'
    }
}

def init_swagger(app):
    api = Api(
        app,
        version='1.0.0',
        title='员工考勤管理系统 API',
        description='员工考勤管理系统的 RESTful API 文档',
        authorizations=authorizations,
        security='Bearer',
        doc='/api/docs',
        add_specs=True
    )
    
    return api

def create_auth_namespace(api):
    auth_ns = api.namespace('auth', description='认证相关接口')
    
    login_model = auth_ns.model('Login', {
        'employee_no': fields.String(required=True, description='员工编号'),
        'password': fields.String(required=True, description='密码')
    })
    
    token_response = auth_ns.model('TokenResponse', {
        'success': fields.Boolean(description='是否成功'),
        'message': fields.String(description='消息'),
        'data': fields.Nested(auth_ns.model('TokenData', {
            'token': fields.String(description='JWT令牌')
        }))
    })
    
    return auth_ns, login_model, token_response

def create_system_namespace(api):
    system_ns = api.namespace('system', description='系统管理接口')
    
    backup_response = system_ns.model('BackupResponse', {
        'success': fields.Boolean(description='是否成功'),
        'message': fields.String(description='消息'),
        'data': fields.Nested(system_ns.model('BackupData', {
            'filename': fields.String(description='备份文件名')
        }))
    })
    
    backups_response = system_ns.model('BackupsResponse', {
        'success': fields.Boolean(description='是否成功'),
        'message': fields.String(description='消息'),
        'data': fields.Nested(system_ns.model('BackupsData', {
            'total': fields.Integer(description='总数'),
            'backups': fields.List(fields.Nested(system_ns.model('BackupInfo', {
                'filename': fields.String(description='文件名'),
                'size': fields.Integer(description='文件大小(字节)'),
                'created_at': fields.String(description='创建时间')
            })))
        }))
    })
    
    return system_ns, backup_response, backups_response
