import unittest
from unittest.mock import patch
from maze_generator import MazeGenerator
from entities import Monster
from monster_ai import PathFinder, MonsterAI
from constants import MONSTER_MOVE_INTERVAL


class TestPathFinder(unittest.TestCase):
    def setUp(self):
        self.maze = MazeGenerator(width=5, height=5)
        self.maze.maze = [
            [1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1]
        ]
    
    def test_bfs_start_equals_goal(self):
        start = (1, 1)
        goal = (1, 1)
        path = PathFinder.bfs(self.maze, start, goal)
        self.assertEqual(path, [(1, 1)])
    
    def test_bfs_find_shortest_path(self):
        start = (1, 1)
        goal = (3, 3)
        path = PathFinder.bfs(self.maze, start, goal)
        
        self.assertIsNotNone(path)
        self.assertEqual(path[0], start)
        self.assertEqual(path[-1], goal)
        
        expected_shortest_length = 5
        self.assertEqual(len(path), expected_shortest_length)
    
    def test_bfs_unreachable_goal(self):
        self.maze.maze = [
            [1, 1, 1, 1, 1],
            [1, 0, 1, 0, 1],
            [1, 1, 1, 1, 1],
            [1, 0, 1, 0, 1],
            [1, 1, 1, 1, 1]
        ]
        
        start = (1, 1)
        goal = (3, 3)
        path = PathFinder.bfs(self.maze, start, goal)
        
        self.assertIsNone(path)
    
    def test_bfs_start_is_wall(self):
        start = (0, 0)
        goal = (1, 1)
        path = PathFinder.bfs(self.maze, start, goal)
        self.assertIsNone(path)
    
    def test_bfs_goal_is_wall(self):
        start = (1, 1)
        goal = (0, 0)
        path = PathFinder.bfs(self.maze, start, goal)
        self.assertIsNone(path)


