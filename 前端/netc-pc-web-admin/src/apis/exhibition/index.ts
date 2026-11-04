import { http } from '@/utils/request/request'

/** 会展运单行（web.v2.waybill.listWaybillByProjectName rows 元素） */
export interface ExhibitionWaybill {
  /** 运单号 */
  waybillNumber: string
  /** 寄件公司 */
  deliveryCustomerName: string
  /** 会展编码 */
  fairCode: string
  /** 寄件地址 */
  deliveryAddress: string
  /** 收件区号 */
  pickupAreaCode: string
  /** 重量 */
  actualWeight: string | number
  /** 寄件时间 */
  pickupTime: string
  /** 运费 */
  waybillAmount: string | number
  /** 寄件区号 */
  sendAreaCode: string
}

/** 会展运单分页查询参数 */
export interface WaybillListByProjectNameParams {
  waybillNumber: string
  /** 会展项目编码（页面固定传 '20' 撤展项目） */
  projectName: string
  beginTime: string
  endTime: string
  page: number
  pageSize: number
}

/** 会展运单分页查询结果 */
export interface WaybillListByProjectNameData {
  rows: ExhibitionWaybill[]
  rowTotal: number
  pageTotal: number
}

/** 会展运单分页查询（来源: netc-pc-web/src/services/api/exhibition.js） */
export const getWaybillListByProjectName = (params: WaybillListByProjectNameParams) => {
  return http<WaybillListByProjectNameData>('web.v2.waybill.listWaybillByProjectName', params)
}
