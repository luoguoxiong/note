<template>
  <component :is="curTemplate"></component>
</template>
<script setup lang="ts">
import NormalBanner from './components/normal-banner/index.vue'
import AuditBanner from './components/audit-banner/index.vue'

import { getChannel } from '@order-public-sub-public/configs'
import { Channel } from '@order-public-sub-public/constants'
import { computed } from 'vue'
const channel = getChannel()
const curTemplate = computed(() => {
  return [Channel.运单审核, Channel.调价审核].includes(channel) ? AuditBanner : NormalBanner
})
</script>
