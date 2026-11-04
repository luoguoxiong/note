<template>
  <view></view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { CheckVersionResponse } from '@/public/apis/version/types'
import { useAppVersion } from '@/public/components/business/version-manage-popup/platform'
import { MINI_APP_VERSION } from '@/public/constants'
import { isWxAppIosEnv } from '@/public/utils'
import { useRouter } from '@tarojs/taro'
import { onMounted } from 'vue'
import useVersionManage from '@/public/components/business/version-manage-popup/hooks/useVersionManage'

defineOptions({ name: 'updateAPP' })

const params = useRouter().params

const { handleAppUpdate, handleAndroidInstallUpdateApk } = useAppVersion()
const { fetchAppVersion } = useVersionManage()

/* 检查是否有新版本 */
const checkHasNewAppVersion = (versionInfo: CheckVersionResponse) => {
  const { versionNo } = versionInfo
  return versionNo && MINI_APP_VERSION && MINI_APP_VERSION !== versionNo
}

const toast = async (message: string) => {
  Taro.showToast({ title: message, icon: 'none', duration: 1200 })
  await new Promise((r) => setTimeout(r, 1200))
}

onMounted(async () => {
  let versionInfo: CheckVersionResponse = { versionNo: MINI_APP_VERSION }

  try {
    const { data } = await fetchAppVersion(params.location || '20')
    versionInfo = data
  } catch (e) {
    await toast(e.message)
    Taro.navigateBack()
    return
  }

  if (!checkHasNewAppVersion(versionInfo)) {
    await toast('当前已是最新版本')
    Taro.navigateBack()
    return
  }
  Taro.navigateBack()

  await handleAppUpdate(versionInfo)
  if (!isWxAppIosEnv) {
    handleAndroidInstallUpdateApk(versionInfo)
  }
})
</script>
