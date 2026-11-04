/**
 *  运单信息枚举
 */

/**
 * @description 是否加密
 */
export enum IsEncrypted {
  YES = 1, //是
  NO = 0, //否
}

/**
 * @description 付款方式
 */
export enum PayMode {
  '寄方付' = '10', //寄方付
  '收方付' = '20', //收方付
  '第三方付' = '30', //第三方付
  '清空' = '', // 清空
}

/**
 * @description 服务方式
 */
export enum ServiceMode {
  '当天达' = '10',
  '次日达' = '20',
  '隔日达' = '30',
  '陆运件' = '40',
  '航空件' = '50',
  '冷运件' = '60',
  '同城即日' = '70',
  '同城次日' = '80',
  '早班件' = '90',
  '次晚达' = '100',
  '中班件' = '110',
  '晚班件' = '120',
  '次晨达' = '130',
}

/**
 * @description 服务方式类型
 */
export enum ServiceModeType {
  'DEFAULT' = 1,
  'NOT_DEFAULT' = 0,
}

/**
 * @description 过程中弹窗按钮类型
 */
export enum DialogButtonType {
  CANCEL = 'cancel',
  OK = 'ok',
}

/**
 * @description 货好时间flag
 */
export enum GoodsTimeFlag {
  NOW = 10, // 现在货好
  NONE = '',
}

/**
 * @description 送货方式
 */
export enum DeliveryMode {
  SELF_PICKUP = '10', //网点自提
  SUPER_ZONE = '20', //超区派送-送货上门
  NONE = 0, // 空值
}

/**
 * @description 取货方式
 */
export enum PickUpMode {
  CUSTOMER_TO_BRANCH = '10', //客户送到点部
  DRIVER_PICKUP_GOODS = '20', //司机上门取货
}

/**
 * @description 保存类型 ,10：只保存电子运单(不走调度)，20：同时下订单和电子运单（调度）
 */
export enum OrderType {
  ONLY_ELECTRONIC_WAYBILL = '10', // 只保存电子运单(不走调度)
  BOTH_ORDER_AND_ELECTRONIC = '20', // 同时下订单和电子运单（调度）
}

/**
 * @description 操作类型,1：新增；2：修改
 */
export enum OperationType {
  ADD = 10, // 新增
  UPDATE = 20, // 修改
}

/**
 * @description 电子围栏下单标识，10电子围栏下单
 */
export enum ElectricFenceFlag {
  ELECTRIC_FENCE = 10, // 电子围栏下单
}

/**
 * @description 限制类型，数据字典：map_warn_restrict_type
 */
export enum LimitType {
  FETCH = 10, // 限取
  DISPATCH = 20, // 限派
  FETCH_NOTICE = 30, // 取提醒
  DISPATCH_NOTICE = 40, // 派提醒
  LINE = 50, // 路线限制
  NONE = 60, //不限制
}

/**
 * @description 限制原因，数据字典：map_warn_basic_data_reason
 */
export enum LimitReason {
  '疫情' = 10,
  '台风天气' = 20,
  '雨雪天气' = 30,
  '汛期影响' = 40,
  '假期影响' = 50,
  '春运期间' = 60,
  '国际大型会议' = 70,
  '其他' = 80,
  '夜间取货' = 90,
  '报关' = 200,
}
/**
 * @description 取派限制类型
 */
export enum LimitBlockType {
  '限制' = 10,
  '提醒' = 20,
  '未命中' = 30,
}
/**
 * @description 命中规则类型
 */
export enum HitType {
  '黑名单线路限寄' = 'H10',
  '围栏超区' = 'W20',
  '白名单' = 'B30',
  '未找到规则' = 'N40',
  '未匹配到规则' = 'P50',
}

/**
 * @description 匹配类型 10 寄收线路 20 寄件 30 收件 40其他 数据字典map_warn_match_type
 */
export enum MatchType {
  '寄收线路' = '10',
  '寄件' = '20',
  '收件' = '30',
  '其他' = '40',
}

/**
 * @description 下单成功页类型
 */
export enum OrderSuccessType {
  '产生运单和订单' = 10, //产生运单和订单 非截单专车；
  '截单专车' = 20, // 产生运单和订单 走截单专车；
  '只产生运单' = 30, // 只产生运单 生鲜/散收场景，固定班次上门取货，驻场；
  '调价审核' = 40,
  '运单审核' = 50,
  '戈壁' = 60,
  '服务点自寄' = 70,
  '下单失败' = 80,
  '费用审核' = 90,
  '保存草稿' = 110,
  '托寄物审核' = 120,
}

