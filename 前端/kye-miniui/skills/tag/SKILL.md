---
name: "tag"
description: "标签组件，用于分类或标记。当需要标签或标记时调用，支持自定义背景/文字/边框颜色及朴素样式。"
---

# Tag 标签

标签组件，用于分类和标记。

## 何时使用

- 标签和标记
- 状态指示器
- 分类标记

## 组件路径

- 源码: `packages/__components/tag/src/tag.vue`
- 类型: `packages/__components/tag/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| show | boolean | true | 是否显示标签 |
| size | string | - | 标签大小（1-5 对应不同尺寸，见 SCSS） |
| plain | boolean | false | 是否为朴素样式（仅边框，无背景色） |
| bgColor | string | '#8365F6' | 标签背景颜色 |
| textColor | string | '#fff' | 标签文本颜色 |
| borderColor | string | '#8365F6' | 标签边框颜色（默认为背景色） |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| click | 点击标签时触发 | (event: Event) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 标签内容 |

## 使用示例

```vue
<template>
  <!-- 默认（紫色实心） -->
  <ky-tag>标签</ky-tag>

  <!-- 朴素样式 -->
  <ky-tag plain>朴素</ky-tag>

  <!-- 自定义颜色 -->
  <ky-tag bg-color="#07c160" text-color="#fff">成功</ky-tag>
  <ky-tag bg-color="#ff976a" text-color="#fff">警告</ky-tag>
  <ky-tag bg-color="#ee0a24" text-color="#fff">危险</ky-tag>

  <!-- 朴素 + 自定义颜色 -->
  <ky-tag plain text-color="#8365F6">紫色朴素</ky-tag>
</template>
```
