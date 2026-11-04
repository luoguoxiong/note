<template>
  <!-- 判断是否是微信的Skyline环境，若是，则使用open-container包裹 -->
  <view v-if="isWEAPP" v-bind="$attrs">
    <open-container
      closed-color="white"
      middle-color="yellow"
      open-color="white"
      closed-elevation="1"
      open-elevation="4"
      closed-border-radius="32"
      open-border-radius="0"
      transition-type="fade"
      transition-duration="300"
      @tap="handleClick"
    >
      <!-- 渲染传入的业务组件 -->
      <slot></slot>
    </open-container>
  </view>
  <!-- 如果不是Skyline，直接渲染业务组件 -->
  <view v-else v-bind="$attrs" @click="handleClick">
    <slot></slot>
  </view>
</template>

<script setup>
import Taro from '@tarojs/taro'

// 判断当前是否是微信的环境
const isWEAPP = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

const props = defineProps({
  onClick: {
    type: Function,
    required: true
  }
})

// 定义一个方法来处理click事件，触发父组件传递过来的事件处理函数
const handleClick = (event) => {
  console.log('click event triggered in TransitionWrapper')
  // 调用父组件传递的click事件处理函数
  props.onClick(event)
}
</script>
