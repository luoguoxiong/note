

export type Indexable<T> = {
  [index: string]: T
}
export interface DirectiveBinding {
  name: string
  value?: any
  arg?: string
  oldArg?: string
  modifiers?: Indexable<boolean>
}
export interface ExposureOption {
  root: any // 默认浏览器视窗
  threshold: number // 元素完全出现在浏览器视窗内才执行callback函数。
}

export interface BaseConfig {
  sdkSrc: string
  appKey: string
  rhost: string
  DEBUG: boolean
  aplusAutotrack: boolean
  rateAhot: string
  heatmap: boolean
  aplusJsbridgeOnly: boolean
}
export interface Ids {
  _user_id: string
  _dev_id: string
  _anony_id: string
}

export interface encryption {
  key: string
  encryptionString: string
}

export interface ReportConfigType {
  baseConfig: BaseConfig
  exposureConfig: Indexable<string>
  commonConfig: Indexable<string>
  globalproperty: Indexable<string>
  userProfile: Indexable<string>
  ids: Indexable<string>
  asyncConfig: any
  vueRouter: any
  encryption: encryption
}
export interface eventType {
  eventCode: string
  eventId?: number
  regionCode?: string
}

export type addShapeType = 'add' | 'replace'

export type ReportTypeEnum = 'CLK' | 'EXP' | 'OTHER'

export enum EventTypeId {
  CLK = 2101,
  EXP = 2201,
  OTHER = 19999,
  PV = 2001,
}

export enum ReportType {
  '点击' = 'CLK',
  '曝光' = 'EXP',
  '自定义' = 'OTHER',
}
export type baseInstanceType = 'baseParams' | 'storeParams'

export interface PerformanceCollectType {
  ignoreSourceTypes?: string[]
  customParams?: Indexable<string | null | number>
}

export interface ReportListType {
  umpUuid: string
  startTime: number
  reportFun: () => void
}

export type UmpOtherReportType = (type: ReportTypeEnum, event: eventType, params?: Indexable<string>) => void
