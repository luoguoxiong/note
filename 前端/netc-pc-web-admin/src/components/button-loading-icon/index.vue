<template>
  <img
    class="button-loading-icon"
    :src="src"
    :style="{ width: `${size}px`, height: `${size}px`, marginRight: `${mr}px` }"
    alt=""
  />
</template>

<script setup lang="ts">
interface ButtonLoadingIconProps {
  // 加载图来源，默认沿用原首页按钮组件的加载图
  src?: string
  // 图标尺寸（px）
  size?: number
  // 图标与文字间距（px），按钮自身为 gap 布局时传 0
  mr?: number
}

withDefaults(defineProps<ButtonLoadingIconProps>(), {
  src: 'https://ic-img.ky-express.com/netc/20260518_8575_!!1779069676503_45_45.png',
  size: 13,
  mr: 4,
})
</script>

<style lang="scss" scoped>
.button-loading-icon {
  animation: button-loading-spin 1s linear infinite;
}

@keyframes button-loading-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
