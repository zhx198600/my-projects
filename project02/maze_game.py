import pygame
import sys
import random
from constants import (
    FPS,
    COLOR_BLACK,
    MAZE_WIDTH,
    MAZE_HEIGHT,
)
from maze_generator import MazeGenerator
from entities import Player, Monster, Treasure, Exit
from vision_system import VisionSystem
from input_controller import InputController
from game_manager import GameManager
from renderer import Renderer
from ui_manager import UIManager

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
WINDOW_TITLE = "3D迷宫探险游戏"

MIN_MONSTER_DISTANCE = 5
MIN_EXIT_DISTANCE = 8


def manhattan_distance(x1, y1, x2, y2):
    return abs(x1 - x2) + abs(y1 - y2)


def get_far_position(passable_cells, player_pos, min_distance, exclude_positions=None):
    if exclude_positions is None:
        exclude_positions = set()
    
    candidates = []
    for cell in passable_cells:
        if cell in exclude_positions:
            continue
        dist = manhattan_distance(cell[0], cell[1], player_pos[0], player_pos[1])
        if dist >= min_distance:
            candidates.append(cell)
    
    if candidates:
        return random.choice(candidates)
    
    fallback_candidates = [cell for cell in passable_cells if cell not in exclude_positions]
    return random.choice(fallback_candidates) if fallback_candidates else random.choice(passable_cells)


def distribute_positions(passable_cells, count, player_pos, exclude_positions=None):
    if exclude_positions is None:
        exclude_positions = set()
    
    available = [cell for cell in passable_cells if cell not in exclude_positions and cell != player_pos]
    
    if not available:
        return []
    
    if len(available) <= count:
        return available[:count]
    
    selected = []
    remaining = available.copy()
    
    for _ in range(count):
        if not remaining:
            break
        
        if selected:
            remaining.sort(key=lambda c: min(manhattan_distance(c[0], c[1], s[0], s[1]) for s in selected), reverse=True)
            pos = remaining[0]
        else:
            pos = random.choice(remaining)
        
        selected.append(pos)
        remaining.remove(pos)
    
    return selected


class Game:
    def __init__(self):
        pygame.init()
        self.screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
        pygame.display.set_caption(WINDOW_TITLE)
        self.clock = pygame.time.Clock()
        self.running = True

        self.renderer = Renderer(self.screen)
        self.ui_manager = UIManager(self.screen)

        self._init_game()

    def _init_game(self):
        self.maze = MazeGenerator(MAZE_WIDTH, MAZE_HEIGHT)
        self.maze.generate()

        player_x, player_y = 1, 1
        self.player = Player(player_x, player_y)

        passable_cells = self.maze.get_passable_cells()
        player_pos = (self.player.x, self.player.y)
        used_positions = {player_pos}

        monster_pos = get_far_position(passable_cells, player_pos, MIN_MONSTER_DISTANCE, used_positions)
        self.monster = Monster(monster_pos[0], monster_pos[1])
        used_positions.add(monster_pos)

        treasure_count = 3
        treasure_positions = distribute_positions(passable_cells, treasure_count, player_pos, used_positions)
        self.treasures = []
        for pos in treasure_positions:
            self.treasures.append(Treasure(pos[0], pos[1]))
            used_positions.add(pos)

        exit_pos = get_far_position(passable_cells, player_pos, MIN_EXIT_DISTANCE, used_positions)
        self.exit = Exit(exit_pos[0], exit_pos[1])

        self.vision_system = VisionSystem()
        self.vision_system.set_player_position(self.player.x, self.player.y)

        self.input_controller = InputController()

        self.game_manager = GameManager(
            self.maze,
            self.player,
            self.vision_system,
            self.monster,
            self.treasures,
            self.exit
        )

    def _reset_game(self):
        self._init_game()

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            self.input_controller.handle_event(event)

            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:
                    if self.game_manager.is_game_over():
                        self._reset_game()

    def update(self):
        if self.game_manager.is_game_over():
            return
        
        current_time = pygame.time.get_ticks()

        move_request = self.input_controller.get_move_request(current_time)
        if move_request is not None:
            dx, dy = move_request
            self.game_manager.move_player(dx, dy)

        if self.input_controller.get_echo_request():
            self.vision_system.trigger_echo(current_time)
            self.game_manager.on_echo_triggered()

        self.vision_system.update(current_time)
        self.game_manager.update(current_time)

    def render(self):
        self.screen.fill(COLOR_BLACK)
        
        current_time = pygame.time.get_ticks()
        echo_active = self.vision_system.is_echo_active()
        echo_progress = self.vision_system.get_echo_progress(current_time)
        
        visible_cells = self.vision_system.get_visible_cells()
        
        render_items = []
        
        for (x, y) in visible_cells:
            depth = self.renderer.get_tile_depth(x, y)
            if self.maze.is_wall(x, y):
                render_items.append(('wall', x, y, depth))
            else:
                render_items.append(('floor', x, y, depth))
        
        for treasure in self.treasures:
            if not treasure.is_collected():
                if (treasure.x, treasure.y) in visible_cells:
                    depth = self.renderer.get_tile_depth(treasure.x, treasure.y)
                    render_items.append(('treasure', treasure, depth, echo_progress if echo_active else 0.5))
        
        if self.exit:
            exit_visible = (self.exit.x, self.exit.y) in visible_cells
            if exit_visible or (echo_active and self.exit.is_activated()):
                depth = self.renderer.get_tile_depth(self.exit.x, self.exit.y)
                render_items.append(('exit', self.exit, depth))
        
        if self.monster:
            if (self.monster.x, self.monster.y) in visible_cells:
                depth = self.renderer.get_tile_depth(self.monster.x, self.monster.y)
                render_items.append(('monster', self.monster, depth))
        
        player_depth = self.renderer.get_tile_depth(self.player.x, self.player.y) + 100
        render_items.append(('player', self.player, player_depth))
        
        render_items.sort(key=lambda x: x[-1])
        
        for item in render_items:
            if item[0] == 'wall':
                _, x, y, _ = item
                self.renderer.draw_wall(x, y)
            elif item[0] == 'floor':
                _, x, y, _ = item
                self.renderer.draw_floor(x, y)
            elif item[0] == 'treasure':
                _, treasure, _, anim_progress = item
                glow_intensity = 1.0 if echo_active else 0.3
                self.renderer.draw_treasure(treasure.x, treasure.y, glow_intensity, anim_progress)
            elif item[0] == 'exit':
                _, exit_obj, _ = item
                self.renderer.draw_exit(exit_obj.x, exit_obj.y, exit_obj.is_activated())
            elif item[0] == 'monster':
                _, monster, _ = item
                self.renderer.draw_monster(monster.x, monster.y, 1.0)
            elif item[0] == 'player':
                _, player, _ = item
                self.renderer.draw_player(player.x, player.y, 1.0)
        
        self.ui_manager.draw_ui_bar(
            self.game_manager.treasure_count,
            self.game_manager.get_game_state()
        )
        
        pygame.display.flip()

    def run(self):
        while self.running:
            self.handle_events()
            self.update()
            self.render()
            self.clock.tick(FPS)
        pygame.quit()
        sys.exit()


def main():
    game = Game()
    game.run()


if __name__ == "__main__":
    main()
