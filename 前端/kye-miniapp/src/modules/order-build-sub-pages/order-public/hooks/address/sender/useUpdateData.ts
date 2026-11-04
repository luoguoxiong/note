import { Address, AddressValue, ModuleType } from '@order-public-sub-public/constants'
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
  locationId,
  locationName,
  exhibitionCode,
  exhibitionNumber,
  exhibitionSiteNumber,
  specifyAddress,
  exhibitionProject,
} from '@order-public-sub-public/hooks/address/sender/state'
import useValidate from './useValidate'

import { getValueOrEmpty } from '@order-public-sub-public/utils'
import useEmit from '@order-public-sub-public/hooks/address/sender/useEmit'
import { useStore } from '@order-public-sub-public/store'
import { hasAddressValue } from '@order-public-sub-public/hooks/address/useCommon'
const piniaStore = useStore()

interface UseUpdateDataType {
  item: AddressValue
  needMerge?: boolean
}

// 获取数据
export const getData = () => {
  return {
    ...piniaStore.order.moduleFormData(ModuleType['寄方信息']),
    person: person.value,
    mobile: mobile.value,
    telephone: telephone.value,
    extension: extension.value,
    companyName: companyName.value,
    province: province.value,
    city: city.value,
    county: county.value,
    detailAddress: detailAddress.value,
    locationId: locationId.value,
    locationName: locationName.value,
    exhibitionCode: exhibitionCode.value,
    exhibitionNumber: exhibitionNumber.value,
    exhibitionSiteNumber: exhibitionSiteNumber.value,
    exhibitionProject: exhibitionProject.value,
  }
}

// 初始化赋值
export const initData = (formData: AddressValue) => {
  formData = formData || {}
  person.value = getValueOrEmpty(formData.person)
  mobile.value = getValueOrEmpty(formData.mobile)
  telephone.value = getValueOrEmpty(formData.telephone)
  extension.value = getValueOrEmpty(formData.extension)
  companyName.value = getValueOrEmpty(formData.companyName)
  province.value = getValueOrEmpty(formData.province)
  city.value = getValueOrEmpty(formData.city)
  county.value = getValueOrEmpty(formData.county)
  detailAddress.value = getValueOrEmpty(formData.detailAddress)
  locationId.value = getValueOrEmpty(formData.locationId)
  locationName.value = getValueOrEmpty(formData.locationName)
  specifyAddress.value = [formData.province, formData.city, formData.county, formData.detailAddress]
    .filter((part) => !!part)
    .join('')

  console.log('初始化地址信息')
}

