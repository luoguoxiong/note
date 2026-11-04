import { http } from '@/public/utils/request'
import { HttpOptions } from '@/public/utils/types'

export interface WechatV2MicroprogramGenerateQrCodeIn {
  /**
   * 二维码宽度（单位px）
   */
  width: number
  /**
   * 需要带到页面的参数，长度32位以内
   */
  scene?: string
  /**
   * 跳转地址
   */
  pageUrl?: string
}

export interface WechatV2MicroprogramGenerateQrCodeOut {
  /**
   * base64数据
   */
  base64: string
}

export interface WebQueryWaybillGetBindCustomerVirtualMobileIn {
  /**
   * 小程序参数唯一id
   */
  appletId: number
}

export interface WebQueryWaybillGetBindCustomerVirtualMobileOut {
  /**
   * 虚拟联系手机号
   */
  virtualPhone?: string
}

export interface WebQuestionGetAppletQrcodeParameterIn {
  /**
   * 小程序id
   */
  appletId: number
  /**
   * 小程序md5
   */
  appletMd5: string
}

export interface WebQuestionGetAppletQrcodeParameterOut {
  /**
   * 业务来源（100：tms报关入仓落地页)
   */
  sourceId?: number
  /**
   * 跳转链接地址
   */
  qrCodeUrl?: string
  /**
   * 小程序URL
   */
  appletUrl?: string
  /**
   * 小程序码宽度
   */
  qrCodeWidth?: number
  /**
   * 链接参数
   */
  urlParameter?: Array<{
    /**
     * 参数key值
     */
    key?: string
    /**
     * 参数value值
     */
    value?: string
  }>
}

export const generateQrCode = (params: WechatV2MicroprogramGenerateQrCodeIn) => {
  return http<WechatV2MicroprogramGenerateQrCodeOut>('wechat.v2.microprogram.generateQrCode', params)
}

export const getBindCustomerVirtualMobile = (
  params: WebQueryWaybillGetBindCustomerVirtualMobileIn,
  options: HttpOptions,
) => {
  return http<WebQueryWaybillGetBindCustomerVirtualMobileOut>(
    'web.query.waybill.getBindCustomerVirtualMobile',
    params,
    options,
  )
}

export const getAppletQrcodeParameter = (params: WebQuestionGetAppletQrcodeParameterIn) => {
  return http<WebQuestionGetAppletQrcodeParameterOut>('web.question.getAppletQrcodeParameter', params)
}

export const bindCodeToScanCRMQrcode = (params: WebQuestionGetAppletQrcodeParameterIn) => {
  return http<WebQuestionGetAppletQrcodeParameterOut>('web.question.bindCodeToScanCRMQrcode', params)
}
