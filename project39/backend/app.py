from flask import Flask
from flask_cors import CORS
from models import db
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, '..', 'database', 'invoice.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(BASE_DIR, '..', 'uploads')

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return {'message': 'Invoice Management System API'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
