import pygame
import sys
from renderer import Renderer
from constants import (
    COLOR_PLAYER, COLOR_MONSTER, COLOR_TREASURE, COLOR_EXIT,
    COLOR_WALL, COLOR_FLOOR, COLOR_BLACK, COLOR_WHITE
)

SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
FPS = 60

TEST_MAZE = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1],
]

TEST_ELEMENTS = {
    'player': (1, 1),
    'monster': (7, 7),
    'treasure': (4, 4),
    'exit': (7, 1)
}


def test_grid_to_screen(renderer):
    print("Testing grid_to_screen conversion...")
    
    test_cases = [
        (0, 0),
        (1, 0),
        (0, 1),
        (1, 1),
        (5, 5),
    ]
    
    for grid_x, grid_y in test_cases:
        screen_x, screen_y = renderer.grid_to_screen(grid_x, grid_y)
        print(f"  Grid ({grid_x}, {grid_y}) -> Screen ({screen_x:.1f}, {screen_y:.1f})")
    
    print("Grid to screen conversion test completed.\n")


def test_color_functions(renderer):
    print("Testing color functions...")
    
    test_color = (100, 100, 100)
    
    darkened = renderer.darken_color(test_color, 0.5)
    print(f"  Darken (100,100,100) by 0.5: {darkened}")
    
    lightened = renderer.lighten_color(test_color, 0.5)
    print(f"  Lighten (100,100,100) by 0.5: {lightened}")
    
    print("Color functions test completed.\n")


def test_tile_depth(renderer):
    print("Testing get_tile_depth...")
    
    test_cases = [
        (0, 0),
        (1, 0),
        (0, 1),
        (5, 3),
        (2, 5),
    ]
    
    for grid_x, grid_y in test_cases:
        depth = renderer.get_tile_depth(grid_x, grid_y)
        print(f"  Tile ({grid_x}, {grid_y}) depth: {depth}")
    
    print("Tile depth test completed.\n")


def main():
    pygame.init()
    
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("伪3D渲染器测试 - 等距视角")
    clock = pygame.time.Clock()
    
    renderer = Renderer(screen)
    
    print("=" * 50)
    print("伪3D渲染器单元测试")
    print("=" * 50)
    
    test_grid_to_screen(renderer)
    test_color_functions(renderer)
    test_tile_depth(renderer)
    
    print("=" * 50)
    print("启动可视化测试...")
    print("按 ESC 或关闭窗口退出测试")
    print("=" * 50)
    
    maze_width = len(TEST_MAZE[0])
    maze_height = len(TEST_MAZE)
    
    animate_time = 0.0
    exit_activated = True
    
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
        
        screen.fill((20, 20, 30))
        
        render_order = []
        for y in range(maze_height):
            for x in range(maze_width):
                depth = renderer.get_tile_depth(x, y)
                render_order.append((depth, x, y))
        
        render_order.sort(key=lambda item: item[0])
        
        for depth, x, y in render_order:
            if TEST_MAZE[y][x] == 1:
                renderer.draw_wall(x, y)
            else:
                renderer.draw_floor(x, y)
        
        treasure_pos = TEST_ELEMENTS['treasure']
        treasure_animate = animate_time * 2
        renderer.draw_treasure(
            treasure_pos[0], treasure_pos[1],
            glow_intensity=0.8,
            animate_progress=treasure_animate % 1.0
        )
        
        exit_pos = TEST_ELEMENTS['exit']
        renderer.draw_exit(exit_pos[0], exit_pos[1], activated=exit_activated)
        
        monster_pos = TEST_ELEMENTS['monster']
        renderer.draw_monster(monster_pos[0], monster_pos[1], glow_intensity=0.6)
        
        player_pos = TEST_ELEMENTS['player']
        renderer.draw_player(player_pos[0], player_pos[1], glow_intensity=1.0)
        
        font = pygame.font.Font(None, 24)
        info_texts = [
            "伪3D渲染器测试 - 等距视角",
            f"FPS: {int(clock.get_fps())}",
            "",
            "图例:",
            "绿色: 玩家 (Player)",
            "红色: 怪物 (Monster)",
            "金色: 宝藏 (Treasure)",
            "深绿: 出口 (Exit - 已激活)",
            "灰色方块: 墙壁 (Wall)",
            "深灰: 地面 (Floor)",
        ]
        
        y_offset = 10
        for text in info_texts:
            text_surface = font.render(text, True, (200, 200, 200))
            screen.blit(text_surface, (10, y_offset))
            y_offset += 25
        
        animate_time += clock.get_time() / 1000.0
        
        pygame.display.flip()
        clock.tick(FPS)
    
    pygame.quit()
    print("\n测试完成！")
    return 0


if __name__ == "__main__":
    sys.exit(main())
