import { WaybillSpecialEncryptRule } from '@order-public-sub-public/types'

export interface EncryptSettingResponse {
  fields: WaybillSpecialEncryptRule[]
  hasSetStatus: boolean
  tips: string
  orderTips: string
}
