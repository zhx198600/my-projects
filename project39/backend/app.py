from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import sys
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.init_db import init_database, DB_PATH

app = Flask(__name__)
CORS(app)

app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'pdf'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def detect_invoice_risk(invoice_data):
    import re
    from datetime import datetime, timedelta
    
    risk_flags = []
    risk_level = '正常'
    is_abnormal = False
    abnormal_reasons = []
    
    invoice_number = str(invoice_data.get('invoice_number', '')).strip()
    invoice_code = str(invoice_data.get('invoice_code', '')).strip()
    amount = float(invoice_data.get('amount', 0) or 0)
    tax_amount = float(invoice_data.get('tax_amount', 0) or 0)
    total_amount = float(invoice_data.get('total_amount', 0) or 0)
    invoice_date_str = invoice_data.get('invoice_date', '')
    seller_tax_id = str(invoice_data.get('seller_tax_id', '')).strip()
    buyer_tax_id = str(invoice_data.get('buyer_tax_id', '')).strip()
    seller_name = str(invoice_data.get('seller_name', '')).strip()
    buyer_name = str(invoice_data.get('buyer_name', '')).strip()
    
    if len(invoice_number) < 8 or not invoice_number.isdigit():
        risk_flags.append('发票号码格式异常')
        abnormal_reasons.append('发票号码格式不符合规范')
    
    if len(invoice_code) < 10 or not invoice_code.isdigit():
        risk_flags.append('发票代码格式异常')
        abnormal_reasons.append('发票代码格式不符合规范')
    
    if amount <= 0:
        risk_flags.append('金额异常')
        abnormal_reasons.append('发票金额小于等于0')
    
    if total_amount <= 0:
        risk_flags.append('价税合计异常')
        abnormal_reasons.append('价税合计小于等于0')
    
    if abs(total_amount - (amount + tax_amount)) > 0.01:
        risk_flags.append('税额计算异常')
        abnormal_reasons.append('价税合计不等于金额加税额')
    
    if amount > 0 and tax_amount > 0:
        calc_rate = (tax_amount / amount) * 100
        valid_rates = [0, 6, 9, 13]
        if not any(abs(calc_rate - r) < 0.5 for r in valid_rates):
            risk_flags.append('税率异常')
            abnormal_reasons.append(f'税率{calc_rate:.1f}%不在正常范围内（0%/6%/9%/13%）')
    
    if invoice_date_str:
        try:
            invoice_date = datetime.strptime(invoice_date_str, '%Y-%m-%d').date()
            today = datetime.now().date()
            
            if invoice_date > today:
                risk_flags.append('未来日期发票')
                abnormal_reasons.append('开票日期晚于当前日期')
            
            if invoice_date < (today - timedelta(days=365)):
                risk_flags.append('超期发票')
                abnormal_reasons.append('开票日期超过一年')
        except:
            risk_flags.append('日期格式异常')
            abnormal_reasons.append('开票日期格式不正确')
    
    tax_id_pattern = r'^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$'
    if seller_tax_id and not re.match(tax_id_pattern, seller_tax_id):
        risk_flags.append('销售方税号异常')
        abnormal_reasons.append('销售方纳税人识别号格式不符合规范')
    
    if buyer_tax_id and not re.match(tax_id_pattern, buyer_tax_id):
        risk_flags.append('购买方税号异常')
        abnormal_reasons.append('购买方纳税人识别号格式不符合规范')
    
    if not seller_name:
        risk_flags.append('销售方信息缺失')
        abnormal_reasons.append('销售方名称为空')
    
    if not buyer_name:
        risk_flags.append('购买方信息缺失')
        abnormal_reasons.append('购买方名称为空')
    
    if total_amount > 1000000:
        risk_flags.append('大额发票')
        abnormal_reasons.append('发票金额超过100万，需重点关注')
    
    if len(risk_flags) >= 3:
        risk_level = '高风险'
        is_abnormal = True
    elif len(risk_flags) >= 2:
        risk_level = '中风险'
        is_abnormal = True
    elif len(risk_flags) >= 1:
        risk_level = '低风险'
        is_abnormal = True
    
    return {
        'risk_level': risk_level,
        'risk_flags': ','.join(risk_flags),
        'is_abnormal': 1 if is_abnormal else 0,
        'abnormal_reason': ';'.join(abnormal_reasons)
    }


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': '服务运行正常'})


