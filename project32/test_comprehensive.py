import unittest
import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from database.init_db import init_database, DB_PATH


class TestExamFullFlow(unittest.TestCase):
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

    def add_test_questions(self, subject, count, difficulty='简单'):
        question_ids = []
        for i in range(count):
            question_data = {
                'subject': subject,
                'question_text': f'{subject}测试题目{i + 1}',
                'options': {'A': '选项A', 'B': '选项B', 'C': '选项C', 'D': '选项D'},
                'correct_answer': chr(ord('A') + i % 4),
                'difficulty': difficulty
            }
            response = self.client.post('/api/questions',
                                        data=json.dumps(question_data),
                                        content_type='application/json')
            data = json.loads(response.data)
            question_ids.append(data['data']['id'])
        return question_ids

    def test_01_full_exam_flow(self):
        print("\n" + "=" * 60)
        print("测试1: 完整考试流程 - 添加题目→生成试卷→开始答题→提交试卷→查看成绩")
        print("=" * 60)

        print("\n步骤1: 添加10道数学题目")
        for i in range(10):
            question_data = {
                'subject': '数学',
                'question_text': f'数学题目{i + 1}',
                'options': {'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D'},
                'correct_answer': chr(ord('A') + i % 4),
                'difficulty': '简单'
            }
            response = self.client.post('/api/questions',
                                        data=json.dumps(question_data),
                                        content_type='application/json')
            self.assertEqual(response.status_code, 201)
            data = json.loads(response.data)
            self.assertTrue(data['success'])
            print(f"  ✓ 添加题目 {i + 1}/10: ID={data['data']['id']}")

        print("\n步骤2: 生成包含5道题目的试卷")
        exam_data = {
            'subject': '数学',
            'question_count': 5,
            'difficulty': '简单',
            'exam_name': '数学期末考试'
        }
        response = self.client.post('/api/exams/generate',
                                    data=json.dumps(exam_data),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 201)
        exam_result = json.loads(response.data)
        self.assertTrue(exam_result['success'])
        exam_id = exam_result['data']['id']
        print(f"  ✓ 试卷生成成功: ID={exam_id}, 名称={exam_result['data']['exam_name']}")
        print(f"  ✓ 试卷包含 {exam_result['data']['question_count']} 道题目")

        print("\n步骤3: 获取试卷详情（开始答题）")
        response = self.client.get(f'/api/exams/{exam_id}')
        self.assertEqual(response.status_code, 200)
        exam_detail = json.loads(response.data)
        self.assertTrue(exam_detail['success'])
        questions = exam_detail['data']['questions']
        self.assertEqual(len(questions), 5)
        print(f"  ✓ 获取试卷详情成功，共 {len(questions)} 道题目")

        print("\n步骤4: 提交试卷（答对3题，答错2题）")
        answers = {}
        for i, q in enumerate(questions):
            if i < 3:
                answers[str(q['id'])] = q['correct_answer']
            else:
                answers[str(q['id'])] = 'Z'

        submit_data = {
            'answers': answers,
            'student_name': '测试考生'
        }
        response = self.client.post(f'/api/exams/{exam_id}/submit',
                                    data=json.dumps(submit_data),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        submit_result = json.loads(response.data)
        self.assertTrue(submit_result['success'])
        score_id = submit_result['data']['score_id']
        print(f"  ✓ 提交成功: 成绩ID={score_id}")
        print(f"  ✓ 考生: {submit_result['data']['exam_name']}")
        print(f"  ✓ 正确题数: {submit_result['data']['correct_count']}/{submit_result['data']['total_count']}")
        print(f"  ✓ 最终得分: {submit_result['data']['score']} 分")

        print("\n步骤5: 查看成绩详情")
        response = self.client.get(f'/api/scores/{score_id}')
        self.assertEqual(response.status_code, 200)
        score_detail = json.loads(response.data)
        self.assertTrue(score_detail['success'])
        print(f"  ✓ 考生姓名: {score_detail['data']['student_name']}")
        print(f"  ✓ 最终成绩: {score_detail['data']['score']}/{score_detail['data']['total_score']}")
        print(f"  ✓ 答题详情: 共 {len(score_detail['data']['answer_details'])} 道题的答题记录")

        print("\n步骤6: 查看所有成绩列表")
        response = self.client.get('/api/scores')
        self.assertEqual(response.status_code, 200)
        scores_list = json.loads(response.data)
        self.assertTrue(scores_list['success'])
        self.assertGreaterEqual(len(scores_list['data']), 1)
        print(f"  ✓ 成绩列表查询成功，共 {len(scores_list['data'])} 条记录")

        print("\n✅ 完整考试流程测试通过！")

    def test_02_empty_database_generate_exam(self):
        print("\n" + "=" * 60)
        print("测试2: 边界情况 - 空题库生成试卷")
        print("=" * 60)

        response = self.client.post('/api/exams/generate',
                                    data=json.dumps({
                                        'subject': '物理',
                                        'question_count': 5
                                    }),
                                    content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('不足', data['message'])
        print(f"  ✓ 空题库正确返回错误: {data['message']}")
        print("\n✅ 空题库测试通过！")

    def test_03_insufficient_questions(self):
        print("\n" + "=" * 60)
        print("测试3: 边界情况 - 题量不足")
        print("=" * 60)

        print("\n  先添加3道英语题目")
        self.add_test_questions('英语', 3)

        print("  尝试生成10道题的试卷")
        response = self.client.post('/api/exams/generate',
                                    data=json.dumps({
                                        'subject': '英语',
                                        'question_count': 10
                                    }),
                                    content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        self.assertIn('3', data['message'])
        self.assertIn('10', data['message'])
        print(f"  ✓ 正确提示题量不足: {data['message']}")
        print("\n✅ 题量不足测试通过！")

    def test_04_submit_empty_answers(self):
        print("\n" + "=" * 60)
        print("测试4: 边界情况 - 提交空答案")
        print("=" * 60)

        print("\n  生成试卷")
        self.add_test_questions('化学', 5)
        response = self.client.post('/api/exams/generate',
                                    data=json.dumps({
                                        'subject': '化学',
                                        'question_count': 3
                                    }),
                                    content_type='application/json')
        exam_id = json.loads(response.data)['data']['id']

        print("  提交空答案")
        response = self.client.post(f'/api/exams/{exam_id}/submit',
                                    data=json.dumps({
                                        'answers': {},
                                        'student_name': '空答案考生'
                                    }),
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        result = json.loads(response.data)
        self.assertTrue(result['success'])
        self.assertEqual(result['data']['correct_count'], 0)
        self.assertEqual(result['data']['score'], 0)
        print(f"  ✓ 空答案提交成功: 正确0题，得分0分")

        for detail in result['data']['results']:
            self.assertIsNone(detail['user_answer'])
            self.assertFalse(detail['is_correct'])
        print("  ✓ 所有题目user_answer均为None，is_correct均为False")
        print("\n✅ 提交空答案测试通过！")

    def test_05_invalid_question_count(self):
        print("\n" + "=" * 60)
        print("测试5: 边界情况 - 无效题量（0或负数）")
        print("=" * 60)

        response = self.client.post('/api/exams/generate',
                                    data=json.dumps({
                                        'subject': '数学',
                                        'question_count': 0
                                    }),
                                    content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        print(f"  ✓ 题量=0正确返回错误: {data['message']}")

        response = self.client.post('/api/exams/generate',
                                    data=json.dumps({
                                        'subject': '数学',
                                        'question_count': -5
                                    }),
                                    content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        print(f"  ✓ 题量=-5正确返回错误: {data['message']}")
        print("\n✅ 无效题量测试通过！")

    def test_06_nonexistent_exam(self):
        print("\n" + "=" * 60)
        print("测试6: 边界情况 - 访问不存在的试卷/成绩")
        print("=" * 60)

        response = self.client.get('/api/exams/99999')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 404)
        self.assertFalse(data['success'])
        print(f"  ✓ 不存在试卷正确返回: {data['message']}")

        response = self.client.post('/api/exams/99999/submit',
                                    data=json.dumps({'answers': {}}),
                                    content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 404)
        self.assertFalse(data['success'])
        print(f"  ✓ 提交不存在试卷正确返回: {data['message']}")

        response = self.client.get('/api/scores/99999')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 404)
        self.assertFalse(data['success'])
        print(f"  ✓ 不存在成绩正确返回: {data['message']}")
        print("\n✅ 不存在资源测试通过！")

    def test_07_missing_subject_generate_exam(self):
        print("\n" + "=" * 60)
        print("测试7: 边界情况 - 生成试卷不指定科目")
        print("=" * 60)

        response = self.client.post('/api/exams/generate',
                                    data=json.dumps({
                                        'question_count': 5
                                    }),
                                    content_type='application/json')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(data['success'])
        print(f"  ✓ 不指定科目正确返回: {data['message']}")
        print("\n✅ 缺少科目测试通过！")

    def test_08_duplicate_submit_prevention(self):
        print("\n" + "=" * 60)
        print("测试8: 功能测试 - 验证同一试卷可多次提交（允许多次考试）")
        print("=" * 60)

        self.add_test_questions('生物', 5)
        response = self.client.post('/api/exams/generate',
                                    data=json.dumps({
                                        'subject': '生物',
                                        'question_count': 3
                                    }),
                                    content_type='application/json')
        exam_id = json.loads(response.data)['data']['id']

        answers = {}
        for i in range(3):
            answers[str(i)] = 'A'

        response1 = self.client.post(f'/api/exams/{exam_id}/submit',
                                     data=json.dumps({
                                         'answers': answers,
                                         'student_name': '考生A'
                                     }),
                                     content_type='application/json')
        self.assertEqual(response1.status_code, 200)
        score1_id = json.loads(response1.data)['data']['score_id']

        response2 = self.client.post(f'/api/exams/{exam_id}/submit',
                                     data=json.dumps({
                                         'answers': answers,
                                         'student_name': '考生B'
                                     }),
                                     content_type='application/json')
        self.assertEqual(response2.status_code, 200)
        score2_id = json.loads(response2.data)['data']['score_id']

        self.assertNotEqual(score1_id, score2_id)
        print(f"  ✓ 试卷ID={exam_id} 成功提交2次")
        print(f"  ✓ 生成不同成绩ID: {score1_id}, {score2_id}")
        print("\n✅ 多次提交测试通过！")

    def test_09_api_response_consistency(self):
        print("\n" + "=" * 60)
        print("测试9: API返回格式一致性检查")
        print("=" * 60)

        endpoints = [
            ('GET', '/api/questions', None),
            ('GET', '/api/exams', None),
            ('GET', '/api/scores', None),
            ('POST', '/api/questions', json.dumps({
                'subject': '政治',
                'question_text': '测试题目',
                'options': {'A': 'A'},
                'correct_answer': 'A',
                'difficulty': '简单'
            })),
        ]

        for method, url, data in endpoints:
            if method == 'GET':
                response = self.client.get(url)
            else:
                response = self.client.post(url, data=data, content_type='application/json')

            response_data = json.loads(response.data)
            self.assertIn('success', response_data)
            self.assertIn('message', response_data)
            self.assertIn('data', response_data)
            self.assertIsInstance(response_data['success'], bool)
            self.assertIsInstance(response_data['message'], str)
            print(f"  ✓ {method} {url} 返回格式正确")

        print("\n✅ API返回格式一致性测试通过！")


def run_comprehensive_tests():
    print("\n" + "=" * 70)
    print("  在线考试系统 - 综合测试报告")
    print("=" * 70)

    suite = unittest.TestLoader().loadTestsFromTestCase(TestExamFullFlow)
    runner = unittest.TextTestRunner(verbosity=0)
    result = runner.run(suite)

    print("\n" + "=" * 70)
    print("  测试总结")
    print("=" * 70)
    print(f"  总测试数: {result.testsRun}")
    print(f"  通过数: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"  失败数: {len(result.failures)}")
    print(f"  错误数: {len(result.errors)}")

    if result.failures:
        print("\n  失败详情:")
        for test, traceback in result.failures:
            print(f"    - {test}: {traceback.split(chr(10))[-2]}")

    if result.errors:
        print("\n  错误详情:")
        for test, traceback in result.errors:
            print(f"    - {test}: {traceback.split(chr(10))[-2]}")

    if result.wasSuccessful():
        print("\n  ✅ 所有综合测试通过！")
    else:
        print("\n  ❌ 部分测试未通过")
    print("=" * 70)

    return result.wasSuccessful()


if __name__ == '__main__':
    success = run_comprehensive_tests()
    sys.exit(0 if success else 1)
