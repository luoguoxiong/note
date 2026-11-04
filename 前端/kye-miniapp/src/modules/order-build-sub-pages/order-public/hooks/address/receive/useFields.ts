import { RefType } from '@order-public-sub-public/components/business/receive/types'
import { Address, AddressType, AddressValue, ModuleType, SelfSignType } from '@order-public-sub-public/constants'
import {
  city,
  companyName,
  county,
  detailAddress,
  extension,
  locationId,
  locationName,
  mobile,
  person,
  province,
  specifyAddress,
  telephone,
} from '@order-public-sub-public/hooks/address/receive/state'
import useEmit from '@order-public-sub-public/hooks/address/receive/useEmit'
import useInitConfig from '@order-public-sub-public/hooks/address/receive/useInitConfig'
import { getData, useUpdateData } from '@order-public-sub-public/hooks/address/receive/useUpdateData'
import useValidate from '@order-public-sub-public/hooks/address/receive/useValidate'
import useCommon, {
  reportCloseDropdownMenu,
  updateCommonDisabledScroll,
} from '@order-public-sub-public/hooks/address/useCommon'
import { reportPerception } from '@order-public-sub-public/reportUmp/util/index'
// import router from '@order-public-sub-public/router'
import {
  clk_express_sender_information_control_v1,
  other_express_sender_information_control_v1,
  other_express_single_address_book_select_v1,
} from '@order-public-sub-public/components/business/address-book/page/report'

import { ListItem, ReceiveDimension, SelfSign, SuggestListType } from '@order-public-sub-public/types'
import { filterAllSpace } from '@order-public-sub-public/utils'
import useEffect from '@order-public-sub-public/validate'
import { removeErrClassByDataValidate } from '@order-public-sub-public/validate/effect/effectBubble'
import { debounce } from 'lodash-es'
import { computed, ComputedRef, Ref, ref, watch } from 'vue'
import { getValueOrEmpty } from './../../../utils/index'
import { closeDropdownMenuSender } from '@order-public-sub-public/hooks/address/sender/useFields'
import { useStore } from '@order-public-sub-public/store'
import { currentPopueType } from '@order-public-sub-public/hooks/address/sender/state'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const piniaStore = useStore()
const { effectBubble } = useEffect()

// 姓名
const isPersonFocus = ref(false)
const isMobileFocus = ref(false)
const visibleDropdownMenu = ref(false)
const visibleDropdownMenuPosition = ref('person')

const closeDropdownMenu = () => {
  visibleDropdownMenu.value = false
  reportCloseDropdownMenu('收件')
  // 关闭寄件联想
  // closeDropdownMenuSender()
}

export const closeDropdownMenuReceive = closeDropdownMenu

export function usePerson({
  moduleStyle,
  clearStatus = undefined,
}: {
  moduleStyle: string
  clearStatus?: ComputedRef<boolean>
}) {
  const { setStoreValue } = useUpdateData({ moduleStyle })
  // 校验
  const { checkValidate } = useValidate()

  const onFocusPerson = () => {
    isPersonFocus.value = true
    visibleDropdownMenuPosition.value = 'person'
    clk_express_sender_information_control_v1('receive', '姓名')
  }

  const onBlurPerson = async ({ required }: { required: boolean }) => {
    other_express_sender_information_control_v1('receive', '姓名')
    isPersonFocus.value = false
    // visibleDropdownMenu.value = false
    if (!(clearStatus && !clearStatus.value)) {
      onInputPerson(person.value.trim())
      await checkValidate({
        required,
        fieldKey: 'person',
        value: person.value,
        originalData: getData(),
      })
    }
  }

  const onInputPerson = (value: string) => {
    person.value = value
    setStoreValue()
  }

  return {
    person,
    onFocusPerson,
    onBlurPerson,
    onInputPerson,
  }
}

