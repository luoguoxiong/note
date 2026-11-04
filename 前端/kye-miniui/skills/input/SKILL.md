---
name: "input"
description: "输入框组件，支持格式化、清除、多种类型与多端适配。当需要文本输入框时调用。"
---

# Input 输入框

输入框组件，支持多种类型、清除、格式化、自定义占位等，并针对微信/支付宝/H5 多端适配。

## 何时使用

- 文本输入
- 数字/身份证/密码输入
- 带格式化输入
- 表单场景应配合 Form + Field 使用

## 组件路径

- 源码（多端）:
  - H5: `packages/__components/input/src/h5.vue`
  - 小程序原生: `packages/__components/input/src/native.vue`
- 类型: `packages/__components/input/src/types.ts`
- 公共逻辑: `packages/__components/input/src/useCommon.ts`
- 入口: `packages/__components/input/index.ts`（按环境自动选择 H5/原生实现）

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | string | '' | 输入值（支持 v-model） |
| border | 'all' / 'bottom' / 'none' | 'all' | 边框样式 |
| type | 'text' / 'number' / 'idcard' / 'digit' / 'safe-password' / 'nickname' | 'text' | 输入类型 |
| placeholder | string | - | 占位文本 |
| placeholderStyle | string | - | 占位文本样式 |
| customPlaceholder | boolean | false | 是否自定义占位文本 |
| disabled | boolean | false | 是否禁用 |
| maxlength | number | - | 最大输入长度 |
| focus | boolean | - | 是否自动聚焦 |
| confirmHold | boolean | - | 是否保持键盘不收起 |
| cursor | number | - | 光标位置 |
| adjustPosition | boolean | true | 微信端键盘弹起时是否自动上推页面 |
| holdKeyboard | boolean | - | 是否保持键盘不收起 |
| confirmType | 'send' / 'search' / 'next' / 'go' / 'done' | 'done' | 确认按钮类型 |
| isError | boolean | false | 是否显示错误状态 |
| clearable | boolean | true | 是否显示清除按钮 |
| showWordLimit | boolean | false | 是否显示字数统计 |
| alwaysSystem | boolean | false | （支付宝系）是否强制使用系统键盘 |
| enableNative | boolean | true | （支付宝系）是否启用原生组件 |
| clearDisplay | boolean | false | 删除按钮显示空间预留（优先级高） |
| clearDisplaySpace | boolean | false | 删除按钮显示空间预留 |
| clearTrigger | 'focus' / 'always' | 'focus' | 清除按钮触发方式 |
| formatter | (val: string) => string | - | 格式化函数 |
| inputDebounce | number | 0 | input 事件触发防抖间隔（毫秒） |
| textAlign | 'left' / 'right' | 'left' | 文本对齐方式 |
| cursorSpacing | number | 0 | 微信端键盘顶起间隔 |
| readonly | boolean | false | 是否只读 |

> 注：微信原生输入框相关能力（`enableWxNative` / `enableWxNativeFormatter`）由 `native.vue` 内部处理，非对外 props。

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 值变化时触发 | (value: string) |
| change | 值改变时触发 | (value: string) |
| input | 输入时触发 | (value: string, event: Event) |
| focus | 获得焦点时触发 | (event: Event) |
| blur | 失去焦点时触发 | (event: Event) |
| clear | 清空时触发 | - |
| confirm | 确认时触发 | (value: string, event: Event) |
| keyboardHeightChange | 键盘高度变化时触发 | (event: Event) |
| click | 点击时触发 | - |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| left | 左侧内容 |
| right | 右侧内容 |

## Expose 暴露方法

| 方法名 | 说明 |
| ---- | ---- |
| focus | 聚焦 |
| blur | 失焦 |
| clear | 清空 |

## 使用示例

```vue
<template>
  <ky-input
    v-model="value"
    placeholder="请输入"
    clearable
    :maxlength="20"
  />

  <!-- 数字输入 -->
  <ky-input v-model="phone" type="number" placeholder="请输入手机号" />

  <!-- 密码输入 -->
  <ky-input v-model="pwd" type="safe-password" placeholder="请输入密码" />

  <!-- 格式化 -->
  <ky-input
    v-model="card"
    :formatter="(v) => v.replace(/(\d{4})(?=\d)/g, '$1 ')"
    placeholder="银行卡号"
  />
</template>
```
