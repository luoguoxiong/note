import {
  ModuleType,
  ModuleStyle,
  FieldsConfigType,
  AddressVisibleType,
  GoodsTimeType,
  DefaultGoodsTime,
  ServiceMode,
  ServiceModeIntersectionEmpty,
} from '@order-public-sub-public/constants'
import { GoodsSize, ModuleDimension, PartialModule, PlainObject, localCheckResult } from '.'
import { DefineComponent, CSSProperties, PropType } from 'vue'
import { DefinedComponent } from '@vue/test-utils/dist/types'
import { CommonDynamicItem } from '@order-public-sub-public/apis/types'
import { pickupFormConfig } from '@order-public-sub-public/components/business/pickup-information/types/types'
import { dispatchFormConfig } from '@order-public-sub-public/components/business/dispatch-information/types/types'
import { DisableItem } from '@order-public-sub-public/apis/init/types'

export interface SchemaRoot {
  moduleId: string
  version: string
  name: string
  templateId: string
  templateName: string
  schema: Schema
}

/**
 * @description JSON Schema
 */
export interface Schema {
  layout: SchemaLayout[]
  module: Record<string, Module> | PlainObject
  mobileBatchH5OnePiceJson?: Record<string, Module> | PlainObject
  config: {
    businessCheckConfig?: BusinessCheckConfig
    otherConfig?: OtherConfig
  }
  data: Partial<ModuleDimension>
  configId?: string
  version?: string
}

export interface SchemaLayout {
  type?: ModuleType | string
  visible?: boolean
  v?: boolean
  classname?: string
  wrapClass?: string
  style?: CSSProperties
  children?: SchemaLayout[]
  c?: SchemaLayout[]
  moduleId?: string
  left?: SchemaLayout[]
  right?: SchemaLayout[]
}
/**
 * @description 业务模块ERP配置类型
 */
export type Module = {
  moduleId?: string
  type?: ModuleType | string // 业务组件类型
  visible: boolean
  v?: boolean
  required?: boolean
  disabled?: boolean
  config?: ModuleConfig // 模块配置
  moduleStyle?: ModuleStyle | string
  disabledInfos?: DisableItem[]
}

interface BannerConfigUrls {
  url: string
}

/**
 * @description banner
 */
export interface BannerConfig {
  urls: BannerConfigUrls[]
}

/**
 * @description 寄件/收件信息
 */

export interface AddressConfig {
  moduleStyle: ModuleStyle
  fieldsConfigType: FieldsConfigType
  fieldsConfig?: FieldsConfig[]
  addressVisibleType: AddressVisibleType
  recommendByUserLocation: boolean //客户定位就近推荐
  functionConfig: {
    addressVisible: boolean // 地址簿是否可用
    addressOcrVisible: boolean // 地址簿智能识别
    recentPickupVisible: boolean // 最近收件信息展示
    addressDetailLocation?: boolean // 详细地址定位
    saveAddress: boolean // 保存地址簿
  }
}

export enum PeriodType {
  '时间点' = 20,
  '时间范围' = 10,
}

export interface TimeRange {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  interval?: number // 时间间隔（分钟）
  minuteStep?: number
  timePeriodType?: PeriodType
}

/**
 * @description 货好时间
 */
export interface GoodsTimeConfig {
  alias: string // 外显名称
  packageGoodsTimeType: GoodsTimeType // 货好时间类型  online: 按线上逻辑 | custom: 自定义时间
  timeRangeList: TimeRange[]
  defaultGoodsTime: DefaultGoodsTime // 默认填充货好时间 无需货好:noGoodsTime | 当前时间:currentTime | 1小时后:oneHours
  goodsTimeFlag: boolean // 是否显示现在货好按钮
  goodsTips: string // 静默提示文案
  visible?: boolean
  disabled?: boolean
}

export interface PickupTypeConfig {
  alias?: string // 外显名称
  visible?: boolean
  required?: boolean
  disabled?: boolean
}

/**
 * @description 付款方式
 */
export interface PayModeConfig {
  fieldsConfig: Array<FieldsConfig & { useDefault?: boolean }>
  disabledInfos: DisableItem[]
}

/**
 * @description 货物信息
 */
export interface ProductInfoConfig {
  fieldsConfigType: FieldsConfigType // fields: 分字段维护 | combination: 组合维护
  fieldsConfig: FieldsConfig[]
  tip: string // 提示文案
  disabled?: boolean
}

/**
 * @description 服务方式
 */
export interface ServiceModeConfig {
  serviceTypes: Array<ServiceMode | string> // 服务方式范围
  defaultValue: string // 固定服务方式
  arrivalTimeVisible: boolean // 是否显示预计送达时间
  serviceModeIntersectionEmpty: ServiceModeIntersectionEmpty // 缺失逻辑处理  按八大服务方式: 10 | 按后台: 20 | 按取派线路: 30 | 不可下单: 40
}

/**
 * @description 物品保价
 */
