/** 卡片字段（寄收/运单/功能统一格式） */
export interface CardField {
  /** 字段标识 */
  code: string
  /** 字段名称 */
  name: string
  /** 是否显示 */
  visible: boolean
  /** 是否固定（不可隐藏、不可排序） */
  fixed: boolean
  /** 排序序号 */
  order: number
}

/** 寄收信息字段 */
export type SenderReceiverField = CardField

/** 运单信息字段 */
export type WaybillInfoField = CardField

/** 功能按钮 */
export type FunctionButton = CardField

/** 卡片配置 */
export interface CardConfig {
  /** 寄收信息配置 */
  senderReceiverConfig: {
    fields: SenderReceiverField[]
  }
  /** 运单信息配置 */
  waybillInfoConfig: {
    fields: WaybillInfoField[]
    maxSelect: number
  }
  /** 功能按钮配置 */
  functionConfig: {
    buttons: FunctionButton[]
  }
}
