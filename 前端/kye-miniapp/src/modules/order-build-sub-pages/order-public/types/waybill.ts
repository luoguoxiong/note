/* eslint-disable max-lines */
import {
  CheckShowType,
  PayMode,
  ServiceMode,
  DialogButtonType,
  GoodsTimeFlag,
  DeliveryMode,
  CheckAfterSubmitType,
  CheckBeforeEnterType,
  LimitType,
  LimitReason,
  OrderSuccessType,
  ReceiptType,
  ReceiptProviderType,
  SelfSignType,
  NoPayCustomer,
  InsuranceValueSource,
  UrgentGoods,
  // SaveAddressFlag,
  YesOrNoNumber,
  YesOrNoString,
  MatchType,
  ModuleType,
  AdjustType,
  WaybillStatus,
  ModuleStyle,
  LimitBlockType,
  WaybillFlagType,
  OrderPageType,
  OrderSceneType,
  ProductInfoTips,
  GoodsDangerType,
  AgreementSignFlagType,
  SwitchEnum,
} from '@order-public-sub-public/constants'

import { CollectionAmountDimension, ModuleDimension, ProtectPriceDimension, ReceiptFee } from '.'
import { ConfigDimension, DynamicConfig } from '@order-public-sub-public/apis/types'
import { EncryptSettingResponse } from '@order-public-sub-public/apis/waybill-special-encrypt/types'
// import { ConfirmResult } from '@order-public-sub-root-pages/batch-restrict-new/hooks/type'

/**
 * @description 寄件收件共同属性
 */
// eslint-disable-next-line complexity, no-async-promise-executor, max-lines-per-function
export interface DeliveryPickUpCommonType {
  person: string //寄件姓名
  telephone?: string //	电话 phone和mobile不可都为空
  mobile?: string //	手机号 phone和mobile不可都为空
  extension?: string // 分机号
  province: string //省
  city: string //市
  district?: string // 区县-新版
  county: string // 区县
  detailAddress: string // 寄件详细地址(不带省市区)
  fullAddress?: string //完整地址
  companyName?: string // 公司简称
  pickup?: number
  phone?: string
}

/**
 * @description 寄件人信息
 */
export interface Delivery extends DeliveryPickUpCommonType {
  locationName: string
  customerName?: string
  exhibitionCode?: string //展会编码
  exhibitionNumber?: string //展馆号
  exhibitionSiteNumber?: string //展位号
  exhibitionProject?: string
  delayTime?: number // 取货延迟时间（小时）
  supplierId?: string // 供应商id
  dayText?: string //期望取货上门日期
  hourBetween?: string //期望取货上门时间段
  section?: string //楼栋
  floor?: string //楼层
  roomNumber?: string // 房间号
  uploadDeliveryCustomer?: string // 运单寄方，修改运单是传入
  locationId?: string //位置id
  companyName?: string // 公司简称
  saveAddressFlag: string // 是否保存到地址簿
  extend?: SenderExtend
}

export interface SenderExtend {
  projectArea: string
  projectLocation: string
  projectNumber: string
}

/**
 * @description 预约信息
 */
export interface AppointMentInfo {
  appointDate?: string //预约日期
  appointNumber?: string //预约单号
  appointWareHouse?: string //预约仓库
  purchaseNumber?: string //采购单号
}

/**
 * @description 收件人信息，大部分字段和寄件人信息一模一样
 */
export interface PickUp extends DeliveryPickUpCommonType, AppointMentInfo {
  locationId: string
  locationName: string
  customerName?: string
  customerCode?: string // 收方公司编码
  companyName?: string // 收方公司名称
  deliveryMode?: DeliveryMode // 送货方式
  selfPickupMobile?: string // 自提手机
  selfPickBranchId?: number // 自提网点id
  selfPickBranchName?: string // 自提网点名称
  superZoneFlag?: string // 是否超区标识，10-是，20-否
  inWareHouseType?: string //入仓类型，数据字典：crm_value_add_warehouse_type
  inWareHouseName?: string //入仓仓库：菜鸟仓
  pickupDate?: string //送货日期，格式：2021-09-25 235950
  fileBizId?: string //	取货资料业务ID
  saveAddressFlag?: string // 保存客户收寄件地址至地址簿标识：10保存寄件人信息，20保存收件人信息，30同时保存收、寄件人信息，其他值不保存
  exhibitionCode?: string //展会编码
  exhibitionNumber?: string //展馆号
  exhibitionSiteNumber?: string //展位号
  exhibitionProject?: string
  mobile?: string
}

