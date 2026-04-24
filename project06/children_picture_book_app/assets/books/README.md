# 绘本图片资源目录

## 目录结构说明

本目录用于存放儿童绘本的图片资源。每个绘本应该有自己独立的子目录，命名规则建议使用绘本 ID。

### 推荐目录结构

```
assets/books/
├── README.md
├── little_rabbit/              # 第一本绘本（示例：小兔子的冒险）
│   ├── cover.jpg              # 封面图片
│   ├── page1.jpg              # 第1页图片
│   ├── page2.jpg              # 第2页图片
│   ├── page3.jpg              # 第3页图片
│   ├── page4.jpg              # 第4页图片
│   ├── page5.jpg              # 第5页图片
│   └── page6.jpg              # 第6页图片
└── brave_turtle/              # 第二本绘本（示例：勇敢的小乌龟）
    ├── cover.jpg              # 封面图片
    ├── page1.jpg              # 第1页图片
    ├── page2.jpg              # 第2页图片
    ├── page3.jpg              # 第3页图片
    ├── page4.jpg              # 第4页图片
    ├── page5.jpg              # 第5页图片
    ├── page6.jpg              # 第6页图片
    └── page7.jpg              # 第7页图片
```

## 图片要求

1. **格式**：推荐使用 JPG 或 PNG 格式
2. **尺寸**：
   - 封面图片：建议 800x1000 像素或更大
   - 页面图片：建议 1200x800 像素或更大（横向）
3. **质量**：图片质量适中，避免过大的文件体积
4. **命名**：统一使用 `cover.jpg` 作为封面，`pageN.jpg` 作为页面图片

## 与 JSON 数据的对应关系

`assets/books.json` 中的路径配置需要与实际图片路径一致：

```json
{
  "coverImagePath": "assets/books/little_rabbit/cover.jpg",
  "pages": [
    {
      "pageNumber": 1,
      "imagePath": "assets/books/little_rabbit/page1.jpg",
      ...
    }
  ]
}
```

## 添加新绘本的步骤

1. 在 `assets/books/` 下创建新的子目录（如 `new_book/`）
2. 放入封面图片 `cover.jpg` 和各页面图片 `page1.jpg`、`page2.jpg` 等
3. 在 `assets/books.json` 中添加绘本的完整数据
4. 在 `pubspec.yaml` 中确保 assets 配置包含 `assets/` 目录

## 当前状态

**注意**：本项目目前为占位目录结构，实际图片资源尚未添加。

如需添加图片，请按照上述目录结构放置图片文件。
