import {
  CheckDetail,
  CheckResponse,
  EstimatedCostDimension,
  OrderInfo,
  ReceiveAiInfo,
  RestrictData,
  Schema,
  UserInfo,
  woodenFrameInfoListType,
} from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
interface branchSelfType {
  disabled?: boolean
  disabledTips?: string
  disabledToastTips?: string
  required?: boolean
  visible?: boolean
}

export interface AreaListItem {
  value: string
  text: string
  children: { value: string }[]
}

export interface LocationInfo {
  visible: boolean // 显示标识
  required: boolean // 是否必填
  areaLabel: string
  locationLabel: string
  areaList: AreaListItem[]
}

export interface ShopInfo {
  visible: boolean // 显示标识
  required: boolean // 是否必填
  shopNumberLabel: string
}

export interface CommonDynamicItem {
  visible: boolean // 显示标识
  required: boolean // 是否必填
  disabledInfos?: DisableItem[] // 修改运单时，是否禁止修改
  disabled?: boolean // 修改运单时，是否禁止修改
  modifyShipperFlag?: boolean
  branchSelfVo?: branchSelfType
  disabledToastTips?: string
  disabledTips?: string

  locationInfo?: LocationInfo
  shopInfo?: ShopInfo
  syncReceive?: CommonDynamicItem
}

export interface estimatedCostItem extends CommonDynamicItem {
  estimateFeeTip?: string
  noEstimateFeeText?: string
  estimatedCostResponse?: EstimatedCostDimension // 批量寄后端返回的申请权限信息
  addedValueTips?: string
}

export interface DisableItem {
  key: string
  tips: string
}

export interface OtherWoodFrameShowVo extends CommonDynamicItem {
  otherWoodFrameList: woodenFrameInfoListType[]
}

export interface DynamicConfig {
  sender: CommonDynamicItem // 寄方
  receive: CommonDynamicItem // 收方
  payMode: CommonDynamicItem // 付款方式
  serviceMode: CommonDynamicItem // 付款方式
  addedService: CommonDynamicItem // 增值服务
  kaCustomerMap: CommonDynamicItem //自定义编码
  overAreaDelivery: CommonDynamicItem // 超区派送
  branchSelfPickUp: CommonDynamicItem //网点自提
  selfSign: CommonDynamicItem // 	本人签收
  extractShow: CommonDynamicItem // 展会
  senderProjectLocation: CommonDynamicItem // 项目位置
  receiveExtractShow: CommonDynamicItem // 展会
  vipData: CommonDynamicItem // 唯品会入库号
  sendInfoVo: CommonDynamicItem // 寄方公司简称是否置灰
  goodsTime: CommonDynamicItem // 货好时间
  behaviorOption: CommonDynamicItem // 用户行为信息相关数据(非运单直接数据集合)
  estimatedCost: estimatedCostItem // 预估运费
  coupon: CommonDynamicItem // 优惠券
  returnWaybill: CommonDynamicItem // 需返程
  senderExtraInfo: CommonDynamicItem // 寄方-附加配置-禁用项
  receiveExtraInfo: CommonDynamicItem // 收方-附加配置-禁用项
  payModeExtraInfo: CommonDynamicItem // 付款方式-附加配置-禁用项
  addedServiceExtraInfo: CommonDynamicItem // 增值服务-附加配置-禁用项
  pickupModeExtraInfo: CommonDynamicItem // 取件方式-附加配置-禁用项
  switchSendRecvInfoShowVo: CommonDynamicItem // 寄收地址切换-下单页面配置-配置项
  waybillSpecialEncrypt: CommonDynamicItem // 运单加密
  unifiedInfoSwitcher: CommonDynamicItem // 本次寄件信息统一
  otherWoodFrameShowVo: OtherWoodFrameShowVo // 其他木架
}

export interface StaticConfig {
  configId: string
  versionId?: string
  url?: string | null
  schema: Schema
  themeName?: string // 主题名称
  currentThemeName?: string // 当前主题名称
  outActivityFlag?: boolean | null //退出活动标识
}

export interface UnUsedFields {
  module: ModuleType
  fold: boolean
}

export interface ConfigDimension {
  staticConfig: StaticConfig
  dynamicConfig: DynamicConfig | null
  unUsedFields?: UnUsedFields[]
}

export interface PreInitResponse {
  configDimension: ConfigDimension
  userInfo: UserInfo
  waybillInfo?: OrderInfo
}

export interface InitResponse extends PreInitResponse {
  bindCustomerCodeFlag?: boolean // 下单公司是否显示标记
  batchId: string //批次号
  needBindCustomerCode?: boolean // 是否显示绑码弹窗
  bindCustomerCodeBar?: boolean // 是否显示绑码提示条
}

export interface preConfigInitResponse {
  pageInitConfigResponse: InitResponse
  // processCheckResponse: CheckResponse
  processCheckResponse: CheckResponse & BaseCheckResponse
  waybillNumber: string
  cacheVersion: string
  dataChangeFlag: boolean
  batchId: string //批次号
}

export interface BaseCheckResponse {
  status: boolean
  checkResultList: CheckDetail[]
  sender: {
    senderInfoVoList: ReceiveAiInfo[]
  }
  restrictData: RestrictData // 实际情况没有这个key
}
