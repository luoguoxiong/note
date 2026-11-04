---
name: "loading"
description: "加载组件，显示加载指示器。当需要加载指示器时调用。"
---

# Loading 加载

加载组件，显示加载指示器。

## 何时使用

- 加载指示器
- 加载状态
- 旋转动画

## 组件路径

- 源码: `packages/__components/loading/src/loading.vue`
- 类型: `packages/__components/loading/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| size | ComponentSize | 'normal' | 图标尺寸：large/medium/normal/small/mini |
| textSize | TextSize | '3' | 文字尺寸 |
| textColor | string | '#8C8F99' | 加载文字颜色 |
| vertical | boolean | false | 是否垂直排列 |
| type | string | 'default' | 加载类型：default/kye |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 加载文字 |
| icon | 自定义图标 |

## 使用示例

```vue
<template>
  <ky-loading size="large" vertical>
    加载中...
  </ky-loading>
</template>
```
