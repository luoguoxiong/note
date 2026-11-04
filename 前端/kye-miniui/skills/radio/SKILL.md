---
name: "radio"
description: "单选框组件，支持多种样式。当需要单选时调用。"
---

# Radio 单选框

单选框组件，支持多种视觉样式。

## 何时使用

- 单选场景
- 单选按钮组
- 选项选择

## 组件路径

- 源码: `packages/__components/radio/src/radio.vue`
- 类型: `packages/__components/radio/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | string/number/boolean | - | 绑定值（需配合radiogroup） |
| name | string/boolean | - | 单选框名称 |
| direction | string | 'vertical' | 排列方向：vertical/horizontal |
| size | string | 'normal' | 尺寸：large/medium/normal/small/mini |
| type | RadioType | 'round' | 样式类型：round/check/button/button-check/button-select |
| disabled | boolean | false | 是否禁用 |
| checked | boolean | false | 是否选中 |
| isError | boolean | false | 是否错误状态 |
| labelPosition | string | 'right' | 文字位置：left/right |
| iconSize | number | - | 自定义图标尺寸 |
| checkedHighlight | boolean | false | 选中时是否高亮 |

## Types 类型定义

```typescript
type RadioType = 'round' | 'check' | 'button' | 'button-check' | 'button-select'
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| click | 点击时触发 | - |

## Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 文字内容 | - |
| icon | 自定义图标 | { checked: boolean } |

## 使用示例

```vue
<template>
  <ky-radio-group v-model="selected">
    <ky-radio name="option1">选项1</ky-radio>
    <ky-radio name="option2">选项2</ky-radio>
  </ky-radio-group>
</template>
```