// 手机号
export function useMobile({
  moduleStyle,
  clearStatus = undefined,
}: {
  moduleStyle: string
  clearStatus?: ComputedRef<boolean>
}) {
  const { setStoreValue } = useUpdateData({ moduleStyle })
  // 校验
  const { checkValidate } = useValidate()

  const onFocusMobile = async () => {
    isMobileFocus.value = true
    visibleDropdownMenuPosition.value = 'mobile'
    clk_express_sender_information_control_v1('receive', '手机')
  }

  const onBlurMobile = async ({ required }: { required: boolean }) => {
    other_express_sender_information_control_v1('receive', '手机')
    isMobileFocus.value = false
    // visibleDropdownMenu.value = false
    if (!(clearStatus && !clearStatus.value)) {
      // 如果是本人签收并且带虚拟号校验
      const selfSign = piniaStore.order.moduleFormData(ModuleType.本人签收).selfSignFlag === SelfSignType.YES
      if (selfSign && mobile.value && !/^(1[3|4|5|6|7|8|9][0-9]\d{8})$/.test(filterAllSpace(mobile.value))) {
        const validateResult = [{ passed: false, key: 'receive.mobile', content: '使用本人签收需填写真实收件人手机' }]
        await effectBubble(validateResult)
      }
      await checkValidate({
        required,
        fieldKey: 'mobile',
        value: mobile.value,
        originalData: getData(),
      })
    }
  }

  const onInputMobile = (value: string) => {
    mobile.value = value
    setStoreValue()
  }

  return {
    mobile,
    onFocusMobile,
    onBlurMobile,
    onInputMobile,
  }
}

// 姓名手机号联想
export function useSuggestData({ moduleStyle }: { moduleStyle: string }) {
  const { addressProps } = useInitConfig({ moduleStyle })
  const suggestList = ref([] as SuggestListType[])
  const { getPagePreciseQuery } = useCommon()

  // 姓名联想

  const handleInputChange = debounce(async (value?: string | boolean) => {
    // 有地址簿才联想
    if (addressProps.value.addressVisible && value && (isPersonFocus.value || isMobileFocus.value)) {
      const params = {
        addressType: '20',
        contact: person.value,
        contactPhone: filterAllSpace(mobile.value),
      }
      const res = await getPagePreciseQuery(params)
      suggestList.value = res || []
      visibleDropdownMenu.value = suggestList.value.length > 0 && isPersonFocus.value
    } else {
      visibleDropdownMenu.value = false
      suggestList.value = []
    }
  }, 300)

  watch(
    () => person.value,
    (value) => handleInputChange(value),
  )

  watch(
    () => filterAllSpace(mobile.value),
    (value) => handleInputChange(value),
  )

  watch(
    () => isPersonFocus.value,
    (value) => {
      if (value) {
        handleInputChange(person.value)
      }
    },
  )

  watch(
    () => isMobileFocus.value,
    (value) => {
      if (value) {
        handleInputChange(mobile.value)
      }
    },
  )

  // 选中联想出来的数据
  const selectSuggest = (item: AddressValue) => {
    const { setEditValue } = useUpdateData({ moduleStyle })
    setEditValue({ item })
    suggestList.value = []
    visibleDropdownMenu.value = false
    other_express_single_address_book_select_v1(AddressType.RECEIVE, { receiver_id: item.id })
  }

  return {
    suggestList,
    selectSuggest,
    closeDropdownMenu,
    visibleDropdownMenu,
    visibleDropdownMenuPosition,
  }
}

// 固定电话和分机号
export function useTelephone({ moduleStyle }: { moduleStyle: string }) {
  const { setStoreValue } = useUpdateData({ moduleStyle })
  // 校验
  const { checkValidate } = useValidate()

  const onFocusTelephone = () => {
    clk_express_sender_information_control_v1('receive', '固话')
  }

  const onInputTelephone = (value: string) => {
    telephone.value = value
    setStoreValue()
  }

  const onBlurTelephone = async ({ required }: { required: boolean }) => {
    other_express_sender_information_control_v1('receive', '固话')
    await checkValidate({
      required,
      fieldKey: 'telephone',
      value: telephone.value,
      originalData: getData(),
    })
  }

  const onFocusExtension = () => {
    clk_express_sender_information_control_v1('receive', '分机号')
  }

  // 分机号
  const onInputExtension = (value: string) => {
    extension.value = value
    setStoreValue()
  }

  const onBlurExtension = async () => {
    other_express_sender_information_control_v1('receive', '分机号')
    if (!telephone.value && !extension.value) {
      removeErrClassByDataValidate('receive.telephone')
    }

    let flag = false

    if ((!telephone.value && extension.value) || (telephone.value && extension.value)) {
      flag = true
    }

    await checkValidate({
      required: flag,
      fieldKey: 'telephone',
      value: telephone.value,
      originalData: getData(),
    })
  }

  return {
    telephone,
    extension,
    onFocusTelephone,
    onInputTelephone,
    onBlurTelephone,
    onFocusExtension,
    onInputExtension,
    onBlurExtension,
  }
}

// 公司名称
export function useCompanyName({ moduleStyle }: { moduleStyle: string }) {
  const { setStoreValue } = useUpdateData({ moduleStyle })
  // 校验
  const { checkValidate } = useValidate()

  const onInputCompanyName = (value: string) => {
    companyName.value = value
    setStoreValue()
  }

  const onBlurCompanyName = async ({ required }: { required: boolean }) => {
    await checkValidate({
      required,
      fieldKey: 'companyName',
      value: companyName.value,
      originalData: getData(),
    })
  }

  return { companyName, onInputCompanyName, onBlurCompanyName }
}