@app.route('/api/invoices', methods=['GET'])
def get_invoices():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '', type=str)
    
    offset = (page - 1) * per_page
    
    conn = get_db_connection()
    
    if search:
        like_pattern = f'%{search}%'
        invoices = conn.execute('''
            SELECT * FROM invoices 
            WHERE invoice_number LIKE ? 
               OR invoice_code LIKE ? 
               OR seller_name LIKE ? 
               OR buyer_name LIKE ?
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ''', (like_pattern, like_pattern, like_pattern, like_pattern, per_page, offset)).fetchall()
        
        total = conn.execute('''
            SELECT COUNT(*) FROM invoices 
            WHERE invoice_number LIKE ? 
               OR invoice_code LIKE ? 
               OR seller_name LIKE ? 
               OR buyer_name LIKE ?
        ''', (like_pattern, like_pattern, like_pattern, like_pattern)).fetchone()[0]
    else:
        invoices = conn.execute('SELECT * FROM invoices ORDER BY created_at DESC LIMIT ? OFFSET ?', 
                               (per_page, offset)).fetchall()
        total = conn.execute('SELECT COUNT(*) FROM invoices').fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'invoices': [dict(invoice) for invoice in invoices],
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })


@app.route('/api/invoices/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    conn = get_db_connection()
    invoice = conn.execute('SELECT * FROM invoices WHERE id = ?', (invoice_id,)).fetchone()
    conn.close()
    
    if invoice:
        return jsonify(dict(invoice))
    return jsonify({'error': '发票不存在'}), 404


@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        existing = conn.execute('''
            SELECT id FROM invoices WHERE invoice_number = ? AND invoice_code = ?
        ''', (data.get('invoice_number', ''), data.get('invoice_code', ''))).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': '该发票已存在', 'existing_id': existing['id']}), 409
        
        cursor.execute('''
            INSERT INTO invoices (
                invoice_number, invoice_code, invoice_date, amount, tax_amount,
                total_amount, seller_name, seller_tax_id, buyer_name, buyer_tax_id,
                invoice_type, status, file_path, remark
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('invoice_number', ''), data.get('invoice_code', ''),
            data.get('invoice_date', ''), data.get('amount', 0),
            data.get('tax_amount', 0), data.get('total_amount', 0),
            data.get('seller_name', ''), data.get('seller_tax_id', ''),
            data.get('buyer_name', ''), data.get('buyer_tax_id', ''),
            data.get('invoice_type', '普通发票'), data.get('status', '待审核'),
            data.get('file_path', ''), data.get('remark', '')
        ))
        conn.commit()
        invoice_id = cursor.lastrowid
        
        risk_result = detect_invoice_risk(data)
        conn.execute('''
            UPDATE invoices SET
                risk_level = ?,
                risk_flags = ?,
                is_abnormal = ?,
                abnormal_reason = ?
            WHERE id = ?
        ''', (
            risk_result['risk_level'],
            risk_result['risk_flags'],
            risk_result['is_abnormal'],
            risk_result['abnormal_reason'],
            invoice_id
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': invoice_id,
            'message': '创建成功',
            'risk': risk_result
        }), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': f'创建失败: {str(e)}'}), 400


@app.route('/api/invoices/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    data = request.json
    conn = get_db_connection()
    
    invoice = conn.execute('SELECT * FROM invoices WHERE id = ?', (invoice_id,)).fetchone()
    if not invoice:
        conn.close()
        return jsonify({'error': '发票不存在'}), 404
    
    try:
        conn.execute('''
            UPDATE invoices SET
                invoice_number = ?, invoice_code = ?, invoice_date = ?, 
                amount = ?, tax_amount = ?, total_amount = ?,
                seller_name = ?, seller_tax_id = ?, buyer_name = ?, buyer_tax_id = ?,
                invoice_type = ?, status = ?, remark = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            data.get('invoice_number', invoice['invoice_number']),
            data.get('invoice_code', invoice['invoice_code']),
            data.get('invoice_date', invoice['invoice_date']),
            data.get('amount', invoice['amount']),
            data.get('tax_amount', invoice['tax_amount']),
            data.get('total_amount', invoice['total_amount']),
            data.get('seller_name', invoice['seller_name']),
            data.get('seller_tax_id', invoice['seller_tax_id']),
            data.get('buyer_name', invoice['buyer_name']),
            data.get('buyer_tax_id', invoice['buyer_tax_id']),
            data.get('invoice_type', invoice['invoice_type']),
            data.get('status', invoice['status']),
            data.get('remark', invoice['remark']),
            invoice_id
        ))
        conn.commit()
        conn.close()
        return jsonify({'message': '更新成功'})
    except Exception as e:
        conn.close()
        return jsonify({'error': f'更新失败: {str(e)}'}), 400


