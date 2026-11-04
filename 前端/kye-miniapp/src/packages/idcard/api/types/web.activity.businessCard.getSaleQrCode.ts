interface GetSaleQrCodeRequest {
  /** 名片code */
  code: string
}

interface GetSaleQrCodeResponse {
  /** 状态码 */
  code: number
  /** 错误描述 */
  msg: string
  /** 数据对象 */
  data: GetSaleQrCodeResponseData
}

interface GetSaleQrCodeResponseData {
  /** 销售企微二维码url */
  qrCodeUrl: string
}
