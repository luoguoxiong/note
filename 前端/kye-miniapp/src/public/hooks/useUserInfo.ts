// import { useCommonDataHook } from '@public/storage/hooks/useCommonHook'
// import { DefaultGlobalData } from '@public/storage/hooks/useGeneralDataHook/type'
// import { ref } from 'vue'
// /* 实时用户信息 */
// export const useUserInfo = () => {
//   const { getUserInfo, onUserInfoChange, onGlobalDataChange } = useCommonDataHook()

//   const userInfo = ref<DefaultGlobalData['userInfo']>(getUserInfo())

//   onUserInfoChange(() => {
//     userInfo.value = getUserInfo()
//   })

//   onGlobalDataChange(() => {
//     userInfo.value = getUserInfo()
//   })

//   return { userInfo }
// }

import { useUserGlobalStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
/* 实时用户信息 */
export const useUserInfo = () => {
  const userGlobalStore = useUserGlobalStore()

  const { customerCode, userInfo } = storeToRefs(userGlobalStore)

  const userInfos = computed(() => {
    return {
      ...userInfo.value,
      customerCode: customerCode.value,
    }
  })

  return {
    userInfo: userInfos,
  }
}
