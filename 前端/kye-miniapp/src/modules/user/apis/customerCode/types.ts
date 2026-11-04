/**
 * 客户编码模块 API 类型定义
 *
 * 基于 H5 项目 (netc-customer-code) 分析的各接口返回数据结构
 */

// ==================== 通用类型 ====================

/** 通用响应数据类型 */
export type CommonData = Record<string, any>

/** API 错误信息 */
export interface ApiError {
  code: number
  msg: string
  data?: any
}

// ==================== getConfig ====================

/**
 * 获取配置信息 - 返回值
 *
 * H5 使用: setConfigData(res)
 * 包含按钮列表等配置信息
 */
export interface ConfigResponse {
  /** 按钮配置列表 */
  btnLists: ButtonConfig[]
  [key: string]: any
}

/** 按钮配置项 */
export interface ButtonConfig {
  /** 场景标识 */
  scene: 'applyCustomerCode' | 'forgetPassword' | 'addCustomerCode'
  /** 跳转地址 */
  url?: string
  /** 加载地址 */
  loadAddress?: string
  /** 路由路径 */
  routePath?: string
  [key: string]: any
}

// ==================== getAppUserRelationAuth ====================

/**
 * 获取是否有关联绑定权限 - 返回值
 *
 * H5 使用:
 * - res.bindAuth (boolean) - 是否有绑定权限
 * - res.bindOverLimitFlag (boolean) - 是否达到上限
 */
export interface AppUserRelationAuthResponse {
  /** 是否有绑定权限 */
  bindAuth: boolean
  /** 是否达到绑定上限 */
  bindOverLimitFlag?: boolean
  /** 当前是否有绑定 */
  hasCurBind?: boolean
  /** 是否存在关联绑定记录 */
  existedRelationBind?: boolean
  [key: string]: any
}

// ==================== getBindableCompanyList ====================

/**
 * 获取可绑定的公司列表 - 返回值
 *
 * H5 使用:
 * - res.companyInfoList (CompanyInfo[]) - 公司列表
 * - res.type (number) - 模式类型
 *   - 121: 绑定模式
 *   - 110/111/122: 切换模式
 *   - 120: 更换模式（旧）
 *   - 10: 更换模式
 */
export interface BindableCompanyListResponse {
  /** 公司列表 */
  companyInfoList: CompanyInfo[]
  /** 模式类型 */
  type: number
  [key: string]: any
}

/** 公司信息 */
export interface CompanyInfo {
  /** 客户ID */
  customerId?: string
  /** 客户编码 */
  customerCode: string
  /** 公司名称 */
  customerName: string
  /** 是否当前绑定 ('1'=是, 其他=否) */
  isCurrBond: string
  /** 绑定状态 */
  bindStatus?: number
  /** 是否默认 */
  isDefault?: boolean
  /** 冻结标记 */
  freezeFlag?: number
  [key: string]: any
}

// ==================== userBindCustomerCode ====================

/**
 * 绑定客户编码 - 返回值
 *
 * H5 使用:
 * - res.status (number) - 状态 (1=成功)
 * - res.currentBind (object) - 当前绑定信息
 */
export interface UserBindCustomerCodeResponse {
  errCompanyList: Array<{
    customerId: string
    customerCode: string
    customerShortName: string
    id: string
  }>
  /** 状态码 (1=成功) */
  status: number
  /** 消息 */
  message?: string
  /** 当前绑定信息 */
  currentBind?: CurrentBindInfo
  [key: string]: any
}

/** 当前绑定信息 */
export interface CurrentBindInfo {
  customerId?: string
  customerCode?: string
  customerName?: string
  [key: string]: any
}

// ==================== checkCustomerCode ====================

/**
 * 校验客户编码 - 返回值
 *
 * 成功时无返回或返回空对象
 * 失败时抛出错误，包含:
 * - err.code (number) - 错误码
 *   - 264587: 需要图形验证
 *   - 34000: 手机号拉黑
 *   - 100201: 未登录
 *   - 111227: 冻结解绑
 * - err.msg (string) - 错误消息
 * - err.data.type (number) - 验证类型 (4=图形验证)
 */
export interface CheckCustomerCodeResponse {
  success?: boolean
  [key: string]: any
}

// ==================== getBlackUserContactRole ====================

/**
 * 获取黑名单联系人角色 - 返回值
 *
 * H5 使用: res.role (string) - 角色类型
 * 用于 roleEnum 映射显示角色名称
 */
export interface BlackUserContactRoleResponse {
  /** 角色类型 */
  role: string | number
  /** 角色名称 */
  roleName?: string
  /** 联系电话 */
  contactPhone?: string
  [key: string]: any
}

