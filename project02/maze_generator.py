import random
from constants import MAZE_WIDTH, MAZE_HEIGHT


class MazeGenerator:
    """
    迷宫生成器类，使用递归回溯法(DFS)生成迷宫
    迷宫使用网格表示：1表示墙壁，0表示可通行路径
    奇数坐标作为路径格子，偶数坐标作为墙壁格子
    """
    
    def __init__(self, width=15, height=15):
        """
        初始化迷宫生成器
        
        参数:
            width: 迷宫宽度（格子数），默认15
            height: 迷宫高度（格子数），默认15
        """
        # 确保宽度和高度为奇数，这样可以保证中心有路径
        self.width = width if width % 2 == 1 else width + 1
        self.height = height if height % 2 == 1 else height + 1
        
        # 初始化迷宫，全部为墙壁(1)
        self.maze = [[1 for _ in range(self.width)] for _ in range(self.height)]
        
        # 方向定义：上、下、左、右（每次移动2格，因为中间有墙）
        # dx, dy 表示移动的格数
        self.directions = [
            (0, -2),  # 上
            (0, 2),   # 下
            (-2, 0),  # 左
            (2, 0)    # 右
        ]
    
    def generate(self):
        """
        使用递归回溯法(DFS)生成迷宫
        
        返回:
            二维列表表示的迷宫，1表示墙壁，0表示可通行路径
        """
        # 从起点 (1,1) 开始
        start_x, start_y = 1, 1
        self.maze[start_y][start_x] = 0
        
        # 使用栈实现非递归的DFS
        stack = [(start_x, start_y)]
        
        while stack:
            current_x, current_y = stack[-1]
            
            # 获取所有未访问的邻居
            unvisited_neighbors = []
            for dx, dy in self.directions:
                nx = current_x + dx
                ny = current_y + dy
                
                # 检查边界
                if 0 <= nx < self.width and 0 <= ny < self.height:
                    # 如果是墙壁，说明还未访问
                    if self.maze[ny][nx] == 1:
                        unvisited_neighbors.append((dx, dy))
            
            if unvisited_neighbors:
                # 随机选择一个方向
                dx, dy = random.choice(unvisited_neighbors)
                
                # 计算目标格子坐标
                nx = current_x + dx
                ny = current_y + dy
                
                # 计算中间墙壁的坐标
                wall_x = current_x + dx // 2
                wall_y = current_y + dy // 2
                
                # 打通墙壁（设置为路径）
                self.maze[wall_y][wall_x] = 0
                self.maze[ny][nx] = 0
                
                # 将新格子压入栈
                stack.append((nx, ny))
            else:
                # 没有未访问的邻居，回溯
                stack.pop()
        
        return self.maze
    
    def is_wall(self, x, y):
        """
        检查指定坐标是否为墙壁
        
        参数:
            x: 横坐标
            y: 纵坐标
        
        返回:
            True 如果是墙壁，False 如果是路径或坐标越界
        """
        if x < 0 or x >= self.width or y < 0 or y >= self.height:
            return True
        return self.maze[y][x] == 1
    
    def is_passable(self, x, y):
        """
        检查指定坐标是否可通行（非墙壁且在边界内）
        
        参数:
            x: 横坐标
            y: 纵坐标
        
        返回:
            True 如果可通行，False 否则
        """
        if x < 0 or x >= self.width or y < 0 or y >= self.height:
            return False
        return self.maze[y][x] == 0
    
    def get_passable_cells(self):
        """
        返回所有可通行格子的坐标列表
        
        返回:
            列表，每个元素是 (x, y) 坐标元组
        """
        passable_cells = []
        for y in range(self.height):
            for x in range(self.width):
                if self.maze[y][x] == 0:
                    passable_cells.append((x, y))
        return passable_cells
    
    def get_neighbors(self, x, y, passable_only=True):
        """
        获取指定格子的相邻格子（上、下、左、右四个方向）
        
        参数:
            x: 横坐标
            y: 纵坐标
            passable_only: 如果为True，只返回可通行的邻居
        
        返回:
            列表，每个元素是 (x, y) 坐标元组
        """
        neighbors = []
        
        # 四个方向
        directions = [
            (0, -1),  # 上
            (0, 1),   # 下
            (-1, 0),  # 左
            (1, 0)    # 右
        ]
        
        for dx, dy in directions:
            nx = x + dx
            ny = y + dy
            
            if passable_only:
                if self.is_passable(nx, ny):
                    neighbors.append((nx, ny))
            else:
                # 不检查是否可通行，只检查边界
                if 0 <= nx < self.width and 0 <= ny < self.height:
                    neighbors.append((nx, ny))
        
        return neighbors
