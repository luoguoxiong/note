export interface WebQueryWaybillQueryDriverContainOutIn {
  /**
   * 单号（type=0时为下单编码，type=1时为运单号）
   */
  number: string
  /**
   * 类型（0：取货评价，1：派货评价）
   */
  type: string
  /**
   * 登录手机号
   */
  phone?: string
  /**
   * type=0时，入参加运单号（waybillNumber）
   */
  waybillNumber?: string
}

export interface WebQueryWaybillQueryDriverContainOutOut {
  /**
   * 工号
   */
  employeeNumber?: string
  /**
   * 名称
   */
  driverName?: string
  /**
   * 头像
   */
  driverImage?: string
  /**
   * 司机类型：0.公司内部司机，1.外部司机
   */
  driverType?: string
  /**
   * 电话
   */
  tel?: string
  /**
   * 加密手机号信息
   */
  decodePhoneInfo?: string
  /**
   * 车牌号
   */
  carNumber?: string
  /**
   * 距离较近
   */
  shotDistance?: number
}
