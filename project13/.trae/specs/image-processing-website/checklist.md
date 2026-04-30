# 图片处理网站 - 验证检查清单

## 后端服务验证
- [x] Checkpoint 1: `npm install` 成功安装所有依赖，无报错
- [x] Checkpoint 2: `npm start` 成功启动服务器，终端显示监听端口信息
- [x] Checkpoint 3: 访问 `http://localhost:3000` 返回 200 状态码，页面正常显示
- [x] Checkpoint 4: 静态资源（HTML/CSS/JS）正确加载，无 404 错误

## 基础功能验证
- [ ] Checkpoint 5: 点击上传按钮可打开文件选择对话框
- [ ] Checkpoint 6: 拖拽图片到上传区域可成功上传并显示
- [ ] Checkpoint 7: 上传 JPG/PNG/WebP 格式图片均能正确显示
- [ ] Checkpoint 8: 图片信息（尺寸、大小、格式）正确显示
- [ ] Checkpoint 9: 上传超过大小限制的图片显示友好错误提示
- [ ] Checkpoint 10: 上传非图片文件显示类型错误提示

## 裁剪功能验证
- [ ] Checkpoint 11: 点击裁剪按钮进入裁剪模式，显示可调整的裁剪框
- [ ] Checkpoint 12: 拖拽裁剪框边缘可调整大小，边界限制正确
- [ ] Checkpoint 13: 拖拽裁剪框内部可移动位置，不会移出图片区域
- [ ] Checkpoint 14: 选择 1:1 固定比例时，裁剪框保持正方形
- [ ] Checkpoint 15: 选择 16:9 固定比例时，裁剪框保持对应比例
- [ ] Checkpoint 16: 确认裁剪后，图片显示正确的裁剪结果
- [ ] Checkpoint 17: 取消裁剪后，图片保持不变，退出裁剪模式
- [ ] Checkpoint 18: 裁剪操作后可通过撤销按钮恢复原图

## 旋转功能验证
- [ ] Checkpoint 19: 点击 90 度右转按钮，图片顺时针旋转 90 度
- [ ] Checkpoint 20: 点击 90 度左转按钮，图片逆时针旋转 90 度
- [ ] Checkpoint 21: 点击 180 度按钮，图片旋转 180 度
- [ ] Checkpoint 22: 使用滑块调整角度时，图片实时跟随旋转
- [ ] Checkpoint 23: 旋转 90 度后，图片宽高正确互换，画布尺寸适应
- [ ] Checkpoint 24: 旋转操作后可通过撤销按钮恢复原状
- [ ] Checkpoint 25: 任意角度旋转后图片显示完整，无截断

## 撤销/重做与重置验证
- [ ] Checkpoint 26: 初始状态下，撤销/重做按钮为禁用状态
- [ ] Checkpoint 27: 执行一次编辑操作后，撤销按钮变为可用
- [ ] Checkpoint 28: 点击撤销按钮，图片恢复到操作前状态
- [ ] Checkpoint 29: 撤销后，重做按钮变为可用
- [ ] Checkpoint 30: 点击重做按钮，恢复已撤销的操作
- [ ] Checkpoint 31: 多次撤销后点击重置按钮，图片恢复到原始上传状态
- [ ] Checkpoint 32: 重置后，撤销/重做按钮再次变为禁用

## AI 抠图（模拟）验证
- [ ] Checkpoint 33: 点击 AI 抠图按钮显示处理中动画和进度提示
- [ ] Checkpoint 34: 模拟处理持续 2-3 秒后显示完成提示
- [ ] Checkpoint 35: 完成后背景变为透明（显示棋盘格图案）
- [ ] Checkpoint 36: 主体区域保持不变，未被错误移除
- [ ] Checkpoint 37: 背景替换功能按钮变为可用状态
- [ ] Checkpoint 38: 抠图操作可通过撤销按钮恢复原图
- [ ] Checkpoint 39: 未抠图时，背景替换按钮为禁用状态

## 背景替换验证
- [ ] Checkpoint 40: 选择白色预设背景，主体后面正确显示白色
- [ ] Checkpoint 41: 选择黑色预设背景，主体后面正确显示黑色
- [ ] Checkpoint 42: 选择蓝色预设背景，主体后面正确显示蓝色
- [ ] Checkpoint 43: 上传自定义背景图片成功加载并显示在主体后面
- [ ] Checkpoint 44: 背景图片按比例缩放适应画布，不变形
- [ ] Checkpoint 45: 每次选择不同背景时实时预览效果
- [ ] Checkpoint 46: 背景替换操作可通过撤销按钮恢复

## 导出与下载验证
- [ ] Checkpoint 47: 选择 PNG 格式下载，透明背景正确保留
- [ ] Checkpoint 48: 选择 JPG 格式下载，透明背景转换为白色
- [ ] Checkpoint 49: 质量设置为 100% 时，JPG 图片文件较大，质量较好
- [ ] Checkpoint 50: 质量设置为 50% 时，JPG 图片文件较小，质量适中
- [ ] Checkpoint 51: 点击下载按钮成功触发浏览器下载对话框
- [ ] Checkpoint 52: 下载的文件格式与选择的格式一致
- [ ] Checkpoint 53: 下载的文件名包含时间戳，格式正确
- [ ] Checkpoint 54: 下载的图片内容与编辑器中显示一致

## 响应式布局验证
- [ ] Checkpoint 55: 桌面端（> 1024px）布局合理，工具栏在左侧，编辑区在中间
- [ ] Checkpoint 56: 移动端（< 768px）工具栏自动调整为底部或顶部
- [ ] Checkpoint 57: 移动端按钮大小适中，便于点击
- [ ] Checkpoint 58: 移动端编辑区域占满可用空间
- [ ] Checkpoint 59: 所有功能在移动端均可正常操作
- [ ] Checkpoint 60: 横竖屏切换时布局自动适配

## 完整工作流验证
- [ ] Checkpoint 61: 完整工作流：上传图片 -> 裁剪 -> 旋转 -> 抠图 -> 换背景 -> 下载，全部成功
- [ ] Checkpoint 62: 在完整工作流中，撤销/重做功能全程可用
- [ ] Checkpoint 63: 执行 10+ 次操作后，页面性能无明显下降
- [ ] Checkpoint 64: 处理 5MB 以上大图时，操作响应可接受（< 500ms）
- [ ] Checkpoint 65: 页面无 JavaScript 错误（控制台无红色错误）
- [ ] Checkpoint 66: 所有用户操作都有明确的视觉反馈

## 用户体验验证
- [ ] Checkpoint 67: 错误提示友好，帮助用户理解问题（如"文件过大，请选择小于 10MB 的图片"）
- [ ] Checkpoint 68: 按钮有悬停效果和点击反馈
- [ ] Checkpoint 69: 所有可交互元素有明确的视觉提示
- [ ] Checkpoint 70: 页面配色简洁专业，视觉层次清晰
- [ ] Checkpoint 71: 键盘快捷键：Ctrl+Z 撤销，Ctrl+Y 重做工作正常
- [ ] Checkpoint 72: 加载和处理状态有明确的动画提示
