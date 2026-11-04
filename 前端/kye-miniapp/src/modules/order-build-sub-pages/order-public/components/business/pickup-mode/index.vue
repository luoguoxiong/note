<template>
  <div
    class="pickup-mode"
    :class="{ disabled: disabled }"
    id="PickupMode"
    :type="type"
    :visible="visible"
    v-if="pickupModeVisible && dynamicConfigInfoVisible"
  >
    <component :disabled="disabled" :is="moduleStyleMap[props.moduleStyle]" />
  </div>
</template>
<script setup lang="ts">
import { computed, DefineComponent } from 'vue'
import Popup from './popup/index.vue'
import { PickModule, PickupMode } from '@order-public-sub-public/types'
import { moduleDemensionData } from './hooks/state'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const props = withDefaults(defineProps<PickModule<PickupMode>>(), {
  moduleStyle: 'popup',
})

const dynamicConfigInfo = computed(() => {
  return piniaStore.globalData.dynamicConfig('pickupModeExtraInfo')
})

const dynamicConfigInfoVisible = computed(() => {
  // 用于新前端，老后端，后端没有返回 visible字段的时候，需要展示
  if (dynamicConfigInfo.value?.visible === undefined) {
    return true
  }
  return dynamicConfigInfo.value?.visible
})

type ModuleStyleMap = Record<string, DefineComponent>
const moduleStyleMap: ModuleStyleMap = {
  popup: Popup as DefineComponent,
}

const pickupModeVisible = computed(() => {
  return props.visible && moduleDemensionData.value?.pickupModeList?.length
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
