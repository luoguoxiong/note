import { DeliveryMode, YesOrNoString } from '@order-public-sub-public/constants'
import { BranchSelfPickUpConfig } from '@order-public-sub-public/types'
import { Ref } from 'vue'

// 是否显示 - dynamicConfig.overAreaDelivery.viewFlag

// 业务数据
export interface OverAreaDeliveryData {
  selfLiftingAddress: string //自提网点地址
  superAreaUnitePrice: number //	超区单价
  superZoneDistance: string //	超区距离（单位：km)	string
  superAreaFee: number // 超区费用
  selfLiftingDepotId: string // 自提网点点部id
  selfLiftingDepot: string // 	自提网点点部
  selfLiftingDepotLatLng: string // 自提网点经纬度
  receiptAddressLatLng: string // 收件地址经纬度
  senderLng: string // 寄件人地址经度
  senderLat: string // 寄件人地址维度
  showFeeFlag: boolean // 是否显示费用
  feeMessage: string // 超区费用提示语
}

// 提交数据
export interface OverAreaDelivery {
  deliveryMode?: DeliveryMode //送货方式，数据字典：tms_pre_waybill_delivery_mode
  superZoneFlag?: YesOrNoString // 是否超区标识，10-是，20-否
  selfPickupMobile?: string //自提手机
  selfPickBranchId?: string //	自提网点id
  selfPickBranchName?: string // 自提网点名称
}

export interface IOption {
  label: string
  desc?: string
  id: DeliveryMode
  checked: Ref<boolean>
}

export interface IProps {
  // visible?: boolean
  config: BranchSelfPickUpConfig[]
}
