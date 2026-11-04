<template>
  <div
    v-if="visible"
    class="receive"
    id="Receive"
    :class="{ 'padding-style': moduleStyle === 'unfold', disabled: disabled }"
  >
    <component v-bind="props" :is="componentsMap[moduleStyle]" />
  </div>
</template>

<script setup lang="ts">
// 类型
import { PickModule, AddressConfig } from '@order-public-sub-public/types'
// 组件
import componentsMap from './config/componentsMap'
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
