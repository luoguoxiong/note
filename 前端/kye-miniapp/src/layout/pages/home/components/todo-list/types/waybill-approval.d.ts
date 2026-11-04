export type WaybillApproval = {
  /**
   * 运单审批ID
   */
  id?: number
  /**
   * 运单号
   */
  waybillNumber?: string
  /**
   * 寄件城市
   */
  sendCity?: string
  /**
   * 收件城市
   */
  receiveCity?: string
  /**
   * 寄件人名称
   */
  sendName?: string
  /**
   * 收件人名称
   */
  receiveName?: string
  /**
   * 寄件公司
   */
  sendCustomer?: string
  /**
   * 收件公司
   */
  receiveCustomer?: string
  /**
   * 服务方式
   */
  serviceMode?: string
  /**
   * 货好时间
   */
  goodTime?: string
  /**
   * 估计费用
   */
  forecastCost?: string
  /**
   * 下单人名称
   */
  placeOrderName?: string
  /**
   * 下单人电话
   */
  placeOrderPhone?: string
  /**
   * 查看更多跳链
   */
  viewMoreUrl?: string
  /**
   * 同意跳链
   */
  agreeUrl?: string
  /**
   * 拒绝跳链
   */
  rejectUrl?: string
  /**
   * 详情跳链
   */
  detailsUrl?: string
  /**
   * 是否展示预估费用
   */
  disPlayForecastCost?: boolean

  // @TODO 后续确认下
  departmentName?: string
}
