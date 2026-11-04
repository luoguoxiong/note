/**
 * 客户编码业务实体类型定义
 */

/** 公司信息 */
export interface CompanyInfo {
  /** 公司ID */
  customerId: string | number
  /** 公司名称 */
  customerName: string
  /** 客户编码 */
  customerCode: string
  /** 客户密码 */
  customerPassword?: string
  /** 是否当前绑定: '1'=当前绑定, ''=非当前 */
  isCurrBond: string
  /** 公司简称 */
  customerShortName?: string
}

/** 绑定表单数据 */
export interface BindForm {
  /** 客户编码 */
  customerCode: string
  /** 客户编码密码 */
  customerPassword: string
  /** 姓名（选填） */
  memberName: string
}

/** 配置数据（按钮列表项） */
export interface ConfigDataItem {
  /** 场景标识 */
  scene: string
  /** 按钮名称 */
  buttonname: string
  /** 跳转URL */
  url: string
}

/** 配置数据 */
export interface ConfigData {
  /** 按钮列表 */
  btnLists: ConfigDataItem[]
}

/** 部门信息 */
export interface DepartmentInfo {
  /** 部门编码 */
  departmentCode: string
  /** 部门名称 */
  departmentName: string
  /** 是否当前部门 */
  current?: boolean
}

/** 绑定结果 */
export interface BindResult {
  /** 状态: 1=成功, 其他=失败/需确认 */
  status: number
  /** 当前绑定信息 */
  currentBind?: Partial<CompanyInfo>
  /** 错误公司列表（重复绑定时） */
  errCompanyList?: Array<{
    customerShortName: string
    customerCode: string
  }>
}

/** 黑名单用户角色信息 */
export interface BlackUserContactRole {
  /** 角色代码 */
  role: number
  /** 角色描述 */
  msg: string
}

/** 图形验证码信息 */
export interface GraphicVerifyInfo {
  /** 验证规则ID */
  ruleId?: string
  /** 策略码 */
  strategyCode?: string
  /** 验证类型 */
  type?: number
}
