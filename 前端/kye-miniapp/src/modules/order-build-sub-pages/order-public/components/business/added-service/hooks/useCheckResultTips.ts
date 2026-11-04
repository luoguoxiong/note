import { ref, computed, watch } from 'vue'
import { useStore } from '@order-public-sub-public/store'
import { CheckDetail } from '@order-public-sub-public/types'

const GOODS_CONTROL_KEY = 'addedService.goodsControl'
const DELIVERY_DATA_KEY = 'dispatchInformation.deliveryData'

const goodsControlCheckResult = ref<string>('')
const deliveryDataCheckResult = ref<string>('')

export const useCheckResultTips = () => {
  const piniaStore = useStore()

  const checkResultList = computed<CheckDetail[]>(() => piniaStore.globalData.checkResultList || [])

  watch(checkResultList, () => {
    initCheckResult()
  })

  const initCheckResult = () => {
    const list = checkResultList.value
    const map1 = list.find((item) => {
      return item.key === GOODS_CONTROL_KEY && item.showType === 2 && item.preLimitType === 'deliveryTimeType'
    })
    const map2 = list.find((item) => {
      return item.key === DELIVERY_DATA_KEY && item.showType === 2 && item.preLimitType === 'appointDateType'
    })
    if (map1) {
      goodsControlCheckResult.value = map1.content || ''
    }
    if (map2) {
      deliveryDataCheckResult.value = map2.content || ''
    }
    console.log(goodsControlCheckResult.value, deliveryDataCheckResult.value, 'kkkkkkkk222kkkkkkkkkkkkkkkkkkkk')
  }

  const clearCheckResult = () => {
    // 如果都有值的时候同时清空
    goodsControlCheckResult.value = ''
    deliveryDataCheckResult.value = ''
    const filterList = checkResultList.value.filter(
      (item) =>
        !(
          [DELIVERY_DATA_KEY, GOODS_CONTROL_KEY].includes(item.key) &&
          item.showType === 2 &&
          ['deliveryTimeType', 'appointDateType'].includes(item.preLimitType)
        ),
    )
    console.log(filterList, 'filterListfilterListfilterList')
    piniaStore.globalData.setCheckResultList({
      checkResultList: filterList,
    })
  }

  // 定时派送 增值服务
  const clearGoodsControlCheckResult = () => {
    clearCheckResult()
  }

  // 派货资料
  const clearDeliveryDataCheckResult = () => {
    clearCheckResult()
  }

  initCheckResult()

  return {
    goodsControlCheckResult,
    deliveryDataCheckResult,
    clearGoodsControlCheckResult,
    clearDeliveryDataCheckResult,
  }
}
