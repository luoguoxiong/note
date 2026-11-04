<template>
  <KyWebView
    :src="webviewSrc"
    id="webview-barcode"
    @load="handleLoad"
    @error="handleError"
    v-if="webviewSrc"
  ></KyWebView>
</template>
<script setup lang="tsx">
import { useDidShow, useRouter } from '@tarojs/taro'
import KyWebView from '@public/components/business/webview/index.vue'
import { getQueryObject, urlContact } from '@/public/utils'
import { useApplication } from '@/public/utils/application/useApplication'
import { ref } from 'vue'
import { useLogin } from '@/public/hooks'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { refreshWebviewCheck } from '@/public/utils/webview'
import { useSignInReport } from './report/useSignInReport'
import { addDetailPerformance, initPagePerformance } from './report/performenceReport'
import { getThirdBusinessSignStatus } from './api/scanQrCode'
import { faceToFaceMap } from './utils/scanQrCode'
import Taro from '@tarojs/taro'
const {
  reportWorkIdGet,
  reportSignInPageInit,
  reportEventSignInPage,
  reportEventSignInPageApiAfter,
  networkReport,
  getLinkReport,
  webviewTimeoutReport,
  webviewLoadLoadReport,
} = useSignInReport()

const { params } = useRouter()

const { scene } = (params || {}) as any

const { getApplicationSingleAsync } = useApplication()

const { autoLoginHook } = useAutoLogin()

let webviewIsLoad = false

const handleLoad = () => {
  webviewIsLoad = true
  console.log('webview 加载成功')
  webviewLoadLoadReport('sign_webview_success', webviewSrc.value)
}

const handleError = () => {
  webviewIsLoad = false
  console.log('webview 加载失败')
  webviewLoadLoadReport('sign_webview_fail', webviewSrc.value)
}

/**
 * 面对面码状态上报接口
 * @param params
 * @param options 自定义配置(地址配置)
 * @returns {Promise<* | undefined>}
 */
const handleThirdBusinessSignStatus = (params, options = {}) => {
  reportEventSignInPage({
    type: 'api-before',
    request_result: '面对面-扫码成功-调用接口前',
    location_info: {
      address: params['address'] || null,
      location_has_auth: options && options.location_has_auth,
      location_error_msg: options && options.location_error_msg,
    },
  })
  addDetailPerformance('面对面签到-小程序码落地页-调用接口前')
  return getThirdBusinessSignStatus(params)
    .then(() => {
      reportEventSignInPageApiAfter({
        request_result: '面对面-调用接口后-上报成功',
        scene,
      })
    })
    .catch((err) => {
      reportEventSignInPageApiAfter(
        {
          request_result: '面对面-调用接口后-上报失败',
          scene,
        },
        err,
      )
    })
    .finally(() => {
      addDetailPerformance('面对面签到-小程序码落地页-调用接口后')
    })
}

const webviewSrc = ref()

const { token } = useLogin()

const getLocationValueWithAuth = async () => {
  const result = {
    lat: '',
    lng: '',
    location_has_auth: '否',
    location_error_msg: '',
  }

  try {
    const setting = await Taro.getSetting()
    const authSetting = setting?.authSetting || {}

    if (!authSetting['scope.userLocation']) {
      return { ...result, location_error_msg: '用户未授权' }
    }

    const location = await Taro.getLocation({ type: 'gcj02' })

    if (location?.errMsg === 'getLocation:ok') {
      return {
        ...result,
        lat: String(location.latitude),
        lng: String(location.longitude),
        location_has_auth: '是',
      }
    }

    return {
      ...result,
      location_error_msg: location?.errMsg || '未获取到定位',
    }
  } catch (e) {
    console.log(e)
    return { ...result, location_error_msg: '获取定位异常' }
  }
}

const getWebview = async () => {
  const src = await getApplicationSingleAsync({ menuCode: 'M6051' })
  if (src) {
    const { u } = getQueryObject(decodeURIComponent(scene))
    const url = urlContact(src, {
      scene,
      token: token.value,
      uuid: u,
      workId: reportWorkIdGet(),
    })
    webviewSrc.value = url
    setTimeout(() => {
      if (!webviewIsLoad) {
        webviewTimeoutReport(5)
      }
    }, 5000)
    setTimeout(() => {
      if (!webviewIsLoad) {
        webviewTimeoutReport(10)
      }
    }, 10000)
    getLinkReport(url)
    addDetailPerformance('面对面签到-小程序码落地页-webview渲染前')
    setTimeout(() => {
      initPagePerformance()
    }, 100)
  }
}

const onRefresh = () => {
  webviewSrc.value = ''
  setTimeout(() => {
    getWebview()
  }, 300)
}

let isLoad = false

useDidShow(async () => {
  try {
    // 网络埋点
    networkReport()
    reportSignInPageInit({ scene })

    const faceToFaceKey = faceToFaceMap.faceToFaceMapKeyGet(scene)

    if (!faceToFaceKey) {
      const { u } = getQueryObject(decodeURIComponent(scene))
      const { lat, lng, location_has_auth, location_error_msg } = await getLocationValueWithAuth()
      const params = {
        uuid: u,
        optType: 10,
      }
      // 存在经纬度
      if (lat && lng) {
        params['address'] = { lat, lng }
      }
      handleThirdBusinessSignStatus(params, { location_has_auth, location_error_msg })
      // 更新面对面唯一key
      faceToFaceMap.faceToFaceMapUpdate(scene, 1)
    }
    await autoLoginHook({ needLogin: true })
    if (!isLoad) {
      isLoad = true
      getWebview()
    } else {
      if (refreshWebviewCheck(webviewSrc.value)) {
        onRefresh()
        return
      }
    }
  } catch (error) {
    console.error(error)
  }
})
</script>
