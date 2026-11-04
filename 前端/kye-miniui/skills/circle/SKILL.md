---
name: "circle"
description: "圆形进度组件，用于显示圆形进度指示器。当需要环形进度条时调用，支持进度动画与中心文本。"
---

# Circle 圆形进度

圆形进度组件，用于显示圆形进度指示器。

## 何时使用

- 进度指示
- 带百分比的加载状态
- 圆形数据可视化

## 组件路径

- 源码: `packages/__components/circle/src/circle.vue`
- 类型: `packages/__components/circle/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| size | number | 100 | 圆环直径 |
| strokeWidth | number | - | 圆环线条宽度 |
| color | string | '#8365F6' | 进度条颜色 |
| trackColor | string | '#EBEEF5' | 轨道（背景圆环）颜色 |
| progress | number | - | 当前进度值（范围 0 - 100） |
| duration | number | - | 动画持续时间（毫秒） |
| showText | boolean | - | 是否显示圆环中心的文本 |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 中心内容 |

## 使用示例

```vue
<template>
  <!-- 基础用法 -->
  <ky-circle :progress="50" :size="80" :stroke-width="4">
    <text>50%</text>
  </ky-circle>

  <!-- 自定义颜色与动画 -->
  <ky-circle
    :progress="percentage"
    :size="100"
    :stroke-width="6"
    color="#07c160"
    track-color="#eee"
    :duration="300"
    :show-text="false"
  />

  <!-- 配合下拉刷新使用（List 组件内部使用） -->
  <ky-circle
    v-if="!refreshing && status === 'pulling' && dragHeight > 0"
    :size="20"
    :stroke-width="2"
    color="#8365f6"
    track-color="white"
    :duration="0"
    :show-text="false"
    :progress="(dragHeight / 80) * 100"
  />
</template>

<script setup>
const percentage = ref(30)
</script>
```
