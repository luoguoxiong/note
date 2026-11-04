---
name: "form"
description: "表单组件，支持验证和字段管理。当需要表单验证和字段管理时调用。"
---

# Form 表单

表单组件，支持验证和字段管理。

## 何时使用

- 表单提交
- 表单验证
- 管理多个表单字段
- 表单状态管理

## 组件路径

- 源码: `packages/__components/form/src/form.vue`
- 类型: `packages/__components/form/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | object | {} | 表单数据模型 |
| rules | FormRules | {} | 验证规则 |
| disabled | boolean | false | 是否禁用表单 |

## Types 类型定义

```typescript
type FormRules = {
  [key: string]: FormItemRule[]
}

type FormErrorMessage = {
  prop: string
  message: string
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| validate | 验证时触发 | (errorMsg: FormErrorMessage) |

## Expose 暴露方法

| 方法名 | 说明 | 参数 |
| ---- | ---- | ---- |
| validate | 表单验证 | (prop?: string) => Promise<{ valid: boolean, errors: any[] }> |
| reset | 重置表单 | (prop?: string) => void |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 表单内容 |

## 使用示例

```vue
<template>
  <ky-form ref="formRef" :model="formData" :rules="rules">
    <ky-field label="用户名" prop="username" v-model="formData.username" />
    <ky-field label="密码" prop="password" v-model="formData.password" type="password" />
    <ky-button @click="submit">提交</ky-button>
  </ky-form>
</template>

<script setup>
const formRef = ref()
const formData = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }]
}

const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (valid) {
    // 提交表单
  }
}
</script>
```