@app.route('/api/invoices/<int:invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    conn = get_db_connection()
    
    invoice = conn.execute('SELECT * FROM invoices WHERE id = ?', (invoice_id,)).fetchone()
    if not invoice:
        conn.close()
        return jsonify({'error': '发票不存在'}), 404
    
    conn.execute('DELETE FROM invoices WHERE id = ?', (invoice_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': '删除成功'})


@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': '没有找到文件'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': '不支持的文件格式，仅支持 JPG、PNG、PDF'}), 400
    
    try:
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        relative_path = f"uploads/{unique_filename}"
        
        return jsonify({
            'success': True,
            'message': '上传成功',
            'file_path': relative_path,
            'file_name': filename,
            'unique_name': unique_filename,
            'file_ext': file_ext
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'上传失败: {str(e)}'}), 500


@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/export', methods=['GET'])
def export_invoices():
    format_type = request.args.get('format', 'csv')
    conn = get_db_connection()
    invoices = conn.execute('SELECT * FROM invoices ORDER BY created_at DESC').fetchall()
    conn.close()
    
    if not invoices:
        return jsonify({'error': '没有数据可导出'}), 400
    
    import csv
    import io
    from flask import Response
    
    output = io.StringIO()
    
    if format_type == 'csv':
        writer = csv.writer(output)
        headers = ['ID', '发票号码', '发票代码', '开票日期', '金额', '税额', '价税合计',
                   '销售方名称', '销售方税号', '购买方名称', '购买方税号', 
                   '发票类型', '状态', '创建时间', '备注']
        writer.writerow(headers)
        
        for inv in invoices:
            writer.writerow([
                inv['id'], inv['invoice_number'], inv['invoice_code'], inv['invoice_date'],
                inv['amount'], inv['tax_amount'], inv['total_amount'],
                inv['seller_name'], inv['seller_tax_id'], inv['buyer_name'], inv['buyer_tax_id'],
                inv['invoice_type'], inv['status'], inv['created_at'], inv.get('remark', '')
            ])
        
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=invoices.csv'}
        )
    
    elif format_type == 'excel':
        try:
            import pandas as pd
            
            data = []
            for inv in invoices:
                data.append({
                    'ID': inv['id'],
                    '发票号码': inv['invoice_number'],
                    '发票代码': inv['invoice_code'],
                    '开票日期': inv['invoice_date'],
                    '金额': inv['amount'],
                    '税额': inv['tax_amount'],
                    '价税合计': inv['total_amount'],
                    '销售方名称': inv['seller_name'],
                    '销售方税号': inv['seller_tax_id'],
                    '购买方名称': inv['buyer_name'],
                    '购买方税号': inv['buyer_tax_id'],
                    '发票类型': inv['invoice_type'],
                    '状态': inv['status'],
                    '创建时间': inv['created_at'],
                    '备注': inv.get('remark', '')
                })
            
            df = pd.DataFrame(data)
            output = io.BytesIO()
            df.to_excel(output, index=False, engine='openpyxl')
            output.seek(0)
            
            return Response(
                output.getvalue(),
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                headers={'Content-Disposition': 'attachment; filename=invoices.xlsx'}
            )
        except Exception as e:
            return jsonify({'error': f'导出失败: {str(e)}'}), 500
    
    return jsonify({'error': '不支持的导出格式'}), 400


def get_empty_result():
    return {
        'invoice_number': '',
        'invoice_code': '',
        'invoice_date': '',
        'amount': 0,
        'tax_amount': 0,
        'total_amount': 0,
        'seller_name': '',
        'seller_tax_id': '',
        'buyer_name': '',
        'buyer_tax_id': '',
        'invoice_type': '增值税普通发票'
    }


