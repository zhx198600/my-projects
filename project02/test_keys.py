import pygame
import sys

pygame.init()

screen = pygame.display.set_mode((400, 300))
pygame.display.set_caption("按键测试")

clock = pygame.time.Clock()
font = pygame.font.Font(None, 36)

move_dx = 0
move_dy = 0
echo_pressed = False

print("=" * 50)
print("按键测试程序")
print("=" * 50)
print("请测试以下按键:")
print("  - 方向键 ↑↓←→")
print("  - W/A/S/D 键")
print("  - 空格键")
print("=" * 50)

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        
        if event.type == pygame.KEYDOWN:
            print(f"\nKEYDOWN 事件:")
            if event.key == pygame.K_UP:
                print(f"  - 检测到: 上方向键 (K_UP)")
                move_dy = -1
            elif event.key == pygame.K_DOWN:
                print(f"  - 检测到: 下方向键 (K_DOWN)")
                move_dy = 1
            elif event.key == pygame.K_LEFT:
                print(f"  - 检测到: 左方向键 (K_LEFT)")
                move_dx = -1
            elif event.key == pygame.K_RIGHT:
                print(f"  - 检测到: 右方向键 (K_RIGHT)")
                move_dx = 1
            elif event.key == pygame.K_w:
                print(f"  - 检测到: W键")
                move_dy = -1
            elif event.key == pygame.K_s:
                print(f"  - 检测到: S键")
                move_dy = 1
            elif event.key == pygame.K_a:
                print(f"  - 检测到: A键")
                move_dx = -1
            elif event.key == pygame.K_d:
                print(f"  - 检测到: D键")
                move_dx = 1
            elif event.key == pygame.K_SPACE:
                print(f"  - 检测到: 空格键 (K_SPACE)")
                echo_pressed = True
            else:
                print(f"  - 检测到: 其他按键 (keycode={event.key})")
        
        elif event.type == pygame.KEYUP:
            if event.key == pygame.K_UP:
                print(f"KEYUP事件: 上方向键")
                if move_dy == -1:
                    move_dy = 0
            elif event.key == pygame.K_DOWN:
                print(f"KEYUP事件: 下方向键")
                if move_dy == 1:
                    move_dy = 0
            elif event.key == pygame.K_LEFT:
                print(f"KEYUP事件: 左方向键")
                if move_dx == -1:
                    move_dx = 0
            elif event.key == pygame.K_RIGHT:
                print(f"KEYUP事件: 右方向键")
                if move_dx == 1:
                    move_dx = 0
            elif event.key == pygame.K_w:
                print(f"KEYUP事件: W键")
                if move_dy == -1:
                    move_dy = 0
            elif event.key == pygame.K_s:
                print(f"KEYUP事件: S键")
                if move_dy == 1:
                    move_dy = 0
            elif event.key == pygame.K_a:
                print(f"KEYUP事件: A键")
                if move_dx == -1:
                    move_dx = 0
            elif event.key == pygame.K_d:
                print(f"KEYUP事件: D键")
                if move_dx == 1:
                    move_dx = 0

    screen.fill((30, 30, 30))
    
    text1 = font.render(f"move_dx: {move_dx}, move_dy: {move_dy}", True, (255, 255, 255))
    text2 = font.render(f"echo_pressed: {echo_pressed}", True, (255, 255, 255))
    text3 = font.render("请按方向键或WASD，查看终端输出", True, (200, 200, 100))
    
    screen.blit(text1, (20, 50))
    screen.blit(text2, (20, 100))
    screen.blit(text3, (20, 200))
    
    pygame.display.flip()
    clock.tick(60)
    
    if echo_pressed:
        echo_pressed = False

pygame.quit()
print("\n" + "=" * 50)
print("测试结束")
print("=" * 50)