// 非运单直接数据集合
export interface BehaviorOption {
  syncReceiveFlag?: boolean
}

/**
 * @description 货好时间
 */
export interface GoodsTime {
  goodsTime: string // 货好时间
  goodsTimeFlag?: GoodsTimeFlag
  urgentGoods?: UrgentGoods // 急件, 10 急件, 其它非急件
}

/**
 * @description 货物信息-尺寸
 */
export interface GoodsSize {
  length: number | string //长
  width: number | string //宽
  height: number | string //高
  count: number | string //数量
  singleWeight?: number | string //单件重量(kg)
  index?: number
  id?: number | string
}

/**
 * @description 货物信息-匹配对象
 */
export interface MatchItem {
  code: string
  value: string
}

/**
 * @description 托寄物
 */
export interface GoodsType {
  goodsType: string //托寄物
  count: number // 件数
  actualWeight?: number //实际重量
  volumeSize?: number //体积
  preWaybillGoodsSizeList: GoodsSize[] //尺寸
  productCode?: string //唯品会入库号
  matchList: MatchItem[]
  skuId?: string
  goodsSupplement?: GoodsSupplement
}

export interface GoodsSupplement {
  oldGoods: GoodsSupplementEnum | ''
  nudedGoods: GoodsSupplementEnum | ''
}

export enum GoodsSupplementEnum {
  选中 = '10',
  未选中 = '20',
}
export type ProductInfo = GoodsType

/**
 * @description 付款方式
 */
export interface PayModeType {
  payMode: PayMode | null // 付款方式
  authorizeStatus?: number //授权状态，数据字典：tms_oms_authorize_status
  paymentAccount?: string //付款账号：到付，第三方方式
  payCustomerPass?: string // 付款账号验证，验证密码
  paymentCustomerName?: string //付款公司名称
  paymentCustomerCode?: string // 付款公司编码：到付，第三方方式
  noPayCustomerFlag?: NoPayCustomer //收方付时，无付款公司标识，10无付款公司
  payAuthorizeConfirm?: string
}

/**
 * @description 服务方式
 */
export interface ServiceModeType {
  serviceMode: ServiceMode | string | null
  serviceModeShowLimit: ServiceModeShowLimitType | null
  estimateArriveTime?: { arriveTime: string; prescriptionSource: string }
}

/**
 * @description 服务限制提醒
 */
export interface ServiceModeShowLimitType extends AddressRestrict {
  flag: boolean
  noticeMessage: string
  blockedFlag: boolean
}

/**
 * @description 确认按钮类型
 */
export interface DialogButton {
  type: DialogButtonType
  text: string
}

export interface Restrict {
  flag: CheckBeforeEnterType & CheckAfterSubmitType //管控类型
  sort: number
  defer?: boolean //是否延迟到首页执行
}
//下单权限弹框数据
export interface haveApply {
  haveApply: string
  authPersonName: string
  authPersonPhone: string
  contactScene?: string // 需要联系商务的场景 50-运单待审批，60-申请下单权限，70-下单权限待审批
}
//实名认证弹框数据
export interface realNameData {
  showGoRealName: boolean
  forceRealName: boolean
}

// 代客下单弹框数据
export interface ReplaceOrder {
  agreementSignFlag: AgreementSignFlagType
}

interface MobileScrap {
  isContactOfficial: boolean
}
/**
 * @description 校验结果详情
 */
interface extraDataType {
  realNmeRsp?: realNameData
  haveApply?: haveApply
  replaceOrder?: ReplaceOrder
  mobileScrap?: MobileScrap
}
export interface CheckDetail {
  key: ChangeKeys
  showType: CheckShowType // 显示方式
  blockedFlag: boolean // 是否阻塞下单
  mask?: boolean //boolean // 是否需要点击热区触发
  content: string //文案 统一按v-html处理,
  preLimitType: CheckBeforeEnterType
  extraData?: extraDataType
  defer: boolean //是否要在首页弹
  waybillNumber?: string //运单号
  sort?: number | undefined
}

/**
 * @description 管控数据 - 是否展示付款方式
 */
export enum restrictPayModeType {
  limit = 10,
  NotLimit = 20,
}

/**
 * @description 八合一管控数据 - 10运单限制  20运单提醒
 */
export enum PageType {
  限制 = 10,
  提醒 = 20,
  下单结果页 = 30,
  运单提交页 = 40,
}

export enum RestrictDataTipType {
  付款方式 = 1,
  服务方式 = 2,
  出仓变动 = 3,
  入仓变动 = 4,
  出入仓变动 = 5,
}

