export interface WebQuerySearchHistoryLimitIn {
  /**
   * 获取的条数
   */
  number?: number
  /**
   * 10 客户端 20 移动端
   */
  clientType: number
  /**
   * 10 移动端查件列表 20 移动端待通知司机取货列表
   */
  mobileType?: number
}

export type WebQuerySearchHistoryLimitOut = Array<{
  /**
   * 当前登录人手机号
   */
  userPhone?: string
  /**
   * 搜索词
   */
  searchKey?: string
  /**
   * 搜索词类型 10-运单号 20-订单号 30-手机号 40-自定义编码
   */
  searchType: string
  /**
   * 搜索来源 10 客户端 20 移动端
   */
  clientType?: string
  /**
   * 移动端搜索来源 10 移动端查件列表 20 移动端待通知司机取货列表
   */
  mobileType?: string
  /**
   * ID
   */
  id?: string
}>
