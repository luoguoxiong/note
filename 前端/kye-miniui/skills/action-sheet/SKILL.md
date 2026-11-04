---
name: "action-sheet"
description: "底部弹出菜单组件，用于显示操作选项列表。当需要底部弹出菜单让用户选择操作时调用。"
---

# ActionSheet 动作面板

底部弹出菜单组件，用于显示操作选项列表。基于 Popup 实现，继承 PopupProps。

## 何时使用

- 显示操作选项供用户选择
- 需要底部弹出式菜单
- 需要确认类底部弹窗

## 组件路径

- 源码: `packages/__components/action-sheet/src/action-sheet.vue`
- 类型: `packages/__components/action-sheet/src/types.ts`

## Props 入参

ActionSheetProps 继承自 `PopupProps`（详见 popup 组件），以下为自身扩展的属性：

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| show | boolean | false | 是否展示 |
| zIndex | number | - | 弹出层层级 |
| closeOnClickOverlay | boolean | true | 是否点击遮罩关闭 |
| safeAreaInsetBottom | boolean | true | 是否开启底部安全区域 |
| menuItems | MenuItems[] | [] | 底部菜单数组对象 |
| title | string | - | 顶部标题 |
| description | string | - | 描述文字 |
| cancelTxt | string | '取消' | 取消按钮文案 |
| optionTag | string | 'name' | 列表项标题展示使用的字段名 |
| optionSubTag | string | 'subName' | 列表项二级标题展示使用的字段名 |

> 继承自 PopupProps 的常用属性：`enable`、`hideNode`、`duration`、`position`、`contentClass`、`contentStyle`、`safeAreaInsetTop`、`round`、`offsetBottom` 等。

## MenuItems 类型

```typescript
type MenuItems = {
  name: string       // 选项名称
  subName: string    // 二级标题
  color: string      // 文字颜色
  loading: boolean   // 是否加载中
  disable: boolean   // 是否禁用
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | 弹窗显示状态变化时触发 | (show: boolean) |
| open | 弹窗打开时触发 | (value: boolean) |
| close | 弹窗关闭时触发 | (e: Event) |
| cancel | 点击取消按钮时触发 | - |
| choose | 选择选项时触发 | (item: MenuItems, index: number) |

## Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 自定义内容 | - |
| item | 自定义选项内容 | { item, index } |

## 使用示例

```vue
<template>
  <ky-action-sheet
    v-model:show="show"
    :menuItems="actions"
    title="选择操作"
    @choose="onSelect"
  />
</template>

<script setup>
const show = ref(false)
const actions = [
  { name: '拍照', color: '#333' },
  { name: '从相册选择', color: '#333' },
  { name: '删除', color: '#FF4444', disable: true }
]

const onSelect = (item, index) => {
  console.log('选择了:', item.name)
}
</script>
```
