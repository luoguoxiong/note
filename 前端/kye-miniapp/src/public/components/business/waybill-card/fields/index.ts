import type { Component } from 'vue'
import { WaybillInfoCode, CUSTOM_CODE_PREFIX } from '../config/codes'
import TimeField from './TimeField.vue'
import PreArriveTime from './PreArriveTime.vue'
import Receiver from './Receiver.vue'
import RouteInfo from './RouteInfo.vue'
import CountField from './CountField.vue'
import ActualWeightField from './ActualWeightField.vue'
import FreightWeightField from './FreightWeightField.vue'
import SizeField from './SizeField.vue'
import GoodsTypeField from './GoodsTypeField.vue'
import ReceiptFlagField from './ReceiptFlagField.vue'
import TotalAmountField from './TotalAmountField.vue'
import PayModeField from './PayModeField.vue'
import CustomCodeField from './CustomCodeField.vue'
import DefaultField from './DefaultField.vue'

export { isFieldVisible } from './visibility'
export type { FieldProps } from './types'

/** 字段组件映射 */
export const fieldComponentMap: Record<string, Component> = {
  [WaybillInfoCode.GOODS_TIME]: TimeField,
  [WaybillInfoCode.DELIVERY_TIME]: TimeField,
  [WaybillInfoCode.RECEIVE_TIME]: TimeField,
  [WaybillInfoCode.FINAL_AGING]: PreArriveTime,
  [WaybillInfoCode.RECEIVER]: Receiver,
  [WaybillInfoCode.NEW_EXTERIOR_ROUTE_INFO]: RouteInfo,
  [WaybillInfoCode.CREATION_DATE]: TimeField,
  [WaybillInfoCode.COUNT]: CountField,
  [WaybillInfoCode.ACTUAL_WEIGHT]: ActualWeightField,
  [WaybillInfoCode.FREIGHT_WEIGHT]: FreightWeightField,
  [WaybillInfoCode.SIZE]: SizeField,
  [WaybillInfoCode.GOODS_TYPE]: GoodsTypeField,
  [WaybillInfoCode.RECEIPT_FLAG_DESC]: ReceiptFlagField,
  [WaybillInfoCode.TOTAL_AMOUNT]: TotalAmountField,
  [WaybillInfoCode.PAY_MODE]: PayModeField,
}

/** 获取字段组件 */
export const getFieldComponent = (code: string): Component => {
  // 动态表头(customCode)：KYFIELD-xxx 前缀统一用 CustomCodeField 渲染
  if (code.startsWith(CUSTOM_CODE_PREFIX)) return CustomCodeField
  return fieldComponentMap[code] || DefaultField
}
