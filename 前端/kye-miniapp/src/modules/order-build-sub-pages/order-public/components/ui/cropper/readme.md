# 图片裁切

- 基于 vant 4.0 的 van-popu 和 vue-cropper 插件 进行二次封装

## 引入

```js
import Cropper from '@order-public-sub-public/components/ui/cropper/index.vue'
```

## 代码演示

```html
<template>
  <Cropper
    v-model:show="showCropper"
    :img="ocrImg"
    :autoCropWidth="400"
    :autoCropHeight="540"
    @onCancel="showCropper = false"
    @onChoose="onCropperChoose"
    @onComplete="onCropperComplete"
  />
</template>
```

## Props

| 参数           | 说明           | 类型    | 默认值 |
| -------------- | -------------- | ------- | ------ |
| show           | 显示隐藏       | Boolean | false  |
| img            | 需要裁切的图片 | Boolean | false  |
| autoCropWidth  | 裁切窗口宽度   | Number  | 400    |
| autoCropHeight | 裁切窗口高度   | Number  | 540    |

## Event

| 事件              | 说明                                 | 回调参数         |
| ----------------- | ------------------------------------ | ---------------- |
| onCancel          | 取消                                 | -                |
| onCropperChoose   | 换个照片                             | -                |
| onCropperComplete | 完成（回调参数返回一个 base64 图片） | function(img) {} |

注：除了以上的 props 属性和事件，也支持 vant 的 props 和事件
