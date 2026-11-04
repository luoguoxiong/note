---
name: "radiogroup"
description: "单选框组组件，用于管理多个单选框。当需要将多个单选框作为一组管理时调用。"
---

# RadioGroup 单选框组

单选框组组件，用于管理多个单选框。

## 何时使用

- 单选绑定
- 表单单选字段
- 需要统一管理单选框状态

## 组件路径

- 源码: `packages/__components/radiogroup/src/radiogroup.vue`
- 类型: `packages/__components/radiogroup/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | string/number/boolean | - | 绑定值 |
| disabled | boolean | false | 是否禁用所有单选框 |
| direction | string | 'vertical' | 排列方向 |
| size | string | 'normal' | 所有单选框尺寸 |
| type | string | 'round' | 所有单选框类型 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 值变化时触发 | (value: any) |
| change | 值变化时触发 | (value: any) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 单选框内容 |

## 使用示例

```vue
<template>
  <ky-radio-group v-model="selected">
    <ky-radio name="a">选项A</ky-radio>
    <ky-radio name="b">选项B</ky-radio>
  </ky-radio-group>
</template>

<script setup>
const selected = ref('a')
</script>
```
