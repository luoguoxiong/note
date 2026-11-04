# Picker

选择器组件，支持单列选择、多级联动、自定义插槽等功能。

<template #code>
  <code-preview path="demos/picker/picker-1.vue" title="基本使用" description="多种选择器用法示例"></code-preview>
</template>

## 基本使用

支持单列数据选择。

```html
<ky-picker
  v-model="value"
  v-model:show="show"
  title="城市选择"
  :columns="columns"
  @confirm="onConfirm"
></ky-picker>
```

```javascript
const show = ref(false)
const value = ref([])
const columns = ref([
  { text: '南京', value: '南京' },
  { text: '无锡', value: '无锡' },
  { text: '北京', value: '北京' },
  { text: '上海', value: '上海' },
])

const onConfirm = ({ selectedValue }) => {
  value.value = selectedValue
}
```

## 多级联动

通过 `children` 属性实现多级联动选择。

```html
<ky-picker
  v-model="value"
  v-model:show="show"
  title="省市区选择"
  :columns="columns"
  @confirm="onConfirm"
></ky-picker>
```

```javascript
const columns = ref([
  {
    text: '江苏',
    value: '江苏',
    children: [
      {
        text: '南京',
        value: '南京',
        children: [
          { text: '栖霞区', value: '栖霞区' },
          { text: '鼓楼区', value: '鼓楼区' },
        ],
      },
      {
        text: '苏州',
        value: '苏州',
        children: [
          { text: '姑苏区', value: '姑苏区' },
          { text: '吴江区', value: '吴江区' },
        ],
      },
    ],
  },
])
```

## 自定义配置

支持自定义标题和按钮文字。

```html
<ky-picker
  v-model="value"
  v-model:show="show"
  title="自定义标题"
  confirm-button-text="确定"
  cancel-button-text="取消"
  :columns="columns"
  @confirm="onConfirm"
></ky-picker>
```

## 自定义插槽

支持多个自定义插槽，包括确认按钮、取消按钮、列顶部、列底部和空状态。

```html
<ky-picker
  v-model="value"
  v-model:show="show"
  title="自定义插槽"
  :columns="columns"
  @confirm="onConfirm"
>
  <template #confirm>
    <view>自定义确认</view>
  </template>
  <template #cancel>
    <view>自定义取消</view>
  </template>
  <template #columns-top>
    <view>列顶部内容</view>
  </template>
  <template #columns-bottom>
    <view>列底部内容</view>
  </template>
  <template #empty>
    <img src="empty.png" />
  </template>
</ky-picker>
```

## 加载状态

通过 `loading` 属性展示加载状态。

```html
<ky-picker
  v-model:show="show"
  title="加载中..."
  :loading="true"
  :columns="[]"
></ky-picker>
```

## 设置默认值

通过 `v-model` 设置默认选中值。

```html
<ky-picker
  v-model="value"
  v-model:show="show"
  title="默认值演示"
  :columns="columns"
  @confirm="onConfirm"
></ky-picker>
```

```javascript
const value = ref(['北京'])
```

## 内联模式

设置 `poppable=false` 可以让选择器直接展示在页面中，而不是以弹窗形式出现。

```html
<ky-picker
  v-model="value"
  :poppable="false"
  title="内联选择器"
  :columns="columns"
  @confirm="onConfirm"
>
  <template #columns-bottom>
    <view class="inline-footer">
      <button @click="onConfirm({ selectedValue: [value] })">确认</button>
    </view>
  </template>
</ky-picker>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| v-model | 当前选中的值 | Array | - | [] |
| v-model:show | 是否显示选择器 | Boolean | - | false |
| title | 顶部标题 | String | - | "标题" |
| columns | 列数据 | Array | - | [] |
| confirm-button-text | 确认按钮文字 | String | - | "确认" |
| cancel-button-text | 取消按钮文字 | String | - | "取消" |
| show-toolbar | 是否显示顶部栏 | Boolean | - | true |
| option-height | 选项高度（单位：px） | Number | - | 36 |
| visible-option-num | 可见选项数量 | Number | - | 7 |
| loading | 是否显示加载状态 | Boolean | - | false |
| show-close | 是否显示关闭按钮 | Boolean | - | false |
| poppable | 是否启用弹出层 | Boolean | - | true |
| three-dimensional | 是否启用3D效果 | Boolean | - | false |

### Events

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| change | 选项改变时触发 | `{ columnIndex, selectedOptions, selectedValue }` |
| confirm | 点击确认按钮时触发 | `{ selectedValue, selectedOptions }` |
| cancel | 点击取消按钮时触发 | - |
| close | 点击关闭按钮时触发 | - |
| update:modelValue | 值更新时触发 | - |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| confirm | 自定义确认按钮内容 |
| cancel | 自定义取消按钮内容 |
| columns-top | 自定义列顶部内容 |
| columns-bottom | 自定义列底部内容 |
| empty | 自定义空状态内容 |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
| ------ | ---- | ---- | ------ |
| confirm | 确认选择 | - | void |
| cancel | 取消选择 | - | void |