import { getValueOrEmpty } from '@order-public-sub-public/utils'
import useCommon from '../useCommon'
import useValidate from './useValidate'
import useInitConfig from './useInitConfig'
import { getData, useUpdateData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'
import { province, city, county, detailAddress } from '@order-public-sub-public/hooks/address/receive/state'
import { AddressValue } from '@order-public-sub-public/constants'
import useEmit from '@order-public-sub-public/hooks/address/receive/useEmit'

// 选择定位数据回填数据
export function useMapPosition({ moduleStyle }: { moduleStyle: string }) {
  const { detailAddressDialog } = useCommon()
  const { addressProps } = useInitConfig({ moduleStyle })
  const { checkValidate } = useValidate()
  const { setStoreValue } = useUpdateData({ moduleStyle })

  // 校验
  const performValidation = async () => {
    if (province.value && city.value && detailAddress.value) {
      await checkValidate({
        required: addressProps.value.addressConfig.required,
        fieldKey: 'address',
        value: `${province.value}${city.value}${county.value}`,
        originalData: getData(),
      })
    }
  }

  const setMapPosition = async (data: AddressValue) => {
    const oldVal = { province: province.value, city: city.value, county: county.value }
    const newVal = {
      province: getValueOrEmpty(data.province),
      city: getValueOrEmpty(data.city),
      county: getValueOrEmpty(data.county),
      detailAddress: getValueOrEmpty(data.detailAddress),
    }
    useEmit().emitName('detailAddress', getValueOrEmpty(data.detailAddress))
    const setData = () => {
      province.value = getValueOrEmpty(newVal.province)
      city.value = getValueOrEmpty(newVal.city)
      county.value = getValueOrEmpty(newVal.county)
      detailAddress.value = getValueOrEmpty(newVal.detailAddress)
    }

    if (!oldVal.province) {
      setData()
      setStoreValue()
      return
    }

    if ((newVal.province && newVal.city) || newVal.county) {
      const res = await detailAddressDialog(newVal, oldVal)
      if (res) {
        setData()
        setStoreValue()
      } else {
        detailAddress.value = getValueOrEmpty(newVal.detailAddress)
        setStoreValue()
      }
      // 校验
      await performValidation()
    }
  }

  return { setMapPosition }
}
