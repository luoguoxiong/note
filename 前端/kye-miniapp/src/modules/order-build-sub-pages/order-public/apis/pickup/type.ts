import { dispatchFormVal } from '@order-public-sub-public/components/business/dispatch-information/types/types'
import { STATUS, MaterialSource, MaterialTypes } from '@order-public-sub-public/constants'

export interface recommendContactParam {
  deliveryPerson: string
  deliveryAddress: string
  keyword: string
  searchType: number
}
export interface deleteRecommendContactParam {
  idList: string[]
  deleteType: string
}
export interface RecommendType {
  id: string
  contactName: string
  contactMobile: string
  contactPhone: string
  extension: string
  recommendType: number
  strategyId: string
  deleteFlag: number
}
export type recommendContactData = Array<RecommendType>

export interface pickupMaterialConfigParam {
  waybillNumber: string
  receiverAddress: string
  receiverMobile: string
  receiverPhone: string
  receivercompanyName: string
  channel?: string
}
export interface pickupConfig {
  optionName: string
  fieldName: dispatchFormVal
  maxLength: number
  optionTips: string
  optionRemark: string
  disableFlag: string
  textBoxTips?: string
}
export interface formConfigList2 {
  formConfigList: pickupConfig[]
}

export interface pickupMaterialConfigData {
  orderTips: string
  appointConfig: {
    titleName: string
    showFlag: string
    optionConfigList: pickupConfig[]
  }
  materialConfig: {
    titleName: string
    showFlag: string
  }
}
export interface certificateSearchParams {
  phone?: string
  page: number
  pageSize: number
  orderNumber?: string
  qrcodeBizId?: string
  bizId?: string
  bizCode?: string
}
export interface MultiBizCodeAndBizIdParams {
  bizId?: string
  bizCode?: string
}

export interface initConfigParams {
  materialSource?: MaterialSource
  materialTypes?: MaterialTypes[]
  currentBizId: string
}

export interface materialList {
  materialList: { bizId: string }[]
}

export interface getFileByMultiBizCodeAndBizIdParams {
  list: MultiBizCodeAndBizIdParams[]
}
export interface fileType {
  id: string
  originalName?: string
  size?: number | undefined
  contentType?: string
  url?: string | undefined
  creationDate?: string
  updateTime?: string | undefined
  updationDate?: string | undefined
  file?: File
  path?: string
  status?: STATUS
  type?: string
  fileName?: string | undefined
  base64?: string | undefined
  name?: string | undefined
  fileSize?: string | undefined
  request_id?: string | undefined
  angle_reg_type?: string | undefined
}
export interface certificateSearchData {
  page: number
  pageSize: number
  rowTotal: number
  pageTotal: number
  rows: fileType[]
}

export interface pickupOcrParams {
  text: string
}
export interface materialNode {
  type: dispatchFormVal
  name: string
  value: string
}
export type pickupOcrData = materialNode[]

export interface deleteFileParams {
  idList: string[]
}
export interface deleteFileData {
  code: number
}

export interface initConfigResponse {
  bizId: string
  materialInitList: { bizCode: string; materialType: MaterialTypes }[]
}

export interface SetOrderFileTagParams {
  operateSource: string
  waybillNumber: string
  pickupProxyFlag: string
  goodsCargoPhotoFlag: string
}
