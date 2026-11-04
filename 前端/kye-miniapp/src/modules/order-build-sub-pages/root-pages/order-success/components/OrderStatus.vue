<template>
  <div class="order-status w-full">
    <!-- 右上角tips图标 -->
    <SvgIcon v-if="result.tips" class="order-status-icon-tips" :name="result.tips" />
    <!-- 副标题 -->
    <div class="icon-and-text">
      <SvgIcon class="icon-success-waybill2" :imgUrl="result.iconUrl" :name="result.icon"></SvgIcon>
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

const props = defineProps<{ data: SuccessOrderInfo; list: SuccessWaybill[] }>()

const { data, list } = toRefs(props)

// 订单状态结果
const result = computed(() => useOrderStatus(data.value, list.value).result)

const MainTitle = result.value.mainTitle

const SubTitle = result.value.subTitle
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
