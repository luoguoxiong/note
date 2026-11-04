/**
 * @Desc: app 消息极光推送
 * @Date: 2025/8/13
 */
import { ApiGetRoutePathByChannel, ApiReLoginMsgPush } from '@public/apis/push'
import { isWeixinAppSync } from '@public/config'
import { AppPlugin } from '@public/appPlugins'
import { usePlatformStore } from '@/store/platform'
import { getUserPhoneStorage, setStorageSyncPure } from '@public/storage'
import { pushMessageHandler } from '@public/utils/appPush/messageHandler'
import { debounce } from 'lodash-es'

type ApiReLoginMsgPushParams = {
  phone: string
  jpushrid: string // 极光用户id
}

let hasMessageHandler = false // 是否启用极光消息监听

/* 获取极光SDK初始化配置 */
const getPushInitParams = () => {
  console.log('getPushInitParams', process.env.TARO_APP_PUSH_APPKEY, process.env.TARO_APP_ENV === 'prod')
  return {
    // eslint-disable-next-line no-undef
    appKey: process.env.TARO_APP_PUSH_APPKEY,
    isProduction: process.env.TARO_APP_ENV === 'prod',
    channel: 'AppStore', // TODO 待安卓提供
  }
}

/* 获取极光唯一id */
const getRegistrationIDSync = async () => {
  return new Promise(async (resolve) => {
    const result = (await AppPlugin.push.getRegistrationIDSync({})) || {}
    console.log('[appPlugin] getRegistrationIDSync>>', result)
    const { code, data } = result
    if (code === 0 && data) {
      resolve(data?.registrationID)
    } else {
      resolve(null)
    }
  })
}

/**
 * 极光消息初始化
 */
export const appPluginPushInit = async () => {
  console.log('[appPlugin]', 'appPluginPushInit')
  // sdk初始化
  await appPluginPushRegister()
  // 安卓端-极光启动推送
  AppPlugin.push?.checkPushHandleMessageSync()
  // 角标清空
  appPushBadgeRestSync()
}

/* 极光sdk初始化*/
export const appPluginPushRegister = async () => {
  try {
    const isWeixinApp = isWeixinAppSync()
    if (isWeixinApp) {
      // 接收APP-push消息
      handleAppPushMessage()
      // TODO 调试安卓sync方法
      // testAndroidSync()
      const params = getPushInitParams()
      console.log('register params>>>', params)
      const res = await AppPlugin.push?.register(params)
      console.log('[appPlugin register result]', res)
      if (res?.code === 0 && res?.data) {
        const platformStore = usePlatformStore()
        // 写入极光sdk设备标识
        platformStore.setAppPushParams({
          jpushrid: res.data?.registrationID,
        })
      } else {
        if (res?.msg) {
          AppPlugin.error(res?.msg)
        }
      }
    }
  } catch (e) {
    console.log('appPlugin', e)
    // AppPlugin.error(e)
  }
}

/**
 * 获取极光消息-消息路由列表
 * @returns {Promise<void>}
 */
export const getPushRoutePathByChannel = async () => {
  try {
    const res = await ApiGetRoutePathByChannel({ channelCode: 'nativeMini' })
    if (res?.code === 0 && res?.data) {
      // 写入store
      const platformStore = usePlatformStore()
      platformStore.setMessageRouteMap(res.data)
      // 写入storage
      setStorageSyncPure('GLOBAL_MESSAGE_ROUTES', res.data)
      console.log('platformStore?.messageRouteMap>>>', platformStore?.messageRouteMap)
    }
  } catch (e) {
    console.log(e)
  }
}

/**
 * 极光消息-处理回调
 * @param data
 */
const handePushMessageListener = (data) => {
  console.log('[appPlugin]监听插件消息通知', data)
  return pushMessageHandler(data)
}

/**
 * 监听极光消息-所有message
 * @param params
 */
const handlePushMessage = (params) => {
  console.log('[appPlugin message]', params)
  // [适配兜底]android端-getRegistrationIDSync获取不到的适配
  if (params.type && params.type === 'getRegistrationIDSync' && params.data) {
    const platformStore = usePlatformStore()
    // 写入极光sdk设备标识
    platformStore?.setAppPushParams({
      jpushrid: params.data,
    })
    appPushReLoginMsgPush(params.data)
    console.log('[appPlugin 写入jpushrid]', params.data)
  }
  // 调用极光消息回调(仅后台消息-通知栏进行消费)
  if (params.type === 'notification' && params.data) {
    const { extra } = params.data || {}
    if (extra && typeof extra === 'string') {
      const extraData = JSON.parse(extra) || {}
      handePushMessageListener(extraData)
    } else {
      handePushMessageListener(params.data)
    }
  }
}

/* 打开应用 - 清空应用角标 */
export const appPushBadgeRestSync = async () => {
  const isWeixinApp = isWeixinAppSync()
  if (!isWeixinApp) {
    return
  }
  console.log('[appPlugin]', '角标清空调用')
  const result = await AppPlugin.push?.resetBadgeSync({ badge: 0 })
  console.log('[appPlugin] 角标清空调用结果', result)
}

// 调试-消息接收
export const handleAppPushMessage = () => {
  console.log('[app plugin] 极光handleAppPushMessage', hasMessageHandler)
  if (hasMessageHandler) {
    return
  }
  hasMessageHandler = true
  AppPlugin.push?.onMiniPluginEvent(handlePushMessage)
}

/* 登录成功-注册APP极光消息监听 */
export const appPushReLoginMsgPush = debounce(async (jpushrid?: string) => {
  try {
    const isWeixinApp = isWeixinAppSync()
    if (!isWeixinApp) {
      return
    }
    console.log('[appPlugin] 极光api用户注册开始')
    if (!hasMessageHandler) {
      handleAppPushMessage()
    }
    console.log('[appPlugin] 极光api用户注册')
    const { appPushParams } = usePlatformStore()
    let registrationID = jpushrid
    if (!jpushrid) {
      registrationID = (await getRegistrationIDSync()) as string
    }
    const params: ApiReLoginMsgPushParams = {
      phone: getUserPhoneStorage(),
      jpushrid: (jpushrid || appPushParams?.jpushrid || registrationID) as string,
    }
    console.log('[appPlugin] 极光api用户注册params', params)

    if (!params.jpushrid || !params.phone) {
      AppPlugin.error('极光-消息ApiReLoginMsgPush jpushrid不存在')
      return
    }
    // 极光消息api登录
    const res = await ApiReLoginMsgPush(params)
    console.log('[appPlugin] 极光api用户注册结果', res)
    if (res?.code !== 0) {
      AppPlugin.error('极光-消息ApiReLoginMsgPush 接口异常', { code: res?.code })
    }
  } catch (e) {
    console.log('[appPlugin] 极光注册报错', e, e?.msg)
  }
}, 500)

/* 退出登录-取消订阅极光消息 */
export const appPushLogoutOff = () => {
  const isWeixinApp = isWeixinAppSync()
  if (!isWeixinApp) {
    return
  }
  hasMessageHandler = false
  AppPlugin.push?.offMiniPluginEvent(handlePushMessage)
}
