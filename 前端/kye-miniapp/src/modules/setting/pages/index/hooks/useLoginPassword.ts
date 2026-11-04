import { computed, ref } from 'vue'
import { useDidShow } from '@tarojs/taro'
import { useApplication } from '@public/utils/application/useApplication'
import { useUserInfo } from '@public/hooks'
import { loginFromType } from '@public/constants'
import { fetchUserAccountInfo } from '@modules/user/apis/user'
import { useLoginPublicParmas } from '@modules/user/pages/login/components/phone-login/hooks'

const LOGIN_PASSWORD_TEXT = {
  set: '去设置',
  modify: '去修改',
}

export const useLoginPasswordSetting = () => {
  // 是否设置过密码 (0：未设置，1：已设置)
  const isSettingPassword = ref<1 | 2 | 0>(0)
  // 是否接口请求完毕
  const isApiReady = ref<boolean>(false)
  const { navigateApplicationWithName } = useApplication()
  const { userInfo } = useUserInfo()
  console.log('userInfo.value', userInfo.value)

  const isSettingText = computed(() => {
    if (!isApiReady.value) {
      return ''
    }
    return isSettingPassword.value === 1 ? LOGIN_PASSWORD_TEXT['modify'] : LOGIN_PASSWORD_TEXT['set']
  })

  const loginPubliParams = useLoginPublicParmas()

  /* 查询用户是否已设置过密码 */
  const userAccountInfo = async () => {
    try {
      const res = await fetchUserAccountInfo()
      console.log('查询用户是否已设置过密码', res)
      /* 设置密码状态，0：未设置，1：已设置 */
      if (res && res.data?.passwordStatus !== undefined) {
        isSettingPassword.value = res.data?.passwordStatus || 0
      }
      console.log(res)
    } catch (e) {
      console.error(e)
    }
  }
  /* 跳转密码设置H5 */
  const goSettingPasswordH5Page = () => {
    const { deviceCode, deviceType } = loginPubliParams || {}
    navigateApplicationWithName({
      name: '用户-密码设置',
      queryParams: {
        deviceCode,
        deviceType,
        registerFlag: userInfo.value?.newRegisterFlag,
        from: loginFromType,
        type: 1,
        xEnvid: 2497, // TODO 泳道配置-待移除
      },
    })
  }
  /* 跳转密码修改H5 */
  const goUpdatePasswordH5Page = () => {
    const { deviceCode, deviceType } = loginPubliParams || {}
    navigateApplicationWithName({
      name: '用户-密码修改',
      queryParams: {
        deviceCode,
        deviceType,
        registerFlag: userInfo.value?.newRegisterFlag,
        from: loginFromType,
        xEnvid: 2497, // TODO 泳道配置-待移除
      },
    })
  }
  const goAccountCancellationH5Page = () => {}

  useDidShow(async () => {
    await userAccountInfo()
    isApiReady.value = true
  })

  return {
    isSettingPassword,
    isSettingText,
    goSettingPasswordH5Page,
    goUpdatePasswordH5Page,
    goAccountCancellationH5Page,
  }
}
