<template>
  <web-view v-if="webviewUrl && isLogin" :src="webviewUrl" @message="onMessage" />
</template>

<script lang="ts" setup>
import { useLogin } from '@/public/hooks'
import { getToken } from '@/public/storage'
import { useAutoLogin } from '@/public/utils/user/useAutoLogin'
import { useDidShow, useRouter } from '@tarojs/taro'
import { computed } from 'vue'
import { useMessageDataHook } from '@modules/webview/pages/webview/hooks/useMessageDataHook'

defineOptions({ name: 'ScanBindCode' })

const router = useRouter()

const { autoLoginHook } = useAutoLogin()

// eslint-disable-next-line no-undef
const H5_BASE_URL = process.env.TARO_APP_HTTP_URL

const webviewUrl = computed(() => {
  let result = ''

  const params = router.params
  if (params.q) {
    result = decodeURIComponent(params.q)
  }
  // 小程序二维码
  if (params.scene) {
    const scene = decodeURIComponent(params.scene).split(',')
    const appletId = scene[0]
    const appletMd5 = scene[1]
    result = `${H5_BASE_URL}/bind-customer-code-result.html?appletId=${appletId}&appletMd5=${appletMd5}`
  }

  result = `${result}${result.includes('?') ? '&' : '?'}token=${getToken()}`

  return result
})

const { updateCustomerCodeHandler } = useMessageDataHook(() => {})

const onMessage = (e) => {
  const data = e.detail.data
  console.error('onMessage bindCode', data)
  const postMessage = Array.isArray(data) ? data[data?.length - 1] : data

  if (Array.isArray(data)) {
    const updateCustomerItem = data.find(
      (item) => item?.actionType === 'updateCustomerCode' || item?.data?.actionType === 'updateCustomerCode',
    )
    if (updateCustomerItem) {
      updateCustomerCodeHandler(updateCustomerItem?.data?.data || updateCustomerItem)
    }
  } else {
    // 接收绑码组件：切换客户编码
    if (postMessage?.actionType === 'updateCustomerCode') {
      const updateMessage = {
        ...(postMessage?.data || {}),
        ...postMessage,
      }
      updateCustomerCodeHandler(updateMessage)
    }
  }
}

const { isLogin } = useLogin()

useDidShow(() => {
  if (!isLogin.value) {
    return
  }
  autoLoginHook({ needLogin: true })
})
</script>
