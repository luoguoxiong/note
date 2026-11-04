import { YesOrNoString } from '@order-public-sub-public/constants'
import { WaybillStatus } from '@order-public-sub-public/constants/waybill'

export interface GoodsTimeWaybillItem {
  waybillNumber: string //	运单号	string
  waybillStatus: WaybillStatus //	运单状态10 待通知取货 20 待揽件 30 待签收 40 已签收 50 已取消	number
  waybillStatusDesc: string //	运单状态描述待通知取货 待揽件 待签收 已签收 已取消	string
  serviceMode: string //	服务方式	number
  serviceModeDesc: string //	服务方式描述	string
  deliveryCity: string //	寄件城市	string
  deliveryPerson: string //	寄件人(只有运单要加密)	string
  deliveryCustomerName: string //	寄件公司	string
  pickupCity: string //	收件城市	string
  pickupPerson: string //	收件人	string
  pickupCustomerName: string //	收件公司	string
  goodsTime: string //	货好时间	string
  goodsTimeChangeFlag: YesOrNoString //	已改货好标识 10：是 其他：否	string
}

export interface GoodsTimeWaybillResponse {
  rows: GoodsTimeWaybillItem[]
  rowTotal: number //	总行数	number
  pageTotal: number //	总页数	number
  page: number //	当前页	number
  pageSize: number //
}

export enum UpdateGoodsTimeStatus {
  下单成功 = 10,
  继续轮训 = 20,
  下单失败 = 30,
}

export interface UpdateGoodsTimeResult {
  /** 轮训状态 10-成功（有页面数据返回）；20-继续轮训；30-下单失败 */
  status: UpdateGoodsTimeStatus
  /** 修改后的货好时间 */
  goodsTime: string
  /** 修改失败的运单数量 */
  failuresNumber: number
  /** 修改成功的运单数量 */
  successNumber: number
  /** 修改失败的运单号 */
  failWaybillNumbers: string[]
  /** 修改失败的提示 */
  toastContent: string
}

// 获取货好时间组件场景
export enum BizScene {
  批量修改货好时间 = '10',
}
