---
name: "list"
description: "列表组件，支持下拉刷新、上拉加载更多。当需要可滚动列表带下拉刷新和上拉加载状态时调用。"
---

# List 列表

列表组件，基于 scroll-view 封装，支持下拉刷新、上拉加载更多、空状态、加载失败等。

## 何时使用

- 下拉刷新 + 上拉加载列表
- 带加载/完成/失败状态的列表
- 可滚动内容容器

## 组件路径

- 源码（多端）:
  - 微信小程序: `packages/__components/list/src/wx.vue`
  - 支付宝小程序: `packages/__components/list/src/alipay.vue`
- 类型: `packages/__components/list/src/types.ts`
- 入口: `packages/__components/list/index.ts`（按环境自动选择）

## Props 入参

### 下拉刷新相关

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| disabledRefresh | boolean | false | 是否禁用下拉刷新 |
| refreshing | boolean | false | 是否处于下拉刷新中状态（支持 v-model:refreshing） |
| pullDistance | number | 80 | 触发下拉刷新的距离 |
| headHeight | number | - | 顶部内容高度（大于 pullDistance） |
| pullingText | string | - | 下拉过程提示文案 |
| loosingText | string | - | 释放过程提示文案 |
| refreshingText | string | - | 刷新过程提示文案 |
| refreshSuccessDuration | number | 1000 | 刷新成功提示时长 |
| refreshSuccessText | string | - | 刷新成功提示文案 |
| showScrollbar | boolean | - | 是否显示滚动条 |

### 上拉加载相关

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| disabledLoad | boolean | false | 是否禁用上拉加载 |
| loading | boolean | false | 是否处于上拉加载中（支持 v-model:loading） |
| isFinished | boolean | false | 是否完成加载 |
| loadingText | string | '加载中...' | 上拉加载中文案 |
| finishedText | string | '没有更多数据' | 加载完成后的提示文案 |
| lowerThreshold | number | 100 | 距离底部多远时触发 onLoad |
| isEmpty | boolean | false | 是否为空 |
| isLoadFail | boolean | false | 是否加载失败 |
| noData | boolean | - | 是否无数据 |
| showLoading | boolean | - | 是否显示加载 |
| scrollViewProps | ScrollViewProps | - | scroll-view 相关 props 透传 |

## ScrollViewProps 类型

```typescript
type ScrollViewProps = {
  scrollX?: boolean
  scrollY?: boolean
  scrollTop?: number
  scrollLeft?: number
  upperThreshold?: number
  lowerThreshold?: number
  scrollIntoView?: string
  scrollWithAnimation?: boolean
  enableBackToTop?: boolean
  trapScroll?: boolean
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:refreshing | 下拉刷新状态变化时触发 | (refreshing: boolean) |
| update:loading | 上拉加载状态变化时触发 | (loading: boolean) |
| refresh | 触发下拉刷新时触发 | - |
| load | 滚动到底部时触发 | - |
| scroll | 滚动时触发 | (event: Event) |
| scrolltoupper | 滚动到顶部时触发 | (event: Event) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 列表内容 |
| finished | 自定义加载完成提示 |
| load-fail | 自定义加载失败提示 |

## 使用示例

```vue
<template>
  <ky-list
    v-model:refreshing="refreshing"
    v-model:loading="loading"
    :is-finished="finished"
    :is-empty="isEmpty"
    :lower-threshold="100"
    @refresh="onRefresh"
    @load="onLoad"
  >
    <ky-cell v-for="item in list" :key="item.id" :title="item.title" />

    <template #finished>
      <view>没有更多数据</view>
    </template>
  </ky-list>
</template>

<script setup>
import { ref } from 'vue'
const list = ref([])
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const isEmpty = ref(false)

const onRefresh = async () => {
  // 下拉刷新
  const data = await fetchList(1)
  list.value = data
  refreshing.value = false
}

const onLoad = async () => {
  // 上拉加载
  const data = await fetchList(page++)
  list.value.push(...data)
  loading.value = false
  if (data.length === 0) finished.value = true
}
</script>
```
