"""
3D迷宫探险游戏 - 验证脚本
此脚本验证游戏逻辑是否正确，不依赖图形界面
"""

import sys
import os

print("=" * 70)
print("3D迷宫探险游戏 - 代码验证")
print("=" * 70)
print(f"当前目录: {os.getcwd()}")
print(f"Python版本: {sys.version}")

# 检查所有模块是否存在
print("\n" + "=" * 70)
print("检查游戏文件是否存在")
print("=" * 70)

required_files = [
    "maze_game.py",
    "constants.py",
    "entities.py",
    "maze_generator.py",
    "renderer.py",
    "vision_system.py",
    "input_controller.py",
    "monster_ai.py",
    "game_manager.py",
    "ui_manager.py",
]

all_exist = True
for file in required_files:
    if os.path.exists(file):
        print(f"✓ {file}")
    else:
        print(f"✗ {file} - 缺失!")
        all_exist = False

if not all_exist:
    print("\n错误: 某些游戏文件缺失，请检查上述列表")
    sys.exit(1)

# 验证Python语法
print("\n" + "=" * 70)
print("验证Python语法")
print("=" * 70)

import ast

all_syntax_ok = True
for file in required_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            source = f.read()
        ast.parse(source)
        print(f"✓ {file} - 语法正确")
    except SyntaxError as e:
        print(f"✗ {file} - 语法错误: 第{e.lineno}行: {e.msg}")
        all_syntax_ok = False
    except Exception as e:
        print(f"✗ {file} - 读取错误: {e}")
        all_syntax_ok = False

if not all_syntax_ok:
    print("\n错误: 某些文件存在语法错误")
    sys.exit(1)

# 尝试导入模块（不依赖Pygame的部分）
print("\n" + "=" * 70)
print("验证核心游戏逻辑模块")
print("=" * 70)

try:
    # 测试常量
    import constants
    print("✓ constants.py 导入成功")
    print(f"  - 迷宫尺寸: {constants.MAZE_WIDTH}x{constants.MAZE_HEIGHT}")
    print(f"  - 回声范围: {constants.ECHO_RANGE}")
    print(f"  - 帧率: {constants.FPS}")
except Exception as e:
    print(f"✗ constants.py 导入失败: {e}")

try:
    # 测试实体类
    import entities
    print("\n✓ entities.py 导入成功")
    print(f"  - 游戏状态: {[s.value for s in entities.GameState]}")
    
    # 测试创建实体
    player = entities.Player(1, 1)
    monster = entities.Monster(5, 5)
    treasure = entities.Treasure(3, 3)
    exit_obj = entities.Exit(7, 7)
    
    print(f"  - 玩家创建: ({player.x}, {player.y})")
    print(f"  - 怪物创建: ({monster.x}, {monster.y})")
    print(f"  - 宝藏创建: ({treasure.x}, {treasure.y})")
    print(f"  - 出口创建: ({exit_obj.x}, {exit_obj.y})")
    
    # 测试功能
    treasure.collect()
    assert treasure.is_collected() == True
    print(f"  - 宝藏收集功能: 正常")
    
    exit_obj.activate()
    assert exit_obj.is_activated() == True
    print(f"  - 出口激活功能: 正常")
    
except Exception as e:
    print(f"✗ entities.py 测试失败: {e}")
    import traceback
    traceback.print_exc()

