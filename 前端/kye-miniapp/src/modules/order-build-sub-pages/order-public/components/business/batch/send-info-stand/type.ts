import { ProductInfo, PayModeType, AddedService, WaybillRemark } from '@order-public-sub-public/types'

export interface copyModuleDataType {
  PayMode: PayModeType
  ProductInfo: ProductInfo
  AddedService: AddedService
  WaybillRemark: WaybillRemark
}
