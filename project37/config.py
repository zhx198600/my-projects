import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    DATABASE_PATH = os.getenv('DATABASE_PATH', os.path.join(BASE_DIR, 'database', 'attendance.db'))
    
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))
    
    WORK_START_TIME = os.getenv('WORK_START_TIME', '09:00')
    WORK_END_TIME = os.getenv('WORK_END_TIME', '18:00')
    
    BACKUP_DIR = os.getenv('BACKUP_DIR', os.path.join(BASE_DIR, 'backups'))
    
    CACHE_ENABLED = os.getenv('CACHE_ENABLED', 'true').lower() == 'true'
    CACHE_TTL = int(os.getenv('CACHE_TTL', '300'))
    
    SWAGGER_UI_DOC_EXPANSION = 'list'
    RESTX_VALIDATE = True
    RESTX_MASK_SWAGGER = False
    RESTX_ERROR_404_HELP = False

config = Config()
