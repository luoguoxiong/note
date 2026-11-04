import { ModuleType } from '@order-public-sub-public/constants'

/**
 * @description 排除需要处理visible的模块，不走下单配置的需要在此配置
 */
export const EXCLUDE_MODULES = [
  'EstimatedCost',
  'OverAreaDelivery',
  'BranchSelfPickup',
  'BranchSelfPickUp',
  'ArrivalTime',
  'GoodsTime',
  'Coupon',
  'KaCustomerMap',
  ModuleType.需返程,
]

/**
 * @description schema module 转换规则
 */
export const MODULE_CONFIG_TRANSFORM_RULES = {
  'GoodsTime.config': 'alias|packageGoodsTimeType|defaultGoodsTime|goodsTimeFlag|goodsTips',
  'PickupMode.config': 'alias',
  'Sender.config.fieldsConfig': 'name|v|required|editable|total',
  'Sender.config.functionConfig':
    'addressVisible|addressOcrVisible|saveAddress|addressDetailLocation|recentPickupVisible',
  'Receive.config.fieldsConfig': 'name|v|required|editable|total',
  'Receive.config.functionConfig':
    'addressVisible|addressOcrVisible|saveAddress|recentPickupVisible|addressDetailLocation',
  'BranchSelfPickUp.config.fieldsConfig': 'name|v|required',
  'AddedService.config.fieldsConfig': 'name|v|label',
  'ProductInfo.config.fieldsConfig': 'name|v|label|editable|required',
  'OverAreaDelivery.config.fieldsConfig': 'name|v|required',
  'DispatchInformation.config.fieldsConfig': 'name|v|required',
  'PickupInformation.config.fieldsConfig': 'name|v|required|editable',
  'ProtectPrice.config.fieldsConfig': 'v|required',
  'PayMode.config.fieldsConfig': 'name|v|label|defaultValue|editable',
}
