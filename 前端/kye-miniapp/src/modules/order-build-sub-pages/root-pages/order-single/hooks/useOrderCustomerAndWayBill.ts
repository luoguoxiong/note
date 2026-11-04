import { initKaCustomerMap } from '@order-public-sub-public/components/business/ka-customer-map/hooks/useReset'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

// 更新下单公司,联系商务及相关绑定状态
export function useOrderCustomerAndWayBillStatus() {
  // 初始化自定义编码数据
  initKaCustomerMap()
  // 运单号
  const waybillNumber = piniaStore.order.waybillNumber

  function updateWayBillNumber() {
    // 运单号显示：条件为有运单号
    let waybillNumberVisiable = false
    if (waybillNumber) {
      waybillNumberVisiable = true
    }
    piniaStore.extend.updateShowbillType({ value: waybillNumberVisiable })
  }
  updateWayBillNumber()
}

export const useClearNoticeAndCustomerStatus = () => {
  piniaStore.extend.updateIsShowBind({ value: false })
}
