import { computed } from 'vue'
import { AddressValue } from '@order-public-sub-public/constants'
import {
  id,
  person,
  mobile,
  telephone,
  extension,
  companyName,
  province,
  city,
  county,
  detailAddress,
  remark,
} from './useHooks'
import { AddressBook } from '@order-public-sub-public/apis/address/types'

export const getData = computed(() => {
  return {
    id: id.value,
    person: person.value,
    mobile: mobile.value,
    telephone: telephone.value,
    extension: extension.value,
    companyName: companyName.value,
    province: province.value,
    city: city.value,
    county: county.value,
    detailAddress: detailAddress.value,
    remark: remark.value,
  }
})

const updateReceiveAddressBook = (data: AddressBook) => {
  id.value = (data?.id as string) || ''
  person.value = data?.person || ''
  mobile.value = data?.mobile || ''
  telephone.value = data?.telephone || ''
  extension.value = data?.extension || ''
  companyName.value = data?.companyName || ''
  province.value = data?.province || ''
  city.value = data?.city || ''
  county.value = data?.county || ''
  detailAddress.value = data?.detailAddress || ''
  remark.value = data?.remark || ''
}

// 更新hook数据
export const setStoreValue = (item: AddressValue) => {
  const data: AddressValue = Object.assign(getData.value, item)
  updateReceiveAddressBook(data as AddressBook)
}
