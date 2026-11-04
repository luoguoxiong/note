# ListVirtual

基于 List 组件开发的虚拟滚动列表，支持大数据量渲染和动态高度自适应。

<code-preview path="demos/list-virtual/list-virtual-1.vue" title="基本使用" description="虚拟滚动列表，支持下拉刷新和上拉加载"></code-preview>

## 基本使用

最基础的虚拟列表用法，通过 `fetch` 属性传入数据加载函数。

```html
<template>
  <ky-list-virtual
    ref="listRef"
    :fetch="fetchData"
    :item-height="100"
    :item-space="8"
    :overscan="overscanCount"
    :get-key="getKey"
    :scroll-view-props="scrollViewProps"
    @scroll="handleScroll"
  >
    <template #beforeContent>
      <view class="list-header">
        <text class="header-label">👥 员工列表</text>
        <text class="header-count">共 {{ total }} 人</text>
      </view>
    </template>

    <template #default="{ data, index }">
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

    <template #empty>
      <view class="custom-empty">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无数据</text>
        <text class="empty-tip">点击下拉刷新重新加载</text>
      </view>
    </template>

    <template #finished>
      <view class="list-footer">
        <text class="footer-text">— 已加载全部数据 —</text>
      </view>
    </template>
  </ky-list-virtual>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import Taro from '@tarojs/taro'

interface ListData {
  id: number
  avatar: string
  name: string
  position: string
  desc: string
  status: 'active' | 'vacation' | 'business'
}

const listRef = ref()
const total = ref(0)
const scrollTop = ref(0)

const systemInfo = Taro.getSystemInfoSync()
const isLowPerformanceDevice = computed(() => {
  return (
    systemInfo.platform === 'devtools' ||
    (systemInfo.system?.includes('iOS') && parseFloat(systemInfo.system?.split(' ')[1]) < 15)
  )
})

const overscanCount = computed(() => {
  return isLowPerformanceDevice.value ? 5 : 10
})

const scrollViewProps = {
  scrollWithAnimation: true,
  enhanced: true,
  showScrollbar: false,
}

const getKey = (item: ListData) => item.id

const statusMap: Record<string, string> = {
  active: '在职',
  vacation: '休假',
  business: '出差',
}

const handleScroll = (e: any) => {
  scrollTop.value = e?.detail?.scrollTop || 0
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

  const data: ListData[] = Array.from({ length: 20 }, (_, i) => {
    const idx = (page - 1) * 20 + i
    const contentLength = (idx % 4) + 1
    const descs = [
      '负责前端页面开发与优化',
      '专注于后端服务架构设计和性能优化，具备丰富的微服务开发经验',
      '主导产品规划与设计，协调跨团队资源推动项目落地',
      '负责产品视觉设计，包括UI/UX设计和品牌设计',
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

  const totalCount = 100
  total.value = totalCount

  return {
    data,
    total: totalCount,
  }
}
</script>
```

## 自定义列表项

通过默认插槽自定义列表项内容，支持动态高度。

```html
<ky-list-virtual :fetch="fetchData" :item-height="100">
  <template #default="{ data, index }">
    <view class="custom-item">
      <view class="item-avatar">{{ data.avatar }}</view>
      <view class="item-content">
        <text class="item-name">{{ data.name }}</text>
        <text class="item-text">{{ data.text }}</text>
      </view>
    </view>
  </template>
</ky-list-virtual>
```

## 自定义空状态

使用 `empty` 插槽自定义空状态展示。

```html
<ky-list-virtual :fetch="fetchData">
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
  
  <template #empty>
    <view class="custom-empty">
      <text class="empty-icon">📭</text>
      <text class="empty-text">暂无数据</text>
      <text class="empty-tip">点击下拉刷新重新加载</text>
    </view>
  </template>
</ky-list-virtual>
```

## 自定义顶部区域

使用 `beforeContent` 插槽在列表内容前添加自定义区域。

```html
<ky-list-virtual :fetch="fetchData">
  <template #beforeContent>
    <view class="header-area">
      <text class="header-title">列表标题</text>
      <text class="header-subtitle">共 {{ total }} 条数据</text>
    </view>
  </template>
  
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-virtual>
```

## 自定义底部区域

使用 `finished` 插槽自定义加载完成时的底部提示。

```html
<ky-list-virtual :fetch="fetchData">
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
  
  <template #finished>
    <view class="finished-tip">
      <text>— 已加载全部数据 —</text>
    </view>
  </template>
</ky-list-virtual>
```

## 设置列表项高度

通过 `itemHeight` 属性设置预估的列表项高度，组件会自动测量真实高度并进行自适应调整。

