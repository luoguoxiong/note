---
name: "list-virtual"
description: "虚拟列表组件，高效渲染大数据集。当需要高性能列表处理大数据并支持虚拟滚动时调用。"
---

# ListVirtual 虚拟列表

虚拟列表组件，基于 List 封装，通过虚拟滚动高效渲染大数据集，自动管理分页、下拉刷新、上拉加载。

## 何时使用

- 大数据列表（性能关键场景）
- 需要虚拟滚动的列表
- 需要分页 + 虚拟化的列表

## 组件路径

- 源码: `packages/__components/list-virtual/src/list-virtual-test.vue`
- 类型: `packages/__components/list-virtual/src/types.ts`
- 入口: `packages/__components/list-virtual/index.ts`

> 注：入口实际导出的源码文件为 `list-virtual-test.vue`，组件名为 `ky-list-virtual`。

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| fetch | (page: number) => Promise<{ total: number; data: T[] }> | - | 分页数据获取函数（必填） |
| itemHeight | number | - | 列表项高度（启用虚拟滚动的前提） |
| itemSpace | number | - | 列表项间距 |
| overscan | number | - | 预渲染缓冲区项数 |
| getKey | any | - | 自定义 key 获取函数 |
| scrollViewProps | ScrollViewProps | - | scroll-view 相关 props 透传 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| - | - | - |

## Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 列表项内容 | { data: T & { index }, index } |
| beforeContent | 列表内容之前的自定义内容 | - |
| empty | 自定义空状态 | - |
| finished | 自定义加载完成提示 | - |
| skeleton | 自定义骨架屏内容 | - |

## 使用示例

```vue
<template>
  <ky-list-virtual
    :fetch="fetchList"
    :item-height="80"
    :item-space="10"
    :overscan="5"
  >
    <template #default="{ data }">
      <ky-cell :title="data.title" :value="data.value" />
    </template>

    <template #skeleton>
      <view class="skeleton-item">加载中...</view>
    </template>
  </ky-list-virtual>
</template>

<script setup>
const fetchList = async (page) => {
  const res = await api.getList({ page })
  return { total: res.total, data: res.list }
}
</script>
```
