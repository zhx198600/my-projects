import pygame
import math
from constants import (
    COLOR_PLAYER, COLOR_MONSTER, COLOR_TREASURE, COLOR_EXIT,
    COLOR_WALL, COLOR_FLOOR, COLOR_BLACK, COLOR_WHITE
)

TILE_WIDTH = 64
TILE_HEIGHT = 32


class Renderer:
    def __init__(self, screen):
        self.screen = screen
        self.screen_width = screen.get_width()
        self.screen_height = screen.get_height()
        self.offset_x = self.screen_width // 2
        self.offset_y = self.screen_height // 2 - TILE_HEIGHT

    def grid_to_screen(self, grid_x, grid_y):
        screen_x = self.offset_x + (grid_x - grid_y) * TILE_WIDTH / 2
        screen_y = self.offset_y + (grid_x + grid_y) * TILE_HEIGHT / 2
        return (screen_x, screen_y)

    def darken_color(self, color, factor):
        r = int(color[0] * (1 - factor))
        g = int(color[1] * (1 - factor))
        b = int(color[2] * (1 - factor))
        return (r, g, b)

    def lighten_color(self, color, factor):
        r = min(255, int(color[0] + (255 - color[0]) * factor))
        g = min(255, int(color[1] + (255 - color[1]) * factor))
        b = min(255, int(color[2] + (255 - color[2]) * factor))
        return (r, g, b)

    def get_tile_depth(self, grid_x, grid_y):
        return grid_x + grid_y

    def draw_iso_tile(self, x, y, top_color, left_color, right_color, height=20):
        screen_x, screen_y = self.grid_to_screen(x, y)
        half_width = TILE_WIDTH / 2
        quarter_height = TILE_HEIGHT / 2

        top_points = [
            (screen_x, screen_y - height),
            (screen_x + half_width, screen_y + quarter_height - height),
            (screen_x, screen_y + TILE_HEIGHT - height),
            (screen_x - half_width, screen_y + quarter_height - height)
        ]

        left_points = [
            (screen_x - half_width, screen_y + quarter_height - height),
            (screen_x, screen_y + TILE_HEIGHT - height),
            (screen_x, screen_y + TILE_HEIGHT),
            (screen_x - half_width, screen_y + quarter_height)
        ]

        right_points = [
            (screen_x + half_width, screen_y + quarter_height - height),
            (screen_x, screen_y + TILE_HEIGHT - height),
            (screen_x, screen_y + TILE_HEIGHT),
            (screen_x + half_width, screen_y + quarter_height)
        ]

        if height > 0:
            pygame.draw.polygon(self.screen, left_color, left_points)
            pygame.draw.polygon(self.screen, right_color, right_points)
        pygame.draw.polygon(self.screen, top_color, top_points)

    def draw_wall(self, grid_x, grid_y):
        base_color = COLOR_WALL
        top_color = self.lighten_color(base_color, 0.3)
        left_color = self.darken_color(base_color, 0.3)
        right_color = self.darken_color(base_color, 0.5)
        self.draw_iso_tile(grid_x, grid_y, top_color, left_color, right_color, height=25)

    def draw_floor(self, grid_x, grid_y):
        base_color = COLOR_FLOOR
        top_color = self.lighten_color(base_color, 0.1)
        left_color = self.darken_color(base_color, 0.1)
        right_color = self.darken_color(base_color, 0.2)
        self.draw_iso_tile(grid_x, grid_y, top_color, left_color, right_color, height=2)

    def draw_player(self, grid_x, grid_y, glow_intensity=1.0):
        screen_x, screen_y = self.grid_to_screen(grid_x, grid_y)
        base_height = 2

        if glow_intensity > 0:
            glow_color = self.lighten_color(COLOR_PLAYER, 0.5)
            glow_alpha = int(100 * glow_intensity)
            glow_surface = pygame.Surface((60, 60), pygame.SRCALPHA)
            pygame.draw.circle(glow_surface, (*glow_color, glow_alpha), (30, 40), 25)
            self.screen.blit(glow_surface, (screen_x - 30, screen_y - 50))

        body_color = COLOR_PLAYER
        shadow_color = self.darken_color(COLOR_PLAYER, 0.3)
        highlight_color = self.lighten_color(COLOR_PLAYER, 0.3)

        body_points = [
            (screen_x, screen_y - 35 - base_height),
            (screen_x + 10, screen_y - 25 - base_height),
            (screen_x + 10, screen_y - 5 - base_height),
            (screen_x - 10, screen_y - 5 - base_height),
            (screen_x - 10, screen_y - 25 - base_height)
        ]
        pygame.draw.polygon(self.screen, body_color, body_points)
        pygame.draw.polygon(self.screen, COLOR_BLACK, body_points, 1)

        head_center = (screen_x, screen_y - 45 - base_height)
        pygame.draw.circle(self.screen, body_color, head_center, 10)
        pygame.draw.circle(self.screen, COLOR_BLACK, head_center, 10, 1)

        pygame.draw.circle(self.screen, COLOR_BLACK, (screen_x - 3, screen_y - 47 - base_height), 2)
        pygame.draw.circle(self.screen, COLOR_BLACK, (screen_x + 3, screen_y - 47 - base_height), 2)

    def draw_monster(self, grid_x, grid_y, glow_intensity=1.0):
        screen_x, screen_y = self.grid_to_screen(grid_x, grid_y)
        base_height = 2

        if glow_intensity > 0:
            glow_color = self.lighten_color(COLOR_MONSTER, 0.5)
            glow_alpha = int(100 * glow_intensity)
            glow_surface = pygame.Surface((60, 60), pygame.SRCALPHA)
            pygame.draw.circle(glow_surface, (*glow_color, glow_alpha), (30, 40), 25)
            self.screen.blit(glow_surface, (screen_x - 30, screen_y - 50))

        body_color = COLOR_MONSTER
        shadow_color = self.darken_color(COLOR_MONSTER, 0.3)

        body_points = [
            (screen_x, screen_y - 40 - base_height),
            (screen_x + 12, screen_y - 25 - base_height),
            (screen_x + 12, screen_y - 5 - base_height),
            (screen_x - 12, screen_y - 5 - base_height),
            (screen_x - 12, screen_y - 25 - base_height)
        ]
        pygame.draw.polygon(self.screen, body_color, body_points)
        pygame.draw.polygon(self.screen, COLOR_BLACK, body_points, 1)

        horn_points_left = [
            (screen_x - 8, screen_y - 35 - base_height),
            (screen_x - 15, screen_y - 55 - base_height),
            (screen_x - 5, screen_y - 40 - base_height)
        ]
        pygame.draw.polygon(self.screen, body_color, horn_points_left)
        pygame.draw.polygon(self.screen, COLOR_BLACK, horn_points_left, 1)

        horn_points_right = [
            (screen_x + 8, screen_y - 35 - base_height),
            (screen_x + 15, screen_y - 55 - base_height),
            (screen_x + 5, screen_y - 40 - base_height)
        ]
        pygame.draw.polygon(self.screen, body_color, horn_points_right)
        pygame.draw.polygon(self.screen, COLOR_BLACK, horn_points_right, 1)

        eye_color = (255, 255, 0)
        pygame.draw.circle(self.screen, eye_color, (screen_x - 5, screen_y - 30 - base_height), 4)
        pygame.draw.circle(self.screen, eye_color, (screen_x + 5, screen_y - 30 - base_height), 4)
        pygame.draw.circle(self.screen, COLOR_BLACK, (screen_x - 5, screen_y - 30 - base_height), 2)
        pygame.draw.circle(self.screen, COLOR_BLACK, (screen_x + 5, screen_y - 30 - base_height), 2)

    def draw_treasure(self, grid_x, grid_y, glow_intensity=1.0, animate_progress=0.0):
        screen_x, screen_y = self.grid_to_screen(grid_x, grid_y)
        base_height = 2

        bounce_offset = math.sin(animate_progress * math.pi * 2) * 5

        if glow_intensity > 0:
            glow_color = self.lighten_color(COLOR_TREASURE, 0.5)
            glow_alpha = int(120 * glow_intensity)
            glow_surface = pygame.Surface((80, 80), pygame.SRCALPHA)
            glow_radius = int(30 + math.sin(animate_progress * math.pi * 4) * 5)
            pygame.draw.circle(glow_surface, (*glow_color, glow_alpha), (40, 50), glow_radius)
            self.screen.blit(glow_surface, (screen_x - 40, screen_y - 60 + bounce_offset))

        chest_color = COLOR_TREASURE
        shadow_color = self.darken_color(COLOR_TREASURE, 0.3)
        highlight_color = self.lighten_color(COLOR_TREASURE, 0.3)

        lid_points = [
            (screen_x, screen_y - 30 - base_height + bounce_offset),
            (screen_x + 15, screen_y - 20 - base_height + bounce_offset),
            (screen_x - 15, screen_y - 20 - base_height + bounce_offset)
        ]
        pygame.draw.polygon(self.screen, highlight_color, lid_points)
        pygame.draw.polygon(self.screen, COLOR_BLACK, lid_points, 1)

        body_top = [
            (screen_x, screen_y - 20 - base_height + bounce_offset),
            (screen_x + 15, screen_y - 10 - base_height + bounce_offset),
            (screen_x, screen_y - base_height + bounce_offset),
            (screen_x - 15, screen_y - 10 - base_height + bounce_offset)
        ]
        pygame.draw.polygon(self.screen, chest_color, body_top)
        pygame.draw.polygon(self.screen, COLOR_BLACK, body_top, 1)

        body_left = [
            (screen_x - 15, screen_y - 10 - base_height + bounce_offset),
            (screen_x, screen_y - base_height + bounce_offset),
            (screen_x, screen_y + 10 - base_height),
            (screen_x - 15, screen_y)
        ]
        pygame.draw.polygon(self.screen, shadow_color, body_left)
        pygame.draw.polygon(self.screen, COLOR_BLACK, body_left, 1)

        body_right = [
            (screen_x + 15, screen_y - 10 - base_height + bounce_offset),
            (screen_x, screen_y - base_height + bounce_offset),
            (screen_x, screen_y + 10 - base_height),
            (screen_x + 15, screen_y)
        ]
        pygame.draw.polygon(self.screen, shadow_color, body_right)
        pygame.draw.polygon(self.screen, COLOR_BLACK, body_right, 1)

        lock_color = (200, 150, 0)
        pygame.draw.rect(self.screen, lock_color, (screen_x - 4, screen_y - 18 - base_height + bounce_offset, 8, 8))
        pygame.draw.rect(self.screen, COLOR_BLACK, (screen_x - 4, screen_y - 18 - base_height + bounce_offset, 8, 8), 1)

    def draw_exit(self, grid_x, grid_y, activated=False):
        screen_x, screen_y = self.grid_to_screen(grid_x, grid_y)
        base_height = 2

        if activated:
            glow_color = self.lighten_color(COLOR_EXIT, 0.7)
            glow_alpha = 150
            glow_surface = pygame.Surface((80, 80), pygame.SRCALPHA)
            pygame.draw.circle(glow_surface, (*glow_color, glow_alpha), (40, 50), 35)
            self.screen.blit(glow_surface, (screen_x - 40, screen_y - 60))

        door_color = COLOR_EXIT
        shadow_color = self.darken_color(COLOR_EXIT, 0.3)
        highlight_color = self.lighten_color(COLOR_EXIT, 0.3)

        frame_color = (60, 60, 60)
        pygame.draw.polygon(self.screen, frame_color, [
            (screen_x - 18, screen_y - 50 - base_height),
            (screen_x + 18, screen_y - 50 - base_height),
            (screen_x + 18, screen_y - base_height),
            (screen_x - 18, screen_y - base_height)
        ])

        door_points = [
            (screen_x - 15, screen_y - 47 - base_height),
            (screen_x + 15, screen_y - 47 - base_height),
            (screen_x + 15, screen_y - 3 - base_height),
            (screen_x - 15, screen_y - 3 - base_height)
        ]
        pygame.draw.polygon(self.screen, door_color, door_points)
        pygame.draw.polygon(self.screen, COLOR_BLACK, door_points, 1)

        door_left = [
            (screen_x - 15, screen_y - 47 - base_height),
            (screen_x - 8, screen_y - 45 - base_height),
            (screen_x - 8, screen_y - 5 - base_height),
            (screen_x - 15, screen_y - 3 - base_height)
        ]
        pygame.draw.polygon(self.screen, shadow_color, door_left)

        door_right = [
            (screen_x + 15, screen_y - 47 - base_height),
            (screen_x + 8, screen_y - 45 - base_height),
            (screen_x + 8, screen_y - 5 - base_height),
            (screen_x + 15, screen_y - 3 - base_height)
        ]
        pygame.draw.polygon(self.screen, shadow_color, door_right)

        knob_color = (200, 200, 0) if activated else (100, 100, 100)
        pygame.draw.circle(self.screen, knob_color, (screen_x + 8, screen_y - 25 - base_height), 3)

        if activated:
            symbol_color = (255, 255, 0)
            pygame.draw.polygon(self.screen, symbol_color, [
                (screen_x, screen_y - 40 - base_height),
                (screen_x - 6, screen_y - 28 - base_height),
                (screen_x + 6, screen_y - 28 - base_height)
            ])
