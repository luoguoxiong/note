import { useDidHide, useDidShow } from '@tarojs/taro'
import { ref } from 'vue'

export const useTabPageActive = () => {
  const isActive = ref(false)
  useDidShow(() => {
    isActive.value = true
  })

  useDidHide(() => {
    isActive.value = false
  })

  return isActive
}
