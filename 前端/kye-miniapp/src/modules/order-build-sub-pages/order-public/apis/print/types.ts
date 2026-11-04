

export interface getSimpleWaybillInfoResultResponse {
  waybillNumber: string
  parentWaybillNumber: string
  parentChildrenPermission: string
  labelPermission: string
  changeCountPermission: string
  waybillParentInden: string
  totalCount: number
  waybillStatus: string
}
interface PrintSetting {
  childrenFlag: string
  labelType: string
  remarkFontSize: string
  templateSizeType: string[]
}
export interface getPrintSettingResultResponse {
  printSetting: PrintSetting
}
export interface printBatchesType {
  batchNo: string
  batchCount: number
}
export interface createPrintTaskResultResponse {
  printBatches: printBatchesType[]
  taskId: string
}
export interface printInfoResponsesType {
  documents: any
  taskId: string
  clientId: string
}
export interface getAsyncPrintDataResultResponse {
  errorMsg: string
  batchCount: number
  finishCount: number
  finishState: boolean
  printInfoResponses: printInfoResponsesType
}

export interface getAsyncPrintTaskFinishResponse {
  taskId: string
  waybillTotal: number
  finishedWaybillCount: number
  unfinishedWaybillCount: number
  errorWaybillCount: number
}
export interface getAsyncPrintTaskFinishParams {
  taskId: string
  clientType: string
  platformType?: string
}
export interface getWaybillLinkParams {
  keyword: string
  pageSize: number
  clientSearchType: string
  clientType: string
}
export interface getWaybillLinkResponse {
  keyword: string
  createDate: number
  keywordType: string
}
export interface getPrintRecordsParams {
  waybillNumbers: string[]
  page: number
  pageSize: number
  clientSearchType: string
  clientType: string
}
export interface printRecordsData {
  waybillNumber: string
  operationCount: number
  count: number
  createTime: number
  updateTime: number
}
export interface getPrintRecordsResponse {
  rows: printRecordsData[]
  rowTotal: number // 总记录数
  pageTotal: number // 总页数
  page: number // 页码
  pageSize: number // 每页记录数
}

export interface getAsyncRetryPrintTaskParams {
  taskId: string
  clientType: string
  printer: {
    uuid?: string
    name?: string
  }
  platformType?: string
  printChannelSource?: string
}

export interface PrintPreviewImageList {
  imgUrl: string
  [key: string]: any
}

export interface getPrintPreviewResponse {
  printTraceId: string
  previewImageList: PrintPreviewImageList[]
}

export interface waybillSearchWebParams {
  rows: any
  rowTotal: number
  pageTotal: number
  page: number
  pageSize: number
}

export interface searchStatisticsParams {
  allCount: number
  signCount: number
  stayInformedCount: number
  staySignCount: number
  stayTookCount: number
  cancelCount: number
  stayInformedLimitCount: number
  cancelLimitCount: number
}
