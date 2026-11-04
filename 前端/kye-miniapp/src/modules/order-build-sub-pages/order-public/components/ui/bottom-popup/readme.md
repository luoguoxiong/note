# 底部弹窗

- 基于 vant 4.0 的 van-popup 进行二次封装

## 示例图

<img src="https://ic-img.ky-express.com/netc/20230803_76558875493_!!1691026127330_469_827.png" />

暂无

## 引入

```js
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup'
```

## 代码演示

```html
<template>
  <BottomPopup v-model:show="show" />
</template>
```

## Props

| 参数       | 说明             | 类型    | 默认值     |
| ---------- | ---------------- | ------- | ---------- |
| v-model    | 显示隐藏         | Boolean | false      |
| title      | 标题             | String  | '标题'     |
| tipIcon    | 头部提示图标     | String  | 'tips'     |
| tipText    | 头部提示文案     | String  | '标题文案' |
| showFooter | 是否显示底部区块 | Boolean | true       |

## Event

| 事件      | 说明 | 回调参数 |
| --------- | ---- | -------- |
| onConfirm | 确定 | -        |
| onClose   | 关闭 | -        |

## Slot

| 名称    | 说明 |
| ------- | ---- |
| default | 默认内容 |
| header | 头部内容 |
| footer | 底部内容 |

注：除了以上的 props 属性和事件，也支持 vant 的 props 和事件
