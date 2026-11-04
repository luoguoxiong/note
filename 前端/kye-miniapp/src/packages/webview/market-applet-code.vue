<!--
  积分中心H5
  涉及分享,不想与其他H5冲突，故新开一个页面
  通过小程序码扫码进入的营销活动页面
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
import MarketAppletCodeAPI from './api/marketAppletCode'

defineOptions({ name: 'MarketAppletCode' })

// 声明全局变量
declare const getCurrentPages: any

const { autoLoginHook } = useAutoLogin()
const { token } = useLogin()

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
 * 从查询字符串中获取参数值
 * @param url 查询字符串（用 & 分隔）
 * @param variable 参数名
 * @returns 参数值
 */
const getQuery = (url: string, variable: string): string => {
  if (!url || !variable) return ''

  try {
    const vars = url.split('&')
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=')
      if (pair[0] === variable) {
        return pair[1] || ''
      }
    }
    return ''
  } catch (err) {
    console.error('getQuery error:', err)
    return ''
  }
}

// 初始化数据
const initData = async () => {
  try {
    await autoLoginHook()

    // 刷新webview
    await refreshWebviewCheck(src.value, (newSrc: string) => {
      src.value = newSrc
    })

    const scene = params.scene ? decodeURIComponent(params.scene) : ''
    const activityNo = getQuery(scene, 'n')
    const id = getQuery(scene, 'id')

    const reqParams: any = {}
    if (id) reqParams.id = id
    if (activityNo) reqParams.activityNo = activityNo

    try {
      const res = await MarketAppletCodeAPI.activityGetH5UrlNew(reqParams)
      const data = res.data || res

      if (data) {
        const url = `${data}${data.includes('?') ? '&' : '?'}token=${token.value}`
        console.log(url, 'url')
        src.value = url
      } else {
        Taro.showToast({ title: 'h5链接有误', icon: 'none' })
      }
    } catch (err: any) {
      Taro.showToast({ title: err.msg || '获取活动链接失败', icon: 'none' })
    }
  } catch (err) {
    console.error('初始化失败:', err)
  }
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

// 使用 useDidShow 以便每次显示页面时刷新
useDidShow(() => {
  initData()
})

onMounted(() => {
  getNetworkType()
})
</script>

<style lang="scss" scoped>
// 样式可以根据需要添加
</style>