```html
<!-- 默认高度 88px -->
<ky-list-virtual :fetch="fetchData">
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-virtual>

<!-- 自定义预估高度 -->
<ky-list-virtual :fetch="fetchData" :item-height="120">
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-virtual>
```

## 设置预渲染数量

通过 `overscan` 属性设置可视区上下预渲染的列表项数量，平衡滚动流畅度和内存占用。

```html
<!-- 根据设备性能动态调整 -->
<ky-list-virtual 
  :fetch="fetchData" 
  :overscan="isLowPerformanceDevice ? 5 : 10"
>
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-virtual>
```

## 设置列表项间距

通过 `item-space` 属性设置列表项之间的间距。

```html
<ky-list-virtual 
  :fetch="fetchData" 
  :item-height="100"
  :item-space="8"
>
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-virtual>
```

## 设置唯一标识

通过 `get-key` 属性设置列表项的唯一标识函数，用于优化渲染性能。

```html
<ky-list-virtual 
  :fetch="fetchData" 
  :get-key="(item) => item.id"
>
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-virtual>
```

## 监听滚动事件

通过 `scroll` 事件监听滚动位置变化。

```html
<ky-list-virtual :fetch="fetchData" @scroll="handleScroll">
  <template #default="{ data }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-virtual>

<script lang="ts" setup>
const scrollTop = ref(0)

const handleScroll = (e: any) => {
  scrollTop.value = e?.detail?.scrollTop || 0
}
</script>
```

## 禁用下拉刷新

通过 `disabledRefresh` 属性禁用下拉刷新功能，适用于仅需要上拉加载的场景。

```html
<ky-list-virtual :fetch="fetchData" :disabledRefresh="true">
  <template #default="{ data, index }">
    <view class="list-item">{{ data.title }}</view>
  </template>
</ky-list-virtual>
```

## 组件 API

### Attributes 属性

| 参数 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ---- |
| fetch | 数据加载函数，返回 Promise | `(page: number) => Promise<{ data: T[], total: number }>` | - |
| disabledRefresh | 是否禁用下拉刷新 | boolean | false |
| scrollViewProps | scroll-view 组件属性 | ScrollViewProps | {} |
| itemHeight | 列表项预估高度（px） | number | 88 |
| itemSpace | 列表项间距（px） | number | - |
| overscan | 预渲染数量（可视区上下各渲染多少项） | number | 4 |
| getKey | 列表项唯一标识函数 | `(item: T) => string \| number` | - |

### Methods 方法

通过 ref 调用：

```html
<ky-list-virtual ref="listRef" :fetch="fetchData" />
```

```typescript
const listRef = ref<InstanceType<typeof ListVirtual>>()

// 重置列表数据（重新从第一页加载）
listRef.value?.init()

// 获取所有数据
const allData = listRef.value?.allData

// 获取总数
const total = listRef.value?.total

// 获取刷新状态
const refreshing = listRef.value?.refreshing

// 更新列表高度（窗口大小变化时调用）
listRef.value?.updateListHeight()

// 更新可视区域（手动触发）
listRef.value?.updateVisiblePool()
```

### Events 事件

| 事件名 | 说明 | 参数 |
| ---- | ---- | ---- |
| scroll | 滚动时触发 | `{ detail: { scrollTop: number } }` |

### Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 列表项内容 | `{ data: T, index: number }` |
| empty | 空状态展示 | - |
| beforeContent | 列表内容前的自定义区域 | - |
| finished | 加载完成时的底部提示 | - |

## 常见问题

### Q1: 虚拟列表的原理是什么？

虚拟列表只渲染可视区域内的列表项，通过计算滚动位置动态更新渲染内容，从而提升大数据量列表的性能。

### Q2: 如何处理动态高度的列表项？

组件会自动测量已渲染列表项的真实高度，并使用中位数作为预估高度进行缓存和计算，实现动态高度的自适应。

### Q3: 什么时候需要设置 itemHeight？

`itemHeight` 是预估高度，用于初始化和未测量时的占位。如果列表项高度差异较大，建议设置一个接近平均高度的值以获得更好的初始体验。

### Q4: 如何触发手动刷新？

通过 ref 调用 `init()` 方法：

```typescript
const listRef = ref()

listRef.value?.init()
```

### Q5: overscan 参数的作用是什么？

`overscan` 控制可视区上下预渲染的列表项数量。值越大，滚动时的流畅度越好，但内存占用也会增加。默认值为 4，适合大多数场景。

### Q6: 组件是否自动初始化？

是的，组件挂载后会自动调用 `init()` 方法加载第一页数据。

### Q7: 如何获取滚动位置？

监听 `scroll` 事件，通过 `e.detail.scrollTop` 获取当前滚动位置。