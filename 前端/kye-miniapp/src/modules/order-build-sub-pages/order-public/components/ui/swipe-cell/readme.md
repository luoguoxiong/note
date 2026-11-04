# 滑动单元格

- 基于 vant 4.0 的 SwipeCell 进行二次封装

## 示例图

<img src="https://ic-img.ky-express.com/netc/20230801_80158875413_!!1690895702533_568_181.png" />

## 引入

```js
import SwipeCell from '@order-public-sub-public/components/ui/swipe-cell'
```

## 代码演示

```html
<template>
  <SwipeCell />
</template>
```

## Event

| 事件     | 说明 | 回调参数 |
| -------- | ---- | -------- |
| onDelete | 删除 | -        |

## Slot

| 事件    | 说明           |
| ------- | -------------- |
| default | 默认显示的内容 |

注：除了以上的 props 属性和事件，也支持 vant 的 props 和事件
