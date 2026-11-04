export interface WebQueryScoreGetIn {
  /**
   * 运单号
   */
  waybillNumber?: string
  /**
   * 订单号
   */
  orderNumber?: string
}

export interface WebQueryScoreGetOut {
  /**
   * 备注
   */
  remark?: string
  /**
   * 评分值
   */
  score?: number
  /**
   * 标签值
   */
  msgFlag?: string
  /**
   * 能否修改
   */
  canModify?: string
  /**
   * 运单号
   */
  waybillNumber?: string
  /**
   * 订单号
   */
  orderNumber?: string
  /**
   * 评价类型 0-取货评价 1-派货评价
   */
  evaluationType?: number
  /**
   * 签收时间
   */
  receiveTime?: string
  /**
   * 报单时间
   */
  deliveryTime?: string
}
