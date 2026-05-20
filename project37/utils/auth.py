import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
from config import config

SECRET_KEY = config.JWT_SECRET_KEY
JWT_ALGORITHM = config.JWT_ALGORITHM
JWT_EXPIRATION_HOURS = config.JWT_EXPIRATION_HOURS

def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
    # PyJWT 2.x 返回bytes，需要转为字符串
    return token if isinstance(token, str) else token.decode('utf-8')

def decode_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({
                'success': False,
                'data': {},
                'message': '缺少认证令牌'
            }), 401
        
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({
                'success': False,
                'data': {},
                'message': '认证令牌格式错误'
            }), 401
        
        token = parts[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({
                'success': False,
                'data': {},
                'message': '无效或过期的令牌'
            }), 401
        
        g.user_id = payload['user_id']
        g.user_role = payload['role']
        return f(*args, **kwargs)
    return decorated_function

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        @login_required
        def decorated_function(*args, **kwargs):
            if g.user_role not in roles:
                return jsonify({
                    'success': False,
                    'data': {},
                    'message': '权限不足'
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
