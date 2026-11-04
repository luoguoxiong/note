---
name: "picker"
description: "选择器组件，用于列选择。当需要从选项中选择值时调用。"
---

# Picker 选择器

选择器组件，用于从列中选择值。

## 何时使用

- 单列选择
- 多列选择
- 级联选择
- 日期/时间选择

## 组件路径

- 源码: `packages/__components/picker/src/index.vue`
- 类型: `packages/__components/picker/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| show | boolean | false | 是否显示（弹窗模式） |
| poppable | boolean | true | 是否使用弹窗 |
| columns | PickerOption[] | [] | 列数据 |
| modelValue | (string/number)[] | [] | 选中值 |
| title | string | '标题' | 工具栏标题 |
| cancelButtonText | string | '取消' | 取消按钮文字 |
| confirmButtonText | string | '确定' | 确认按钮文字 |
| showToolbar | boolean | true | 是否显示工具栏 |
| optionHeight | number/string | 36 | 选项高度 |
| visibleOptionNum | number/string | 7 | 可见选项数量 |
| swipeDuration | number | - | 滚动持续时间（仅H5） |
| showFooterBtn | boolean | true | 是否显示底部按钮（弹窗模式） |
| footerConfirmText | string | '确定' | 底部确认按钮文字 |
| loading | boolean | false | 是否显示加载状态 |
| showClose | boolean | false | 是否显示关闭按钮 |

## PickerOption 类型

```typescript
interface PickerOption {
  text?: string | number      // 选项文字
  value?: string | number     // 选项值
  disabled?: string           // 是否禁用
  children?: PickerOption[]   // 子选项（级联）
  className?: string | number // 自定义类名
}

interface PickerFieldNames {
  text?: string       // 文字字段名
  value?: string      // 值字段名
  children?: string   // 子选项字段名
  className?: string  // 类名字段名
}

interface PickerValues {
  selectedValue: any[]        // 选中的值
  selectedOptions: PickerOption[]  // 选中的选项
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | 显示状态变化时触发 | (show: boolean) |
| update:modelValue | 值变化时触发 | (value: any[]) |
| confirm | 确认选择时触发 | (value: PickerValues) |
| cancel | 取消选择时触发 | (value: PickerValues) |
| change | 选项变化时触发 | (value: PickerValues) |
| open | 打开时触发 | (show: boolean) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 自定义内容 |
| bottom | 底部内容 |

## Expose 暴露方法

| 方法名 | 说明 |
| ---- | ---- |
| handleConfirm | 确认选择 |
| handleCancel | 取消选择 |

## 使用示例

```vue
<template>
  <ky-picker
    v-model:show="show"
    v-model="selectedValues"
    :columns="columns"
    title="请选择"
    @confirm="onConfirm"
  />
</template>

<script setup>
const show = ref(false)
const selectedValues = ref([])
const columns = [
  { text: '选项1', value: '1' },
  { text: '选项2', value: '2' },
  { text: '选项3', value: '3' }
]

const onConfirm = ({ selectedValue, selectedOptions }) => {
  console.log('选中:', selectedOptions)
}
</script>
```
