import { BizScene, GoodsTimeWaybillItem } from '@order-public-sub-public/apis/update-goods-time/type'
import { allCheckedStatus, checkedList, goodsTimeVo, isAllChecked, batchEditGoodsInfo, state } from './state'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { getGoodsTimeConfig } from '@order-public-sub-public/apis/update-goods-time'
import {
  goodsTimeListRouteHistoryMap,
  unOrderMap,
} from '@order-public-sub-root-pages/batch-restrict-new/hooks/useState'

export const resetState = () => {
  state.value = {
    refreshing: false,
    errorStatus: false,
    loading: false,
    initLoading: false,
    finished: false,
    showSkeleton: true,
    errorText: '',
    list: [] as GoodsTimeWaybillItem[],
    page: 0,
    pageSize: 20,
    pageTotal: 0,
  }

  checkedList.value = []
  allCheckedStatus.value = false
  batchEditGoodsInfo.value = undefined

  unOrderMap.value = {}
  goodsTimeListRouteHistoryMap.value = {}
}

export const getIsChecked = (item: GoodsTimeWaybillItem) => {
  return checkedList.value.some((checkedItem) => checkedItem.waybillNumber === item.waybillNumber)
}

export const setChecked = (item: GoodsTimeWaybillItem) => {
  if (getIsChecked(item)) {
    checkedList.value = checkedList.value.filter((checkedItem) => checkedItem.waybillNumber !== item.waybillNumber)
    allCheckedStatus.value = false
  } else {
    if (checkedList.value.length >= 100) {
      showToast('单次修改货好时间最多支持100票，请重新选择')
      return
    }
    checkedList.value.push(item)
  }
}

/**
 * 全选: 勾选前100个
 */
export const checkAll = () => {
  if (isAllChecked.value) {
    checkedList.value = []
    allCheckedStatus.value = false
  } else {
    checkedList.value = state.value.list.slice(0, 100)
    allCheckedStatus.value = true
  }
}

export const getGoodsTimeConfigData = async () => {
  const data = await getGoodsTimeConfig(BizScene.批量修改货好时间)
  const crmGoodsTimeConfig = data.data.crmGoodsTimeConfig
  const erpGoodsTimeConfig = data.data.erpGoodsTimeConfig
  const inputMode = data.data.inputMode
  const goodsTimeFlagVisible = data.data.goodsTimeFlagVisible || false

  if (crmGoodsTimeConfig) {
    crmGoodsTimeConfig.goodsTimeFlag = goodsTimeFlagVisible
  }

  if (erpGoodsTimeConfig) {
    erpGoodsTimeConfig.goodsTimeFlag = goodsTimeFlagVisible
  }

  goodsTimeVo.value = {
    crmGoodsTimeConfig,
    erpGoodsTimeConfig,
    inputMode,
  }
}
