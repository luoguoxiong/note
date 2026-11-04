<template>
  <view class="qcode-jump"></view>
</template>

<script setup lang="ts">
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { getAppletQrcodeParameter } from '@/public/utils/scan/api'

// 路由映射表（Tab 页）
const tabOrderRouterMap: Record<string, string> = {
  'pages/index/index': '/layout/pages/home/index',
  'pages/entry/index': '/layout/pages/order/index',
  'pages/search/index': '/layout/pages/search/index',
  'pages/mypage/index': '/layout/pages/mine/index',
}

const { autoLoginHook } = useAutoLogin()
const router = useRouter()

useDidShow(async () => {
  try {
    await autoLoginHook({ needLogin: true })

    Taro.showLoading({ title: '加载中...' })
    const scene = decodeURIComponent(router.params?.scene || '')

    if (!scene) {
      Taro.hideLoading()
      Taro.showToast({ title: '无效的二维码参数', icon: 'none' })
      return
    }

    const [appletId, appletMd5] = scene.split(',')
    const { data } = await getAppletQrcodeParameter({ appletId, appletMd5 }, false)

    const param = data?.urlParameter?.find((item) => item.key === 'erpRouteUrl')
    if (!param?.value) {
      Taro.showToast({ title: '无效的跳转链接', icon: 'none' })
      return
    }

    // 判断是否 Tab 页
    const matchedTab = Object.keys(tabOrderRouterMap).find((item) => param.value.includes(item))

    if (matchedTab) {
      Taro.switchTab({ url: tabOrderRouterMap[matchedTab] })
    } else {
      Taro.redirectTo({ url: param.value })
    }
  } catch (err) {
    console.error(err)
  } finally {
    Taro.hideLoading()
  }
})
</script>
