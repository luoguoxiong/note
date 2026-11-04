/**
 * 初始化相关
 */

/**
 * @description 下单准入校验枚举
 */
export enum CheckBeforeEnterType {
  '账号准入' = 'mobileScrap',
  '实名认证' = 'realName',
  '未绑码' = 'noCustomerCode',
  '未支付' = 'noPay',
  '识别粘贴板' = 'tellClipBoard',
  '地址推荐' = 'addressSuggest',
  '复用上次信息' = 'lastInfo',
  '切换配置' = 'switchConfig',
  '切换配置不跳转' = 'autoSkipConfigFlag',
  '下单权限' = 'approval',
  '当天达延误' = 'servMdDly',
  '跳转整车' = 'overWeight',
  '货好时间' = 'goodsTime',
  '付款授权' = 'payAuthorizeConfirm',
  '寄收地址一致' = 'receiveSendAddressSame',
  '收件超区' = 'overArea',
  '付款方式' = 'payModeLimit',
  '大票货' = 'bulkCargoConfirm',
  '下单失败' = 'duplicateWaybillNumber',
  '收件地址已下单' = 'tmsRepeatWaybillConfirm',
  '活动提醒' = 'activityTime',
  '托寄物告知' = 'goodsTypeInform',
  '危险品如实申报' = 'truthfullyDeclare',
  '禁止内部员工下单' = 'internalEmployee',
  '付款方式校验' = 'paymentAccountConfirm',
  '保费校验' = 'insuranceLimit',
}

/**
 * @description 提交下单管控类型
 */
export enum CheckAfterSubmitType {
  '取派管控' = 'addressRestrict',
  '调价' = 'adjustPrice',
  '报关入仓' = 'orderWarehouseIn',
  '报关出仓' = 'orderWarehouseOut',
  '截单专车' = 'cutoffCar',
  '托寄物' = 'goodsRestrict',
  '投保管控' = 'insuranceRestrict',
  '报关出入仓' = 'clearanceWarehouse',
  '货好时间' = 'goodsTime',
  '危险品管控' = 'goodsDangerRestrict',
}

/**
 * @description 下单准入管控的展示类型
 */
export enum CheckBeforeEnterShowType {
  DIALOG = 1, // 弹窗
  BAR = 2, //未绑码提示条
}

/**
 * @description 当前用户角色
 */
export enum CurrentUserRole {
  MAIN_AUTH = '10', //主授权
  ADMIN = '20', //管理员
  NORMAL_USER = '30', //普通人员
}

/**
 * @description 实名认证客户类型
 */
export enum AuthCustomerType {
  PERSONAL = 0, //个人
  companyName = 1, //企业
}

/**
 * @description 认证状态
 */
export enum AuthFlag {
  YES = 10, //是
  NO = 20, //否
  IMAGE_NOT_FULL = 30, //已认证，但图片不完整
}

/**
 * @description 客户信息客户类型
 */
export enum CustomerType {
  '跨越' = '10',
  '加盟商' = '20',
}

/**
 * @description 仓库类型 crm_value_add_warehouse_to
 */
export enum OtherWarehouseType {
  '京东' = '10',
  '菜鸟' = '20',
  '苏宁' = '30',
  '盒马' = '40',
  '到其它' = '50',
}

/**
 * @description 是否能自动下单 10.能，20.不能
 */
export enum CanAutoAddOrder {
  YES = '10',
  NO = '20',
}

/**
 * @description 是否冻结(crm_freeze_yes)。10-已冻结 20-无
 */
export enum FreezeFlag {
  YES = '10',
  NO = '20',
}

/**
 * @description 终端 10移动端，20客户端
 */
export enum Terminal {
  'MOBILE' = '10',
  'CLIENT' = '20',
}

/**
 * @description 下单来源 10 单票 20批量
 */
export enum OrderSource {
  'SINGLE' = '10', // 单票
  'BATCH' = '20', // 批量
}

/**
 * @description 下单渠道 10.快速寄件，20.扫二维码下单，30.扫项目编码下单，40.扫活动码下单,50再来一单，60.修改运单 70.退出活动 80.立即前往 90.返程单 140.批量立即前往 210.撤展下单 220.来展下单
 */
export enum Channel {
  '快速寄件' = '10',
  '扫二维码下单' = '20',
  '扫项目编码下单' = '30',
  '扫活动码下单' = '40',
  '再来一单' = '50',
  '修改运单' = '60',
  '退出活动' = '70',
  '立即前往' = '80',
  '返程单' = '90',
  '批量寄' = '100',
  '批量退出活动' = '130',
  '批量立即前往' = '140',
  '批量扫二维码' = '150',
  '运单审核' = '160',
  '调价审核' = '170',
  '托寄物审核' = '180',
  '邀请寄' = '190',
  '撤展下单' = '210',
  '来展下单' = '220',
}

/**
 * @description 保费类型
 */
export enum PremiumType {
  'DEFAULT' = 10, //默认保费
  'BASIC' = 20, //基础保费(强制保费)
  'DECLARE' = 30, // 声明价值保费
  'BY_THE_PIECE' = 40, //按件投保
  'SELF' = 50, //自保保费
}

/**
 * @description 地址显示状态枚举 name: 仅显示地址名称 | detail: 详细地址 | all: 显示全部
 */
export enum AddressVisibleType {
  'ALL' = 'all',
  'DETAIL' = 'detail',
  'NAME' = 'name',
}

/**
 * @description // 货好时间类型  online: 按线上逻辑 | custom: 自定义时间
 */
export enum GoodsTimeType {
  'ONLINE' = 'online',
  'CUSTOM' = 'custom',
}

/**
 * @description 货好时间默认填充类型  无需货好:noGoodsTime | 当前时间:currentTime | 1小时后:oneHours
 */
export enum DefaultGoodsTime {
  'NO_GOODS_TIME' = 'noGoodsTime',
  'CURRENT_TIME' = 'currentTime',
  'ONE_HOURS' = 'oneHours',
}

/**
 * @description 服务方式缺失逻辑处理 按八大服务方式: 10 | 按后台: 20 | 按取派线路: 30 | 不可下单: 40
 */
export enum ServiceModeIntersectionEmpty {
  'EIGHT' = '10',
  'BACKEND' = '20',
  'DISPATCH_LINE' = '30',
  'NO_ORDER' = '40',
}

/**
 * @description 校验接口是否缓存
 */
export enum processCacheStrategy {
  '强制缓存' = 10,
  '强制不缓存' = 20,
  '遵循默认逻辑' = 30,
}

export enum InitOrderStatus {
  'READY' = '10',
  'FAILED' = '20',
  'BEGIN' = '30',
}

export enum InitPageName {
  '地址簿' = 'address-book',
  '网点查询' = 'networkQueryAddress',
}

export enum ErrorCode {
  '运单已删除' = -404,
  '暂无数据' = 351976,
  '非下单人身份' = 351977,
  '已下单成功' = 351978,
}
