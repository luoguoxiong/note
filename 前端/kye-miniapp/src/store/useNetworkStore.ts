import { defineStore } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'

export const useNetworkStore = defineStore('network', () => {
  const isConnected = ref(true)

  const randowKey = ref(0)
  const networkType = ref<'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown' | 'none'>('unknown')

  const updateNetwork = (res: Taro.onNetworkStatusChange.CallbackResult) => {
    isConnected.value = res.isConnected
    networkType.value = res.networkType as typeof networkType.value
    if (isConnected.value) {
      randowKey.value += 1
    }
  }

  const getNeteWorkStatus = async () => {
    const res = await Taro.getNetworkType()
    networkType.value = res.networkType as typeof networkType.value
    isConnected.value = res.networkType !== 'none'
  }

  onMounted(async () => {
    await getNeteWorkStatus()
    Taro.onNetworkStatusChange(updateNetwork)
  })

  onUnmounted(() => {
    Taro.offNetworkStatusChange(updateNetwork)
  })

  return {
    getNeteWorkStatus,
    isConnected,
    networkType,
    randowKey,
  }
})
