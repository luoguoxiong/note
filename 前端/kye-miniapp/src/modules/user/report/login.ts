import { report_EXP_event, report_other_event, report_CLK_event, report_pv_event } from '@public/utils/reportUtil'
import { getEnv, isWxAppEnv } from '@public/utils/device'
import { ENV_TYPE } from '@tarojs/taro'

const loginPageCode = 'page_logon_login'

type LoginTypeValue = '微信登录' | '短信登录' | '密码登录' | '一键登录' | '本机号码一键登录'

interface Other_login_loginin {
  login_type: LoginTypeValue
  login_source?: '跨越寄件小程序' | '跨越速运APP' | '支付宝小程序'
  request_result?: string
  failure_reason?: string
  mobile_number?: string
}

const login_source_map = {
  [ENV_TYPE.ALIPAY]: '支付宝小程序',
  [ENV_TYPE.WEAPP]: '跨越寄件小程序',
}

const getLoginSource = () => {
  if (isWxAppEnv) return '跨越速运APP'

  return login_source_map[getEnv()]
}

export const reportLoginUv = () => {
  report_pv_event(loginPageCode)
}

/* 登录_提交登录 - 自定义埋点*/
export const report_other_login_loginin = (params: Other_login_loginin) => {
  report_other_event('other_login_loginin', {
    page_code: loginPageCode,
    login_source: getLoginSource(),
    ...params,
  })
}

/* 一键登录页页面曝光事件 */
export const report_EXP_page_logon_login = () => {
  report_EXP_event('page_logon_login')
  report_EXP_event('page_logon_login_v1') // 新的登录页面曝光事件
}

export const report_clk_logon_login_other_button = (params: Other_login_loginin) => {
  report_CLK_event('clk_logon_login_other_button', {
    page_code: loginPageCode,
    login_source: getLoginSource(),
    ...params,
  })
}

/* 登录_获取掩码 - 自定义埋点*/
export const report_other_login_get_phone = (params: Other_login_loginin) => {
  report_other_event('other_login_get_phone', {
    page_code: loginPageCode,
    login_source: getLoginSource(),
    ...params,
  })
}
