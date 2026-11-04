---
name: "swipe-cell"
description: "滑动单元格组件，用于滑动显示操作。当需要单元格滑动显示删除/编辑操作时调用。"
---

# SwipeCell 滑动单元格

滑动单元格组件，滑动显示操作按钮。

## 何时使用

- 滑动删除
- 滑动显示操作
- 带隐藏操作的列表项

## 组件路径

- 源码: `packages/__components/swipe-cell/src/swipe-cell.vue`
- 类型: `packages/__components/swipe-cell/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| name | string | - | 唯一标识（用于group） |
| show | boolean | false | 是否显示操作区域 |
| disabled | boolean | false | 是否禁用滑动 |
| touchMovePreventDefault | boolean | true | 是否阻止滑动默认行为 |
| touchMoveStopPropagation | boolean | true | 是否阻止滑动冒泡 |
| beforeClose | Interceptor | - | 关闭前回调 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| open | 打开时触发 | (position: SwipePosition) |
| close | 关闭时触发 | - |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 主内容 |
| left | 左侧操作区 |
| right | 右侧操作区 |

## 使用示例

```vue
<template>
  <ky-swipe-cell>
    <template #left>
      <ky-button>选择</ky-button>
    </template>
    <ky-cell title="内容" />
    <template #right>
      <ky-button type="danger">删除</ky-button>
    </template>
  </ky-swipe-cell>
</template>
```
