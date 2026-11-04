# Calendar

日历组件，支持单选、范围选择、多选和周选择模式。

<template #code>
  <code-preview path="demos/calendar/calendar-1.vue" title="基本使用" description="多种日期选择模式示例"></code-preview>
</template>

## 单选模式

设置 `type="single"` 可以选择单个日期。

```html
<ky-calendar
  v-model:show="show"
  type="single"
  :popupable="true"
  @confirm="onConfirm"
></ky-calendar>
```

## 范围选择

设置 `type="range"` 可以选择日期范围。

```html
<ky-calendar
  v-model:show="show"
  type="range"
  :popupable="true"
  :allowSameDay="true"
  @confirm="onConfirm"
></ky-calendar>
```

## 快捷选项

通过 `options` 属性配置快捷选项，方便用户快速选择常用日期范围。

```html
<ky-calendar
  v-model:show="show"
  type="range"
  :popupable="true"
  :allowSameDay="true"
  :options="[
    { label: '近7天', value: getDateRange(7), key: 'last7' },
    { label: '近30天', value: getDateRange(30), key: 'last30' },
    { label: '近60天', value: getDateRange(60), key: 'last60' },
    { label: '近180天', value: getDateRange(180), key: 'last180' },
    { label: '近1年', value: getDateRange(365), key: 'last365' },
  ]"
  @confirm="onConfirm"
>
  <template #footer-tips>自定义提示信息</template>
</ky-calendar>
```

```javascript
const getDateRange = (days) => {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - days + 1)
  return [startDate.getTime(), endDate.getTime()]
}
```

## 多选模式

设置 `type="multiple"` 可以选择多个日期。

```html
<ky-calendar
  v-model:show="show"
  type="multiple"
  :popupable="true"
  @confirm="onConfirm"
></ky-calendar>
```

## 周选择模式

设置 `type="week"` 可以按周选择日期。

```html
<ky-calendar
  v-model:show="show"
  type="week"
  :popupable="true"
  @confirm="onConfirm"
></ky-calendar>
```

## 禁用日期

通过 `disabledDate` 属性设置禁用日期。

```html
<ky-calendar
  v-model:show="show"
  type="single"
  :popupable="true"
  :disabledDate="disabledDateFn"
  @confirm="onConfirm"
></ky-calendar>
```

```javascript
const disabledDateFn = (date) => {
  const disabledDates = {
    '2025-05-05': true,
    '2025-05-06': true,
    '2025-05-10': true,
    '2025-05-11': true,
    '2025-05-12': true,
    '2025-05-13': true,
    '2025-05-14': true,
  }
  return disabledDates[date]
}
```

## 自定义配置

可以自定义标题、高度、是否显示提示和确认按钮等。

```html
<ky-calendar
  v-model:show="show"
  type="single"
  title="自定义日历标题"
  height="50vh"
  :showTips="false"
  :showConfirm="false"
  :popupable="true"
  @confirm="onConfirm"
></ky-calendar>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| show | 是否显示日历弹窗 | boolean | - | false |
| popupable | 是否使用弹窗模式 | boolean | - | true |
| popupType | 弹窗类型 | string | popup / popup-simple | popup |
| hideNode | 是否隐藏节点 | boolean | - | true |
| title | 标题 | string | - | - |
| height | 高度 | string | - | 90vh |
| type | 日期类型 | string | single / range / multiple / week | single |
| firstDayOfWeek | 周起始日 | number | 0-6 | 0 |
| defaultDate | 默认选中日期值 | string / string[] | - | - |
| hideOptions | 隐藏快捷选项 | boolean | - | false |
| options | 快捷选项 | Array | - | - |
| startDate | 日历开始日期 | string | - | - |
| endDate | 日历结束日期 | string | - | - |
| allowSameDay | 是否允许选择同一天 | boolean | - | false |
| disabledDate | 日历禁用日期函数 | Function | - | - |
| showTips | 是否展示提示信息 | boolean | - | true |
| showConfirm | 是否展示确认按钮 | boolean | - | true |
| safeAreaInsetTop | 是否保留顶部安全距离 | boolean | - | false |
| safeAreaInsetBottom | 是否保留底部安全距离 | boolean | - | false |
| startPlaceholder | 开始日期占位符 | string | - | 开始日期 |
| endPlaceholder | 结束日期占位符 | string | - | 结束日期 |

### Events

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| update:show | 更新显示状态 | (value: boolean) => void |
| close | 关闭日历时触发 | - |
| select | 选择日期时触发 | (date: Date \| Date[]) => void |
| unselect | 取消选择时触发（多选模式） | (date: Date) => void |
| overRange | 超出日期范围时触发 | - |
| confirm | 点击确认按钮时触发 | (date: Date \| Date[]) => void |

### Slots

| 名称 | 说明 |
| ---- | ---- |
| footer-tips | 底部提示信息 |