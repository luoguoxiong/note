import { getValueOrEmpty } from '@order-public-sub-public/utils'
import { useInitConfig } from './useInitConfig'
import { AddressValue } from '@order-public-sub-public/constants'
import { checkValidate } from './useValidate'
import useCommon from '@order-public-sub-public/hooks/address/useCommon'
import { getData, setStoreValue } from './useUpdateData'

// 选择定位数据回填数据
export function useMapPosition() {
  const { detailAddressDialog } = useCommon()
  const { addressProps } = useInitConfig()

  // 校验
  const performValidation = async () => {
    if (getData.value.province && getData.value.city && getData.value.detailAddress) {
      await checkValidate({
        required: addressProps.value.addressConfig.required,
        fieldKey: 'address',
        value: `${getData.value.province}${getData.value.city}${getData.value.county}`,
        originalData: getData.value,
      })
    }
  }

  const setMapPosition = async (data: AddressValue, cb?: () => void) => {
    const oldVal = { province: getData.value.province, city: getData.value.city, county: getData.value.county }
    const newVal = {
      province: getValueOrEmpty(data.province),
      city: getValueOrEmpty(data.city),
      county: getValueOrEmpty(data.county),
      detailAddress: getValueOrEmpty(data.detailAddress),
    }

    const setData = () => {
      setStoreValue({
        province: getValueOrEmpty(newVal.province),
        city: getValueOrEmpty(newVal.city),
        county: getValueOrEmpty(newVal.county),
        detailAddress: getValueOrEmpty(newVal.detailAddress),
      })
    }

    if (!oldVal.province) {
      setData()
      return
    }

    if ((newVal.province && newVal.city) || newVal.county) {
      const res = await detailAddressDialog(newVal, oldVal)
      if (res) {
        setData()
      } else {
        setStoreValue({ detailAddress: newVal.detailAddress })
      }
      // 校验
      await performValidation()
    }
    setTimeout(() => {
      cb && cb()
    }, 500)
  }
  return { setMapPosition }
}
