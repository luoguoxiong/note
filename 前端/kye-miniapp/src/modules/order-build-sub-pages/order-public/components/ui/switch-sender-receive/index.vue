<template>
  <span class="switch-icon" @click.stop="onSwitchAddress">
    <SvgIcon name="switch-icon"></SvgIcon>
  </span>
</template>

<script setup lang="ts">
// 组件
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

const emit = defineEmits(['onSwitchAddress'])

const onSwitchAddress = () => emit('onSwitchAddress')
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