// 寄方信息：处理置灰字段是否更新数据
/* eslint-disable */
export const useUpdateData = ({
  moduleStyle,
  remoteCheckKey,
  needRemoteCheck = true,
}: {
  moduleStyle: string
  remoteCheckKey?: string
  needRemoteCheck?: boolean
}) => {
  const { addressProps } = useInitConfig({ moduleStyle })
  const { manyValidate } = useValidate()
  // 更新store
  const setStoreValue = () => {
    if (moduleStyle === Address.SENDER) {
      const senderData = getData()
      piniaStore.order.updateOrderByType({ type: ModuleType['寄方信息'], data: { ...senderData } })
    }
  }

  // 校验
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
      remoteCheckKey,
      originalData: getData(),
      needRemoteCheck: needRemoteCheck && moduleStyle === Address.SENDER,
    })
  }

  // 设置姓名数据
  const setPersonValue = ({ item, needMerge }: UseUpdateDataType) => {
    if (addressProps.value.addressEdit) {
      if (addressProps.value.fieldsConfigType) {
        if (addressProps.value.personConfig.editable) {
          person.value = item?.person || person.value
        }
      } else {
        person.value = item.person || ''
      }
    } else {
      if (addressProps.value.personConfig.editable) {
        if (needMerge) {
          person.value = item?.person || person.value
        } else {
          person.value = item.person || ''
        }
      }
    }
  }

  // 设置手机号数据
  const setMobileValue = ({ item, needMerge }: UseUpdateDataType) => {
    if (addressProps.value.addressEdit) {
      if (addressProps.value.fieldsConfigType) {
        if (addressProps.value.mobileConfig.editable) {
          mobile.value = item?.mobile || mobile.value
        }
      } else {
        mobile.value = item.mobile || ''
      }
    } else {
      if (addressProps.value.mobileConfig.editable) {
        if (needMerge) {
          mobile.value = item?.mobile || mobile.value
        } else {
          mobile.value = item.mobile || ''
        }
      }
    }
  }

  // 设置固定电话、分机号数据
  const setTelephoneValue = ({ item, needMerge }: UseUpdateDataType) => {
    if (addressProps.value.addressEdit) {
      if (addressProps.value.fieldsConfigType) {
        if (addressProps.value.telephoneConfig.editable) {
          telephone.value = item?.telephone || telephone.value
          extension.value = item?.extension || extension.value
        }
      } else {
        telephone.value = item.telephone || ''
        extension.value = item?.extension || ''
      }
    } else {
      if (addressProps.value.telephoneConfig.editable) {
        if (needMerge) {
          telephone.value = item?.telephone || telephone.value
          extension.value = item?.extension || extension.value
        } else {
          telephone.value = item.telephone || ''
          extension.value = item?.extension || ''
        }
      }
    }
  }

  // 设置公司名称数据
  const setCompanyName = ({ item, needMerge }: UseUpdateDataType) => {
    const sendOrderInfo = piniaStore.order.moduleFormData(ModuleType['寄方信息'])
    if (addressProps.value.addressEdit) {
      if (addressProps.value.fieldsConfigType) {
        if (addressProps.value.companyNameConfig.editable) {
          companyName.value = item?.companyName || companyName.value
        }
      } else {
        companyName.value = item.companyName || ''
      }
    } else {
      if (addressProps.value.companyNameConfig.editable) {
        if (needMerge) {
          companyName.value = item.companyName || sendOrderInfo.companyName
        } else {
          companyName.value = item.companyName || ''
        }
      } else {
        companyName.value = sendOrderInfo.companyName || ''
      }
    }
  }

  // 设置省市区
  const setAreaValue = ({ item, needMerge }: UseUpdateDataType) => {
    // 往返寄中 中会存在 禁止 修改的情况
    let disabledItem = piniaStore.globalData.returnEditDisableInfo('senderExtraInfo', 'address') || {}
    if (!!disabledItem.key) return

    const hasValue = hasAddressValue(item)
    if ((addressProps.value.addressConfig.editable || addressProps.value.addressEdit) && hasValue) {
      province.value = item.province || ''
      city.value = item.city || ''
      county.value = item.county || ''
    }
  }

  // 设置详细地址
  const setDetailAddress = ({ item, needMerge }: UseUpdateDataType) => {
    // 往返寄中 中会存在 禁止 修改的情况
    let disabledItem = piniaStore.globalData.returnEditDisableInfo('senderExtraInfo', 'address') || {}
    if (!!disabledItem.key) return

    const hasValue = hasAddressValue(item)
    //需求539972,只要有一个值，就覆盖
    console.log(needMerge)
    if ((addressProps.value.addressEdit || addressProps.value.addressConfig.editable) && hasValue) {
      detailAddress.value = item?.detailAddress || ''
    }
    useEmit().emitName('detailAddress', detailAddress.value)
  }

  // 设置置灰不可编辑的字段
  const setEditValue = async ({ item, needMerge }: UseUpdateDataType) => {
    console.log('设置置灰不可编辑的字段', item)
    // 姓名
    setPersonValue({ item, needMerge })

    // 手机号
    setMobileValue({ item, needMerge })

    // 固定电话
    setTelephoneValue({ item, needMerge })

    // 公司名称
    setCompanyName({ item, needMerge })

    // 省市区
    setAreaValue({ item, needMerge })

    // 详细地址
    setDetailAddress({ item, needMerge })

    // 处理地址切换场景下展馆展位号
    if (item?.exhibitionCode) {
      exhibitionCode.value = item.exhibitionCode
    }

    if (item?.exhibitionNumber) {
      exhibitionNumber.value = item.exhibitionNumber
    }

    if (item?.exhibitionSiteNumber) {
      exhibitionSiteNumber.value = item.exhibitionSiteNumber as string
    }

    if (item?.exhibitionProject) {
      exhibitionProject.value = item.exhibitionProject
    }

    // 平铺场景，直接更新到store
    setStoreValue()

    const res = await allFiledKeyValidate()
    return res
  }

  return { setEditValue, setStoreValue }
}
