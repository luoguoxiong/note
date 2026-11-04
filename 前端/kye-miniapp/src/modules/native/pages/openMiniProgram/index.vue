<template>
  <view></view>
</template>
<script setup lang="ts">
import { ensureWechatInstalled } from '@/public/utils'
import plateform from '@kye-netc/plateform'
import Taro, { useRouter } from '@tarojs/taro'

let { params } = useRouter()

const init = async () => {
  const hasWechatInstall = await ensureWechatInstalled()

  if (!hasWechatInstall) {
    Taro.showToast({ title: '您尚未安装微信客户端', icon: 'none' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1000)
    return
  }
  params.path = decodeURIComponent(params?.path as string)

  plateform.openMiniProgram(params as any)

  Taro.navigateBack()
}

init()
</script>
