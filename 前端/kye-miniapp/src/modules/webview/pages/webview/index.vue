<template>
  <KyWebView
    v-if="onLoaded"
    @load="loaded"
    @error="handleError"
    :id="`webview-${webviewId}`"
    :src="webviewSrc"
    @message="onMessage"
  />
</template>

<script setup lang="ts">
import { useRouter, useShareAppMessage, useUnload } from '@tarojs/taro'
import { ref } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import KyWebView from '@public/components/business/webview/index.vue'
import { urlContact } from '@public/utils/url'
import { refreshWebviewCheck } from '@public/utils/webview'
import { addAppGrayHeader, downloadImage } from './utils'
import native from '@public/utils/native/index'
import { useLogin, useUserInfo } from '@/public/hooks'
import { useMessageDataHook } from '@modules/webview/pages/webview/hooks/useMessageDataHook'
import { useApplication } from '@public/utils/application/useApplication'
import { triggerWaybillSearch } from '@/public/storage'
import { usePlatformStore } from '@/store/platform'
import { onUserLogout } from '@/modules/user/pages/login/service'
import { getEnvConfig } from '@/public/config'
import { isWeixinAppSync, shellVersion, MINI_APP_VERSION } from '@/public/constants'
import { connectOpenId } from '@/public/utils/user/getAmapAuthCode'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { useLogOutTip } from '@/public/utils/request/useLogOutTip'
import { getClickId, getPlateForm, isAliMiniApp, isWechatNotAppEnv, isWxPcAppletEnv, report_other_event, report_pv_event } from '@/public/utils'
import { getLocationValueWithAuth, is_sign_in_h5 } from '@/public/getLocaltion'
import { useHomeStore } from '@/layout/pages/home/store'
import { emitWebUpload } from '@/public/native'
import { showBusinessPopup } from '@/layout/pages/mine/hooks/useContactBuisness'
import { getRedirectUrl } from '@public/hooks/useRedirectH5ToNative'
import { useNewUserActivity } from '@/store/useNewUserActivity'

defineOptions({ name: 'CommonWebview' })

const router = useRouter()

const routerParmas = (router.params || {}) as any

const customParams = routerParmas?.customParams ? JSON.parse(decodeURIComponent(routerParmas?.customParams)) : {}

const { token } = useLogin()

const { getLogoutModal } = useLogOutTip()

let shareMsg

const onMessage = (e) => {
  const data = e.detail.data
  console.error('message:', data)
  if (e.detail.method === 'share') {
    shareMsg = data
  }
  if (data?.method) {
    native(data, 'waybill-webview')
  }
  if (e.detail?.method === 'downloadFile') {
    downloadImage(e?.detail?.data?.url)
  }
  const postMessage = Array.isArray(data) ? data[data?.length - 1] : data

  // 展示联系商务
  if (postMessage && postMessage?.openContactBussiness === 1) {
    showBusinessPopup.show = true
  }

  if (postMessage && postMessage.method === 'saveHomeLightApp') {
    // todo 更新轻应用数据
    useHomeStore().getHomeApplication()
  }
  if (postMessage?.method === 'upload') {
    emitWebUpload({
      componentName: postMessage.componentName,
      type: postMessage.type as any,
      data: (postMessage.data || null) as any,
    })
  }

  // 老的分享参数
  if (postMessage && postMessage.contentType) {
    shareMsg = {
      isOldWx: true,
      ...postMessage,
    }
  }

  if (postMessage?.actionType) {
    // 接收绑码组件H5-刷新通知(TODO: 后续接入原生后移除)
    if (postMessage?.actionType === 'netc-customer-code-update') {
      updateBindCustomerRefresh(true)
      onRefresh()
    }
  }
  if (postMessage?.leadCapture) {
    useNewUserActivity().getNewCustomerInfo(true)
  }
  if (Array.isArray(data)) {
    const updateCustomerItem = data.find((item) => item?.actionType === 'updateCustomerCode')
    if (updateCustomerItem) {
      updateCustomerCodeHandler(updateCustomerItem?.data || updateCustomerItem)
    }
  } else {
    // 接收绑码组件：切换客户编码
    if (postMessage?.actionType === 'updateCustomerCode') {
      const updateMessage = {
        ...(postMessage?.data || {}),
        ...postMessage,
      }
      updateCustomerCodeHandler(updateMessage)
    }
  }
  if (postMessage?.refresh || data.refresh) {
    triggerWaybillSearch()
  }
  if (postMessage?.isExit) {
    const { isApp } = getEnvConfig()
    if (isApp) {
      wx.miniapp.revokePrivacySetting({
        success(e) {
          console.info('revokePrivacySetting success', e)
          onUserLogout()
          const isIOS = getEnvConfig().systemType.toLowerCase() === 'ios'
          if (isIOS) {
            wx.miniapp.closeApp()
          } else {
            wx.miniapp.closeAppModule()
          }
        },
        fail(e) {
          console.error('revokePrivacySetting fail', e)
        },
      })
    } else {
      onUserLogout()
      getLogoutModal()
    }
  }
}

