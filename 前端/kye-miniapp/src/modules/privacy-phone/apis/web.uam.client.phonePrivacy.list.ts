export interface WebUamClientPhonePrivacyListIn {
  /**
   * 10-寄件  20-收件
   */
  sendReceiveType: number
}

export interface WebUamClientPhonePrivacyListOut {
  /**
   * 名单列表
   */
  rosters?: Array<{
    /**
     * 名单id
     */
    id?: string
    /**
     * 对象值
     */
    userTel?: string
    /**
     * 添加类型 10-手动授权添加  20-短信验证添加
     */
    addType?: number
    /**
     * 设置时间
     */
    time?: string
  }>
}
