import { pickupConfig } from '@order-public-sub-public/apis/pickup/type'
import { DispatchInformation } from '@order-public-sub-public/types'
import { IChoosableTimesItem } from '@order-public-sub-public/apis/waybill/types'

export interface NotificationData {
  timeType?: number
  customFlag?: boolean
  startTime?: string
  endTime?: string
}

export interface dispatchFormProps {
  formConfigList: pickupConfig[]
  formData: DispatchInformation
  warehouseType: string
  appointDateNotification?: NotificationData | null
  choosableTimes?: IChoosableTimesItem[]
  exactTimeEarliestStartTime?: string
}
