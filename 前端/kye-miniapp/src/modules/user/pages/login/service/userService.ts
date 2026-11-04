import Taro from '@tarojs/taro'
import {
  aliAuthorizedLogin,
  wxAuthorizedLogin,
  fetchThirdAutoLogin,
  wechatAutoLogin,
  wxAppLoginAuthorizedLogin,
  wxAppAutoLogin,
  getRegisterGuidePage,
} from '@modules/user/apis/login'
import { getLoginErrorMessageInfo } from '@modules/user/utils'
import { getApplicationListAll } from '@public/utils/application/applicationService'
import aPlus from '@public/utils/aplusConfig'
import { LoginFromType, LoginMode } from '@modules/user/constants'
import { ThirdAuthorizedLoginData } from '@modules/user/apis/login/types'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import useLoginLoading from '@modules/user/pages/login/hooks/useLoginLoading'
import { getUserInfoStorage, setAutoLoginUserCache, setUserCache, clearUserCache } from '@public/storage'
import { useGeneralDataHook } from '@public/storage/hooks/useGeneralDataHook'
import { useSetPreloadInnervalTask } from '@/public/apis/order'
import kyeNavigate from '@public/utils/native/navigate'
import { isAliMiniApp, isH5FSEnv, isPcFSEnv, isWxMiniApp, setSaaAUserId } from '@public/utils'
import { getAuthCode } from '@public/utils'
import { isWeixinAppSync } from '@public/config'
import { useLoginPublicParmas } from '@modules/user/pages/login/components/phone-login/hooks'
import { getLoginFromType } from '@/public/constants'
import { openURL } from '@/modules/webview/utils'
const { setLoginReadyStatus } = useAutoLogin()
import { appPushReLoginMsgPush } from '@public/utils/appPush'
import { resetOpenId } from '@/public/utils/user/getAmapAuthCode'
import { useVersionReport } from '@public/components/business/version-manage-popup/hooks/useVersionReport'
import { RefreshTokenUserInfoResponse } from '@public/apis/user/types'
import { switchCheckLoginLockAuto } from '@public/hooks/useCheckAutoLogin'
import { socket } from '@/public/socket'
import { updateRelaNameSwitch } from '@/public/hooks/useRedirectH5ToNative'
import { buglyLog } from '@/public/appPlugins/bugly'
import { useNewUserActivity } from '@/store/useNewUserActivity'
import { useCardConfigStore } from '@/store/cardConfig'
const { setLoginLoading } = useLoginLoading()
const { reportAppVersionForce } = useVersionReport()

/**
 * 手机号授权登录
 * @param encryptedData
 * @param iv
 * @param errMsg
 * @param code
 * @param errno
 * @param sign
 * @param params
 * @returns {Promise<unknown>}
 */
export const authorization = async ({ encryptedData, iv, sign, code }) => {
  try {
    setLoginLoading(true)
    clearUserCache()
    return await authorizationLogin({ encryptedData, iv, sign, code })
  } catch (e) {
    handleClearLoginLoading()
    const { msg } = getLoginErrorMessageInfo(e)
    Taro.showToast({ title: `${msg || '授权失败，请重新授权或用其他手机号码登录'}`, icon: 'none' })
    aPlus.setNologgedIn()
    // socket.close()
    throw e
  }
}

/**
 * 微信APP一键登录
 * @returns {Promise<HttpResponse<ThirdAuthorizedLoginData>>}
 */
export const appAuthorizedLogin = async (authParams, block = false) => {
  try {
    clearUserCache()
    const { deviceCode, deviceType, systemVersion, version } = useLoginPublicParmas() || {}
    const defaultParams = {
      deviceCode,
      deviceType,
      from: LoginFromType.app,
      authorizedType: 1,
      version,
      systemVersion,
    }
    const params = {
      ...defaultParams,
      ...authParams,
    }
    return await authorizationLogin(params, block)
  } catch (e) {
    handleClearLoginLoading()
    const { msg } = getLoginErrorMessageInfo(e)
    Taro.showToast({ title: `${msg || '授权失败，请重新授权或用其他手机号码登录'}`, icon: 'none' })
    aPlus.setNologgedIn()
    // socket.close()
    throw e
  }
}

/**
 * 授权登录函数（支持支付宝/微信小程序）
 * @param authParams 授权参数
 * @returns 登录结果
 */
const authorizationLogin = async (authParams, block = false) => {
  try {
    const needWxAppAuth = authParams?.from === 2
    const thirdCodeResult = await getAuthCode({ needWxAppAuth })

    if (needWxAppAuth) {
      // 微信app匹配
      const isWeixinApp = isWeixinAppSync()
      if (isWeixinApp && typeof wx?.weixinMiniProgramLogin === 'function') {
        const { deviceType, deviceCode, deviceId } = useLoginPublicParmas()
        return handleWxAppLogin(thirdCodeResult, { ...authParams, deviceType, deviceCode, deviceId }, block)
      }
    }

    if (isAliMiniApp) {
      return handleAliLogin(thirdCodeResult, authParams)
    }

    if (isWxMiniApp) {
      return handleWxLogin(thirdCodeResult, authParams)
    }

    throw new Error('Unsupported platform')
  } catch (error) {
    handleLoginError()
    throw error // 保持错误传播
  }
}

