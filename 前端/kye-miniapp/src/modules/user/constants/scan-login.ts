export const SCAN_PAGE_TYPE = {
  // 扫码登录
  LOGIN: '10',
  // 绑码
  BIND: '20',
}

// 二维码状态，1：已扫码，2：已授权，3：已取消，4：已返回已授权，5：登陆完成，6：扫码异常，7：已绑定，8：已过期
export const SCAN_CODE_STATUS = {
  QR_DEFAULT: 0,
  QR_SCANNED: 1,
  QR_AUTHORIZED: 2,
  QR_CANCELLED: 3,
  QR_RETURNED_AUTHORIZED: 4,
  QR_LOGIN_COMPLETED: 5,
  QR_SCAN_EXCEPTION: 6,
  QR_BOUND: 7,
  QR_EXPIRED: 8,
}