export interface RestrictDataTips {
  tipType: RestrictDataTipType
  msg: string
}

/**
 * @description 调价管控类型
 */
export interface AdjustPrice {
  limitedOrderFlag: LimitBlockType // 限制下单标识, 10 限制下单
  adjustAmount: number //上调金额
  adjustAmountDesc: string //上调金额(格式化)
  adjustId: number //调价id
  adjustRespId: string //客户调价-查询接口返回的唯一标识
  adjustFenceId?: string
  adjustType: AdjustType //	调价类型：crm_adjust_type
  customerDefaultConfirm: boolean //客户自动确认标识,是自动同意;当命中资源调价报关出入仓，且命中出仓调价协议时，返回自动同意;否则此字段为空。
  customerRichTips: string //	客户提示富文本
  isAgreeContinue: boolean //是否强制，不同意后能否继续下一步
  waybillNumber?: string //批量寄使用
  adjustAmountTips?: string
  restrictFlag?: string
  // customerDefaultConfirm?: boolean
  respId?: number
  restrictPayMode?: restrictPayModeType
  confirmResult?: any
  limitReason?: LimitReason
  adjustPriceFlag?: number // 是否命中
  tips?: RestrictDataTips[]
}

export interface contactersType {
  contacterName: string
  contacterPhone: string
}

/***
 * @description 取派管控
 */
export interface AddressRestrict {
  senderAddressPlainBar: string
  receiverAddressPlainBar: string
  limitType: LimitType // 限制类型，数据字典：map_warn_restrict_type，10：限制；20：提醒；30：不限制
  limitReason: LimitReason //限制原因，数据字典：map_warn_basic_data_reason，疫情 ：10 ， 台风天气：20，雨雪天气：30 汛期影响：40，假期影响：50，春运期间：60，国际大型会议：70，其他：80
  customerRichTips: string //提示客户富文本
  matchType: MatchType //匹配类型 10 寄收线路 20 寄件 30 收件 40其他 数据字典map_warn_match_type
  blockedFlag?: boolean
  showClear?: boolean
  customerPlainTips: string // 纯文本
  fenceOverZone: boolean //是否命中超区
  restrictedType: LimitBlockType //限制是否强制类型
  waybillNumber?: string

  respId?: number
  restrictFlag?: string
  restrictPayMode?: restrictPayModeType
  adjustAmountTips?: string
  customerDefaultConfirm?: boolean
  confirmResult?: YesOrNoNumber
  storageFlag: boolean
  unmodifiableReason?: string
  contacters?: contactersType[]
}

/**
 * @description 截单专车
 */
export interface CutoffCar {
  hitCutoffCarFlag: number //是否命中截单专车, 10: 命中且继承同意; 20: 未命中; 30: 命中且继承不同意; 40: 命中需用户选择; 50:命中且默认同意
  cutoffTime: string //截单专车截单时间。时间格式HHmm, 如1200
  cutoffCarFee: number //	截单专车费.最小两位小数
  customerRichTips: string //	提示客户富文本(含注意事项)
  themeId: number //截单主题ID
  isAgreeContinue: boolean //是否强制，不同意后能否继续下一步
  waybillNumber?: string //批量寄使用

  respId?: number
  restrictFlag?: string
  restrictPayMode?: restrictPayModeType
  adjustAmountTips?: string
  customerDefaultConfirm?: boolean
  confirmResult?: YesOrNoNumber
  limitReason?: LimitReason
}

/**
 * @description 用户维度
 */
export interface UserDimension {
  userInfo: {
    // 用户信息
    phone: string //下单手机
    nickName: string //昵称
    name: string //姓名
  }
}

/**
 * @description 报关出入仓
 */
export interface ClearanceWarehouse {
  adjustRespId: string //	报关入仓-查询接口返回的唯一标识
  adjustFenceId?: string
  fenceTips: string // 报关入仓手续费提示
  excTips: string //报关入仓异常操作费提示
  sendAdjustFlag: string //报关出仓标识;10有调价；20：无调价
  endAdjustFlag: string //报关入仓标识;10有调价；20：无调价
  warehouseTips: string //报关出仓调价提示
  excWarehouseTips: string //报关出仓异常操作提示
  sendFenceId: string //寄件地址匹配的配置ID
  endFenceId: string //收件地址匹配的配置ID
  customerDefaultConfirm?: boolean //客户自动确认标识,是自动同意;当命中资源调价报关出入仓，且命中出仓调价协议时，返回自动同意;否则此字段为空。
  agreeCustomerRichTips?: string //	客户选择同意提示富文本
  disagreeCustomerRichTips?: string //	客户选择不同意提示富文本
  sendCustomerDefaultFlag: boolean
  endCustomerDefaultFlag: boolean
  sendAgreeRichTips: string
  sendDisagreeRichTips: string
  endAgreeRichTips: string
  endDisagreeRichTips: string
  sendConfirmResult: number
  endConfirmResult: number
  isAgreeContinue: boolean //是否强制，不同意后能否继续下一步
  waybillNumber?: string //批量寄使用
  sendAgreeRichMsg?: string
  sendDisagreeRichMsg?: string
  endAgreeRichMsg?: string
  endDisagreeRichMsg?: string

