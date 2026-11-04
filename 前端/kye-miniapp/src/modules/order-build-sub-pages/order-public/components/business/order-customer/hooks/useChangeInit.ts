import { computed } from 'vue'
import { debounce } from 'lodash-es'

import { OrderPageType } from '@order-public-sub-public/constants'
import { isShowOrderSkeleton, useInit } from '@order-public-sub-root-pages/order-single/hooks/useInit'
import { resetWaybillInfo } from '@order-public-sub-public/utils/waybillInfo'
import { getDefaultSelect } from '@order-public-sub-public/components/business/estimated-cost/hooks/useExpose'
import { resetOverLengthAndWeightFee } from '@order-public-sub-public/components/business/product-info/hooks/useOverLengthAndWeigth'
import { clearFeeData } from '@order-public-sub-public/components/business/estimated-cost/hooks/singleFeePolling'
import { useSetPreloadInnervalTask } from '@/public/apis/order'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const orderPageType = computed(() => piniaStore.root.getOrderPageType)
const route = orderPageType.value === OrderPageType.批量寄 ? OrderPageType.批量寄 : ('' as OrderPageType)
const { init } = useInit(route)

/**
 * @description 切换绑码,需要重置参数再刷新页面
 */
export const initData = debounce(() => {
  resetWaybillInfo(orderPageType.value === OrderPageType.批量寄)
  useSetPreloadInnervalTask()
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

  // 清空超长超重费用提示
  resetOverLengthAndWeightFee()

  // 清空费用提示
  clearFeeData()
  isShowOrderSkeleton.value = true

  const initPromise = init(route, {
    noNeedCache: true,
    notFirstTimeEnter: orderPageType.value === OrderPageType.批量寄,
  })
  // 将promise保存到store，用于防止提前提交下单
  piniaStore.globalData.setInitDataPromise({ initDataPromise: initPromise })
  console.log('下单公司-触发了init')
}, 300)