@app.route('/api/recognize', methods=['POST'])
def recognize_invoice():
    data = request.json
    file_path = data.get('file_path', '')
    file_ext = data.get('file_ext', '').lower()
    
    if not file_path:
        return jsonify({'success': True, 'data': get_empty_result(), 'warning': '文件路径为空'}), 200
    
    full_path = os.path.join(os.path.dirname(__file__), '..', file_path)
    
    if not os.path.exists(full_path):
        return jsonify({'success': True, 'data': get_empty_result(), 'warning': '文件不存在'}), 200
    
    text = ''
    ocr_available = True
    
    try:
        import pytesseract
        from PIL import Image
        
        try:
            pytesseract.get_tesseract_version()
        except Exception:
            ocr_available = False
    except ImportError:
        ocr_available = False
    
    if file_ext in ['jpg', 'jpeg', 'png']:
        if ocr_available:
            try:
                from PIL import Image
                import pytesseract
                
                image = Image.open(full_path)
                try:
                    text = pytesseract.image_to_string(image, lang='chi_sim+eng')
                except pytesseract.TesseractError:
                    text = pytesseract.image_to_string(image, lang='eng')
            except Exception as e:
                print(f"OCR识别失败: {str(e)}")
                text = ''
    elif file_ext == 'pdf':
        try:
            import subprocess
            result = subprocess.run(['pdftotext', full_path, '-'], 
                                  capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                text = result.stdout
            else:
                if ocr_available:
                    try:
                        from pdf2image import convert_from_path
                        import pytesseract
                        
                        images = convert_from_path(full_path)
                        for image in images:
                            try:
                                text += pytesseract.image_to_string(image, lang='chi_sim+eng')
                            except pytesseract.TesseractError:
                                text += pytesseract.image_to_string(image, lang='eng')
                    except Exception as e:
                        print(f"PDF OCR识别失败: {str(e)}")
        except Exception as e:
            print(f"PDF处理失败: {str(e)}")
            if ocr_available:
                try:
                    from pdf2image import convert_from_path
                    import pytesseract
                    
                    images = convert_from_path(full_path)
                    for image in images:
                        try:
                            text += pytesseract.image_to_string(image, lang='chi_sim+eng')
                        except pytesseract.TesseractError:
                            text += pytesseract.image_to_string(image, lang='eng')
                except Exception as e:
                    print(f"PDF OCR识别失败: {str(e)}")
    
    if text.strip():
        result = parse_invoice_text(text)
        has_data = any([
            result['invoice_number'],
            result['invoice_code'],
            result['seller_name'],
            result['buyer_name'],
            result['total_amount'] > 0
        ])
        if has_data:
            return jsonify({
                'success': True,
                'data': result
            })
    
    return jsonify({
        'success': True,
        'data': get_empty_result(),
        'warning': '无法自动识别，请手动填写发票信息'
    })


def parse_invoice_text(text):
    import re
    
    result = {
        'invoice_number': '',
        'invoice_code': '',
        'invoice_date': '',
        'amount': 0,
        'tax_amount': 0,
        'total_amount': 0,
        'seller_name': '',
        'seller_tax_id': '',
        'buyer_name': '',
        'buyer_tax_id': '',
        'invoice_type': '增值税普通发票'
    }
    
    invoice_number_match = re.search(r'发票号码[:：]\s*(\d+)', text)
    if invoice_number_match:
        result['invoice_number'] = invoice_number_match.group(1)
    
    invoice_code_match = re.search(r'发票代码[:：]\s*(\d+)', text)
    if invoice_code_match:
        result['invoice_code'] = invoice_code_match.group(1)
    
    date_match = re.search(r'开票日期[:：]\s*(\d{4}[-\/年]\d{1,2}[-\/月]\d{1,2})', text)
    if date_match:
        date_str = date_match.group(1).replace('年', '-').replace('月', '-').replace('/', '-')
        result['invoice_date'] = date_str
    
    total_match = re.search(r'价税合计[^\d]*([\d,]+\.?\d*)', text)
    if total_match:
        result['total_amount'] = float(total_match.group(1).replace(',', ''))
    
    amount_match = re.search(r'金额[^\d]*([\d,]+\.?\d*)', text)
    if amount_match:
        result['amount'] = float(amount_match.group(1).replace(',', ''))
    
    tax_match = re.search(r'税额[^\d]*([\d,]+\.?\d*)', text)
    if tax_match:
        result['tax_amount'] = float(tax_match.group(1).replace(',', ''))
    
    seller_match = re.search(r'销售方.*?名\s*称[:：]\s*(.+)', text)
    if seller_match:
        result['seller_name'] = seller_match.group(1).strip()
    
    seller_tax_match = re.search(r'销售方.*?纳税人识别号[:：]\s*(\w+)', text)
    if seller_tax_match:
        result['seller_tax_id'] = seller_tax_match.group(1)
    
    buyer_match = re.search(r'购买方.*?名\s*称[:：]\s*(.+)', text)
    if buyer_match:
        result['buyer_name'] = buyer_match.group(1).strip()
    
    buyer_tax_match = re.search(r'购买方.*?纳税人识别号[:：]\s*(\w+)', text)
    if buyer_tax_match:
        result['buyer_tax_id'] = buyer_tax_match.group(1)
    
    if '专用发票' in text:
        result['invoice_type'] = '增值税专用发票'
    elif '电子发票' in text:
        result['invoice_type'] = '电子发票'
    
    return result


@app.route('/api/invoices/<int:invoice_id>/check-risk', methods=['POST'])
def check_invoice_risk(invoice_id):
    conn = get_db_connection()
    invoice = conn.execute('SELECT * FROM invoices WHERE id = ?', (invoice_id,)).fetchone()
    
    if not invoice:
        conn.close()
        return jsonify({'error': '发票不存在'}), 404
    
    risk_result = detect_invoice_risk(dict(invoice))
    
    try:
        conn.execute('''
            UPDATE invoices SET
                risk_level = ?,
                risk_flags = ?,
                is_abnormal = ?,
                abnormal_reason = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            risk_result['risk_level'],
            risk_result['risk_flags'],
            risk_result['is_abnormal'],
            risk_result['abnormal_reason'],
            invoice_id
        ))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'risk': risk_result
        })
    except Exception as e:
        conn.close()
        return jsonify({'error': f'风险检测失败: {str(e)}'}), 500


@app.route('/api/risk/scan-all', methods=['POST'])
def scan_all_risk():
    conn = get_db_connection()
    invoices = conn.execute('SELECT * FROM invoices').fetchall()
    
    results = []
    updated_count = 0
    
    for invoice in invoices:
        risk_result = detect_invoice_risk(dict(invoice))
        
        if risk_result['is_abnormal']:
            try:
                conn.execute('''
                    UPDATE invoices SET
                        risk_level = ?,
                        risk_flags = ?,
                        is_abnormal = ?,
                        abnormal_reason = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', (
                    risk_result['risk_level'],
                    risk_result['risk_flags'],
                    risk_result['is_abnormal'],
                    risk_result['abnormal_reason'],
                    invoice['id']
                ))
                updated_count += 1
                results.append({
                    'invoice_id': invoice['id'],
                    'invoice_number': invoice['invoice_number'],
                    'risk': risk_result
                })
            except Exception as e:
                print(f"更新发票 {invoice['id']} 风险信息失败: {str(e)}")
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': f'扫描完成，共发现 {updated_count} 张异常发票',
        'abnormal_count': updated_count,
        'results': results
    })


