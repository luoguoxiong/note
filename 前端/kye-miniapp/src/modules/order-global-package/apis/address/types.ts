/**
 * DetailAddress 详细地址弹窗专用类型
 * 来源: @order-public/apis/address/types.ts (部分提取)
 */

export interface FindSuggestParams {
  keyword?: string
  city?: string
  region?: number
  region_fix?: number
  page_index?: number
  page_size?: number
  policy?: number
  only_mainland?: number
  source?: string
}

export interface FindSuggestItem {
  address: string
  province: string
  city: string
  id: string
  companyName: string
  county: string
  title: string
  district?: string
}

export interface FindSuggestResponse {
  data: FindSuggestItem[]
  count: number
}

/** resultFlag 类型 */
type resultFlagtype = 10 | 20

export interface AiAddrAnalysis {
  name?: string
  mobilePhone?: string
  telPhone?: string
  province?: string
  city?: string
  district?: string
  address?: string
  county?: string
  detailAddress?: string
  title?: string
  company?: string
}

export interface AiAddrAnalysisRes {
  resultFlag: resultFlagtype
  addressInfos: AiAddrAnalysis[]
  checkResult?: {
    content?: string
  }
  originalAddress?: string
}

export type EAM_ORDER_ADDRESS_SCENE_TYPE = 'sender' | 'receive'

export interface OcrParams {
  text: string
  addressType?: number
  fillTownToDetails?: number
  businessId?: string
  sceneType?: EAM_ORDER_ADDRESS_SCENE_TYPE | ''
}

// === 最近寄件地址组件专用类型 ===

export interface HistoryAddress {
  addressType: string | number
}

export interface DeleteHistoryAddress {
  id?: string // 运费时效删除接口使用
  removeId?: string // 普通下单删除接口使用
  addressType?: string
  clean?: boolean // 是否清空addressType指定的所有地址
  delFrom?: string // 调用来源标识
}

export interface HistoryAddressResponse {
  id: string
  city: string
  companyName: string
  detailAddress: string
  district: string
  districtId?: string
  phone: string
  province: string
  provinceId?: string
  telPhone: string
  userName: string
  extensionNumber: string
  lastUsed: string
  person: string
  county: string
  telephone: string
  company: string
  mobile: string
  extension: string
  tag: boolean
  cityId?: string
  count?: string | null
  createdBy?: string
  creationDate?: string | null
  enabledFlag?: number
  traceId?: string
  type?: string | null
  updatedBy?: string
  updationDate?: string | null
}
