import { ref, onMounted, onUnmounted } from 'vue'
import {
  getToken,
  getUserInfoStorage,
  offStorageApplicationChange,
  offStorageTokenChange,
  offStorageUserInfoChange,
  onStorageApplicationChange,
  onStorageTokenChange,
  onStorageUserInfoChange,
} from '@public/storage'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { useDidShow } from '@tarojs/taro'

export enum CommonStorageType {
  'token' = 'token',
  'userInfo' = 'userInfo',
  'applicationInfo' = 'applicationInfo',
}

export interface CommonStorageProps {
  token?: boolean
  userInfo?: boolean
  applicationInfo?: boolean
  applicationChange?: () => void
}

export const useCommonStorage = (props: {
  token: boolean
  userInfo: boolean
  applicationInfo: boolean
  applicationChange: (value) => void
}) => {
  const userInfo = ref(getUserInfoStorage())
  const token = ref(getToken())
  const applicationInfo = ref([])
  const { autoLoginHook } = useAutoLogin()

  // 初始化拉取token
  const updateLoginStatus = () => {
    updateToken(getToken())
  }

  // 更新token信息
  const updateToken = (value: string) => {
    token.value = value
  }

  // 更新用户信息
  const updateUserInfo = (value) => {
    userInfo.value = value
  }

  // 更新轻应用信息
  const updateApplicationInfo = (value) => {
    applicationInfo.value = value
  }

  /**
   * 指定监听的storage 信息
   */
  const handleWatchEffect = () => {
    if (props.token) {
      onStorageTokenChange((data) => {
        console.log('token change', data)
        if (data?.value) {
          updateToken(data?.value)
        }
      })
    }
    if (props.userInfo) {
      onStorageUserInfoChange((data) => {
        console.log('userInfo change', data)
        if (data?.value) {
          updateUserInfo(data?.value)
        }
      })
    }
    if (props.applicationInfo) {
      onStorageApplicationChange((data) => {
        if (data?.value) {
          updateApplicationInfo(data?.value)
        }
        // 监听change事件
        if (props.applicationChange) {
          props.applicationChange(data?.value)
        }

        console.log('applicationInfo change', data)
      })
    }
  }

  const handleLoginEffect = () => {
    if (props.token) {
      /* 获取第一自动登录后的数据 */
      autoLoginHook().then(() => {
        updateLoginStatus()
      })
    }
  }

  useDidShow(() => {
    updateLoginStatus()
  })

  onMounted(() => {
    handleLoginEffect()
    handleWatchEffect()
  })

  onUnmounted(() => {
    if (props.token) {
      offStorageTokenChange()
    }
    if (props.userInfo) {
      offStorageUserInfoChange()
    }
    if (props.applicationInfo) {
      offStorageApplicationChange()
    }
  })

  return {
    userInfo,
    token,
    applicationInfo,
  }
}

// 双向绑定数据-使用参考
// const { token, userInfo } = useCommonStorage({
//   token: true,
//   userInfo: true,
//   applicationInfo: true,
//   applicationChange: (value) => {
//     return updateApplicationList(value)
//   },
// })
