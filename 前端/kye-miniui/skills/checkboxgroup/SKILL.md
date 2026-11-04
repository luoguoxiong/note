---
name: "checkboxgroup"
description: "复选框组组件，用于管理多个复选框。当需要将多个复选框作为一组管理时调用。"
---

# CheckboxGroup 复选框组

复选框组组件，用于管理多个复选框。

## 何时使用

- 多选绑定
- 表单多选字段
- 需要统一管理复选框状态

## 组件路径

- 源码: `packages/__components/checkboxgroup/src/checkboxgroup.vue`
- 类型: `packages/__components/checkboxgroup/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | array | [] | 绑定值（选中项name数组） |
| disabled | boolean | false | 是否禁用所有复选框 |
| direction | string | 'vertical' | 排列方向 |
| size | string | 'normal' | 所有复选框尺寸 |
| type | string | 'round' | 所有复选框类型 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 值变化时触发 | (value: any[]) |
| change | 值变化时触发 | (value: any[]) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 复选框内容 |

## 使用示例

```vue
<template>
  <ky-checkbox-group v-model="selected">
    <ky-checkbox name="a">选项A</ky-checkbox>
    <ky-checkbox name="b">选项B</ky-checkbox>
    <ky-checkbox name="c">选项C</ky-checkbox>
  </ky-checkbox-group>
</template>

<script setup>
const selected = ref(['a', 'b'])
</script>
```
