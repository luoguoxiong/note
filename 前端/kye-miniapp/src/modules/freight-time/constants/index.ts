// delay-time
export * from './delayTime'

/** 客户绑定状态枚举（对齐 netc-h5-order-old CUSTOMER_STATUS） */
export enum CustomerStatus {
  NO_CODE = 1,   // 未绑定客户编码
  REJECTED = 2,  // 审核拒绝
  PENDING = 3,   // 待开通权限
  APPLYING = 4,  // 申请中
  APPROVED = 5,  // 已开通(待寄件)
  SHIPPED = 6,   // 已开通(已寄件)
}

/** 人员联系类型 */
export enum PersonnelContactType {
  未加载 = '',
  主授权人 = '10',
  管理员 = '20',
  商务 = '30',
}

/** 权限申请状态（对齐 order-public estimated.ts FeeAuthApplyStatus） */
export enum FeeAuthApplyStatus {
  申请查看 = 0,
  申请中 = 1,
  申请失败 = 2,
}

/** 平台渠道映射 */
export const CHANNEL_MAP: Record<string, string> = {
  alipay: 'alipay',
  amap: 'amap',
  ios: 'ios',
  android: 'android',
  fs: 'lark',
  wx: 'wechatApplet',
  Wxwork: 'wechatApplet',
  WxworkPc: 'wechatApplet',
}

/** 新客活动 scene */
export enum NewCustomerScene {
  运费时效 = '10',
}

/** 新客活动 channel */
export enum NewCustomerChannel {
  微信小程序 = 'wechatApplet',
}

/** 留资标识 */
export enum ResourceFlag {
  留资 = 10,
  非留资 = 20,
}

/** 送券类型 */
export enum CouponReceiveSource {
  新客留资送券 = '31',
  新客查询时效送券 = '32',
}

/** 渠道场景 */
export enum ChannelScene {
  运费时效 = 10,
}

/** 运费时效跳转下单页参数 */
export const FREIGHT_TO_ORDER_PARAMS = {
  sourcePage: 'freightTime',
  sourceAction: 'toOrder',
} as const