/**
 * @description 回单服务
 */
export enum ReceiptType {
  'ORIGIN' = '10', //回单原件
  'NONE' = '20', //无
  'IMAGE' = '30', //回单图片
  'ELECTRON' = '40', //电子回单
}

/**
 * @description 回单提供方
 */
export enum ReceiptProviderType {
  'RECEIVER' = '10', //收方提供
  'SENDER' = '20', //寄方提供
  'KYEPINCHHIT' = '30', // 跨越代打
  'MYSELF' = '40', // 自行提供
}

/**
 * @description 本人签收
 */
export enum SelfSignType {
  'YES' = 10,
  'NO' = 20,
}

/**
 * @description 托寄物标签类型
 */
export enum GoodsInfoType {
  'DEFAULT' = 1,
  'NOT_DEFAULT' = 0,
}

/**
 * @description 无付款公司
 */
export enum NoPayCustomer {
  'NONE' = '10',
}

/**
 * @description 声明价值来源
 */
export enum InsuranceValueSource {
  'DEFAULT' = 10, //系统默认
  'MANUAL' = 20, // 人工
  'NONE' = 30, // 无
}

/**
 * @description 急件
 */
export enum UrgentGoods {
  'URGENT' = '10',
}

/**
 * @description 保存客户收寄件地址至地址簿标识
 */
export enum SaveAddressFlag {
  'SENDER' = '10',
  'RECEIVE' = '20',
  'BOTH' = '30',
}

/**
 * @description 限制下单标识
 */
export enum LimitOrderFlag {
  'LIMIT_ORDER' = 10, // 限制下单
}

/**
 * @description 调价类型
 */
export enum AdjustType {
  'ORDER' = 1, //按票加价
  'PERCENT' = 2, //按比例加价
  'WEIGHT' = 3, //重量段加价
  'OFFICAL' = 4, //官方加价
}

/**
 * @description 客户自动确认标识
 */
export enum CustomerDefaultConfirm {
  'AUTO' = 10,
}

/**
 * @description 运单状态
 */
export enum WaybillStatus {
  '待通知取货' = 10,
  '待揽件' = 20,
  '待签收' = 30,
  '已签收' = 40,
  '已取消' = 50,
}

/**
 * @description 付款方式填充类型
 */
export enum PayMethodType {
  'DEFAULT' = 1, //默认填充，选中的意思
  'NO_DEFAULT' = 0, // 非默认填充
}

/**
 * @description 区域属性
 */
export enum AreaAttributeType {
  '自营区' = 0,
  '转寄区' = 1,
  '伙伴区' = 2,
  '自提区' = 3,
}

/**
 * @description 获取推荐取货联系人信息联想类型
 */
export enum RecommendContactType {
  '联系人' = 10,
  '联系人手机' = 20,
  '联系人电话' = 30,
}

/**
 * @description 支付开票地址
 */
export enum fallbackInvoiceUrl {
  PROD = 'https://invoice-manager.ky-express.com/fms-online-settlement-h5/',
  DEV = 'https://invoice-manager-dev.ky-express.com/fms-online-settlement-h5/',
}

/**
 * @description 10 去程单 20 返程单
 */
export enum WaybillFlagType {
  '普通运单' = '10',
  '去程单' = '20',
  '返程单' = '30',
}

// 运单备注， 给司机捎句话 字数
export enum MaxLengthNum {
  '备注最大值' = 150,
  '给司机捎句话最大值' = 150,
}

export enum BatchInitPollingStatus {
  '处理中' = 10,
  '完成' = 20,
}

/**
 * @description 托寄物提示语
 */
export enum ProductInfoTips {
  '不承保' = '10',
  '包装要求' = '20',
  '附加费' = '30',
  '未匹配' = '40',
}

/**
 * @description 危险品管控类型
 */
export enum GoodsDangerType {
  '危险品未签协议弹窗' = 'goodsTypeNotSigned',
  '危险品已签协议弹窗' = 'goodsTypeSigned',
  '禁止运输' = 'trafficLimitation',
}

/**
 * @description 代客下单 有无签署协议
 */
export enum AgreementSignFlagType {
  '未签署' = '20',
  '待更新' = '40',
}
/**
 * @description 代客下单 有无签署协议, 提示文案
 */
export const AgreementSignFlagText: Record<string, string> = {
  '20': `<span>客户未确认代客下单协议，请联系客户确认，<span style="color: #F22517">严禁未签协议代客下单</span></span>`,
  '40': `<span>客户未确认最新代客下单协议，请联系客户确认，<span style="color: #F22517">严禁未签协议代客下单</span></span>`,
}
