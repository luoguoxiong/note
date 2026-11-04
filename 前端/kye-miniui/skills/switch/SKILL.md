---
name: "switch"
description: "开关组件，用于切换状态。当需要开关切换开/关状态时调用。"
---

# Switch 开关

开关组件，用于切换状态。

## 何时使用

- 开关切换
- 开/关控制
- 设置开关

## 组件路径

- 源码: `packages/__components/switch/src/switch.vue`
- 类型: `packages/__components/switch/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | boolean | false | 绑定值 |
| color | string | '#8365f6' | 开关颜色 |
| size | string | 'medium' | 尺寸：large/medium/normal/small/mini |
| checked | boolean | false | 是否选中 |
| disabled | boolean | false | 是否禁用 |
| type | string | 'switch' | 类型：switch/checkbox |
| loading | boolean | false | 是否加载状态 |
| activeValue | string/number/boolean | true | 打开时的值 |
| inactiveValue | string/number/boolean | false | 关闭时的值 |
| activeColor | string | '#8365F6' | 打开时的颜色 |
| inactiveColor | string | '#E6E8ED' | 关闭时的颜色 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 值变化时触发 | (value: any) |
| change | 值变化时触发 | (value: any, event: Event) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| icon | 自定义图标（加载状态） |

## 使用示例

```vue
<template>
  <ky-switch v-model="enabled" />
  <ky-switch v-model="enabled" size="large" />
  <ky-switch v-model="enabled" disabled />
  <ky-switch v-model="enabled" loading />
</template>
```
