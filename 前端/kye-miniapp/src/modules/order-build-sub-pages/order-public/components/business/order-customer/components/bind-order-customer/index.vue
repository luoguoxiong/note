<template>
  <div class="iframe-box">
    <iframe
      v-if="url"
      :src="url"
      frameborder="0"
      :class="showLoading ? 'display-none' : ''"
      width="100%"
      height="100%"
      @load="handleIframeLoad"
    ></iframe>
    <van-loading text-size="16px" vertical color="#fff" class="customer-loading" type="spinner" v-if="showLoading">
      加载中...
    </van-loading>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { getIframeUrl } from '@order-public-sub-public/utils/env'
import { useInit } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { debounce } from 'lodash-es'
import { getOrderConfigUrl } from '@order-public-sub-public/configs'
import { OrderPageType } from '@order-public-sub-public/constants'
import { resetWaybillInfo } from '@order-public-sub-public/utils/waybillInfo'
import { resetOverLengthAndWeightFee } from '@order-public-sub-public/components/business/product-info/hooks/useOverLengthAndWeigth'import { getDefaultSelect } from '@order-public-sub-public/components/business/estimated-cost/hooks/useExpose'
import { getQueryObject } from '@order-public-sub-public/utils'
import { clearFeeData } from '@order-public-sub-public/components/business/estimated-cost/hooks/singleFeePolling'
import { expBindcustomercode } from '@order-public-sub-public/components/business/order-customer/report'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
let url = ref('')
let showLoading = ref(true)

const getUrl = async () => {
  url.value = await getIframeUrl()
}

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

const route = orderPageType.value === OrderPageType.批量寄 ? OrderPageType.批量寄 : ('' as OrderPageType)

const { init } = useInit(route)

const handleIframeLoad = () => {
  setTimeout(() => {
    showLoading.value = false
    expBindcustomercode()
  }, 300)
}
getUrl()
const curOrderCustomer = computed(() => {
  return piniaStore.schema.orderCustomer || ''
})
const updateOrderCustomer = (event: MessageEvent) => {
  const { type } = event.data || {}

  let customerName = ''

  // #453373 新绑码场景返回的是customerShortName，此处只能兜底处理
  if (event.data?.customerName) {
    customerName = event.data.customerName
  } else if (event.data?.customerShortName) {
    customerName = event.data?.customerShortName
  }

  if (type !== 'close' && type !== 'updateCustomerCode') {
    return
  }
  console.log(`换绑事件: 事件类型：${type}, 变更公司：${customerName}, 当前公司：${curOrderCustomer.value}`)
  if (type === 'close') {
    console.log('换绑关闭事件', event.data)
    // 关闭时判断返回公司和当前公司是否一致，如果不一致则表示通过更换客户/添加客户改变了客户编码
    if (customerName && customerName !== curOrderCustomer.value) {
      initData()
    }
    piniaStore.extend.updateIsShowBind({ value: false })
  }
  if (type === 'updateCustomerCode' && customerName !== curOrderCustomer.value) {
    piniaStore.schema.updateOrderCustomer(customerName || '')
    if (customerName) {
      piniaStore.extend.updateIsShowNoticeBar({ value: false })
    }
    initData()
    piniaStore.extend.updateIsShowBind({ value: false })
  }

  document.body.classList.add('van-overflow-hidden')
}
onMounted(() => {
  window.addEventListener('message', updateOrderCustomer)
})

/**
 * @description 切换绑码,需要重置参数再刷新页面
 */
const initData = debounce(() => {
  // if (orderPageType.value === OrderPageType.批量寄) {
  //   setChannel(Channel.批量寄)
  // } else {
  //   setChannel(Channel.快速寄件)
  // }
  const newUrl = getOrderConfigUrl(getQueryObject())
  location.replace(newUrl)
  resetWaybillInfo(orderPageType.value === OrderPageType.批量寄)

  // 清空返程单信息
  piniaStore.globalData.clearStaticConfigAndWaybillInfo({ orderPageType: undefined })
  piniaStore.globalData.setDynamicConfigItem({
    configItem: {
      key: 'returnWaybill',
      value: {
        visible: false,
        required: false,
      },
    },
  })

  // 重新获取预估费用协议勾选
  setTimeout(() => getDefaultSelect(true), 500)
  // getDefaultSelect(true)

  // 清空超长超重费用提示
  resetOverLengthAndWeightFee()

  // 清空费用提示
  clearFeeData()

  const initPromise = init(route, {
    noNeedCache: true,
    notFirstTimeEnter: orderPageType.value === OrderPageType.批量寄,
  })
  // 将promise保存到store，用于防止提前提交下单
  piniaStore.globalData.setInitDataPromise({ initDataPromise: initPromise })
  console.log('下单公司-触发了init')
}, 300)

onBeforeUnmount(() => {
  document.body.classList.remove('van-overflow-hidden')
  window.removeEventListener('message', updateOrderCustomer)
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
