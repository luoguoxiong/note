<template>
  <div class="first-loading">
    <div class="first-loading__skeleton">
      <div class="first-loading__bg-container">
        <img
          src="https://ic-img.ky-express.com/netc/20240509_32970395158_!!1715255878377_496_200.png"
          class="first-loading__img"
        />
        <img
          src="https://ic-img.ky-express.com/netc/20240509_32970395158_!!1715255878377_496_200.png"
          class="first-loading__img"
        />
      </div>
      <img
        src="https://ic-img.ky-express.com/netc/20240509_19770395130_!!1715255897690_496_200.png"
        class="first-loading__img"
      />
      <img
        src="https://ic-img.ky-express.com/netc/20240509_2970395148_!!1715255910034_496_200.gif"
        class="first-loading__truck"
      />
      <div class="first-loading__text">{{ text || '页面努力加载中，请耐心稍等' }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
interface LoadingPorpos {
  text?: string
}
defineProps<LoadingPorpos>()
</script>
<style lang="scss" scoped>
@import './index.scss';
</style>
