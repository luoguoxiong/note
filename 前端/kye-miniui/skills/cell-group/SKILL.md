---
name: "cell-group"
description: "单元格组组件，用于组合多个单元格。当需要将多个单元格分组显示时调用。"
---

# CellGroup 单元格组

单元格组组件，用于组织多个单元格。

## 何时使用

- 分组相关单元格
- 创建设置分组
- 组织列表项

## 组件路径

- 源码: `packages/__components/cell-group/src/cell-group.vue`
- 类型: `packages/__components/cell-group/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| title | string | - | 分组标题 |
| inset | boolean | false | 是否展示为圆角卡片风格 |
| border | boolean | true | 是否显示外边框 |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 单元格内容 |

## 使用示例

```vue
<template>
  <ky-cell-group title="分组标题">
    <ky-cell title="项目1" value="内容1" />
    <ky-cell title="项目2" value="内容2" />
  </ky-cell-group>
</template>
```
