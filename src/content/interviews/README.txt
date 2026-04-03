将 Obsidian 的面试逐字稿文件夹直接复制到这个目录即可。

约定：
- 支持任意层级子文件夹，左侧会按文件夹树展示。
- 只会读取 `.md` 文件，其他文件会被忽略。
- 以 `_` 开头的文件夹不会被导入，可用于放模板或草稿。
- 推荐在 Markdown 顶部使用简单 frontmatter：

---
title: JavaScript 闭包高频问答
tags: [javascript, closure]
updated: 2024-03-22T09:00:00Z
---

- 如果没有 frontmatter，系统会优先使用一级标题作为标题，否则退回文件名。
