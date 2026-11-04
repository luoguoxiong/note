# Field

<code-preview path="demos/field/field-1.vue" title="基本使用" description="表单字段组件的各种用法示例"></code-preview>

Field 是表单输入、展示及校验的基础字段组件，内置 `ky-input`，支持表单联动、校验提示、Popover 错误提示等功能。

## 基本使用

```html
<ky-field label="姓名" placeholder="请输入内容" v-model="value" />
```

## Label 布局

支持两种 label 位置布局：

```html
<!-- 默认 top -->
<ky-field label="手机号码" :required="true" v-model="formData.tels" placeholder="请输入" />

<!-- left 布局 -->
<ky-field
  label="手机号码"
  labelPosition="left"
  :labelWidth="100"
  :required="true"
  v-model="formData.tels"
  placeholder="请输入"
/>
```

## labelAlign

仅在 `labelPosition="left"` 时生效。

```html
<ky-field label="左对齐" labelPosition="left" labelAlign="left" :labelWidth="100" v-model="value" />

<ky-field label="居中" labelPosition="left" labelAlign="center" :labelWidth="100" v-model="value" />

<ky-field label="右对齐" labelPosition="left" labelAlign="right" :labelWidth="100" v-model="value" />
```

## 格式化输入

通过 `formatter` 对输入内容进行处理。

```html
<ky-field label="名称" placeholder="请输入内容" v-model="value" :formatter="(v) => v?.replace('测试', '')" />
```

## 错误状态

```html
<ky-field label="名称" placeholder="请输入内容" v-model="value" :isError="true" />
```

## 只读模式

```html
<ky-field label="订单号" readonly v-model="orderNo" />
```

当值为空时，展示 `placeholder`。

## 可清空

```html
<ky-field label="姓名" clearable v-model="name" />
```

## 禁用状态

```html
<ky-field label="手机号" disabled v-model="mobile" />
```

## 自定义输入组件

通过 `input` 插槽可接入任意表单组件。

### 单选

```html
<ky-field labelPosition="left" :required="true" label="单选类型" :labelWidth="100">
  <template #input>
    <ky-radio-group v-model="radio" direction="horizontal">
      <ky-radio name="1">单票</ky-radio>
      <ky-radio name="2">批量</ky-radio>
    </ky-radio-group>
  </template>
</ky-field>
```

### 多选

```html
<ky-field labelPosition="left" :required="true" label="多选类型" :labelWidth="100">
  <template #input>
    <ky-checkbox-group v-model="checkbox" direction="horizontal">
      <ky-checkbox name="1" type="button"> option 1 </ky-checkbox>
      <ky-checkbox name="2" type="button"> option 2 </ky-checkbox>
    </ky-checkbox-group>
  </template>
</ky-field>
```

### 文本域

```html
<ky-field labelPosition="left" :required="true" label="文本类型" :labelWidth="100">
  <template #input>
    <ky-textarea placeholder="请输入文本" v-model="textarea" :maxlength="150" />
  </template>
</ky-field>
```

## 自定义 input 插槽参数

`input` 插槽会暴露以下参数：

| 参数    | 说明             |
| ------- | ---------------- |
| value   | 当前字段值       |
| isError | 当前是否错误状态 |
| update  | 更新字段值的方法 |

```html
<ky-field v-model="value">
  <template #input="{ value, update, isError }">
    <custom-input :value="value" :error="isError" @change="update" />
  </template>
</ky-field>
```

# Popover 错误提示

组件支持自动展示错误 Popover。

通常配合 `ky-form` 使用。

```html
<ky-field prop="mobile" label="手机号" v-model="form.mobile" />
```

## 隐藏 Popover

```html
<ky-field hiddenPopover label="姓名" v-model="name" />
```

隐藏后，将以下方文本形式展示错误信息。

## 自定义 Popover 配置

```html
<ky-field
  label="姓名"
  v-model="name"
  :popoverConfig="{
    placement: 'top-start',
    offset: [0, 8],
    content: '请输入姓名'
  }"
/>
```

# 组件 API

### Attributes

