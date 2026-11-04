---
name: 'calendar'
description: '日历组件，支持单选/范围/多选/周选模式。当需要日期选择器时调用。'
---

# Calendar 日历

日历组件，支持多种日期选择模式。

## 何时使用

- 日期选择（单选/范围/多选/周选）
- 日期范围选择器
- 带快捷选项的日历
- 需要弹窗或内联日历

## 组件路径

- 源码: `packages/__components/calendar/src/calendar.vue`
- 类型: `packages/__components/calendar/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| title | string | - | 日历标题 |
| height | string | '90vh' | 日历高度 |
| popupable | boolean | true | 是否使用弹窗模式 |
| popupType | string | 'popup' | popup类型：popup/popup-simple |
| show | boolean | false | 弹窗显示状态（双向绑定） |
| hideNode | boolean | true | 是否隐藏节点 |
| type | string | 'single' | 选择类型：single/range/multiple/week |
| firstDayOfWeek | 0-6 | 0 | 周起始日（0表示周日，1表示周一） |
| defaultDate | string/string[] | - | 默认选中日期 |
| hideOptions | boolean | false | 是否隐藏快捷选项 |
| options | object[] | - | 快捷选项配置 |
| startDate | string | - | 日历开始日期 |
| endDate | string | - | 日历结束日期 |
| allowSameDay | boolean | false | 是否允许选择同一天 |
| disabledDate | function | - | 日历禁用日期函数 |
| showTips | boolean | true | 是否显示提示 |
| showConfirm | boolean | true | 是否显示确认按钮 |
| safeAreaInsetTop | boolean | false | 是否保留顶部安全距离 |
| safeAreaInsetBottom | boolean | false | 是否保留底部安全距离 |
| startPlaceholder | string | '开始日期' | 开始日期占位文字 |
| endPlaceholder | string | '结束日期' | 结束日期占位文字 |

## Types 类型定义

```typescript
type CalendarDayType =
  | ''
  | 'start'
  | 'start-end'
  | 'middle'
  | 'end'
  | 'selected'
  | 'multiple-middle'
  | 'multiple-selected'
  | 'disabled'
  | 'placeholder'

type CalendarDayItem = {
  date?: Date
  text?: Numeric
  type?: CalendarDayType
  topInfo?: string
  className?: unknown
  bottomInfo?: string
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | 弹窗显示状态变化时触发 | (show: boolean) |
| select | 选择日期时触发 | (value: Date \| Date[]) |
| confirm | 确认选择时触发 | (value: Date \| Date[]) |
| close | 关闭弹窗时触发 | - |
| unselect | 取消选择时触发（多选模式） | (value: Date) |
| overRange | 超出日期范围时触发 | - |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| footer-tips | 底部提示区域 |

## 使用示例

```vue
<template>
  <!-- 单选模式 -->
  <ky-calendar
    v-model:show="show"
    type="single"
    @confirm="onConfirm"
  />

  <!-- 范围选择模式 -->
  <ky-calendar
    v-model:show="show"
    type="range"
    :allowSameDay="true"
    :default-date="defaultDate"
    @confirm="onConfirm"
  />

  <!-- 带快捷选项的范围选择 -->
  <ky-calendar
    v-model:show="show"
    type="range"
    :options="[
      { label: '近7天', value: [startDate, endDate] },
      { label: '近30天', value: [startDate30, endDate30] },
    ]"
    @confirm="onConfirm"
  />

  <!-- 多选模式 -->
  <ky-calendar
    v-model:show="show"
    type="multiple"
    @confirm="onConfirm"
  />

  <!-- 周选择模式 -->
  <ky-calendar
    v-model:show="show"
    type="week"
    @confirm="onConfirm"
  />

  <!-- 自定义标题和禁用日期 -->
  <ky-calendar
    v-model:show="show"
    title="选择日期"
    :disabledDate="disabledDateFn"
    @confirm="onConfirm"
  />
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)
const defaultDate = ['2025/05/01', '2025/05/15']

const onConfirm = (value) => {
  console.log('选择的日期:', value)
}

const disabledDateFn = (date) => {
  const disabledDates = {
    '2025-05-05': true,
    '2025-05-06': true,
  }
  return disabledDates[date]
}
</script>
```