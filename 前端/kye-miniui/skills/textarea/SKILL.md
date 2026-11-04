---
name: "textarea"
description: "多行文本框组件，用于多行文本输入。当需要多行文本输入带字数限制/清除/格式化时调用。"
---

# Textarea 多行文本框

多行文本框组件，用于多行文本输入，支持字数限制、清除按钮、格式化、自定义占位等。

## 何时使用

- 多行文本输入
- 长文本表单
- 评论/备注字段
- 表单中需配合 Field 使用

## 组件路径

- 源码: `packages/__components/textarea/src/textarea.vue`
- 类型: `packages/__components/textarea/src/types.ts`
- 工具: `packages/__components/textarea/src/utils.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | string | '' | 输入值（支持 v-model） |
| placeholder | string | - | 占位文本 |
| placeholderStyle | string | - | 占位文本样式 |
| disabled | boolean | false | 是否禁用 |
| maxlength | number | - | 最大输入长度 |
| confirmHold | boolean | - | 是否保持键盘不收起 |
| focus | boolean | - | 是否自动聚焦 |
| cursor | number | - | 光标位置 |
| adjustPosition | boolean | true | 微信端键盘弹起时是否自动上推页面 |
| holdKeyboard | boolean | - | 是否保持键盘不收起 |
| confirmType | 'send' / 'search' / 'next' / 'go' / 'done' / 'return' | - | 确认按钮类型 |
| isError | boolean | false | 是否显示错误状态 |
| clearable | boolean | true | 是否显示清除按钮 |
| showWordLimit | boolean | true | 是否显示字数统计 |
| formatter | (val: string) => string | - | 格式化函数 |
| isTextLimit | boolean | true | 是否开启文本限制 |
| customPlaceholder | boolean | false | 是否开启自定义占位文本 |
| inputDebounce | number | 0 | modelValue 更新节流间隔（毫秒） |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 值变化时触发 | (value: string) |
| change | 值改变时触发 | (value: string) |
| input | 输入时触发 | (value: string) |
| focus | 获得焦点时触发 | (event: Event) |
| blur | 失去焦点时触发 | - |
| clear | 清空时触发 | - |
| confirm | 确认时触发 | (value: string) |
| keyboardHeightChange | 键盘高度变化时触发 | (event: Event) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| bottom | 底部内容 |

## 使用示例

```vue
<template>
  <ky-textarea
    v-model="content"
    placeholder="请输入内容"
    :maxlength="200"
    show-word-limit
    clearable
  />

  <!-- 表单中使用 -->
  <ky-field label="简介" prop="bio" type="textarea">
    <ky-textarea v-model="form.bio" :maxlength="200" show-word-limit />
  </ky-field>
</template>

<script setup>
import { ref } from 'vue'
const content = ref('')
const form = reactive({ bio: '' })
</script>
```
