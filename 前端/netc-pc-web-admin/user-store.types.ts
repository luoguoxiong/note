export interface Address {
  companyCode: string
  companyName: string
  comAddress: string
  areaNo: string
  temporaryAddress: string
  isBinding: string
}

export interface CustomerInfo {
  province: string
  city: string
  district: string
  street: string
  village: string
  companyType: string
  belongIndustry: string
  customerType: string
  id: string
  marketName: string
  assistantName: string
  customerName: string
  customerShortName: string
  address: string
  customerStatus: string
  mainProduct: string
  businessBrand: string
  payMode: string
  doorNumber: string
  provinceId: string
  cityId: string
  districtId: string
  streetId: string
  villageId: string
  country: string
  countryId: string
  customerFlag: string | null
  serviceMode: string
  cityAreaCode: string
  allowToOrderFlag: string
  assistantPhone: string
  marketPhone: string
  vipshopFlag: string
  customerCode: string
  modifyShipperFlag: string
  otherWarehouseType: string
  flyServiceFlag: number
  flyOperationType: number
  recoveryReceiptFlag: string
  customerSource: string
  verificCodeFlag: string | null
  defaultInsurancePrice: string
  userName: string
  detailAddress: string
  registerTime: number
}

export interface UserInfo {
  userName: string
  phone: string
  customCode: string
  customerType: string
  currentMoney: string
  lastAddress: Address[]
  isCustomerIsMonthly: boolean
  kyeServicePhone: string
  marketer: string
  openid: string | null
  workCompany: string
  birthday: string | null
  sex: number
  hasPwdFlag: boolean
  customerInfo: CustomerInfo
  headUrl: string
  payCustomerCode: string
  xcxOpenId: string | null
  isEmployee: boolean
  marketingTelphone: string
  canSendAccFlag: boolean
  id: number
  enableUpdateBirthday: boolean
  registrationTime: string
  registrationDay: number
  position: string | null
}

export interface HeadImgRealNameTagVO {
  authFlag: number
  authFlagName: string
}

export interface PersonalPageRealNameTagVO {
  authFlagName: string
  authButtonName: string
  authDesc: string
}

export interface RealNameAuthInfo {
  isValidation: boolean
  isRealName: boolean
  customerType: number
  icName: string
  idCard: string
  realName: string
  authFlag: number
  noticeExplain: string | null
  noticeTitle: string | null
  headImgRealNameTagVO: HeadImgRealNameTagVO
  personalPageRealNameTagVO: PersonalPageRealNameTagVO
}

export interface UserStoreState {
  userInfo: UserInfo | null
  isLoggedIn: boolean
  token: string
  realNameAuthInfo: RealNameAuthInfo | null
  loading: boolean
  error: string | null
  lastLoginTime: number
  loginExpireTime: number
}
