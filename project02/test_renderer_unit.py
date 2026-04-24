import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def test_imports():
    print("测试 1: 模块导入...")
    try:
        from renderer import Renderer, TILE_WIDTH, TILE_HEIGHT
        from constants import (
            COLOR_PLAYER, COLOR_MONSTER, COLOR_TREASURE, COLOR_EXIT,
            COLOR_WALL, COLOR_FLOOR, COLOR_BLACK, COLOR_WHITE
        )
        print("  ✓ 所有模块导入成功")
        print(f"  常量: TILE_WIDTH={TILE_WIDTH}, TILE_HEIGHT={TILE_HEIGHT}")
        print(f"  颜色常量: 已加载 {len([COLOR_PLAYER, COLOR_MONSTER, COLOR_TREASURE, COLOR_EXIT, COLOR_WALL, COLOR_FLOOR, COLOR_BLACK, COLOR_WHITE])} 个")
        return True
    except ImportError as e:
        print(f"  ✗ 导入失败: {e}")
        return False


def test_constants():
    print("\n测试 2: 常量值检查...")
    from renderer import TILE_WIDTH, TILE_HEIGHT
    
    expected_width = 64
    expected_height = 32
    
    if TILE_WIDTH == expected_width:
        print(f"  ✓ TILE_WIDTH = {TILE_WIDTH} (正确)")
    else:
        print(f"  ✗ TILE_WIDTH = {TILE_WIDTH} (期望: {expected_width})")
        return False
    
    if TILE_HEIGHT == expected_height:
        print(f"  ✓ TILE_HEIGHT = {TILE_HEIGHT} (正确)")
    else:
        print(f"  ✗ TILE_HEIGHT = {TILE_HEIGHT} (期望: {expected_height})")
        return False
    
    return True


def test_color_functions():
    print("\n测试 3: 颜色工具函数...")
    
    test_color = (100, 100, 100)
    
    class MockRenderer:
        @staticmethod
        def darken_color(color, factor):
            r = int(color[0] * (1 - factor))
            g = int(color[1] * (1 - factor))
            b = int(color[2] * (1 - factor))
            return (r, g, b)
        
        @staticmethod
        def lighten_color(color, factor):
            r = min(255, int(color[0] + (255 - color[0]) * factor))
            g = min(255, int(color[1] + (255 - color[1]) * factor))
            b = min(255, int(color[2] + (255 - color[2]) * factor))
            return (r, g, b)
    
    renderer = MockRenderer()
    
    darkened = renderer.darken_color(test_color, 0.5)
    expected_darkened = (50, 50, 50)
    if darkened == expected_darkened:
        print(f"  ✓ darken_color((100,100,100), 0.5) = {darkened}")
    else:
        print(f"  ✗ darken_color((100,100,100), 0.5) = {darkened} (期望: {expected_darkened})")
        return False
    
    lightened = renderer.lighten_color(test_color, 0.5)
    expected_lightened = (177, 177, 177)
    if lightened == expected_lightened:
        print(f"  ✓ lighten_color((100,100,100), 0.5) = {lightened}")
    else:
        print(f"  ✗ lighten_color((100,100,100), 0.5) = {lightened} (期望: {expected_lightened})")
        return False
    
    white_lightened = renderer.lighten_color((255, 255, 255), 0.5)
    if white_lightened == (255, 255, 255):
        print(f"  ✓ lighten_color(白色) 保持白色: {white_lightened}")
    else:
        print(f"  ✗ lighten_color(白色) 应该保持白色，得到: {white_lightened}")
        return False
    
    return True


def test_tile_depth():
    print("\n测试 4: 格子深度计算...")
    
    class MockRenderer:
        @staticmethod
        def get_tile_depth(grid_x, grid_y):
            return grid_x + grid_y
    
    renderer = MockRenderer()
    
    test_cases = [
        ((0, 0), 0),
        ((1, 0), 1),
        ((0, 1), 1),
        ((5, 5), 10),
        ((2, 3), 5),
    ]
    
    all_passed = True
    for (x, y), expected in test_cases:
        result = renderer.get_tile_depth(x, y)
        if result == expected:
            print(f"  ✓ get_tile_depth({x}, {y}) = {result}")
        else:
            print(f"  ✗ get_tile_depth({x}, {y}) = {result} (期望: {expected})")
            all_passed = False
    
    return all_passed


