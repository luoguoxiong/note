# ListStandard

基于 List 组件封装的标准列表组件，内置数据加载逻辑，只需传入 fetch 函数即可实现下拉刷新和上拉加载。

<code-preview path="demos/list-standard/list-standard-1.vue" title="基本使用" description="内置数据加载逻辑，支持下拉刷新和上拉加载"></code-preview>

## 基本使用

最基础的列表用法，通过 `fetch` 属性传入数据加载函数，组件内部自动处理分页、加载状态和数据渲染。

```html
<template>
  <ky-list-standard ref="listRef" :fetch="fetchData" :scrollViewProps="scrollViewProps">
    <template #beforeContent>
      <view class="list-header">
        <text class="header-count">共 {{ totalCount }} 条数据</text>
        <text class="header-refresh" @click="handleRefresh">🔄 刷新</text>
      </view>
    </template>

    <template #empty>
      <view class="custom-empty">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无数据</text>
        <text class="empty-tip">点击下拉刷新重新加载</text>
      </view>
    </template>

    <template #default="{ data }">
      <view class="list-item">
        <view class="item-avatar">{{ data.avatar }}</view>
        <view class="item-content">
          <text class="item-name">{{ data.name }}</text>
          <text class="item-position">{{ data.position }}</text>
          <text class="item-desc">{{ data.desc }}</text>
        </view>
        <text class="item-tag" :class="`tag-${data.status}`">{{ statusMap[data.status] }}</text>
      </view>
    </template>

    <template #finished>
      <view class="list-footer">
        <text class="footer-text">— 已加载全部数据 —</text>
      </view>
    </template>

    <template #load-fail>
      <view class="load-fail" @click="handleRefresh">
        <text class="fail-icon">🔄</text>
        <text class="fail-text">加载失败，点击重试</text>
      </view>
    </template>
  </ky-list-standard>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

interface ListData {
  id: number
  avatar: string
  name: string
  position: string
  desc: string
  status: 'active' | 'vacation' | 'business'
}

const listRef = ref()
const totalCount = ref(0)

const statusMap: Record<string, string> = {
  active: '在职',
  vacation: '休假',
  business: '出差',
}

const scrollViewProps = {
  scrollWithAnimation: true,
  showScrollbar: false,
}

const fetchData = async (page: number) => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const avatars = ['👨‍💻', '👩‍💻', '👨‍🚀', '👩‍🚀', '🧑‍🎨', '👨‍🎨', '👩‍⚕️', '👨‍⚕️', '👩‍🎓', '👨‍🎓']
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑一', '陈二']
  const positions = [
    '前端工程师',
    '后端工程师',
    '产品经理',
    '设计师',
    '测试工程师',
    '运维工程师',
    '项目经理',
    '技术总监',
  ]
  const statuses: ('active' | 'vacation' | 'business')[] = ['active', 'vacation', 'business']

  const total = 50
  totalCount.value = total

  const data: ListData[] = Array.from({ length: 10 }, (_, i) => {
    const idx = (page - 1) * 10 + i
    const contentLength = (idx % 3) + 1
    const descs = [
      '负责前端页面开发与优化',
      '专注于后端服务架构设计和性能优化',
      '主导产品规划与设计，协调跨团队资源推动项目落地',
    ]

    return {
      id: idx,
      avatar: avatars[idx % avatars.length],
      name: names[idx % names.length] + (idx + 1),
      position: positions[idx % positions.length],
      desc: descs[contentLength - 1],
      status: statuses[idx % statuses.length],
    }
  })

  return {
    data,
    total,
  }
}

const handleRefresh = () => {
  listRef.value?.init()
}
</script>
```

## 自定义空状态

使用 `empty` 插槽自定义空状态展示。

```html
<ky-list-standard :fetch="fetchData">
  <template #empty>
    <view class="custom-empty">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无数据</text>
      <text class="empty-tip">点击下拉刷新重新加载</text>
    </view>
  </template>
  
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-standard>
```

## 自定义底部状态

使用 `finished` 插槽自定义加载完成提示，使用 `load-fail` 插槽自定义加载失败提示。

```html
<ky-list-standard ref="listRef" :fetch="fetchData">
  <template #finished>
    <view class="finished-tip">— 已加载全部数据 —</view>
  </template>
  
  <template #load-fail>
    <view class="load-fail" @click="listRef?.init()">加载失败，点击重试</view>
  </template>
  
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-standard>
```

## 添加前置内容

使用 `beforeContent` 插槽在列表内容前添加自定义区域。

```html
<ky-list-standard :fetch="fetchData">
  <template #beforeContent>
    <view class="header-area">
      <text class="header-title">列表标题</text>
      <text class="header-subtitle">共 {{ total }} 条数据</text>
    </view>
  </template>
  
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-standard>
```

