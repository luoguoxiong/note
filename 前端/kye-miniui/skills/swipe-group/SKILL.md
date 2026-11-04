---
name: "swipe-group"
description: "滑动单元格组组件，用于管理多个滑动单元格。当需要协调多个滑动单元格时调用。"
---

# SwipeGroup 滑动单元格组

滑动单元格组组件，用于管理多个滑动单元格。

## 何时使用

- 多个滑动单元格需要协调
- 同时只能打开一个滑动单元格

## 组件路径

- 源码: `packages/__components/swipe-group/src/swipe-group.vue`
- 类型: `packages/__components/swipe-group/src/types.ts`

## 使用示例

```vue
<template>
  <ky-swipe-group>
    <ky-swipe-cell name="1">
      <ky-cell title="项目1" />
      <template #right>
        <ky-button type="danger">删除</ky-button>
      </template>
    </ky-swipe-cell>
    <ky-swipe-cell name="2">
      <ky-cell title="项目2" />
      <template #right>
        <ky-button type="danger">删除</ky-button>
      </template>
    </ky-swipe-cell>
  </ky-swipe-group>
</template>
```
