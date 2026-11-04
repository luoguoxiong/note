---
name: "swiper-item"
description: "轮播项组件，用于轮播图中的单个项。当需要轮播图中的单个滑动项时调用。"
---

# SwiperItem 轮播项

轮播项组件，用于轮播图中的单个项。

## 何时使用

- 单个滑动内容
- 轮播项

## 组件路径

- 源码: `packages/__components/swiper-item/src/swiper-item.vue`
- 类型: `packages/__components/swiper-item/src/types.ts`

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 轮播项内容 |

## 使用示例

```vue
<template>
  <ky-swiper>
    <ky-swiper-item>
      <div class="slide">Slide 1</div>
    </ky-swiper-item>
    <ky-swiper-item>
      <div class="slide">Slide 2</div>
    </ky-swiper-item>
  </ky-swiper>
</template>
```
