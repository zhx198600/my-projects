# 3D迷宫探险游戏 - The Implementation Plan (Decomposed and Prioritized Task List)

## [x] Task 1: 项目初始化与基础架构搭建
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建项目目录结构
  - 创建主游戏入口文件 maze_game.py
  - 创建配置文件 constants.py 定义游戏常量
  - 验证Pygame环境可用
- **Acceptance Criteria Addressed**: [NFR-2]
- **Test Requirements**:
  - `programmatic` TR-1.1: 项目目录结构正确，包含必要的Python文件
  - `programmatic` TR-1.2: 运行主文件能够成功导入Pygame并初始化窗口
  - `human-judgement` TR-1.3: 代码结构清晰，常量定义合理
- **Notes**: 常量包括：迷宫大小(15x15)、格子尺寸、颜色定义、帧率、回声范围、回声持续时间、怪物移动间隔等

## [x] Task 2: 迷宫生成算法实现
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现迷宫生成类 MazeGenerator
  - 使用递归回溯法(DFS)或Prim算法生成15x15迷宫
  - 确保迷宫是连通的（所有可通行格子连通）
  - 实现方法获取墙壁位置和可通行路径
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-2.1: 生成的迷宫尺寸为15x15
  - `programmatic` TR-2.2: 迷宫是连通的（从任意可通行格子可以到达任意其他可通行格子）
  - `programmatic` TR-2.3: 墙壁和路径区分正确，不能穿墙
  - `human-judgement` TR-2.4: 迷宫结构合理，有足够的路径复杂度
- **Notes**: 考虑出口位置和初始位置的合理性，避免生成过于简单的迷宫

## [x] Task 3: 游戏实体基类设计
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建实体基类 Entity，包含位置属性和移动方法
  - 创建玩家类 Player（继承Entity），添加收集宝藏计数
  - 创建怪物类 Monster（继承Entity），添加移动目标追踪
  - 创建宝藏类 Treasure，包含是否已收集状态
  - 创建出口类 Exit，包含是否已激活状态
- **Acceptance Criteria Addressed**: [FR-1, FR-6]
- **Test Requirements**:
  - `programmatic` TR-3.1: 所有实体类正确继承基类
  - `programmatic` TR-3.2: 玩家、怪物、宝藏、出口的位置可以正确设置和获取
  - `programmatic` TR-3.3: 宝藏的收集状态可以正确切换
  - `programmatic` TR-3.4: 出口的激活状态可以正确切换
- **Notes**: 实体位置使用网格坐标（x, y）而非像素坐标

## [x] Task 4: 伪3D渲染系统实现
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 创建渲染器类 Renderer
  - 实现等距视角(Isometric)的伪3D投影转换
  - 实现墙壁的3D效果渲染（有立体感的方块）
  - 实现地面的渲染
  - 实现玩家的渲染（绿色男士形象，可简单用带立体感的人形图标）
  - 实现怪物的渲染（红色怪物形象）
  - 实现宝藏的渲染（黄色，有发光效果）
  - 实现出口的渲染（深绿色门/标志）
- **Acceptance Criteria Addressed**: [AC-2, NFR-1]
- **Test Requirements**:
  - `programmatic` TR-4.1: 网格坐标能正确转换为等距视角的屏幕坐标
  - `human-judgement` TR-4.2: 墙壁有明显的3D立体感，有顶面和侧面区分
  - `human-judgement` TR-4.3: 玩家形象为绿色，怪物为红色，宝藏为黄色发光，出口为深绿色
  - `human-judgement` TR-4.4: 元素堆叠顺序正确（玩家、怪物在墙壁前方）
- **Notes**: 等距视角可以让游戏有更好的3D效果；发光效果可以通过颜色渐变或光晕实现

## [x] Task 5: 视野与回声定位系统实现
- **Priority**: P0
- **Depends On**: Task 4
- **Description**: 
  - 实现视野系统：默认只渲染玩家所在格子
  - 实现回声触发机制：按空格键触发
  - 计算以玩家为中心3格范围内的所有格子（曼哈顿距离或欧氏距离）
  - 回声显示持续1秒，期间渲染范围内的格子
  - 回声显示期间，宝藏有特殊发光动画效果
  - 实现回声冷却机制（1秒冷却）
