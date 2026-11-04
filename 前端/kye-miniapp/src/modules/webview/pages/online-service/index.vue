<template>
  <view>
    <!-- 网络检查完成后才显示 -->
    <template v-if="!networkLoading">
      <!-- 网络错误提示 -->
      <NetworkError v-if="show || weaknetwork" @reload="onReload" :weaknetwork="weaknetwork" />

      <!-- WebView -->
      <web-view v-if="src && !show && !weaknetwork" @message="handleMessage" :src="src" @error="onError" />
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDidShow, useRouter, useShareAppMessage } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import md5 from 'js-md5'

// 组件
// TODO: 恢复
import NetworkError from '@public/components/business/network-error/index.vue'

// 工具
import { getApplicationFullUrlAsync } from '@public/utils/applicationUtil'
import { kuashengURLInOnlineService } from '@public/utils/env'
import { refreshWebviewCheck } from '@public/utils/webview'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { getToken } from '@public/storage'

import { useUserInfo } from '@/public/hooks'
import { showBusinessPopup } from '@/layout/pages/mine/hooks/useContactBuisness'
import { urlQueryStringAdd } from '@public/utils'

// store（Pinia）
// import { useUserStore } from '@/store/user'

const { autoLoginHook } = useAutoLogin()

const kuasheng_url = kuashengURLInOnlineService

// 响应式状态
const src = ref('')
const show = ref(false) // 是否显示网络错误
const networkLoading = ref(true) // 是否正在检查网络
const weaknetwork = ref(false) // 是否弱网

const router = useRouter()
const { userInfo } = useUserInfo()
const isLogin = computed(() => !!userInfo.value?.phone)

// 页面显示时触发
useDidShow(() => {
  initData()
})

// 页面挂载后检查网络
onMounted(() => {
  getNetworkType()
})

// 初始化数据
const initData = async () => {
  try {
    if (!isLogin.value) {
      await autoLoginHook({ needLogin: true })
    }

    const token = getToken()

    await refreshWebviewCheck(src.value, (val: string) => (src.value = val))

    const applicationUrl = (await getApplicationFullUrlAsync('A2009', 'M2005')) || `${kuasheng_url}/ccms-jd-mobile/`

    let { paramsNum, type } = router?.params
    console.log('🚀 ~ initData ~  paramsNum, type :', paramsNum, type)

    const url = router.params?.url ? decodeURIComponent(router.params.url) : applicationUrl
    console.log('🚀 ~ initData ~ url:', url)

    const userInfoTemp = userInfo.value

    let sign =
      (userInfoTemp.userName ? `name${userInfoTemp.userName}` : '') +
      `phone${userInfoTemp.phone}sourceWECHAT_APPLETimcloudMethod`
    sign = md5.md5(sign).toUpperCase()
    src.value = urlQueryStringAdd(
      url,
      `token=${token || ''}&` +
        (userInfoTemp.userName ? `name=${userInfoTemp.userName}&` : '') +
        `source=WECHAT_APPLET&phone=${userInfoTemp.phone}&paramsNum=${paramsNum || ''}&type=${type || ''}&sign=${sign}&isMiniApp=1`,
    )
    console.log('webviewSrc >>> 在线客服H5链接: ', src.value)
  } catch (e) {
    console.error(e)
  }
}

// 获取网络状态
const getNetworkType = (refresh?: boolean) => {
  networkLoading.value = true
  Taro.showLoading({ mask: true, title: '加载中...' })
  Taro.getNetworkType({
    complete: (res) => {
      console.log('🚀 ~ getNetworkType ~ res:', res)
      if (res.errMsg === 'getNetworkType:ok' && res.networkType === 'none') {
        Taro.setNavigationBarTitle({ title: '跨越速运' })
        Taro.showToast({
          icon: 'none',
          title: '当前无网络，请检查后重试',
          duration: 2000,
        })
        show.value = true
      } else {
        show.value = false
        if (refresh) {
          initData()
        }
      }
      networkLoading.value = false
      Taro.hideLoading()
    },
  })
}

// webview 加载错误
const onError = () => {
  Taro.setNavigationBarTitle({ title: '跨越速运' })
  Taro.showToast({
    icon: 'none',
    title: '网络不给力，请稍后重试',
    duration: 2000,
  })
  weaknetwork.value = true
}

// 点击重试
const onReload = () => {
  weaknetwork.value = false
  getNetworkType(true)
}

// 分享
useShareAppMessage(() => {
  return {}
})

const handleMessage = (e) => {
  const openContactBussiness = e.detail.data?.[0]?.openContactBussiness
  showBusinessPopup.show = !!openContactBussiness
}
</script>
