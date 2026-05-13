import requests
import json

BASE_URL = 'http://localhost:5001'

def add_test_questions():
    print("=== 添加测试题目 ===")
    
    subjects = ['数学', '数学', '数学', '物理', '物理', '化学']
    difficulties = ['简单', '中等', '困难', '简单', '中等', '简单']
    
    questions_data = []
    
    for i in range(1, 21):
        subject_idx = (i - 1) % 6
        subject = subjects[subject_idx]
        difficulty = difficulties[subject_idx]
        
        question = {
            'subject': subject,
            'question_text': f'{subject}测试题目{i}：这是一道{difficulty}难度的测试题',
            'options': {
                'A': f'选项A-{i}',
                'B': f'选项B-{i}',
                'C': f'选项C-{i}',
                'D': f'选项D-{i}'
            },
            'correct_answer': chr(65 + (i % 4)),
            'difficulty': difficulty
        }
        questions_data.append(question)
    
    success_count = 0
    for q in questions_data:
        response = requests.post(f'{BASE_URL}/api/questions', json=q)
        if response.status_code == 201:
            success_count += 1
    
    print(f"成功添加 {success_count} 道测试题目")
    return success_count

def test_generate_exam():
    print("\n=== 测试生成试卷 ===")
    
    test_cases = [
        {'name': '数学5道题', 'subject': '数学', 'question_count': 5, 'difficulty': ''},
        {'name': '物理3道题(简单)', 'subject': '物理', 'question_count': 3, 'difficulty': '简单'},
        {'name': '题目不足测试', 'subject': '化学', 'question_count': 10, 'difficulty': ''},
    ]
    
    for case in test_cases:
        print(f"\n测试: {case['name']}")
        data = {
            'subject': case['subject'],
            'question_count': case['question_count'],
            'difficulty': case['difficulty'],
            'exam_name': case['name']
        }
        
        response = requests.post(f'{BASE_URL}/api/exams/generate', json=data)
        result = response.json()
        
        if result['success']:
            exam = result['data']
            ids = [q['id'] for q in exam['questions']]
            unique_ids = list(set(ids))
            print(f"  ✓ 成功: 生成{exam['question_count']}道题, ID={ids}")
            if len(ids) == len(unique_ids):
                print(f"  ✓ 验证: 所有题目ID不重复")
            else:
                print(f"  ✗ 验证失败: 存在重复ID!")
        else:
            print(f"  ✓ 返回提示: {result['message']}")

def test_get_exams():
    print("\n=== 测试获取试卷列表 ===")
    response = requests.get(f'{BASE_URL}/api/exams')
    result = response.json()
    
    if result['success']:
        print(f"  ✓ 成功获取 {len(result['data'])} 份试卷")
        for exam in result['data']:
            print(f"    - {exam['exam_name']}: {exam['question_count']}道题, {exam['subject']}")

def main():
    try:
        add_test_questions()
        test_generate_exam()
        test_get_exams()
        print("\n=== 所有测试完成! ===")
        print(f"\n请访问: {BASE_URL}/exams 查看前端页面")
    except Exception as e:
        print(f"测试出错: {e}")
        print("请先启动Flask服务: python app.py")

if __name__ == '__main__':
    main()
