import { Note } from '../types';

export const SAMPLE_NOTES: Note[] = [
  {
    id: 'intro',
    title: '欢迎来到我的数字花园',
    path: '00-开始/欢迎',
    category: '开始',
    tags: ['welcome', 'garden'],
    lastModified: '2024-03-20T10:00:00Z',
    content: `
# 欢迎来到我的数字花园 🌿

这是一个依托 Obsidian 笔记构建的个人知识库。这里记录了我的学习历程、面试心得、收藏的小说以及日常随笔。

## 🚀 这里的特色
- **双向链接**: 笔记之间紧密相连。
- **实时搜索**: 快速找到你需要的知识。
- **分类清晰**: 从编程到日记，应有尽有。

## 📂 目录概览
- [[编程知识]]: 记录学习中的技术难点。
- [[面试逐字稿]]: 整理的面试回答，助你一臂之力。
- [[收藏小说]]: 那些触动心灵的文字。
- [[个人日记]]: 碎碎念与生活感悟。

> "知识不是零散的碎片，而是一座不断生长的森林。"
    `
  },
  {
    id: 'react-hooks',
    title: 'React Hooks 深度解析',
    path: '01-编程/React/Hooks',
    category: '编程',
    tags: ['react', 'frontend', 'hooks'],
    lastModified: '2024-03-21T15:30:00Z',
    content: `
# React Hooks 深度解析

React Hooks 改变了我们编写组件的方式。

## useState
最基础的状态管理。

\`\`\`tsx
const [count, setCount] = useState(0);
\`\`\`

## useEffect
处理副作用的利器。

- **无依赖**: 每次渲染都运行。
- **空依赖**: 仅在挂载时运行。
- **有依赖**: 依赖项变化时运行。

## 自定义 Hooks
逻辑复用的最佳实践。
    `
  },
  {
    id: 'interview-js',
    title: 'JS 闭包面试题',
    path: '02-面试/JS/闭包',
    category: '面试',
    tags: ['javascript', 'interview'],
    lastModified: '2024-03-22T09:00:00Z',
    content: `
# 面试逐字稿：什么是闭包？

**面试官**: 请解释一下 JavaScript 中的闭包。

**我**: 闭包是指有权访问另一个函数作用域中变量的函数。

### 核心要点
1. **函数嵌套**: 一个函数内部定义了另一个函数。
2. **变量引用**: 内部函数引用了外部函数的变量。
3. **生命周期**: 外部函数执行完毕后，其作用域链仍被内部函数引用，不会被销毁。

### 实际应用
- 私有变量
- 柯里化
- 模块化
    `
  },
  {
    id: 'diary-2024',
    title: '2024年春天的第一场雨',
    path: '03-日记/2024/春天',
    category: '日记',
    tags: ['life', 'spring'],
    lastModified: '2024-03-23T18:00:00Z',
    content: `
# 2024年春天的第一场雨

今天下雨了。

窗外的樱花被打落了不少，但空气变得格外清新。
最近在读《百年孤独》，感觉时间真的是一个圈。

希望这个春天能多写一些代码，也多看一些风景。
    `,
    coverImage: 'https://picsum.photos/seed/rain/800/400'
  },
  {
    id: 'novel-1',
    title: '《三体》：给时光以生命',
    path: '04-收藏/小说/三体',
    category: '收藏',
    tags: ['sci-fi', 'liu-cixin'],
    lastModified: '2024-03-24T10:00:00Z',
    content: '# 《三体》\n\n给时光以生命，给岁月以文明。',
    coverImage: 'https://picsum.photos/seed/threebody/800/400'
  },
  {
    id: 'novel-2',
    title: '《百年孤独》：孤独的轮回',
    path: '04-收藏/小说/百年孤独',
    category: '收藏',
    tags: ['classic', 'marquez'],
    lastModified: '2024-03-25T11:00:00Z',
    content: '# 《百年孤独》\n\n无论走到哪里，都应该记住，过去都是假的。',
    coverImage: 'https://picsum.photos/seed/solitude/800/400'
  },
  {
    id: 'novel-3',
    title: '《活着》：忍受生命赋予的责任',
    path: '04-收藏/小说/活着',
    category: '收藏',
    tags: ['classic', 'yu-hua'],
    lastModified: '2024-03-26T12:00:00Z',
    content: '# 《活着》\n\n人是为了活着本身而活着的，而不是为了活着之外的任何事物所活着。',
    coverImage: 'https://picsum.photos/seed/alive/800/400'
  }
];
