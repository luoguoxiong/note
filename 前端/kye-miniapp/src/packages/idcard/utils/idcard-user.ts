import { useUserInfo } from '@/public/hooks'
import { computed } from 'vue'

const { userInfo } = useUserInfo()

// /* 获取用户信息 */
// export const getUserInfoStorage = () => {
//   return Taro.getStorageSync('USER_INFO') || {}
// }

// /* 获取手机号 */
// export const getUserPhoneStorage = () => {
//   const userInfo = getUserInfoStorage()
//   return userInfo?.phone
// }

export const currentPhoneInStorage = computed(() => !!userInfo?.phone)