// 省市区
export function useArea({ moduleStyle }: { moduleStyle: string }) {
  const { setStoreValue } = useUpdateData({ moduleStyle })
  const areaRef: Ref<RefType | null> = ref(null)
  const { addressProps } = useInitConfig({ moduleStyle })
  // 校验
  const { checkValidate } = useValidate()

  const area = computed(() => [province.value, city.value, county.value])

  const onClickArea = () => {
    clk_express_sender_information_control_v1('receive', '省市区')
    if (areaRef.value) {
      areaRef.value.open(area.value)
      // TODO：看看要不要删除
      // console.log('打开省市区选择')
      // nextTick(() => {
      // if (router.currentRoute.value?.name === 'address-book-sender') {
      // reportPerception('other_express_sender_city_perception_v1')
      // }
      // })
    }
  }

  const onConfirmAreaAddress = async (item: AddressValue) => {
    other_express_sender_information_control_v1('receive', '省市区')
    province.value = getValueOrEmpty(item?.province)
    city.value = getValueOrEmpty(item?.city)
    county.value = getValueOrEmpty(item?.county)

    setStoreValue()

    // 省市区和详细地址存在，需要走校验
    if (area.value?.length > 0 && detailAddress.value) {
      await checkValidate({
        required: addressProps.value.addressConfig.required,
        fieldKey: 'address',
        value: `${province.value}${city.value}${county.value}`,
        originalData: getData(),
        needRemoteCheck: moduleStyle === Address.RECEIVE,
      })
    }
  }

  return { province, city, county, area, onClickArea, areaRef, onConfirmAreaAddress }
}

// 详细地址
// eslint-disable-next-line max-lines-per-function
export function useDetailAddress({ moduleStyle }: { moduleStyle: string }) {
  const detailAddressRef: Ref<RefType | null> = ref(null)
  const { detailAddressDialog, addressSelect } = useCommon()
  const { setStoreValue } = useUpdateData({ moduleStyle })
  const { addressProps } = useInitConfig({ moduleStyle })
  const { checkValidate } = useValidate()
  updateCommonDisabledScroll()
  const onClickDetailAddress = () => {
    clk_express_sender_information_control_v1('receive', '详细地址')
    if (detailAddressRef.value) {
      updateCommonDisabledScroll(true)
      detailAddressRef.value.open(detailAddress.value)
      reportPerception('other_express_receiver_address_associate_perception_v1')
    }
  }

  // 省市区不相同切换弹窗
  // eslint-disable-next-line complexity
  const onSelectDetailAddress = async (item: AddressValue, list: AddressValue[] = []) => {
    other_express_sender_information_control_v1('receive', '详细地址')
    const oldVal = {
      province: province.value,
      city: city.value,
      county: county.value,
    }

    const newVal = {
      province: getValueOrEmpty(item?.province),
      city: getValueOrEmpty(item?.city),
      county: getValueOrEmpty(item?.county),
    }

    const setData = () => {
      province.value = getValueOrEmpty(item?.province)
      city.value = getValueOrEmpty(item?.city)
      county.value = getValueOrEmpty(item?.county)
      detailAddress.value = getValueOrEmpty(item?.detailAddress)
    }

    // 是否含有新的省市区
    const hasOldAddress = newVal.province && newVal.city && newVal.county

    if (oldVal.province) {
      // 判断省市区是否变更
      if (hasOldAddress) {
        if (list.length >= 2) {
          const res = await addressSelect(list, '收件')
          if (res) {
            province.value = res?.province || ''
            city.value = res?.city || ''
            county.value = res?.district || ''
            detailAddress.value = res?.address || ''
          } else {
            detailAddress.value = item?.detailAddress || ''
          }
        } else {
          const res = await detailAddressDialog(newVal, oldVal)
          if (res) {
            setData()
          } else {
            detailAddress.value = getValueOrEmpty(item?.detailAddress)
          }
        }
      }
    } else {
      if (list.length >= 2) {
        const res = await addressSelect(list, '收件')
        if (res) {
          province.value = res?.province || ''
          city.value = res?.city || ''
          county.value = res?.district || ''
          detailAddress.value = res?.address || ''
        } else {
          detailAddress.value = item?.detailAddress || ''
        }
      } else {
        setData()
      }
    }

    setStoreValue()

    const hasAddress = province.value && city.value && county.value && detailAddress.value
    if (hasAddress) {
      await checkValidate({
        required: addressProps.value.addressConfig.required,
        fieldKey: 'address',
        value: detailAddress.value,
        originalData: getData(),
        needRemoteCheck: moduleStyle === Address.RECEIVE,
      })
      useEmit().emitName('detailAddress', detailAddress.value)
    }
  }
  return {
    detailAddressRef,
    detailAddress,
    onClickDetailAddress,
    onSelectDetailAddress,
  }
}

