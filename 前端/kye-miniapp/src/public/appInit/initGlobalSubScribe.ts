/**
 * @Desc: initGlobalWatch
 * @Date: 2025/12/11
 */
import { useCustomerCodeEvent } from '@public/storage/hooks/useCustomerCodeEvent'
import { getApplicationListAllDebounce } from '@public/utils/application/applicationService'
import { useCardConfigStore } from '@/store/cardConfig'
/* 客户编码变化-全局处理 */
const customerCodeChangeGlobalHandler = () => {
  getApplicationListAllDebounce()
  useCardConfigStore().loadAllConfigs({
    force: true
  })
}
/* 客户编码变化- 全局订阅 */
export const initGlobalCustomerCodeSubscribe = () => {
  const { onRefGlobalDataCustomerCodeChange } = useCustomerCodeEvent()
  // 订阅客户编码code变更-拉取轻应用
  onRefGlobalDataCustomerCodeChange(customerCodeChangeGlobalHandler)
}

/* 全局订阅事件-异步事件 */
export const initGlobalSubscribeHandler = () => {
  initGlobalCustomerCodeSubscribe()
}
