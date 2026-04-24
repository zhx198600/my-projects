import pygame
from constants import (
    UI_BAR_HEIGHT,
    UI_FONT_SIZE,
    COLOR_UI_BG,
    COLOR_UI_TEXT,
    COLOR_WHITE,
    COLOR_GREEN,
    COLOR_RED,
)
from entities import GameState


def get_chinese_font(font_size):
    chinese_fonts = [
        "microsoftyahei",
        "msyh",
        "simhei",
        "simsun",
        "simkai",
        "arialunicode",
    ]
    
    for font_name in chinese_fonts:
        try:
            font = pygame.font.SysFont(font_name, font_size)
            test_surface = font.render("测试", True, (255, 255, 255))
            if test_surface.get_width() > 0:
                return font
        except:
            continue
    
    try:
        fonts = pygame.font.get_fonts()
        for font_name in fonts:
            if "chinese" in font_name.lower() or "hei" in font_name.lower() or "song" in font_name.lower():
                try:
                    font = pygame.font.SysFont(font_name, font_size)
                    return font
                except:
                    continue
    except:
        pass
    
    return pygame.font.Font(None, font_size)


class UIManager:
    def __init__(self, screen, font_size=UI_FONT_SIZE, bar_height=UI_BAR_HEIGHT):
        self.screen = screen
        self.font_size = font_size
        self.ui_bar_height = bar_height
        self.font = get_chinese_font(font_size)

    def draw_ui_bar(self, treasure_count, game_state):
        screen_width = self.screen.get_width()
        bar_rect = pygame.Rect(0, 0, screen_width, self.ui_bar_height)
        pygame.draw.rect(self.screen, COLOR_UI_BG, bar_rect)

        treasure_text = f"宝藏: {treasure_count}/3"
        treasure_surface = self.font.render(treasure_text, True, COLOR_UI_TEXT)
        treasure_rect = treasure_surface.get_rect(midleft=(20, self.ui_bar_height // 2))
        self.screen.blit(treasure_surface, treasure_rect)

        if game_state == GameState.PLAYING:
            state_text = "游戏进行中"
            state_color = COLOR_WHITE
        elif game_state == GameState.WIN:
            state_text = "恭喜获胜！按 R 重新开始"
            state_color = COLOR_GREEN
        else:
            state_text = "游戏结束！按 R 重新开始"
            state_color = COLOR_RED

        state_surface = self.font.render(state_text, True, state_color)
        state_rect = state_surface.get_rect(center=(screen_width // 2, self.ui_bar_height // 2))
        self.screen.blit(state_surface, state_rect)

    def draw_center_message(self, message, color):
        screen_width = self.screen.get_width()
        screen_height = self.screen.get_height()
        
        surface = self.font.render(message, True, color)
        rect = surface.get_rect(center=(screen_width // 2, screen_height // 2))
        self.screen.blit(surface, rect)
