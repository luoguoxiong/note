---
name: "empty"
description: "空状态组件，用于显示空数据占位符。当需要显示空状态占位时调用。"
---

# Empty 空状态

空状态组件，用于显示空数据占位符。内置 error/network/search/list/address/coupon 多种预设场景图。

## 何时使用

- 无数据占位
- 空列表状态
- 无搜索结果
- 错误状态
- 网络异常

## 组件路径

- 源码: `packages/__components/empty/src/empty.vue`
- 类型: `packages/__components/empty/src/types.ts`
- 预设图: `packages/__components/empty/src/constant.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| type | EmptyType \| string | 'error' | 空状态类型：error/network/search/list/address/coupon；也可传图片 URL（http/https 开头）作为自定义图 |
| imageSize | number \| string | '' | 图片尺寸（宽高相等），支持数字或带单位字符串 |
| description | string | '' | 描述文字 |

## Types 类型定义

```typescript
type EmptyType = 'error' | 'network' | 'search' | 'list' | 'address' | 'coupon'
```

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 自定义底部内容 |
| image | 自定义图片区域（替换预设图） |
| description | 自定义描述文字 |

## 使用示例

```vue
<template>
  <!-- 使用预设类型 -->
  <ky-empty type="network" description="网络异常，请稍后重试" />

  <!-- 使用自定义图片 URL -->
  <ky-empty type="https://example.com/empty.png" description="暂无数据" />

  <!-- 自定义底部按钮 -->
  <ky-empty type="search" description="未找到相关结果">
    <ky-button type="primary">重试</ky-button>
  </ky-empty>
</template>
```
