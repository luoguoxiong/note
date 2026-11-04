export interface WebQuerySearchHistorySaveIn {
  /**
   * 搜索词
   */
  searchKey: string
  /**
   * 搜索词类型 10-运单号 20-订单号 30-手机号 40-自定义编码
   */
  searchType: string
  /**
   * 搜索来源 10 客户端 20 移动端
   */
  clientType?: number
  mobileType?: number
}

export type WebQuerySearchHistorySaveOut = number
