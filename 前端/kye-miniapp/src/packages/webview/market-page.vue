<!--
  积分中心H5
  涉及分享,不想与其他H5冲突，故新开一个页面
-->
<template>
  <view>
    <view v-if="networkLoading"></view>
    <view v-else>
      <NetworkError v-if="show || weaknetwork" :reload="onReload" :weaknetwork="weaknetwork" />
      <web-view v-if="src && !show && !weaknetwork" :src="src" @error="onError"></web-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Taro, { useDidShow } from '@tarojs/taro'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { refreshWebviewCheck } from './utils/webviewUtils'
import NetworkError from '@public/components/base/network-error/index.vue'
import { useLogin } from '@/public/hooks'
import MarketPageAPI from './api/marketPage'

defineOptions({ name: 'MarketPage' })

// 声明全局变量
declare const getCurrentPages: any

const { autoLoginHook } = useAutoLogin()
const { token } = useLogin()

let shareData: any = {}

// 响应式数据
const src = ref('')
const show = ref(false) // 是否显示网络错误
const networkLoading = ref(true) // 检查网络状况中
const weaknetwork = ref(false) // 是否弱网

// 获取路由参数
const getRouteParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage.options || {}
}

const params = getRouteParams()

/**
 * 从 URL 中获取指定参数的值
 * @param url URL 地址
 * @param variable 参数名
 * @returns 参数值
 */
const getQueryVariable = (url: string, variable: string): string => {
  if (!url || !variable) return ''
  
  try {
    const queryIndex = url.indexOf('?')
    if (queryIndex === -1) return ''
    
    const query = url.substring(queryIndex + 1)
    const vars = query.split('&')
    
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=')
      if (pair[0] === variable) {
        return decodeURIComponent(pair[1] || '')
      }
    }
    
    return ''
  } catch (err) {
    console.error('getQueryVariable error:', err)
    return ''
  }
}

// 获取分享参数
const getMPShareParam = () => {
  let url = decodeURIComponent(params.url)
  let page = getQueryVariable(url, 'page')
  MarketPageAPI.getMPShareParam({ pageCode: page })
    .then((res: any) => {
      console.log(res)
      const data = res.data || res
      shareData = {
        title: data.shareTitle,
        path: data.path,
        imageUrl: data.shareImgCard,
      }
    })
    .catch((err) => {
      // 静默处理错误
    })
}

// 初始化数据
const initData = async () => {
  if (params.needLogin) {
    await autoLoginHook()
  } else {
    try {
      await autoLoginHook()
    } catch (err) {
      // 登录失败也继续
    }
  }

  // 刷新webview
  await refreshWebviewCheck(src.value, (newSrc: string) => {
    src.value = newSrc
  })

  const decodeSrc = decodeURIComponent(params.url || '')
  const click_id = params.click_id || params.clickid || params.gdt_vid || ''
  const sg_vid = params.sg_vid || ''
  
  src.value = `${decodeSrc}${decodeSrc.includes('?') ? '&' : '?'}token=${token.value}&click_id=${click_id}&sg_vid=${sg_vid}`
}

// 获取网络类型
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
        getMPShareParam()
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

// 分享功能
const onShareAppMessage = () => {
  return {
    title: shareData.title || '',
    path: shareData.path || '',
    imageUrl: shareData.imageUrl || '',
  }
}

// 使用 useDidShow 以便每次显示页面时刷新
useDidShow(() => {
  initData()
})

onMounted(() => {
  getNetworkType()
})

defineExpose({
  onShareAppMessage,
})
</script>

<style lang="scss" scoped>
// 样式可以根据需要添加
</style>

