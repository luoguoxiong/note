---
name: "popover"
description: "气泡弹出框组件，用于显示浮动内容。当需要工具提示或下拉弹出时调用，支持多种位置与主题。"
---

# Popover 气泡弹出框

气泡弹出框组件，用于显示浮动内容，支持多种弹出位置、主题、箭头与动画。

## 何时使用

- 工具提示
- 下拉菜单
- 浮动信息面板
- 上下文菜单

## 组件路径

- 源码: `packages/__components/popover/src/popover.vue`
- 类型: `packages/__components/popover/src/types.ts`
- 配置: `packages/__components/popover/src/config.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| show | boolean | false | 是否显示（支持 v-model:show） |
| theme | 'light' / 'dark' / 'warning' / 'error' | 'light' | 主题 |
| location | PopoverLocation | 'bottom' | 弹出位置 |
| offset | [number, number] | [0, 10] | 偏移量 |
| arrowOffset | number | 30 | 箭头偏移 |
| showArrow | boolean | true | 是否显示箭头 |
| targetId | string | - | 目标元素 ID |
| listenClickId | string | 'ky-container' | 监听点击的元素 ID（用于点击外部关闭） |
| custClass | string | '' | 自定义类名 |
| animation | 'fade' / 'bounce' | 'fade' | 动画类型 |

## Types 类型定义

```typescript
type PopoverTheme = 'light' | 'dark' | 'warning' | 'error'

type PopoverLocation =
  | 'bottom' | 'top' | 'left' | 'right'
  | 'top-start' | 'top-end'
  | 'bottom-start' | 'bottom-end'
  | 'left-start' | 'left-end'
  | 'right-start' | 'right-end'

type PopoverAnimation = 'fade' | 'bounce'
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | 显示状态变化时触发 | (show: boolean) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| reference | 触发元素 |
| content | 弹出内容 |

## 使用示例

```vue
<template>
  <ky-popover v-model:show="show" location="bottom" theme="light">
    <template #reference>
      <ky-button>点击触发</ky-button>
    </template>
    <template #content>
      <div>弹出内容</div>
    </template>
  </ky-popover>

  <!-- 暗色主题 + 顶部弹出 -->
  <ky-popover v-model:show="show2" location="top" theme="dark" :show-arrow="true">
    <template #reference>
      <ky-button>上方弹出</ky-button>
    </template>
    <template #content>
      <div>提示内容</div>
    </template>
  </ky-popover>
</template>
```
