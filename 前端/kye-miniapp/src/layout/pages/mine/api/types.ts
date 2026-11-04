export type CustomerInfoResponseData = Partial<{
  contactPhone: string
  contacterName: string
  customerCode: string
  customerShortName: string
  customerType: string
  defaultInsurancePrice: string
  marketer: string
  marketingTelphone: string
  modifyShipperFlag: string
  otherWarehouseType: string
  payCustomerCode: null
  prestoreFlag: string
  recoveryReceiptFlag: string
  userName: string
  verificCodeFlag: string
  vipshopFlag: string
}>

export interface MergeUserInfoParams {
  channel: string
  realNameParam?: RealNameParam
  withdrawParam?: WithdrawParam
}

export interface RealNameParam {
  companyNo: string
  phone: string
  source: string
}

export interface WithdrawParam {
  page: number
  pageSize: number
}

export interface MergeUserInfoRes {
  userLabel: UserLabel
  realNameResp: RealNameResp
  withdrawResp: WithdrawResp
}

export interface UserLabel {
  newCustomerFlag: string
  bindSalesFlag: string
}

export interface RealNameResp {
  isValidation: boolean
  isRealName: boolean
  customerType: number
  icName: string
  idCard: string
  realName: string
  authFlag: number
  noticeExplain: string
  noticeTitle: string
  headImgRealNameTagVO: HeadImgRealNameTagVO
  personalPageRealNameTagVO: PersonalPageRealNameTagVO
}

export interface WithdrawResp {
  bankWithdrawAmount: number
  bankWithdrawCount: number
  redEnvelopesWithdrawAmount: number
  redEnvelopesWithdrawCount: number
  totalAmount: number
  pagination: Pagination
  withdrawableAmount: number
  withdrewAmount: number
  freezeAmount: number
  totalWithdrewAmount: number
}

export interface HeadImgRealNameTagVO {
  authFlag: number
  authFlagName: string
}

export interface PersonalPageRealNameTagVO {
  authFlagName: string
  authButtonName: string
  authDesc: string
}

export interface Pagination {
  rows: PaginationObj[]
  rowTotal: number
  pageTotal: number
  startRow: number
  searchModeEnum: number
  aggregations: Aggregations[]
  page: number
  pageSize: number
}

export interface PaginationObj {
  withdrawType: string
  dataType: string
  applyAmount: number
  businessType: string
  creationDate: string
  withdrawStatus: string
  withdrawStartTime: string
  withdrawFinishedTime: string
}

export interface Aggregations {
  operation: string
  field: string
  resultKey: string
  resultVal: any
}