- **Acceptance Criteria Addressed**: [AC-3, AC-4, FR-3]
- **Test Requirements**:
  - `programmatic` TR-5.1: 默认状态下，非玩家格子不渲染或渲染为纯黑色
  - `programmatic` TR-5.2: 按空格键后，3格范围内的格子被渲染
  - `programmatic` TR-5.3: 回声显示持续1秒后恢复全黑
  - `programmatic` TR-5.4: 回声触发后1秒内无法再次触发（冷却）
  - `human-judgement` TR-5.5: 回声显示期间，宝藏有明显的发光动画效果
- **Notes**: 范围计算建议使用曼哈顿距离（更直观的格子计数）：|dx| + |dy| <= 3

## [x] Task 6: 玩家输入与移动控制
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 实现键盘事件监听
  - 支持方向键（上/下/左/右）和WASD键控制移动
  - 空格键触发回声定位
  - 移动前检查目标格子是否为墙壁（不能穿墙）
  - 移动后更新玩家位置
- **Acceptance Criteria Addressed**: [AC-5, NFR-3]
- **Test Requirements**:
  - `programmatic` TR-6.1: 方向键和WASD都能正确控制移动方向
  - `programmatic` TR-6.2: 向墙壁方向移动时位置不改变
  - `programmatic` TR-6.3: 空格键正确触发回声
  - `programmatic` TR-6.4: 输入响应及时（<100ms）
- **Notes**: 考虑按键防抖，防止快速连续按键导致移动过快

## [x] Task 7: 怪物AI系统实现
- **Priority**: P0
- **Depends On**: Task 6
- **Description**: 
  - 实现怪物随机移动逻辑：每1秒从可通行的相邻格子中随机选择一个移动
  - 实现BFS或A*寻路算法，用于怪物追踪玩家
  - 当玩家按空格触发回声时，怪物获取玩家当前位置
  - 回声触发后，怪物向玩家位置移动一格（使用寻路）
  - 怪物移动不能穿墙
- **Acceptance Criteria Addressed**: [AC-6, AC-7, FR-5]
- **Test Requirements**:
  - `programmatic` TR-7.1: 怪物每1秒随机移动一格（在回声未触发时）
  - `programmatic` TR-7.2: 怪物随机移动时不会穿墙
  - `programmatic` TR-7.3: 寻路算法能正确找到最短路径
  - `programmatic` TR-7.4: 玩家按空格后，怪物向玩家位置移动一格（使用寻路）
- **Notes**: 随机移动时，如果所有相邻方向都是墙壁，则不移动；寻路时如果路径被阻断，则回退到随机移动

## [x] Task 8: 碰撞检测与游戏状态管理
- **Priority**: P0
- **Depends On**: Task 7
- **Description**: 
  - 实现玩家与宝藏的碰撞检测：位置重合则收集宝藏
  - 实现宝藏收集后计数增加，宝藏状态标记为已收集
  - 实现玩家与怪物的碰撞检测：位置重合则游戏失败
  - 实现玩家与出口的碰撞检测：收集完3个宝藏后位置重合则游戏胜利
  - 实现游戏状态枚举：PLAYING, WIN, LOSE
  - 实现出口激活机制：收集完3个宝藏后出口变为可见
- **Acceptance Criteria Addressed**: [AC-8, AC-9, AC-10, AC-11, FR-6, FR-7]
- **Test Requirements**:
  - `programmatic` TR-8.1: 玩家移动到宝藏格子时，宝藏计数增加，宝藏被标记为已收集
  - `programmatic` TR-8.2: 收集第3个宝藏后，出口被激活（变为可见）
  - `programmatic` TR-8.3: 玩家与怪物位置重合时，游戏状态变为LOSE
  - `programmatic` TR-8.4: 收集完3个宝藏后，玩家移动到出口位置，游戏状态变为WIN
  - `programmatic` TR-8.5: 出口未激活时，玩家移动到出口位置不会触发胜利
