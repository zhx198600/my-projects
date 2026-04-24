from maze_generator import MazeGenerator
from constants import MAZE_WIDTH, MAZE_HEIGHT
from collections import deque


def print_maze_visual(maze):
    """
    打印迷宫的可视化表示
    使用 # 表示墙壁，. 表示路径
    
    参数:
        maze: 二维列表表示的迷宫
    """
    height = len(maze)
    width = len(maze[0]) if height > 0 else 0
    
    print("\n迷宫可视化:")
    print("-" * (width * 2 + 1))
    for y in range(height):
        line = "|"
        for x in range(width):
            if maze[y][x] == 1:
                line += "# "  # 墙壁
            else:
                line += ". "  # 路径
        line += "|"
        print(line)
    print("-" * (width * 2 + 1))


def verify_connectivity(maze_generator):
    """
    使用BFS验证迷宫是否连通
    从起点 (1,1) 开始遍历所有可达格子，检查是否覆盖了所有可通行格子
    
    参数:
        maze_generator: MazeGenerator 实例
    
    返回:
        (是否连通, 已访问格子数, 总可通行格子数)
    """
    passable_cells = maze_generator.get_passable_cells()
    total_passable = len(passable_cells)
    
    # 起点 (1,1)
    start_x, start_y = 1, 1
    
    # 检查起点是否可通行
    if not maze_generator.is_passable(start_x, start_y):
        return False, 0, total_passable
    
    # BFS 遍历
    visited = set()
    queue = deque([(start_x, start_y)])
    visited.add((start_x, start_y))
    
    while queue:
        x, y = queue.popleft()
        
        # 获取所有可通行的邻居
        neighbors = maze_generator.get_neighbors(x, y, passable_only=True)
        
        for nx, ny in neighbors:
            if (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append((nx, ny))
    
    visited_count = len(visited)
    is_connected = visited_count == total_passable
    
    return is_connected, visited_count, total_passable


def test_maze_generator():
    """
    测试迷宫生成器的主函数
    """
    print("=" * 60)
    print("迷宫生成器测试")
    print("=" * 60)
    
    # 1. 创建迷宫生成器并生成迷宫
    print(f"\n[1/4] 初始化迷宫生成器 ({MAZE_WIDTH}x{MAZE_HEIGHT})...")
    generator = MazeGenerator(width=MAZE_WIDTH, height=MAZE_HEIGHT)
    
    print("[2/4] 生成迷宫（使用递归回溯法）...")
    maze = generator.generate()
    
    # 2. 打印迷宫基本信息
    print("[3/4] 迷宫基本信息:")
    height = len(maze)
    width = len(maze[0]) if height > 0 else 0
    
    # 统计墙壁和路径数量
    wall_count = 0
    passable_count = 0
    for y in range(height):
        for x in range(width):
            if maze[y][x] == 1:
                wall_count += 1
            else:
                passable_count += 1
    
    print(f"  - 迷宫尺寸: {width} x {height} = {width * height} 格")
    print(f"  - 墙壁数量: {wall_count}")
    print(f"  - 可通行格子数量: {passable_count}")
    print(f"  - 路径比例: {passable_count / (width * height) * 100:.1f}%")
    
    # 3. 验证迷宫连通性
    print("\n[4/4] 验证迷宫连通性（使用BFS）...")
    is_connected, visited_count, total_passable = verify_connectivity(generator)
    
    print(f"  - 起点 (1,1) 可达格子数: {visited_count}")
    print(f"  - 总可通行格子数: {total_passable}")
    
    if is_connected:
        print(f"  - 连通性验证: ✓ 通过（所有格子相互可达）")
    else:
        print(f"  - 连通性验证: ✗ 失败（存在不可达的格子）")
        print(f"  - 不可达格子数: {total_passable - visited_count}")
    
    # 4. 打印迷宫可视化
    print_maze_visual(maze)
    
    # 5. 测试辅助方法
    print("\n测试辅助方法:")
    
    # 测试 is_wall 和 is_passable
    test_points = [(0, 0), (1, 1), (1, 2), (2, 1)]
    for x, y in test_points:
        is_w = generator.is_wall(x, y)
        is_p = generator.is_passable(x, y)
        print(f"  - 坐标 ({x},{y}): is_wall={is_w}, is_passable={is_p}")
    
    # 测试 get_neighbors
    test_neighbors = generator.get_neighbors(1, 1, passable_only=True)
    print(f"  - 坐标 (1,1) 的可通行邻居: {test_neighbors}")
    
    # 测试 get_passable_cells
    passable_from_method = generator.get_passable_cells()
    print(f"  - get_passable_cells() 返回格子数: {len(passable_from_method)}")
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)
    
    return is_connected


if __name__ == "__main__":
    test_maze_generator()
