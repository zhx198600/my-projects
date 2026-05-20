from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), nullable=False)
    invoice_code = db.Column(db.String(50), nullable=False)
    invoice_date = db.Column(db.String(20))
    amount = db.Column(db.Float, default=0.0)
    tax_amount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, default=0.0)
    seller_name = db.Column(db.String(200))
    seller_tax_id = db.Column(db.String(50))
    buyer_name = db.Column(db.String(200))
    buyer_tax_id = db.Column(db.String(50))
    invoice_type = db.Column(db.String(50))
    status = db.Column(db.String(50), default='pending')
    file_path = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'invoice_code': self.invoice_code,
            'invoice_date': self.invoice_date,
            'amount': self.amount,
            'tax_amount': self.tax_amount,
            'total_amount': self.total_amount,
            'seller_name': self.seller_name,
            'seller_tax_id': self.seller_tax_id,
            'buyer_name': self.buyer_name,
            'buyer_tax_id': self.buyer_tax_id,
            'invoice_type': self.invoice_type,
            'status': self.status,
            'file_path': self.file_path,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
