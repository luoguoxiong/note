import type {
  SenderReceiverField,
  WaybillInfoField,
  FunctionButton,
  CardConfig,
  CardField,
} from './types'
import { SenderReceiverCode, WaybillInfoCode, FunctionCode } from './codes'

/** 按数组位置自动生成 order（1-based），新增/插入项无需手动改后续 order */
const withOrder = <T extends Omit<CardField, 'order'>>(list: T[]): (T & { order: number })[] =>
  list.map((item, index) => ({ ...item, order: index + 1 }))

/** 寄收信息字段定义（基于现有 waybill-card 组件实际显示的字段，按 UI 顺序排列） */
export const DEFAULT_SENDER_RECEIVER_FIELDS: SenderReceiverField[] = withOrder([
  // 左列：寄件信息
  { code: SenderReceiverCode.DELIVERY_CITY, name: '寄件城市', visible: true, fixed: true },
  { code: SenderReceiverCode.DELIVERY_PERSON, name: '寄件人姓名', visible: true, fixed: false },
  { code: SenderReceiverCode.DELIVERY_CUSTOMER_NAME, name: '寄件公司', visible: true, fixed: false },
  // 中间：物流信息
  { code: SenderReceiverCode.WAYBILL_STATUS_DESC, name: '运单状态', visible: true, fixed: true },
  { code: SenderReceiverCode.SERVICE_MODE_DESC, name: '服务方式', visible: true, fixed: true },
  // 右列：收件信息
  { code: SenderReceiverCode.PICKUP_CITY, name: '收件城市', visible: true, fixed: true },
  { code: SenderReceiverCode.PICKUP_PERSON, name: '收件人姓名', visible: true, fixed: false },
  { code: SenderReceiverCode.PICKUP_CUSTOMER_NAME, name: '收件公司', visible: true, fixed: false },
])

/** 运单信息字段定义（基于现有 waybill-card 组件实际显示的字段，按 UI 顺序排列） */
export const DEFAULT_WAYBILL_INFO_FIELDS: WaybillInfoField[] = withOrder([
  // 第一行：签收人（已签收）或路由信息（其他状态）
  { code: WaybillInfoCode.RECEIVER, name: '签收人', visible: true, fixed: false },
  { code: WaybillInfoCode.NEW_EXTERIOR_ROUTE_INFO, name: '路由信息', visible: true, fixed: false },
  // 第二行：时间字段（根据状态显示不同时间）
  { code: WaybillInfoCode.GOODS_TIME, name: '货好时间', visible: true, fixed: false },
  { code: WaybillInfoCode.DELIVERY_TIME, name: '寄件时间', visible: true, fixed: false },
  { code: WaybillInfoCode.RECEIVE_TIME, name: '签收时间', visible: true, fixed: false },
  { code: WaybillInfoCode.FINAL_AGING, name: '预计派送时间', visible: true, fixed: false },
])

/** 运单信息最大可选数量 */
export const WAYBILL_INFO_MAX_SELECT = 4

/** 功能按钮定义（基于 MENU_LIST 实际定义，code 与 type 保持一致，数组顺序即 order） */
export const DEFAULT_FUNCTION_BUTTONS: FunctionButton[] = withOrder([
  // order 最小的3个显示在底部右侧（最小的在最右边）
  { code: FunctionCode.CAN_REAL_AUTH, name: '实名认证', visible: true, fixed: true },
  { code: FunctionCode.CAN_NEED_PAY, name: '去支付', visible: true, fixed: true },
  { code: FunctionCode.CAN_TAKE, name: '催取', visible: true, fixed: false },
  { code: FunctionCode.CAN_DELIVERY, name: '催派', visible: true, fixed: false },
  { code: FunctionCode.CAN_MODIFY, name: '修改运单', visible: true, fixed: false },
  { code: FunctionCode.CAN_APPEND_CHILDREN, name: '追加子件', visible: true, fixed: false },
  { code: FunctionCode.CAN_EXHIBITION, name: '添加/查看展会', visible: true, fixed: false },
  { code: FunctionCode.CAN_EVALUATE_PICKUP, name: '取货评价', visible: true, fixed: false },
  { code: FunctionCode.CAN_EVALUATE_DELIVERY, name: '派货评价', visible: true, fixed: false },
  { code: FunctionCode.CAN_SIGN_CONFIRM, name: '签收确认', visible: true, fixed: false },
  { code: FunctionCode.SHARE_FLAG, name: '通知收件人', visible: true, fixed: false },
  { code: FunctionCode.CAN_CANCEL, name: '取消运单', visible: true, fixed: false },
  { code: FunctionCode.SHOW_LABEL_FLAG, name: '运单标签', visible: true, fixed: false },
  { code: FunctionCode.CAN_ANOTHER_ORDER, name: '再来一单', visible: true, fixed: false },
  { code: FunctionCode.CAN_PRINT, name: '打印面单', visible: true, fixed: false },
  { code: FunctionCode.CAN_DELIVERY_PHOTO, name: '派货照片', visible: true, fixed: false },
])

/** 默认配置用于兜底（所有状态通用，所有字段 visible=true） */
export const DEFAULT_CARD_CONFIG: CardConfig = {
  senderReceiverConfig: {
    fields: DEFAULT_SENDER_RECEIVER_FIELDS,
  },
  waybillInfoConfig: {
    fields: DEFAULT_WAYBILL_INFO_FIELDS,
    maxSelect: WAYBILL_INFO_MAX_SELECT,
  },
  functionConfig: {
    buttons: DEFAULT_FUNCTION_BUTTONS,
  },
}
