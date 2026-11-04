<template>
  <div class="banner-audit">
    <div class="status-desc">
      <div class="title">{{ title }}</div>
      <div class="content">{{ desc }}</div>
    </div>
    <div class="status-icon">
      <SvgIcon v-if="title === '审核中'" name="audit-ing" />
      <SvgIcon v-if="title === '已拒绝'" name="audit-reject" />
      <SvgIcon v-if="title === '可下单'" name="audit-ok" />
      <SvgIcon v-if="title === '已撤销'" name="audit-cancel" />
      <SvgIcon v-if="title === '限制下单'" name="audit-reject" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { Channel } from '@order-public-sub-public/constants'
import { getChannel } from '@order-public-sub-public/configs'
import { AuditStateMap, WaybillState } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const moduleFormData = computed(() => {
  return piniaStore.order.auditFormData
})

const iconMap = {
  审核中: 'audit-ing',
  已撤销: 'audit-cancel',
  已拒绝: 'audit-reject',
  可下单: 'audit-ok',
  限制下单: 'audit-reject',
}

const channel = getChannel()

const title = computed(() => {
  const waybillState = moduleFormData.value?.waybillState
  const auditState = moduleFormData.value?.auditState
  if (channel === Channel.调价审核) {
    if (waybillState === WaybillState.审核中 || waybillState === WaybillState.已撤销) {
      return WaybillState[waybillState]
    } else {
      return AuditStateMap[auditState]
    }
  }
  if (channel === Channel.运单审核) {
    return WaybillState[waybillState]
  }
  return ''
})

const desc = computed(() => {
  return moduleFormData.value?.approvalDescribe || ''
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
