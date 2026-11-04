import { computed } from 'vue'
import { AddressValue } from '@order-public-sub-public/constants'

import { AddressBook } from '@order-public-sub-public/apis/address/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const getData = computed(() => {
  const {
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
    addressLabelCode,
  } =
    piniaStore.extend.receiveAddressBook()

  return {
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
    addressLabelCode,
  }
})

// 更新store
export const setStoreValue = (item: AddressValue) => {
  const data: AddressValue = Object.assign(getData.value, item)
  piniaStore.extend.updateReceiveAddressBook({ data: data as AddressBook })
}