// ==================== unbindRelationCustomerCode / unBindCustomerCode ====================

/**
 * 解绑操作 - 返回值
 *
 * 成功时无特殊返回
 * 失败时抛出错误
 */
export interface UnbindResponse {
  success?: boolean
  message?: string
  [key: string]: any
}

// ==================== getUserRoleByCustomerCode ====================

/**
 * 获取用户角色 - 返回值（用于解绑判断和权限检测）
 *
 * H5 使用: res.msg (string) - 角色提示消息
 *
 * 扩展字段用于"失去关联权限"场景:
 * - hasAuth (boolean) - 是否有权限
 * - lostAuth (boolean) - 是否失去关联权限
 * - authorizer (number) - 授权角色: 10-主授权人 20-副授权人 30-普通账号
 */
export interface UserRoleResponse {
  /** 角色提示消息 */
  msg?: string
  /** 角色类型 */
  role?: string | number
  /** 是否可以解绑 */
  canUnbind?: boolean
  /** 是否有权限访问该公司（用于切换前检测） */
  hasAuth?: boolean
  /** 是否失去关联权限（无权限时为 true） */
  lostAuth?: boolean
  /**
   * 授权角色类型（H5 原始字段）
   * 10 - 主授权人
   * 20 - 副授权人（解绑时会提示特殊文案）
   * 30 - 普通账号
   */
  authorizer?: number | string
  [key: string]: any
}

// ==================== getOtherBindApplyDetail ====================

/**
 * 获取绑定其他公司申请详情 - 返回值
 *
 * H5 使用: res.applyStatus (string|number) - 申请状态
 */
export interface OtherBindApplyDetailResponse {
  /** 申请状态 */
  applyStatus: string | number
  /** 公司名称 */
  companyName?: string
  /** 申请时间 */
  applyTime?: string
  /** 审核人 */
  reviewerName?: string
  /** 驳回原因 */
  rejectReason?: string
  [key: string]: any
}

// ==================== getCheckInfo / getUserCheck ====================

/**
 * 风控获取检验信息 - 返回值
 *
 * H5 使用: 直接设置为 checkInfo 状态
 */
export interface CheckInfoResponse {
  /** 规则ID */
  ruleId?: string
  /** 策略代码 */
  strategyCode?: string
  /** 是否需要验证 */
  needVerify?: boolean
  /** 验证类型 */
  verifyType?: string
  [key: string]: any
}

/**
 * 用户验证检测 - 返回值
 *
 * H5 使用: res.safeVerifyId (string) - 安全验证ID
 */
export interface UserCheckResponse {
  /** 安全验证ID */
  safeVerifyId: string
  /** 是否通过 */
  pass?: boolean
  /** 风险等级 */
  riskLevel?: number
  [key: string]: any
}

// ==================== getRegisterGuidePage ====================

/**
 * 查询落地页配置页面 - 返回值
 *
 * H5 使用: data (array) - 配置列表数组
 */
export interface RegisterGuidePageResponse extends Array<GuidePageItem> { }

/** 落地页配置项 */
export interface GuidePageItem {
  /** 页面ID */
  id?: string
  /** 页面名称 */
  name?: string
  /** 页面URL */
  url?: string
  /** 图标 */
  icon?: string
  [key: string]: any
}

// ==================== logoutTip ====================

/**
 * 登出提示 - 返回值
 *
 * H5 使用: res.tips (string) - 提示信息
 */
export interface LogoutTipResponse {
  /** 提示信息 */
  tips: string
  /** 是否需要跳转登录 */
  needLogout?: boolean
  [key: string]: any
}

// ==================== getVirtualNum / getMarketVirtualContact ====================

/**
 * 获取市场虚拟号 - 返回值
 *
 * H5 使用: res.needRealName (boolean) - 是否需要实名认证
 */
export interface VirtualNumResponse {
  /** 是否需要实名认证 */
  needRealName: boolean
  /** 虚拟号码 */
  virtualPhone?: string
  /** 企业微信ID */
  wechatWorkId?: string
  [key: string]: any
}

/**
 * 获取商务信息 - 返回值
 *
 * H5 使用: res.marketingPhone (string) - 营销电话
 */
export interface MarketVirtualContactResponse {
  /** 营销电话 */
  marketingPhone: string
  /** 商务姓名 */
  contactName?: string
  /** 企业微信 */
  wechatWorkId?: string
  [key: string]: any
}

// ==================== getUserInfoByPhoneNew ====================

/**
 * 根据手机号查询用户信息 - 返回值
 *
 * H5 使用: 直接存储为 userInfo 对象
 */
