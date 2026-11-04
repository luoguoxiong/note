# 按钮

- 基于 vant 4.0 的 button 进行二次封装

## 示例图

<img src="https://ic-img.ky-express.com/netc/20230605_37958875429_!!1685952006115_758_98.png" />

## 引入

```js
import KyButton from '@order-public-sub-public/components/base/ky-button'
```

## 代码演示

```html
<template>
  <KyButton text="确认下单" @click="onClick" />

  <!-- 默认加载图标 -->
  <KyButton loading @onClick="onClick" />

  <!-- 朴素加载图标 -->
  <KyButton plain loading @onClick="onClick" />
</template>
```

## Props

| 参数        | 说明         | 类型    | 默认值  |
| ----------- | ------------ | ------- | ------- |
| text        | 按钮文案     | String  | 按钮    |
| disabled    | 禁止点击     | Boolean | false   |
| type        | 按钮类型     | String  | primary |
| loadingType | 加载图标类型 | String  | primary |

## Event

| 事件    | 说明           | 回调参数 |
| ------- | -------------- | -------- |
| click | 点击按钮时触发 | -        |

注：除了以上的 props 属性和事件，也支持 vant 的 props 和事件