// 支付宝登录处理
const handleAliLogin = async (thirdCode: string, { code, encryptedData, sign, iv }) => {
  const params = {
    thirdCode,
    thirdPhoneCode: code || thirdCode,
    thirdEncryptedData: encryptedData,
    sign,
    iv,
  }

  const res = await aliAuthorizedLogin(params)

  if (res.code === 0 && res.data) {
    handleLoginSuccess(res.data)
    return res.data
  }

  throw new Error(res.msg || '支付宝登录失败')
}

// 微信登录处理
const handleWxLogin = async (wxCode: string, { code, encryptedData, iv }) => {
  const params = {
    wxCode,
    phoneWxCode: code,
    encryptedData,
    iv,
  }

  const res = await wxAuthorizedLogin(params)

  if (res.code === 0 && res.data) {
    handleLoginSuccess(res.data)
    return res.data
  }

  throw new Error(res.msg || '微信登录失败')
}

const handleWxAppLogin = async (wxCode: string, authParam, block = false) => {
  const params = {
    wxCode,
    ...(authParam || {}),
  }
  if (block) {
    throw new Error(params)
  }
  const res = await wxAppLoginAuthorizedLogin(params).catch((e) => {
    console.error(e)
    throw e
  })

  if (res.code === 0 && res.data) {
    handleLoginSuccess(res.data)
    return res.data
  }
  throw new Error(res.msg || '微信登录失败')
}

// 登录成功处理
const handleLoginSuccess = (data: ThirdAuthorizedLoginData) => {
  loginSuccessToast()
  loginSuccess(data as ThirdAuthorizedLoginData)
}

// 授权登录统一错误处理
const handleLoginError = () => {
  aPlus.setNologgedIn()
  // socket.close()
  handleClearLoginLoading()
}

export async function appRefreshToken() {
  const userInfo = await getUserInfoStorage()

  const refreshToken = userInfo?.ecasToken?.refreshToken
  const phone = userInfo?.phone
  console.log('appRefreshToken', refreshToken)
  if (!refreshToken || !phone) {
    throw new Error('自动登录 refreshToken 失败')
  }

  let from = LoginFromType.app
  if (isH5FSEnv) {
    from = LoginFromType.h5_fs
  }

  if (isPcFSEnv) {
    from = LoginFromType.pc_fs
  }
  const params = { ...useLoginPublicParmas(), refreshToken, phone, from: from }
  await wxAppAutoLogin(params).catch(() => {
    // ignore
  })
  return { code: userInfo ? 0 : 10, data: userInfo }
}

export function normalizeLoginData(data) {
  data.headUrl = data.headUrl || getUserInfoStorage()?.headUrl
  data.xcxOpenId = data.xcxOpenId || data.openid
  return data
}

/* 调用自动登录 */
export const handleAutoLogin = async (loginMode: LoginMode | null, autoLoginParams = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const thirdCodeResult = await getAuthCode()
      const params = {
        ...autoLoginParams,
        thirdCode: thirdCodeResult,
        wxCode: thirdCodeResult,
      }
      const autoLoginApi = isWxMiniApp ? wechatAutoLogin : fetchThirdAutoLogin
      const autoLoginTask = isWeixinAppSync() || isH5FSEnv ? appRefreshToken() : autoLoginApi(params)
      return autoLoginTask
        .then((res) => {
          // 登录成功
          if (res.code === 0 && res.data) {
            loginSuccess(normalizeLoginData(res.data))
            resolve(res.data)
            return res.data
          }
        })
        .catch((err) => {
          reject(err)
          // 自动登录失败，拉取轻应用列表
          getApplicationListAll()
          // 自动登录失败，清理QT埋点信息
          aPlus.setNologgedIn()
          // 关闭socket链接
          // socket.close()
        })
        .finally(() => {
          // 是否已执行登录状态记录
          setLoginReadyStatus(true)
        })
    } catch (e) {
      // 自动登录异常抛错
      console.log(e)
      reject(e)
    }
  })
}

/* 关闭授权登录loading */
const handleClearLoginLoading = () => {
  setLoginLoading(false)
  Taro.hideLoading()
}

export const loginSuccessToast = () => {
  handleClearLoginLoading()
  Taro.showToast({ title: '登录成功', icon: 'none' })
}

/**
 * 登录成功-公共回调逻辑
 * @param data
 */
