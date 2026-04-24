import unittest
from entities import GameState, Player, Monster, Treasure, Exit
from game_manager import GameManager


class MockMaze:
    def is_passable(self, x, y):
        return True
    
    def get_passable_cells(self):
        return [(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8)]


class MockVisionSystem:
    def set_player_position(self, x, y):
        pass


class TestTreasureCollision(unittest.TestCase):
    def test_treasure_collected_when_player_collides(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        
        treasure = Treasure(2, 2)
        treasures = [treasure]
        exit = Exit(5, 5)
        
        game_manager = GameManager(maze, player, vision_system, treasures=treasures, exit=exit)
        
        player.set_position(2, 2)
        
        result = game_manager.check_treasure_collision()
        
        self.assertTrue(result)
        self.assertTrue(treasure.is_collected())
        self.assertEqual(player.get_treasure_count(), 1)
        self.assertEqual(game_manager.treasure_count, 1)
    
    def test_already_collected_treasure_not_collected_again(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        
        treasure = Treasure(2, 2)
        treasure.collect()
        treasures = [treasure]
        exit = Exit(5, 5)
        
        game_manager = GameManager(maze, player, vision_system, treasures=treasures, exit=exit)
        
        player.set_position(2, 2)
        
        result = game_manager.check_treasure_collision()
        
        self.assertFalse(result)
        self.assertEqual(game_manager.treasure_count, 0)


class TestExitActivation(unittest.TestCase):
    def test_exit_activated_after_collecting_three_treasures(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        
        treasure1 = Treasure(2, 2)
        treasure2 = Treasure(3, 3)
        treasure3 = Treasure(4, 4)
        treasures = [treasure1, treasure2, treasure3]
        exit = Exit(5, 5)
        
        game_manager = GameManager(maze, player, vision_system, treasures=treasures, exit=exit)
        
        self.assertFalse(exit.is_activated())
        
        player.set_position(2, 2)
        game_manager.check_treasure_collision()
        self.assertFalse(exit.is_activated())
        
        player.set_position(3, 3)
        game_manager.check_treasure_collision()
        self.assertFalse(exit.is_activated())
        
        player.set_position(4, 4)
        game_manager.check_treasure_collision()
        
        self.assertTrue(exit.is_activated())
        self.assertEqual(game_manager.treasure_count, 3)


class TestMonsterCollision(unittest.TestCase):
    def test_game_lose_when_player_collides_with_monster(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        monster = Monster(2, 2)
        
        game_manager = GameManager(maze, player, vision_system, monster=monster)
        
        self.assertEqual(game_manager.get_game_state(), GameState.PLAYING)
        self.assertFalse(game_manager.is_game_over())
        
        player.set_position(2, 2)
        
        result = game_manager.check_monster_collision()
        
        self.assertTrue(result)
        self.assertEqual(game_manager.get_game_state(), GameState.LOSE)
        self.assertTrue(game_manager.is_game_over())
    
    def test_monster_collision_ignored_when_game_not_playing(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        monster = Monster(2, 2)
        
        game_manager = GameManager(maze, player, vision_system, monster=monster)
        
        game_manager.set_game_state(GameState.WIN)
        
        player.set_position(2, 2)
        
        result = game_manager.check_monster_collision()
        
        self.assertFalse(result)
        self.assertEqual(game_manager.get_game_state(), GameState.WIN)


class TestExitCollision(unittest.TestCase):
    def test_no_win_when_exit_not_activated(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        exit = Exit(5, 5)
        
        game_manager = GameManager(maze, player, vision_system, exit=exit)
        
        self.assertFalse(exit.is_activated())
        
        player.set_position(5, 5)
        
        result = game_manager.check_exit_collision()
        
        self.assertFalse(result)
        self.assertEqual(game_manager.get_game_state(), GameState.PLAYING)
    
    def test_win_when_exit_activated_and_player_collides(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        exit = Exit(5, 5)
        
        game_manager = GameManager(maze, player, vision_system, exit=exit)
        
        exit.activate()
        self.assertTrue(exit.is_activated())
        
        player.set_position(5, 5)
        
        result = game_manager.check_exit_collision()
        
        self.assertTrue(result)
        self.assertEqual(game_manager.get_game_state(), GameState.WIN)
        self.assertTrue(game_manager.is_game_over())


class TestAllCollisions(unittest.TestCase):
    def test_check_all_collisions_returns_correct_dict(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        monster = Monster(3, 3)
        treasure = Treasure(2, 2)
        treasures = [treasure]
        exit = Exit(5, 5)
        
        game_manager = GameManager(maze, player, vision_system, monster=monster, treasures=treasures, exit=exit)
        
        result = game_manager.check_all_collisions()
        
        self.assertFalse(result['treasure_collected'])
        self.assertFalse(result['player_died'])
        self.assertFalse(result['game_won'])
    
    def test_check_all_collisions_treasure_collected(self):
        maze = MockMaze()
        player = Player(2, 2)
        vision_system = MockVisionSystem()
        treasure = Treasure(2, 2)
        treasures = [treasure]
        exit = Exit(5, 5)
        
        game_manager = GameManager(maze, player, vision_system, treasures=treasures, exit=exit)
        
        result = game_manager.check_all_collisions()
        
        self.assertTrue(result['treasure_collected'])
        self.assertTrue(treasure.is_collected())
    
    def test_check_all_collisions_order_monster_first(self):
        maze = MockMaze()
        player = Player(2, 2)
        vision_system = MockVisionSystem()
        monster = Monster(2, 2)
        treasure = Treasure(2, 2)
        treasures = [treasure]
        exit = Exit(5, 5)
        
        game_manager = GameManager(maze, player, vision_system, monster=monster, treasures=treasures, exit=exit)
        
        result = game_manager.check_all_collisions()
        
        self.assertTrue(result['player_died'])
        self.assertFalse(result['treasure_collected'])
        self.assertFalse(treasure.is_collected())
        self.assertEqual(game_manager.get_game_state(), GameState.LOSE)


class TestGameStateManagement(unittest.TestCase):
    def test_initial_game_state(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        
        game_manager = GameManager(maze, player, vision_system)
        
        self.assertEqual(game_manager.get_game_state(), GameState.PLAYING)
        self.assertFalse(game_manager.is_game_over())
    
    def test_set_game_state(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        
        game_manager = GameManager(maze, player, vision_system)
        
        game_manager.set_game_state(GameState.WIN)
        self.assertEqual(game_manager.get_game_state(), GameState.WIN)
        self.assertTrue(game_manager.is_game_over())
        
        game_manager.set_game_state(GameState.LOSE)
        self.assertEqual(game_manager.get_game_state(), GameState.LOSE)
        self.assertTrue(game_manager.is_game_over())
        
        game_manager.set_game_state(GameState.PLAYING)
        self.assertEqual(game_manager.get_game_state(), GameState.PLAYING)
        self.assertFalse(game_manager.is_game_over())
    
    def test_move_player_ignored_when_game_over(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        
        game_manager = GameManager(maze, player, vision_system)
        game_manager.set_game_state(GameState.LOSE)
        
        result = game_manager.move_player(1, 0)
        
        self.assertFalse(result)
        self.assertEqual(player.get_position(), (1, 1))
    
    def test_update_ignored_when_game_over(self):
        maze = MockMaze()
        player = Player(1, 1)
        vision_system = MockVisionSystem()
        monster = Monster(3, 3)
        
        game_manager = GameManager(maze, player, vision_system, monster=monster)
        game_manager.set_game_state(GameState.WIN)
        
        result = game_manager.update(1000)
        
        self.assertFalse(result)


if __name__ == "__main__":
    unittest.main()
