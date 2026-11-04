export interface WebOrderGetDataDictionaryByCodeIn {
  /**
   * 数据字典编码
   */
  dictionaryCode: string
}

export type WebOrderGetDataDictionaryByCodeOut = Array<{
  /**
   * 编码
   */
  lookupCode?: string
  /**
   * 值
   */
  lookupValue?: string
  /**
   * 提示信息
   */
  promptMessage: string
}>