class TestMonsterAI(unittest.TestCase):
    def setUp(self):
        self.maze = MazeGenerator(width=5, height=5)
        self.maze.maze = [
            [1, 1, 1, 1, 1],
            [1, 0, 0, 0, 1],
            [1, 0, 1, 0, 1],
            [1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1]
        ]
        self.monster = Monster(1, 1)
        self.ai = MonsterAI(self.monster, self.maze)
    
    def test_init(self):
        self.assertEqual(self.ai.monster, self.monster)
        self.assertEqual(self.ai.maze, self.maze)
        self.assertEqual(self.ai.last_move_time, 0)
        self.assertEqual(self.ai.move_interval, MONSTER_MOVE_INTERVAL)
        self.assertIsNone(self.ai.target_path)
        self.assertEqual(self.ai.current_path_index, 0)
    
    def test_should_move_true(self):
        self.ai.last_move_time = 0
        current_time = MONSTER_MOVE_INTERVAL
        self.assertTrue(self.ai.should_move(current_time))
    
    def test_should_move_false(self):
        self.ai.last_move_time = 0
        current_time = MONSTER_MOVE_INTERVAL - 1
        self.assertFalse(self.ai.should_move(current_time))
    
    def test_get_valid_neighbors(self):
        neighbors = self.ai.get_valid_neighbors(1, 1)
        expected_neighbors = [(1, 2), (2, 1)]
        self.assertEqual(len(neighbors), 2)
        for n in expected_neighbors:
            self.assertIn(n, neighbors)
    
    def test_get_valid_neighbors_no_passable(self):
        self.maze.maze = [
            [1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ]
        neighbors = self.ai.get_valid_neighbors(1, 1)
        self.assertEqual(neighbors, [])
    
    def test_move_to(self):
        initial_x = self.monster.x
        initial_y = self.monster.y
        initial_time = self.ai.last_move_time
        
        result = self.ai.move_to(2, 1)
        
        self.assertTrue(result)
        self.assertEqual(self.monster.x, 2)
        self.assertEqual(self.monster.y, 1)
        self.assertEqual(self.ai.last_move_time, initial_time + MONSTER_MOVE_INTERVAL)
    
    def test_random_move_no_walls(self):
        initial_x = self.monster.x
        initial_y = self.monster.y
        initial_time = self.ai.last_move_time
        
        result = self.ai.random_move()
        
        self.assertTrue(result)
        self.assertNotEqual((self.monster.x, self.monster.y), (initial_x, initial_y))
        self.assertTrue(self.maze.is_passable(self.monster.x, self.monster.y))
        self.assertEqual(self.ai.last_move_time, initial_time + MONSTER_MOVE_INTERVAL)
    
    def test_random_move_all_walls(self):
        self.maze.maze = [
            [1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1]
        ]
        initial_x = self.monster.x
        initial_y = self.monster.y
        initial_time = self.ai.last_move_time
        
        result = self.ai.random_move()
        
        self.assertFalse(result)
        self.assertEqual(self.monster.x, initial_x)
        self.assertEqual(self.monster.y, initial_y)
        self.assertEqual(self.ai.last_move_time, initial_time + MONSTER_MOVE_INTERVAL)
    
    @patch('random.choice')
    def test_random_move_does_not_go_through_walls(self, mock_choice):
        valid_neighbors = [(1, 2), (2, 1)]
        mock_choice.return_value = (2, 1)
        
        self.ai.random_move()
        
        self.assertEqual(self.monster.x, 2)
        self.assertEqual(self.monster.y, 1)
        self.assertTrue(self.maze.is_passable(self.monster.x, self.monster.y))
    
    def test_set_target_reachable(self):
        target_x, target_y = 3, 3
        self.ai.set_target(target_x, target_y)
        
        self.assertIsNotNone(self.ai.target_path)
        self.assertEqual(self.ai.target_path[0], (1, 1))
        self.assertEqual(self.ai.target_path[-1], (3, 3))
        self.assertEqual(self.ai.current_path_index, 0)
        self.assertEqual(self.monster.target_x, target_x)
        self.assertEqual(self.monster.target_y, target_y)
    
    def test_set_target_unreachable(self):
        self.maze.maze = [
            [1, 1, 1, 1, 1],
            [1, 0, 1, 0, 1],
            [1, 1, 1, 1, 1],
            [1, 0, 1, 0, 1],
            [1, 1, 1, 1, 1]
        ]
        
        self.ai.set_target(3, 3)
        
        self.assertIsNone(self.ai.target_path)
        self.assertFalse(self.monster.has_target())
    
    def test_chase_move_moves_towards_goal(self):
        self.ai.set_target(3, 3)
        
        initial_pos = (self.monster.x, self.monster.y)
        result = self.ai.chase_move()
        
        self.assertTrue(result)
        new_pos = (self.monster.x, self.monster.y)
        self.assertNotEqual(new_pos, initial_pos)
        self.assertTrue(self.maze.is_passable(self.monster.x, self.monster.y))
        
        initial_dist = abs(initial_pos[0] - 3) + abs(initial_pos[1] - 3)
        new_dist = abs(new_pos[0] - 3) + abs(new_pos[1] - 3)
        self.assertLess(new_dist, initial_dist)
    
    def test_chase_move_no_path_fallback_to_random(self):
        self.ai.target_path = None
        
        with patch.object(self.ai, 'random_move') as mock_random_move:
            mock_random_move.return_value = True
            result = self.ai.chase_move()
            
            mock_random_move.assert_called_once()
            self.assertTrue(result)
    
    def test_clear_target(self):
        self.ai.set_target(3, 3)
        self.assertIsNotNone(self.ai.target_path)
        self.assertTrue(self.monster.has_target())
        
        self.ai.clear_target()
        
        self.assertIsNone(self.ai.target_path)
        self.assertFalse(self.monster.has_target())
    
    def test_update_should_not_move(self):
        self.ai.last_move_time = 0
        current_time = MONSTER_MOVE_INTERVAL - 1
        
        result = self.ai.update(current_time)
        
        self.assertFalse(result)
    
    def test_update_should_move_random(self):
        self.ai.last_move_time = 0
        current_time = MONSTER_MOVE_INTERVAL
        
        result = self.ai.update(current_time)
        
        self.assertTrue(result)
    
    def test_update_should_move_chase(self):
        self.ai.set_target(3, 3)
        self.ai.last_move_time = 0
        current_time = MONSTER_MOVE_INTERVAL
        
        result = self.ai.update(current_time)
        
        self.assertTrue(result)


if __name__ == "__main__":
    unittest.main()
