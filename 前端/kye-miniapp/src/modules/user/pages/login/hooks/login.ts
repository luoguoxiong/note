import Taro, { useRouter } from '@tarojs/taro'
import aPlus from '@/public/utils/aplusConfig'
import useLoginLoading from './useLoginLoading'
import { getEnvConfig } from '@/public/config'
import { useLoginPublicParmas } from '../components/phone-login/hooks'
import {
  aliAuthorizedLogin,
  wxAppLoginAuthorizedLogin,
  wxAuthorizedLogin,
  appLoginAuthorizedLogin,
} from '@/modules/user/apis/login'
import { useGeneralDataHook } from '@/public/storage/hooks/useGeneralDataHook'
import { clearUserCache, setUserCache } from '@/public/storage'
import { getApplicationListAll, loginSuccessBackDefault } from '../service'
import { useSetPreloadInnervalTask } from '@/public/apis/order'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { usePhoneMask } from '@/public/hooks/usePhoneMask'
import { report_other_login_loginin } from '@modules/user/report/login'

import { ThirdAuthorizedLoginData } from '@/modules/user/apis/login/types'
import { getAuthCode, setSaaAUserId } from '@/public/utils'
import { promisify } from '@/public/utils/taroApiPromises'
import { useVersionReport } from '@public/components/business/version-manage-popup/hooks/useVersionReport'
import { switchCheckLoginLockAuto } from '@public/hooks/useCheckAutoLogin'
import { useUserGlobalStore } from '@/store/user'
import { socket } from '@/public/socket'
import { updateRelaNameSwitch } from '@/public/hooks/useRedirectH5ToNative'
const { reportAppVersionForce } = useVersionReport()

export async function ensureWechatInstalled() {
  try {
    const res = await promisify<{ errMsg: string; hasWechatInstall: boolean }, undefined>(wx.miniapp.hasWechatInstall)(
      undefined,
    )
    return res.hasWechatInstall
  } catch {
    return false
  }
}

export type QuickLoginPayload =
  | { type: 'miniApp' }
  | {
      type: 'miniprogram' | 'alipay'
      params: { encryptedData: string; iv?: string; errMsg: string; code: string; errno: string; sign: string }
    }
  | { type: 'amap' }

