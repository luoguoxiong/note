# 日期组件：calendar-range

## Props

| 参数         | 说明                                     | 类型              | 默认值             |
| ------------ | ---------------------------------------- | ----------------- | ------------------ | ---- | ---- |
| v-model      | 是否显示日期组件                         | Boolean           | false              |
| default-date | 默认选中的日期, 传入 null 表示默认不选择 | Date              | Date[]             | null | null |
| min-date     | 可选择的最小日期                         | Date              | 当前日期           |
| min-date     | 可选择的最大日期                         | Date              | 当前日期的六个月后 |

```html
<h1 @click="show = true">点我触发日期组件弹窗</h1>

<calendar-range
  v-model="show"
  :default-date="defaultDate"
  :min-date="minDate"
  :max-date="maxDate"
  @confirm="onConfirm"
/>
```

## Event

| 事件名         | 说明       | 回调参数 |
| -------------- | ---------- | -------- |
| confirmDateVal | 获得日期值 | ——       |
