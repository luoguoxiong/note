# Checkbox

<code-preview path="demos/checkbox/checkbox-1.vue" title="基本使用" description="各种复选框用法示例"></code-preview>

## 基本使用

### 单独使用

通过 `v-model` 绑定复选框的勾选状态。

```html
<ky-checkbox name="1" v-model="valSingle">选项一</ky-checkbox>
<ky-checkbox name="2" v-model="valSingle2">选项二</ky-checkbox>
```

```javascript
const valSingle = ref(true)
const valSingle2 = ref(false)
```

### 复选框组

通过 `checkbox-group` 组件和 `v-model` 绑定复选框组的勾选状态。

```html
<ky-checkbox-group v-model="val" @change="onChange">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
  <ky-checkbox name="3">选项三</ky-checkbox>
</ky-checkbox-group>
```

```javascript
const val = ref(['1'])

const onChange = (value) => {
  console.log('选中的值:', value)
}
```

## 排列方向

支持垂直和水平两种排列方向。

```html
<!-- 垂直排列（默认） -->
<ky-checkbox-group v-model="val">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
</ky-checkbox-group>

<!-- 水平排列 -->
<ky-checkbox-group v-model="val" direction="horizontal">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
</ky-checkbox-group>
```

## 样式类型

支持多种样式类型，满足不同场景需求。

```html
<!-- round 类型（默认） -->
<ky-checkbox-group v-model="val" type="round">
  <ky-checkbox name="1">选项一</ky-checkbox>
</ky-checkbox-group>

<!-- check 类型 -->
<ky-checkbox-group v-model="val" type="check">
  <ky-checkbox name="1">选项一</ky-checkbox>
</ky-checkbox-group>

<!-- button 类型 -->
<ky-checkbox-group v-model="val" type="button" checkedHighlight>
  <ky-checkbox name="1">选项一</ky-checkbox>
</ky-checkbox-group>

<!-- buttonCheck 类型 -->
<ky-checkbox-group v-model="val" type="buttonCheck">
  <ky-checkbox name="1">选项一</ky-checkbox>
</ky-checkbox-group>

<!-- buttonSelect 类型 -->
<ky-checkbox-group v-model="val" type="buttonSelect">
  <ky-checkbox name="1">选项一</ky-checkbox>
</ky-checkbox-group>
```

## 禁用状态

通过 `disabled` 属性禁用复选框，禁用状态下复选框不可点击。

```html
<!-- 组禁用 -->
<ky-checkbox-group v-model="val" disabled>
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
</ky-checkbox-group>

<!-- 单个禁用 -->
<ky-checkbox-group v-model="val">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2" disabled>选项二（禁用）</ky-checkbox>
</ky-checkbox-group>
```

## 尺寸大小

通过 `size` 属性设置复选框的尺寸。

```html
<ky-checkbox-group v-model="val" direction="horizontal">
  <ky-checkbox name="1" size="large">large</ky-checkbox>
  <ky-checkbox name="2" size="normal">normal</ky-checkbox>
  <ky-checkbox name="3" size="small">small</ky-checkbox>
</ky-checkbox-group>
```

## 错误状态

通过 `is-error` 属性标记错误状态。

```html
<ky-checkbox-group v-model="val" is-error>
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
</ky-checkbox-group>
```

## 文本位置

通过 `label-position` 属性设置文本位置。

```html
<!-- 左侧文本 -->
<ky-checkbox name="1" label-position="left">选项一</ky-checkbox>

<!-- 右侧文本（默认） -->
<ky-checkbox name="1">选项一</ky-checkbox>
```

## 单选模式

通过 `singleMode` 属性开启单选模式，此时复选框组只允许选中一个选项。

```html
<ky-checkbox-group v-model="val" :singleMode="true">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
  <ky-checkbox name="3">选项三</ky-checkbox>
</ky-checkbox-group>
```

## 自定义图标

通过 `icon` 插槽自定义复选框图标，可以根据复选框的选中状态展示不同的图标。

```html
<ky-checkbox-group v-model="val" type="button">
  <ky-checkbox icon-size="24px" name="1">
    <template #icon="componentItem">
      <image
        :src="
          componentItem.checked
            ? 'https://ic-img.ky-express.com/netc/20230317_2136386928_!!1679035220381_64_64.png'
            : 'https://ic-img.ky-express.com/netc/20230317_26163869242_!!1679035216961_64_64.png'
        "
      />
    </template>
    选项一
  </ky-checkbox>
</ky-checkbox-group>
```

