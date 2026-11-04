---
name: "cropper-image"
description: "图片裁剪组件，用于上传前裁剪图片。当需要裁剪图片（如头像）时调用，支持宽高比与质量配置。"
---

# CropperImage 图片裁剪

图片裁剪组件，用于上传前裁剪图片，支持自定义裁剪框宽高比、输出格式与质量。

## 何时使用

- 头像裁剪
- 上传前图片编辑
- 个人头像选择
- 图片裁剪后上传

## 组件路径

- 源码: `packages/__components/cropper-image/src/index.vue`
- 类型: `packages/__components/cropper-image/src/type.ts`
- 工具: `packages/__components/cropper-image/src/utils.ts`

## Props 入参

| 参数 | 类型 | 默认值 | 说明 |
| ---- | ---- | ------- | ----------- |
| imagePath | string | - | 图片地址（必填） |
| debug | boolean | - | 是否开启 debug |
| minBoxWidthRatio | number | 0.15 | 最小剪裁框宽度与原图宽度比率 |
| minBoxHeightRatio | number | 0.15 | 最小剪裁框高度与原图高度比率 |
| initialBoxWidthRatio | number | 0.6 | 剪裁框初始宽度比率（占图片宽度） |
| initialBoxHeightRatio | number | 0.6 | 剪裁框初始高度比率（设置 aspectRatio 时无效） |
| aspectRatio | number / null | null | 目标图片宽高比（>0 限制裁剪宽高比，null 不限制） |
| outputFileType | 'jpg' / 'png' | 'jpg' | 输出文件类型 |
| quality | number | 1 | 图片质量（范围 0-1） |
| maxCanvasSize | number | 1000 | 最大 canvas 画布宽度（避免内存溢出） |

## Events 事件

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| ok | 确认裁剪时触发 | (base64: string) |

## 使用示例

```vue
<template>
  <ky-cropper-image
    :image-path="imageSrc"
    :aspect-ratio="1"
    output-file-type="png"
    :quality="0.9"
    @ok="onCrop"
  />
</template>

<script setup>
const imageSrc = ref('https://example.com/avatar.jpg')
const onCrop = (base64) => {
  console.log('裁剪结果 base64:', base64)
  // 上传 base64
}
</script>
```
