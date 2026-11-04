import { useCommonDataHook } from '@public/storage/hooks/useCommonHook'
import { DefaultGlobalData } from '@public/storage/hooks/useGeneralDataHook/type'
import { ref } from 'vue'
import { isEqualString } from '@public/utils'

export const useUserInfoChange = (handleChange?: () => void) => {
  const { getUserInfo, onUserInfoChange } = useCommonDataHook()

  const userInfo = ref<DefaultGlobalData['userInfo']>(getUserInfo())

  const isChanged = ref(false)

  const resetChange = () => {
    isChanged.value = false
  }

  onUserInfoChange((newValue: DefaultGlobalData['userInfo']) => {
    const oldValue = userInfo.value || {}

    const oldPhone = oldValue.phone || ''
    const oldCustomer = oldValue.customerCode || ''

    const newPhone = newValue?.phone || ''
    const newCustomer = newValue?.customerCode || ''

    const hasChanged = !isEqualString(oldCustomer, newCustomer) || !isEqualString(oldPhone, newPhone)

    if (hasChanged) {
      isChanged.value = true
      console.error('用户信息变更', hasChanged)
      handleChange && handleChange()
    }

    userInfo.value = {
      ...newValue,
      customerCode: newCustomer,
      phone: newPhone,
    }
  })

  return { isChanged, resetChange }
}
