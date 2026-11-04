import { saveBindCustomerCodeFlag } from '@order-public-sub-public/configs'

import { computed, nextTick } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const needBindCustomerCode = computed(() => {
  return piniaStore.extend.orderCustomer.needBindCustomerCode
})

export const effectBindCustomerMarsk = () => {
  if (needBindCustomerCode.value) {
    saveBindCustomerCodeFlag(!needBindCustomerCode.value)

    nextTick(() => {
      saveBindCustomerCodeFlag(!needBindCustomerCode.value)
    })
  }
}
