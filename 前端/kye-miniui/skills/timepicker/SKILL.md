---
name: "timepicker"
description: "日期选择器组件，基于 Picker 封装。当需要日期选择界面时调用。"
---

# Timepicker 日期选择器

日期选择器组件，基于 Picker 封装，支持多种日期类型与列自定义。

## 何时使用

- 日期选择（年月日）
- 年月选择
- 自定义列类型选择

## 组件路径

- 源码: `packages/__components/timepicker/src/timepicker.vue`
- 类型: `packages/__components/timepicker/src/types/index.ts`
- 工具: `packages/__components/timepicker/src/utils.ts`

> 注：组件 name 为 `ky-datetimepicker`，但注册时使用 `ky-timepicker`。

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | string / number | - | 默认选中项 |
| show | boolean | false | popup 显示状态（支持 v-model:show） |
| type | DatePickerType | 'date' | 类型（建议用 `columnsType` 替代） |
| columnsType | TimePickerColumnType[] | ['year','month','day'] | 列展示数据排列顺序 |
| minDate | Date | 当前年-10-01-01 | 开始日期 |
| maxDate | Date | 当前年+10-12-31 | 结束日期 |
| title | string | '标题' | 标题 |
| confirmButtonText | string | '' | 确认按钮文案 |
| cancelButtonText | string | '' | 取消按钮文案 |
| threeDimensional | boolean | true | 是否开启 3D 效果 |
| swipeDuration | number / string | 1000 | 惯性滚动时长（毫秒） |
| showToolbar | boolean | true | 是否展示顶部栏 |
| visibleOptionNum | number / string | 7 | 可见选项个数 |
| optionHeight | number / string | 36 | 选项高度 |
| showClose | boolean | false | 是否展示关闭按钮 |
| filter | Function | - | 列过滤函数 |
| formatter | Function | - | 格式化函数 |

## Types 类型定义

```typescript
type DatePickerType = 'date' | 'year-month' | 'month-day'
type TimePickerColumnType = 'year' | 'month' | 'day'
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | 显示状态变化时触发 | (show: boolean) |
| update:modelValue | 值变化时触发 | (value: string / number) |
| confirm | 确认选择时触发 | (value: any) |
| cancel | 取消选择时触发 | - |
| change | 选项变化时触发 | (value: any) |
| open | 打开时触发 | - |

## Slots 插槽

透传 Picker 的所有插槽（default、bottom 等）。

## 使用示例

```vue
<template>
  <ky-cell title="选择日期" is-link @click="show = true" />
  <ky-timepicker
    v-model:show="show"
    v-model="date"
    title="选择日期"
    type="date"
    @confirm="onConfirm"
  />

  <!-- 自定义列：年月 -->
  <ky-timepicker
    v-model:show="show2"
    v-model="yearMonth"
    :columns-type="['year', 'month']"
    title="选择年月"
  />
</template>

<script setup>
import { ref } from 'vue'
const show = ref(false)
const show2 = ref(false)
const date = ref('')
const yearMonth = ref('')
const onConfirm = (v) => console.log(v)
</script>
```
