import { ref } from 'vue'

interface receipterAddrInfo {
  companyName?: string
  person?: string
  mobile?: string
  province?: string
  city?: string
  county?: string
  detailAddress?: string
}

export const receiptBackAddr = ref<receipterAddrInfo>({})

export const resetReceiptBackAddr = () => {
  receiptBackAddr.value = {}
}
