---
name: "floating-bubble"
description: "浮动气泡组件，可拖拽的悬浮按钮。当需要可拖拽的浮动按钮入口时调用。"
---

# FloatingBubble 浮动气泡

浮动气泡组件，可拖拽的悬浮按钮，支持自由/锁定方向拖拽、磁吸、安全区域等。

## 何时使用

- 浮动操作按钮
- 可拖拽帮助按钮
- 快捷访问入口

## 组件路径

- 源码: `packages/__components/floating-bubble/src/floating-bubble.vue`
- 类型: `packages/__components/floating-bubble/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| offset | { x: number; y: number } / null | null | 拖拽双向绑定的返回值（支持 v-model:offset） |
| axis | 'x' / 'y' / 'xy' / 'lock' | 'y' | 拖拽方向，`xy` 自由拖拽，`lock` 禁止拖拽 |
| gap | number | 0 | 气泡与窗口的最小间距（px） |
| magnetic | 'x' / 'y' / null | null | 自动磁吸方向 |
| safeAreaInsetBottom | boolean | true | 是否保留底部安全距离 |
| icon | string | '' | 图片链接 |
| text | string | '浮动气泡' | 默认文本 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:offset | 拖拽位置变化时触发（双向绑定） | (offset: { x: number; y: number }) |
| click | 点击组件时触发 | (e: TouchEvent) |
| offsetChange | 由用户拖拽导致位置改变时触发 | (offset: { x: number; y: number }) |
| offsetChangeEnd | 拖拽结束位置改变时触发 | (offset: { x: number; y: number }) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 气泡内容（不传则使用 icon/text） |

## 使用示例

```vue
<template>
  <!-- 默认拖拽 -->
  <ky-floating-bubble icon="https://example.com/help.png" text="帮助" @click="onClick" />

  <!-- 自由拖拽 + 双向绑定 -->
  <ky-floating-bubble
    v-model:offset="pos"
    axis="xy"
    :gap="10"
    @offset-change-end="onEnd"
  >
    <ky-icon name="help" />
  </ky-floating-bubble>
</template>

<script setup>
import { ref } from 'vue'
const pos = ref({ x: 0, y: 0 })
const onClick = (e) => console.log('click', e)
const onEnd = (offset) => console.log('最终位置', offset)
</script>
```
