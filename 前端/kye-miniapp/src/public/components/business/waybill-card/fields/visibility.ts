import { WaybillInfoCode, CUSTOM_CODE_PREFIX } from '../config/codes'
import { WAYBILL_CONFIG_STATUS } from '@public/constants/cardConfig'

export const isFieldVisible = (code: string, waybillData: any, activeStatusTab): boolean => {
  // 动态表头(customCode)：需 waybillCustomerWaybillList 中存在 customerWaybillType
  // 与 code 后缀(kyField) 匹配的项才显示
  if (code.startsWith(CUSTOM_CODE_PREFIX)) {
    const kyField = code.slice(CUSTOM_CODE_PREFIX.length)
    const list = waybillData?.waybillCustomerWaybillList || []
    return list.some((item: any) => String(item.customerWaybillType) === kyField)
  }

  const baseInfo = waybillData?.waybill?.baseInfo
  const waybillStatus = baseInfo?.waybillStatus
  const newExteriorRouteInfo = waybillData?.newExteriorRouteInfo

  switch (code) {
    case WaybillInfoCode.GOODS_TIME:
      return waybillStatus === 10 || waybillStatus === 20
    case WaybillInfoCode.CREATION_DATE:
      return waybillStatus === 20
    case WaybillInfoCode.DELIVERY_TIME:
      return waybillStatus === 30 || activeStatusTab === WAYBILL_CONFIG_STATUS.SIGNED
    case WaybillInfoCode.RECEIVE_TIME:
      return waybillStatus === 40
    case WaybillInfoCode.NEW_EXTERIOR_ROUTE_INFO:
      return waybillStatus !== 40 && !!newExteriorRouteInfo?.routeStepDesc
    case WaybillInfoCode.FINAL_AGING:
      return waybillStatus === 30
    case WaybillInfoCode.RECEIVER:
      return waybillStatus === 40
    default:
      return true
  }
}
