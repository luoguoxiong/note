import { computed } from 'vue'
import useInitConfig from './useInitConfig'
import {
  person,
  mobile,
  telephone,
  extension,
  companyName,
  province,
  city,
  county,
  detailAddress,
  specifyAddress,
  locationName,
  locationId,
} from '@order-public-sub-public/hooks/address/sender/state'
import { clearAllErrClass, closeTippy } from '@order-public-sub-public/validate/effect/effectBubble'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export function useClear({ moduleStyle }: { moduleStyle: string }) {
  const { addressProps } = useInitConfig({ moduleStyle })

  // 是否展示清空按钮
  const clearStatus = computed(() => {
    let flag = false
    const f =
      (addressProps.value.personConfig.editable && person.value) ||
      (addressProps.value.mobileConfig.editable && mobile.value) ||
      (addressProps.value.telephoneConfig.editable && (telephone.value || extension.value)) ||
      (addressProps.value.companyNameConfig.editable && companyName.value) ||
      Boolean(province.value || detailAddress.value)

    if (f) {
      flag = true
    }

    return flag
  })

  // 清空数据
  const onClear = () => {
    if (addressProps.value.personConfig.editable) {
      person.value = ''
    }

    if (addressProps.value.mobileConfig.editable) {
      mobile.value = ''
    }

    if (addressProps.value.telephoneConfig.editable) {
      telephone.value = ''
      extension.value = ''
    }

    // 验证 往返寄中 是否 禁用地址，禁用地址就不清空
    const disabledAddresssItem = piniaStore.globalData.returnEditDisableInfo('senderExtraInfo', 'address') || {}
    if (!disabledAddresssItem.key) {
      province.value = ''
      city.value = ''
      county.value = ''

      detailAddress.value = ''
    }

    if (addressProps.value.companyNameConfig.editable) {
      companyName.value = ''
    }

    specifyAddress.value = ''
    locationName.value = ''
    locationId.value = ''

    // 清空副作用
    closeTippy()
    clearAllErrClass()
  }

  return { clearStatus, onClear }
}
