import type {
  PaymentApproval,
  PermissionApproval,
  WaybillApproval,
  AdjustPriceApproval,
  Waybill,
  Payment,
  AdjustPriceNew,
} from '../components/todo-list/types'

export type ThirdOrderState = {
  /**
   * 获取唯品JIT消息数(待确认数)
   */
  count: number
  show: boolean
  /**
   * 最新待确认批次信息
   */
  itemDetail: null | {
    /**
     * 跨越批次号（生成二维码时使用该批次号）
     */
    batchNo?: string
    /**
     * 唯品批次号
     */
    vipBatchNo?: string
    /**
     * 二维码状态（0：初始（表示待确认的数据）  1：成功 2：失败）
     */
    qrCodeState?: number
    /**
     * 收件仓库（收件地）
     */
    vipWarehouse?: string
    /**
     * 始发城市
     */
    startCity?: string
    /**
     * 运单票数
     */
    waybillCount?: number
  }
}

export type TodoListState = {
  total: number

  waybillApproval: null | { count: number; itemDetail?: WaybillApproval | null }
  permissionApproval: null | { count: number; itemDetail?: PermissionApproval | null }
  adjustPriceApproval: null | { count: number; itemDetail?: AdjustPriceNew | null }
  paymentApproval: null | { count: number; itemDetail?: PaymentApproval | null }
}

export type WaybillState = { count: number; itemDetail: null | Waybill }

export type PaymentState = { count: number; itemDetail: null | Payment }

export type TodoSubTab = {
  label: string
  value: string
  count: number
  show: boolean
}
