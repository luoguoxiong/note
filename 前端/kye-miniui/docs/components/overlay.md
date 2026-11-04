# Overlay

<code-preview path="demos/overlay/overlay-1.vue" title="基本使用" description="各种遮罩层用法示例"></code-preview>

## 基本使用

遮罩层组件用于在页面上显示一个半透明的遮罩，通常用于阻止用户操作、显示弹窗背景或加载状态。

```html
<template>
  <ky-button @click="visible = true">显示遮罩</ky-button>
  <ky-overlay v-model:show="visible"></ky-overlay>
</template>

<script setup>
import { ref } from "vue";
const visible = ref(false);
</script>
```

## 自定义遮罩内容

通过默认插槽在遮罩层内部放置自定义内容，如加载动画、提示信息等。

```html
<template>
  <ky-button @click="visible = true">显示遮罩</ky-button>
  <ky-overlay v-model:show="visible">
    <view class="overlay-content">
      <view class="loading-icon">⏳</view>
      <view class="loading-text">加载中...</view>
    </view>
  </ky-overlay>
</template>

<script setup>
import { ref } from "vue";
const visible = ref(false);
</script>

<style scoped>
.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.loading-icon {
  font-size: 60rpx;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #fff;
}
</style>
```

## 动画时长

通过 duration 属性设置动画持续时间，支持单一数值或数组形式。

```html
<!-- 统一设置进场和出场时长 -->
<ky-overlay v-model:show="visible" :duration="500" />

<!-- 分别设置进场和出场时长 -->
<ky-overlay v-model:show="visible" :duration="[200, 400]" />
```

## 点击遮罩关闭

通过 closeOnClickOverlay 属性控制点击遮罩是否关闭。

```html
<!-- 点击遮罩关闭（默认） -->
<ky-overlay v-model:show="visible" />

<!-- 禁止点击遮罩关闭 -->
<ky-overlay v-model:show="visible" :close-on-click-overlay="false" />
```

## 遮罩层级

通过 zIndex 属性设置遮罩的层级。

```html
<ky-overlay v-model:show="visible" :z-index="1000" />
```

## 滑动穿透

通过 catchMove 属性控制触摸事件是否穿透遮罩。

```html
<!-- 禁止滑动穿透（默认） -->
<ky-overlay v-model:show="visible" />

<!-- 允许滑动穿透 -->
<ky-overlay v-model:show="visible" :catch-move="false" />
```

## 自定义样式

通过 overlayClass 属性添加自定义样式类名。

```html
<ky-overlay v-model:show="visible" overlay-class="custom-overlay" />
```

```css
.custom-overlay {
  background-color: rgba(0, 0, 0, 0.8);
}
```

## 隐藏节点优化

通过 hideNode 属性控制遮罩隐藏时是否从 DOM 中移除节点。

```html
<!-- 隐藏时移除节点（默认） -->
<ky-overlay v-model:show="visible" />

<!-- 隐藏时保留节点 -->
<ky-overlay v-model:show="visible" :hide-node="false" />
```

## 事件监听

监听 clickOverlay 事件在点击遮罩时执行自定义逻辑。

```html
<template>
  <ky-button @click="visible = true">显示遮罩</ky-button>
  <ky-overlay 
    v-model:show="visible" 
    @click-overlay="handleClickOverlay"
  ></ky-overlay>
</template>

<script setup>
import { ref } from "vue";
const visible = ref(false);

const handleClickOverlay = () => {
  console.log('遮罩被点击');
};
</script>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| show | 是否显示遮罩（支持 v-model:show） | boolean | - | - |
| duration | 动画持续时间（ms），支持 [进场, 出场] | number \| [number, number] | - | 300 |
| closeOnClickOverlay | 点击遮罩是否关闭 | boolean | - | true |
| zIndex | 遮罩层级 | number | - | 10 |
| hideNode | 隐藏节点优化（配合过渡） | boolean | - | true |
| overlayClass | 自定义遮罩样式类名 | string | - | - |
| catchMove | 是否禁止触摸事件穿透 | boolean | - | true |

### Events

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | v-model 同步（关闭或打开遮罩） | `(value: boolean)` |
| clickOverlay | 点击遮罩时触发 | `()` |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| default | 遮罩内部内容（可放提示、加载动画等） |