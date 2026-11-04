// 短信验证码类型
export const SMS_CODE_TYPE = Object.freeze({
  LOGIN: 7, // 登录
  FORGET_PASSWORD: 8, // 忘记密码
  RESET_PASSWORD: 9, // 重置密码
  LOG_OFF: 11, // 用户注销
  CHANGE_LOGIN_PHONE: 12, // 切换登录手机号
  CLOSE_LOGIN_MOBILE_SWITCH: 13, // 关闭禁止切换登录账号（可以切换登录）
  OPEN_LOGIN_MOBILE_SWITCH: 14, // 开启禁止切换登录账号（不可以切换登录
  ONE_KEY_LOGOUT_OTHER_DEVICE: 16, // 一键退登其他设备
})

// 风控校验弹窗返回展示弹窗类型
export const VerifyDialogType = Object.freeze({
  DIGITAL_PIC: 1, // 数字图片
  HAS_LOCKED: 2, // 校验被锁定，不需要验证弹窗
  SLIDE_BLOCK: 4, // 腾讯滑块
})

// 接口错误异常码
export const ErrorResultCode = Object.freeze({
  VERIFY_CODE: 264587, // 风控校验码
  CUSTOMER_CODE_ERROR: 60040, // 客户编码错误
})

export const FROM_MODE = {
  2: 'IOS',
  4: '安卓',
  6: '跨越寄件小程序',
  7: 'PC客户端',
}
