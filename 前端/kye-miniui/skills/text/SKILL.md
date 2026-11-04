---
name: "text"
description: "文本组件，用于样式化文本显示。当需要带样式的文本时调用。"
---

# Text 文本

文本组件，用于样式化文本显示，支持多种尺寸、类型和溢出处理。

## 何时使用

- 需要统一样式的文本显示
- 需要设置不同大小的标题和正文
- 需要处理文本溢出（省略号、修剪、淡出等）
- 需要控制文本是否可选中

## 组件路径

- 源码: `packages/__components/text/src/text.vue`
- 类型: `packages/__components/text/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| size | string | '3' | 文本尺寸：1/2/3/4/5 |
| type | string | 'main' | 文本类型：title/main |
| selectable | boolean | false | 文本是否可选 |
| userSelect | boolean | false | 文本是否可选（微信端） |
| space | string | - | WebView 特有属性，显示连续空格 |
| decode | boolean | false | WebView 特有属性，是否解码 |
| overflow | string | - | 溢出处理：clip/fade/ellipsis/visible |
| maxLines | number | 1 | 限制文本最大行数 |
| numberOfLines | number | - | 限制文本行数（兼容属性） |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 文本内容 |

## 使用示例

```vue
<template>
  <ky-text type="title" size="1">大标题</ky-text>
  <ky-text type="main" size="3">正文内容</ky-text>
  <ky-text overflow="ellipsis" :max-lines="2">
    这是一段需要省略的长文本内容，当超过指定行数时会显示省略号。
  </ky-text>
</template>
```