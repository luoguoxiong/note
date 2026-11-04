export interface AddressItem {
  addressCode: string
  address: string
}

export interface BaseInfo {
  hrUserId?: string
}

export interface Detail {
  baseInfo: BaseInfo
}

export interface Props {
  companyAddressList?: AddressItem[]
  initialAddressCode?: string
  initialCustomerAddress?: string
  detail?: Detail
}

export interface AddressData {
  addressCode: string
  address: string
}
