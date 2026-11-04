import { computed, ref } from 'vue'
import { useUserInfo } from '@public/hooks'
import { getLoginFromType } from '@public/constants'
import { ssoChangeAccountBackApi } from '@modules/setting/apis'
import { loginSuccess } from '@modules/user/pages/login/service'
import Taro from '@tarojs/taro'
import { usePlatformStore } from '@/store/platform'
import { useLoginPublicParmas } from '@/modules/user/pages/login/components/phone-login/hooks'
import { useUserGlobalStore } from '@/store/user'

/**
 * @Desc: useLoginWhiteList 切换客户手机号<白名单弹窗>
 * @Date: 2025/7/18
 */
export const useLoginWhiteListSetting = () => {
  const showWhite = ref<boolean>(false) // 是否显示白名单弹窗
  const showWhiteGoBack = ref<boolean>(false) // 是否展示切回自己手机号
  const { userInfo } = useUserInfo()
  const platformStore = usePlatformStore()
  console.log('Taro.getApp().globalData.aplusUserData', Taro.getApp())

  // 是否是超级白名单
  const whiteListUser = computed(() => {
    const userInfoValue = userInfo?.value as any
    return !!userInfoValue?.ecasToken?.whiteListUser && !userInfoValue?.isBorrowTelNo
  })

  // 是否展示按钮-返回自己手机号
  const showBackSelfBtn = computed(() => {
    const userInfoValue = userInfo?.value as any
    return showWhiteGoBack.value || userInfoValue?.isBorrowTelNo
  })

  // 是否展示按钮-切换登录手机号
  const showSwitchPhoneBtn = computed(() => {
    // TODO 暂时移除生产屏蔽
    // if (process.env.TARO_APP_ENV === 'prod') {
    //   return false
    // }
    const userInfoValue = userInfo?.value as any
    return !(showWhiteGoBack.value || userInfoValue?.isBorrowTelNo)
  })

  const setShowWhiteGoBack = (value) => {
    showWhiteGoBack.value = value
  }

  const handleCancelWhite = () => {}

  /* 切换客户按钮confirm事件 */
  const handleConfirmWhite = () => {
    setShowWhiteGoBack(true)
    Taro.switchTab({ url: '/layout/pages/mine/index' })
  }

  /* 切回自己按钮 */
  const handleGoBack = async (callBack?: Function) => {
    Taro.showLoading({ mask: true, title: '加载中...' })
    try {
      await ssoChangeAccountBack(callBack)
      setShowWhiteGoBack(false)
    } finally {
      Taro.hideLoading()
    }
  }
  const { deviceCode, deviceId, deviceType, systemVersion } = useLoginPublicParmas()
  const globalUserStore = useUserGlobalStore()
  /* 切回自己接口调用 */
  const ssoChangeAccountBack = (callBack?: Function) => {
    return new Promise(async (resolve, reject) => {
      try {
        const from = getLoginFromType()
        const openId = globalUserStore.getOpenId
        console.log('openId2', openId)
        const { code, data } = await ssoChangeAccountBackApi({
          openId,
          from,
          deviceCode,
          deviceId,
          deviceType,
          systemVersion,
        })
        if (code !== 0) {
          reject(data)
        }
        if (!data) {
          Taro.redirectTo({
            url: '/modules/user/pages/login/index',
          })
          return
        }
        if (data) {
          const loginData = data as any
          loginData.isBorrowTelNo = null
          loginSuccess({
            ...loginData,
            ...(loginData?.userLoginInfoResponse as any),
            allowCheckFlag: loginData.allowCheckFlag,
            userStatus: loginData.userStatus,
          })
          callBack && callBack()
        }
        resolve(data)
        return data
      } catch (e) {
        reject(e)
      }
    })
  }

  return {
    showWhite,
    whiteListUser,
    showWhiteGoBack,
    showBackSelfBtn,
    showSwitchPhoneBtn,
    handleConfirmWhite,
    handleCancelWhite,
    handleGoBack,
  }
}
