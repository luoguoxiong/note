/**
 * 客户编码模块 Store 类型定义
 */
import type { CompanyInfo, BindForm, ConfigData, DepartmentInfo } from '../types/customer-code'
import type { DisplayMode } from '../constants/index'

/** UI 状态 */
export interface UIState {
  /** 是否加载中 */
  loading: boolean
  /** 显示模式（弹窗/页面） */
  mode: DisplayMode
  /** 是否显示联系商务弹窗 */
  showContactBusiness: boolean
  /** 是否显示确认弹窗 */
  showAlert: boolean
  /** 是否显示图形验证码 */
  showCaptcha: boolean
  /** 图形验证码信息 */
  captchaInfo?: {
    ruleId?: string
    strategyCode?: string
    type?: number
  }
}

/** CustomerCode Store 状态 */
export interface CustomerCodeState {
  /** 绑定表单数据 */
  bindForm: BindForm

  /** 已绑定公司列表 */
  companyInfoList: CompanyInfo[]

  /** 当前绑定的公司信息 */
  currentCompany: CompanyInfo | null

  /** 正在切换的目标公司（用于显示"切换中"状态） */
  switchingCompany: CompanyInfo | null

  /** UI 状态 */
  uiState: UIState

  /** 配置数据（按钮列表等） */
  configData: ConfigData

  /** 部门列表（快速寄件页场景） */
  departmentList: DepartmentInfo[]

  /** 当前部门信息 */
  currentDepartment: DepartmentInfo | null
}
