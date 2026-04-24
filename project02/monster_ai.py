from collections import deque
import random
from typing import List, Tuple, Optional
from constants import MONSTER_MOVE_INTERVAL
from entities import Monster
from maze_generator import MazeGenerator


class PathFinder:
    @staticmethod
    def bfs(maze: MazeGenerator, start: Tuple[int, int], goal: Tuple[int, int]) -> Optional[List[Tuple[int, int]]]:
        if start == goal:
            return [start]
        
        if not maze.is_passable(start[0], start[1]) or not maze.is_passable(goal[0], goal[1]):
            return None
        
        queue = deque([start])
        visited = {start}
        parent = {start: None}
        directions = [(0, -1), (0, 1), (-1, 0), (1, 0)]
        
        while queue:
            current = queue.popleft()
            
            if current == goal:
                path = []
                while current is not None:
                    path.append(current)
                    current = parent[current]
                return path[::-1]
            
            for dx, dy in directions:
                next_x = current[0] + dx
                next_y = current[1] + dy
                neighbor = (next_x, next_y)
                
                if neighbor not in visited and maze.is_passable(next_x, next_y):
                    visited.add(neighbor)
                    parent[neighbor] = current
                    queue.append(neighbor)
        
        return None


class MonsterAI:
    def __init__(self, monster: Monster, maze: MazeGenerator) -> None:
        self.monster = monster
        self.maze = maze
        self.last_move_time: int = 0
        self.move_interval: int = MONSTER_MOVE_INTERVAL
        self.target_path: Optional[List[Tuple[int, int]]] = None
        self.current_path_index: int = 0
    
    def update(self, current_time: int) -> bool:
        if self.should_move(current_time):
            if self.target_path and self.current_path_index < len(self.target_path):
                return self.chase_move()
            else:
                return self.random_move()
        return False
    
    def should_move(self, current_time: int) -> bool:
        return current_time - self.last_move_time >= self.move_interval
    
    def random_move(self) -> bool:
        neighbors = self.get_valid_neighbors(self.monster.x, self.monster.y)
        
        if neighbors:
            new_pos = random.choice(neighbors)
            return self.move_to(new_pos[0], new_pos[1])
        else:
            self.last_move_time = self.last_move_time + self.move_interval
            return False
    
    def get_valid_neighbors(self, x: int, y: int) -> List[Tuple[int, int]]:
        return self.maze.get_neighbors(x, y, passable_only=True)
    
    def move_to(self, new_x: int, new_y: int) -> bool:
        self.monster.set_position(new_x, new_y)
        self.last_move_time = self.last_move_time + self.move_interval
        return True
    
    def set_target(self, target_x: int, target_y: int) -> None:
        start = (self.monster.x, self.monster.y)
        goal = (target_x, target_y)
        
        self.target_path = PathFinder.bfs(self.maze, start, goal)
        self.current_path_index = 0
        
        if self.target_path:
            self.monster.set_target(target_x, target_y)
    
    def chase_move(self) -> bool:
        if not self.target_path:
            return self.random_move()
        
        if self.current_path_index >= len(self.target_path):
            self.clear_target()
            return self.random_move()
        
        current_monster_pos = (self.monster.x, self.monster.y)
        
        if self.current_path_index < len(self.target_path) - 1:
            next_pos = self.target_path[self.current_path_index + 1]
            
            current_pos_in_path = self.target_path[self.current_path_index]
            if current_monster_pos != current_pos_in_path:
                self.target_path = PathFinder.bfs(self.maze, current_monster_pos, self.target_path[-1])
                self.current_path_index = 0
                if not self.target_path or len(self.target_path) <= 1:
                    self.clear_target()
                    return self.random_move()
                next_pos = self.target_path[1]
            
            return self.move_to(next_pos[0], next_pos[1])
        
        self.clear_target()
        return False
    
    def clear_target(self) -> None:
        self.target_path = None
        self.current_path_index = 0
        self.monster.clear_target()