  respId?: number
  restrictFlag?: string
  restrictPayMode?: restrictPayModeType
  customerRichTips?: string //提示客户富文本
  adjustAmountTips?: string
  confirmResult?: YesOrNoNumber

  endCustomerPriceTip?: string
  sendCustomerPriceTip?: string
  endCustomerPrice?: number
  sendCustomerPrice?: number
  limitReason?: LimitReason
  warehouseAmount?: number
  fenceAmount?: number

  addedServiceEndShowTips?: string // 入仓、入展提示
  addedServiceSendShowTips?: string // 出仓、出展提示
  sendShowType?: string //  出仓、出展类型
  endShowType?: string // 入仓、入展类型

  tips?: RestrictDataTips[]
}

/**
 * @description 投保管控
 */
export interface InsuranceRestrict {
  tipMsg: string //投保管控限制下单提示信息
  insuranceAccepted: boolean //物品是否承保
  declarativeAccepted: boolean //声明价值是否承保
  blockedFlag?: boolean
  waybillNumber?: string //批量寄使用
}

/**
 * @description 危险品管控
 */
export interface GoodsDangerRestrict {
  msg: string //危险品管控提示语
  type: GoodsDangerType //危险品提示的类型
  returnWaybillFlag?: boolean //是否返程单命中
}

export interface ErrorType {
  type: ProductInfoTips //类型
  msg: string //错误描述
}

export interface GoodsRestrictSubProperty {
  name: string
  require: boolean
  code: string
  seq: number
}

export interface GoodsRestrictProperty extends GoodsRestrictSubProperty {
  bubbleTip: string
  subPropertyList: GoodsRestrictSubProperty[]
}

/**
 * @description 托寄物管控
 */
export interface GoodsRestrict {
  goodsType: string //托寄物名称
  goodsName: string //托寄物名称
  error: ErrorType
  tips: ErrorType[] //提示
  alerts: ErrorType[]
  goodsRestrictPropertyList: GoodsRestrictProperty[]
  blockedFlag?: boolean
  waybillNumber?: string //批量寄使用
  goodsTypeFeeTips?: string // 特殊寄托物品费用提示
  goodsDeliveryDetailFileCount?: number
}

/**
 * @description 管控数据对象
 */
export interface RestrictData {
  blockedFlag: boolean // 是否中断
  restrictFlagList: Restrict[]
  adjustPriceList?: AdjustPrice[] // 资源调价
  adjustPrice?: AdjustPrice // 调价管控
  addressRestrict?: AddressRestrict // 取派管控
  cutoffCar?: CutoffCar // 截单专车
  clearanceWarehouse: ClearanceWarehouse // 报关出入仓
  goodsRestrict: GoodsRestrict // 托寄物管控
  goodsDangerRestrict: GoodsDangerRestrict // 危险品管控
  insuranceRestrict?: InsuranceRestrict // 投保管控
  cleanElements: string[] //需要清空的副作用
  tips?: string[]
}

/**
 * @description 保费和代收货款
 */
export interface AddedServiceFee {
  protectPrice: ProtectPriceDimension
  collectionAmount: CollectionAmountDimension
  receiptFee: ReceiptFee
}

/**
 * @description 检查返回的结果
 */
export interface CheckResponse {
  status: boolean
  checkResultList: CheckDetail[] //检查的结果
  moduleDimension: ModuleDimension // 组件维度数据
  configDimension: ConfigDimension // 配置数据
  restrictData: RestrictData // 管控数据
  needBindCustomerCode?: boolean // 是否显示绑码弹窗
  waybillInfo: OrderInfo
  restrictDataList?: RestrictData[]
  dynamicConfig?: DynamicConfig
  tempWaybillInfo?: Pick<OrderInfo, 'addedService'>
}