// 指定地址
// eslint-disable-next-line
export function useSpecifyAddress({ moduleStyle }: { moduleStyle: string }) {
  const specifyAddressRef: Ref<RefType | null> = ref(null)
  const { addressProps } = useInitConfig({ moduleStyle })
  const { manyValidate } = useValidate()
  const { setStoreValue } = useUpdateData({ moduleStyle })

  const onClickSpecifyAddress = () => {
    if (specifyAddressRef.value) {
      specifyAddressRef.value.open(specifyAddress.value, locationId.value)
    }
  }

  const setAddressData = (item: AddressValue) => {
    province.value = getValueOrEmpty(item.province)
    city.value = getValueOrEmpty(item.city)
    county.value = getValueOrEmpty(item.county)
    detailAddress.value = getValueOrEmpty(item.detailAddress)
    locationName.value = getValueOrEmpty(item.locationName)
    locationId.value = getValueOrEmpty(item.locationId)
    specifyAddress.value = `${province.value}${city.value}${county.value}${detailAddress.value}`
  }

  // 判断字段是否维护了可编辑
  const setEditData = (item: AddressValue) => {
    if (addressProps.value.personConfig.editable && item.person) {
      person.value = item.person
    }
    if (addressProps.value.mobileConfig.editable && item.mobile) {
      mobile.value = item.mobile
    }
    if (addressProps.value.telephoneConfig.editable && item.telephone) {
      telephone.value = item.telephone
    }
    if (addressProps.value.companyNameConfig.editable && item.companyName) {
      companyName.value = item.companyName
    }
  }

  const onSelectSpecifyAddress = async (item: AddressValue) => {
    setAddressData(item)

    if (addressProps.value.fieldsConfigType) {
      // 分字段维护
      setEditData(item)
    } else {
      // 组合维护
      person.value = getValueOrEmpty(item.person)
      mobile.value = getValueOrEmpty(item.mobile)
      telephone.value = getValueOrEmpty(item.telephone)
      extension.value = getValueOrEmpty(item.extension)
      companyName.value = getValueOrEmpty(item.companyName)
    }

    // 指定地址并且是组合维护平铺
    if (moduleStyle === Address.RECEIVE && addressProps.value.addressEdit) {
      setStoreValue()
    }

    // 校验
    await allFiledKeyValidate()
    useEmit().emitName('detailAddress', detailAddress.value)
  }

  const allFiledKeyValidate = async () => {
    const params = [
      {
        required: addressProps.value.personConfig.required,
        value: person.value,
        fieldKey: 'person',
      },
      {
        required: addressProps.value.mobileConfig.required,
        value: mobile.value,
        fieldKey: 'mobile',
      },
      {
        required: addressProps.value.telephoneConfig.required,
        value: telephone.value,
        fieldKey: 'telephone',
      },
      {
        required: addressProps.value.companyNameConfig.required,
        value: companyName.value,
        fieldKey: 'companyName',
      },
      {
        required: addressProps.value.addressConfig.required,
        value: `${province.value}${city.value}${county.value}`,
        fieldKey: 'address',
      },
      {
        required: addressProps.value.addressConfig.required,
        value: detailAddress.value,
        fieldKey: 'detailAddress',
      },
    ].filter((i) => i.required || i.value)
    return await manyValidate({
      data: params,
      originalData: getData(),
      needRemoteCheck: moduleStyle === Address.RECEIVE,
    })
  }

  return {
    locationId,
    locationName,
    specifyAddress,
    specifyAddressRef,
    onClickSpecifyAddress,
    onSelectSpecifyAddress,
  }
}

// AI地址推荐
export const useAiAddressRecommend = () => {
  const { setEditValue } = useUpdateData({ moduleStyle: Address.RECEIVE })
  const aiAddressRecommendList = computed(() => {
    const { receiveAiInfoVoList = [] } = piniaStore.schema.moduleDimensionData(ModuleType['收方信息']) || {}
    return receiveAiInfoVoList
  })
  const onSelectAiAddressRecommend = (data: ListItem) => setEditValue({ item: data })

  return { aiAddressRecommendList, onSelectAiAddressRecommend }
}