export interface ProtectPriceConfig {
  fieldsConfig: FieldsConfig[]
  disabled?: boolean
}

/**
 * @description 增值服务
 */
export interface AddedServiceConfig {
  fieldsConfig: FieldsConfig[]
  disabledInfos: DisableItem[]
  disabled?: boolean
}

/**
 * @description 网点自提
 */
export interface BranchSelfPickUpConfig {
  fieldsConfig: FieldsConfig[]
}
/**
 * @description 超区派送
 */
export interface OverAreaDeliveryConfig {
  fieldsConfig: FieldsConfig[]
}

/**
 * @description 上传资料
 */
interface pickupFormFieldsConfig extends FieldsConfig {
  name: keyof pickupFormConfig
}
export interface PickupInformationConfig {
  fieldsConfig: pickupFormFieldsConfig[]
}
interface dispatchFormFieldsConfig extends FieldsConfig {
  name: keyof dispatchFormConfig
}
export interface DispatchInformationConfig {
  fieldsConfig: dispatchFormFieldsConfig[]
}
/**
 * @description 标签
 */
export interface Tag {
  label: string
  isDefault: boolean
}

/**
 * @description 运单备注
 */
export interface WaybillRemarkConfig {
  tags: Tag[]
  disabled?: boolean
}

export type MessageToDriverConfig = WaybillRemarkConfig

/**
 * @description 下单成功页配置
 */
export interface OrderSuccessPageConfig {
  needShare: boolean // 通知收件人
  showBarcode: boolean // 寄件码
  tipText: string // 静默提示文案
  phone?: string
}

export interface EstimatedCostConfig {
  noNeedRead?: boolean
  estimateFeeTip?: string
  noEstimateFeeText?: string
  totalAmount?: number
}

/**
 * @description 精准获得指定类型 例如PickModule<BannerConfig>
 */
export type PickModule<T extends ModuleConfig> = Omit<Module, 'config'> & {
  config: T
}

/**
 * @description 业务模块配置类型集合对象
 */
export type ModuleConfig =
  | BannerConfig
  | AddressConfig
  | GoodsTimeConfig
  | PickupTypeConfig
  | PayModeConfig
  | ProductInfoConfig
  | ServiceModeConfig
  | ProductInfoConfig
  | AddedServiceConfig
  | BranchSelfPickUpConfig
  | OverAreaDeliveryConfig
  | PickupInformationConfig
  | DispatchInformationConfig
  | WaybillRemarkConfig
  | MessageToDriverConfig
  | OrderSuccessPageConfig
  | CommonDynamicItem
  | EstimatedCostConfig
  | PlainObject

export interface FieldsConfig {
  label: string //字段名
  name: string //字段key
  required: boolean // 是否必填
  visible: boolean // 是否需要
  editable?: boolean // 是否可编辑
  defaultValue?: string | string[] | GoodsSize // 默认值
  total?: number
  customerCode?: string | number | null
  customerName?: string | null
  useDefault?: boolean
}

export interface BusinessCheckConfig {
  businessConfig?: BusinessConfig[]
  // orderPageConfig?: OrderPageConfig[]
  deliverycompanyNameValue?: string
  activityEntry?: string
  matchingConfigTip?: string
  exitEntry?: string
  paymentAuth?: boolean
}

export interface BusinessConfig {
  label: string
  key: string
  checked: boolean
  required?: boolean
  extendType?: string
  extends?: Extend[]
}

export interface Extend {
  label: string
  key: string
  checked: boolean
}

// export interface OrderPageConfig {
//   // label: string
//   // key: string
//   // checked: boolean
//   // required?: boolean
//   // extendType?: string
//   // extends?: Extend[]
// }

export interface OtherConfig {
  queryExpressConfig: QueryExpressConfig[]
}

export interface QueryExpressConfig {
  label: string
  key: string
  required?: boolean
  checked: boolean
}

/**
 * @description 业务组件map类型
 */
export type ComponentMap = Partial<Record<ModuleType, DefinedComponent>>

/**
 * @description 触发函数数组
 */
export type TriggEventFunc<T = any> = (args?: T) => void

/**
 * @description 组件依赖对象，包括changedKeys和func
 */
export interface RelationType {
  changeKeys: Array<Partial<keyof PartialModule> | 'estimateFeeTaskId'>
  triggerFunction: Array<TriggEventFunc>
}

/**
 * @description 全局配置表
 */
export type GlobalConfigMap = Record<Partial<ModuleType> | string, GlobalConfigs>

export type Validation = () => Promise<localCheckResult[]>

export interface GlobalConfigs {
  relation: RelationType
  validation: Validation
}

/**
 * @description 业务组件依赖关系
 */

export type RelationMap = Record<Partial<ModuleType> | string, RelationType>

export type ValidationMap = Record<Partial<ModuleType> | string, Validation>

export const ItemPropsDefine = {
  layout: {
    type: Array as PropType<SchemaLayout[]>,
    required: true,
  },
} as const

export type CommonFieldType = DefineComponent<typeof ItemPropsDefine>
