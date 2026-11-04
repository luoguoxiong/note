---
name: "checkbox"
description: "复选框组件，支持多种样式（圆形/勾选/按钮）。当需要复选框时调用。"
---

# Checkbox 复选框

复选框组件，支持多种视觉样式。

## 何时使用

- 多选场景
- 协议勾选框
- 多选列表

## 组件路径

- 源码: `packages/__components/checkbox/src/checkbox.vue`
- 类型: `packages/__components/checkbox/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | string/number/boolean | false | 绑定值 |
| name | string/number | '' | 复选框名称（用于group） |
| direction | string | 'vertical' | 排列方向：vertical/horizontal |
| size | string | 'normal' | 尺寸：large/medium/normal/small/mini |
| type | CheckboxType | 'round' | 样式类型：round/check/button/button-check/button-select |
| disabled | boolean | false | 是否禁用 |
| checked | boolean | false | 是否选中 |
| isError | boolean | false | 是否错误状态 |
| labelPosition | string | 'right' | 文字位置：left/right |
| iconSize | number | - | 自定义图标尺寸 |

## Types 类型定义

```typescript
type CheckboxType = 'round' | 'check' | 'button' | 'button-check' | 'button-select'
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 值变化时触发 | (value: boolean) |
| click | 点击时触发 | (name: string/number, event: Event) |

## Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 文字内容 | - |
| icon | 自定义图标 | { checked: boolean } |

## 使用示例

```vue
<template>
  <!-- 基础用法 -->
  <ky-checkbox v-model="checked">同意协议</ky-checkbox>
  
  <!-- 不同样式 -->
  <ky-checkbox v-model="checked" type="round">圆形</ky-checkbox>
  <ky-checkbox v-model="checked" type="check">勾选</ky-checkbox>
  <ky-checkbox v-model="checked" type="button">按钮</ky-checkbox>
  
  <!-- 禁用状态 -->
  <ky-checkbox v-model="checked" disabled>禁用</ky-checkbox>
  
  <!-- 不同尺寸 -->
  <ky-checkbox v-model="checked" size="large">大号</ky-checkbox>
  <ky-checkbox v-model="checked" size="small">小型</ky-checkbox>
</template>
```
