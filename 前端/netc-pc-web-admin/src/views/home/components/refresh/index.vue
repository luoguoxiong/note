<template>
  <KButton text id="refresh" @click="toRefresh">
    <svg-icon name="refresh"></svg-icon>
    刷新
  </KButton>
</template>
<script setup lang="ts">
import { KButton } from '@netc-design-pc/ui'
interface RefreshProps {
  toRefresh: () => void
}
defineProps<RefreshProps>()
</script>
<style lang="scss" scoped>
#refresh {
  display: flex;
  align-items: center;
  font-size: 12px;
  z-index: 100;
  pointer-events: auto;
  i {
    font-size: 12px;
  }
}
</style>
