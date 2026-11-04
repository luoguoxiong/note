<template>
  <span class="switch-icon" @click.stop="onSwitchAddress">
    <SvgIcon name="switch-icon"></SvgIcon>
  </span>
</template>

<script setup lang="ts">
// 组件
import SvgIcon from '../svg-icon/index.vue'

const emit = defineEmits(['onSwitchAddress'])

const onSwitchAddress = () => emit('onSwitchAddress')
</script>

<style lang="scss">
@import '../../../styles/index.scss';

@import './index.scss';
</style>
