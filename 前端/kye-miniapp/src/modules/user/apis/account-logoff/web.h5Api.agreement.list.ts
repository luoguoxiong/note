export interface WebH5ApiAgreementListIn {
  /**
   * 页面编码
   */
  pageCode: string
  /**
   * 协议编码
   */
  agreementCode?: string
}

export type WebH5ApiAgreementListOut = Array<{
  /**
   * 协议名称
   */
  agreementName?: string
  /**
   * 协议编码
   */
  agreementCode?: string
  /**
   * 版本号
   */
  versionNum?: string
  /**
   * 生效时间
   */
  effectiveTime?: number
  /**
   * 发布时间
   */
  publishTime?: number
  /**
   * agreementContent
   */
  agreementContent?: string
  /**
   * 要显示的历史协议
   */
  historyVersionList?: Array<{
    /**
     * 协议名称
     */
    agreementName?: string
    /**
     * 协议编码
     */
    agreementCode?: string
    /**
     * 版本号
     */
    versionNum?: string
    /**
     * 生效时间
     */
    effectiveTime?: string
    /**
     * 发布时间
     */
    publishTime?: string
    /**
     * 协议内容
     */
    agreementContent?: string
  }>
}>