const loaded = () => {
  report_other_event('webview-load', {
    url: webviewSrc.value,
  })
  const query = routerParmas
  console.log('iframe加载完毕', query)
  if (query.page_code) {
    report_pv_event(query.page_code)
  }
}

const handleError = (error) => {
  report_other_event('webview-error', {
    url: webviewSrc.value,
    error_info: JSON.stringify(error),
  })
}

const { autoLoginHook } = useAutoLogin()

const { userInfo } = useUserInfo()

const openWebviewUrl = () => {
  const query = routerParmas
  const url = routerParmas.url || ''
  console.log('openWebviewUrl', query)
  const { isApp } = getEnvConfig()
  if (query.getLocation && isApp) {
    Taro.getLocation({
      success: (res) => {
        getWebviewSrc({
          location: JSON.stringify({
            latitude: res.latitude,
            longitude: res.longitude,
          }),
        })
      },
      fail: (res) => {
        getWebviewSrc()
        console.error('error', res)
      },
    })
  } else if (url.includes('site-query') && (isWechatNotAppEnv || isAliMiniApp)) {
    Taro.getLocation({
      success: (res) => {
        getWebviewSrc({
          location: JSON.stringify({
            latitude: res.latitude,
            longitude: res.longitude,
          }),
        })
      },
      fail: (res) => {
        getWebviewSrc()
        console.error('error', res)
      },
    })
  } else {
    getWebviewSrc()
  }
}

useUnload(() => {
  /* 页面卸载-记录卸载前路由 */
  const platformStore = usePlatformStore()
  platformStore?.set('userLastUnloadPage', { route: router?.path, params: router?.params })
})

useDidShow(async () => {
  const needLogin =
    (routerParmas.needLogin && routerParmas.needLogin !== 'false') ||
    (customParams.needLogin && customParams.needLogin !== 'false')

  try {
    if (needLogin) {
      await autoLoginHook({ needLogin: true, hideCatch: true })
    }
  } catch (e) {
    console.error(e)
  }
  if (!onLoaded.value) {
    onLoaded.value = true
    openWebviewUrl()
  } else {
    if (refreshWebviewCheck(webviewSrc.value, needLogin)) {
      onRefresh()
      return
    }
  }
})

const webviewSrc = ref('')
const webviewId = ref(0)
const onLoaded = ref(false) // 是否已执行初始化

const { getApplicationSingleAsync } = useApplication()

// 使用手机号匹配 hook

