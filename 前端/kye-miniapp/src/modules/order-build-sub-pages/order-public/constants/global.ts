/**
 * 全局枚举
 */

/**
 * @description 模块名称
 */
export enum ModuleType {
  'Block' = 'Block', // 前端关注
  'Row' = 'Row', // 前端关注
  'Banner' = 'Banner', // 前端关注
  '寄方信息' = 'Sender',
  '收方信息' = 'Receive',
  '自定义编码' = 'KaCustomerMap',
  '货物信息' = 'ProductInfo',
  '是否裸货旧货' = 'GoodsSupplement',
  '物品保价' = 'ProtectPrice',
  '增值服务' = 'AddedService',
  '优惠券' = 'Coupon',
  '预估费用' = 'EstimatedCost',
  '寄件方式' = 'PickupMode',
  '货好时间' = 'GoodsTime',
  '派货资料' = 'DispatchInformation',
  '取货资料' = 'PickupInformation', // 另一种说法 委托取货
  '服务方式' = 'ServiceMode',
  '付款方式' = 'PayMode',
  '超区派送' = 'OverAreaDelivery',
  '网点自提' = 'BranchSelfPickUp',
  '运单备注' = 'WaybillRemark',
  '给司机捎句话' = 'MessageToDriver',
  '下单成功页' = 'OrderSuccessPage',
  '本人签收' = 'SelfSign',
  '下单公司' = 'OrderCustomer',
  '运单号' = 'WaybillNumber',
  '管控结果' = 'RestrictConfirmList', // deprecated
  '预估运费' = 'EstimatedCost',
  '指定地址数量' = 'ErpAddressCount', // 指定地址数量
  '夜间取货费' = 'NightPickFee',
  '重货物一小时内提示' = 'GoodsTimeOptimi',
  '批量寄下单公司' = 'BatchOrderCustomer',
  '批量寄寄件人组合块' = 'BatchSection',
  '本次寄件信息统一' = 'SendInfoStand',
  '批量寄子运单列表' = 'BatchWaybillList',
  '批量新增收件人' = 'BatchAddReceive',
  '批量单票收件地址' = 'BatchWaybillReceive',
  '需返程' = 'ReturnWaybill',
  '需返程寄收地址' = 'ReturnWaybillAddress',
  '区域属性' = 'AreaAttribute',
  '运单加密' = 'WaybillSpecialEncrypt',
  '货物信息件数编辑' = 'ProductInfoEditable',
  '双倍积分' = 'doubleIntegralInfo',
  '网点自提减免提示' = 'BranchSelfPickUpFence',
  '模板列表' = 'TemplateList',
  '操作状态' = 'BehaviorOption', // 名字待定: 操作状态
  '同步收件信息' = 'AutoSync', // 名字待定: 操作状态
  '更多功能' = 'MoreModule',
  '回单费' = 'ReceiptFee',
}

/**
 * 业务校验配置类型
 */

export enum businessConfigType {
  '付款授权' = 'paymentAuth',
  '实名认证' = 'realNameAuth',
  '取派管控' = 'dispatchControl',
  '托寄物管控' = 'shippingGoodsControl',
  '调价管控' = 'priceAdjustment',
  '报关管控' = 'tariffControl',
  '超区派送' = 'overAreaDelivery',
  '截单专车' = 'interceptOrderCar',
  '保费管控' = 'premiumControl',
  '夜间取货费' = 'nightPickupFee',
  '超长校验' = 'overLength',
  '超重' = 'overWeight',
}

/**
 * 下单校验配置类型
 */
export enum OrderConfigType {
  '预估运费' = 'estimatedShipping',
  '未支付提示' = 'nonPaymentTip',
  '优惠券' = 'coupon',
  '复用发件信息' = 'reuseSendingInfo',
  '下单成功页寄件码' = 'orderSuccessSendingCode',
  'AI下单校验' = 'aiOrderCheck',
  '电子契约条款' = 'electronicContractTerms',
  '唯品会入库号' = 'vipshopWarehouseCode',
  '本人签收' = 'selfSigned',
  '地址推荐' = 'addressRecommend',
  '识别粘贴板' = 'identifyCopyBoard',
  '未绑码提示条' = 'unboundCodeTip',
  '切换客户编码' = 'switchCustomerCode',
  '上次寄件信息展示' = 'showLastSendingInfo',
}

/**
 * @description 返程单标识enum
 */
export enum SwitchEnum {
  'YES' = 20,
  'NO' = 10,
}

/**
 * @description 通用yes or no
 */
