export interface imageAddressAnalysisRes {
  detect_information: detect_information
  from_type: string
}

export interface detect_information {
  address: string
  company: string
}

export interface Delivery {
  isSend: number
  isPickUp: number
  canSendList: canSendList[]
}

export interface canSendList {
  provinceId: string
  province: string
  cityId: string
  city: string
  zone: string
  zoneId: string
  streetId: string
  street: string
}

export interface AiAddrAnalysisRes {
  province: string
  provinceId: string
  city: string
  cityId: string
  county: string
  countyId: string
  town: string
  townId: string
}

export interface areaSearchRes {
  districtLevel: string
  districtID: string
  districtName: string
  districAllName: string
  districIdList: string[]
}

export interface hotCitysRes {
  domainKey: string[]
  hotCity: HotCitys[]
}

export interface HotCitys {
  cityName: string
  districtId: string
  provinceName: string
  provinceId: string
}

export interface QueryMarketingPersonnelV1Req {
  phone: string
  address: string
  origin: string
  companyName: string
  contactsName?: string
  activityId?: string | number
  source?: number
  sendCouponSource?: string
}

export interface QueryMarketingPersonnelV1Res {
  person?: string
  marketingPhone?: string
  decodePhoneInfo?: string
  wechatQRCodeUrl?: string
  employeeNumber?: string
  couponStatus?: string | number
  couponNumber?: string | number
}
