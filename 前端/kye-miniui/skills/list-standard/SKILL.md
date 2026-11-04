---
name: "list-standard"
description: "标准列表组件，封装下拉刷新、上拉加载、空状态/失败重试的完整列表。当需要标准分页列表时调用。"
---

# ListStandard 标准列表

标准列表组件，内部基于 List 封装，自动管理分页、下拉刷新、上拉加载、空状态与加载失败重试。

## 何时使用

- 标准分页列表（仅需提供 fetch 函数）
- 需要下拉刷新 + 上拉加载的列表
- 需要统一空状态/失败重试的列表

## 组件路径

- 源码: `packages/__components/list-standard/src/list-standard.vue`
- 类型: `packages/__components/list-standard/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| fetch | (page: number) => Promise<{ total: number; data: T[] }> | - | 分页数据获取函数（必填） |
| shallowRef | boolean | - | 是否使用 shallowRef 存储列表数据 |
| scrollViewProps | ScrollViewProps | - | scroll-view 相关 props 透传 |
| showLoading | boolean | - | 是否显示加载 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| - | - | - |

## Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 列表项内容 | { data: T } |
| beforeContent | 列表内容之前的自定义内容 | - |
| empty | 自定义空状态 | - |
| finished | 自定义加载完成提示 | - |
| load-fail | 自定义加载失败提示 | - |

## 使用示例

```vue
<template>
  <ky-list-standard :fetch="fetchList">
    <template #default="{ data }">
      <ky-cell :title="data.title" :value="data.value" />
    </template>

    <template #empty>
      <ky-empty description="暂无数据" />
    </template>
  </ky-list-standard>
</template>

<script setup>
const fetchList = async (page) => {
  const res = await api.getList({ page })
  return {
    total: res.total,
    data: res.list,
  }
}
</script>
```
