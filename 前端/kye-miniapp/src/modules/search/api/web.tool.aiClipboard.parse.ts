export interface AiClipboardParseIn {
  /**
   * 剪切板内容
   */
  content: string
  /**
   * 来源 10: 查件列表搜素; 20: 首页搜素栏搜索
   */
  source: number
}

export interface AiClipboardParseOut {
  /**
   * 不再提醒天数
   */
  noRemindDays: number
  /**
   * 不再提醒天数文案
   */
  noRemindDesc: string
  /**
   * 解析的结果数组
   */
  parsedItems: Array<{
    /**
     * 识别内容
     */
    content: string
    /**
     * 类型, 10: 运单号; 20: 城市; 30: 公司; 40: 联系人; 50: 托寄物
     */
    type: number
    /**
     * 类型描述
     */
    typeDesc: string
  }>
  /**
   * 是否开启粘贴板解析功能开关
   */
  enabled: boolean
}
