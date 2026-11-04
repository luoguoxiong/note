# Switch

<code-preview path="demos/switch/switch-1.vue" title="基本使用" description="用于在两种状态之间进行切换"></code-preview>

## 基本使用

通过 `v-model` 双向绑定开关状态。

```html
<ky-switch v-model="value" @change="onChange" />
```

```javascript
const value = ref(true)

const onChange = (value) => {
  console.log('开关状态变化:', value)
}
```

## 禁用状态

通过 `disabled` 属性禁用开关。

```html
<!-- 禁用 - 开启状态 -->
<ky-switch v-model="value" disabled />

<!-- 禁用 - 关闭状态 -->
<ky-switch v-model="value2" disabled />
```

## 自定义颜色

通过 `active-color` 和 `inactive-color` 属性自定义开关颜色。

```html
<!-- 自定义激活颜色 -->
<ky-switch v-model="value" active-color="#FF706D" />

<!-- 自定义非激活颜色 -->
<ky-switch v-model="value" inactive-color="#D0D0D0" />

<!-- 双向自定义颜色 -->
<ky-switch v-model="value" active-color="#00C58C" inactive-color="#E8F5F0" />
```

## 开关尺寸

支持多种尺寸，通过 `size` 属性设置。

```html
<ky-switch v-model="value" size="large" />
<ky-switch v-model="value" size="medium" />
<ky-switch v-model="value" size="normal" />
<ky-switch v-model="value" size="small" />
<ky-switch v-model="value" size="mini" />
```

## Checkbox 类型

通过 `type` 属性设置为 checkbox 类型。

```html
<!-- Checkbox 样式 -->
<ky-switch v-model="value" type="checkbox" />

<!-- Checkbox 自定义颜色 -->
<ky-switch v-model="value" type="checkbox" active-color="#FF706D" />
```

## 自定义值

通过 `active-value` 和 `inactive-value` 属性自定义开关的值。

```html
<ky-switch
  v-model="status"
  :active-value="'ON'"
  :inactive-value="'OFF'"
  @change="onChange"
/>
```

```javascript
const status = ref('ON')

const onChange = (value) => {
  console.log('值变化:', value)
}
```

## 加载状态

通过 `loading` 属性设置加载状态，支持自定义加载图标。

```html
<!-- 加载中 -->
<ky-switch v-model="value" loading />

<!-- 自定义加载图标 -->
<ky-switch v-model="value" loading>
  <template #icon>
    <view class="custom-loading">...</view>
  </template>
</ky-switch>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| color | 开关颜色 | string | - | '#8365f6' |
| type | 开关类型 | string | 'switch', 'checkbox' | 'switch' |
| size | 开关尺寸 | string | 'large', 'medium', 'normal', 'small', 'mini' | 'medium' |
| disabled | 是否禁用 | boolean | - | false |
| checked | 是否选中（不推荐，建议使用 v-model） | boolean | - | - |
| modelValue | 开关当前值（与 activeValue/inactiveValue 对应） | string / number / boolean | - | false |
| loading | 是否加载中 | boolean | - | false |
| activeValue | 打开时的值 | string / number / boolean | - | true |
| inactiveValue | 关闭时的值 | string / number / boolean | - | false |
| activeColor | 打开时的背景色 | string | - | '#8365F6' |
| inactiveColor | 关闭时的背景色 | string | - | '#E6E8ED' |

### Events

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| change | 开关状态变化时触发 | (value: string / number / boolean, event: Event) |
| update:modelValue | 双向数据绑定返回值 | (value: string / number / boolean) |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| icon | 自定义加载图标 |