<template>
  <div v-if="visible" class="sender" :class="{ disabled: disabled }" id="Sender">
    <component v-bind="props" :is="componentsMap[moduleStyle]" />
  </div>
</template>

<script setup lang="ts">
// 组件
import componentsMap from './config/componentsMap'
// 类型
import { AddressConfig, PickModule } from '@order-public-sub-public/types'
// import { useDefer } from '@order-public-sub-public/hooks/useDefer'

// const derfer = useDefer()

const props = withDefaults(defineProps<PickModule<AddressConfig | { disabled?: boolean }>>(), {
  moduleStyle: '',
  visible: false,
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