export interface ProcessHandleOptions {
  orderPageType?: OrderPageType
  changeKeys?: (ChangeKeys | undefined)[]
  tempOrderInfo?: OrderInfo
  processQuery: processQuery
}

/**
 * @description 取货信息对象
 */
export interface OrderPickupInfo {
  person: string
  phone: string
  mobile: string
  extension: string
  orderRemark: string
  bigGoodsFlag?: YesOrNoNumber //	大货入仓标识,数据字典：common_yes_no
  bulkCargoFlag: string
  roughlyCount?: number
  roughlyWeight?: number
  bulkCargoInfos: {
    bulkCargoFlag: string //大票货标识，10：支持出入挂车，20：不支持出入挂车
    pickupAddress: string
  }[] //取货地址
  fileBizId: string
  telephone: string
  uploadNum: number | string | undefined
}

/**
 * @description 增值服务
 */
export interface AddedService {
  receiptFlag?: ReceiptType // 回单类型，数据字典：tms_receipt_type，10--回单原件，20--无，30--回单图片, 40--电子回单
  receiptCount?: number | null // 	回单份数
  receiptProvider?: ReceiptProviderType | string // 回单提供方 回单提供方, 10 收方提供; 20 寄方提供
  receiptFile?: string // 电子回单是否为必填项
  receiptCheckType?: string[] // 回单要求
  receiptUrgentReturn?: string // 回单是否加急返
  declarativeValue?: number // 声明价值
  collectionAmount?: number | string // 代收金额
  woodenFrame?: string // 木架方式
  otherWoodFrameList?: string[]
  goodsControl?: string // 控货方式
  dismantlingWoodenFrame?: string
}

/**
 * @description 优惠券
 */
export interface Coupon {
  couponCode: string
  oldCouponCode?: string //旧优惠券码（需要进行解绑的优惠券码）
  afterDiscountAmount?: number //使用优惠券后的折扣金额
  showText?: string //优惠券展示文案-入口用
  bindingCouponBaseCode?: string // 请求列表用，修改运单时上一次选中优惠券
  usableCount?: number // 可使用数量
  disabledCount?: number // 不可用数量
  couponTips?: number // 变更信息提示
  waybillNumber?: number // 运单号
  estimateFeeTaskId?: string
}

/**
 * @description 安装服务
 */
export interface Decoration {
  oneCategoryName: string //一级分类名称
  twoCategoryName: string //二级分类名称
  threeCategoryName: string //三级分类名称
  furnitureCode: string //家具编码
  goodsName: string //商品名称
  goodsSpec: string //商品规格
  goodsPrice: number // 商品价格
  goodsCount: number //数量
  goodsImage: string //商品图片
  remark: string //注意事项
  feeAmount: number //安装费用金额
}

/**
 * @description 自定义编码
 */
export interface CustomCode {
  customerFieldName: string //客户自定义编码名称
  customerFieldValue: string //客户自定义编码值
  kyField: string //跨越映射码(数据字典tms_customer_waybill_type)
}

/**
 * 超区派送
 */
export interface OverAreaDelivery {
  deliveryMode?: DeliveryMode //送货方式，数据字典：tms_pre_waybill_delivery_mode
  superZoneFlag?: YesOrNoString // 是否超区标识，10-是，20-否
  selfPickupMobile?: string //自提手机
  selfPickBranchId?: string //	自提网点id
  selfPickBranchName?: string // 自提网点名称
}

/**
 * @description 网点自提
 */
export interface BranchSelfPickUp {
  selfPickupMobile?: string //自提手机
  selfPickBranchId?: string //自提网点id
  selfPickBranchName?: string // 自提网点名称
}

/**
 * @description 取货资料
 */
export interface PickupInformation {
  fileBizId?: string
  pickup?: number
}

/**
 * @description 派货资料
 */
export interface DispatchInformation {
  inWareHouseType?: string //入仓类型，数据字典：crm_value_add_warehouse_type
  inWareHouseName?: string //入仓仓库：菜鸟仓
  pickupDate?: string //送货日期，格式：2021-09-25 235950
  appointNumber?: string //预约单号
  purchaseNumber?: string //采购单号
  appointDate?: string //预约时间，格式：2021-09-25 2359
  appointWareHouse?: string // 	预约仓库
  uploadNum?: any
}

/**
 * 网点自提
 */
export interface BranchSelfPickup {
  address: string // 自提地址
  phone: number // 自提手机号
}

/**
 * @description 除了寄方、收方等非对象的一级表单属性,用于组成完整表单和收集所有表单字段
 */
