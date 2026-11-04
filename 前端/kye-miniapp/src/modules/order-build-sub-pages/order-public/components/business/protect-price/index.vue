<template>
  <div class="protect-price" v-if="visible">
    <HotZone :moduleType="ModuleType['物品保价']"></HotZone>
    <ProtectPriceInput :disabled="disabled"></ProtectPriceInput>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProtectPriceInput from './components/protect-price-input/index.vue'
import { useModuleHotZone } from './hooks/useModuleHotZone'
import { PickModule, ProtectPriceConfig } from '@order-public-sub-public/types'
import HotZone from '@order-public-sub-public/components/business/hot-zone/index.vue'
import { ModuleType } from '@order-public-sub-public/constants'

const props = defineProps<PickModule<ProtectPriceConfig>>()

const visible = computed(() => props?.config?.fieldsConfig?.[0]?.visible)

useModuleHotZone()
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
