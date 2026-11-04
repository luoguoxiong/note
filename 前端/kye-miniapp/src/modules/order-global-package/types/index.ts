import { PackageServiceEnum, OtherPackageServiceEnum } from './added-service'

export interface woodenFrameInfoListType {
  name?: string
  value?: PackageServiceEnum | OtherPackageServiceEnum | string
  desc?: string
  tip?: string
  img?: any
  disabled?: boolean
  disabledTips?: string
  recommendationType?: string
  type?: 'normal' | 'other'
  woodFrameEstimateFee?: {
    value: string
  }
  [key: string]: any
}

export type SourceType = 'order' | 'freightTime'

// 运单类型
// export * from './goods-time'
export * from './estimated-cost'
