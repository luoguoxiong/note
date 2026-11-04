<template>
  <KyEmpty class="empty-content" :type="emptyType" :description="description">
    <KyButton v-if="isNetworkError" class="go-order-button" size="small" text="重新加载" @click="reload"></KyButton>
    <KyButton v-else class="go-order-button" text="去寄件" size="small" @click="goOrder"></KyButton>
  </KyEmpty>
</template>
<script setup lang="ts">
import KyEmpty from '@order-public-sub-public/components/ui/ky-empty/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { EmptyTypeEnum } from '@order-public-sub-public/constants'
import { computed } from 'vue'
import { clk_order_pickuptime_ship_button_v1 } from '../../hooks/useReport'
const emits = defineEmits(['goOrder', 'reload'])
const props = defineProps<{ errorText: string }>()
const goOrder = () => {
  clk_order_pickuptime_ship_button_v1({ button_name: '去寄件' })
  emits('goOrder')
}

const reload = () => {
  emits('reload')
}

const description = computed(() => props.errorText || '暂无运单数据')
const isNetworkError = computed(() => props.errorText === '当前无网络，请检查后重试')
const emptyType = computed(() => (isNetworkError.value ? EmptyTypeEnum.NETWORK : EmptyTypeEnum.WAYBILL))
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
