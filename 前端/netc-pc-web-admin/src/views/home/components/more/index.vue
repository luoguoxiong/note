<template>
  <KButton text :is-text-black="true" id="refresh" size="small" @click="toMore">
    <span>{{ text || '查看更多' }}</span>
    <KIcon class="more-icon" :size="12"><ArrowRight /></KIcon>
  </KButton>
</template>
<script setup lang="ts">
import { KButton, KIcon } from '@netc-design-pc/ui'
import { ArrowRight } from '@netc-design-pc/icons'
interface RefreshProps {
  toMore?: () => void
  text?: string
}
defineProps<RefreshProps>()
</script>
<style lang="scss" scoped>
#refresh {
  line-height: 20px;
  .more-icon {
    margin-left: 4px;
  }
}
</style>
