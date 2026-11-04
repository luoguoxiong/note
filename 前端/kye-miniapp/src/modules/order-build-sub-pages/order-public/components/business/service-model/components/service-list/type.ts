export interface serviceProps {
  serviceList: Array<service>
  activeServiceCode: string | null
  loading: boolean
}
//服务方式卡片字段
export interface service {
  serviceTypeCode: string
  serviceTypeName: string
  description: string
  noAgingFlag: string
  addDayFlag: string
  collectWorkday: number
  estimateArriveShortTime: string
  estimateArriveTime: string
  overweightFlag: string
  overweightMessage: string
  estimateFeeShowFlag: string
  estimateFee: string
  noEstimateFeeMessage: string
  restrictFlag: string
  restrictMessage: string
  descriptionH5Text: string
  storageFlag: boolean
  prescriptionSource: string
  doubleIntegral: boolean
  canModifyTimeFlag?: boolean
  iconInfo: {
    restrictType: string
    titleName: string
    message: string
  }
}