## 设置滚动区域属性

通过 `scrollViewProps` 属性设置内部 scroll-view 的属性。

```html
<ky-list-standard 
  :fetch="fetchData" 
  :scrollViewProps="{ scrollWithAnimation: true, showScrollbar: false }"
>
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-standard>
```

## 手动控制列表

通过 ref 调用组件方法，实现手动刷新、滚动等操作。

```html
<template>
  <ky-list-standard ref="listRef" :fetch="fetchData">
    <template #default="{ data }">
      <view class="list-item">{{ data.title }}</view>
    </template>
  </ky-list-standard>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const listRef = ref()

// 手动触发刷新
const refresh = () => {
  listRef.value?.init()
}

// 获取所有数据
const getAllData = () => {
  const data = listRef.value?.allData
}

// 获取总数
const getTotal = () => {
  const total = listRef.value?.total
}

// 更新列表高度
const updateHeight = () => {
  listRef.value?.updateListHeight()
}

// 设置滚动位置
const setScroll = () => {
  listRef.value?.setScrollY(100)
}

// 滚动到顶部
const scrollToTop = () => {
  listRef.value?.scrollToTop()
}

// 强制更新列表（使用 shallowRef 时）
const triggerUpdate = () => {
  listRef.value?.triggerList()
}

// 更新列表数据
const updateData = (newData) => {
  listRef.value?.updateListData(newData)
}
</script>
```

## 使用 shallowRef 优化性能

当列表数据量较大且不需要深度响应式时，可以设置 `shallowRef: true` 来优化性能。

```html
<ky-list-standard :fetch="fetchData" :shallowRef="true">
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-standard>
```

## 禁用下拉刷新

通过 `disabledRefresh` 属性禁用下拉刷新功能，适用于仅需要上拉加载的场景。

```html
<ky-list-standard :fetch="fetchData" :disabledRefresh="true">
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-standard>
```

## 组件 API

### Attributes 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- |
| fetch | 数据加载函数，返回 Promise | `(page: number) => Promise<{ data: T[], total: number }>` | - |
| disabledRefresh | 是否禁用下拉刷新 | boolean | false |
| scrollViewProps | 透传给内部 List 的 scroll-view 属性 | Object | {} |
| showLoading | 是否展示加载中的占位 | boolean | false |
| shallowRef | 是否使用 shallowRef 优化性能 | boolean | false |

### Methods 方法

通过 ref 调用：

```html
<ky-list-standard ref="listRef" />
```

```typescript
const listRef = ref<InstanceType<typeof ListStandard>>()

// 重置并重新加载列表数据，同时滚动到顶部
listRef.value?.init()

// 获取所有数据
const allData = listRef.value?.allData

// 获取总数
const total = listRef.value?.total

// 获取刷新状态
const refreshing = listRef.value?.refreshing

// 更新列表高度（窗口大小变化时调用）
listRef.value?.updateListHeight()

// 设置滚动位置
listRef.value?.setScrollY(100)

// 滚动到顶部
listRef.value?.scrollToTop()

// 强制更新列表（使用 shallowRef 时）
listRef.value?.triggerList()

// 更新列表数据
listRef.value?.updateListData(newData)
```

### Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 列表项内容 | `{ data: T }` |
| empty | 空列表占位区域 | - |
| beforeContent | 列表内容前置区域（在非空时显示） | - |
| finished | 列表已完成加载区域 | - |
| load-fail | 加载失败区域（可自定义重试按钮） | - |

## 常见问题

### Q1: fetch 函数的返回值格式是什么？

fetch 函数需要返回一个 Promise，resolve 的对象包含 `data` 和 `total` 两个字段：

```typescript
{
  data: T[],  // 当前页数据
  total: number,  // 总数据条数
}
```

### Q2: 如何实现手动刷新？

通过 ref 调用 `init()` 方法即可触发手动刷新：

```typescript
listRef.value?.init()
```

### Q3: 如何获取列表的所有数据？

通过 `allData` 属性获取：

```typescript
const data = listRef.value?.allData
```

### Q4: 什么时候需要使用 shallowRef？

当列表数据量较大且不需要深度响应式时，可以设置 `shallowRef: true` 来优化性能。此时需要调用 `triggerList()` 强制更新列表。

### Q5: 如何自定义加载失败的重试逻辑？

在 `load-fail` 插槽中自定义重试按钮，通过 ref 调用 `init()` 方法：

```html
<template #load-fail>
  <view @click="listRef?.init()">点击重试</view>
</template>
```

### Q6: 组件是否自动初始化？

是的，组件挂载后会自动调用 `init()` 方法加载第一页数据。