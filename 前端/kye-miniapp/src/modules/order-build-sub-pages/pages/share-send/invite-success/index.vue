<template>
  <div class="invite-success order-success-container">
    <!-- <ky-navbar :leftArrow="true" title="跨越寄件" v-if="isWxMiniApp"></ky-navbar> -->
    <div class="icon-wrap">
      <img class="icon" src="https://ic-img.ky-express.com/netc/20260116_7926_!!1768556210599_240_198.png" />
    </div>
    <div class="text">提交成功</div>
    <div class="content">
      <WaybillInfoCard
        :orderSuccessPageConfig="orderSuccessPageConfig"
        :list="successWaybillList"
        v-if="successWaybillList.length"
        :isDisableJumpRoute="!isShowViewBtn"
      ></WaybillInfoCard>
    </div>
    <div class="btn" v-if="isShowViewBtn">
      <ky-button class="button-footer" type="primary" @click="toViewOrder" size="normal" text="查看运单"></ky-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
// import { isWxMiniApp } from '@/public/utils'
import WaybillInfoCard from '../../../root-pages/order-success/components/WaybillInfoCard.vue'
import '@order-global-package-order-sub/styles/common.scss'
import { closeToast, showLoadingToast } from '@order-public-sub-public/hooks/useShowToast'
import { invitationRoute } from '@order-public-sub-public/apis/share/index'
import { useRoute } from '@order-public-sub-public/vue-router/index'
import Taro from '@tarojs/taro'
import { toViewRouteExpReport, toViewRouteReport } from '../report'
const route = useRoute()

const orderSuccessPageConfig = {
  showBarcode: false,
  needShare: false, // 通知收件人
  tipText: '', // 静默提示文案
}

const successWaybillList = ref<any[]>([])
const waybillNumber = ref()
const isShowViewBtn = ref(false)

onMounted(async () => {
  try {
    showLoadingToast({
      title: '加载中',
      duration: 0,
      forbidClick: true,
    })
    const { inviteCode } = (route.query as { inviteCode: string }) || { inviteCode: '' }
    const res = await invitationRoute({
      inviteCode,
    })
    const { waybillList, trackOrderButton } = res.data ?? {}
    isShowViewBtn.value = trackOrderButton
    if (waybillList?.length) {
      successWaybillList.value = waybillList
      waybillNumber.value = waybillList?.[0]?.waybillNumber
    }
  } catch (error) {
  } finally {
    closeToast()
  }
})

const toViewOrder = () => {
  toViewRouteReport()
  Taro.redirectTo({
    url: `/modules/waybill-build/pages/waybill-route/index?waybillNumber=${waybillNumber.value}`,
  })
}

watch(
  () => isShowViewBtn.value,
  (newValue) => {
    if (newValue) {
      toViewRouteExpReport()
    }
  },
)
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
@import '../../../root-pages/order-success/index.scss';
</style>
