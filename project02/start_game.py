import sys
import traceback

print("=" * 70)
print("3D迷宫探险游戏 - 启动诊断")
print("=" * 70)
print(f"Python版本: {sys.version}")
print(f"Python路径: {sys.executable}")

print("\n" + "=" * 70)
print("步骤1: 检查Pygame安装")
print("=" * 70)

try:
    import pygame
    print(f"✓ Pygame版本: {pygame.version.ver}")
    print(f"  Pygame路径: {pygame.__file__}")
except ImportError as e:
    print(f"✗ Pygame未安装: {e}")
    print("\n请先安装Pygame:")
    print("  pip install pygame")
    sys.exit(1)

print("\n" + "=" * 70)
print("步骤2: 初始化Pygame")
print("=" * 70)

try:
    pygame.init()
    print("✓ Pygame初始化成功")
except Exception as e:
    print(f"✗ Pygame初始化失败: {e}")
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 70)
print("步骤3: 检查显示驱动")
print("=" * 70)

print(f"Pygame显示驱动: {pygame.display.get_driver()}")
print(f"可用显示模式:")
try:
    modes = pygame.display.list_modes()
    for mode in modes[:5]:  # 只显示前5个
        print(f"  - {mode}")
    if len(modes) > 5:
        print(f"  - ... 还有 {len(modes) - 5} 个模式")
except Exception as e:
    print(f"  无法获取显示模式: {e}")

print("\n" + "=" * 70)
print("步骤4: 尝试创建窗口")
print("=" * 70)

try:
    print("尝试创建800x600窗口...")
    screen = pygame.display.set_mode((800, 600))
    print(f"✓ 窗口创建成功!")
    print(f"  窗口尺寸: {screen.get_size()}")
    print(f"  像素格式: {screen.get_bitsize()} 位")
    
    pygame.display.set_caption("测试窗口 - 3秒后关闭")
    print("\n窗口已创建，等待3秒...")
    
    # 简单的事件循环
    import time
    start_time = time.time()
    while time.time() - start_time < 3:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                print("检测到关闭事件")
                break
        
        # 填充屏幕
        screen.fill((50, 50, 50))
        pygame.display.flip()
        
        pygame.time.wait(50)
    
    print("✓ 窗口测试完成")
    
except Exception as e:
    print(f"✗ 窗口创建失败: {e}")
    traceback.print_exc()
    print("\n" + "!" * 70)
    print("错误说明:")
    print("  您的环境可能不支持图形界面(GUI)。")
    print("  Pygame需要能够创建图形窗口才能运行游戏。")
    print("")
    print("解决方案:")
    print("  1. 在本地电脑上运行此游戏（而不是远程/服务器环境）")
    print("  2. 确保您有显示器连接")
    print("  3. 检查显卡驱动是否正常")
    print("!" * 70)
    pygame.quit()
    sys.exit(1)

print("\n" + "=" * 70)
print("步骤5: 检查游戏模块导入")
print("=" * 70)

modules = [
    ("constants", "常量配置"),
    ("entities", "实体类"),
    ("maze_generator", "迷宫生成器"),
    ("vision_system", "视野系统"),
    ("input_controller", "输入控制器"),
    ("monster_ai", "怪物AI"),
    ("game_manager", "游戏管理器"),
    ("renderer", "渲染器"),
    ("ui_manager", "UI管理器"),
]

all_ok = True
for mod_name, desc in modules:
    try:
        __import__(mod_name)
        print(f"✓ {desc} ({mod_name})")
    except Exception as e:
        print(f"✗ {desc} ({mod_name}): {e}")
        traceback.print_exc()
        all_ok = False

if not all_ok:
    print("\n✗ 某些模块导入失败，请检查上述错误")
    pygame.quit()
    sys.exit(1)

print("\n" + "=" * 70)
print("步骤6: 启动主游戏")
print("=" * 70)

print("现在启动3D迷宫探险游戏...")
print("游戏窗口应该已经打开了!")
print("\n游戏操作:")
print("  - 方向键 / WASD: 移动玩家")
print("  - 空格键: 触发回声")
print("  - 关闭窗口: 退出游戏")
print("\n" + "=" * 70)

# 清理测试窗口
pygame.quit()

# 导入并运行主游戏
try:
    import maze_game
    maze_game.main()
except Exception as e:
    print(f"\n✗ 游戏运行时出错: {e}")
    traceback.print_exc()
    pygame.quit()
    sys.exit(1)