@app.route('/api/risk/statistics', methods=['GET'])
def get_risk_statistics():
    conn = get_db_connection()
    
    total = conn.execute('SELECT COUNT(*) as cnt FROM invoices').fetchone()['cnt']
    abnormal = conn.execute('SELECT COUNT(*) as cnt FROM invoices WHERE is_abnormal = 1').fetchone()['cnt']
    high_risk = conn.execute('SELECT COUNT(*) as cnt FROM invoices WHERE risk_level = ?', ('高风险',)).fetchone()['cnt']
    medium_risk = conn.execute('SELECT COUNT(*) as cnt FROM invoices WHERE risk_level = ?', ('中风险',)).fetchone()['cnt']
    low_risk = conn.execute('SELECT COUNT(*) as cnt FROM invoices WHERE risk_level = ?', ('低风险',)).fetchone()['cnt']
    normal = conn.execute('SELECT COUNT(*) as cnt FROM invoices WHERE risk_level = ? OR risk_level IS NULL', ('正常',)).fetchone()['cnt']
    
    abnormal_invoices = conn.execute('''
        SELECT id, invoice_number, invoice_code, total_amount, risk_level, 
               risk_flags, abnormal_reason, created_at
        FROM invoices 
        WHERE is_abnormal = 1 
        ORDER BY 
            CASE risk_level 
                WHEN '高风险' THEN 1 
                WHEN '中风险' THEN 2 
                WHEN '低风险' THEN 3 
                ELSE 4 
            END,
            created_at DESC
        LIMIT 50
    ''').fetchall()
    
    conn.close()
    
    return jsonify({
        'total': total,
        'abnormal': abnormal,
        'high_risk': high_risk,
        'medium_risk': medium_risk,
        'low_risk': low_risk,
        'normal': normal,
        'abnormal_rate': (abnormal / total * 100) if total > 0 else 0,
        'abnormal_invoices': [dict(inv) for inv in abnormal_invoices]
    })


