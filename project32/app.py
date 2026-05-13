from flask import Flask, jsonify, request, render_template
import sqlite3
import os
import json
import random
from datetime import datetime
from database.init_db import init_database, DB_PATH

app = Flask(__name__)


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def api_response(success, message, data=None, code=200):
    response = {
        'success': success,
        'message': message,
        'data': data,
        'timestamp': datetime.now().isoformat()
    }
    return jsonify(response), code


db_initialized = False


@app.before_request
def initialize_database():
    global db_initialized
    if not db_initialized:
        if not os.path.exists(DB_PATH):
            init_database()
        db_initialized = True


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/health')
def health_check():
    return api_response(True, '系统运行正常', {
        'database': os.path.exists(DB_PATH),
        'timestamp': datetime.now().isoformat()
    })


@app.route('/questions')
def questions_page():
    return render_template('questions.html')


@app.route('/api/tables')
def get_tables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [table[0] for table in cursor.fetchall()]
    conn.close()
    return api_response(True, '查询成功', {
        'tables': tables,
        'count': len(tables)
    })


@app.route('/api/questions/columns')
def get_question_columns():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(questions)")
    columns = [{'name': col[1], 'type': col[2]} for col in cursor.fetchall()]
    conn.close()
    return api_response(True, '查询成功', {
        'table': 'questions',
        'columns': columns
    })


