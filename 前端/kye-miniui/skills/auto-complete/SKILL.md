---
name: "auto-complete"
description: "自动完成输入组件，提供输入建议下拉列表。当需要输入框带自动建议功能时调用。"
---

# AutoComplete 自动完成

自动完成输入组件，基于 `ky-input` 与 `ky-popover` 封装，提供输入建议下拉列表功能。支持本地数据和远程异步搜索。

## 何时使用

- 输入框需要自动建议
- 搜索框带自动完成
- 输入时需要下拉建议
- 远程异步搜索建议

## 组件路径

- 源码: `packages/__components/auto-complete/src/auto-complete.vue`
- 类型: `packages/__components/auto-complete/src/types.ts`

## Props 入参

AutoComplete 继承自 `KyInputProps`（详见 input 组件），以下为自身扩展的属性：

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | string | '' | 输入值（继承自 KyInputProps） |
| fetchSuggestions | any[] \| ((queryString: string, cb: (data: any[]) => void) => any[] \| Promise<any[]>) | - | 获取输入建议的数据源或方法。传数组则按输入本地过滤；传函数则由调用方通过 `cb(data)` 返回建议 |
| hideLoading | boolean | false | 是否隐藏远程加载时的加载图标 |
| debounce | number | - | 获取输入建议的防抖延时（毫秒） |
| highlightFirstItem | boolean | false | 是否默认高亮搜索结果的第一项 |
| placement | 'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' | - | 菜单弹出位置（实际实现固定使用 popover 的 bottom） |

> 继承自 KyInputProps 的常用属性：`type`、`placeholder`、`disabled`、`readonly`、`clearable`、`isError`、`size`、`border` 等，详见 input 组件文档。

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 输入值变化时触发 | (value: string) |
| input | 输入时触发 | (value: string, event: Event) |
| focus | 获得焦点时触发 | - |
| blur | 失去焦点时触发 | - |
| clear | 清空时触发 | - |
| change | 清空触发时 | (value: string) |
| confirm | 确认时触发 | (value: string, event: Event) |
| keyboardHeightChange | 键盘高度变化时触发 | (event: Event) |
| click | 点击时触发 | - |
| select | 选择建议项时触发 | (item: any) |

## Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| default | 自定义单个建议项内容 | { item } |
| loading | 自定义加载中内容 | - |

## 使用示例

```vue
<template>
  <!-- 本地数据 -->
  <ky-auto-complete
    v-model="value"
    :fetch-suggestions="localSuggestions"
    placeholder="请输入关键词"
    @select="onSelect"
  />

  <!-- 远程异步搜索 -->
  <ky-auto-complete
    v-model="value"
    :fetch-suggestions="querySearch"
    :debounce="300"
    highlight-first-item
    placeholder="请输入关键词搜索"
    @select="onSelect"
  >
    <template #default="{ item }">
      <view class="custom-item">{{ item.name }}（{{ item.code }}）</view>
    </template>
  </ky-auto-complete>
</template>

<script setup>
const value = ref('')

// 本地数据：传数组
const localSuggestions = [
  { name: '北京', code: 'BJ' },
  { name: '上海', code: 'SH' },
  { name: '广州', code: 'GZ' }
]

// 远程异步：传函数，通过 cb 返回结果
const querySearch = (queryString, cb) => {
  fetchSuggestionsFromApi(queryString).then((results) => {
    cb(results)
  })
}

const onSelect = (item) => {
  console.log('选中:', item)
}
</script>
```
