import Taro from '@tarojs/taro'

/**
 * @Desc: useShowToast
 * @Date: 2025/7/1
 */
export const showToast = (data: string | { message: string }) => {
  if (typeof data === 'string') return Taro.showToast({ title: data, icon: 'none' })

  return Taro.showToast({ title: data?.message, icon: 'none' })
}
