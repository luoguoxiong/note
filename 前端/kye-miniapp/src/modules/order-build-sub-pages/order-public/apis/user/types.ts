export interface LogoutTipDataResponse {
  tips?: string
  status?: number
  type?: string | number
}

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

export interface FeeQuestionnaireParams {
  content: string // 业务来源：checkResultList 校验列表
  feedbackType: string // 	登录手机号
  source: string // 来源
  device: string
}

export interface IQuestionnaireData {
  status: boolean // 是否需要弹窗
  alertType: string // 弹窗类型配置
  alertData: any // 弹窗内容
}
