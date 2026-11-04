export interface Address {
  companyNameCode: string
  companyName: string
  comAddress: string
  areaNo: string
  temporaryAddress: string
  isBinding: string
}
export interface UserInfo {
  userName: string
  phone: string
  customCode: string
  customerType: string
  currentMoney: string
  lastAddress: Address[]
  birthday: string
  sex: number
  kyeServicePhone: string
  workcompanyName: string
}

export interface userProfileInfo {
  customerCode: string
  encryptPhone: string
  userId: string
  xcxOpenId: string
}

export interface UserInfoByPhone {
  subscribe: number
  loginStatus: number
  subscribeTime: number
  phone: string
  jgId: string
  deviceCode: string
}
