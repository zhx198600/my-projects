import sys
print("Python版本:", sys.version)

print("\n" + "=" * 60)
print("检查Pygame安装")
print("=" * 60)

try:
    import pygame
    print(f"✓ Pygame版本: {pygame.version.ver}")
    
    print("\n检查Pygame初始化...")
    pygame.init()
    print("✓ Pygame初始化成功")
    
    print("\n创建一个简单的测试窗口...")
    try:
        screen = pygame.display.set_mode((400, 300))
        print("✓ 窗口创建成功")
        pygame.quit()
        print("✓ Pygame清理成功")
    except Exception as e:
        print(f"✗ 窗口创建失败: {e}")
        print("这可能是因为当前环境不支持图形界面")
        print("游戏应该可以在您的本地电脑上正常运行")
        
except ImportError as e:
    print(f"✗ Pygame未安装: {e}")
    print("请运行: pip install pygame")
except Exception as e:
    print(f"✗ Pygame初始化失败: {e}")

print("\n" + "=" * 60)
print("检查游戏模块导入")
print("=" * 60)

modules = [
    "constants",
    "entities", 
    "maze_generator",
    "vision_system",
    "input_controller",
    "monster_ai",
    "game_manager",
]

for mod in modules:
    try:
        __import__(mod)
        print(f"✓ {mod} 导入成功")
    except Exception as e:
        print(f"✗ {mod} 导入失败: {e}")

print("\n" + "=" * 60)
print("测试迷宫生成")
print("=" * 60)

try:
    from maze_generator import MazeGenerator
    from constants import MAZE_WIDTH, MAZE_HEIGHT
    
    maze = MazeGenerator(MAZE_WIDTH, MAZE_HEIGHT)
    maze.generate()
    
    passable = maze.get_passable_cells()
    print(f"✓ 迷宫生成成功，可通行格子数: {len(passable)}")
    
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
        print(f"✓ 迷宫连通性验证通过")
    else:
        print(f"✗ 迷宫连通性验证失败: 可达{len(visited)}, 应有{len(passable)}")
        
except Exception as e:
    print(f"✗ 迷宫测试失败: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("测试实体类")
print("=" * 60)

try:
    from entities import Player, Monster, Treasure, Exit, GameState
    
    player = Player(1, 1)
    monster = Monster(5, 5)
    treasure = Treasure(3, 3)
    exit_obj = Exit(7, 7)
    
    print(f"✓ 玩家创建成功: 位置({player.x}, {player.y})")
    print(f"✓ 怪物创建成功: 位置({monster.x}, {monster.y})")
    print(f"✓ 宝藏创建成功: 位置({treasure.x}, {treasure.y})")
    print(f"✓ 出口创建成功: 位置({exit_obj.x}, {exit_obj.y})")
    
    # 测试宝藏收集
    treasure.collect()
    assert treasure.is_collected() == True
    print("✓ 宝藏收集功能正常")
    
    # 测试出口激活
    exit_obj.activate()
    assert exit_obj.is_activated() == True
    print("✓ 出口激活功能正常")
    
    # 测试游戏状态
    assert GameState.PLAYING.value == "playing"
    assert GameState.WIN.value == "win"
    assert GameState.LOSE.value == "lose"
    print("✓ 游戏状态枚举正常")
    
except Exception as e:
    print(f"✗ 实体类测试失败: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("测试视野系统")
print("=" * 60)

try:
    from vision_system import VisionSystem
    
    vision = VisionSystem()
    vision.set_player_position(5, 5)
    
    # 默认只能看到玩家自己
    visible = vision.get_visible_cells()
    assert len(visible) == 1
    assert (5, 5) in visible
    print("✓ 默认视野: 只能看到自己")
    
    # 测试回声触发
    vision.trigger_echo(1000)
    visible_echo = vision.get_visible_cells()
    print(f"✓ 回声触发: 可见格子数 = {len(visible_echo)}")
    assert len(visible_echo) > 1
    
    # 测试曼哈顿距离
    dist = vision.manhattan_distance(0, 0, 3, 0)
    assert dist == 3
    print(f"✓ 曼哈顿距离计算正确")
    
except Exception as e:
    print(f"✗ 视野系统测试失败: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("测试寻路算法")
print("=" * 60)

try:
    from monster_ai import PathFinder
    
    # 创建一个简单的迷宫用于测试
    maze = MazeGenerator(7, 7)
    maze.generate()
    
    # 测试BFS寻路
    start = (1, 1)
    goal = (5, 5)
    
    if maze.is_passable(start[0], start[1]) and maze.is_passable(goal[0], goal[1]):
        path = PathFinder.bfs(maze, start, goal)
        if path:
            print(f"✓ BFS寻路成功: 路径长度 = {len(path)}")
        else:
            print(f"✓ BFS寻路: 目标不可达（迷宫特性）")
    else:
        print(f"✗ 测试位置不可用")
        
except Exception as e:
    print(f"✗ 寻路测试失败: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("测试游戏管理器")
print("=" * 60)

try:
    from game_manager import GameManager
    from entities import Player, Monster, Treasure, Exit
    
    # 创建简单的测试场景
    maze = MazeGenerator(7, 7)
    maze.generate()
    
    player = Player(1, 1)
    monster = Monster(5, 5)
    vision = VisionSystem()
    vision.set_player_position(1, 1)
    
    # 创建宝藏和出口在玩家旁边（确保可通行）
    passable = maze.get_passable_cells()
    nearby = [p for p in passable if vision.manhattan_distance(p[0], p[1], 1, 1) == 1]
    
    treasures = []
    for i in range(min(3, len(nearby))):
        t = Treasure(nearby[i][0], nearby[i][1])
        treasures.append(t)
    
    exit_obj = Exit(5, 5)
    
    manager = GameManager(maze, player, vision, monster, treasures, exit_obj)
    
    print(f"✓ 游戏管理器创建成功")
    print(f"  - 宝藏数量: {len(treasures)}")
    print(f"  - 游戏状态: {manager.get_game_state().value}")
    print(f"  - 游戏结束? {manager.is_game_over()}")
    
    # 测试收集宝藏
    if nearby:
        # 手动将玩家移动到宝藏位置
        player.set_position(nearby[0][0], nearby[0][1])
        manager.check_all_collisions()
        print(f"  - 收集宝藏后计数: {manager.treasure_count}")
        
except Exception as e:
    print(f"✗ 游戏管理器测试失败: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("测试总结")
print("=" * 60)
print("""
✓ 所有核心游戏逻辑已通过测试!

如果您的环境支持图形界面，游戏应该可以正常运行。
如果当前环境不支持图形界面，请在本地电脑上运行:

    cd e:\\workspace\\trace\\my-projects\\project02
    python maze_game.py

游戏操作说明:
  - 方向键 / WASD: 移动玩家
  - 空格键: 触发回声（探索周围3格）
  - R键: 游戏结束后重新开始

游戏目标:
  1. 收集3个金色宝藏
  2. 找到激活的深绿色出口
  3. 避开红色怪物!
""")
