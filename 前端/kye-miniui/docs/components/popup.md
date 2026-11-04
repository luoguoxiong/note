# Popup

<code-preview path="demos/popup/popup-1.vue" title="基本使用" description="各种弹窗用法示例"></code-preview>

## 基本使用

弹窗组件用于在页面上弹出一个浮层，支持多种弹出位置和丰富的配置选项。

```html
<template>
  <ky-button @click="visible = true">显示弹窗</ky-button>
  <ky-popup v-model:show="visible">
    <view class="popup-content">
      <view>弹窗内容</view>
      <ky-button @click="visible = false">关闭</ky-button>
    </view>
  </ky-popup>
</template>

<script setup>
import { ref } from 'vue'
const visible = ref(false)
</script>
```

## 弹出位置

支持 top、bottom、left、right、center 五种弹出位置。

```html
<!-- 顶部弹出 -->
<ky-popup v-model:show="visible" position="top">顶部弹窗</ky-popup>

<!-- 底部弹出 -->
<ky-popup v-model:show="visible" position="bottom">底部弹窗</ky-popup>

<!-- 左侧弹出 -->
<ky-popup v-model:show="visible" position="left">左侧弹窗</ky-popup>

<!-- 右侧弹出 -->
<ky-popup v-model:show="visible" position="right">右侧弹窗</ky-popup>

<!-- 居中弹出（默认） -->
<ky-popup v-model:show="visible" position="center">居中弹窗</ky-popup>
```

## 点击遮罩关闭

通过 closeOnClickOverlay 属性控制点击遮罩是否关闭弹窗。

```html
<!-- 点击遮罩关闭（默认） -->
<ky-popup v-model:show="visible"></ky-popup>

<!-- 禁止点击遮罩关闭 -->
<ky-popup v-model:show="visible" :close-on-click-overlay="false">
  <view>
    <view>弹窗内容</view>
    <ky-button @click="visible = false">关闭</ky-button>
  </view>
</ky-popup>
```

## 圆角样式

通过 round 属性控制弹窗是否显示圆角。

```html
<!-- 带圆角（默认） -->
<ky-popup v-model:show="visible" position="bottom"></ky-popup>

<!-- 不带圆角 -->
<ky-popup v-model:show="visible" position="bottom" :round="false"></ky-popup>
```

## 安全区适配

通过 safe-area-inset-top 和 safe-area-inset-bottom 属性适配设备安全区。

```html
<!-- 顶部安全区适配 -->
<ky-popup v-model:show="visible" safe-area-inset-top></ky-popup>

<!-- 底部安全区适配 -->
<ky-popup v-model:show="visible" safe-area-inset-bottom></ky-popup>

<!-- 同时适配顶部和底部安全区 -->
<ky-popup v-model:show="visible" safe-area-inset-top safe-area-inset-bottom></ky-popup>
```

## 自定义样式

通过 contentClass 和 contentStyle 属性自定义弹窗样式。

```html
<!-- 自定义类名 -->
<ky-popup v-model:show="visible" content-class="my-popup"></ky-popup>

<!-- 自定义内联样式 -->
<ky-popup v-model:show="visible" :content-style="{ padding: '24px', width: '300px' }"></ky-popup>
```

## 动画时长

通过 duration 属性设置动画持续时间，支持单一数值或数组形式。

```html
<!-- 统一设置进场和出场时长 -->
<ky-popup v-model:show="visible" :duration="500"></ky-popup>

<!-- 分别设置进场和出场时长 -->
<ky-popup v-model:show="visible" :duration="[200, 400]"></ky-popup>
```

## 弹窗层级

通过 zIndex 属性设置弹窗的层级。

```html
<ky-popup v-model:show="visible" :z-index="2000"></ky-popup>
```

## 表单场景

弹窗常用于表单输入场景。

```html
<template>
  <ky-button @click="formVisible = true">打开表单</ky-button>
  <ky-popup v-model:show="formVisible" position="bottom">
    <view class="form-content">
      <ky-form :model-value="formData">
        <ky-input v-model="formData.name" placeholder="请输入姓名"></ky-input>
        <ky-input v-model="formData.phone" type="number" placeholder="请输入手机号"></ky-input>
      </ky-form>
      <view class="form-actions">
        <ky-button @click="formVisible = false">取消</ky-button>
        <ky-button type="primary" @click="submitForm">提交</ky-button>
      </view>
    </view>
  </ky-popup>
</template>

<script setup>
import { ref } from 'vue'
const formVisible = ref(false)
const formData = ref({
  name: '',
  phone: ''
})

const submitForm = () => {
  console.log('提交表单:', formData.value)
  formVisible.value = false
}
</script>

<style scoped>
.form-content {
  padding: 24px;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}
</style>
```

## 事件监听

监听弹窗的 open、close 和 clickOverlay 事件。

```html
<template>
  <ky-button @click="visible = true">显示弹窗</ky-button>
  <ky-popup
    v-model:show="visible"
    @open="handleOpen"
    @close="handleClose"
    @click-overlay="handleClickOverlay"
  >
    弹窗内容
  </ky-popup>
</template>

<script setup>
import { ref } from 'vue'
const visible = ref(false)

const handleOpen = () => {
  console.log('弹窗打开')
}

const handleClose = () => {
  console.log('弹窗关闭')
}

const handleClickOverlay = () => {
  console.log('点击遮罩')
}
</script>
```

## 组件 API

### Attributes

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| ---- | ---- | ---- | ---- | ---- |
| show | 是否展示弹窗（支持 v-model:show） | boolean | - | false |
| hideNode | 是否隐藏节点 | boolean | - | true |
| duration | 过渡动画时长（ms），支持 [进场, 出场] | number \| [number, number] | - | 300 |
| zIndex | 弹窗层级 | number | - | 100 |
| contentClass | 自定义内容容器类名 | string | - | '' |
| contentStyle | 自定义内容容器内联样式 | CSSProperties | - | {} |
| position | 弹出方向/位置 | 'top' \| 'bottom' \| 'left' \| 'right' \| 'center' | - | 'center' |
| closeOnClickOverlay | 点击遮罩是否关闭 | boolean | - | true |
| safeAreaInsetTop | 顶部安全区适配 | boolean | - | false |
| safeAreaInsetBottom | 底部安全区适配 | boolean | - | false |
| round | 是否展示圆角 | boolean | - | true |
| enable | 是否从页面中脱离出来 | boolean | - | true |
| offsetBottom | 底部偏移量 | number | - | 0 |

### Events

| 事件名 | 说明 | 回调参数 |
| ---- | ---- | ---- |
| update:show | v-model 双向绑定 | (value: boolean) |
| open | 弹窗打开时触发 | - |
| close | 弹窗关闭时触发 | - |
| clickOverlay | 点击遮罩触发 | - |

### Slots

| 插槽名 | 说明 |
| ---- | ---- |
| default | 弹窗内容区域 |