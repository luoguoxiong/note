import { PickupInformationConfig, popoverConfigType } from '@order-public-sub-public/types'

export type PickupProps = {
  visible: boolean
  placeholder?: string
  disabled?: boolean
  required: boolean
  config: PickupInformationConfig
}

export type FieldKey = 'mobile' | 'telephone' | 'person' | 'pickup' | 'cargoImg'

export interface pickupFormConfig {
  picker: boolean
  pickerMobile: boolean
  pickerPhone: boolean
  pickeData: boolean
  cargoImg: boolean
}

export interface formDataType {
  person?: string
  mobile?: string
  telephone?: string
  pickup?: number
}
export interface ValidationMap {
  [key: string]: {
    value: string
    rules: {
      normal: { rule: RegExp; errorMessage: string }[]
      required: { rule: RegExp; errorMessage: string }[]
    }
    bubbleConfig?: popoverConfigType
  }
}

export enum pickUpUploadType {
  委托书 = 'pickup',
  货物照片 = 'cargoImg',
}
