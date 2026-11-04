---
name: "swiper"
description: "轮播图组件，用于图片轮播或内容滑动。当需要图片轮播或内容滑动时调用。"
---

# Swiper 轮播图

轮播图组件，用于图片轮播或内容滑动。支持水平/垂直方向、自动播放、循环、分页指示器等。

## 何时使用

- 图片轮播
- 内容滑动
- Banner 轮播
- 引导页

## 组件路径

- 源码: `packages/__components/swiper/src/swiper.vue`
- 类型: `packages/__components/swiper/src/types.ts`（types.ts 为空，props 在 vue 文件中内联定义）

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| width | number \| string | - | 宽度 |
| height | number \| string | - | 高度 |
| direction | 'horizontal' \| 'vertical' | 'horizontal' | 滑动方向 |
| paginationVisible | boolean | false | 是否显示分页指示器 |
| paginationColor | string | 'rgba(255, 255, 255, 1)' | 选中分页点颜色 |
| paginationUnselectedColor | string | 'rgba(255, 255, 255, 0.5)' | 未选中分页点颜色 |
| paginationOffset | number | 12 | 分页指示器偏移量（rpx） |
| loop | boolean | true | 是否循环 |
| duration | number \| string | 500 | 切换动画时长（毫秒） |
| autoPlay | number \| string | 0 | 自动播放间隔（毫秒，0 表示不自动播放） |
| initPage | number \| string | 0 | 初始页码 |
| touchable | boolean | true | 是否允许手势滑动 |
| isPreventDefault | boolean | true | 是否阻止 touch 默认行为 |
| isStopPropagation | boolean | true | 是否阻止 touch 冒泡 |
| images | array | [] | 图片数组（用于子项注册计数，配合 ky-swiper-item 使用） |
| scale | number | 1 | 缩放比例 |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| change | 切换时触发 | (index: number) |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| default | 轮播项内容（ky-swiper-item） |
| page | 自定义分页指示器 |

## Expose 暴露方法

| 方法名 | 说明 |
| ---- | ---- |
| next | 下一页 |
| prev | 上一页 |
| to | 跳转到指定页 |

## 使用示例

```vue
<template>
  <!-- 基础用法 -->
  <ky-swiper :auto-play="3000" :loop="true" pagination-visible>
    <ky-swiper-item v-for="item in items" :key="item.id">
      <img :src="item.image" />
    </ky-swiper-item>
  </ky-swiper>

  <!-- 垂直滑动 -->
  <ky-swiper direction="vertical" :auto-play="3000">
    <ky-swiper-item v-for="item in items" :key="item.id">
      <view>{{ item.text }}</view>
    </ky-swiper-item>
  </ky-swiper>

  <!-- 配合 images 数组（推荐用于子项注册） -->
  <ky-swiper :images="images" :auto-play="3000" pagination-visible>
    <ky-swiper-item v-for="(item, index) in images" :key="index">
      <img :src="item.src" />
    </ky-swiper-item>
  </ky-swiper>
</template>

<script setup>
const items = [
  { id: 1, image: 'https://example.com/1.jpg' },
  { id: 2, image: 'https://example.com/2.jpg' }
]
const images = [{ src: 'https://example.com/1.jpg' }, { src: 'https://example.com/2.jpg' }]
</script>
```