export function useLogin() {
  const { fetchGlobalData, updateGlobalDataFromLogin } = useGeneralDataHook()
  const { clearGlobalAutoLoginPromise } = useAutoLogin()
  const { startLoginLoading, clearLoginLoading } = useLoginLoading()
  const router = useRouter()

  const { deviceType, deviceCode, deviceId, systemVersion, version } = useLoginPublicParmas()

  const quickLoginRequest = async (payload: QuickLoginPayload, wxCode: string) => {
    console.info('😁 app login code', wxCode)
    const config = getEnvConfig()
    const commonParams = { from: config.from, deviceType, deviceId, deviceCode, systemVersion, version }

    // app 登录
    if (payload.type === 'miniApp') {
      return wxAppLoginAuthorizedLogin({ ...commonParams, wxCode, authorizedType: 1 })
    } else if (payload.type === 'alipay') {
      const { encryptedData, iv, code, sign } = payload.params
      const params = {
        thirdCode: wxCode,
        thirdPhoneCode: code || wxCode,
        thirdEncryptedData: encryptedData,
        sign,
        iv,
      }
      return aliAuthorizedLogin(Object.assign(params, commonParams))
    } else if (payload.type === 'amap') {
      // 高德一键登录
      const authCode = await getAuthCode()
      return aliAuthorizedLogin({ ...commonParams, thirdCode: authCode })
    }

    // 处理微信小程序登录
    const { encryptedData, iv, code } = payload.params
    const params = {
      wxCode,
      phoneWxCode: code,
      encryptedData,
      iv,
    }
    return await wxAuthorizedLogin(Object.assign(params, commonParams))
  }

  const quickLogin = async (payload: QuickLoginPayload) => {
    // 判断是否安装微信客户端
    if (payload.type === 'miniApp') {
      const hasWechatInstall = await ensureWechatInstalled()
      if (!hasWechatInstall) {
        clearLoginLoading()
        Taro.hideLoading()

        setTimeout(() => {
          Taro.showToast({ title: '您尚未安装微信客户端', icon: 'none' })
        }, 100)

        throw new Error('您尚未安装微信客户端')
      }
    }

    startLoginLoading()
    clearUserCache()
    const delta = Number(router?.params?.delta) || 1
    const deltaQuery = `&delta=${delta}`

    try {
      const wxCode = await getAuthCode({ needWxAppAuth: true })
      const loginData = await quickLoginRequest(payload, wxCode)
      console.info('😁 loginData', loginData)
      // @ts-ignore
      if (!loginData.data.bindFlag && payload.type === 'miniApp') {
        // @ts-ignore
        const phone = loginData.data.appletLoginPhone
        const redirectUrl = phone
          ? '/modules/user/pages/bind-phone/index?phone=' + phone + '&wxCode=' + wxCode + deltaQuery
          : '/modules/user/pages/change-phone/index?' + 'wxCode=' + wxCode + deltaQuery

        console.info('😁 redirectTo', redirectUrl)

        Taro.redirectTo({
          // @ts-ignore
          url: redirectUrl,
        })
      } else {
        successHandler(loginData.data)
        successNavigateBack(loginData.data)
        report_other_login_loginin({
          login_type: payload.type === 'miniApp' ? '微信登录' : '一键登录',
          request_result: '成功',
        })
      }
    } catch (e) {
      report_other_login_loginin({
        login_type: payload.type === 'miniApp' ? '微信登录' : '一键登录',
        request_result: '失败',
        failure_reason: e.msg || '登录失败',
      })
      failHandler(e)
      throw e
    } finally {
      clearLoginLoading()
      Taro.hideLoading()
    }
  }

  const selfPhoneLogin = async (wxCode) => {
    const config = getEnvConfig()
    const { setPhoneMask } = usePhoneMask()
    startLoginLoading()
    clearUserCache()

    console.log('請求接口之前', {
      from: +config.from,
      deviceType,
      deviceCode,
      systemVersion,
      version,
      wxCode,
    })
    try {
      const loginData = await appLoginAuthorizedLogin({
        from: +config.from,
        deviceType,
        deviceCode,
        systemVersion,
        deviceId,
        version,
        wxCode,
      })
      console.info('😁 loginData', loginData)
      // @ts-ignore
      successHandler(loginData.data)
      successNavigateBack(loginData.data)
      Taro.setStorage({ key: 'LAST_LOGIN_PAGE_TYPE', data: 'self' })
      report_other_login_loginin({
        login_type: '本机号码一键登录',
        request_result: '成功',
        mobile_number: loginData.data?.encryptPhone,
      })
    } catch (e) {
      console.info('😁 錯誤', e)
      report_other_login_loginin({
        login_type: '本机号码一键登录',
        request_result: '失败',
        failure_reason: e.msg || '登录失败',
      })
      failHandler(e)
      setPhoneMask(true)
      throw e
    } finally {
      clearLoginLoading()
      Taro.hideLoading()
    }
  }
  const globalUserStore = useUserGlobalStore()

  const successHandler = (data: ThirdAuthorizedLoginData) => {
    console.log('successHandler>>>', data)
    switchCheckLoginLockAuto()
    setUserCache(data)
    // 拉取轻应用
    getApplicationListAll()
    /*    // 拉取通用数据
    fetchGlobalData()*/
    // 登录信息写入userStore
    updateGlobalDataFromLogin(data)
    useSetPreloadInnervalTask()
    if (data.openid || data.xcxOpenId) {
      globalUserStore.setOpenId(data.openid || data.xcxOpenId)
    }
    // 设置apm
    aPlus.setUserAplus()

    setTimeout(() => {
      Taro.showToast({ title: '登录成功', icon: 'none' })
    })
    // app 登录成功强制上报
    reportAppVersionForce()
    // 写入app加密手机号
    setSaaAUserId(data?.encryptPhone)
    // socket.connect()
    updateRelaNameSwitch()
  }
  const successNavigateBack = (data?: ThirdAuthorizedLoginData) => {
    const delta = Taro.getCurrentInstance()?.router?.params?.delta
    loginSuccessBackDefault({ delta }, router, data?.newRegisterFlag || 0)
  }

  const failHandler = (e) => {
    aPlus.setNologgedIn()
    // socket.close()
    setTimeout(() => {
      Taro.showToast({ title: e.msg || '登录失败', icon: 'none' })
    })
  }

  return {
    quickLoginRequest,
    quickLogin,
    selfPhoneLogin,
    successHandler,
    successNavigateBack,
    failHandler,
  }
}
