import { watch } from 'vue'
import { branchSelfPickUpStore, phoneData } from '.'

// 收件地址改变触发手机号改动hooks
export const usePhoneChange = () => {
  watch(
    () => branchSelfPickUpStore.value?.selfPickupMobile,
    (val) => {
      console.log('store change phoneData', val)
      phoneData.value = val || ''
    }
  )
}
