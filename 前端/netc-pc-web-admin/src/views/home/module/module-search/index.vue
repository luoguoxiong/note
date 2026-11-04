<template>
  <Content>
    <div
      class="search-content"
      v-exposure-report="{
        eventCode: 'exp_homepage_search_bar_v1',
        region_code: 'search_bar',
      }"
    >
      <WaybillSearch></WaybillSearch>
    </div>
  </Content>
</template>
<script setup lang="ts">
import WaybillSearch from './waybill-search/index.vue'
import Content from './content/index.vue'
</script>
<style lang="scss" scoped>
.search-content {
  width: 672px;
  height: 32px;
}
</style>
