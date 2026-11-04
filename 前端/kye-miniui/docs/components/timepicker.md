# TimePicker

<code-preview path="demos/timepicker/timepicker-1.vue" title="基本使用" description="时间选择器用法示例"></code-preview>

## 基本使用

通过 `v-model` 绑定选中的值，`v-model:show` 控制选择器的显示与隐藏。

```html
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  :min-date="minDate"
  :max-date="maxDate"
  @confirm="handleConfirm"
/>
```

```javascript
import { ref } from 'vue'

const showPicker = ref(false)
const value = ref(new Date())
const minDate = new Date(2021, 0, 1)
const maxDate = new Date(2035, 11, 31)

const handleConfirm = ({ selectedValue }, date) => {
  console.log('选中的值:', selectedValue)
  console.log('选中的日期:', date)
}
```

## 日期范围

通过 `min-date` 和 `max-date` 属性限制可选日期范围。

```html
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  :min-date="new Date(2024, 0, 1)"
  :max-date="new Date(2024, 11, 31)"
/>
```

## 列类型配置

通过 `columns-type` 属性自定义显示的日期列，支持多种组合方式。

```html
<!-- 年月日（默认） -->
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  :columns-type="['year', 'month', 'day']"
/>

<!-- 年月 -->
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  :columns-type="['year', 'month']"
/>
```

## 禁用弹出层

通过 `poppable` 属性设置为 `false`，选择器将直接嵌入页面而非弹出层形式。

```html
<ky-timepicker
  :poppable="false"
  v-model="value"
  title="选择日期"
  :columns-type="['year', 'month']"
  @confirm="handleConfirm"
/>
```

## 格式化选项

通过 `formatter` 属性自定义选项的显示格式。

```html
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  :formatter="formatter"
/>
```

```javascript
const formatter = (type, option) => {
  switch (type) {
    case 'year':
      option.text += '年'
      break
    case 'month':
      option.text += '月'
      break
    case 'day':
      option.text += '日'
      break
    default:
      option.text += ''
  }
  return option
}
```

## 选项过滤

通过 `filter` 属性过滤不需要的选项。

```html
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  :filter="filter"
/>
```

```javascript
const filter = (type, options) => {
  if (type === 'month') {
    return options.filter((option) => Number(option.value) % 2 === 0)
  }
  return options
}
```

## 3D 效果

通过 `threeDimensional` 属性控制是否启用 3D 滚动效果。

```html
<!-- 启用3D效果（默认） -->
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  three-dimensional
/>

<!-- 禁用3D效果 -->
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  :three-dimensional="false"
/>
```

## 关闭按钮

通过 `showClose` 属性控制是否显示关闭按钮。

```html
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  show-close
/>
```

## 插槽使用

支持多个插槽自定义选择器内容。

```html
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
>
  <template #confirm>
    <view class="custom-confirm">确认</view>
  </template>
  <template #cancel>
    <view class="custom-cancel">取消</view>
  </template>
  <template #columns-top>
    <view class="columns-top">请选择日期</view>
  </template>
  <template #empty>
    <view class="empty">暂无数据</view>
  </template>
</ky-timepicker>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| modelValue | 当前选中的值 | Date / Array | - | - |
| v-model:show | 是否显示选择器 | Boolean | - | false |
| minDate | 最小日期 | Date | - | 当前年份减10年 |
| maxDate | 最大日期 | Date | - | 当前年份加10年 |
| columnsType | 列类型 | Array | ['year', 'month', 'day'] | ['year', 'month', 'day'] |
| type | 快捷类型（推荐使用 columnsType） | string | date / year-month / month-day | date |
| title | 标题 | String | - | '标题' |
| confirmButtonText | 确认按钮文字 | String | - | - |
| cancelButtonText | 取消按钮文字 | String | - | - |
| threeDimensional | 是否启用3D效果 | Boolean | - | true |
| swipeDuration | 惯性滚动时长（ms） | Number / String | - | 1000 |
| showToolbar | 是否显示工具栏 | Boolean | - | true |
| visibleOptionNum | 可见选项数量 | Number / String | - | 7 |
| optionHeight | 选项高度（px） | Number / String | - | 36 |
| showClose | 是否显示关闭按钮 | Boolean | - | false |
| poppable | 是否启用弹出层 | Boolean | - | true |
| formatter | 选项格式化函数 | Function | - | - |
| filter | 选项过滤函数 | Function | - | - |

### Events

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| confirm | 点击确认按钮时触发 | ({ selectedValue }, date) |
| cancel | 点击取消按钮时触发 | - |
| close | 点击关闭按钮时触发 | - |
| change | 值变更时触发 | { selectedValue } |
| open | 选择器打开时触发 | value |
| update:modelValue | 值更新时触发 | date |
| update:show | 显示状态更新时触发 | show |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| confirm | 自定义确认按钮内容 |
| cancel | 自定义取消按钮内容 |
| columns-top | 自定义列顶部内容 |
| empty | 自定义空状态内容 |

#### 常见问题

#### Q1: 如何限制可选日期范围？

**使用 `min-date` 和 `max-date` 属性：**

```html
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  :min-date="new Date(2024, 0, 1)"
  :max-date="new Date(2024, 12, 31)"
/>
```

#### Q2: 如何自定义选项显示格式？

**使用 `formatter` 属性：**

```html
<ky-timepicker
  v-model:show="showPicker"
  v-model="value"
  :formatter="(type, option) => {
    if (type === 'year') option.text += '年'
    if (type === 'month') option.text += '月'
    return option
  }"
/>
```

#### Q3: 如何嵌入页面而非弹出层？

**设置 `poppable` 为 `false`：**

```html
<ky-timepicker
  :poppable="false"
  v-model="value"
  title="选择日期"
/>
```