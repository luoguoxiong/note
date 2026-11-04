export const SMS_CODE_TYPE = Object.freeze({
  LOGIN: 7, // 登录
  FORGET_PASSWORD: 8, // 忘记密码
  RESET_PASSWORD: 9, // 重置密码
  LOG_OFF: 11, // 用户注销
  CHANGE_LOGIN_PHONE: 12, // 切换登录手机号
  CLOSE_LOGIN_MOBILE_SWITCH: 13, // 关闭禁止切换登录账号（可以切换登录）
  OPEN_LOGIN_MOBILE_SWITCH: 14, // 开启禁止切换登录账号（不可以切换登录
})

export const AGREEMENT_ID = Object.freeze({
  LOG_OFF: '185', // 用户注销
})