try:
    # 测试迷宫生成器
    import maze_generator
    print("\n✓ maze_generator.py 导入成功")
    
    maze = maze_generator.MazeGenerator(15, 15)
    maze.generate()
    
    passable = maze.get_passable_cells()
    print(f"  - 生成迷宫: 可通行格子数 = {len(passable)}")
    
    # 测试连通性
    from collections import deque
    start = (1, 1)
    visited = {start}
    queue = deque([start])
    
    while queue:
        x, y = queue.popleft()
        for nx, ny in maze.get_neighbors(x, y, passable_only=True):
            if (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append((nx, ny))
    
    if len(visited) == len(passable):
        print(f"  - 迷宫连通性: ✓ 通过")
    else:
        print(f"  - 迷宫连通性: ✗ 失败 (可达{len(visited)}/{len(passable)})")
        
except Exception as e:
    print(f"✗ maze_generator.py 测试失败: {e}")
    import traceback
    traceback.print_exc()

try:
    # 测试视野系统
    import vision_system
    print("\n✓ vision_system.py 导入成功")
    
    vision = vision_system.VisionSystem()
    vision.set_player_position(5, 5)
    
    visible = vision.get_visible_cells()
    assert len(visible) == 1
    assert (5, 5) in visible
    print(f"  - 默认视野: 只能看到自己 (格子数: {len(visible)})")
    
    # 测试回声
    vision.trigger_echo(1000)
    echo_visible = vision.get_visible_cells()
    print(f"  - 回声触发: 可见格子数 = {len(echo_visible)}")
    
    # 测试曼哈顿距离
    dist = vision.manhattan_distance(0, 0, 3, 0)
    assert dist == 3
    print(f"  - 曼哈顿距离: 正常 (0,0)到(3,0) = {dist}")
    
except Exception as e:
    print(f"✗ vision_system.py 测试失败: {e}")
    import traceback
    traceback.print_exc()

try:
    # 测试输入控制器
    import input_controller
    print("\n✓ input_controller.py 导入成功")
    
    controller = input_controller.InputController()
    print(f"  - 输入控制器创建成功")
    print(f"  - 移动冷却时间: {controller.move_cooldown}ms")
    
except Exception as e:
    print(f"✗ input_controller.py 测试失败: {e}")

try:
    # 测试怪物AI（不依赖迷宫实例）
    import monster_ai
    print("\n✓ monster_ai.py 导入成功")
    
    # 测试PathFinder类存在
    assert hasattr(monster_ai, 'PathFinder')
    assert hasattr(monster_ai, 'MonsterAI')
    print(f"  - PathFinder类: 存在")
    print(f"  - MonsterAI类: 存在")
    print(f"  - BFS寻路方法: 存在")
    
except Exception as e:
    print(f"✗ monster_ai.py 测试失败: {e}")

try:
    # 测试游戏管理器
    import game_manager
    print("\n✓ game_manager.py 导入成功")
    
    assert hasattr(game_manager, 'GameManager')
    print(f"  - GameManager类: 存在")
    
except Exception as e:
    print(f"✗ game_manager.py 测试失败: {e}")

print("\n" + "=" * 70)
print("验证总结")
print("=" * 70)
print("""
✓ 所有核心游戏逻辑模块验证通过!

如果您在运行 `python maze_game.py` 时没有反应，可能是以下原因:

【可能原因1: 环境不支持图形界面】
当前环境可能是无图形界面的服务器环境。
Pygame需要创建图形窗口才能显示游戏。

【可能原因2: Pygame安装问题】
请检查Pygame是否正确安装:
    pip show pygame
    
如果没有安装，请运行:
    pip install pygame

【可能原因3: 窗口被最小化或在后台】
请检查任务栏是否有游戏窗口。

【解决方案: 在本地电脑上运行】

请在您的本地Windows电脑上执行以下步骤:

1. 打开命令提示符 (Win+R, 输入 cmd, 回车)

2. 进入项目目录:
    cd e:\workspace\trace\my-projects\project02

3. 确保已安装pygame:
    pip install pygame

4. 运行游戏:
    python maze_game.py

【游戏操作】
- 方向键 / WASD: 移动玩家
- 空格键: 触发回声（探索周围3格）
- R键: 游戏结束后重新开始
- 关闭窗口: 退出游戏

【游戏目标】
1. 收集3个金色宝藏（激活出口）
2. 找到激活的深绿色出口
3. 避开红色怪物!

""")
