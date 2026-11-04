<template>
  <view></view>
</template>

<script setup>
import { useDidShow, useRouter } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { scoreTrans } from './api'

const router = useRouter()

const { autoLoginHook } = useAutoLogin()

useDidShow(async () => {
  await autoLoginHook({ needLogin: true })

  Taro.showLoading({ mask: true, title: '加载中' })

  if (Number(router.params.wx || 0)) {
    Taro.hideLoading()
    Taro.setStorageSync('qrcode', 1)
    Taro.setStorageSync('scoreFlag', router.params.wx)
    Taro.switchTab({ url: '/layout/pages/waybill/index' })
    return
  }

  scoreTrans({
    sourceFlag: '20',
    driveNum: router.params.scene,
  })
    .then(({ data }) => {
      Taro.hideLoading()
      Taro.setStorageSync('qrcode', 1)
      Taro.setStorageSync('scoreFlag', data.scoreFlag)
      Taro.switchTab({ url: '/layout/pages/waybill/index' })
    })
    .catch((err) => {
      Taro.hideLoading()
      Taro.setStorageSync('qrcode', 1)
      Taro.setStorageSync('scoreFlag', err.scoreFlag)
      Taro.switchTab({ url: '/layout/pages/waybill/index' })
    })
})
</script>
