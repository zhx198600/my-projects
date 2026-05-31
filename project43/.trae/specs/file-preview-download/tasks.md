# 文件预览下载增强功能 - 实施计划

## [x] Task 1: 列表视图添加快捷预览和下载按钮
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 在 FileListItem 组件中，为图片和视频文件添加悬停显示的预览和下载快捷按钮
  - 按钮应在鼠标悬停时显示，移开时隐藏
  - 按钮样式与现有设计风格一致
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-6
- **Test Requirements**:
  - `programmatic` TR-1.1: 鼠标悬停在图片/视频文件项上时，预览和下载按钮可见
  - `programmatic` TR-1.2: 点击预览按钮打开预览模态框
  - `programmatic` TR-1.3: 点击下载按钮触发文件下载
  - `human-judgement` TR-1.4: 按钮样式与现有设计风格一致
- **Notes**: 仅对可预览的文件类型（图片、视频、PDF、音频、文本）显示预览按钮

## [x] Task 2: 网格视图添加快捷预览和下载按钮
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 在 FileGridItem 组件中，为图片和视频文件添加悬停显示的预览和下载快捷按钮
  - 按钮应覆盖在缩略图上方
  - 支持点击图片/视频缩略图直接预览
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-6
- **Test Requirements**:
  - `programmatic` TR-2.1: 鼠标悬停在图片/视频文件项上时，预览和下载按钮可见
  - `programmatic` TR-2.2: 点击预览按钮打开预览模态框
  - `programmatic` TR-2.3: 点击图片/视频缩略图直接打开预览
  - `human-judgement` TR-2.4: 按钮样式与现有设计风格一致
- **Notes**: 点击缩略图预览功能仅适用于图片和视频文件

## [x] Task 3: 上传列表添加预览和下载按钮
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 在 DropZone 组件的上传列表中，为成功上传的图片和视频文件添加预览和下载按钮
  - 按钮在文件上传成功后显示
- **Acceptance Criteria Addressed**: AC-5, AC-6
- **Test Requirements**:
  - `programmatic` TR-3.1: 上传成功的图片/视频文件显示预览和下载按钮
  - `programmatic` TR-3.2: 点击预览按钮打开预览模态框
  - `programmatic` TR-3.3: 点击下载按钮触发文件下载
  - `human-judgement` TR-3.4: 按钮样式与现有设计风格一致
- **Notes**: 需要从上传响应中获取文件 ID 来调用预览和下载 API
