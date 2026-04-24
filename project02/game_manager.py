from typing import List, Dict, Any
from entities import Monster, GameState, Treasure, Exit
from monster_ai import MonsterAI


class GameManager:
    def __init__(self, maze, player, vision_system, monster: Monster = None, treasures: List[Treasure] = None, exit: Exit = None):
        self.maze = maze
        self.player = player
        self.vision_system = vision_system
        self.monster = monster
        self.monster_ai = None
        self.game_state = GameState.PLAYING
        self.treasures = treasures if treasures else []
        self.exit = exit
        self.treasure_count = 0
        
        if monster:
            self.monster_ai = MonsterAI(monster, maze)
    
    def get_game_state(self) -> GameState:
        return self.game_state
    
    def set_game_state(self, state: GameState) -> None:
        self.game_state = state
    
    def is_game_over(self) -> bool:
        return self.game_state == GameState.WIN or self.game_state == GameState.LOSE
    
    def check_treasure_collision(self) -> bool:
        for treasure in self.treasures:
            if not treasure.is_collected():
                if self.player.x == treasure.x and self.player.y == treasure.y:
                    treasure.collect()
                    self.player.collect_treasure()
                    self.treasure_count += 1
                    if self.treasure_count == 3 and self.exit:
                        self.exit.activate()
                    return True
        return False
    
    def check_monster_collision(self) -> bool:
        if self.monster and self.game_state == GameState.PLAYING:
            if self.player.x == self.monster.x and self.player.y == self.monster.y:
                self.game_state = GameState.LOSE
                return True
        return False
    
    def check_exit_collision(self) -> bool:
        if self.exit and self.exit.is_activated():
            if self.player.x == self.exit.x and self.player.y == self.exit.y:
                self.game_state = GameState.WIN
                return True
        return False
    
    def check_all_collisions(self) -> Dict[str, Any]:
        result = {
            'treasure_collected': False,
            'player_died': False,
            'game_won': False
        }
        
        if self.check_monster_collision():
            result['player_died'] = True
        
        if not self.is_game_over():
            if self.check_treasure_collision():
                result['treasure_collected'] = True
            
            if self.check_exit_collision():
                result['game_won'] = True
        
        return result

    def can_move_to(self, x, y):
        return self.maze.is_passable(x, y)

    def move_player(self, dx, dy):
        if self.is_game_over():
            return False
        
        new_x = self.player.x + dx
        new_y = self.player.y + dy

        if self.maze.is_passable(new_x, new_y):
            self.player.move(dx, dy)
            self.vision_system.set_player_position(self.player.x, self.player.y)
            self.check_all_collisions()
            return True

        return False
    
    def update(self, current_time: int) -> bool:
        if self.is_game_over():
            return False
        
        moved = False
        if self.monster_ai:
            moved = self.monster_ai.update(current_time)
            self.check_monster_collision()
        return moved
    
    def on_echo_triggered(self) -> None:
        if self.monster_ai:
            self.monster_ai.set_target(self.player.x, self.player.y)
