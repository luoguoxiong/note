<template>
  <div class="search-tabs-wrapper" :class="{ 'search-tabs-wrapper-scroll-bar': showScrollBar }">
    <div class="search-tabs">
      <div v-for="item in tab" class="search-tab" :key="item.id" @click="handleCheckTab(item.id)">
        <div :class="`${item.id === activeId ? 'active-tab' : ''} tab-content`">
          <div>{{ item.name }}</div>
          <div v-if="!!item.count">{{ item.count > 99 ? '99+' : item.count }}</div>
        </div>
        <div :class="`${item.id === activeId ? 'active-line' : ''} line`"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'
const emits = defineEmits(['selectTab'])
interface tabReactiveType {
  name: string
  id: number
  count: number
}

interface tabReactiveTypeProps {
  tab: tabReactiveType[]
  activeId?: number
  showScrollBar?: boolean
}

defineProps<tabReactiveTypeProps>()

const handleCheckTab = (id: number) => {
  emits('selectTab', id)
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
