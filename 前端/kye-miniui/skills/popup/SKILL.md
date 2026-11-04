---
name: "popup"
description: "弹出层组件，支持多种位置和动画。当需要弹出层时调用。"
---

# Popup 弹出层

弹出层组件，支持多种位置和动画。基于 Overlay 与 Transition 实现，支持 H5 PC 端居中适配。

## 何时使用

- 模态弹窗
- 底部弹出面板
- 侧边面板
- 居中对话框

## 组件路径

- 源码: `packages/__components/popup/src/index.vue`
- 类型: `packages/__components/popup/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| enable | boolean | true | 是否从页面中脱离（root-portal enable） |
| show | boolean | false | 是否显示弹出层 |
| hideNode | boolean | true | 是否隐藏节点 |
| duration | number \| [number, number] | 300 | 动画时长（毫秒），支持数组 [进场, 出场] |
| zIndex | number | 100 | 层级 |
| contentClass | string | '' | 内容容器类名 |
| contentStyle | CSSProperties | {} | 内容容器样式 |
| position | PopupPosition | 'center' | 弹出位置：top/bottom/right/left/center |
| closeOnClickOverlay | boolean | true | 是否点击遮罩关闭 |
| safeAreaInsetTop | boolean | false | 是否保留顶部安全距离 |
| safeAreaInsetBottom | boolean | false | 是否保留底部安全距离 |
| round | boolean | true | 是否有圆角 |
| offsetBottom | number | 0 | 底部偏移量（position 为 bottom 时生效，叠加 safe-area-inset-bottom） |

## Types 类型定义

```typescript
type PopupPosition = 'top' | 'bottom' | 'right' | 'left' | 'center'
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | 显示状态变化时触发 | (show: boolean) |
| open | 打开时触发 | - |
| close | 关闭时触发 | - |
| clickOverlay | 点击遮罩时触发 | - |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 弹出层内容 |

## 使用示例

```vue
<template>
  <!-- 底部弹出 -->
  <ky-popup v-model:show="show" position="bottom" round>
    <view class="content">弹出内容</view>
  </ky-popup>

  <!-- 居中弹出 -->
  <ky-popup v-model:show="show" position="center">
    <view class="dialog">对话框内容</view>
  </ky-popup>

  <!-- 左侧弹出 -->
  <ky-popup v-model:show="show" position="left">
    <view class="side-panel">侧边栏</view>
  </ky-popup>

  <!-- 带底部安全距离的底部弹窗 -->
  <ky-popup v-model:show="show" position="bottom" safe-area-inset-bottom :offset-bottom="50">
    <view>底部内容</view>
  </ky-popup>
</template>
```
