import { isNull } from 'lodash-es'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const reportServicePerception = async () => {
  const processPromise = piniaStore.globalData.processPromise
  const serviceMode = piniaStore.globalData.serviceModePromise
  await Promise.all([processPromise, serviceMode].filter((promise) => !isNull(promise)))
  window.$umpOtherReport('EXP', {
    eventCode: 'other_express_service_perception_v1',
  })
}

// 下单_寄件页_服务方式_弹窗消失
export const servicePopupClosedReport = async () => {
  window.$umpOtherReport('OTHER', {
    eventCode: 'other_express_service_popup_disappear_v1',
  })
}
