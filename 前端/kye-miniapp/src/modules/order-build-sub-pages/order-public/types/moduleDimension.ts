import { GoodsTimeConfig, PeriodType } from '@order-public-sub-public/types'
/* 业务组件维度数据 */
import { FeeResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import {
  ReceiptType,
  PayMode,
  ServiceMode,
  ServiceModeType,
  GoodsInfoType,
  PremiumType,
  PayMethodType,
  AreaAttributeType,
  GoodsTimeFlag,
  GoodsTimeType,
  YesOrNoString,
} from '@order-public-sub-public/constants'
import {
  customerFieldDetailListType,
  kaCustomerMapItemOption,
  MatchItem,
  PickupType,
} from '@order-public-sub-public/types/waybill'
import {
  OtherPackageServiceEnum,
  PackageServiceEnum,
} from '@order-public-sub-public/components/business/added-service/types'

/**
 * @description 货好批次
 */
export interface GoodsTimeListItem {
  startDate: string
  endDate: string
  goodsBatch: string[] //货好批次
}

/**
 * @description 类型为“线上”货好时间
 */
export interface TimeRangeOnline {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  minuteStep?: number // 时间间隔（分钟）
  hourStep?: number // 时间间隔（分钟）
  timeBatch?: string[]
  timePeriodType?: PeriodType
}

export interface CrmGoodsTimeConfig {
  goodsTips: string
  goodsTimeFlag?: GoodsTimeFlag | boolean
  timeRange: TimeRangeOnline
}

/**
 * @description initCheck 线上 && 自定义
 */
export interface GoodsTimeVo {
  inputMode?: GoodsTimeType
  crmGoodsTimeConfig: CrmGoodsTimeConfig
  erpGoodsTimeConfig: GoodsTimeConfig | null
  goodsTimeFlagVisible?: boolean
}

export interface pickupModeItem {
  type: PickupType
  name: string
  tip?: string
}

/**
 * @description 寄件方式
 */
export interface PickupModeTypeDimension {
  pickupModeList: pickupModeItem[]
}

/**
 * @description 货好时间：initCheck
 */
export interface GoodsTimeDimension {
  aiGoodsTimeTips: string //AI提示语
  nightPickupFeeTips: string // 夜间取货提示
  goodsTimeVo: GoodsTimeVo
  strategyId: string
}

export interface KaCustomerMapItemRow {
  field: string // 客户外部编码名称
  kyField: string //跨越映射码
  requiredStatus: boolean //下单是否必填 0-非必填1-必填
  styleType?: string
  optionData?: kaCustomerMapItemOption[]
  isSelectFlag?: number
  customerFieldDetailList?: customerFieldDetailListType[]
  editable: boolean
  kaTypeFlag?: YesOrNoString
  kaTypeFlagTips?: string
}

/**
 * @description 自定义编码
 */
export interface KaCustomerMapDimension {
  fieldView: string
  unlimitedKyFields: string[]
  rows: KaCustomerMapItemRow[]
}

/**
 * @description 回单提供方
 */
export interface ReceiptProvider {
  disabled: boolean //是否禁用(置灰)
  provider: string //回单提供方, 10 收方提供; 20 寄方提供
  providerName: string //收方提供, 寄方提供
  tipsMsg: string //提示信息,eg. 收件地址暂不支持此服务
  default: boolean // 默认回显，自行提供
}

/**
 * @description 回单服务
 */
export interface ReceiptService {
  type: ReceiptType //回单类型,10--回单原件，30--回单图片, 40--电子回单
  typeName: string // 回单原件, 回单照片, 电子回单
  receiptTypeUrgentState: boolean //返单类型是否为加急返
  disabled: boolean //是否禁用(置灰)
  tipsMsg: string //提示信息,eg. 收件地址暂不支持此服务
  receiptProviderList: ReceiptProvider[] // 回单提供方,为空时无需选择默认寄方提供
  default: boolean
}

/**
 * @description 预估费用
 */
export interface EstimatedCostDimension {
  noNeedRead?: boolean
  status?: number //申请状态 0 没权限 1 有权限
  applyTime?: string //申请时间
  applyReason?: string //申请的理由
  marketPhone?: string //销售经理电话
  visible?: boolean // 是否显示
  response?: FeeResponse // 预估费用接口返回数据
  agreementCheck?: boolean // 是否勾选协议
  couponTips: string | null //优惠券提示文案
  contactType?: string // 30:商务， 否则 审批人
  contactTypeDesc?: string // 联系人角色
  contactButtonName?: string // 联系人拨打电话按钮文案
  contactScene?: number
}

/**
 * @description 物品保价
 */
export interface ProtectPriceDimension {
  customerCode: string //客户编码
  defaultPremium: number //保费
  defaultDeclared: number //声明价值
  premiumType: PremiumType //保费类型
  reminderTips: string //提醒文案
  settlementType: string // 结算方式(数据字典oms_waybill_source, 可能为会null), 10 现结; 20 周结; 30 半月结; 40 月结
  flushFlag: boolean // 0919迭代该字段已废弃
  coverFlag: boolean //判断保费是否被覆盖，新增逻辑 0919迭代该字段已废弃
}

/**
 * @description 货物信息
 */
export interface ProductInfoDimension {
  // minLength: number //最小计费长度，空表示没有超长费。单位：厘米
  // lengthCompareFlag: string //	长度比较标识，10：> , 20 >=
  // minWeight: number //最小计费重量，空表示没有超重费。单位：千克
  // weightCompareFlag: string // 	重量比较标识，10：> , 20 >=
  aiWeightTips: string //AI提示语
  strategyId: string
  goodsInfoList: GoodsInfo[]
  matchList: MatchItem[]
  aiSizeRecommend: AiSizeRecommend
}

export interface GoodsSupplementDimension {
  visible: boolean
  disabled?: boolean
  disabledTips?: string
  goodsSupplementProtectPriceTips?: string
}

export interface AiSizeRecommend {
  aiSizeTips: string
  strategyId: string
}

/**
 * @description 收件信息AI列表
 */
export interface ReceiveAiInfo {
  id: number //命中的策略ID
  person: string //姓名
  mobile: string //手机号码
  telephone: string //固话
  province: string //省
  city: string //市
  area: string //区
  detailAddress: string // 详细地址
  customerShortName: string // 收件客户名称,
  companyName?: string //公司名字
  county?: string
}

/**
 * @description 付款方式
 */
export interface PayModeDimension {
  aiPayModeTips: string //AI提示语
  nightPickupFeeTips: string //夜间取货费提示
  payMethodList: PayMethod[] // 付款方式
  cleanCurrentMode?: boolean
  disabled?: boolean
}
/**
 * @description 委托取货
 */
export interface PickupInformationDimension {
  uploadNum: number
  cargoImgUploadNum: number
  blockTips?: string
  orderTip?: string
}
/**
 * @description 派货
 */
export type DispatchInformationDimension = PickupInformationDimension

/**
 * @description 指定地址场景地址数量
 */
export type erpAddressCountInformationDimension = {
  receiveAddressCount?: boolean
  senderAddressCount?: boolean
}

export interface PayMethod {
  type?: PayMethodType //	1 默认（填充）0 非默认
  value?: PayMode // 10 寄方付 20 收方付 30 第三方付款
  customerCode?: string //客户编码
  customerName?: string //客户名称
  paymentAccount?: string // 回显值
  name: string // key
  label: string // 显示名称
  disabled?: boolean
  visible: boolean
  required: boolean
}

export interface ServiceItem {
  doubleIntegral: boolean
  type: ServiceModeType //1 默认（填充）0 非默认
  value: ServiceMode // 服务方式
  text: string //服务方式名称,
  serviceTypeCode: string
  serviceTypeName: string
  description: string
  noAgingFlag: string
  addDayFlag: string
  collectWorkday: number
  estimateArriveShortTime: string
  estimateArriveTime: string
  overweightFlag: string
  overweightMessage: string
  estimateFeeShowFlag: string
  estimateFee: string
  noEstimateFeeMessage: string
  restrictFlag: string
  restrictMessage: string
  descriptionH5Text: string
  iconInfo: {
    restrictType: string
    titleName: string
    message: string
  }
}

/**
 * @description 服务方式提示语
 */
export interface tipsInfosService {
  message: string
  type: string
}

/**
 * @description 服务方式
 */
export interface ServiceModeDimension {
  aiServiceModeTips: string //AI提示语
  serviceTypes: ServiceItem[] | []
  tipsInfos: tipsInfosService[]
  disabled?: boolean
}

export interface GoodsInfo {
  type: GoodsInfoType // 	类型 1 默认（填充）0 非默认  1.历史，2.AI，3.erp后台配置
  goodsType: string // 托寄物名称
  strategyId?: string //
  waybillLogId?: string
}

export interface Remark {
  aiWaybillRemarkTips: string
}

export interface CommonTypeForRemark {
  sort: number
  type: string
  value: string //标签名称
  strategyId: string
  waybillLogId: string
}

export type DriverHighFrequencyWord = {
  sort: number
  type: string
  value: string //名称
  code: string //编码
}

/**
 * @description 当前下单公司
 */
export interface OrderConsumer {
  customerName: string
  disabledSwitch?: string // 是否禁用
  departmentName?: string // 部门名称
  marketingTypes?: string[] // KA客户标识
  customerCode?: string
}

/**
 * @description 超区派送
 */
export interface OverAreaDeliveryDimension {
  agent: {
    tips: string // 提示文案
    topTips: string // 顶层提示文案
    themeText: string // 标题文字
  }
  selfLiftingAddress: string //	自提网点地址
  superAreaUnitePrice: number //	超区单价
  superZoneDistance: number //	超区距离（单位：km)
  superAreaFee: number //	超区费用
  selfLiftingDepotId: string //	自提网点点部id
  selfLiftingDepot: string //	自提网点点部
  selfLiftingDepotLatLng: string //	自提网点经纬度
  receiptAddressLatLng: string //	收件地址经纬度
  senderLng: number //	寄件人地址经度
  senderLat: number //	寄件人地址维度
  showFeeFlag: boolean //	是否显示费用
  feeMessage: string //	超区费用提示语
  branchLat?: number //	收件人地址经度
  branchLng?: number //	收件人地址维度
}

/**
 * @description 优惠券
 */
export interface CouponDimension {
  couponCode?: string
  usableCount: number //可使用数量
  disabledCount: number //不可使用数量
  couponTips: string | null //优惠券文案
  showText?: string // 特殊场景优惠券使用提示文案
  showTextStatus: number
}

/**
 * @description 自提网点
 */
export interface SelfPickBranch {
  branchId: string //	自提网点点部id
  branchName: string //	自提网点点部
  branchLatLng: string //	自提网点经纬度
  branchAddress: string // 	自提网点地址
  receiptAddressDistance: number //	距离收件地址距离
  branchLat?: number //	收件人地址经度
  branchLng?: number //	收件人地址维度
  selfLiftingAddress?: string //	自提网点地址
}

/**
 * @description 网点自提
 */
export interface BranchSelfPickUpDimension {
  fenceTips: string
  selfPickBranchesList: SelfPickBranch[]
}

/**
 * @description 运单备注
 */
export interface WaybillRemarkDimension extends Remark {
  waybillRemarkList: CommonTypeForRemark[]
}

/**
 * @description 给司机捎句话
 */
export interface MessageToDriverDimension extends Remark {
  messageToDriverList: CommonTypeForRemark[]
  driverHighFrequencyWordList: DriverHighFrequencyWord[]
}

/**
 * @description 收方信息
 */
export interface ReceiveDimension {
  stairFeeTips: string
  source: string
  receiveAiInfoVoList: ReceiveAiInfo[]
}
/**
 * @description 寄方信息
 */
export interface SenderDimension {
  source: string
  senderInfoVoList: ReceiveAiInfo[]
  realNameGuide: string // 实名认证引导
}
export interface AiItems {
  type: string
  value: string
  strategyId: string
}
/**
 * @description 增值服务
 */
export interface AddedServiceDimension {
  freightLookAuthFlag: string
  receiptServiceList: ReceiptService[]
  collectionAmount: CollectionAmountDimension
  aiItems?: AiItems[]
  aiTips?: string
  receiptFile?: {
    fileCount: number
    receiptFlag: string
  }
  dismantlingWoodenFrame?: {
    visible: boolean
    disabled: boolean
    isDefault: boolean
    tipsMsg: string
    costTipsMsg: string
  }
  woodenFrameInfoList?: woodenFrameInfoListType[]
  woodenFrameInfoListV2?: woodenFrameInfoListType[]
  goodsControl?: {
    visible: boolean
    required: boolean
    optionList: goodsControlOption[]
  }
  receiptCheckType?: ReceiptCheckType
  receiptUrgentReturn?: ReceiptUrgentReturn
  branchSelfPickUpFenceTips?: string
}

export interface goodsControlOption {
  type: string
  typeName: string
  isDefault: boolean
  disabled: boolean
  disabledTips: string
  desc: string
}

export interface woodenFrameInfoListType {
  name?: string
  value?: PackageServiceEnum | OtherPackageServiceEnum | string
  desc?: string
  tip?: string
  img?: any
  disabled?: boolean
  disabledTips?: string
  woodFrameEstimateFee?: {
    value: string
  }
  [key: string]: any
}

export enum ReceiptCheckTipsType {
  不可选 = '10',
}
export interface ReceiptCheckType {
  visible: boolean
  disabled: boolean
  receiptCheckTips: string // 不可用原因
  receiptCheckTipsType: ReceiptCheckTipsType | undefined | null | '' // 回单要求选择状态
  receiptStatus: number | null // 可用状态
  receiptCheckTypeList: ReceiptCheckTypeListItem[]
}
export interface ReceiptCheckTypeListItem {
  checkTypeName: string
  checkType: string
  isSelect: boolean
  disabled: boolean
}
export interface ReceiptUrgentReturn {
  visible: boolean
  disabled: boolean
  tipsMsg: string
  urgentList: urgentListItem[]
}
export interface urgentListItem {
  urgentName: string
  urgentType: string
  isSelect: boolean
  disabled: boolean
}
/**
 * @description 区域属性
 */
export interface AreaAttributeDimension {
  feature: AreaAttributeType
}

/**
 * @description 区域属性
 */
export interface CollectionAmountDimension {
  collectionFee: number
  reminderTips?: string
  disabled?: boolean
  visible?: boolean
  disabledTips?: string
}

/**
 * @description 模块
 */
export interface NightPickFeeDimension {
  nightPickupFeeTips: string | null
}

/**
 * @description 重货物一小时内提示信息
 */
export interface GoodsTimeOptimiDimension {
  goodsTimeOptimiTips: string | null
}

// 货物信息-件数是否可编辑
export interface ProductInfoDimensionEditable {
  countEditable?: boolean
  disabledTips?: string
}

/**
 * @description 网点自提减免提示
 */
export interface BranchSelfPickUpFence {
  branchSelfPickUpFenceTips: string
}

/**
 * @description 模板列表
 */
export interface ITemplate {
  templateId: number | null
  title?: string
  defaultFlag?: number
}
export type ITemplateDimension = ITemplate[]

/**
 * @description 回单费
 */
export interface ReceiptFee {
  feeTip: string
  receiptFee: number
}

export interface ITemplateDimensionResponse {
  list: ITemplate[]
  templateRecommendPop: boolean
}

/**
 * @description 模块维度数据
 */
export interface ModuleDimension {
  estimateFeeTaskId?: string
  orderCustomer?: OrderConsumer
  receive?: ReceiveDimension
  sender?: SenderDimension
  areaAttribute?: AreaAttributeDimension
  pickupMode?: PickupModeTypeDimension
  goodsTime?: GoodsTimeDimension
  kaCustomerMap?: KaCustomerMapDimension
  payMode?: PayModeDimension
  overAreaDelivery?: OverAreaDeliveryDimension
  serviceMode: ServiceModeDimension
  addedService?: AddedServiceDimension
  coupon?: CouponDimension
  branchSelfPickUp?: BranchSelfPickUpDimension
  estimatedCost?: EstimatedCostDimension
  protectPrice?: ProtectPriceDimension
  productInfo?: ProductInfoDimension
  goodsSupplement?: GoodsSupplementDimension
  waybillRemark?: WaybillRemarkDimension
  messageToDriver?: MessageToDriverDimension
  pickupInformation?: PickupInformationDimension
  dispatchInformation?: DispatchInformationDimension
  erpAddressCount?: erpAddressCountInformationDimension
  nightPickFee?: NightPickFeeDimension
  goodsTimeOptimi?: GoodsTimeOptimiDimension
  serviceModeFlag?: boolean
  productInfoEditable?: ProductInfoDimensionEditable
  branchSelfPickUpFence?: BranchSelfPickUpFence
  templateList?: ITemplateDimension
  receiptFee?: ReceiptFee // 回单费
}
