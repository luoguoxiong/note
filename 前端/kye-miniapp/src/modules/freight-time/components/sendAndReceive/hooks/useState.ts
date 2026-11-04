import { ref } from 'vue'

// 图标映射
export const ICON_MAP = {
  寄: 'https://ic-img.ky-express.com/netc/20260820_239_!!1787228550482_40_40.svg+xml',
  收: 'https://ic-img.ky-express.com/netc/20260820_68127_!!1787228553758_40_40.svg+xml',
  切换: 'https://ic-img.ky-express.com/netc/20260602_35212_!!1780371652936_32_32.svg+xml',
  地址簿: 'https://ic-img.ky-express.com/netc/20260602_78448_!!1780371798037_36_36.svg+xml',
  必填: 'https://ic-img.ky-express.com/netc/20251125_85651_!!1764053762476_22_14.svg+xml',
  问号: 'https://ic-img.ky-express.com/netc/20260602_76049_!!1780381929910_24_24.svg+xml',
  城市: 'https://ic-img.ky-express.com/netc/20260602_39080_!!1780384908571_40_40.svg+xml',
  详细地址: 'https://ic-img.ky-express.com/netc/20260602_74811_!!1780384913120_40_40.svg+xml',
  右箭头: 'https://ic-img.ky-express.com/netc/20251211_45859_!!1765462562517_28_28.svg+xml',
  定位: 'https://ic-img.ky-express.com/netc/20260602_38329_!!1780385623787_32_32.svg+xml',
}

export type AddressInfo = {
  province: string
  city: string
  county: string
  fullAddress: string
  detailAddress: string
  companyName?: string
  mobile?: string
  person?: string
  telephone?: string
  extension?: string
  remark?: string
}
export const defaultAddressData = {
  province: '',
  city: '',
  county: '',
  fullAddress: '',
  detailAddress: '',
  companyName: '',
  mobile: '',
  person: '',
  telephone: '',
  extension: '',
  remark: '',
}

// 寄件地址
const sendAddress = ref<AddressInfo>({
  ...defaultAddressData,
})
export const getSendAddress = () => sendAddress
export const setSendAddress = (val: string | AddressInfo) => {
  if (typeof val === 'string') {
    sendAddress.value.fullAddress = val
  } else {
    sendAddress.value = { ...val }
  }
}

// 收件地址
const receiveAddress = ref<AddressInfo>({
  ...defaultAddressData,
})
export const getReceiveAddress = () => receiveAddress
export const setReceiveAddress = (val: string | AddressInfo) => {
  if (typeof val === 'string') {
    receiveAddress.value.fullAddress = val
  } else {
    receiveAddress.value = { ...val }
  }
}
export const resetAdressData = () => {
  sendAddress.value = {
    ...defaultAddressData,
  }
  receiveAddress.value = {
    ...defaultAddressData,
  }
}
