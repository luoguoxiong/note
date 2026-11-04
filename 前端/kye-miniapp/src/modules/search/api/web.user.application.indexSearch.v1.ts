export interface ApplicationIndexSearchOut {
  /**
   * 应用集合
   */
  applicationInfoList?: Array<{
    /**
     * 联想词类型 10-运单号 20-订单号 30-手机号 40-自定义编码 50-封装号 60-标签 70-寄件公司 80-收件公司 90-部门 100-应用
     */
    keywordType?: string
    /**
     * 联想词
     */
    keyword?: string
    /**
     * 联想词标识
     */
    keywordCode?: string
    /**
     * 应用描述
     */
    keywordDescription?: string
    /**
     * 意图类型
     */
    intentType?: number
    /**
     * 拓展字段(keywordType=90时，设置部门id)
     */
    extendField?: string
    /**
     * 创建时间
     */
    createDate?: number
    /**
     * menuIcon url路径
     */
    menuIcon?: string
    /**
     * 关键词图标 url
     */
    keywordIconUrl?: string
    /**
     * 加载地址
     */
    loadAddress?: string
    /**
     * 加载路径
     */
    routePath?: string
    /**
     * 推荐类型 1-搜索应用 2-AI识别应用，空则为运单或其他
     */
    recoType?: number
  }>
  /**
   * 运单查询集合
   */
  orderPagination?: {
    /**
     * 记录列表
     */
    rows?: Array<any>
    /**
     * 总记录数
     */
    rowTotal?: number
    /**
     * 总页数
     */
    pageTotal?: number
    /**
     * 搜索行
     */
    startRow?: number
    /**
     * 搜索值
     */
    searchModeEnum?: string
    /**
     * 统计计算对象
     */
    aggregations?: Array<{
      /**
       * 操作人
       */
      operation?: string
      /**
       * 字段
       */
      field?: string
      /**
       * 结果key
       */
      resultKey?: string
      /**
       * 结果值
       */
      resultVal?: object
    }>
    /**
     * 页码
     */
    page?: number
    /**
     * 每页记录数
     */
    pageSize?: number
  }
  visitorRoute?: {
    /** 是否游客 0-否 1-是 */
    visitorFlag: number
    /** 运单号 */
    waybillNumber: string
    /** 订单号 */
    orderNumber: string
    /** 运单状态 0待揽件 10正在安排司机 20司机正在赶来 30司机已到达 40已揽件 50运输中 60派送中 70派送异常 80已签收 90下单成功，请尽快投递 100待通知取货 */
    status: number
    /** tms运单状态 10 待通知取货 20待揽件 30待签收 40 已签收 50 已取消 */
    waybillStatus: number
    /** 用户角色 */
    role: string
    /** 是否是国际件 */
    internationalFlag: boolean
  }
}
