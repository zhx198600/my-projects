from app import app, db

def init_database():
    with app.app_context():
        db.create_all()
        print('Database and tables created successfully!')
        print('Database location: ../database/invoices.db')
        print('Table: invoices')
        print('Fields: id, invoice_number, invoice_code, invoice_date, amount, tax_amount,')
        print('        total_amount, seller_name, seller_tax_id, buyer_name, buyer_tax_id,')
        print('        invoice_type, status, created_at, updated_at, file_path, remarks')
        print('Unique constraint: invoice_number + invoice_code')

if __name__ == '__main__':
    init_database()
