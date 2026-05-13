import unittest
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.init_db import init_database, DB_PATH, get_tables_info

class TestExamSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)
        init_database()
        cls.client = app.test_client()
        cls.client.testing = True

    @classmethod
    def tearDownClass(cls):
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)

    def test_1_database_file_created(self):
        self.assertTrue(os.path.exists(DB_PATH), "数据库文件应被创建")

    def test_2_tables_created(self):
        response = self.client.get('/api/tables')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn('questions', data['data']['tables'], "应包含 questions 表")
        self.assertIn('exams', data['data']['tables'], "应包含 exams 表")
        self.assertIn('scores', data['data']['tables'], "应包含 scores 表")
        main_tables = [t for t in data['data']['tables'] if t != 'sqlite_sequence']
        self.assertEqual(len(main_tables), 3, "应创建 3 张业务表")

    def test_3_questions_table_columns(self):
        response = self.client.get('/api/questions/columns')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        column_names = [col['name'] for col in data['data']['columns']]
        
        required_columns = ['id', 'subject', 'question_text', 'options', 'correct_answer', 'difficulty']
        for col in required_columns:
            self.assertIn(col, column_names, f"questions 表应包含 {col} 字段")

    def test_4_health_check_endpoint(self):
        response = self.client.get('/api/health')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn('系统运行正常', data['message'])
        self.assertTrue(data['data']['database'])

    def test_5_question_fields_type(self):
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(questions)")
        columns = cursor.fetchall()
        conn.close()
        
        column_info = {col[1]: col[2] for col in columns}
        self.assertEqual(column_info['subject'], 'TEXT')
        self.assertEqual(column_info['question_text'], 'TEXT')
        self.assertEqual(column_info['options'], 'TEXT')
        self.assertEqual(column_info['correct_answer'], 'TEXT')
        self.assertEqual(column_info['difficulty'], 'TEXT')

    def test_6_api_response_format(self):
        response = self.client.get('/api/questions')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('success', data)
        self.assertIn('message', data)
        self.assertIn('data', data)

    def test_7_post_add_question(self):
        question_data = {
            'subject': '数学',
            'question_text': '1 + 1 = ?',
            'options': {'A': '1', 'B': '2', 'C': '3', 'D': '4'},
            'correct_answer': 'B',
            'difficulty': '简单'
        }
        response = self.client.post('/api/questions',
                                   data=json.dumps(question_data),
                                   content_type='application/json')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['subject'], '数学')
        self.assertEqual(data['data']['question_text'], '1 + 1 = ?')
        self.assertEqual(data['data']['options']['B'], '2')
        self.assertEqual(data['data']['correct_answer'], 'B')
        self.assertEqual(data['data']['difficulty'], '简单')

    def test_8_get_questions_list(self):
        question_data1 = {
            'subject': '数学',
            'question_text': '2 + 2 = ?',
            'options': {'A': '2', 'B': '4', 'C': '6', 'D': '8'},
            'correct_answer': 'B',
            'difficulty': '简单'
        }
        question_data2 = {
            'subject': '语文',
            'question_text': '"人之初"的下一句是？',
            'options': {'A': '性本善', 'B': '性相近', 'C': '习相远', 'D': '贵以专'},
            'correct_answer': 'A',
            'difficulty': '中等'
        }
        self.client.post('/api/questions', data=json.dumps(question_data1), content_type='application/json')
        self.client.post('/api/questions', data=json.dumps(question_data2), content_type='application/json')
        
        response_all = self.client.get('/api/questions')
        data_all = json.loads(response_all.data)
        self.assertTrue(data_all['success'])
        self.assertGreaterEqual(len(data_all['data']), 2)
        
        response_math = self.client.get('/api/questions?subject=数学')
        data_math = json.loads(response_math.data)
        self.assertTrue(data_math['success'])
        for q in data_math['data']:
            self.assertEqual(q['subject'], '数学')

    def test_9_put_update_question(self):
        question_data = {
            'subject': '英语',
            'question_text': 'old question',
            'options': {'A': 'A', 'B': 'B'},
            'correct_answer': 'A',
            'difficulty': '简单'
        }
        response = self.client.post('/api/questions', data=json.dumps(question_data), content_type='application/json')
        question_id = json.loads(response.data)['data']['id']
        
        update_data = {
            'question_text': 'updated question',
            'correct_answer': 'B',
            'difficulty': '中等'
        }
        response_update = self.client.put(f'/api/questions/{question_id}',
                                          data=json.dumps(update_data),
                                          content_type='application/json')
        data = json.loads(response_update.data)
        
        self.assertEqual(response_update.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['question_text'], 'updated question')
        self.assertEqual(data['data']['correct_answer'], 'B')
        self.assertEqual(data['data']['difficulty'], '中等')
        self.assertEqual(data['data']['subject'], '英语')

    def test_10_delete_question(self):
        question_data = {
            'subject': '物理',
            'question_text': 'to be deleted',
            'options': {'A': 'test'},
            'correct_answer': 'A',
            'difficulty': '困难'
        }
        response = self.client.post('/api/questions', data=json.dumps(question_data), content_type='application/json')
        question_id = json.loads(response.data)['data']['id']
        
        response_delete = self.client.delete(f'/api/questions/{question_id}')
        data = json.loads(response_delete.data)
        
        self.assertEqual(response_delete.status_code, 200)
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['id'], question_id)
        
        response_get = self.client.get('/api/questions')
        questions = json.loads(response_get.data)['data']
        ids = [q['id'] for q in questions]
        self.assertNotIn(question_id, ids)

    def test_11_put_nonexistent_question(self):
        response = self.client.put('/api/questions/99999',
                                   data=json.dumps({'difficulty': '简单'}),
                                   content_type='application/json')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 404)
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], '题目不存在')

    def test_12_delete_nonexistent_question(self):
        response = self.client.delete('/api/questions/99999')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 404)
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], '题目不存在')

    def test_13_post_missing_field(self):
        incomplete_data = {
            'subject': '化学',
            'question_text': 'test'
        }
        response = self.client.post('/api/questions',
                                    data=json.dumps(incomplete_data),
                                    content_type='application/json')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('缺少必填字段', data['message'])

def run_tests():
    print("=" * 60)
    print("开始测试 Flask 在线考试系统")
    print("=" * 60)
    
    print("\n1. 数据库结构信息:")
    get_tables_info()
    
    print("\n" + "=" * 60)
    print("运行单元测试:")
    print("=" * 60)
    
    suite = unittest.TestLoader().loadTestsFromTestCase(TestExamSystem)
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 60)
    if result.wasSuccessful():
        print("✅ 所有测试通过！系统初始化成功！")
    else:
        print(f"❌ 测试失败：{len(result.failures)} 个失败，{len(result.errors)} 个错误")
    print("=" * 60)
    
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
