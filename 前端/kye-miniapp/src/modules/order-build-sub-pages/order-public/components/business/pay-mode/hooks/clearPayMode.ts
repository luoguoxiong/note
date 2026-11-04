import { ModuleType, PayMode } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
// import { clearPayMode } from '@order-public-sub-public/components/business/pay-mode/hooks/clearPayMode'
export const clearPayMode = () => {
  piniaStore.order.updateOrderByType({
    type: ModuleType['付款方式'],
    data: {
      payMode: PayMode.清空,
      paymentAccount: '',
      paymentCustomerName: '',
      paymentCustomerCode: '',
    },
  })
}
