import unittest
import pygame
from input_controller import InputController


class TestInputController(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        pygame.init()

    def setUp(self):
        self.controller = InputController(move_delay=150)

    def test_up_key_move_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_UP)
        self.controller.handle_event(event)
        self.assertTrue(self.controller.has_pending_input())

        move = self.controller.get_move_request(0)
        self.assertEqual(move, (0, -1))

    def test_down_key_move_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_DOWN)
        self.controller.handle_event(event)
        move = self.controller.get_move_request(0)
        self.assertEqual(move, (0, 1))

    def test_left_key_move_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_LEFT)
        self.controller.handle_event(event)
        move = self.controller.get_move_request(0)
        self.assertEqual(move, (-1, 0))

    def test_right_key_move_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RIGHT)
        self.controller.handle_event(event)
        move = self.controller.get_move_request(0)
        self.assertEqual(move, (1, 0))

    def test_w_key_move_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_w)
        self.controller.handle_event(event)
        move = self.controller.get_move_request(0)
        self.assertEqual(move, (0, -1))

    def test_s_key_move_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_s)
        self.controller.handle_event(event)
        move = self.controller.get_move_request(0)
        self.assertEqual(move, (0, 1))

    def test_a_key_move_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_a)
        self.controller.handle_event(event)
        move = self.controller.get_move_request(0)
        self.assertEqual(move, (-1, 0))

    def test_d_key_move_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_d)
        self.controller.handle_event(event)
        move = self.controller.get_move_request(0)
        self.assertEqual(move, (1, 0))

    def test_space_key_echo_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_SPACE)
        self.controller.handle_event(event)
        self.assertTrue(self.controller.has_pending_input())

        echo = self.controller.get_echo_request()
        self.assertTrue(echo)

    def test_echo_request_resets_after_get(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_SPACE)
        self.controller.handle_event(event)

        echo1 = self.controller.get_echo_request()
        self.assertTrue(echo1)

        echo2 = self.controller.get_echo_request()
        self.assertFalse(echo2)

    def test_move_cooldown_prevents_quick_move(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RIGHT)
        self.controller.handle_event(event)

        move1 = self.controller.get_move_request(0)
        self.assertEqual(move1, (1, 0))

        event2 = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_RIGHT)
        self.controller.handle_event(event2)

        move2 = self.controller.get_move_request(100)
        self.assertIsNone(move2)

        move3 = self.controller.get_move_request(200)
        self.assertEqual(move3, (1, 0))

    def test_reset_clears_all_input(self):
        move_event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_UP)
        echo_event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_SPACE)

        self.controller.handle_event(move_event)
        self.controller.handle_event(echo_event)

        self.assertTrue(self.controller.has_pending_input())

        self.controller.reset()

        self.assertFalse(self.controller.has_pending_input())
        self.assertIsNone(self.controller.get_move_request(0))
        self.assertFalse(self.controller.get_echo_request())

    def test_has_pending_input(self):
        self.assertFalse(self.controller.has_pending_input())

        move_event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_LEFT)
        self.controller.handle_event(move_event)
        self.assertTrue(self.controller.has_pending_input())

        self.controller.reset()
        self.assertFalse(self.controller.has_pending_input())

        echo_event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_SPACE)
        self.controller.handle_event(echo_event)
        self.assertTrue(self.controller.has_pending_input())

    def test_move_request_get_clears_request(self):
        event = pygame.event.Event(pygame.KEYDOWN, key=pygame.K_UP)
        self.controller.handle_event(event)

        self.assertTrue(self.controller.has_pending_input())

        move1 = self.controller.get_move_request(0)
        self.assertEqual(move1, (0, -1))

        self.assertFalse(self.controller.has_pending_input())

        move2 = self.controller.get_move_request(0)
        self.assertIsNone(move2)


if __name__ == "__main__":
    unittest.main()
