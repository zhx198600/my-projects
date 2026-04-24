import unittest
from entities import GameState, Entity, Player, Monster, Treasure, Exit


class TestGameState(unittest.TestCase):
    def test_game_state_values(self):
        self.assertEqual(GameState.PLAYING.value, "playing")
        self.assertEqual(GameState.WIN.value, "win")
        self.assertEqual(GameState.LOSE.value, "lose")

    def test_game_state_enum_members(self):
        self.assertIn(GameState.PLAYING, GameState)
        self.assertIn(GameState.WIN, GameState)
        self.assertIn(GameState.LOSE, GameState)


class TestEntity(unittest.TestCase):
    def test_init_position(self):
        entity = Entity(5, 10)
        self.assertEqual(entity.x, 5)
        self.assertEqual(entity.y, 10)

    def test_get_position(self):
        entity = Entity(3, 7)
        self.assertEqual(entity.get_position(), (3, 7))

    def test_set_position(self):
        entity = Entity(1, 1)
        entity.set_position(4, 6)
        self.assertEqual(entity.get_position(), (4, 6))

    def test_move(self):
        entity = Entity(2, 3)
        entity.move(1, 2)
        self.assertEqual(entity.get_position(), (3, 5))
        
        entity.move(-1, -1)
        self.assertEqual(entity.get_position(), (2, 4))


class TestPlayer(unittest.TestCase):
    def test_init(self):
        player = Player(0, 0)
        self.assertEqual(player.get_position(), (0, 0))
        self.assertEqual(player.get_treasure_count(), 0)

    def test_collect_treasure(self):
        player = Player(0, 0)
        player.collect_treasure()
        self.assertEqual(player.get_treasure_count(), 1)
        
        player.collect_treasure()
        player.collect_treasure()
        self.assertEqual(player.get_treasure_count(), 3)

    def test_get_treasure_count(self):
        player = Player(5, 5)
        self.assertEqual(player.get_treasure_count(), 0)
        
        for _ in range(10):
            player.collect_treasure()
        
        self.assertEqual(player.get_treasure_count(), 10)


class TestMonster(unittest.TestCase):
    def test_init(self):
        monster = Monster(10, 10)
        self.assertEqual(monster.get_position(), (10, 10))
        self.assertFalse(monster.has_target())
        self.assertIsNone(monster.target_x)
        self.assertIsNone(monster.target_y)

    def test_set_target(self):
        monster = Monster(0, 0)
        monster.set_target(5, 8)
        
        self.assertTrue(monster.has_target())
        self.assertEqual(monster.target_x, 5)
        self.assertEqual(monster.target_y, 8)

    def test_clear_target(self):
        monster = Monster(0, 0)
        monster.set_target(3, 3)
        self.assertTrue(monster.has_target())
        
        monster.clear_target()
        self.assertFalse(monster.has_target())
        self.assertIsNone(monster.target_x)
        self.assertIsNone(monster.target_y)

    def test_has_target(self):
        monster = Monster(2, 2)
        self.assertFalse(monster.has_target())
        
        monster.set_target(1, 1)
        self.assertTrue(monster.has_target())
        
        monster.clear_target()
        self.assertFalse(monster.has_target())


class TestTreasure(unittest.TestCase):
    def test_init(self):
        treasure = Treasure(7, 7)
        self.assertEqual(treasure.get_position(), (7, 7))
        self.assertFalse(treasure.is_collected())

    def test_collect(self):
        treasure = Treasure(4, 4)
        self.assertFalse(treasure.is_collected())
        
        treasure.collect()
        self.assertTrue(treasure.is_collected())

    def test_is_collected(self):
        treasure1 = Treasure(1, 2)
        treasure2 = Treasure(3, 4)
        
        self.assertFalse(treasure1.is_collected())
        self.assertFalse(treasure2.is_collected())
        
        treasure2.collect()
        
        self.assertFalse(treasure1.is_collected())
        self.assertTrue(treasure2.is_collected())


class TestExit(unittest.TestCase):
    def test_init(self):
        exit_ = Exit(15, 15)
        self.assertEqual(exit_.get_position(), (15, 15))
        self.assertFalse(exit_.is_activated())

    def test_activate(self):
        exit_ = Exit(9, 9)
        self.assertFalse(exit_.is_activated())
        
        exit_.activate()
        self.assertTrue(exit_.is_activated())

    def test_is_activated(self):
        exit1 = Exit(1, 1)
        exit2 = Exit(2, 2)
        
        self.assertFalse(exit1.is_activated())
        self.assertFalse(exit2.is_activated())
        
        exit1.activate()
        
        self.assertTrue(exit1.is_activated())
        self.assertFalse(exit2.is_activated())


if __name__ == "__main__":
    unittest.main()
