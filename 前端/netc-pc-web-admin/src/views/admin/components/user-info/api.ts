/**
 * 用户信息组件 API
 * 来源: netc-pc-web/src/services/api/login.js loginOut
 */
import dayjs from 'dayjs'
import { http } from '@/utils/request/request'
import { getToken } from '@/utils/auth'
import envData from '@/utils/env'
import { encryptPhone } from './utils/crypto'
import { LoginSource } from './constants'
import type { HttpResponse } from '@/utils/types'

export type LegacyResponse<T = any> = HttpResponse<T> & Record<string, any>

/** 转换设备时间戳(老 utils/commonUtil.formatPcDeviceStamp) */
const formatPcDeviceStamp = () => {
  const date = new Date()
  const yearAndDate = dayjs(date).format('YYYYMMDD')
  const timestamp = String(date.getTime()).slice(-8)
  return `PC-${yearAndDate}${timestamp}`
}

/** 网页自定义设备类型(老 utils/commonUtil.generatePcDeviceType, 壳内设备品牌/型号分支由壳侧扩展) */
const generatePcDeviceType = () => {
  let pcDeviceType = localStorage.getItem('PC_DEVICE_TYPE')
  if (!pcDeviceType) {
    pcDeviceType = formatPcDeviceStamp()
    localStorage.setItem('PC_DEVICE_TYPE', pcDeviceType)
  }
  return pcDeviceType
}

/** 退出登录 web.login.logout */
export const loginOutApi = () => {
  return http<null>(
    'web.login.logout',
    {
      accessToken: getToken(),
      from: envData.APP_FROM_ID,
      deviceType: generatePcDeviceType(),
    },
    {
      retryCount: 0,
      // 主动退登豁免：token 已失效时本接口会返回失效码，若照常触发退登检查会再弹
      // 「登录已失效」框，与 userLogOut 的刷新动作打架（老基座 loginOut 同口径）
      ignoreLogOutCheck: true,
    }
  ) as Promise<LegacyResponse<null>>
}

// ==================== 切换登录手机号 ====================
// (来源: netc-pc-web/src/services/module/user.js)
// 老请求层 errorMode:'silent' -> toast:false, 错误码由业务层处理;
// 老请求层 captcha:'captcha' -> 请求头 x-risk-version: captcha(风控协议: 带此头后端返回 264587+风控data, 前端弹图形/滑块验证码)

/** 风控协议头(老请求层 captcha:'captcha' 等价实现) */
const RISK_VERIFY_HEADERS = { 'x-risk-version': 'captcha' }

/** 切换登录手机号 web.login.switchLogin */
export const switchLoginApi = (params: Record<string, any>) => {
  return http<Record<string, any>>('web.login.switchLogin', params, {
    // retryCount: 0,
    toast: false,
    headers: RISK_VERIFY_HEADERS,
  }) as Promise<LegacyResponse<Record<string, any>>>
}

/** 发送短信验证码 web.login.verification.sendSmsCode(手机号 AES 加密后以 phoneCipher 传输, params.phone 必传) */
export const sendSmsCodeApi = async (params: Record<string, any>) => {
  return http<null>(
    'web.login.verification.sendSmsCode',
    { from: envData.APP_FROM_ID, ...params, phoneCipher: await encryptPhone(params.phone || '') },
    { toast: false, headers: RISK_VERIFY_HEADERS }
  ) as Promise<LegacyResponse<null>>
}

/** 校验短信验证码 web.login.verification.checkSmsCode */
export const checkSmsCodeApi = (params: Record<string, any>) => {
  return http<null>(
    'web.login.verification.checkSmsCode',
    { from: envData.APP_FROM_ID, ...params },
    {
      // retryCount: 0,
      toast: false,
      headers: RISK_VERIFY_HEADERS,
    }
  ) as Promise<LegacyResponse<null>>
}

/** 校验用户切换登录状态 web.login.switch.checkSwitchFlag */
export const checkSwitchFlagApi = (params: Record<string, any>) => {
  return http<null>('web.login.switch.checkSwitchFlag', params, {
    // retryCount: 0,
    toast: false,
  } as any) as Promise<LegacyResponse<null>>
}

/** 校验手机号关联绑定列表 web.user.sso.check.bindList */
export const checkBindListApi = (params: Record<string, any>) => {
  return http<null>('web.user.sso.check.bindList', params, {
    // retryCount: 0,
    toast: false,
  } as any) as Promise<LegacyResponse<null>>
}

/** 协议内容 web.h5Api.agreement.list(无需登录态) */
export const agreementListApi = (params: Record<string, any>) => {
  return http<Array<Record<string, any>>>('web.h5Api.agreement.list', params, {
    // retryCount: 0,
    toast: false,
  } as any) as Promise<LegacyResponse<Array<Record<string, any>>>>
}

// ==================== 切换客户手机号(白名单) ====================
// (来源: netc-pc-web/src/services/api/login.js changeAccount/changeBack)
// 迁移说明: 老 getPhone() 读 sessionStorage PHONE(切换登录手机号成功链路写入), 兜底 LOGIN_DATA.phone
// (stores/user.ts 登录态初始化时必写); from 对齐老基座硬编码 '7', 统一取 LoginSource.PC_WEB

/** 老基座登录缓存(sessionStorage LOGIN_DATA, 与 hooks/useUserInfo getLoginData 同实现; api 层独立定义避免与 hooks 循环依赖) */
const getLoginData = (): Record<string, any> => {
  try {
    return JSON.parse(sessionStorage.getItem('LOGIN_DATA') || '{}') || {}
  } catch (e) {
    return {}
  }
}

/** 切换客户手机号(白名单) web.ssoChangeAccount.login, 返回 data 即完整登录态(phone/ecasToken/customerCode/customerShortName...) */
export const changeAccountApi = (borrowTelNo: string) => {
  const phone = sessionStorage.getItem('PHONE') || getLoginData().phone || ''
  return http<Record<string, any>>(
    'web.ssoChangeAccount.login',
    {
      loginRequest: {
        phone,
        checkFlag: '10',
        imgCaptcha: '',
        password: '',
        from: LoginSource.PC_WEB,
      },
      borrowTelNo,
      from: LoginSource.PC_WEB,
    },
    {
      // retryCount: 0,
      toast: false,
    } as any
  ) as Promise<LegacyResponse<Record<string, any>>>
}

/** 白名单一键切回 web.ssoChangeAccount.changeBack(返回 data = { phone, userLoginInfoResponse, allowCheckFlag, userStatus }) */
export const changeBackApi = () => {
  return http<Record<string, any>>('web.ssoChangeAccount.changeBack', { from: LoginSource.PC_WEB }, {
    // retryCount: 0,
    toast: false,
  } as any) as Promise<LegacyResponse<Record<string, any>>>
}
