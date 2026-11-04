---
name: "container"
description: "页面容器组件，提供滚动、网络状态钩子。当需要页面容器带滚动追踪和网络状态时调用。"
---

# Container 容器

页面容器组件，提供滚动追踪和网络状态钩子。

## 何时使用

- 页面布局容器
- 滚动位置追踪
- 网络状态处理
- 页面分享功能

## 组件路径

- 源码: `packages/__components/container/src/container.vue`
- 类型: `packages/__components/container/src/types.ts`

## Hooks 钩子

| 钩子名 | 说明 |
| ---- | ---- |
| useContainerScroll | 滚动位置追踪 |
| useContainerShare | 分享功能 |
| useNetWorkHook | 网络状态监听 |

## 使用示例

```vue
<template>
  <ky-container>
    <!-- 页面内容 -->
  </ky-container>
</template>
```
