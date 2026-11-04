import { debounce } from 'lodash-es'
import { computed, Ref, ref, watch, ComputedRef } from 'vue'

// 方法
import { checkValidate } from './useValidate'
import useCommon, { reportCloseDropdownMenu } from '@order-public-sub-public/hooks/address/useCommon'
import { filterAllSpace, getValueOrEmpty } from '@order-public-sub-public/utils'
import { useInitConfig } from './useInitConfig'
import { getData, setStoreValue } from './useUpdateData'

// 类型
import { AddressValue } from '@order-public-sub-public/constants'
import { RefType } from '../../types'
import { SuggestListType } from '@order-public-sub-public/types'
import { removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'

// 姓名
const isPersonFocus = ref(false)
const isMobileFocus = ref(false)
const visibleDropdownMenu = ref(false)

const closeDropdownMenu = () => {
  visibleDropdownMenu.value = false
  reportCloseDropdownMenu('收件')
}

export const usePerson = (clearStatus?: ComputedRef<boolean>) => {
  const person = computed(() => getData.value.person)
  const onFocusPerson = () => (isPersonFocus.value = true)
  const onBlurPerson = async ({ required }: { required: boolean }) => {
    isPersonFocus.value = false
    visibleDropdownMenu.value = false
    if (!(clearStatus && !clearStatus.value)) {
      onInputPerson(person.value.trim())
      await checkValidate({
        required,
        fieldKey: 'person',
        value: person.value,
        originalData: getData.value,
      })
    }
  }
  const onInputPerson = (value: string) => setStoreValue({ person: value })

  return { person, onFocusPerson, onBlurPerson, onInputPerson }
}

// 手机号
export const useMobile = (clearStatus?: ComputedRef<boolean>) => {
  const mobile = computed(() => getData.value.mobile)
  const onFocusMobile = () => (isMobileFocus.value = true)
  const onBlurMobile = async ({ required, value }: { required: boolean; value: string }) => {
    isMobileFocus.value = false
    // visibleDropdownMenu.value = false
    if (!(clearStatus && !clearStatus.value)) {
      // 手机号存在，需要清空固定电话的标红状态
      removeErrClassByDataValidate('receive.telephone')
      await checkValidate({ required, fieldKey: 'mobile', value, originalData: getData.value })
    }
  }

  const onInputMobile = (value: string) => setStoreValue({ mobile: value })

  return { mobile, onFocusMobile, onBlurMobile, onInputMobile }
}

// 姓名手机号联想
export const useSuggestData = () => {
  const suggestList = ref([] as SuggestListType[])
  const { getPagePreciseQuery } = useCommon()

  const handleInputChange = debounce(async (value?: string | boolean) => {
    // 有地址簿才联想
    if (value && (isPersonFocus.value || isMobileFocus.value)) {
      const params = {
        addressType: '20',
        contact: getData.value.person,
        contactPhone: filterAllSpace(getData.value.mobile),
      }
      const res = await getPagePreciseQuery(params)
      suggestList.value = res || []
      visibleDropdownMenu.value = suggestList.value.length > 0 && isPersonFocus.value
    } else {
      visibleDropdownMenu.value = false
      suggestList.value = []
    }
  }, 400)

  watch(
    () => getData.value.person,
    (value) => handleInputChange(value),
  )

  watch(
    () => filterAllSpace(getData.value.mobile),
    (value) => handleInputChange(value),
  )

  watch(
    () => isPersonFocus.value,
    (value) => {
      if (value) {
        handleInputChange(getData.value.person)
      }
    },
  )

  watch(
    () => isMobileFocus.value,
    (value) => {
      if (value) {
        handleInputChange(getData.value.mobile)
      }
    },
  )

  // 选中联想出来的数据
  const selectSuggest = (item: AddressValue) => {
    setStoreValue(item)
    suggestList.value = []
    visibleDropdownMenu.value = false
  }

  return {
    suggestList,
    selectSuggest,
    closeDropdownMenu,
    visibleDropdownMenu,
  }
}

// 固定电话
export const useTelephone = () => {
  const telephone = computed(() => getData.value.telephone)
  const extension = computed(() => getData.value.extension)
  const onBlurTelephone = async ({ required }: { required: boolean }) => {
    // 固定电话存在，需要清空手机号的标红状态
    removeErrClassByDataValidate('receive.mobile')
    await checkValidate({
      required,
      fieldKey: 'telephone',
      value: telephone.value,
      originalData: getData.value,
    })
  }
  const onInputTelephone = (value: string) => setStoreValue({ telephone: value })

  // 分机号
  const onInputExtension = (value: string) => setStoreValue({ extension: value })

  return { telephone, extension, onBlurTelephone, onInputTelephone, onInputExtension }
}

// 公司简称
export const useCompanyName = () => {
  const companyName = computed(() => getData.value.companyName)
  const onBlurCompanyName = async ({ required }: { required: boolean }) => {
    await checkValidate({
      required,
      fieldKey: 'companyName',
      value: companyName.value,
      originalData: getData.value,
    })
  }
  const onInputCompanyName = (value: string) => setStoreValue({ companyName: value })

  return { companyName, onBlurCompanyName, onInputCompanyName }
}

// 省市区
export const useArea = () => {
  const areaRef: Ref<RefType | null> = ref(null)
  const area = computed(() => [getData.value.province, getData.value.city, getData.value.county])

  const onClickArea = () => {
    if (areaRef.value) {
      areaRef.value.open(area.value)
    }
  }

  const onConfirmAreaAddress = async (item: AddressValue) => {
    setStoreValue({
      province: getValueOrEmpty(item.province),
      city: getValueOrEmpty(item.city),
      county: getValueOrEmpty(item.county),
    })

    if (area.value?.length > 0 && getData.value.detailAddress) {
      await checkValidate({
        required: true,
        fieldKey: 'address',
        value: `${area.value[0]}${area.value[1]}${area.value[2]}`,
        originalData: getData.value,
      })
    }
  }
  return { area, areaRef, onClickArea, onConfirmAreaAddress }
}

// eslint-disable-next-line max-lines-per-function
export function useDetailAddress() {
  const detailAddressRef: Ref<RefType | null> = ref(null)
  const { detailAddressDialog, addressSelect } = useCommon()
  const { addressProps } = useInitConfig()

  const detailAddress = computed(() => getData.value.detailAddress)

  const onClickDetailAddress = () => {
    if (detailAddressRef.value) {
      detailAddressRef.value.open(detailAddress.value)
      detailAddressRef.value.toFocus()
    }
  }
  // 省市区不相同切换弹窗
  // eslint-disable-next-line complexity
  const onSelectDetailAddress = async (item: AddressValue, list: AddressValue[] = []) => {
    const oldVal = {
      province: getData.value.province,
      city: getData.value.city,
      county: getData.value.county,
    }

    const newVal = {
      province: getValueOrEmpty(item.province),
      city: getValueOrEmpty(item.city),
      county: getValueOrEmpty(item.county),
    }

    const setData = () => {
      setStoreValue({
        province: getValueOrEmpty(item.province),
        city: getValueOrEmpty(item.city),
        county: getValueOrEmpty(item.county),
        detailAddress: getValueOrEmpty(item.detailAddress),
      })
    }

    // 是否含有新的省市区
    const hasOldAddress = newVal.province && newVal.city && newVal.county

    if (oldVal.province) {
      // 判断省市区是否变更
      if (hasOldAddress) {
        if (list?.length >= 2) {
          const res = await addressSelect(list, '收件')
          if (res) {
            setStoreValue({
              province: getValueOrEmpty(res.province),
              city: getValueOrEmpty(res.city),
              county: getValueOrEmpty(res.district),
              detailAddress: getValueOrEmpty(res.address),
            })
          } else {
            setStoreValue({ detailAddress: getValueOrEmpty(item.detailAddress) })
          }
        } else {
          const res = await detailAddressDialog(newVal, oldVal)
          if (res) {
            setData()
          } else {
            setStoreValue({ detailAddress: getValueOrEmpty(item.detailAddress) })
          }
        }
      }
    } else {
      if (list?.length >= 2) {
        const res = await addressSelect(list, '收件')
        if (res) {
          setStoreValue({
            province: getValueOrEmpty(res.province),
            city: getValueOrEmpty(res.city),
            county: getValueOrEmpty(res.district),
            detailAddress: getValueOrEmpty(res.address),
          })
        } else {
          setStoreValue({ detailAddress: getValueOrEmpty(item.detailAddress) })
        }
      } else {
        setData()
      }
    }

    const hasAddress = getData.value.province && getData.value.city && getData.value.county && detailAddress.value
    if (hasAddress) {
      await checkValidate({
        required: addressProps.value.addressConfig.required,
        fieldKey: 'address',
        value: detailAddress.value,
        originalData: getData.value,
      })
    }
  }

  return { detailAddressRef, detailAddress, onClickDetailAddress, onSelectDetailAddress }
}