export interface UserInfoByPhoneResponse {
  /** 用户手机号 */
  phone?: string
  /** 用户ID */
  userId?: string
  /** 用户名 */
  userName?: string
  /** 昵称 */
  nickName?: string
  /** 头像 */
  avatarUrl?: string
  [key: string]: any
}

// ==================== userBindIsWebHide ====================

/**
 * 忘记密码-是否是外部隐藏用户 - 返回值
 *
 * H5 使用: data.isWebHide (number) - 是否外部隐藏 (1=是)
 */
export interface WebHideResponse {
  /** 是否外部隐藏 (1=是, 0=否) */
  isWebHide: number
  [key: string]: any
}

// ==================== gatApplicationInfoList ====================

/**
 * 区域-菜单-轻应用列表 - 返回值
 *
 * H5 使用: res.vos (array) - 应用信息列表
 */
export interface ApplicationInfoListResponse {
  /** 应用信息列表 */
  vos: ApplicationInfoItem[]
  [key: string]: any
}

/** 应用信息项 */
export interface ApplicationInfoItem {
  /** 区域编码 */
  areaCode: string
  /** 区域名称 */
  areaName?: string
  /** 轻应用列表 */
  lightApplicationInfos?: LightApplicationInfo[]
  [key: string]: any
}

/** 轻应用信息 */
export interface LightApplicationInfo {
  /** 菜单编码 */
  menuCode: string
  /** 菜单名称 */
  menuName?: string
  /** 加载地址 */
  loadAddress?: string
  /** 路由路径 */
  routePath?: string
  [key: string]: any
}

// ==================== getMoreDepartment / changeCurrentDepartment ====================

/**
 * 查询用户所在部门 - 返回值
 *
 * H5 使用: data (array) - 部门列表
 * 每个元素包含 current 字段标识当前部门
 */
export interface DepartmentListResponse extends Array<DepartmentInfo> { }

/** 部门信息 */
export interface DepartmentInfo {
  /** 部门编码 */
  departmentCode: string
  /** 部门名称 */
  departmentName: string
  /** 是否当前部门 */
  current?: boolean | string | number
  /** 部门ID */
  deptId?: string
  [key: string]: any
}

/**
 * 切换当前部门 - 返回值
 *
 * 成功时无特殊返回
 */
export interface ChangeDepartmentResponse {
  success?: boolean
  message?: string
  [key: string]: any
}

// ==================== getFrontRecommendCustomer ====================

/**
 * 获取推荐公司列表 - 返回值
 *
 * H5 使用: data (array) - 推荐公司列表
 */
export interface FrontRecommendCustomerResponse extends Array<RecommendCustomerInfo> { }

/** 推荐公司信息 */
export interface RecommendCustomerInfo {
  /** 客户编码 */
  customerCode: string
  /** 公司简称 */
  customerShortName: string
  /** 公司名称（完整） */
  customerName?: string
  [key: string]: any
}

// ==================== applyBindOtherCustomerCheck ====================

/**
 * 校验是否可申请绑定其他公司 - 返回值
 *
 * H5 使用: data 对象，包含校验结果
 * 失败时抛出错误，code: 264587(需验证)
 */
export interface ApplyBindOtherCheckResponse {
  /** 是否可申请 */
  canApply?: boolean
  /** 错误信息 */
  errorMsg?: string
  [key: string]: any
}

// ==================== bindOtherCustomerList ====================

/**
 * 提交绑定其他公司申请 - 返回值
 *
 * H5 使用: data.status (number) - 申请状态
 */
export interface BindOtherCustomerListResponse {
  status: number
  message: string
  code: number
  data: {
    /** 状态码 (1=成功) */
    status: number
    /** 消息 */
    message?: string
    [key: string]: any
  }
  msg: string
}

// ==================== batchCheckBlackCustomerCode ====================

/**
 * 批量黑名单校验 - 返回值
 *
 * H5 使用: data.errList (array) - 错误列表
 */
export interface BatchCheckBlackResponse {
  errList: never[]
  code: number
  data: {
    /** 错误列表 */
    errList: Array<{
      /** 客户编码 */
      customerCode: string
      /** 错误信息 */
      errorMsg: string
      [key: string]: any
    }>
    [key: string]: any
  }
  msg: string
}

// ==================== queryWechatQRCode ====================

/**
 * 查询企业微信二维码 - 返回值
 *
 * H5 使用: data.wechatQRCodeUrl - 企业微信二维码URL
 */
export interface WechatQRCodeResponse {
  /** 企业微信二维码图片 URL */
  wechatQRCodeUrl?: string
  [key: string]: any
}