@app.route('/api/questions', methods=['POST'])
def add_question():
    try:
        data = request.get_json()
        
        required_fields = ['subject', 'question_text', 'options', 'correct_answer', 'difficulty']
        for field in required_fields:
            if field not in data:
                return api_response(False, f'缺少必填字段: {field}', None, 400)
        
        if not isinstance(data['options'], (dict, list)):
            return api_response(False, 'options 必须是 JSON 格式', None, 400)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT INTO questions (subject, question_text, options, correct_answer, difficulty)
               VALUES (?, ?, ?, ?, ?)''',
            (data['subject'], data['question_text'], json.dumps(data['options'], ensure_ascii=False),
             data['correct_answer'], data['difficulty'])
        )
        conn.commit()
        question_id = cursor.lastrowid
        
        cursor.execute('SELECT * FROM questions WHERE id = ?', (question_id,))
        question = cursor.fetchone()
        conn.close()
        
        result = dict(question)
        result['options'] = json.loads(result['options'])
        
        return api_response(True, '题目添加成功', result, 201)
    except Exception as e:
        return api_response(False, f'添加失败: {str(e)}', None, 500)


@app.route('/api/questions', methods=['GET'])
def get_questions():
    try:
        subject = request.args.get('subject')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if subject:
            cursor.execute('SELECT * FROM questions WHERE subject = ?', (subject,))
        else:
            cursor.execute('SELECT * FROM questions')
        
        questions = cursor.fetchall()
        conn.close()
        
        result = []
        for q in questions:
            q_dict = dict(q)
            q_dict['options'] = json.loads(q_dict['options'])
            result.append(q_dict)
        
        return api_response(True, '查询成功', result)
    except Exception as e:
        return api_response(False, f'查询失败: {str(e)}', None, 500)


@app.route('/api/questions/<int:question_id>', methods=['PUT'])
def update_question(question_id):
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM questions WHERE id = ?', (question_id,))
        question = cursor.fetchone()
        
        if not question:
            conn.close()
            return api_response(False, '题目不存在', None, 404)
        
        update_fields = []
        params = []
        
        if 'subject' in data:
            update_fields.append('subject = ?')
            params.append(data['subject'])
        if 'question_text' in data:
            update_fields.append('question_text = ?')
            params.append(data['question_text'])
        if 'options' in data:
            update_fields.append('options = ?')
            params.append(json.dumps(data['options'], ensure_ascii=False))
        if 'correct_answer' in data:
            update_fields.append('correct_answer = ?')
            params.append(data['correct_answer'])
        if 'difficulty' in data:
            update_fields.append('difficulty = ?')
            params.append(data['difficulty'])
        
        if update_fields:
            params.append(question_id)
            cursor.execute(
                f'UPDATE questions SET {", ".join(update_fields)} WHERE id = ?',
                params
            )
            conn.commit()
        
        cursor.execute('SELECT * FROM questions WHERE id = ?', (question_id,))
        updated_question = cursor.fetchone()
        conn.close()
        
        result = dict(updated_question)
        result['options'] = json.loads(result['options'])
        
        return api_response(True, '更新成功', result)
    except Exception as e:
        return api_response(False, f'更新失败: {str(e)}', None, 500)


@app.route('/api/questions/<int:question_id>', methods=['DELETE'])
def delete_question(question_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM questions WHERE id = ?', (question_id,))
        question = cursor.fetchone()
        
        if not question:
            conn.close()
            return api_response(False, '题目不存在', None, 404)
        
        cursor.execute('DELETE FROM questions WHERE id = ?', (question_id,))
        conn.commit()
        conn.close()
        
        return api_response(True, '删除成功', {'id': question_id})
    except Exception as e:
        return api_response(False, f'删除失败: {str(e)}', None, 500)


@app.route('/exams')
def exams_page():
    return render_template('exams.html')


@app.route('/api/exams/generate', methods=['POST'])
def generate_exam():
    try:
        data = request.get_json()
        
        subject = data.get('subject')
        question_count = int(data.get('question_count', 10))
        difficulty = data.get('difficulty', '')
        exam_name = data.get('exam_name', f'{subject}随机试卷')
        
        if not subject:
            return api_response(False, '请选择科目', None, 400)
        
        if question_count <= 0:
            return api_response(False, '题量必须大于0', None, 400)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        query = 'SELECT * FROM questions WHERE subject = ?'
        params = [subject]
        
        if difficulty:
            query += ' AND difficulty = ?'
            params.append(difficulty)
        
        cursor.execute(query, params)
        questions = cursor.fetchall()
        
        available_count = len(questions)
        if available_count < question_count:
            conn.close()
            return api_response(
                False, 
                f'题库中符合条件的题目不足！当前只有 {available_count} 道题，请求生成 {question_count} 道题',
                {'available_count': available_count, 'requested_count': question_count},
                400
            )
        
        cursor.execute('SELECT id FROM exams WHERE exam_name = ?', (exam_name,))
        existing_exam = cursor.fetchone()
        if existing_exam:
            conn.close()
            return api_response(
                False,
                f'试卷名称「{exam_name}」已存在，请重新命名',
                {'existing_name': exam_name},
                400
            )
        
        selected_indices = random.sample(range(available_count), question_count)
        selected_questions = [dict(questions[i]) for i in selected_indices]
        
        for q in selected_questions:
            q['options'] = json.loads(q['options'])
        
        question_ids = json.dumps([q['id'] for q in selected_questions], ensure_ascii=False)
        questions_json = json.dumps(selected_questions, ensure_ascii=False)
        total_score = question_count * 10
        
        cursor.execute(
            '''INSERT INTO exams (exam_name, subject, difficulty, question_count, total_score, question_ids, questions)
               VALUES (?, ?, ?, ?, ?, ?, ?)''',
            (exam_name, subject, difficulty, question_count, total_score, question_ids, questions_json)
        )
        conn.commit()
        exam_id = cursor.lastrowid
        
        cursor.execute('SELECT * FROM exams WHERE id = ?', (exam_id,))
        exam = cursor.fetchone()
        conn.close()
        
        result = dict(exam)
        result['question_ids'] = json.loads(result['question_ids'])
        result['questions'] = json.loads(result['questions'])
        
        return api_response(True, '试卷生成成功', result, 201)
    except ValueError as e:
        return api_response(False, '题量必须是有效数字', None, 400)
    except Exception as e:
        return api_response(False, f'生成失败: {str(e)}', None, 500)


@app.route('/api/exams', methods=['GET'])
def get_exams():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM exams ORDER BY created_at DESC')
        exams = cursor.fetchall()
        conn.close()
        
        result = []
        for exam in exams:
            exam_dict = dict(exam)
            exam_dict['question_ids'] = json.loads(exam_dict['question_ids'])
            exam_dict['questions'] = json.loads(exam_dict['questions'])
            result.append(exam_dict)
        
        return api_response(True, '查询成功', result)
    except Exception as e:
        return api_response(False, f'查询失败: {str(e)}', None, 500)


@app.route('/api/exams/<int:exam_id>', methods=['GET'])
def get_exam_by_id(exam_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM exams WHERE id = ?', (exam_id,))
        exam = cursor.fetchone()
        conn.close()
        
        if not exam:
            return api_response(False, '试卷不存在', None, 404)
        
        exam_dict = dict(exam)
        exam_dict['question_ids'] = json.loads(exam_dict['question_ids'])
        exam_dict['questions'] = json.loads(exam_dict['questions'])
        
        return api_response(True, '查询成功', exam_dict)
    except Exception as e:
        return api_response(False, f'查询失败: {str(e)}', None, 500)


@app.route('/api/exams/<int:exam_id>/submit', methods=['POST'])
def submit_exam(exam_id):
    try:
        data = request.get_json()
        answers = data.get('answers', {})
        student_name = data.get('student_name', '匿名考生')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM exams WHERE id = ?', (exam_id,))
        exam = cursor.fetchone()
        
        if not exam:
            conn.close()
            return api_response(False, '试卷不存在', None, 404)
        
        exam_dict = dict(exam)
        questions = json.loads(exam_dict['questions'])
        
        correct_count = 0
        total_count = len(questions)
        score_per_question = 100 / total_count if total_count > 0 else 0
        
        results = []
        for q in questions:
            q_id = str(q['id'])
            user_answer = answers.get(q_id, None)
            is_correct = user_answer == q['correct_answer']
            if is_correct:
                correct_count += 1
            results.append({
                'question_id': q['id'],
                'question_text': q['question_text'],
                'options': q['options'],
                'user_answer': user_answer,
                'correct_answer': q['correct_answer'],
                'is_correct': is_correct,
                'score': round(score_per_question, 1) if is_correct else 0
            })
        
        final_score = round(correct_count * score_per_question, 1)
        
        cursor.execute(
            '''INSERT INTO scores (exam_id, exam_name, student_name, score, total_score, correct_count, total_count, answer_details)
               VALUES (?, ?, ?, ?, 100, ?, ?, ?)''',
            (exam_id, exam_dict['exam_name'], student_name, final_score, correct_count, total_count,
             json.dumps(results, ensure_ascii=False))
        )
        score_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return api_response(True, '提交成功', {
            'score_id': score_id,
            'exam_name': exam_dict['exam_name'],
            'student_name': student_name,
            'correct_count': correct_count,
            'total_count': total_count,
            'score': final_score,
            'total_score': 100,
            'results': results
        })
    except Exception as e:
        return api_response(False, f'提交失败: {str(e)}', None, 500)


@app.route('/api/scores', methods=['GET'])
def get_scores():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM scores ORDER BY submit_time DESC')
        scores = cursor.fetchall()
        conn.close()
        
        result = []
        for s in scores:
            s_dict = dict(s)
            s_dict['answer_details'] = json.loads(s_dict['answer_details']) if s_dict['answer_details'] else []
            result.append(s_dict)
        
        return api_response(True, '查询成功', result)
    except Exception as e:
        return api_response(False, f'查询失败: {str(e)}', None, 500)


@app.route('/api/scores/<int:score_id>', methods=['GET'])
def get_score_by_id(score_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM scores WHERE id = ?', (score_id,))
        score = cursor.fetchone()
        conn.close()
        
        if not score:
            return api_response(False, '成绩不存在', None, 404)
        
        s_dict = dict(score)
        s_dict['answer_details'] = json.loads(s_dict['answer_details']) if s_dict['answer_details'] else []
        
        return api_response(True, '查询成功', s_dict)
    except Exception as e:
        return api_response(False, f'查询失败: {str(e)}', None, 500)


@app.route('/exam-list')
def exam_list_page():
    return render_template('exam_list.html')


@app.route('/exam/<int:exam_id>')
def exam_detail_page(exam_id):
    return render_template('exam_detail.html', exam_id=exam_id)


@app.route('/score/<int:score_id>')
def score_detail_page(score_id):
    return render_template('score_detail.html', score_id=score_id)


@app.route('/scores')
def scores_list_page():
    return render_template('scores_list.html')


if __name__ == '__main__':
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5002)
