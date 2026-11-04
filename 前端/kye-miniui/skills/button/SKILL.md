---
name: "button"
description: "按钮组件，支持多种类型、尺寸和状态。当需要可自定义的按钮时调用，支持加载、禁用状态。"
---

# Button 按钮

按钮组件，支持多种类型、尺寸和状态。

## 何时使用

- 表单提交按钮
- 操作触发器
- 需要加载状态按钮
- 各种按钮样式（主要、成功、警告等）

## 组件路径

- 源码: `packages/__components/button/src/button.vue`
- 类型: `packages/__components/button/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| type | ButtonType | 'default' | 按钮类型：primary/success/info/warning/danger/default |
| size | ButtonSize | 'normal' | 按钮尺寸：large/medium/normal/small/mini |
| text | string | '' | 按钮文字（替代slot） |
| color | string | - | 自定义按钮颜色 |
| plain | boolean | false | 是否为朴素按钮 |
| block | boolean | false | 是否为块级元素 |
| disabled | boolean | false | 是否禁用 |
| loading | boolean | false | 是否显示加载状态 |
| loadingText | string | - | 加载状态提示文字 |
| loadingSize | string/number | '24px' | 加载图标尺寸 |
| formType | ButtonFormType | 'button' | 表单类型：button/submit/reset |

## Types 类型定义

```typescript
type ButtonType = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'default'
type ButtonSize = 'large' | 'medium' | 'normal' | 'small' | 'mini'
type ButtonFormType = 'button' | 'submit' | 'reset'
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| click | 点击按钮时触发 | (event: MouseEvent) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 按钮内容 |
| icon | 自定义图标 |

## 使用示例

```vue
<template>
  <!-- 基础用法 -->
  <ky-button type="primary">主要按钮</ky-button>
  <ky-button type="success">成功按钮</ky-button>
  <ky-button type="warning">警告按钮</ky-button>
  <ky-button type="danger">危险按钮</ky-button>
  
  <!-- 按钮尺寸 -->
  <ky-button size="large">大号按钮</ky-button>
  <ky-button size="small">小型按钮</ky-button>
  <ky-button size="mini">迷你按钮</ky-button>
  
  <!-- 加载状态 -->
  <ky-button type="primary" :loading="isLoading" loading-text="加载中...">
    提交
  </ky-button>
  
  <!-- 禁用状态 -->
  <ky-button disabled>禁用按钮</ky-button>
  
  <!-- 朴素按钮 -->
  <ky-button type="primary" plain>朴素按钮</ky-button>
  
  <!-- 块级按钮 -->
  <ky-button type="primary" block>块级按钮</ky-button>
</template>
```
