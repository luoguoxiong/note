export interface GlobalState {
  userInfo: UserInfo
  customerInfo: CustomerInfo
  real: RealInfo
}

export interface UserInfo {
  /** 用户id */
  id: string

  /** 用户手机号 */
  phone: string

  /** 加密手机号-埋点 */
  encryptPhone: string | null

  /** 真实姓名 */
  userName: string | null

  /** 昵称 */
  nickname: string | null

  /** 职务 */
  position: string

  /** 是否新注册用户 1:新注册 2:旧注册 */
  newRegisterFlag: number | null

  /** 客户编码 */
  customerCode: string

  /** 头像地址 */
  headUrl: string

  /** 性别 */
  sex: number

  /** 注册日期 */
  registrationDay: number

  /** 注册时间 */
  registrationTime: string

  /** 生日 */
  birthday: string

  /** 是否老客户 */
  oldUser: number
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

export interface CustomerInfo {
  /** 客户编码id */
  customerId: string

  /**
   * 绑码类型 客户类型客户类型(0：个人，1：企业)
   */
  customerType: 0 | 1

  /** 客户编码 */
  customerCode: string

  /** 公司简称 */
  customerShortName: string

  /** 是否存在关联绑定 */
  existedRelationBind: boolean

  /** 是否有绑定权限 */
  bindAuth: boolean

  /** 是否当前绑定 */
  hasCurBind: boolean
}

export interface RealInfo {
  /** 是否需要验证(true要验证,false不需要验证) */
  isValidation: boolean
  /** 有无实名认证 */
  isRealName: boolean
  /** customerType */
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
