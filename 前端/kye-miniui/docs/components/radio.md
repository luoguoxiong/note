# Radio

<code-preview path="demos/radio/radio-1.vue" title="基本使用" description="单选框组件，用于在一组选项中选择单个选项"></code-preview>

## 基本使用

Radio 组件用于在一组选项中选择单个选项，通常配合 RadioGroup 使用。

```html
<ky-radio-group v-model="value">
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2">选项二</ky-radio>
  <ky-radio name="3">选项三</ky-radio>
</ky-radio-group>
```

```javascript
import { ref } from 'vue'

const value = ref('1')
```

## 排列方向

支持水平和垂直两种排列方向。

```html
<!-- 垂直排列（默认） -->
<ky-radio-group v-model="value">
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2">选项二</ky-radio>
</ky-radio-group>

<!-- 水平排列 -->
<ky-radio-group v-model="value" direction="horizontal">
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2">选项二</ky-radio>
</ky-radio-group>
```

## 展示类型

支持多种展示类型，满足不同场景需求。

```html
<!-- 圆形单选框（默认） -->
<ky-radio-group v-model="value">
  <ky-radio name="1" type="round">圆形</ky-radio>
</ky-radio-group>

<!-- 勾选框类型 -->
<ky-radio-group v-model="value">
  <ky-radio name="1" type="check">勾选</ky-radio>
</ky-radio-group>

<!-- 按钮类型 -->
<ky-radio-group v-model="value" direction="horizontal">
  <ky-radio name="1" type="button">按钮</ky-radio>
  <ky-radio name="2" type="button">按钮</ky-radio>
</ky-radio-group>

<!-- 按钮勾选类型 -->
<ky-radio-group v-model="value" direction="horizontal">
  <ky-radio name="1" type="buttonCheck">按钮勾选</ky-radio>
  <ky-radio name="2" type="buttonCheck">按钮勾选</ky-radio>
</ky-radio-group>

<!-- 按钮选择类型 -->
<ky-radio-group v-model="value" direction="horizontal">
  <ky-radio name="1" type="buttonSelect">按钮选择</ky-radio>
  <ky-radio name="2" type="buttonSelect">按钮选择</ky-radio>
</ky-radio-group>
```

## 尺寸大小

支持多种尺寸大小。

```html
<ky-radio-group v-model="value" size="large">
  <ky-radio name="1">大尺寸</ky-radio>
</ky-radio-group>

<ky-radio-group v-model="value" size="medium">
  <ky-radio name="1">中等尺寸</ky-radio>
</ky-radio-group>

<ky-radio-group v-model="value" size="normal">
  <ky-radio name="1">正常尺寸</ky-radio>
</ky-radio-group>

<ky-radio-group v-model="value" size="small">
  <ky-radio name="1">小尺寸</ky-radio>
</ky-radio-group>

<ky-radio-group v-model="value" size="mini">
  <ky-radio name="1">迷你尺寸</ky-radio>
</ky-radio-group>
```

## 禁用状态

通过 `disabled` 属性禁用单选框。

```html
<!-- 禁用整个组 -->
<ky-radio-group v-model="value" disabled>
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2">选项二</ky-radio>
</ky-radio-group>

<!-- 禁用单个选项 -->
<ky-radio-group v-model="value">
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2" disabled>选项二（禁用）</ky-radio>
</ky-radio-group>
```

## 错误状态

通过 `is-error` 属性标记错误状态。

```html
<ky-radio-group v-model="value">
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2" is-error>选项二（错误）</ky-radio>
</ky-radio-group>
```

## 标签位置

通过 `label-position` 属性设置标签位置。

```html
<!-- 标签在右侧（默认） -->
<ky-radio name="1">标签在右侧</ky-radio>

<!-- 标签在左侧 -->
<ky-radio name="1" label-position="left">标签在左侧</ky-radio>
```

## 选中高亮

通过 `checked-highlight` 属性启用选中高亮样式。

```html
<ky-radio-group v-model="value" checked-highlight>
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2">选项二</ky-radio>
</ky-radio-group>
```

## 自定义图标

通过 `icon` 插槽自定义选中图标。

```html
<ky-radio-group v-model="value">
  <ky-radio name="1">
    <template #icon>
      <img src="https://example.com/icon.png" alt="" />
    </template>
    自定义图标
  </ky-radio>
</ky-radio-group>
```

## 监听事件

通过 `@change` 事件监听值变化。

```html
<ky-radio-group v-model="value" @change="onChange">
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2">选项二</ky-radio>
</ky-radio-group>
```

```javascript
const onChange = (value) => {
  console.log('选中值:', value)
}
```

## 组件 API

### Attributes

| 参数             | 说明                                    | 类型                                                              | 可选值   | 默认值 |
| ---------------- | --------------------------------------- | ----------------------------------------------------------------- | -------- | ------ |
| name             | 选项值（与 RadioGroup 的 v-model 对应） | string \| boolean                                                 | -        | -      |
| type             | 展示类型                                | 'round' \| 'check' \| 'button' \| 'buttonCheck' \| 'buttonSelect' | round    |
| direction        | 方向                                    | 'vertical' \| 'horizontal'                                        | vertical |
| size             | 尺寸                                    | 'large' \| 'medium' \| 'normal' \| 'small' \| 'mini'              | normal   |
| disabled         | 是否禁用                                | boolean                                                           | -        | false  |
| checked          | 是否选中（独立使用时的样式控制）        | boolean                                                           | -        | false  |
| isError          | 错误态样式                              | boolean                                                           | -        | false  |
| labelPosition    | 文案位置                                | 'left' \| 'right'                                                 | right    |
| iconSize         | 图标尺寸（像素）                        | number                                                            | -        | -      |
| checkedHighlight | 选中高亮样式                            | boolean                                                           | -        | false  |
| checkedColor     | 选中颜色                                | string                                                            | -        | -      |
| manualUpdate     | 手动更新模式（不自动更新选中状态）      | boolean                                                           | -        | false  |

### Events

| 事件名 | 说明                       | 回调参数     |
| ------ | -------------------------- | ------------ |
| click  | 点击单选项时触发           | -            |
| change | 值变化时触发（RadioGroup） | (value: any) |

### Slots

| 插槽名  | 说明         | 参数                 |
| ------- | ------------ | -------------------- |
| default | 选项文本内容 | -                    |
| icon    | 自定义图标   | { checked: boolean } |

## 常见问题

### Q1: 如何获取选中值？

**通过 v-model 双向绑定：**

```html
<ky-radio-group v-model="selectedValue">
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2">选项二</ky-radio>
</ky-radio-group>
```

```javascript
const selectedValue = ref('1')
console.log(selectedValue.value) // 获取选中值
```

### Q2: 如何监听选中变化？

**使用 change 事件：**

```html
<ky-radio-group v-model="value" @change="handleChange">
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2">选项二</ky-radio>
</ky-radio-group>
```

```javascript
const handleChange = (value) => {
  console.log('选中:', value)
}
```

### Q3: 如何实现表单校验？

**结合错误状态：**

```html
<ky-radio-group v-model="value">
  <ky-radio name="1">选项一</ky-radio>
  <ky-radio name="2" :is-error="!value">请选择选项</ky-radio>
</ky-radio-group>
```

### Q4: 如何自定义图标？

**使用 icon 插槽：**

```html
<ky-radio name="1">
  <template #icon>
    <view class="custom-icon">✓</view>
  </template>
  自定义图标
</ky-radio>
```

```scss
.custom-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4ecdc4;
  border-radius: 50%;
  color: #fff;
  font-size: 14px;
}
```
