---
name: "transition"
description: "过渡动画组件，用于元素动画过渡。当需要元素进入/离开动画时调用。"
---

# Transition 过渡动画

过渡动画组件，用于元素动画过渡。

## 何时使用

- 元素进入/离开动画
- 过渡效果
- 动画组件

## 组件路径

- 源码: `packages/__components/transition/src/transition.vue`
- 类型: `packages/__components/transition/src/types.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| show | boolean | false | 是否显示 |
| name | string | 'fade' | 过渡动画名称 |
| duration | number \| [number, number] | 300 | 动画时长（毫秒），支持数组 [进场, 出场] |
| customerClass | (string \| false)[] | - | 自定义类名 |
| customerStyle | CSSProperties | - | 自定义样式 |
| hideNode | boolean | true | 是否隐藏节点 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| before-enter | 进入前触发 | - |
| enter | 进入时触发 | - |
| after-enter | 进入后触发 | - |
| before-leave | 离开前触发 | - |
| leave | 离开时触发 | - |
| after-leave | 离开后触发 | - |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 过渡内容 |

## 使用示例

```vue
<template>
  <ky-transition :show="show" name="fade">
    <div>动画内容</div>
  </ky-transition>
</template>
```
