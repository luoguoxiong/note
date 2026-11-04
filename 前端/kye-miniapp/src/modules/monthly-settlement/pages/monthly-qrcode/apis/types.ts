/**
 * 扫码转月结 - 月结二维码状态枚举
 * 单接口契约：web.user.fmsSettlement.getQRCode，见 docs/adr/0001-monthly-qrcode-single-api-contract.md
 * 内部员工不在此枚举内：进入页面时单独调 web.customer.isEmployee 判断
 */
export enum MonthlyQrcodeStatus {
  /** 成功（返回 qrCodeUrl） */
  Success = 0,
  /** 客户状态异常（已回收/不存在/已报废/被拉黑） */
  CustomerAbnormal = 2,
  /** 非月结客户 */
  NotMonthlySettlement = 3,
  /** 无转月结权限 */
  NoPermission = 4,
  /** 二维码获取失败 */
  QrcodeFail = 5,
}

export interface MonthlyQrcodeData {
  /** 状态码：0=成功，2=客户状态异常，3=非月结客户，4=无权限，5=二维码获取失败（兼容字符串） */
  status: number | string
  /** 二维码图片地址（status=0 时返回） */
  qrCodeUrl?: string
  /** 生成时间（status=0 时返回，毫秒时间戳） */
  generationDate: number
  /** 过期时间（status=0 时返回，毫秒时间戳），有效期展示与自动刷新均以此为准 */
  expirationDate: number
  /** 异常提示文案（status!=0 时返回，后端已拼好脱敏主授权号等完整文案） */
  statusDesc?: string
}
