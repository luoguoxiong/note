# List

基于 scroll-view 封装的列表组件，支持下拉刷新和上拉加载更多功能。

<code-preview path="demos/list/list-01.vue" title="基本使用" description="支持下拉刷新和上拉加载"></code-preview>

## 基本使用

最基础的列表用法，通过监听 `refresh` 和 `load` 事件实现数据加载。

```html
<template>
  <ky-list
    ref="listRef"
    v-model:refreshing="refreshing"
    v-model:loading="loading"
    :isFinished="finished"
    :isEmpty="isEmpty"
    :isLoadFail="isLoadFail"
    :scrollViewProps="scrollViewProps"
    @refresh="onRefresh"
    @load="onLoad"
    @scroll="handleScroll"
  >
    <template #empty>
      <view class="custom-empty">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无数据</text>
        <text class="empty-tip">点击下拉刷新重新加载</text>
      </view>
    </template>

    <view v-for="item in list" :key="item.id" class="list-item">
      <view class="item-avatar">{{ item.avatar }}</view>
      <view class="item-content">
        <text class="item-name">{{ item.name }}</text>
        <text class="item-position">{{ item.position }}</text>
        <text class="item-desc">{{ item.desc }}</text>
      </view>
      <text class="item-tag" :class="`tag-${item.status}`">{{ statusMap[item.status] }}</text>
    </view>

    <template #finished>
      <view class="list-footer">
        <text class="footer-text">— 已加载全部数据 —</text>
      </view>
    </template>

    <template #load-fail>
      <view class="load-fail" @click="reload">
        <text class="fail-icon">🔄</text>
        <text class="fail-text">加载失败，点击重试</text>
      </view>
    </template>
  </ky-list>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const listRef = ref()
const list = ref<any[]>([])
const page = ref(1)
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const isEmpty = ref(false)
const isLoadFail = ref(false)
const scrollTop = ref(0)

const statusMap: Record<string, string> = {
  active: '在职',
  vacation: '休假',
  business: '出差',
}

const scrollViewProps = {
  scrollWithAnimation: true,
  showScrollbar: false,
}

const handleScroll = (e: any) => {
  scrollTop.value = e?.detail?.scrollTop || 0
}

const onRefresh = async () => {
  page.value = 1
  finished.value = false
  isEmpty.value = false
  isLoadFail.value = false
  refreshing.value = true
  
  try {
    const data = await fetchData(1)
    list.value = data.data
    finished.value = list.value.length >= data.total
    isEmpty.value = !list.value.length
  } catch {
    isLoadFail.value = true
  } finally {
    refreshing.value = false
  }
}

const onLoad = async () => {
  if (loading.value || finished.value) return
  
  loading.value = true
  isLoadFail.value = false
  
  try {
    const data = await fetchData(page.value + 1)
    list.value.push(...data.data)
    page.value++
    finished.value = list.value.length >= data.total
  } catch {
    isLoadFail.value = true
  } finally {
    loading.value = false
  }
}

const reload = () => {
  onRefresh()
}

onRefresh()
</script>
```

## 自定义空状态

使用 `empty` 插槽自定义空状态展示。

```html
<ky-list :isEmpty="isEmpty">
  <template #empty>
    <view class="custom-empty">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无数据</text>
      <text class="empty-tip">点击下拉刷新重新加载</text>
    </view>
  </template>
  
  <view v-for="item in list" :key="item.id" class="list-item">
    {{ item.title }}
  </view>
</ky-list>
```

## 自定义底部状态

使用 `finished` 插槽自定义加载完成提示，使用 `load-fail` 插槽自定义加载失败提示。

```html
<ky-list :isFinished="finished" :isLoadFail="isLoadFail">
  <template #finished>
    <view class="list-footer">
      <text class="footer-text">— 已加载全部数据 —</text>
    </view>
  </template>
  
  <template #load-fail>
    <view class="load-fail" @click="reload">
      <text class="fail-icon">🔄</text>
      <text class="fail-text">加载失败，点击重试</text>
    </view>
  </template>
  
  <view v-for="item in list" :key="item.id" class="list-item">
    {{ item.title }}
  </view>
</ky-list>
```

## 禁用下拉刷新

通过 `disabledRefresh` 属性禁用下拉刷新功能。

