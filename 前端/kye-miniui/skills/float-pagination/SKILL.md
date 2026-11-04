---
name: "float-pagination"
description: "浮动分页组件，用于浮动页面序号导航。当需要浮动分页导航上一条/下一条切换时调用。"
---

# FloatPagination 浮动分页

浮动分页组件，用于浮动页面序号导航，支持上一条/下一条切换与收起/展开。

## 何时使用

- 详情页浮动序号导航
- 上一条/下一条切换
- 快速页面切换

## 组件路径

- 源码: `packages/__components/float-pagination/src/float-pagination.vue`
- 类型: `packages/__components/float-pagination/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| open | boolean | false | 是否展开（支持 v-model:open） |
| currentIndex | number | 1 | 当前序号 |
| modelValue | number | 1 | 当前页码（支持 v-model，主用） |
| min | number | 1 | 最小值 |
| max | number | 1000 | 最大值 |
| prevText | string | '上一票' | 上一页文案 |
| nextText | string | '下一票' | 下一页文案 |
| disabled | boolean | - | 是否禁用 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:open | 展开/收起状态变化时触发 | (open: boolean) |
| update:modelValue | 页码变化时触发 | (value: number) |
| change | 页码变化时触发 | (value: number) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| prev | 自定义上一页内容 |
| next | 自定义下一页内容 |

## 使用示例

```vue
<template>
  <ky-float-pagination
    v-model="current"
    v-model:open="open"
    :min="1"
    :max="total"
    prev-text="上一条"
    next-text="下一条"
    @change="onChange"
  />
</template>

<script setup>
import { ref } from 'vue'
const current = ref(1)
const open = ref(true)
const total = ref(100)
const onChange = (v) => console.log('切换到', v)
</script>
```
