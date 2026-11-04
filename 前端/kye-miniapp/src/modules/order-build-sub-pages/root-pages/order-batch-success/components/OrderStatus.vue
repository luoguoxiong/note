<template>
  <div class="order-status w-full">
    <!-- 右上角tips图标 -->
    <SvgIcon
      class="order-status-icon-tips"
      :class="{ 'visible-hidden': !result.tips }"
      :name="result.tips || 'tips-waybill'"
    />
    <div class="icon-and-text">
      <SvgIcon class="icon-success-waybill2" :name="result.icon"></SvgIcon>
      <!-- 副标题 -->
      <SubTitle />
    </div>
    <!-- 主标题 -->
    <MainTitle />
  </div>
</template>
<script setup lang="tsx">
import { SuccessOrderInfo, SuccessWaybill } from '@order-public-sub-public/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { useOrderStatus } from '../hooks/useOrderStatus'
import { computed, toRefs } from 'vue'
import { BatchSuccessOrderInfo } from '@order-public-sub-public/apis/batch/types'

const props = defineProps<{
  data: SuccessOrderInfo
  list: SuccessWaybill[]
  activeTab: number
  orderInfoList: BatchSuccessOrderInfo[]
  orderTitle: string
}>()

const { activeTab, orderInfoList, orderTitle } = toRefs(props)

// const isCutoffCar = computed(() => activeTab.value * 1 === OrderSuccessType.截单专车)

const result = computed(() => useOrderStatus(activeTab.value, orderInfoList.value, orderTitle.value)?.result)

const MainTitle = computed(() => result.value.mainTitle)

const SubTitle = computed(() => result?.value?.subTitle)
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
