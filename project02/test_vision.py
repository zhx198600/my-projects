import unittest
from vision_system import VisionSystem


class TestVisionSystem(unittest.TestCase):

    def setUp(self):
        self.vision = VisionSystem()

    def test_default_visibility_only_player_cell(self):
        self.vision.set_player_position(5, 5)

        self.assertTrue(self.vision.is_cell_visible(5, 5))
        self.assertFalse(self.vision.is_cell_visible(4, 5))
        self.assertFalse(self.vision.is_cell_visible(5, 4))
        self.assertFalse(self.vision.is_cell_visible(6, 5))
        self.assertFalse(self.vision.is_cell_visible(5, 6))

        visible_cells = self.vision.get_visible_cells()
        self.assertEqual(len(visible_cells), 1)
        self.assertIn((5, 5), visible_cells)

    def test_echo_visibility_range_correct(self):
        self.vision.set_player_position(5, 5)
        current_time = 1000

        result = self.vision.trigger_echo(current_time)
        self.assertTrue(result)
        self.assertTrue(self.vision.is_echo_active())

        self.assertTrue(self.vision.is_cell_visible(5, 5))

        self.assertTrue(self.vision.is_cell_visible(2, 5))
        self.assertTrue(self.vision.is_cell_visible(8, 5))
        self.assertTrue(self.vision.is_cell_visible(5, 2))
        self.assertTrue(self.vision.is_cell_visible(5, 8))

        self.assertTrue(self.vision.is_cell_visible(3, 5))
        self.assertTrue(self.vision.is_cell_visible(7, 5))
        self.assertTrue(self.vision.is_cell_visible(5, 3))
        self.assertTrue(self.vision.is_cell_visible(5, 7))

        self.assertTrue(self.vision.is_cell_visible(3, 4))
        self.assertTrue(self.vision.is_cell_visible(4, 3))
        self.assertTrue(self.vision.is_cell_visible(6, 7))
        self.assertTrue(self.vision.is_cell_visible(7, 6))

        self.assertFalse(self.vision.is_cell_visible(1, 5))
        self.assertFalse(self.vision.is_cell_visible(9, 5))
        self.assertFalse(self.vision.is_cell_visible(5, 1))
        self.assertFalse(self.vision.is_cell_visible(5, 9))

        self.assertFalse(self.vision.is_cell_visible(2, 3))
        self.assertFalse(self.vision.is_cell_visible(3, 2))
        self.assertFalse(self.vision.is_cell_visible(7, 8))
        self.assertFalse(self.vision.is_cell_visible(8, 7))

    def test_echo_duration_correct(self):
        self.vision.set_player_position(5, 5)
        start_time = 1000

        self.vision.trigger_echo(start_time)
        self.assertTrue(self.vision.is_echo_active())

        self.vision.update(start_time + 500)
        self.assertTrue(self.vision.is_echo_active())
        self.assertFalse(self.vision.is_on_cooldown())

        self.vision.update(start_time + 999)
        self.assertTrue(self.vision.is_echo_active())
        self.assertFalse(self.vision.is_on_cooldown())

        self.vision.update(start_time + 1000)
        self.assertFalse(self.vision.is_echo_active())
        self.assertTrue(self.vision.is_on_cooldown())

        self.assertFalse(self.vision.is_cell_visible(4, 5))
        self.assertTrue(self.vision.is_cell_visible(5, 5))

    def test_cooldown_mechanism(self):
        self.vision.set_player_position(5, 5)
        start_time = 1000

        self.vision.trigger_echo(start_time)
        self.assertFalse(self.vision.is_on_cooldown())

        self.vision.update(start_time + 1000)
        self.assertTrue(self.vision.is_on_cooldown())

        result = self.vision.trigger_echo(start_time + 1500)
        self.assertFalse(result)

        self.vision.update(start_time + 1999)
        self.assertTrue(self.vision.is_on_cooldown())

        self.vision.update(start_time + 2000)
        self.assertFalse(self.vision.is_on_cooldown())

        result = self.vision.trigger_echo(start_time + 2000)
        self.assertTrue(result)
        self.assertTrue(self.vision.is_echo_active())

    def test_manhattan_distance_calculation(self):
        self.assertEqual(self.vision.manhattan_distance(0, 0, 0, 0), 0)
        self.assertEqual(self.vision.manhattan_distance(5, 5, 5, 5), 0)

        self.assertEqual(self.vision.manhattan_distance(0, 0, 3, 0), 3)
        self.assertEqual(self.vision.manhattan_distance(0, 0, 0, 3), 3)
        self.assertEqual(self.vision.manhattan_distance(0, 0, -3, 0), 3)
        self.assertEqual(self.vision.manhattan_distance(0, 0, 0, -3), 3)

        self.assertEqual(self.vision.manhattan_distance(5, 5, 6, 6), 2)
        self.assertEqual(self.vision.manhattan_distance(5, 5, 4, 4), 2)
        self.assertEqual(self.vision.manhattan_distance(5, 5, 6, 4), 2)
        self.assertEqual(self.vision.manhattan_distance(5, 5, 4, 6), 2)

        self.assertEqual(self.vision.manhattan_distance(5, 5, 7, 6), 3)
        self.assertEqual(self.vision.manhattan_distance(5, 5, 3, 4), 3)
        self.assertEqual(self.vision.manhattan_distance(5, 5, 6, 7), 3)
        self.assertEqual(self.vision.manhattan_distance(5, 5, 4, 3), 3)

    def test_calculate_echo_cells(self):
        cells = self.vision.calculate_echo_cells(5, 5, 0)
        self.assertEqual(len(cells), 1)
        self.assertIn((5, 5), cells)

        cells = self.vision.calculate_echo_cells(5, 5, 1)
        self.assertEqual(len(cells), 5)
        self.assertIn((5, 5), cells)
        self.assertIn((4, 5), cells)
        self.assertIn((6, 5), cells)
        self.assertIn((5, 4), cells)
        self.assertIn((5, 6), cells)

        cells = self.vision.calculate_echo_cells(5, 5, 3)
        self.assertTrue(len(cells) > 5)
        self.assertIn((5, 5), cells)
        self.assertIn((2, 5), cells)
        self.assertIn((8, 5), cells)
        self.assertIn((5, 2), cells)
        self.assertIn((5, 8), cells)

    def test_get_echo_progress(self):
        self.vision.set_player_position(5, 5)
        start_time = 1000

        self.assertEqual(self.vision.get_echo_progress(start_time), 0.0)

        self.vision.trigger_echo(start_time)

        self.assertEqual(self.vision.get_echo_progress(start_time), 0.0)

        self.assertEqual(self.vision.get_echo_progress(start_time + 500), 0.5)

        self.assertEqual(self.vision.get_echo_progress(start_time + 250), 0.25)

        self.assertEqual(self.vision.get_echo_progress(start_time + 750), 0.75)

        self.assertEqual(self.vision.get_echo_progress(start_time + 1000), 1.0)

        self.assertEqual(self.vision.get_echo_progress(start_time + 1500), 1.5)

        self.vision.update(start_time + 1000)
        self.assertEqual(self.vision.get_echo_progress(start_time + 1000), 0.0)

    def test_set_player_position_updates_visibility(self):
        self.vision.set_player_position(1, 1)
        self.assertTrue(self.vision.is_cell_visible(1, 1))
        self.assertFalse(self.vision.is_cell_visible(2, 2))

        self.vision.set_player_position(3, 3)
        self.assertTrue(self.vision.is_cell_visible(3, 3))
        self.assertFalse(self.vision.is_cell_visible(1, 1))

        start_time = 1000
        self.vision.trigger_echo(start_time)

        self.vision.set_player_position(5, 5)
        self.assertTrue(self.vision.is_cell_visible(5, 5))
        self.assertTrue(self.vision.is_cell_visible(4, 5))
        self.assertTrue(self.vision.is_cell_visible(5, 4))


if __name__ == '__main__':
    unittest.main()