export type OrderInfoDetails = OrderInfoFirstLevel &
  GoodsTime &
  PayModeType &
  OrderPickupInfo &
  ProductInfo &
  ServiceModeType &
  KaCustomerMap &
  OverAreaDelivery &
  BranchSelfPickUp &
  PickupInformation &
  DispatchInformation &
  ProtectPrice &
  AddedService &
  Coupon

/**
 * @description OrderInfoFirstLevel
 */
export interface OrderInfoFirstLevel {
  id: string //数据唯一编号
  waybillNumber: string //运单号
  orderNo: string //	下单编码
  qrCodeWaybillMask: string //二维码面单掩码
  waybillSource: string //运单单据来源,数据字典kye：oms_waybill_source
  waybillType: string //单据类型，数据字典：oms_waybill_type
  recorderName: string //录单人姓名
  travelerId?: number //项目区位ID
  sliceAreaId?: number //项目片区ID
  version: string //版本号，修改运单时传入
  waybillFlag?: WaybillFlagType // 去/返程单
  superiorWaybillNumber?: string // 返程单特有字段，对应的去程单
  waybillId?: string

  approvalDescribe?: string
  auditState?: number
  authPersonName?: string
  auditId?: string
  authPersonPhone?: string
  showLinkButton?: boolean
  waybillState?: WaybillState
}

export interface kaCustomerMapItemOption {
  data: string
  time?: string
}
export type KaCustomerMap = kaCustomerMapItem[]

export interface customerFieldDetailListType {
  code: number
  msg: string
}

/**
 * @description 自定义编码
 */
export interface kaCustomerMapItem {
  customerFieldName: string //客户自定义编码名称
  customerFieldValue: string //客户自定义编码值
  kyField: string // 跨越映射码(数据字典tms_customer_waybill_type)
  requiredStatus?: boolean
  styleType?: string
  optionData?: kaCustomerMapItemOption[]
  isSelectFlag?: number
  customerFieldDetailList?: customerFieldDetailListType[]
  editable: boolean
  kaTypeFlag?: YesOrNoString
  kaTypeFlagTips?: string
  searchFlag?: boolean // 是否进入自定义编码(EncodeItem)组件
}

/**
 * @description 物品保价
 */
export interface ProtectPrice {
  insuranceValueSource?: InsuranceValueSource // 声明价值来源,tms_oms_insurance_value_source
  declarativeValue: number | string
  premiumType?: number | null
}

/**
 * @description 运单备注
 */
export interface WaybillRemark {
  waybillRemark: string
}

export interface MessageToDriver {
  orderRemark: string
  driverHighFrequencyWords?: string[]
}

/**
 * @description 需返程
 */
export interface ReturnWaybill {
  switchFlag: boolean
  value: string
  userConfirm?: SwitchEnum
}

/**
 * @description 管控确认
 */
export interface RestrictConfirm {
  restrictFlag: CheckAfterSubmitType
  confirmResult: YesOrNoNumber //确认结果
}

// 本人签收
export interface SelfSign {
  selfSignFlag?: SelfSignType
}

/**
 * @description 运单加密
 */
export interface WaybillSpecialEncryptRule {
  roleType: number
  fieldColumn: string
  encryptType: number | string
  fieldName: string
}

export interface WaybillSpecialEncrypt {
  waybillSpecialEncryptType: string | false
  waybillSpecialEncryptRules: WaybillSpecialEncryptRule[]
}

/**
 * @description 完整表单，用于vuex state和表单过程中
 */
export interface OrderInfo extends OrderInfoFirstLevel {
  sender: Delivery //寄件信息对象
  receive: PickUp //收件信息对象
  pickupMode: PickupMode // 寄件方式
  goodsTime: GoodsTime //货好时间
  payMode: PayModeType // 付款方式
  orderPickupInfo: OrderPickupInfo //取货信息
  productInfo: ProductInfo //货物信息
  serviceMode: ServiceModeType //服务方式
  kaCustomerMap: KaCustomerMap //自定义编码
  overAreaDelivery?: OverAreaDelivery //超区派送
  branchSelfPickUp?: BranchSelfPickUp // 网点自提
  pickupInformation?: PickupInformation // 取货资料
  dispatchInformation?: DispatchInformation // 派货资料
  protectPrice: ProtectPrice //物品保价
  addedService: AddedService // 增值服务
  coupon: Coupon //优惠券
  waybillRemark?: WaybillRemark //运单备注
  messageToDriver?: MessageToDriver // 给司机捎句话
  returnWaybill?: ReturnWaybill // 需返程
  selfSign?: SelfSign
  waybillSpecialEncrypt?: WaybillSpecialEncrypt // 运单加密
  behaviorOption?: BehaviorOption
}