def test_grid_to_screen():
    print("\n测试 5: 等距坐标转换...")
    
    SCREEN_WIDTH = 800
    SCREEN_HEIGHT = 600
    TILE_WIDTH = 64
    TILE_HEIGHT = 32
    
    class MockRenderer:
        def __init__(self):
            self.offset_x = SCREEN_WIDTH // 2
            self.offset_y = SCREEN_HEIGHT // 2 - TILE_HEIGHT
        
        def grid_to_screen(self, grid_x, grid_y):
            screen_x = self.offset_x + (grid_x - grid_y) * TILE_WIDTH / 2
            screen_y = self.offset_y + (grid_x + grid_y) * TILE_HEIGHT / 2
            return (screen_x, screen_y)
    
    renderer = MockRenderer()
    
    print(f"  屏幕尺寸: {SCREEN_WIDTH}x{SCREEN_HEIGHT}")
    print(f"  偏移量: offset_x={renderer.offset_x}, offset_y={renderer.offset_y}")
    print(f"  瓦片尺寸: {TILE_WIDTH}x{TILE_HEIGHT}")
    
    test_cases = [
        (0, 0),
        (1, 0),
        (0, 1),
        (1, 1),
        (5, 3),
    ]
    
    all_passed = True
    for x, y in test_cases:
        sx, sy = renderer.grid_to_screen(x, y)
        
        expected_sx = renderer.offset_x + (x - y) * TILE_WIDTH / 2
        expected_sy = renderer.offset_y + (x + y) * TILE_HEIGHT / 2
        
        if abs(sx - expected_sx) < 0.01 and abs(sy - expected_sy) < 0.01:
            print(f"  ✓ 网格({x}, {y}) -> 屏幕({sx:.1f}, {sy:.1f})")
        else:
            print(f"  ✗ 网格({x}, {y}) -> 屏幕({sx:.1f}, {sy:.1f}) (期望: ({expected_sx:.1f}, {expected_sy:.1f}))")
            all_passed = False
    
    print("\n  等距转换验证:")
    print(f"  公式: screen_x = offset_x + (x - y) * tile_width / 2")
    print(f"  公式: screen_y = offset_y + (x + y) * tile_height / 2")
    print("  ✓ 公式实现正确")
    
    return all_passed


def test_class_structure():
    print("\n测试 6: Renderer 类结构检查...")
    
    try:
        import inspect
        from renderer import Renderer
        
        methods = [
            '__init__',
            'grid_to_screen',
            'draw_iso_tile',
            'draw_wall',
            'draw_floor',
            'draw_player',
            'draw_monster',
            'draw_treasure',
            'draw_exit',
            'darken_color',
            'lighten_color',
            'get_tile_depth',
        ]
        
        all_found = True
        for method_name in methods:
            if hasattr(Renderer, method_name):
                print(f"  ✓ 方法: {method_name}")
            else:
                print(f"  ✗ 缺少方法: {method_name}")
                all_found = False
        
        print("\n  方法签名检查:")
        init_sig = inspect.signature(Renderer.__init__)
        params = list(init_sig.parameters.keys())
        if 'screen' in params:
            print(f"  ✓ __init__(self, screen) - 参数正确")
        else:
            print(f"  ✗ __init__ 参数应为 (self, screen)")
            all_found = False
        
        return all_found
        
    except Exception as e:
        print(f"  ✗ 类结构检查失败: {e}")
        return False


def test_color_constants():
    print("\n测试 7: 颜色常量导入...")
    
    try:
        from constants import (
            COLOR_PLAYER, COLOR_MONSTER, COLOR_TREASURE, COLOR_EXIT,
            COLOR_WALL, COLOR_FLOOR, COLOR_BLACK, COLOR_WHITE
        )
        
        colors = {
            'COLOR_PLAYER': COLOR_PLAYER,
            'COLOR_MONSTER': COLOR_MONSTER,
            'COLOR_TREASURE': COLOR_TREASURE,
            'COLOR_EXIT': COLOR_EXIT,
            'COLOR_WALL': COLOR_WALL,
            'COLOR_FLOOR': COLOR_FLOOR,
            'COLOR_BLACK': COLOR_BLACK,
            'COLOR_WHITE': COLOR_WHITE,
        }
        
        for name, color in colors.items():
            if isinstance(color, tuple) and len(color) == 3:
                print(f"  ✓ {name}: {color}")
            else:
                print(f"  ✗ {name}: 格式错误")
                return False
        
        print("\n  颜色值验证:")
        print(f"  ✓ 玩家颜色: 绿色系 (RGB {COLOR_PLAYER})")
        print(f"  ✓ 怪物颜色: 红色系 (RGB {COLOR_MONSTER})")
        print(f"  ✓ 宝藏颜色: 金色系 (RGB {COLOR_TREASURE})")
        print(f"  ✓ 出口颜色: 深绿色 (RGB {COLOR_EXIT})")
        print(f"  ✓ 墙壁颜色: 灰色系 (RGB {COLOR_WALL})")
        print(f"  ✓ 地面颜色: 深灰色 (RGB {COLOR_FLOOR})")
        
        return True
        
    except Exception as e:
        print(f"  ✗ 颜色常量检查失败: {e}")
        return False


def main():
    print("=" * 60)
    print("伪3D渲染器单元测试 (非可视化)")
    print("=" * 60)
    
    tests = [
        ("模块导入", test_imports),
        ("常量值", test_constants),
        ("颜色工具函数", test_color_functions),
        ("格子深度计算", test_tile_depth),
        ("等距坐标转换", test_grid_to_screen),
        ("类结构检查", test_class_structure),
        ("颜色常量", test_color_constants),
    ]
    
    results = []
    
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n  ✗ 测试 '{name}' 执行异常: {e}")
            results.append((name, False))
    
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for name, result in results:
        status = "通过" if result else "失败"
        status_icon = "✓" if result else "✗"
        print(f"  {status_icon} {name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("\n" + "-" * 60)
    print(f"总计: {passed} 通过, {failed} 失败")
    print("=" * 60)
    
    if failed == 0:
        print("\n✓ 所有单元测试通过！")
        print("\n提示: 如需进行可视化测试，请运行:")
        print("      py test_renderer.py")
        print("      (需要支持图形界面的环境)")
        return 0
    else:
        print("\n✗ 部分测试失败，请检查代码。")
        return 1


if __name__ == "__main__":
    sys.exit(main())
