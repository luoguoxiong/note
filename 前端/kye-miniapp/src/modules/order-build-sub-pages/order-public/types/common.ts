import { Channel, YesOrNoString } from '@order-public-sub-public/constants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlainObject = Record<string, any>

export interface QueryObject {
  configId?: string // 配置ID
  channel?: Channel // 下单渠道 10.快速寄件，20.扫二维码下单，30.扫项目编码下单，40.扫活动码下单,50再来一单，60.修改运单
  textCode?: string // 文本内容 运单号 项目编码 活动码
  versionId?: string //配置版本
  token?: string //token
  configVersion?: string // 配置版本
  waybillNo?: string //运单号 修改运单时会传
  needShare?: boolean // 通知收件人
  showBarcode?: boolean // 寄件码
  tipText?: string // 静默提示文案
  exhibitionFlag?: YesOrNoString // 展会标识
  orderScene?: number // 场景
  isAppointmentPickup?: boolean // 是否是预约取货
  sourceAction?: string //场景按钮
  sourcePage?: string //场景页面
  waybillSource?: string //运单来源
  departmentQrCodeId?: string //部门二维码ID
  extendInfo?: string //额外的透传参数,
  channelScene?: string //子渠道,
  orderNo?: string
  auditType?: number // 审核类型
  templateId?: string | number | null // 模板ID
}