/**
 * @description 所有表单字段的总集合
 */
export type WholeModule = Delivery & PickUp & OrderInfoDetails

/**
 * @description 表单的任意一部分
 */
export type PartialModule = Partial<WholeModule>

/**
 * @description 寄收信息的字段需要拼接
 */
export type CombinedDeliveryAndPickUpType =
  | Uncapitalize<`${ModuleType.寄方信息 | ModuleType.收方信息 | 'addedService.receipter'}.${keyof DeliveryPickUpCommonType}`>
  | 'sender.projectNumber'
  | 'sender.projectArea'

/**
 * @description 排除寄收
 */
type OtherModuleFormKey = Exclude<
  Uncapitalize<ModuleType> & keyof OrderInfo,
  Uncapitalize<ModuleType.寄方信息 | ModuleType.收方信息>
>

/**
 * @description 支持提示二级字段，使用Required纳入可选项
 */
export type CombinedTypeAndChangeKey<T extends OtherModuleFormKey> = T extends OtherModuleFormKey
  ? `${T}.${Extract<keyof Required<OrderInfo>[T], string>}` | `${T}`
  : never

/**
 * @description 拼接二级字段
 */
export type ChangeKeys =
  | CombinedDeliveryAndPickUpType
  | CombinedTypeAndChangeKey<OtherModuleFormKey>
  | Uncapitalize<ModuleType>
  | 'returnWaybillInfo' //返程单专用
  | 'returnWaybillEnd'
  | 'init' // 初始化
  | 'waybill'
  | 'coupon'
  | 'waybill.lastInfo' // 复用上次寄件信息标识
  | 'unifiedInfoSwitcher' // 关闭
  | 'returnWaybill.returnWaybill'
  | ''
  | 'onlyEstimateFee' // 只计费
  | 'waybill.confirm.restrict' // 确认管控
  | 'batchWaybillList' // 批量收方
  | 'protectPrice.protectPrice' // 保费弹框里面的确认
  | 'addedService.receipter' // 回单信息返单

/**
 * @description 下单保存返回信息
 */
export interface OrderResponse extends Pick<CheckResponse, 'checkResultList' | 'restrictData' | 'status'> {
  waybillNumber: string
}

export interface Topics {
  adjustTitle: string //调价主题名称
  customerRichTips: string
  customerOrderTipsText: string
  crmRuleTips: string
  adjustAmountTips: string
  adjustId: number
  adjustType?: number
  customerDefaultConfirm?: boolean
  restrictPayMode?: string
  adjustAmount: number
}

/**
 * @description 过程接口中入参
 */
export interface processQuery {
  orderInfo: OrderInfo
  moduleStyle: ModuleStyle | string
  elementsChange: Array<ChangeKeys | undefined>
  pageName?: string
  cacheStrategy?: number | null
  textCode?: string
  callFlag?: boolean
  waybillSource?: string
  typeList?: number[]
  orderInfoList?: OrderInfo[]
  premiumType?: number | string
}

export type PreloadQuery = Omit<processQuery, 'orderInfo'> & {
  waybillInfo: OrderInfo
  type: OrderSceneType
  waybillSource?: string
}

/**
 * @description 下单成功页收件人信息
 */
export interface SuccessWaybill {
  waybillNumber: string // 运单号 KY5000031031078
  waybillFlag?: WaybillFlagType
  waybillStatus?: WaybillStatus // 运单状态 10 待通知取货 20待揽件 30待签收 40 已签收
  waybillStatusText: string //运单状态文本
  orderTime: string //下单时间
  goodsTime: string //货好时间
  receiveTime: string //签收时间
  receiver: string // 签收人
  contactName: string //取货联系人
  contactPhone: string //	取货联系人手机
  actualWeight: number // 实际重量
  freightWeight: number // 计费重量
  serviceMode: ServiceMode // 服务方式
  serviceModeText: string //服务方式文本
  waybillCodeUrl: string //寄件码地址	string
  count: string //件数
  waybillPickup: PickUp
  waybillDelivery: Delivery
  goodsType: string //托寄物
  shareVisible: boolean // 通知收件人弹窗
  showBarcode: boolean // 显示寄件码
  needShare: boolean // 通知收件人显示
  waybillId?: string
  waybillRadioChecked?: boolean
  payModeAccount?: string // 付款方式
  receiptFlagText?: string //回单服务外显文案
  receiptCount: number //回单张数
  pickupMode?: PickupMode // 寄件方式
}

