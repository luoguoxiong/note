/**
 * 初始化相关类型
 */

import { AuthFlag, CurrentUserRole, AuthCustomerType, Channel, ErrorCode } from '@order-public-sub-public/constants'
import { OrderInfo, ModuleDimension, CheckResponse } from '.'

/**
 * @description 下单权限
 */
export interface Auth {
  haveApply: boolean //是否已申请
  havePermission: boolean // 是否有权限
  placeOrdercompanyName: string //公司名称
  authPersonName: string //主授权人名
  authPersonPhone: string // 主授权人电话
  currentUserRole: CurrentUserRole // 登录人角色	10 主授权 20 管理员 30普通用户
  haveAddressRestrict: boolean // 是否开启地址限制
  addressTips: string //命中地址限制弹窗提示语 没有公司寄件地址提示语	暂无地址可选，请联系主授权人分配地址信息
  needPersonAddress: boolean // 是否使用个人地址簿
}

/**
 * @description 未支付
 */
export interface NoPay {
  tips: string //弹窗提示
}

/**
 * @description 实名认证信息
 */
export interface CheckAuth {
  isValidation: boolean //是否需要验证(true要验证,false不需要验证)
  isRealName: boolean //有无实名认证(true已验证,false未验证)
  customerType: AuthCustomerType // 个人0 企业1
  icName: string //机构名称
  idCard: string //	身份证件号码
  realName: string //	身份证姓名
  authFlag: AuthFlag //认证状态 10-是，20-否 , 30-已认证，但图片不完整
  noticeExplain: string //公告内容
  noticeTitle: string //公告标题
  dateTime: number //存redis的时间
}

/**
 * @description 初始化入参 终端和下单来源暂不需要，默认移动端单票
 */
export interface ConfigParams {
  configId?: string // 配置ID
  channel?: Channel // 下单渠道 10.快速寄件，20.扫二维码下单，30.扫项目编码下单，40.扫活动码下单,50再来一单，60.修改运单
  textCode?: string // 文本内容 运单号 项目编码 活动码
  configVersion?: string //配置版本
  orderScene?: number // 下单场景 详情见ORDER_SCENE
}
/**
 * @description 获取缓存接口
 */
export interface cacheConfigParams extends ConfigParams {
  cacheVersion?: string //缓存的配置版本号
  batchId?: string
}

/**
 * @description 业务数据
 */
export interface BusinessData {
  moduleDimension: ModuleDimension
}

/**
 * @description 初始化数据
 */
export interface InitDataResponse extends CheckResponse {
  waybillInfo: OrderInfo
  batchId: string // 批次号
  waybillId?: string // 批量寄使用
  waybillNumber?: string //批量寄使用
}

/**
 * @description 用户信息
 */
export interface UserInfo {
  phone: string //下单手机(登录手机号)
  nickName: string //昵称
  name: string //姓名
}

/**
 * @description 用户埋点信息
 */
export interface userProfileInfo {
  customerCode: string
  encryptPhone: string
  userId: string
  xcxOpenId: string
}

export interface ErrorCodeType {
  code: ErrorCode
  msg: string
}

export enum SuccessPageTipType {
  '实名认证' = '10',
}
/**
 * @description 下单成功页的顶部提示
 */
export interface SuccessPageTip {
  type: SuccessPageTipType
  context: string
  hasButton: boolean
}
