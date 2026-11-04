/** 寄收信息字段 code */
export enum SenderReceiverCode {
  /** 寄件城市 */
  DELIVERY_CITY = 'deliveryCity',
  /** 寄件人姓名 */
  DELIVERY_PERSON = 'deliveryPerson',
  /** 寄件公司 */
  DELIVERY_CUSTOMER_NAME = 'deliveryCustomerName',
  /** 运单状态 */
  WAYBILL_STATUS_DESC = 'waybillStatusDesc',
  /** 服务方式 */
  SERVICE_MODE_DESC = 'serviceModeDesc',
  /** 收件城市 */
  PICKUP_CITY = 'pickupCity',
  /** 收件人姓名 */
  PICKUP_PERSON = 'pickupPerson',
  /** 收件公司 */
  PICKUP_CUSTOMER_NAME = 'pickupCustomerName',
}

/** 运单信息字段 code */
export enum WaybillInfoCode {
  /** 签收人 */
  RECEIVER = 'receiver',
  /** 路由信息 */
  NEW_EXTERIOR_ROUTE_INFO = 'newExteriorRouteInfo',
  /** 货好时间 */
  GOODS_TIME = 'goodsTime',
  /** 寄件时间 */
  DELIVERY_TIME = 'deliveryTime',
  /** 签收时间 */
  RECEIVE_TIME = 'receiveTime',
  /** 预计派送时间 */
  FINAL_AGING = 'finalAging',
  /** 创建时间 */
  CREATION_DATE = 'creationDate',
  // 新增部分
  /** 件数 */
  COUNT = 'count',
  /** 实际重量 */
  ACTUAL_WEIGHT = 'actualWeight',
  /** 计费重量/方数 */
  FREIGHT_WEIGHT = 'freightWeight',
  /** 体积 */
  SIZE = 'size',
  /** 托寄物 */
  GOODS_TYPE = 'goodsType',
  /** 回单服务 */
  RECEIPT_FLAG_DESC = 'receiptFlagDesc',
  /** 费用合计 */
  TOTAL_AMOUNT = 'totalAmount',
  /** 付款方式（后端配置/列表接口字段名均为 payModeText） */
  PAY_MODE = 'payModeText',
}

/** 功能按钮 code */
export enum FunctionCode {
  /** 实名认证 */
  CAN_REAL_AUTH = 'canRealAuth',
  /** 去支付 */
  CAN_NEED_PAY = 'canNeedPay',
  /** 催取 */
  CAN_TAKE = 'canTake',
  /** 催派 */
  CAN_DELIVERY = 'canExpediting',
  /** 修改运单 */
  CAN_MODIFY = 'canModify',
  /** 添加/查看展会 */
  CAN_EXHIBITION = 'pickupExhibition',
  /** 取货评价 */
  CAN_EVALUATE_PICKUP = 'addDeliveryScoreFlag',
  /** 派货评价 */
  CAN_EVALUATE_DELIVERY = 'addPickupScoreFlag',
  /** 签收确认 */
  CAN_SIGN_CONFIRM = 'signReceiptConfirm',
  /** 通知收件人 */
  SHARE_FLAG = 'shareFlag',
  /** 取消运单 */
  CAN_CANCEL = 'canCancel',
  /** 运单标签 */
  SHOW_LABEL_FLAG = 'showLabelFlag',
  /** 再来一单 */
  CAN_ANOTHER_ORDER = 'canAnotherOrder',
  /** 打印面单 */
  CAN_PRINT = 'canPrint',
  /** 派货照片 */
  CAN_DELIVERY_PHOTO = 'canShowDispatchPhoto',
  /** 追加子件 */
  CAN_APPEND_CHILDREN = 'appendChildren',
}

/**
 * 动态表头（自定义编码）字段 code 前缀。
 * customCodes（接口下发，每项形如 { codeName, kyField }）转为 CardField 后，
 * code 固定为 `KYFIELD-${kyField}`，卡片渲染时据此识别动态表头字段。
 * 此处为单一数据源，模块侧 constants/cardConfig.ts 做 re-export。
 */
export const CUSTOM_CODE_PREFIX = 'KYFIELD-'