| 参数              | 说明                       | 类型                        | 可选值                                    | 默认值                                      |
| ----------------- | -------------------------- | --------------------------- | ----------------------------------------- | ------------------------------------------- |
| modelValue        | 绑定值                     | string                      | -                                         | ''                                          |
| label             | 标签文本                   | string                      | -                                         | -                                           |
| placeholder       | 占位文本                   | string                      | -                                         | -                                           |
| prop              | 表单字段 key               | string                      | -                                         | -                                           |
| size              | 输入框尺寸                 | string                      | large / medium / normal / small / mini    | normal                                      |
| type              | 输入类型                   | string                      | text / number / digit / idcard / textarea | text                                        |
| disabled          | 是否禁用                   | boolean                     | -                                         | false                                       |
| readonly          | 是否只读                   | boolean                     | -                                         | false                                       |
| required          | 是否必填                   | boolean                     | -                                         | false                                       |
| clearable         | 是否显示清空按钮           | boolean                     | -                                         | true                                        |
| maxlength         | 最大输入长度               | number                      | -                                         | -                                           |
| border            | 边框模式                   | string                      | all / bottom / none                       | all                                         |
| isError           | 是否错误状态               | boolean                     | -                                         | false                                       |
| formatter         | 输入格式化函数             | `(value: string) => string` | -                                         | -                                           |
| labelPosition     | label 位置                 | string                      | top / left                                | top                                         |
| labelAlign        | label 对齐方式             | string                      | left / center / right                     | left                                        |
| labelWidth        | label 宽度                 | string / number             | -                                         | -                                           |
| textAlign         | 输入内容对齐               | string                      | left / center / right                     | left                                        |
| hiddenPopover     | 是否隐藏错误 Popover       | boolean                     | -                                         | false                                       |
| popoverConfig     | Popover 配置               | object                      | -                                         | `{ placement: 'top-start', offset: [0,4] }` |
| listenClickId     | Popover 点击监听 id        | string                      | -                                         | order-page                                  |
| enableNative      | 是否启用原生 input         | boolean                     | -                                         | true                                        |
| enableWxNative    | 是否启用微信原生 input     | boolean                     | -                                         | false                                       |
| customPlaceholder | 是否自定义 placeholder     | boolean                     | -                                         | false                                       |
| clearDisplaySpace | 清空时是否移除空格         | boolean                     | -                                         | false                                       |
| cursorSpacing     | 键盘与输入框间距           | number                      | -                                         | 0                                           |
| inputDebounce     | input 防抖时间             | number                      | -                                         | -                                           |
| adjustPosition    | 键盘弹起时是否自动顶起页面 | boolean                     | -                                         | true                                        |

### Events

| 事件名               | 说明             | 回调参数                                |
| -------------------- | ---------------- | --------------------------------------- |
| update:modelValue    | 更新值时触发     | `(value: string) => void`               |
| input                | 输入时触发       | `(value: string, event: Event) => void` |
| change               | 值变更时触发     | `(value: string) => void`               |
| focus                | 获取焦点时触发   | `(event: Event) => void`                |
| blur                 | 失去焦点时触发   | `(event: Event) => void`                |
| confirm              | 点击键盘完成按钮 | `(value: string) => void`               |
| clear                | 清空时触发       | `() => void`                            |
| click                | 点击内容区域     | `(event: Event) => void`                |
| keyboardHeightChange | 键盘高度变化     | `(event: Event) => void`                |

### Slots

| 插槽名   | 说明           |
| -------- | -------------- |
| label    | 自定义 label   |
| required | 自定义必填标识 |
| input    | 自定义输入区域 |
| right    | 输入框右侧内容 |

### Expose

| 名称     | 说明               |
| -------- | ------------------ |
| inputRef | 内部 ky-input 实例 |

```ts
const fieldRef = ref()

fieldRef.value?.inputRef?.focus()
```

## 常见问题

### Q1: 如何使用表单校验？

Field 组件配合 `ky-form` 使用时，通过 `prop` 属性绑定表单字段，自动进行校验。

```html
<ky-form :model="form" :rules="rules">
  <ky-field prop="mobile" label="手机号" v-model="form.mobile" />
</ky-form>
```

### Q2: 自定义输入组件如何更新值？

通过 `input` 插槽的 `update` 方法更新字段值：

```html
<ky-field v-model="value">
  <template #input="{ update }">
    <custom-input @change="update" />
  </template>
</ky-field>
```

### Q3: 如何隐藏错误提示？

设置 `hiddenPopover` 属性为 `true`，错误信息将以下方文本形式展示：

```html
<ky-field label="姓名" v-model="name" hiddenPopover />
```
