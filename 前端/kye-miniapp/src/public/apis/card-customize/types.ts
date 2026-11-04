import { WAYBILL_CONFIG_STATUS } from '@public/constants/cardConfig'
import type { CardConfig } from '@/public/components/business/waybill-card/config/types'

/** 版本类型 */
export enum VersionType {
  /** 标准版 */
  STANDARD = 10,
  /** 定制版 */
  CUSTOM = 20,
}

// 从公共组件导出类型
export type {
  SenderReceiverField,
  WaybillInfoField,
  FunctionButton,
  CardConfig,
} from '@/public/components/business/waybill-card/config/types'

/** 单个状态的配置 */
export interface StatusConfig {
  /** 运单状态 */
  waybillStatus: WAYBILL_CONFIG_STATUS
  /** 运单状态名称 */
  waybillStatusName: string
  /** 当前版本 */
  currentVersion: VersionType
  /** 标准版配置 */
  standardConfig: CardConfig
  /** 定制版配置 */
  customConfig: CardConfig | null
}

/** 自定义编码 */
export interface CustomCode {
  /** 编码名称 */
  codeName: string
  /** 字段标识 */
  kyField: string
}

/** 查询接口请求 */
export interface GetCardConfigRequest {
  /** 运单状态（非必传） */
  waybillStatus?: WAYBILL_CONFIG_STATUS
  /** 版本（必传，第一版传 'baseVersion'） */
  version: string
}

/** 查询接口响应 */
export interface CardConfigResponse {
  /** 状态配置列表 */
  configs: StatusConfig[]
  /** 自定义编码列表 */
  customCodes: CustomCode[]
  /** 列表个性设置入口开关 */
  cardConfigSwitch: boolean
}

/** 保存请求 */
export interface SaveCardConfigRequest {
  /** 运单状态 */
  waybillStatus: WAYBILL_CONFIG_STATUS
  /** 寄收信息配置 */
  senderReceiverConfig: Record<string, boolean>
  /** 运单信息配置：code -> { visible, order } */
  waybillInfoConfig: Record<string, { visible: boolean; order: number }>
  /** 功能按钮配置 */
  functionConfig: Record<string, {
    visible: boolean
    order: number
  }>
}

/** 切换版本请求 */
export interface SwitchVersionRequest {
  /** 当前选择版本：10-标准版, 20-定制版 */
  currentVersion: VersionType
  /** 运单状态码：20待揽件、30待签收、40已签收 */
  waybillStatus: WAYBILL_CONFIG_STATUS
}

/** 配置映射（按状态存储） */
export type CardConfigMap = Record<number, {
  currentVersion: VersionType
  config: CardConfig
  standardConfig: CardConfig
  customConfig: CardConfig | null
}>
