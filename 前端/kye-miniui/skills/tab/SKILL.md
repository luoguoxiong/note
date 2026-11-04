---
name: "tab"
description: "标签页组件，用于标签导航切换。当需要标签页导航切换内容时调用，支持胶囊/普通/暗色主题及徽标。"
---

# Tab 标签页

标签页组件，用于标签导航。注意：本组件是**标签头部**组件，内容切换需配合业务自行通过 `v-model` 控制。

## 何时使用

- 标签导航
- 内容切换
- 标签页界面
- 带徽标的标签

## 组件路径

- 源码: `packages/__components/tab/src/tab.vue`
- 类型: `packages/__components/tab/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| modelValue | string / number | -1 | 当前激活的标签索引/值（支持 v-model） |
| tabs | TabOptions[] | - | 标签选项数组 |
| distributeEvenly | boolean | true | 是否将标签宽度均分 |
| underline | boolean | true | 是否展示下画线 |
| underlineFirstAnimation | boolean | false | 下画线是否展示首次动画 |
| maxBadgeCount | number | 99 | 徽标展示的最大值（超过显示 `maxBadgeCount+`） |
| theme | 'default' / 'capsule' / 'dark' | 'default' | 主题类型：默认/胶囊/暗色 |
| disabledScrollIntoView | boolean | - | 是否禁用滚动到可视区 |
| noAnimation | boolean | false | 关闭动画（动态 tab 场景避免抖动） |
| dynamicTab | boolean | false | 是否动态 tab（动态 tab 不使用动画） |
| offsetLeft | number | 0 | 左偏移 |
| disableTabClick | boolean | false | 是否禁用 tab 点击 |
| sticky | boolean | false | 是否吸顶 |
| offsetTop | number | 0 | 吸顶时的顶部偏移 |
| showScrollbar | boolean | true | 是否显示滚动条 |

## TabOptions 类型

```typescript
interface TabOptions {
  label: string            // 标签文本
  badgeCount?: number      // 徽标计数
  showBadgeDot?: boolean   // 徽标红点
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:modelValue | 激活项变化时触发 | (value: string / number) |

## Slots 插槽

| 插槽名 | 说明 | 参数 |
| ---- | ---- | ---- |
| label | 自定义标签文本 | { label } |
| badge | 自定义徽标内容 | { label: badgeCount } |

## 使用示例

```vue
<template>
  <ky-tab v-model="active" :tabs="tabs" theme="default" underline />

  <!-- 胶囊主题 -->
  <ky-tab v-model="active" :tabs="tabs" theme="capsule" />

  <!-- 暗色主题 -->
  <ky-tab v-model="active" :tabs="tabs" theme="dark" />

  <!-- 带徽标 -->
  <ky-tab v-model="active" :tabs="tabsWithBadge" />
</template>

<script setup>
import { ref } from 'vue'

const active = ref(0)
const tabs = [
  { label: '标签1' },
  { label: '标签2' },
  { label: '标签3' },
]
const tabsWithBadge = [
  { label: '消息', badgeCount: 5 },
  { label: '待办', badgeCount: 100, showBadgeDot: false },
  { label: '我的' },
]
</script>
```
