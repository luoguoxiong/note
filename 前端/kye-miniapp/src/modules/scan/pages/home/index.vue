<template>
  <view></view>
</template>

<script setup lang="ts">
import { useDidShow, useRouter } from '@tarojs/taro'
import { handleCommonScan } from '@/public/utils/scan/help'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'

const router = useRouter()

const { autoLoginHook } = useAutoLogin()

// 获取扫码结果
const getScanResult = () => {
  return decodeURIComponent(router.params.q ?? router.params.scene ?? '')
}

// 页面显示时触发扫码处理
useDidShow(async () => {
  try {
    await autoLoginHook({ needLogin: true })
  } finally {
    handleScanCode()
  }
})

// 扫码处理逻辑
const handleScanCode = () => {
  const scanResult = getScanResult()

  if (!scanResult) {
    console.log('未匹配二维码url')
    return
  }

  const { sourcePage, sourceAction, needTransparentQuery } = router.params

  const scanType = sourcePage === 'mp-home' || !!sourceAction ? 'mini-scan' : 'wx'

  const urlParmas = needTransparentQuery ? router.params : {}
  handleCommonScan({
    scanResult,
    origin: 30,
    scanType,
    urlParmas,
  })
}
</script>
