---
name: "floating-panel"
description: "浮动面板组件，可拖拽的底部面板。当需要可拖拽的底部面板时调用，支持锚点与动画。"
---

# FloatingPanel 浮动面板

浮动面板组件，可拖拽的底部面板。通用实现使用原生 touch 事件，另有 H5/小程序专用变体。

## 何时使用

- 底部弹出面板
- 可拖拽内容面板
- 可展开底部内容（带锚点）

## 组件路径

- 源码（多端）:
  - 通用（默认导出）: `packages/__components/floating-panel/src/floating-panel.vue`（原生 touch 事件）
  - H5 专用变体: `packages/__components/floating-panel/src/floating-panel-h5.vue`
  - 小程序专用变体: `packages/__components/floating-panel/src/floating-panel-wx.vue`（movable-area/movable-view）
  - 支付宝特殊子组件: `packages/__components/floating-panel/src/components/cover-view-alipay.vue`
- 类型: `packages/__components/floating-panel/src/types.ts`
- 入口: `packages/__components/floating-panel/index.ts`（注册 `ky-floating-panel` / `ky-floating-panel-h5` / `ky-floating-panel-wx`）

## Props 入参（以通用实现为准）

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| height | number | 100 | 面板高度（支持 v-model:height） |
| duration | number | 0.3 | 动画时长（秒） |
| backgroundColor | string | 'none' | 背景颜色 |
| contentDraggable | boolean | true | 内容区是否可拖拽 |
| anchors | number[] | [] | 锚点位置数组 |
| safeAreaInsetBottom | boolean | true | 是否保留底部安全距离 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:height | 高度变化时触发 | (height: number) |
| heightChange | 高度变化时触发 | (height: number) |
| heightChangeEnd | 高度变化结束时触发 | (height: number) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 面板内容 |
| bar | 自定义顶部拖拽条 |
| header | 自定义头部内容 |

## 使用示例

```vue
<template>
  <ky-floating-panel v-model:height="height" :anchors="anchors">
    <!-- 面板内容 -->
  </ky-floating-panel>
</template>

<script setup>
import { ref } from 'vue'
const height = ref(100)
const anchors = [60, 300, 600]  // 锚点位置
</script>
```