- **Notes**: 碰撞检测在每次玩家移动后和怪物移动后都需要检查

## [x] Task 9: UI界面实现
- **Priority**: P1
- **Depends On**: Task 8
- **Description**: 
  - 实现顶部信息栏（深色半透明背景）
  - 显示已收集宝藏数量：格式为"宝藏: X/3"
  - 显示当前游戏状态：
    - 进行中：显示"游戏进行中"
    - 胜利：显示"恭喜获胜！"
    - 失败：显示"游戏结束"
  - 游戏结束时显示重新开始提示
- **Acceptance Criteria Addressed**: [AC-12, FR-8]
- **Test Requirements**:
  - `programmatic` TR-9.1: 信息栏显示在界面顶部
  - `programmatic` TR-9.2: 宝藏数量显示正确，随收集实时更新
  - `programmatic` TR-9.3: 游戏状态显示正确（进行中/胜利/失败）
  - `human-judgement` TR-9.4: 信息栏视觉效果美观，文字清晰可读
- **Notes**: 考虑添加重新开始功能（按R键或特定键）

## [x] Task 10: 主游戏循环与整合
- **Priority**: P0
- **Depends On**: Task 9
- **Description**: 
  - 实现主游戏循环（Game Loop）
  - 整合所有模块：迷宫生成、实体管理、渲染、输入、AI、碰撞检测、UI
  - 实现游戏时间管理（帧率控制、怪物移动计时器）
  - 实现游戏初始化流程
  - 实现游戏重新开始功能
- **Acceptance Criteria Addressed**: [所有AC]
- **Test Requirements**:
  - `programmatic` TR-10.1: 游戏循环正常运行，帧率稳定在30FPS以上
  - `programmatic` TR-10.2: 所有模块正确整合，无运行时错误
  - `programmatic` TR-10.3: 游戏可以正常开始、进行、结束
  - `programmatic` TR-10.4: 游戏重新开始功能正常
- **Notes**: 确保代码结构清晰，各模块职责分明

## [x] Task 11: 游戏元素初始位置放置
- **Priority**: P1
- **Depends On**: Task 10
- **Description**: 
  - 实现游戏元素的初始位置放置算法
  - 玩家初始位置：选择迷宫中一个合适的起点
  - 怪物初始位置：远离玩家的位置（建议距离>5格）
  - 3个宝藏：随机分布在迷宫中，确保每个都可达
  - 出口位置：远离玩家的位置，确保需要探索才能找到
  - 所有元素都放置在可通行路径上
- **Acceptance Criteria Addressed**: [AC-1, FR-1]
- **Test Requirements**:
  - `programmatic` TR-11.1: 所有元素都放置在可通行格子上（非墙壁）
  - `programmatic` TR-11.2: 玩家与怪物初始位置距离足够远（>5格）
  - `programmatic` TR-11.3: 3个宝藏位置各不相同且都可达
  - `programmatic` TR-11.4: 出口位置与玩家初始位置距离足够远
- **Notes**: 考虑使用BFS来确保所有位置可达，并计算位置之间的距离

## [x] Task 12: 视觉效果优化与测试
- **Priority**: P2
- **Depends On**: Task 11
- **Description**: 
  - 优化伪3D渲染效果，增强立体感
  - 优化回声动画效果，添加渐变扩散效果
  - 优化宝藏发光效果
  - 添加简单的粒子效果（可选）
  - 进行整体视觉效果测试和调整
- **Acceptance Criteria Addressed**: [NFR-1, AC-2]
- **Test Requirements**:
  - `human-judgement` TR-12.1: 伪3D效果美观，立体感强
  - `human-judgement` TR-12.2: 回声扩散动画流畅自然
  - `human-judgement` TR-12.3: 宝藏发光效果明显但不刺眼
  - `human-judgement` TR-12.4: 整体视觉风格统一，符合黑暗探索主题
- **Notes**: 这是优化任务，在核心功能完成后进行
