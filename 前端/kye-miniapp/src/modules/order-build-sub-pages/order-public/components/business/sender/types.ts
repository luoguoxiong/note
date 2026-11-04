export interface AreaType {
  show: boolean
}

export interface RefType {
  open: (locations: string[] | null | string, addressId?: string) => void
}

export interface AreaAddressItem {
  province: string
  city: string
  county: string
}

export type FieldKey = 'person' | 'mobile' | 'telephone' | 'address' | 'companyName' | 'sender' | 'extension'

export interface AddressData {
  name: string
  mobilePhone: string
  telPhone: string
  province: string
  city: string
  district: string
  address: string
}

export interface PageReactiveType {
  province: string
  city: string
  county: string
  area: string[]
  detailAddress: string
  fullAddress: string
  specifyAddress: string
}
