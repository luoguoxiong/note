export interface BaseInfo {
  qrCode: string
  canSubmitCustomerResource: boolean
  innerEmployInfo: boolean
  hrUserId?: string
}

export interface BottomBtnProps {
  isSales: boolean
  isEdit: boolean
  qrCode: string
  code: string
  baseInfo: BaseInfo
  isInnerEmployee: boolean
  hasNewVisData: boolean
  innerEmployInfo?: Record<string, any>
}