## 方法调用

通过 `ref` 调用组件方法实现全选、取消全选和反选功能。

```html
<ky-checkbox-group v-model="val" ref="checkboxGroupRef">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
  <ky-checkbox name="3">选项三</ky-checkbox>
</ky-checkbox-group>

<ky-button @click="selectAll">全选</ky-button>
<ky-button @click="cancelAll">取消全选</ky-button>
<ky-button @click="reverseAll">反选</ky-button>
```

```javascript
const checkboxGroupRef = ref(null)

const selectAll = () => {
  checkboxGroupRef.value?.toggleAll(true)
}

const cancelAll = () => {
  checkboxGroupRef.value?.toggleAll(false)
}

const reverseAll = () => {
  checkboxGroupRef.value?.toggleReverse()
}
```

## 组件 API

### Checkbox Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| modelValue | 是否选中 | boolean | - | false |
| name | 标识符，通常为唯一值 | string / number | - | '' |
| type | 复选框类型 | string | round / check / button / buttonCheck / buttonSelect | round |
| disabled | 是否禁用 | boolean | - | false |
| size | 尺寸 | string | large / medium / normal / small / mini | normal |
| isError | 是否为错误状态 | boolean | - | false |
| labelPosition | 文本位置 | string | left / right | right |
| iconSize | 图标尺寸 | number / string | - | - |

### CheckboxGroup Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| modelValue | 当前选中的值 | array | - | [] |
| direction | 排列方向 | string | vertical / horizontal | vertical |
| size | 尺寸 | string | large / medium / normal / small / mini | normal |
| type | 复选框类型 | string | round / check / button / buttonCheck / buttonSelect | round |
| disabled | 是否禁用 | boolean | - | false |
| iconSize | 图标尺寸 | number / string | - | 20px |
| max | 最大可选数，0 为无限制 | number | - | 0 |
| isError | 是否为错误状态 | boolean | - | false |
| checkedHighlight | 选中时是否高亮 | boolean | - | false |
| singleMode | 是否开启单选模式 | boolean | - | false |

### Methods

| 方法名 | 说明 | 参数 | 返回值 |
| ---- | ---- | ---- | ---- |
| toggleAll | 全选或取消全选 | checked: boolean | - |
| toggleReverse | 反选 | - | - |

### Events

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| change | 复选框状态变化时触发 | value: array |
| click | 点击复选框时触发 | name: string / number, event: Event |

### Slots

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 复选框文本内容 | - |
| icon | 自定义图标 | checked: boolean |

### 常见问题

#### Q1: 如何实现全选/反选功能？

**通过 ref 调用方法：**

```html
<ky-checkbox-group v-model="val" ref="checkboxGroupRef">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
</ky-checkbox-group>
```

```javascript
const checkboxGroupRef = ref(null)

// 全选
checkboxGroupRef.value?.toggleAll(true)

// 取消全选
checkboxGroupRef.value?.toggleAll(false)

// 反选
checkboxGroupRef.value?.toggleReverse()
```

#### Q2: 如何限制最大可选数量？

**使用 `max` 属性：**

```html
<ky-checkbox-group v-model="val" :max="2">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
  <ky-checkbox name="3">选项三</ky-checkbox>
</ky-checkbox-group>
```

> `max` 值为 `0` 时表示不限制（默认）。

#### Q3: 如何实现单选模式？

**设置 `singleMode` 属性为 `true`：**

```html
<ky-checkbox-group v-model="val" :singleMode="true">
  <ky-checkbox name="1">选项一</ky-checkbox>
  <ky-checkbox name="2">选项二</ky-checkbox>
</ky-checkbox-group>
```

开启单选模式后，每次只能选中一个选项。

#### Q4: 如何自定义复选框图标？

**使用 `icon` 插槽：**

```html
<ky-checkbox name="1">
  <template #icon="componentItem">
    <view :class="['custom-icon', { checked: componentItem.checked }]">
      {{ componentItem.checked ? '✓' : '' }}
    </view>
  </template>
  选项一
</ky-checkbox>
```

插槽参数 `componentItem.checked` 表示当前复选框是否选中。