export const loginSuccessCommonHandler = (data: ThirdAuthorizedLoginData) => {
  const { updateGlobalDataFromLogin } = useGeneralDataHook()
  const formatData = normalizeLoginData(data)
  // setUserCache(formatData)
  // 登录信息写入userStore
  updateGlobalDataFromLogin(formatData)
  // 拉取轻应用
  getApplicationListAll()
  // 设置apm + qt
  aPlus.setUserAplus()
  useSetPreloadInnervalTask()
  resetOpenId()
  // app极光消息-重登录
  appPushReLoginMsgPush()
  /* 开启本次登录-不调用用户信息续期接口 */
  switchCheckLoginLockAuto()
  // 写入app加密手机号
  setSaaAUserId(data?.encryptPhone)
  // 创建websocket链接
  // socket.connect()
  buglyLog.setBuglyUserInfoSync(data?.appUserId as string)
  // 获取留资信息
  if (!formatData.isOldCustomer) {
    useNewUserActivity().getNewCustomerInfo(true)
  }
  // 获取开关配置
  updateRelaNameSwitch()
  // 获取查件配置
  setTimeout(() => {
    useCardConfigStore().loadAllConfigs({
      force: true,
    })
  }, 1000)
}
interface LoginSuccessOptions {
  forceClear?: boolean
}
/* 登录成功 */
export const loginSuccess = (data: ThirdAuthorizedLoginData, options: LoginSuccessOptions = {}) => {
  // debugger
  // 切换用户登录/重新登录-清空本地
  if (options?.forceClear) {
    const { clearGlobalUserData } = useGeneralDataHook()
    // 登录前-清空本地用户信息
    clearGlobalUserData()
  }
  const formatData = normalizeLoginData(data)
  // 写入登录成功用户信息
  setUserCache(formatData)
  loginSuccessCommonHandler(formatData)
  // app 登录成功强制上报
  reportAppVersionForce()
}

/* 登录成功返回来源页：页面栈仅登录页时回会员中心tab，否则 navigateBack */
const navigateBackAfterLogin = (delta?: number | string | null) => {
  // 如果是从会员中心跳转过来的
  if (!Taro.getCurrentPages() || Taro.getCurrentPages().length <= 1) {
    return Taro.switchTab({ url: '/layout/pages/mine/index' })
  }
  return Taro.navigateBack({ delta: delta ? +delta : 1 })
}

/* 登录成功默认返回逻辑 */
export const loginSuccessBackDefault = async (
  params: { delta?: number | string | null },
  router: Taro.RouterInfo<Partial<Record<string, string>>> | null = null,
  newRegisterFlag = 0,
) => {
  Taro.hideLoading()

  if (router?.params?.needNewUserGuide) {
    const { data } = await getRegisterGuidePage({
      /* 来源：1：原生，2：H5 */
      source: 1,
      /* 是否新注册用户 0：否，1：是 */
      registerFlag: newRegisterFlag || 0,
    })
    const { deviceCode, deviceType } = useLoginPublicParmas()
    const guidePage = data?.[0]

    if (guidePage) {
      const backPage = router?.params?.backPage || 'my'
      const expressType = router?.params?.express_type || '我的'
      Taro.setStorageSync('is_show_psd_setting_tip', 1)
      const url = `${guidePage.url}?from=${getLoginFromType()}&registerFlag=${newRegisterFlag}&deviceCode=${deviceCode}&deviceType=${deviceType}&backPage=${backPage}&express_type=${expressType}`
      openURL(url, { needLogin: true }, 'redirectTo')
      return
    }
  }
  // 存在指定登录成功跳转事件
  if (kyeNavigate.loginBackFn) {
    kyeNavigate.loginBackCallback()
    // navigateBack 类型回调本身不含跳转，需先返回来源页，再执行回调
    if (kyeNavigate.loginBackType === 'navigateBack') {
      await navigateBackAfterLogin(params.delta)
    }
    return
  }
  // 登录成功后返回上一页
  await navigateBackAfterLogin(params.delta)
}

/**
 * 全局:应用启动续期成功事件回调
 * 检测为已登录状态-登录数据覆写
 * 差异1：token不改变,data无ecasToken
 * 差异2: 版本上报使用节流
 */
export const loggedLoginSuccess = (data: RefreshTokenUserInfoResponse) => {
  const formatData = normalizeLoginData(data)
  // 已登录用户-更新用户信息
  setAutoLoginUserCache(formatData)
  loginSuccessCommonHandler(formatData)
  // // 已在全局登录状态后处理-此处无需调用：app 已登录-续登节流上报
  // reportAppVersionUseThrottle()
}
/* 续期-更新本地用户信息 */
export const loggedUpdateUserInfo = (data: RefreshTokenUserInfoResponse) => {
  const formatData = normalizeLoginData(data)
  const { updateGlobalDataFromLogin } = useGeneralDataHook()
  // 已登录用户-更新用户信息
  setAutoLoginUserCache(formatData)
  updateGlobalDataFromLogin(formatData)
}
