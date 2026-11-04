<template>
  <!-- <i v-if="localSvgNames[name]" :class="['svg-icon', name]" :style="{ backgroundImage: `url(${require(`../../../icons/svg/${name}.svg`)})` }"></i> -->
  <i :class="['svg-icon', name]" :style="{ backgroundImage: `url(${url})` }"></i>
</template>

<script setup lang="ts">
// import { localSvgNames } from '@order-public-sub-public/icons/svgNames'
const props = defineProps<{
  name: string
  imgUrl?: string
}>()

const url = props.imgUrl || `https://ic-img.ky-express.com/netc-minapp/svg/order/${props.name}.svg`
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
