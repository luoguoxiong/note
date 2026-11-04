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
  /** 下单拦截文案（客户报废/拉黑，后端直出，非空即第一层拦截） */
  allowToOrderTip?: string
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
  /** 用户名 */
  userName: string
  /** 手机号码 */
  phone: string
  /** 客户编码 */
  customCode: string
  /** 客户编码 */
  customerType: string
  /** 客户类型 */
  currentMoney: string
  /** 是否月结客户 */
  isCustomerIsMonthly: boolean
  /** openid */
  openid: string | null
  /** 生日 */
  birthday: string | null
  /** 性别 */
  sex: number
  /** hasPwdFlag */
  hasPwdFlag: boolean
  customerInfo: CustomerInfo
  /** 头像 */
  headUrl: string
  // payCustomerCode: string
  xcxOpenId: string | null
  /** 小程序openid */
  isEmployee: boolean
  // marketingTelphone: string
  canSendAccFlag: boolean
  id: number
  // enableUpdateBirthday: boolean
  // registrationTime: string
  // registrationDay: number
  // position: string | null
  /** 允许下单标识：'10' 允许；其他值结合 allowToOrderTip 拦截（手机报废等） */
  allowToOrderFlag?: string
  /** 下单拦截文案（手机报废等，后端直出） */
  allowToOrderTip?: string
}

export interface HeadImgRealNameTagVO {
  /** 认证标识 */
  authFlag: number
  /** 认证标识名称 */
  authFlagName: string
}

export interface PersonalPageRealNameTagVO {
  /** 认证状态名称 */
  authFlagName: string
  /** 认证按钮名称 */
  authButtonName: string
  /** 认证描述 */
  authDesc: string
}

export interface RealNameAuthInfo {
  /** 是否需要验证(true要验证,false不需要验证) */
  isValidation: boolean
  /** 有无实名认证 */
  isRealName: boolean
  /** 客户类型(0：个人，1：企业) */
  customerType: number
  /** 机构名称 */
  icName: string
  /** 身份证件号码 */
  idCard: string
  /** 身份证姓名 */
  realName: string
  /** 认证状态 10-是，20-否 , 30-已认证，但图片不完整 */
  authFlag: number
  /** 公告内容 */
  noticeExplain: string | null
  /** 公告标题 */
  noticeTitle: string | null
  /** 头像实名认证标签 */
  headImgRealNameTagVO: HeadImgRealNameTagVO
  /** 个人中心页认证标签 */
  personalPageRealNameTagVO: PersonalPageRealNameTagVO
}

export interface ApiResponse<T = any> {
  success: boolean
  code: number
  msg: string
  data: T
  traceId: string
}

export interface CustomerBindInfo {
  customers: CustomerInfo[]
}

/** 绑码状态（对齐老项目 BindClientType，netc-pc-web consts/global.js） */
export enum BindClientType {
  /** 已绑码 */
  HAS_BIND_CODE = 0,
  /** 新客已合作 */
  NEW_GUEST_COOPERATE = 1,
  /** 新客未合作 */
  NEW_GUEST_NO_COOPERATE = 2,
  /** 老客未绑码 */
  NOT_BIND_CODE = 3,
  /** 老客需要切换客户编码 */
  CHANGE_CUSTOMER_CODE = 4,
}

/** 绑码关系信息（web.uam.uamAppUserRelation.getBindInfo，未绑码弹窗 4 场景数据源） */
export interface AppUserRelationAuth {
  /** 绑码状态，见 BindClientType */
  clientType: number
  /** 弹窗文案（后端直出） */
  tips: string
  /** 是否已匹配商务 */
  hasBusiness: boolean
  /** 是否老客 */
  oldCustomer: boolean
  /** 以下字段接口返回但弹窗未消费 */
  bindAuth?: number
  existedRelationBind?: boolean
  relationBindCount?: number
  remarks?: string
}

export interface userProfileInfo {
  customerCode: string
  encryptPhone: string
  userId: string
  xcxOpenId: string
}

/** 退登原因检查（web.login.logoutTip） */
export interface PsdChangedInfo {
  /** 1：因修改密码退登，弹后端 tips；其他：普通登录失效 */
  status: number
  /** 修改密码场景的退登提示文案（后端直出） */
  tips: string
}

export interface UserInfoByPhone {
  subscribe: number
  loginStatus: number
  subscribeTime: number
  phone: string
  jgId: string
  deviceCode: string
}
