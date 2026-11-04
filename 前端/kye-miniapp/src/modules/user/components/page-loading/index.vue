<template>
  <!-- 预加载图：脱离布局、移出屏幕外、透明，仅用于触发浏览器加载并缓存图片 -->
  <img v-if="preload" class="user-page-loading__preload" :src="img" alt="" />
  <div v-if="show" class="user-page-loading">
    <div class="user-page-loading__box">
      <img class="user-page-loading__box--img" :src="img" alt="" />
      <div class="user-page-loading__box--text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const DEFAULT_IMG = 'https://ic-img.ky-express.com/netc/20260211_26994_!!1770793175679_160_116.gif'

withDefaults(
  defineProps<{
    show: boolean
    img?: string
    text?: string
    preload?: boolean
  }>(),
  {
    show: true,
    img: DEFAULT_IMG,
    text: '正在加载中',
    preload: false,
  },
)
</script>

<style lang="scss">
.user-page-loading__preload {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}
.user-page-loading {
  height: 100vh;
  background: #f1f2f7;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  &__box {
    padding-bottom: 84px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    // transform: translateY(-50%);
    &--img {
      width: 160px;
      height: 116px;
    }
    &--text {
      margin-top: 16px;
      line-height: 40px;
      color: #686b75;
      font-size: 28px;
      text-align: center;
    }
  }
}
</style>
