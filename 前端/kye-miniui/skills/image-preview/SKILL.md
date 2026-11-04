---
name: "image-preview"
description: "图片预览组件，支持滑动、缩放和旋转。当需要预览图片时调用。"
---

# ImagePreview 图片预览

图片预览组件，支持滑动切换、双指缩放、单指拖动、旋转和下载。支持组件式调用与函数式调用（`showImagePreview`）。

## 何时使用

- 图片画廊预览
- 全屏图片查看
- 带分页的图片轮播
- 图片下载/保存到相册

## 组件路径

- 源码: `packages/__components/image-preview/src/image-preview.vue`
- 类型: `packages/__components/image-preview/src/types.ts`
- 函数调用: `packages/__components/image-preview/src/showImagePreview.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| show | boolean | false | 是否显示预览 |
| images | ImageInterface[] | [] | 图片数组 |
| autoplay | string \| number | 3000 | 自动播放间隔（实际传给 swiper，当前实现固定为 0） |
| isLoop | boolean | true | 是否循环 |
| showIndex | boolean | true | 是否显示索引（顶部 "1/N"） |
| closeable | boolean | true | 是否显示关闭按钮 |
| contentClose | boolean | true | 点击内容是否关闭 |
| activeIndex | number | 0 | 初始激活索引 |
| closeOnClickOverlay | boolean | true | 点击遮罩是否关闭 |
| showPagination | boolean | true | 是否显示分页（左右翻页按钮，images 长度 ≥ 2 时显示） |
| showMenuByLongpress | boolean | false | 长按图片是否显示菜单（仅 app 环境生效，触发保存图片菜单） |

## ImageInterface 类型

```typescript
interface ImageInterface {
  src: string
}
```

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | 显示状态变化时触发 | (show: boolean) |
| update:activeIndex | 激活索引变化时触发 | (index: number) |
| close | 关闭时触发 | - |
| change | 切换图片时触发 | (index: number) |
| longPress | 长按时触发 | (image: ImageInterface) |
| download | 下载时触发 | (image: ImageInterface, index: number) |
| shareImage | 分享图片时触发 | - |
| shareImageError | 分享图片失败时触发 | - |

## Slots 插槽

| 插槽名 | 说明 |
| ---- | ---- |
| cover | 自定义右下角覆盖层（替换默认的下载/旋转按钮） |

## 使用示例

```vue
<template>
  <ky-image-preview
    v-model:show="show"
    :images="images"
    :active-index="currentIndex"
    @change="onChange"
    @download="onDownload"
  />
</template>

<script setup>
const show = ref(false)
const currentIndex = ref(0)
const images = [
  { src: 'https://example.com/1.jpg' },
  { src: 'https://example.com/2.jpg' }
]

const onChange = (index) => {
  console.log('切换到:', index)
}

const onDownload = (image, index) => {
  console.log('下载:', image.src)
}
</script>
```
