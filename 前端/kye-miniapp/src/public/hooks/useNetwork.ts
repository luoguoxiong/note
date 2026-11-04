import { ref, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'

export function useNetwork() {
  // 是否已连接
  const isConnected = ref(true)
  // 网络类型：wifi / 4g / 3g / 2g / unknown / none
  const networkType = ref<'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown' | 'none'>('unknown')

  const updateNetwork = (res: Taro.onNetworkStatusChange.CallbackResult) => {
    isConnected.value = res.isConnected
    networkType.value = res.networkType as typeof networkType.value
  }

  onMounted(() => {
    // 先获取一次当前网络状态
    Taro.getNetworkType().then((res) => {
      networkType.value = res.networkType as typeof networkType.value
      isConnected.value = res.networkType !== 'none'
    })

    // 监听网络变化
    Taro.onNetworkStatusChange(updateNetwork)
  })

  onUnmounted(() => {
    // 解绑监听
    Taro.offNetworkStatusChange(updateNetwork)
  })

  return {
    isConnected,
    networkType,
  }
}
