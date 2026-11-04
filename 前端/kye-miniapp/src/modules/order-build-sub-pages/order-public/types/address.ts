export type FieldKey =
  | 'person'
  | 'mobile'
  | 'telephone'
  | 'address'
  | 'companyName'
  | 'sender'
  | 'extension'
  | 'receive'
  | 'exhibitionSiteNumber'
  | 'specifyAddress'
  | 'exhibitionNumber'
  | 'detailAddress'
  | 'projectArea'
  | 'projectNumber'

export interface ListItem {
  id?: string | number
  person?: string
  mobile?: string
  telephone?: string
  companyName?: string
  province?: string
  city?: string
  county?: string
  detailAddress?: string
  area?: string
}
export interface AddressData {
  name: string
  mobilePhone: string
  telPhone: string
  province: string
  city: string
  district: string
  county: string
  address: string
  detailAddress: string
}
export interface aiAddress {
  person: string
  mobile: string
  telephone: string
  province: string
  city: string
  county: string
  detailAddress: string
}

export interface SuggestListType {
  person: string
  mobile: string
  companyName: string
  telephone: string
  province: string
  city: string
  county: string
  detailAddress: string
  fullAddress: string
}
