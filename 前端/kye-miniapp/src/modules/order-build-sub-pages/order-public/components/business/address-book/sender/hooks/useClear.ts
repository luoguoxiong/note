import { computed } from 'vue'
import { useInitConfig } from './useInitConfig'
import { getData, setStoreValue } from './useUpdateData'
import { clearAllErrClass, closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'

export const useClear = () => {
  const { addressProps } = useInitConfig()

  // 显示清空按钮
  const clearStatus = computed(() => {
    let flag = false
    const {
      person = '',
      mobile = '',
      telephone = '',
      extension = '',
      companyName = '',
      province = '',
      city = '',
      county = '',
      detailAddress = '',
    } = getData.value

    const f =
      person ||
      mobile ||
      telephone ||
      extension ||
      (addressProps.value.companyNameConfig.editable && companyName) ||
      province ||
      city ||
      county ||
      detailAddress

    if (f) {
      flag = true
    }

    return flag
  })

  // 清空数据
  const onClear = () => {
    const data = {
      person: '',
      mobile: '',
      telephone: '',
      extension: '',
      province: '',
      city: '',
      county: '',
      detailAddress: '',
      companyName: getData.value.companyName,
    }

    if (addressProps.value.companyNameConfig.editable) {
      data.companyName = ''
    }

    setStoreValue(data)

    // 清空副作用
    closeTippy()
    clearAllErrClass()
  }

  return { clearStatus, onClear }
}