@app.route('/api/invoices/abnormal', methods=['GET'])
def get_abnormal_invoices():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    risk_level = request.args.get('risk_level', '', type=str)
    
    offset = (page - 1) * per_page
    
    conn = get_db_connection()
    
    base_query = 'FROM invoices WHERE is_abnormal = 1'
    params = []
    
    if risk_level:
        base_query += ' AND risk_level = ?'
        params.append(risk_level)
    
    count_query = f'SELECT COUNT(*) as cnt {base_query}'
    total = conn.execute(count_query, params).fetchone()['cnt']
    
    data_query = f'''
        SELECT * {base_query}
        ORDER BY 
            CASE risk_level 
                WHEN '高风险' THEN 1 
                WHEN '中风险' THEN 2 
                WHEN '低风险' THEN 3 
                ELSE 4 
            END,
            created_at DESC
        LIMIT ? OFFSET ?
    '''
    params.extend([per_page, offset])
    invoices = conn.execute(data_query, params).fetchall()
    
    conn.close()
    
    return jsonify({
        'invoices': [dict(invoice) for invoice in invoices],
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })


@app.route('/api/backup', methods=['POST'])
def backup_database():
    try:
        backup_dir = os.path.join(os.path.dirname(__file__), '..', 'database', 'backups')
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f'invoices_backup_{timestamp}.db'
        backup_path = os.path.join(backup_dir, backup_filename)
        
        import shutil
        shutil.copy2(DB_PATH, backup_path)
        
        return jsonify({
            'success': True,
            'message': '数据库备份成功',
            'backup_file': backup_filename
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'备份失败: {str(e)}'}), 500


@app.route('/api/backups', methods=['GET'])
def list_backups():
    try:
        backup_dir = os.path.join(os.path.dirname(__file__), '..', 'database', 'backups')
        if not os.path.exists(backup_dir):
            return jsonify({'backups': []})
        
        backups = []
        for filename in sorted(os.listdir(backup_dir), reverse=True):
            if filename.endswith('.db'):
                filepath = os.path.join(backup_dir, filename)
                stat = os.stat(filepath)
                backups.append({
                    'filename': filename,
                    'size': stat.st_size,
                    'created_at': datetime.fromtimestamp(stat.st_mtime).isoformat()
                })
        
        return jsonify({'backups': backups})
    except Exception as e:
        return jsonify({'error': f'获取备份列表失败: {str(e)}'}), 500


@app.route('/api/restore', methods=['POST'])
def restore_database():
    data = request.json
    backup_file = data.get('backup_file', '')
    
    if not backup_file:
        return jsonify({'success': False, 'error': '请提供备份文件名'}), 400
    
    try:
        backup_dir = os.path.join(os.path.dirname(__file__), '..', 'database', 'backups')
        backup_path = os.path.join(backup_dir, backup_file)
        
        if not os.path.exists(backup_path):
            return jsonify({'success': False, 'error': '备份文件不存在'}), 404
        
        import shutil
        shutil.copy2(backup_path, DB_PATH)
        
        return jsonify({
            'success': True,
            'message': '数据库恢复成功'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'恢复失败: {str(e)}'}), 500


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': '文件大小超过限制，最大支持 10MB'}), 413


if __name__ == '__main__':
    if not os.path.exists(DB_PATH):
        init_database()
    app.run(host='0.0.0.0', port=5001, debug=False)
