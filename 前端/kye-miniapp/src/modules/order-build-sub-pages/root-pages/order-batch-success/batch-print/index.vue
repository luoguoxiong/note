<template>
  <!-- 下单成功页 -->
  <div class="order_batch_success-print">
    <div class="order_batch_success-print-content">
      <WaybillInfoCard
        v-if="list && list.length"
        :orderCompletedPageType="OrderSuccessType.产生运单和订单"
        :orderSuccessPageConfig="orderSuccessPageConfig"
        :list="list"
        :promptInfo="''"
        :showRadioChecked="true"
        @radioChecked="radioChecked"
      ></WaybillInfoCard>
    </div>
    <div class="order_batch_success-print-footer">
      <div class="batch_order-footer-text">
        <span class="batch_order-footer-text-all" @click="onAll">
          <SvgIcon
            v-if="checkedList.length === list.length"
            name="radio-checked"
            class="batch_order-footer-icon"
          ></SvgIcon>
          <SvgIcon v-else name="radio-unchecked" class="batch_order-footer-icon"></SvgIcon>
          全选</span
        >
        已选{{ checkedList.length }}票运单
      </div>
      <KyButton
        class="batch_order-footer-btn"
        loading-text="打印面单"
        :loading="loading"
        text="打印面单"
        @click="onConfirm"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onActivated, onMounted } from 'vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { useOrderSuccess } from '../hooks/useOrderSuccess'
import WaybillInfoCard from '../components/WaybillInfoCard.vue'
import { OrderSuccessType } from '@order-public-sub-public/constants'
import { SuccessWaybill } from '@order-public-sub-public/types'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
// import { printCheckBluetooth } from '@order-public-sub-public/utils/print'
import { getPrintTraceToken } from '@order-public-sub-public/apis'
import { isWechat } from '@order-public-sub-public/utils/device'
import { getBaseUrl } from '@order-public-sub-public/utils/env'
import { $native } from '@order-public-sub-public/utils'
import router from '@order-public-sub-public/router'
import { onBeforeRouteLeave, useRoute } from '@order-public-sub-public/vue-router/index'
import { openURL } from '@/modules/webview/utils'
defineOptions({
  name: 'batch-print',
})

const route = useRoute()
const { successWaybillList, orderSuccessPageConfig } = useOrderSuccess()

const list = ref<SuccessWaybill[]>([])

const loading = ref(false)

const checkedList = computed(() => {
  return list.value.filter((item) => item.waybillRadioChecked)
})

const routerFromPrint = ref(false)
onBeforeRouteLeave((to) => {
  if (to.name === 'order-batch-success') {
    // 返回成功页做标识，再跳转到此页面重置全选功能
    routerFromPrint.value = true
  }
})

onActivated(async () => {
  if (routerFromPrint.value) {
    initData()
    routerFromPrint.value = false
  }
})

onMounted(() => {
  initData()
})

const initData = () => {
  const waybill = successWaybillList.value as SuccessWaybill[]
  waybill?.forEach((item) => {
    item.waybillRadioChecked = true
  })
  list.value = waybill
}

const radioChecked = (waybill: SuccessWaybill) => {
  console.log('radioChecked', waybill)
  list.value.forEach((item) => {
    if (waybill.waybillNumber === item.waybillNumber) {
      item.waybillRadioChecked = !item.waybillRadioChecked
    }
  })
}

const onConfirm = async () => {
  console.log('onConfirm', checkedList)
  if (!checkedList.value.length) {
    showToast('请勾选运单')
    return
  }
  loading.value = true
  try {
    // const isOpen = await printCheckBluetooth()
    // if (!isOpen) {
    //   return
    // }
    const waybillNumberList = list.value.filter((item) => item.waybillRadioChecked).map((item) => item.waybillNumber)
    const res = await getPrintTraceToken({
      clientType: '20',
      waybillNumberList: waybillNumberList,
    })
    if (!res || !res.data) {
      return
    }

    let printSource = ''
    if (route.query?.printSource) {
      printSource = route.query.printSource as string
    }

    // app 从成功页跳转到打印面单 点返回需回到下单成功页，需要使用router.push, 小程序直接跳转openWebview
    const waybillNumber = waybillNumberList.toString()
    if (isWechat) {
      const url = `${getBaseUrl(false)}#/print?printTraceId=${
        res.data
      }&waybillNumber=${waybillNumber}&printSource=${printSource}`
      openURL(url, { type: 'redirectTo', needLogin: true })
    } else {
      router.push({
        path: '/print',
        query: {
          printTraceId: res.data,
          waybillNumber: waybillNumber,
          printSource,
        },
      })
    }
  } catch (e) {
    console.log('aaaa', e)
  } finally {
    loading.value = false
  }
}

const onAll = () => {
  const flag = checkedList.value.length === list.value.length
  list.value.forEach((item) => {
    item.waybillRadioChecked = !flag
  })
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