const getWebviewSrc = async (customerParmas: Record<string, any> = {}) => {
  try {
    webviewId.value = webviewId.value + 1
    const { needLogin: needLoginNative, url, menuCode, hash, getClipboardData } = routerParmas
    if (url.includes('real-name-auth')) {
      const redectUrl = await getRedirectUrl(url, true)
      if (redectUrl) {
        Taro.redirectTo({
          url: `${redectUrl}&miniprogramType=sms`,
        })
        return
      }
    }
    console.log('getWebviewSrcrouterParmas', routerParmas, menuCode)
    const needLogin =
      needLoginNative ||
      url?.includes('needLogin') ||
      menuCode ||
      (customParams?.needLogin && customParams?.needLogin === 'true')

    /* 需要登录，不存在token场景 不渲染 */
    if (needLogin && needLogin !== 'false' && !token.value) {
      return
    }

    let grayLink = addAppGrayHeader(decodeURIComponent(url))

    /* 不存在url, 存在指定轻应用menuCode */
    if (!url && menuCode) {
      grayLink = await getApplicationSingleAsync({ menuCode })
    }
    if (hash) {
      // 替换 hash router
      grayLink = grayLink.replace(/#\/[^?]*/, `#/${hash}`)
    }

    const defaultParams = {}

    if (needLogin && !url?.includes('xForm')) {
      defaultParams['xForm'] = getEnvConfig().xForm
    }

    // 兼容 getClipboardData 失败
    let clipboard = ''
    if (getClipboardData) {
      try {
        const res = await Taro.getClipboardData()
        clipboard = res?.data || ''
      } catch (err) {
        console.warn('getClipboardData 调用失败，已忽略：', err)
        clipboard = ''
      }
    }

    // 从本地缓存获取设备 ID（app 冷启动时已通过 AppPlugin.getDeviceId() 预加载并持久化）
    const deviceId = Taro.getStorageSync('app_device_id') || ''

    const permission = isWeixinAppSync() ? { permission: JSON.stringify(Taro.getAppAuthorizeSetting()) } : {}

    const { isCompanyWx, isPc } = getEnvConfig()
    const params = {
      deviceId,
      plateform: getPlateForm(),
      ...(needLogin ? { token: token.value, openid: userInfo.value.xcxOpenId } : {}),
      ...(isCompanyWx && isPc ? { isPcWorkWx: true } : {}),
      ...defaultParams,
      ...customerParmas,
      ...permission,
      clipboard,
      appVersion: shellVersion,
      miniAppVersion: MINI_APP_VERSION.replace(/^v/, ''),
      pre_click_id: getClickId(),
      lat: '',
      lng: '',
      isNew: `${userInfo.value.isOldCustomer}` === '1' ? 0 : 1,
    }

    grayLink = await connectOpenId(grayLink)

    const isSign = is_sign_in_h5(grayLink)
    if (isSign) {
      const { lat, lng, location_has_auth } = await getLocationValueWithAuth()
      if (location_has_auth) {
        params.lat = lat
        params.lng = lng
      }
    }
    webviewSrc.value = urlContact(grayLink, params)
  } catch (error) {
    report_other_event('webview-init', {
      status: -1,
      error_info: JSON.stringify(error),
    })
  } finally {
    report_other_event('webview-init', {
      url: webviewSrc.value,
      status: 1,
    })
  }
}

const onRefresh = async () => {
  webviewSrc.value = ''
  setTimeout(() => {
    openWebviewUrl()
  }, 300)
}

// const { updateBindCustomerRefresh } = useMessageDataHook(onRefresh)
// 轻应用内部做了 visible 监听，这里不用去刷新。真机会刷，模拟器不会刷
// 注:PC端/模拟器需要刷新
const { updateBindCustomerRefresh, updateCustomerCodeHandler } = useMessageDataHook(
  isWxPcAppletEnv ? onRefresh : () => {},
)

useShareAppMessage(() => {
  if (shareMsg && shareMsg?.isOldWx) {
    let imgUrl = shareMsg.imageUrl || 'https://ic-h5.kye-erp.com/intro/miniprogram/share_router.png'
    console.error('shareMsg?.programPath', shareMsg?.programPath)
    return {
      title: shareMsg?.title || '跨越速运，一诺定达',
      path: shareMsg?.programPath || 'layout/pages/home/index',
      imageUrl: imgUrl,
    }
  } else {
    return shareMsg
  }
})
</script>
