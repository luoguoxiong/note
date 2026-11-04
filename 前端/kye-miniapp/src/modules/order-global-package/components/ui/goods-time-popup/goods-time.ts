export enum UrgentGoods {
  'URGENT' = '10',
}

export interface PickTime {
  text: string
  value: string
  children?: PickTime[]
}

/**
 * @description 货好时间flag
 */
export enum GoodsTimeFlag {
  NOW = 10, // 现在货好
  NONE = '',
  LATER_NOTIFIED = 20, // 稍后通知
}

export interface GoodsTime {
  goodsTime: string // 货好时间
  goodsTimeFlag?: GoodsTimeFlag
  urgentGoods?: UrgentGoods // 急件, 10 急件, 其它非急件
  selfSignFlag?:boolean
}

export enum PeriodType {
  '时间点' = 20,
  '时间范围' = 10,
}

/**
 * @description 类型为“线上”货好时间
 */
export interface TimeRangeOnline {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  minuteStep?: number // 时间间隔（分钟）
  hourStep?: number // 时间间隔（分钟）
  timeBatch?: string[]
  timePeriodType?: PeriodType
}

export interface TimeRange {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  interval?: number // 时间间隔（分钟）
  minuteStep?: number
  timePeriodType?: PeriodType
  intervalMinuteOffset: number // 距离当前多少分钟内忽略,当前时间是8:15,如果当前时间是8:01,这个值是 15，则8:15 会过滤掉
}

/**
 * @description 货好时间默认填充类型  无需货好:noGoodsTime | 当前时间:currentTime | 1小时后:oneHours
 */
export enum DefaultGoodsTime {
  'NO_GOODS_TIME' = 'noGoodsTime',
  'CURRENT_TIME' = 'currentTime',
  'ONE_HOURS' = 'oneHours',
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
  notifyLater?: string
  goodsTimeNotifyLater?:boolean // 是否展示稍后通知按钮
}

/**
 * @description // 货好时间类型  online: 按线上逻辑 | custom: 自定义时间
 */
export enum GoodsTimeType {
  'ONLINE' = 'online',
  'CUSTOM' = 'custom',
}

export interface CrmGoodsTimeConfig {
  goodsTips: string
  goodsTimeFlag?: GoodsTimeFlag | boolean // 是否显示现在货好按钮
  timeRange: TimeRangeOnline
  goodsTimeNotifyLater?:boolean // 是否展示稍后通知按钮
}

/**
 * @description initCheck 线上 && 自定义
 */
export interface GoodsTimeVo {
  alias: string
  inputMode?: GoodsTimeType
  crmGoodsTimeConfig: CrmGoodsTimeConfig
  erpGoodsTimeConfig: GoodsTimeConfig | null
  goodsTimeFlagVisible?: boolean
}