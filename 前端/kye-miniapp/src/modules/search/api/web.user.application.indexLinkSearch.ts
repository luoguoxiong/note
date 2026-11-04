export interface WebUserApplicationIndexLinkSearchIn {
  /**
   * 关键词
   */
  keyword?: string
  /**
   * 每页记录数
   */
  pageSize?: string
  /**
   * 搜索来源 10 客户端 20 移动端
   */
  clientType?: string
  /**
   * 客户端搜索来源 10 客户端查件列表 20 客户端查看运单资料列表
   */
  clientSearchType?: string
  /**
   * 渠道编码：ios / android / wechatApplet / alipayMini（高德小程序与支付宝小程序一致）
   */
  channelCode?: string
}

export type WebUserApplicationIndexLinkSearchOut = Array<{
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
   * 联想词名称
   */
  keywordName?: string
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
