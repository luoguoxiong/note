export interface WebQuerySearchHistoryDeleteIn {
  /**
   * 是否删除所有 1-是 2-否
   */
  isAll?: number
  /**
   * 10 客户端 20 移动端
   */
  clientType?: number
  /**
   * 10 移动端查件列表 20 移动端待通知司机取货列表
   */
  mobileType?: number
  id?: string
}

export type WebQuerySearchHistoryDeleteOut = boolean
