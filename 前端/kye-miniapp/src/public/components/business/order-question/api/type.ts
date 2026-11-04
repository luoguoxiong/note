export interface CheckReq {
  alertType: string
  phone: string
}

export interface AlertStatusData {
  status: boolean
  alertType: 'surveyQuestionnaire'
  alertData: AlertData
}

export interface AlertData {
  title: string
  moduleList: ModuleItem[]
}

export interface ModuleItem {
  moduleName: string
  moduleType: string // e.g., "sender" | "payment" | "goods" 等
  optionList: OptionItem[]
}

export interface OptionItem {
  optionName: string
  optionType: string // e.g., "sender-10", "payment-other"
  placeHolder: string
  needInput: boolean
  inputRequire: boolean
  showOption: boolean
  defaultSelected: boolean
}

export interface SubmitSurveyPayload {
  source: string // 来源，例如 "miniprogram"
  bizSource: string // 业务类型，例如 "surveyQuestionnaire"
  bizData: BizData
  phone: string // 用户手机号
}

export interface BizData {
  moduleType: string // 模块类型，例如 "sender"
  optionType: string // 选项类型，例如 "sender-10"
  inputContent: string // 用户填写内容
  source: string // 来源冗余字段，同上
  orderid: string // 订单 ID
  promptOptContext: string // 退出时提示文案
  confirm: string // 确认状态，例如 "10"
  notRemind: boolean // 是否不再提醒
}
