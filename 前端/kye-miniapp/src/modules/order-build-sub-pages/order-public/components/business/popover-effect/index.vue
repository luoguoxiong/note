<template>
  <PopoverEffect :visible="initPageStatus !== InitOrderStatus.FAILED" />
</template>
<script setup lang="ts">
import PopoverEffect from '@order-global-package-order-sub/components/business/popover-effect/index.vue'
import { initPageStatus } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { InitOrderStatus } from '@order-public-sub-public/constants'
</script>
