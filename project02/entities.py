from enum import Enum
from typing import Optional, Tuple


class GameState(Enum):
    PLAYING = "playing"
    WIN = "win"
    LOSE = "lose"


class Entity:
    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y

    def set_position(self, x: int, y: int) -> None:
        self.x = x
        self.y = y

    def get_position(self) -> Tuple[int, int]:
        return (self.x, self.y)

    def move(self, dx: int, dy: int) -> None:
        self.x += dx
        self.y += dy


class Player(Entity):
    def __init__(self, x: int, y: int) -> None:
        super().__init__(x, y)
        self.treasure_count: int = 0

    def collect_treasure(self) -> None:
        self.treasure_count += 1

    def get_treasure_count(self) -> int:
        return self.treasure_count


class Monster(Entity):
    def __init__(self, x: int, y: int) -> None:
        super().__init__(x, y)
        self.target_x: Optional[int] = None
        self.target_y: Optional[int] = None

    def set_target(self, x: int, y: int) -> None:
        self.target_x = x
        self.target_y = y

    def clear_target(self) -> None:
        self.target_x = None
        self.target_y = None

    def has_target(self) -> bool:
        return self.target_x is not None and self.target_y is not None


class Treasure(Entity):
    def __init__(self, x: int, y: int) -> None:
        super().__init__(x, y)
        self.collected: bool = False

    def collect(self) -> None:
        self.collected = True

    def is_collected(self) -> bool:
        return self.collected


class Exit(Entity):
    def __init__(self, x: int, y: int) -> None:
        super().__init__(x, y)
        self.activated: bool = False

    def activate(self) -> None:
        self.activated = True

    def is_activated(self) -> bool:
        return self.activated
