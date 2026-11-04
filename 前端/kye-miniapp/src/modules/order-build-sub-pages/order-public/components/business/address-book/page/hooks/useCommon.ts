import { getValueOrEmpty } from '@order-public-sub-public/utils'
import { AddressValue } from '@order-public-sub-public/constants'

import { ref } from 'vue'

// 寄/收数据是否可以编辑数据组装
export const getEditableFields = (item: AddressValue, data: AddressValue, addressProps: any) => {
  const editableFields = {
    person: getValueOrEmpty(item.person),
    mobile: getValueOrEmpty(item.mobile),
    telephone: getValueOrEmpty(item.telephone),
    extension: getValueOrEmpty(item.extension),
    companyName: getValueOrEmpty(item.companyName),
    province: getValueOrEmpty(item.province),
    city: getValueOrEmpty(item.city),
    county: getValueOrEmpty(item.county),
    detailAddress: getValueOrEmpty(item.detailAddress),
  }

  if (addressProps.value.personConfig.editable) {
    editableFields.person = getValueOrEmpty(data?.person)
  }

  if (addressProps.value.mobileConfig.editable) {
    editableFields.mobile = getValueOrEmpty(data?.mobile)
  }

  if (addressProps.value.telephoneConfig.editable) {
    editableFields.telephone = getValueOrEmpty(data?.telephone)
    editableFields.extension = getValueOrEmpty(data?.extension)
  }

  if (addressProps.value.companyNameConfig.editable) {
    editableFields.companyName = getValueOrEmpty(data?.companyName)
  }

  if (addressProps.value.addressConfig.editable) {
    editableFields.province = getValueOrEmpty(data?.province)
    editableFields.city = getValueOrEmpty(data?.city)
    editableFields.county = getValueOrEmpty(data?.county)
    editableFields.detailAddress = getValueOrEmpty(data?.detailAddress)
  }

  return editableFields
}

// 截断手机号带虚拟号
export const telephoneFn = (value: string) => value && value.split('-')?.[0]

export const needResetTabIndex = ref(true)
