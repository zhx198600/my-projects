import os
import shutil
from datetime import datetime
from config import config

def ensure_backup_dir():
    if not os.path.exists(config.BACKUP_DIR):
        os.makedirs(config.BACKUP_DIR)

def create_backup():
    ensure_backup_dir()
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_filename = f'attendance_backup_{timestamp}.db'
    backup_path = os.path.join(config.BACKUP_DIR, backup_filename)
    
    if os.path.exists(config.DATABASE_PATH):
        shutil.copy2(config.DATABASE_PATH, backup_path)
        return backup_filename
    else:
        raise FileNotFoundError('数据库文件不存在')

def list_backups():
    ensure_backup_dir()
    
    backups = []
    for filename in os.listdir(config.BACKUP_DIR):
        if filename.startswith('attendance_backup_') and filename.endswith('.db'):
            filepath = os.path.join(config.BACKUP_DIR, filename)
            stat = os.stat(filepath)
            
            timestamp_str = filename.replace('attendance_backup_', '').replace('.db', '')
            try:
                backup_time = datetime.strptime(timestamp_str, '%Y%m%d_%H%M%S')
            except:
                backup_time = datetime.fromtimestamp(stat.st_mtime)
            
            backups.append({
                'filename': filename,
                'size': stat.st_size,
                'created_at': backup_time.strftime('%Y-%m-%d %H:%M:%S'),
                'path': filepath
            })
    
    backups.sort(key=lambda x: x['created_at'], reverse=True)
    return backups

def get_backup_path(filename):
    ensure_backup_dir()
    
    filepath = os.path.join(config.BACKUP_DIR, filename)
    if not os.path.exists(filepath):
        raise FileNotFoundError('备份文件不存在')
    
    return filepath

def delete_backup(filename):
    filepath = get_backup_path(filename)
    os.remove(filepath)
    return True
