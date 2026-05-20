from flask import Blueprint, jsonify, send_file
from utils.auth import role_required
from utils.backup import create_backup, list_backups, get_backup_path
from utils.errors import NotFoundException
import os

system_bp = Blueprint('system', __name__, url_prefix='/api/system')

@system_bp.route('/backup', methods=['POST'])
@role_required('管理员')
def backup_database():
    try:
        filename = create_backup()
        return jsonify({
            'success': True,
            'data': {
                'filename': filename
            },
            'message': '数据库备份成功'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'备份失败: {str(e)}'
        }), 500

@system_bp.route('/backups', methods=['GET'])
@role_required('管理员')
def get_backups():
    try:
        backups = list_backups()
        return jsonify({
            'success': True,
            'data': {
                'backups': backups,
                'total': len(backups)
            },
            'message': '获取备份列表成功'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'获取备份列表失败: {str(e)}'
        }), 500

@system_bp.route('/backup/<filename>', methods=['GET'])
@role_required('管理员')
def download_backup(filename):
    try:
        filepath = get_backup_path(filename)
        return send_file(
            filepath,
            as_attachment=True,
            download_name=filename,
            mimetype='application/x-sqlite3'
        )
    except FileNotFoundError:
        raise NotFoundException('备份文件不存在')
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'下载备份失败: {str(e)}'
        }), 500

@system_bp.route('/backup/<filename>', methods=['DELETE'])
@role_required('管理员')
def delete_backup_route(filename):
    try:
        from utils.backup import delete_backup
        delete_backup(filename)
        return jsonify({
            'success': True,
            'data': {},
            'message': '删除备份文件成功'
        }), 200
    except FileNotFoundError:
        raise NotFoundException('备份文件不存在')
    except Exception as e:
        return jsonify({
            'success': False,
            'data': {},
            'message': f'删除备份失败: {str(e)}'
        }), 500
