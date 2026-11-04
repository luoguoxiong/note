import { onBeforeUnmount, onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'

export type NetworkWeakType = {
  networkType: string // 网络类型
  weakNet?: boolean //是否弱网
  errMsg?: string // 弱网错误
}

interface AnyObject {
  [key: string]: any
}

interface UseNetWorkHookProps {
  onNetworkWeakChange?: (e: NetworkWeakType) => void
}

/* 网络检测hook */
export default function useNetWorkHook({ onNetworkWeakChange = null }: UseNetWorkHookProps = {}) {
  const networkType = ref(null)
  const checkNetwork = () => {
    if (!Taro.getNetworkType) {
      return
    }
    return Taro.getNetworkType({
      success(res: NetworkWeakType) {
        networkType.value = res.networkType // 存储当前网络类型
        // 弱网网络触发-弱网状态change
        if (res?.weakNet && onNetworkWeakChange) {
          onNetworkWeakChange(res)
        }
      },
      fail(err) {
        console.error('网络状态获取失败:', err)
      },
    })
  }

  // 设置网络弱网状态变化监听(仅弱网触发)
  const setupNetworkWeakListener = () => {
    if (Taro.onNetworkWeakChange) {
      Taro.onNetworkWeakChange((res: NetworkWeakType) => {
        console.log('网络状态变化:', res)
        networkType.value = res.networkType

        // 如果传入了回调函数，调用回调
        setupNetworkListenerDone(res)
      })
      return
    }

    if (Taro.onNetworkStatusChange) {
      Taro.onNetworkStatusChange((res) => {
        networkType.value = res.networkType
        // 如果传入了回调函数，调用回调
        setupNetworkListenerDone(res)
      })
      return
    }
  }

  // 清理网络监听
  const cleanupNetworkListener = () => {
    if (Taro.offNetworkWeakChange) {
      Taro.offNetworkWeakChange()
    }
    if (Taro.offNetworkStatusChange) {
      Taro.offNetworkStatusChange()
    }
  }

  const setupNetworkListenerDone = (res) => {
    // 如果传入了回调函数，调用回调
    if (onNetworkWeakChange) {
      onNetworkWeakChange(res)
    }
  }

  // 组件挂载后进行网络检查并开始监听
  onMounted(() => {
    checkNetwork()
    // 存在弱网回调,触发弱网监听
    if (onNetworkWeakChange) {
      setupNetworkWeakListener()
    }
  })

  // 组件卸载前清理监听
  onBeforeUnmount(() => {
    cleanupNetworkListener()
  })
  return {
    networkType,
    cleanupNetworkListener,
  }
}
