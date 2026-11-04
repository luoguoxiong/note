<template>
  <view>
    <view v-if="networkLoading"></view>
    <view v-else>
      <NetworkError v-if="show || weaknetwork" :reload="onReload" :weaknetwork="weaknetwork" />
      <web-view
        v-if="src && !show && !weaknetwork"
        id="webviewID"
        :src="src"
        @error="onError"
        @message="hanldeMessage"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { refreshWebviewCheck } from './utils/webviewUtils'
import NetworkError from '@public/components/base/network-error/index.vue'
import { getQueryObject } from '@public/utils/url'
import { useLogin } from '@/public/hooks'

defineOptions({ name: 'IntegralCenter' })

// 声明全局变量
declare const process: any
declare const getCurrentPages: any

const { autoLoginHook } = useAutoLogin()
const { token } = useLogin()

const BaseH5URL = process.env.TARO_APP_HTTP_URL || 'https://ic-h5.kye-erp.com'

// 响应式数据
const src = ref('')
const show = ref(false) // 是否显示网络错误
const networkLoading = ref(true) // 检查网络状况中
const weaknetwork = ref(false) // 是否弱网
const shareObj = ref<any>({})

// 获取路由参数
const getRouteParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.options || {}
}

// 获取应用信息
const getSingleApplicationInfo = (appId: string, moduleId: string) => {
  // 从 storage 中读取应用信息列表
  const applicationInfoList = Taro.getStorageSync('applicationInfoList') || []

  // 查找对应的区域信息
  const areaInfo = applicationInfoList.find((item: any) => item.areaCode === appId) || {}

  // 查找对应的应用信息
  const appInfo =
    areaInfo.lightApplicationInfos && areaInfo.lightApplicationInfos.find((item: any) => item.menuCode === moduleId)

  if (appInfo) {
    return appInfo
  }

  // 兜底：积分中心应用信息
  if (appId === 'A2006' && moduleId === 'M2040') {
    return {
      loadAddress: `${BaseH5URL}/integral-center.html`,
    }
  }

  // 默认返回基础地址
  return {
    loadAddress: BaseH5URL,
  }
}

const initData = async () => {
  const params = getRouteParams()

  if (params.needLogin) {
    await autoLoginHook()
  }

  // 刷新webview
  await refreshWebviewCheck(src.value, (newSrc: string) => {
    src.value = newSrc
  })

  // 判断活动来源
  const appInfo = getSingleApplicationInfo('A2006', 'M2040')
  if (params.source === 'activity-520') {
    src.value = `${appInfo.loadAddress}#/activity-520?token=${token.value}`
  } else {
    src.value = `${appInfo.loadAddress}#/?token=${token.value}`
  }

  // 清空点击数据
  Taro.removeStorageSync('isAuthAgreement')
  Taro.removeStorageSync('isShowBtn')
}

const getNetworkType = (bool?: boolean) => {
  networkLoading.value = true
  Taro.getNetworkType({
    complete: (res) => {
      if (res.errMsg === 'getNetworkType:ok' && res.networkType === 'none') {
        Taro.setNavigationBarTitle({ title: '跨越速运' })
        Taro.showToast({ icon: 'none', title: '当前无网络，请检查后重试', duration: 2000 })
        show.value = true
      } else {
        show.value = false
        if (bool) {
          initData()
        }
      }
      networkLoading.value = false
    },
  })
}

const onError = () => {
  Taro.setNavigationBarTitle({ title: '跨越速运' })
  Taro.showToast({ icon: 'none', title: '网络不给力，请稍后重试', duration: 2000 })
  weaknetwork.value = true
}

const onReload = () => {
  weaknetwork.value = false
  getNetworkType(true)
}

const hanldeMessage = (e: any) => {
  let postMessge = e.detail.data[e.detail.data.length - 1]
  if (postMessge && postMessge.filterEvaluate) {
    Taro.getApp().globalData.filterEvaluate = postMessge.filterEvaluate
  }
  if (postMessge && postMessge.searchQuery) {
    Taro.getApp().globalData.searchQuery = postMessge.searchQuery
  }
  if (postMessge && postMessge.contentType) {
    shareObj.value = postMessge
  }
}

// 分享功能
const onShareAppMessage = async (options: any) => {
  let toastMsg = '当前页面不支持分享'

  // 判断 webViewUrl 的 href 是否包含 activity-520
  if (options.webViewUrl.indexOf('activity-520') !== -1) {
    toastMsg = '请您选择需要分享的运单，点击分享按钮进行分享'
    if (shareObj.value.programPath) {
      const route = getQueryObject(shareObj.value.programPath)
      const waybillNo = route && route.waybillNo
      if (waybillNo) {
        toastMsg = ''
      }
    }
  }
  if (toastMsg) {
    Taro.showToast({ icon: 'none', title: toastMsg, duration: 2000 })
    throw new Error(toastMsg)
  }
  return {
    title: shareObj.value.title || '跨越速运，一诺定达',
    desc: shareObj.value.desc || '',
    path: shareObj.value.programPath || 'pages/index/index',
    imageUrl: shareObj.value.imgUrl || 'https://ic-img.ky-express.com/netc/share_router.png',
  }
}

onMounted(async () => {
  await autoLoginHook()
  initData()
  getNetworkType()
})

defineExpose({
  onShareAppMessage,
})
</script>

<style lang="scss" scoped>
// 样式可以根据需要添加
</style>
