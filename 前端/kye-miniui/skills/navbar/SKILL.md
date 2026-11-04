---
name: "navbar"
description: "导航栏组件，用于页面顶部导航。当需要页面导航栏带返回按钮和标题时调用。"
---

# Navbar 导航栏

导航栏组件，用于页面顶部导航。

## 何时使用

- 页面导航头部
- 自定义导航栏
- 返回按钮处理

## 组件路径

- 源码: `packages/__components/navbar/src/navbar.vue`
- 类型: `packages/__components/navbar/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| title | string | 'title' | 导航标题 |
| height | string | - | 自定义高度 |
| leftText | string | '' | 左侧文字 |
| rightText | string | '' | 右侧文字 |
| border | boolean | false | 是否显示下边框 |
| zIndex | number | 999 | 层级 |
| placeholder | boolean | true | 是否生成占位元素 |
| showPlatList | KyNavbarPlatform[] | ['wx'] | 显示的平台列表 |
| backPath | string | '' | 首页链接（无上一页时使用） |
| beforeBack | Interceptor | - | 返回前回调 |
| leftArrow | boolean | true | 是否显示左侧箭头 |
| leftArrowIcon | string | - | 自定义左侧箭头图标 |

## Types 类型定义

```typescript
type KyNavbarPlatform = 'wx' | 'alipay' | 'h5'
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| click-title | 点击标题时触发 | (event: Event) |
| click-left | 点击左侧时触发 | (event: Event) |
| click-right | 点击右侧时触发 | (event: Event) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| title | 自定义标题 |
| left | 自定义左侧内容 |
| right | 自定义右侧内容 |

## 使用示例

```vue
<template>
  <ky-navbar 
    title="页面标题" 
    left-arrow 
    @click-left="onClickLeft" 
  />
</template>

<script setup>
const onClickLeft = () => {
  // 返回上一页
}
</script>
```
