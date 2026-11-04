import { DispatchInformation } from '@order-public-sub-public/types'
import { CustomerFile } from '../../added-service/types'

export interface dispatchProps {
  isLink?: boolean
  placeholder?: string
  required: boolean
  title: string
  value: string
  visible?: boolean
  disabled?: boolean
}
export interface formDataType {
  deliveryData: number
}
export interface dispatchFormConfig {
  deliveryData: boolean
}
export interface dispatchForm {
  appointNumber: string
  purchaseNumber: string
  appointWareHouse: string
  appointmentNo: string
  warehouseName: string
  appointDate?: string
}
export type dispatchFormVal = keyof DispatchInformation

export interface FileError {
  file: CustomerFile & { type?: string }
  request_result: string
}
