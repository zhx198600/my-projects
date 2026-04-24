import sys

try:
    import pygame
    print("Pygame 导入成功！")
    print(f"Pygame 版本: {pygame.version.ver}")
except ImportError as e:
    print(f"错误: 无法导入 pygame - {e}")
    sys.exit(1)

try:
    pygame.init()
    print("Pygame 初始化成功！")
    
    screen = pygame.display.set_mode((800, 600))
    print("窗口创建成功！")
    
    pygame.display.set_caption("3D迷宫探险游戏 - 测试")
    print("窗口标题设置成功！")
    
    clock = pygame.time.Clock()
    
    running = True
    frame_count = 0
    max_frames = 10
    
    while running and frame_count < max_frames:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
        
        screen.fill((0, 0, 0))
        pygame.display.flip()
        clock.tick(60)
        frame_count += 1
    
    pygame.quit()
    print("测试完成 - 所有组件工作正常！")
    sys.exit(0)
    
except Exception as e:
    print(f"错误: Pygame 初始化失败 - {e}")
    pygame.quit()
    sys.exit(1)
