---
name: "field"
description: "表单字段组件，带验证支持。当需要带验证的表单输入字段时调用。"
---

# Field 表单字段

表单字段组件，带验证支持。基于 `ky-input` 封装，需配合 `ky-form` 使用以触发校验。

## 何时使用

- 表单输入字段
- 带验证的输入
- 带标签的表单项
- 错误信息显示（内置 Popover 气泡提示）

## 组件路径

- 源码: `packages/__components/field/src/field.vue`
- 类型: `packages/__components/field/src/types.ts`

## Props 入参

Field 继承自 `KyInputProps`（详见 input 组件），以下为 Field 自身定义及覆盖的属性：

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | string | '' | 输入值（继承自 KyInputProps） |
| prop | string | - | 表单字段属性名，用于 form 校验 |
| isError | boolean | false | 是否错误状态 |
| label | string | - | 字段标签 |
| labelPosition | 'top' \| 'left' | 'top' | 标签位置 |
| labelAlign | 'center' \| 'right' \| 'left' | 'left' | 标签对齐方式（labelPosition 为 left 时生效） |
| labelWidth | number | - | 标签宽度（labelPosition 为 left 时生效，单位 px） |
| showWordLimit | boolean | false | 是否显示字数统计 |
| clearTrigger | 'focus' \| 'always' | - | 清除按钮触发时机 |
| formatter | (val: string) => string | - | 格式化函数 |
| required | boolean | false | 是否必填 |
| rules | FormItemRuleType[] | - | 校验规则 |
| popoverConfig | PopoverConfigType | { placement: 'top-start', offset: [0, 4] } | 错误气泡配置 |
| hiddenPopover | boolean | false | 是否隐藏错误气泡（改用文字展示错误） |
| listenClickId | string | 'order-page' | 监听点击的元素 ID |
| readonly | boolean | false | 是否只读 |
| enableNative | boolean | true | 是否启用原生输入 |
| textAlign | 'left' \| 'right' | 'left' | 输入内容对齐 |
| customPlaceholder | boolean | false | 是否自定义占位符 |
| inputDebounce | number | 0 | 输入节流时间（毫秒） |
| clearDisplaySpace | boolean | false | 清除显示空格 |
| cursorSpacing | number | 0 | 光标与键盘距离 |
| adjustPosition | boolean | true | 键盘弹起时是否自动调整位置 |
| clearable | boolean | true | 是否显示清除按钮 |

> 继承自 KyInputProps 的其它常用属性：`type`、`placeholder`、`disabled`、`maxlength`、`border`、`size`、`confirmType`、`isError` 等，详见 input 组件文档。

## Types 类型定义

```typescript
interface FormItemRuleType {
  required: boolean                                        // 是否为必选字段
  message: string                                          // 错误提示文案
  validator: (value: string, rule?: FormItemRule) => boolean | Promise<void>  // 函数校验
  regex: RegExp                                            // 正则校验
}

interface FormItemRule extends FormItemRuleWithoutValidator {
  validator?: (
    value: any,
    ruleCfg: FormItemRuleWithoutValidator,
  ) => boolean | Promise<string> | Promise<boolean> | Promise<void> | Promise<unknown>
}

interface PopoverConfigType {
  placement?: PopoverLocation   // 气泡位置，详见 popover 组件
  offset?: [number, number]     // 偏移量
  content?: string              // 自定义气泡内容
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 值变化时触发 | (value: string) |
| focus | 获得焦点时触发 | (event: Event) |
| blur | 失去焦点时触发 | (event: Event) |
| change | 清空触发时 | (value: string) |
| clear | 清空时触发 | - |
| input | 输入时触发 | (value: string, event: Event) |
| confirm | 确认时触发 | (value: string) |
| keyboardHeightChange | 键盘高度变化时触发 | (event: Event) |
| click | 点击内容区域时触发 | (event: Event) |

## Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| label | 自定义标签 | - |
| required | 自定义必填标记 | - |
| input | 自定义输入区域（替代默认 ky-input） | { value, isError, errorMessage, update } |
| right | 输入框右侧内容 | - |

## Expose 暴露方法

| 方法名 | 说明 |
| ---- | ---- |
| inputRef | 内部 ky-input 组件引用 |

## 使用示例

```vue
<template>
  <ky-form :model="form" :rules="rules">
    <ky-field
      v-model="form.username"
      label="用户名"
      prop="username"
      placeholder="请输入用户名"
      :rules="[{ required: true, message: '请输入用户名' }]"
    />
    <ky-field
      v-model="form.phone"
      label="手机号"
      prop="phone"
      type="number"
      :rules="[{ required: true, regex: /^1\d{10}$/, message: '请输入正确的手机号' }]"
    />
  </ky-form>
</template>

<script setup>
const form = reactive({ username: '', phone: '' })
const rules = {}
</script>
```
