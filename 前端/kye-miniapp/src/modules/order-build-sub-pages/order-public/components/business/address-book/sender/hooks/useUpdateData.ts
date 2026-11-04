import { computed } from 'vue'
import { AddressValue } from '@order-public-sub-public/constants'
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
    addressLabelCode,
    remark,
    defaultFlag,
  } =
    piniaStore.extend.senderAddressBook()

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
    addressLabelCode,
    remark,
    defaultFlag,
  }
})

// 更新store
export const setStoreValue = (item: AddressValue) => {
  const orderPageType = computed(() => piniaStore.root.getOrderPageType)

  const data: AddressValue = Object.assign(getData.value, item)
  piniaStore.extend.updateSenderAddressBook({ data, orderPageType: orderPageType.value })
}
