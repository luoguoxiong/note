import { isAliMiniApp } from '@/public/utils/device'
import Taro from '@tarojs/taro'
import { computed } from 'vue'
const systemInfoValue = Taro.getSystemInfoSync()
const { platform } = systemInfoValue

export const isAndroidAlipay = computed(() => {
  return isAliMiniApp && ['android', 'Android'].includes(platform)
})
