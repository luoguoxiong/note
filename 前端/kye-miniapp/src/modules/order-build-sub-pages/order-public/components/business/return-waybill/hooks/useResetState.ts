import Taro from '@tarojs/taro'
import { setTemplateId } from '@order-public-sub-root-pages/order-single/hooks/template'
import { returnWaybillValue, switchFlag } from './state'
import { OrderPageType } from '@order-public-sub-public/constants'
import { initStore } from '@order-public-sub-public/utils/store'
import { getQueryObject } from '@order-public-sub-public/utils'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
import { resetData } from '@order-public-sub-public/components/business/protect-price/hooks/resetData'
import { usePopupContentVisible, usePopupFieldVisible } from '../../waybill-special-encrypt/hooks/useState'
import { timeVisible } from '../../goods-time/hooks/state'
import { usePopVisible } from '../../pay-mode/hooks/useState'
import { useUnfoldReceiptVisible } from '../../added-service/hooks/useVisible'
import { hiddenBranchModal } from '../../branch-self-pickup/hooks/index'
import { hiddenOverAreaModal } from '../../over-area-delivery/hooks'
import { usePopupVisible } from '../../product-info/hooks/useVisible'
import { usePopupVisible as useAddSPopupVisible } from '../../added-service/hooks/useVisible'
import { useUnfoldSizeVisible, useVolumeSize } from '../../product-info/hooks/useState'
import { useVisible } from '../../protect-price/hooks/useState'
import { show } from '../../estimated-cost/components/netc-agreement/useData'
import { orderPageScrollTop } from '@order-public-sub-root-pages/order-single/hooks/useScrollTop'
import { useSaveOrder } from '@order-public-sub-root-pages/order-single/hooks/useSaveOrder'
import { orderHomeRoute } from '@order-public-sub-root-pages/order-single/hooks/useInit'

/**
 * 页面栈中是否仍有存活的下单页。
 * 销毁回调延迟执行时，当前页已从栈中移除，此处判断的是剩余栈里是否还压着别的下单页。
 */
const hasAliveOrderPage = () => {
  const pages = Taro.getCurrentPages() || []
  const pagesLength = pages.length
  if (pagesLength > 1) {
    const lastPage = pages[pagesLength - 1]
    return `${lastPage?.$taroPath || lastPage?.route || ''}`.indexOf('pages/order/index') !== -1
  }
  return false
}

/**
 * @description 关闭弹窗
 */
const closePopup = () => {
  const { setUnfoldReceiptVisible } = useUnfoldReceiptVisible()
  const { setPopupContentVisible } = usePopupContentVisible()
  const { setPopupFieldVisible } = usePopupFieldVisible()
  const { setPopVisible } = usePopVisible()
  const { setPopupVisible } = usePopupVisible()
  const { setPopupVisible: setAddPopupVisible } = useAddSPopupVisible()
  const { setUnfoldSizeVisible } = useUnfoldSizeVisible()
  const { setVisible } = useVisible()
  const { clearErrorClassObj } = globalUseValidate()

  clearErrorClassObj()
  timeVisible.value = false // 货好时间
  setPopupContentVisible(false) // 运单加密
  setPopupFieldVisible(false) // 运单加密
  setPopVisible(false)
  setPopupVisible(false) // 货物信息
  setAddPopupVisible(false) // 增值服务
  setUnfoldReceiptVisible(false)
  setUnfoldSizeVisible(false)
  setVisible(false) // 保价
  hiddenBranchModal() // 网点自提
  hiddenOverAreaModal()
}

/**
 * @description 重置下单页面状态
 * @param ignoreStore 是否忽略store
 * @param type 清楚类型: popup - 清除弹窗打开状态
 * @returns
 */
export const useResetState = (params?: { ignoreStore?: boolean; type?: 'all' | 'popup' }) => {
  console.log('触发了下单页面销毁')
  const { ignoreStore = false, type } = params || {}

  try {
    closePopup()
    if (type === 'popup') return

    orderHomeRoute.value = null
    orderPageScrollTop.value = 0
    const { loading } = useSaveOrder()
    loading.value = false
    const { clearErrorClassObj } = globalUseValidate()
    const { setVolumeSize } = useVolumeSize()
    switchFlag.value = false
    returnWaybillValue.value = ''
    show.value = false // 电子契约条款

    // 退出寄件需要重置模板id
    setTemplateId(null)
    setVolumeSize(0)
    // 清空保费信息
    resetData()
    clearErrorClassObj()

    if (ignoreStore) return
    // 预约取货快速连点会压入多个共享同一 Pinia 分片的下单页，后一个销毁时重置会清掉前一个的数据。
    // 仅当「预约取货场景」且「延迟后栈里仍有存活下单页」时跳过重置，其它场景/彻底退出仍照常重置。
    // isAppointmentPickup 同步取参（避免 setTimeout 异步里取不到当前实例），存活页判断在延迟回调里执行。
    const isAppointmentPickup = getQueryObject()?.isAppointmentPickup
    setTimeout(() => {
      if (isAppointmentPickup && hasAliveOrderPage()) return
      initStore(OrderPageType.单票)
    }, 100)
  } catch (error) {
    console.log(error)
  }
}
