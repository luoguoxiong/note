# 上拉刷新、下拉加载列表

- 基于 vant 4.0 的 van-pull-refresh 和 van-list 进行二次封装

## 示例图

暂无

## 引入

```js
import ListRefreshLoad from '@order-public/components/ui/list-refresh-load'
```

## 代码演示

```html
<template>
  <ListRefreshLoad
    :refreshing="refreshing"
    :loading="loading"
    :finished="finished"
    :isNeedRefresh="isNeedRefresh"
    @onLoad="onLoad"
    @onRefresh="onRefresh"
  >
    <!-- 内容 -->
  </ListRefreshLoad>
</template>
```

## Props

| 参数          | 说明             | 类型    | 默认值 |
| ------------- | ---------------- | ------- | ------ |
| refreshing    | 下拉加载         | Boolean | false  |
| loading       | 加载             | Boolean | false  |
| finished      | 加载完成         | Boolean | false  |
| isNeedRefresh | 是否支持下拉刷新 | Boolean | false  |
| finishedText  | 底部加载完成文案 | String  | false  |

## Event

| 事件      | 说明     | 回调参数 |
| --------- | -------- | -------- |
| onLoad    | 上拉加载 | -        |
| onRefresh | 下拉刷新 | -        |

注：除了以上的 props 属性和事件，也支持 vant 的 props 和事件
