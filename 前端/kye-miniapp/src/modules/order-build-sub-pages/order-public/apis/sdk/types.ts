import { SdkType as SdkTypeEnum } from '@order-public-sub-public/constants'

export type SdkType = keyof typeof SdkTypeEnum

export interface SdkSign {
  noncestr: string
  timestamp: string
  signature: string
  appid: string
}
