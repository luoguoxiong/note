---
name: "popover-menu"
description: "气泡菜单组件，用于下拉菜单。当需要下拉菜单带多个选项时调用。"
---

# PopoverMenu 气泡菜单

气泡菜单组件，基于 Popover 封装，用于显示下拉菜单。

## 何时使用

- 下拉菜单
- 上下文菜单
- 操作菜单

## 组件路径

- 源码: `packages/__components/popover-menu/src/popover-menu.vue`
- 类型: `packages/__components/popover-menu/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| location | PopoverLocation | 'bottom-start' | 菜单弹出位置 |
| offset | [number, number] | [0, 10] | 偏移量 |
| useButton | boolean | false | 是否使用 button |
| menus | Array<{ type: number/string; label: string; icon?: string }> | [] | 菜单列表 |

## Types 类型定义

```typescript
type PopoverLocation =
  | 'bottom' | 'top' | 'left' | 'right'
  | 'top-start' | 'top-end'
  | 'bottom-start' | 'bottom-end'
  | 'left-start' | 'left-end'
  | 'right-start' | 'right-end'

interface MenuItem {
  type: number | string  // 类型
  label: string          // 名称
  icon?: string          // 图标
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| chooseMenu | 选择菜单项时触发 | (type: number/string, menu: MenuItem) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| reference | 触发元素 |

## 使用示例

```vue
<template>
  <ky-popover-menu :menus="menus" location="bottom-start" @choose-menu="onSelect">
    <template #reference>
      <ky-button>菜单</ky-button>
    </template>
  </ky-popover-menu>
</template>

<script setup>
const menus = [
  { type: 1, label: '编辑', icon: 'edit' },
  { type: 2, label: '分享', icon: 'share' },
  { type: 3, label: '删除', icon: 'delete' },
]

const onSelect = (type, menu) => {
  console.log('选中:', type, menu.label)
}
</script>
```
