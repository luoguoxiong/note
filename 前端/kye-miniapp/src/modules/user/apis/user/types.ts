/**
 * @Desc: types
 * @Author: wu xingtao
 * @Date: 2024/11/13
 */

export interface LoginUserAccountInfo {
  passwordStatus: 0 | 1
}

export interface WebUserHeadUploadImgIn {
  /**
   * base64
   */
  base64: string
  phone: string
}

export interface WebUserHeadUploadImgOut {
  /**
   * 头像图片链接
   */
  headImgUrl?: string
}

export interface WebSsoUserModifyUserInfoIn {
  /**
   * 工作名称
   */
  work?: string
  /**
   * 性别 1-女，2-男
   */
  sex?: number | string
  /**
   * 名称
   */
  name?: string
  /**
   * 生日
   */
  birthday?: string
  /**
   * 是否电子围栏下单，1是，0：否,2未设置  当客户没有绑定客户编码时，是否可以通过电子围栏下单
   */
  isCompanyOrder?: number
}

export type WebSsoUserModifyUserInfoOut = object

export interface WebUamUserCenterUserUpdateClientPositionIn {
  /**
   * 职务
   */
  position: string
  /**
   * 职级编码
   */
  positionLevelCode: string
  /**
   * 职务备注
   */
  positionRemark?: string
  /**
   * 设置来源 20-跨越寄件移动端 30-跨越寄件客户端
   */
  source: string
  /**
   * 职务编码
   */
  positionCode: string
  /**
   * null/10:旧字典 20:新字典
   */
  dictionaryFlag?: number
}

export type WebUamUserCenterUserUpdateClientPositionOut = boolean

export interface WebV2UserRealNameCheckAuthIn {
  /**
   * 当二维码面单绑码则不能用x-phone获取的客户编码
   */
  companyNo?: string
}

export interface WebV2UserRealNameCheckAuthOut {
  /**
   * 是否需要验证(true要验证,false不需要验证)
   */
  isValidation: boolean
  /**
   * 有无实名认证(true已验证,false未验证)
   */
  isRealName: boolean
  /**
   * 客户类型(0：个人，1：企业)
   */
  customerType: number
  /**
   * 机构名称，与工商注册营业执照上的名称一致
   */
  icName: string
  /**
   * 身份证件号码
   */
  idCard: string
  /**
   * 实名，身份证姓名
   */
  realName: string
  /**
   * 认证状态 10-是，20-否 , 30-已认证，但图片不完整
   */
  authFlag: number
  /**
   * 公告内容
   */
  noticeExplain: string
  /**
   * 公告标题
   */
  noticeTitle: string
  /**
   * 头像实名认证标签
   */
  headImgRealNameTagVO: {
    /**
     * 10-未认证 20-未个人实名 30-已个人实名 40-已企业实名 50-已实名
     */
    authFlag: number
    /**
     * 认证标识名称
     */
    authFlagName: string
  }
  /**
   * 个人中心页认证标签
   */
  personalPageRealNameTagVO: {
    /**
     * 认证状态名称
     */
    authFlagName: string
    /**
     * 认证按钮名称
     */
    authButtonName: string
    /**
     * 认证描述
     */
    authDesc: string
  }
}
