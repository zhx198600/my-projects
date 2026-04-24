import sys
import traceback

print("=" * 60)
print("模块导入诊断")
print("=" * 60)

modules_to_test = [
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

errors = []

for module_name, description in modules_to_test:
    try:
        __import__(module_name)
        print(f"✓ {description}: 导入成功")
    except Exception as e:
        print(f"✗ {description}: 导入失败 - {e}")
        errors.append((module_name, description, e))
        traceback.print_exc()

print("\n" + "=" * 60)
print("检查 pygame 导入")
print("=" * 60)

try:
    import pygame
    print(f"✓ pygame 版本: {pygame.version.ver}")
    pygame.init()
    print("✓ pygame 初始化成功")
    pygame.quit()
except Exception as e:
    print(f"✗ pygame 导入失败 - {e}")
    errors.append(("pygame", "pygame", e))
    traceback.print_exc()

print("\n" + "=" * 60)
print("检查 maze_game.py 主模块")
print("=" * 60)

try:
    import maze_game
    print("✓ maze_game 主模块导入成功")
except Exception as e:
    print(f"✗ maze_game 主模块导入失败 - {e}")
    errors.append(("maze_game", "主游戏模块", e))
    traceback.print_exc()

if errors:
    print("\n" + "=" * 60)
    print(f"发现 {len(errors)} 个错误")
    print("=" * 60)
    for module, desc, error in errors:
        print(f"- {desc} ({module}): {error}")
else:
    print("\n" + "=" * 60)
    print("所有模块导入成功！")
    print("=" * 60)
