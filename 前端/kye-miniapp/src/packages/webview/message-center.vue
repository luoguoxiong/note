<template>
  <view v-if="miniporgram.type === 'miniProgram'" class="miniprogram">
    <view class="miniprogram__banner">
      <image :src="`https://ic-h5.kye-erp.com/intro/miniprogram/other-minipro_bg.png`" />
    </view>
    <view class="miniprogram__footer" @tap="handleClick">进入小程序</view>
    <view class="miniprogram__logo">
      <image :src="`https://ic-h5.kye-erp.com/intro/miniprogram/other-minipro_logo.png`" />
    </view>
  </view>
</template>

<script setup>
import Taro, { useRouter, useDidShow } from '@tarojs/taro'
import { ref } from 'vue'
import './message-center.scss'
import { ApiGetRoutePathByChannel } from '@public/apis/push'
import { urlContact, decodeURLSafe } from '@/public/utils'
import { miniProgramJump } from '@/public/components/business/advertise-center/utils.ts'

const router = useRouter()

const { h5Link, modelRoute, inviteCode } = router.params || {}

const miniporgram = ref({})

useDidShow(async () => {
  if (modelRoute === 'inviteCode' && inviteCode) {
    Taro.redirectTo({
      url: `/modules/order-build-sub-pages/pages/share-send/share/index?inviteCode=${inviteCode}`,
    })
    return
  }
  const res = await ApiGetRoutePathByChannel({ channelCode: 'nativeMini' })
  if (modelRoute) {
    let pathObj = res.data.find((item) => item.pageName === modelRoute)
    if (pathObj.type === 'miniProgram') {
      miniporgram.value = pathObj
      return
    }
    miniProgramJump({ modelRoute }, 'redirectTo')
    return
  }
  if (h5Link) {
    let link = decodeURLSafe(h5Link)
    link = link.replace('http://', 'https://')
    Taro.redirectTo({
      url: urlContact('/modules/webview/pages/webview/index', {
        url: link,
        needLogin: 'true',
      }),
    })
  }
})

const handleClick = () => {
  if (!miniporgram.value?.customParams) return
  Taro.navigateToMiniProgram({
    appId: miniporgram.value.customParams.appId,
    path: miniporgram.value.url,
  })
}
</script>
