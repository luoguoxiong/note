<template>
  <div
    id="home-banner"
    :style="{
      borderRadius: `8px 8px 0 0`,
    }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
// import { ParentModuleCode } from '@/apis/home/types'
// import { useHomeStore } from '@/hooks/useHomeStore'
// const { leftSideModules } = useHomeStore()

// const hasSearchPart = leftSideModules.value.includes(ParentModuleCode.HOME_PAGE_SEARCH_BAR)
</script>

<style lang="scss" scoped>
#home-banner {
  border-radius: 8px 8px 0 0;
  background: white;
  overflow: hidden;
}
</style>
