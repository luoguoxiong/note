---
name: "overlay"
description: "遮罩层组件，用于创建遮罩。当需要模态遮罩或蒙层时调用。"
---

# Overlay 遮罩层

遮罩层组件，用于创建遮罩层。

## 何时使用

- 模态遮罩
- 蒙层
- 阻止背景交互

## 组件路径

- 源码: `packages/__components/overlay/src/overlay.vue`
- 类型: `packages/__components/overlay/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| show | boolean | false | 是否显示遮罩 |
| hideNode | boolean | true | 是否隐藏节点 |
| duration | number \| [number, number] | 300 | 动画持续时间（毫秒），支持数组 [进场, 出场] |
| closeOnClickOverlay | boolean | true | 是否点击遮罩关闭 |
| zIndex | number | - | 遮罩的层级 |
| overlayClass | string | - | 自定义遮罩样式类名 |
| catchMove | boolean | false | 是否禁止穿透滚动 |

> 注意：本组件不存在 `lockScroll` 属性。如需禁止背景滚动，请使用 `catchMove`。

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| click | 点击遮罩时触发 | (event: Event) |

## 使用示例

```vue
<template>
  <ky-overlay :show="show" :z-index="100" @click="onClick" />
</template>

<script setup>
const show = ref(false)
const onClick = (e) => {
  console.log('点击遮罩', e)
}
</script>
```