export interface AdjustPromptInfos {
  titleType: string
  titleTypeName: string
  title: string
  richText: string
  ruleText: string
  adjustPrice: string
}

/**
 * @description 下单成功信息
 */
export interface SuccessOrderInfo {
  selfDelivery: '10' | '20' | null
  orderNumber: string //下单编码
  goodsTime: string // 货好时间
  orderCompletedPageType: OrderSuccessType //下单成功页类型
  resultType?: OrderSuccessType // 新加的下单成功类型 为什么要再加个字段??
  orderDescription: string //下单描述string"支持html标签"
  orderTitle?: string
  adjustStatus?: '10' | '20'
  role?: 1 | 2 // 10-主授权人  20-管理员  40-部分负责人  50-商务
  subTitle: string
  businessName: string //商务姓名
  businessPhone: string //商务电话 "1999999999"
  reviewer: string //	审核人string"xxx"
  reviewerPhone: string //审核人电话string"18888888888"
  contactScene: string // 审核人联系场景
  topics: Topics[]
  autoStatus?: AutoAuditStatus // 自动审核状态
}

/**
 * @description 广告
 */
export interface Ad {
  src: string
  href: string
}

/**
 * @description 下单成功页返回数据
 */
export interface OrderSuccessResponse {
  orderInfo: SuccessOrderInfo
  waybillList: SuccessWaybill[]
  realAuth: true
  realAuthTips: string
}

export interface templateVo {
  showSaveTemplate: boolean
  bubbles: string
  /** 是否展示保存模板横幅（寄件模板无值场景） */
  showSaveBanner?: boolean
}
export interface OrderSuccessBaseResponse {
  orderInfo: SuccessOrderInfo
  templateVo: templateVo
}
export interface OrderSuccessWaybillResponse {
  waybillList: SuccessWaybill[]
  realAuth: true
  realAuthTips: string
}

export interface RenderTabList {
  label?: string
  name?: string
  value?: number
}

/**
 * @description 上次寄件信息
 */
export interface lastWaybillInfo {
  waybillInfo: OrderInfo
}

// 校验地址完整性入参
export interface checkAddress {
  province?: string
  city?: string
  district?: string
  address?: string
}
// 校验地址完整性反参
export interface checkAddressTips {
  key: string
  content: string
}

/**
 * @description 页面默认设置信息，整合的琐碎接口
 */
interface addressSaveInfoType {
  senderSelectFlag: boolean
  receiveSelectFlag: boolean
}
/**
 * @description 货物信息的相关记录
 */
interface goodsTypeTipType {
  popUpTip: boolean
}

interface agreementInfoType {
  waybillSelectFlag: boolean
  insuranceFeeSelectFlag: boolean
}

interface goodsTimeOptimizeInfoType {
  msg: string
  type: string
}
export interface pageDefaultInfoType {
  addressSaveInfo: addressSaveInfoType
  agreementInfo: agreementInfoType
  encryptSettingInfo: EncryptSettingResponse
  goodsTypeTip: goodsTypeTipType
  goodsTimeOptimizeInfo: goodsTimeOptimizeInfoType
}
// 同步实名认证结果入参
export interface SyncRealNameInfoParams {
  uniqueId: string
}
export enum PickupType {
  '上门取件' = '20',
  '服务点自寄' = '10',
}
export interface SelfDeliveryInfo {
  dispatchCustomerDeliveryAddr: string //	送货场地
  dispatchDriverName: string //	送货联系人
  dispatchDriverMobile: string //	送货联系电话
  customerPickGoodsTime: string //	约定送货时间
}
export interface PickupMode {
  pickupMode?: PickupType
  selfDeliveryInfo?: SelfDeliveryInfo // 服务点自寄信息
  disabled?: boolean
}

// 运单审核状态
export enum WaybillState {
  '审核中' = 10,
  '已撤销' = 40,
  '已拒绝' = 50,
}

// 自动审核状态
export enum AutoAuditStatus {
  '审核中' = 10,
  '审核完成' = 20,
}

// 运单审核状态: 10：同意调价(运单), 20: 同意调价(客户), 30：限制下单(运单), 40：限制下单(客户), 50：忽略调价
export const AuditState = 10 | 20 | 30 | 40 | 50
export const AuditStateMap: Record<number, string> = {
  10: '可下单',
  20: '可下单',
  30: '限制下单',
  40: '限制下单',
  50: '可下单',
}