export enum YesOrNoNumber {
  'YES' = 10,
  'NO' = 20,
}

/**
 * @description 通用yes or no
 */
export enum YesOrNoString {
  'YES' = '10',
  'NO' = '20',
}

/**
 * @description 数字类型true false
 */
export enum TrueOrFalseNumber {
  'TRUE' = 1,
  'FALSE' = 0,
}

/**
 * @description 前端展示类型
 */
export enum ModuleStyle {
  '平铺' = 'unfold',
  '弹窗' = 'popup',
  '跳转' = 'page',
}

/**
 * @description 字段维护类型
 */
export enum FieldsConfigType {
  '分字段维护' = 'fields',
  '组合维护' = 'combination',
}

/**
 * @description 缺省页类型
 */
export enum EmptyTypeEnum {
  'DATA' = 'data', //无数据
  'COUPON' = 'coupon', //无优惠券
  'ADDRESS' = 'address', //无地址
  'SEARCH' = 'search', //无搜索结果
  'WAYBILL' = 'waybill', //无运单
  'NETWORK' = 'network', //无网络
  'CUSTOM' = 'custom', //自定义
  'TIMEOUT' = 'timeout', // 超时
  'NOPERMISSION' = 'nopermission', // 没有权限
  'INVITE' = 'invite',
}

/**
 * @description 默认appKey
 */
export const DEFAULT_APP_KEY = 55816

/**
 * @description 线上H5 appKey
 */
export const ONLINE_H5_APPKEY = 55262

/**
 * @description 核心API类型，用于区分初始化、过程、保存下单
 */
export enum CoreApiType {
  'PROCESS' = 'process',
  'INIT' = 'init',
  'SAVE' = 'save',
}
export const SOURCEC = '20' //操作来源，移动端

/**
 * @description 页面类型
 */
export enum OrderPageType {
  '单票' = 'order',
  '返程单' = 'order-back',
  '预览' = 'order-preview',
  '批量寄' = 'order-batch',
  '批量寄单票' = 'order-batch-waybill',
}

/**
 * @description 取消运单的来源
 */
export enum CancelOrderSourceType {
  'APP' = '260',
  '小程序' = '350',
  '支付宝小程序' = '660',
  '高德小程序' = '740',
}

/**
 * @description 从返程单返回下单页的的类型
 */
export enum ReturnWaybillBackType {
  '提交' = 'submit',
  '返回' = 'return',
}

/**
 * @description 表单配置来源
 */
export enum OrderScene {
  'order' = '30', // 单票
  'update' = '30', // 修改
  'batchUpdateOne' = '30', // 批量修改单条
  'return' = '30', // 返程单
  'batch' = '40', // 批量
  未知 = '200',
}

/**
 * @description 业务缺省页的状态
 */
export enum EmptyStatusType {
  '扫码活动结束' = '10',
  '默认' = '99999',
}

/**
 * @description 弹框上报的枚举
 */
export enum DialogResultStatusType {
  '确定' = '10',
  '取消' = '20',
  '关闭' = '30',
  '展示' = '40',
}

/**
 * @description 弹框操作枚举
 */
export const dialogStatusMap: { [key: string]: string } = {
  confirm: DialogResultStatusType.确定,
  cancel: DialogResultStatusType.取消,
  show: DialogResultStatusType.展示,
  close: DialogResultStatusType.关闭,
}

export enum ImageBase64 {
  'png' = 'data:image/png;base64,',
  'jpeg' = 'data:image/jpeg;base64,',
}

/**
 * @description 费用类型枚举
 */
export enum FeeTypeEnum {
  保费 = 100,
  回单费 = 200,
  代收货款 = 300,
  木架费 = 400,
  入仓服务费 = 500,
  出仓服务费 = 600,
  资源调价费 = 700,
  等通知派送费 = 750,
  夜间取货费 = 800,
  退仓费 = 900,
  入仓费 = 1000,
  超长费 = 1100,
  超重费 = 1200,
  派送费 = 1300,
  超区费 = 1400,
  派货专车费 = 1500,
  安装费 = 1600,
  拆木架费 = 1700,
  特殊货物附加费 = 1800,
  等通知服务费 = 1900,
  取货自定义费 = 2000,
  派货自定义费 = 2100,
}

/**
 * @description 语音识别状态
 */
export enum AudioStatus {
  未开始 = '10',
  录音中 = '20',
}

/**
 * @description 星期映射
 */
export const WEEK_DAYS: Record<number, string> = {
  0: '周日',
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
}