```html
<ky-list :disabledRefresh="true">
  <view v-for="item in list" :key="item.id" class="list-item">
    {{ item.title }}
  </view>
</ky-list>
```

## 禁用上拉加载

通过 `disabledLoad` 属性禁用上拉加载功能。

```html
<ky-list :disabledLoad="true">
  <view v-for="item in list" :key="item.id" class="list-item">
    {{ item.title }}
  </view>
</ky-list>
```

## 设置滚动区域属性

通过 `scrollViewProps` 属性设置内部 scroll-view 的属性。

```html
<ky-list :scrollViewProps="{ scrollWithAnimation: true, showScrollbar: false }">
  <view v-for="item in list" :key="item.id" class="list-item">
    {{ item.title }}
  </view>
</ky-list>
```

## 监听滚动事件

通过 `scroll` 事件监听滚动位置变化。

```html
<ky-list @scroll="handleScroll">
  <view v-for="item in list" :key="item.id" class="list-item">
    {{ item.title }}
  </view>
</ky-list>

<script lang="ts" setup>
const scrollTop = ref(0)

const handleScroll = (e: any) => {
  scrollTop.value = e?.detail?.scrollTop || 0
}
</script>
```

## 组件 API

### Attributes 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- |
| disabledRefresh | 是否禁用下拉刷新 | boolean | false |
| refreshing | 是否处于下拉刷新状态（支持双向绑定） | boolean | false |
| pullDistance | 触发下拉刷新的距离（px） | number | 80 |
| headHeight | 顶部内容高度，需大于 pullDistance | number | 120 |
| refreshSuccessDuration | 刷新成功提示时长（ms） | number | 1000 |
| disabledLoad | 是否禁用上拉加载 | boolean | false |
| loading | 是否处于上拉加载状态（支持双向绑定） | boolean | false |
| isFinished | 是否完成加载 | boolean | false |
| loadingText | 加载中文案 | string | 加载中... |
| finishedText | 加载完成文案 | string | 没有更多数据 |
| lowerThreshold | 距离底部多远时触发加载（px） | number | 100 |
| isEmpty | 是否为空状态 | boolean | false |
| isLoadFail | 是否加载失败 | boolean | false |
| noData | 是否无数据（配合 isLoadFail 使用） | boolean | false |
| showLoading | 是否显示加载中占位 | boolean | true |
| scrollViewProps | scroll-view 组件属性 | ScrollViewProps | {} |

### Methods 方法

通过 ref 调用：

```html
<ky-list ref="listRef" />
```

```typescript
const listRef = ref<InstanceType<typeof List>>()

// 滚动到顶部
listRef.value?.scrollToTop()

// 获取当前滚动位置
const scrollTop = listRef.value?.getScrollTop()

// 设置滚动位置
listRef.value?.setScrollY(100)
```

### Events 事件

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| refresh | 下拉刷新触发 | - |
| load | 上拉加载触发 | - |
| scroll | 滚动时触发 | `{ detail: { scrollTop: number } }` |
| scrolltoupper | 滚动到顶部时触发 | - |
| update:refreshing | 刷新状态更新时触发 | `boolean` |
| update:loading | 加载状态更新时触发 | `boolean` |

### Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 列表内容 | - |
| empty | 空状态展示 | - |
| finished | 加载完成提示 | - |
| load-fail | 加载失败提示 | - |
| refresher | 下拉刷新区域自定义 | - |

## 常见问题

### Q1: 如何实现数据懒加载？

监听 `load` 事件，在事件回调中请求下一页数据，请求完成后设置 `loading` 为 `false`。

### Q2: 如何判断列表是否为空？

当首次加载数据为空时，设置 `isEmpty` 为 `true`，组件会显示空状态。

### Q3: 如何处理加载失败？

当请求数据失败时，设置 `isLoadFail` 为 `true`，组件会显示加载失败提示，用户可点击重试。

### Q4: 如何控制加载状态？

使用 `v-model:loading` 和 `v-model:refreshing` 双向绑定控制加载状态，请求开始时设为 `true`，请求结束时设为 `false`。

### Q5: 如何禁用下拉刷新或上拉加载？

通过 `disabledRefresh` 和 `disabledLoad` 属性分别禁用下拉刷新和上拉加载功能。

### Q6: 如何获取滚动位置？

监听 `scroll` 事件，通过 `e.detail.scrollTop` 获取当前滚动位置。