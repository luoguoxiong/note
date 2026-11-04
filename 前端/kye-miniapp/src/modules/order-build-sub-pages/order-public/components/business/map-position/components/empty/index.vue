<template>
  <div class="map-position-empty">
    <kyEmpty
      :type="EmptyTypeEnum.CUSTOM"
      :custom-config="{
        description: '搜索无结果',
        image: 'https://ic-img.ky-express.com/netc/20250619_5081_!!1750313034323_560_560.png',
      }"
    />
  </div>
</template>

<script setup lang="ts">
import kyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
