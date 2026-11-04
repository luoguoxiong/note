<template>
  <view class="hot-zone" v-show="hotZoneVisible" @click="validateCallback"> </view>
</template>

<script setup lang="ts">
import { useHotZone } from './hooks/useHotZone'
import { ModuleType } from '@order-public-sub-public/constants'

const props = defineProps<{
  moduleType: ModuleType
}>()

defineEmits(['click'])
const { validateCallback, hotZoneVisible } = useHotZone(props.moduleType)
</script>
<style lang="scss">
.hot-zone {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 12;
}
</style>
