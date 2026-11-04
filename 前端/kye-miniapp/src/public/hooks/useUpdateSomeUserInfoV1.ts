import { useGeneralDataHook } from '@public/storage/hooks/useGeneralDataHook'
import { getSettingPageUserAndAuth, fetchUserInfoAndRefreshToken } from '@public/apis/user'
import { omit } from 'lodash-es'
import { useUserGlobalStore } from '@/store'
import { getAppUserRelationAuth } from '@layout/pages/mine/api'
import { loggedUpdateUserInfo } from '@/modules/user/pages/login/service'
import { updateRelaNameSwitch } from './useRedirectH5ToNative'

/**
 * @Desc: useUpdateSomeUserInfoV1 我的页整合用户信息/绑码/实名信息
 * @Date: 2025/12/3
 */
export const useUpdateSomeUserInfoV1 = () => {
  const { updateGlobalData, getGeneralData } = useGeneralDataHook()

  const globalUserStore = useUserGlobalStore()

  /* 获取我的页-整合用户信息/绑码/实名信息 */
  const getUserAndAuth = async () => {
    try {
      const result = await getSettingPageUserAndAuth()
      if (result) {
        const { userName, customerCode, customerShortName, hasCurBind, existedRelationBind, bindAuth, realNameVO } =
          result?.data
        const userInfoOther = omit(result?.data, [
          'customerCode',
          'customerShortName',
          'hasCurBind',
          'existedRelationBind',
          'bindAuth',
          'realNameVO',
        ])
        let globalData = getGeneralData()
        globalData = {
          ...globalData,
          userInfo: {
            ...globalData.userInfo,
            ...userInfoOther,
            userName,
          },
          customerInfo: {
            ...globalData.customerInfo,
            customerShortName,
            customerCode,
            hasCurBind,
            existedRelationBind,
            bindAuth,
          },
          real: {
            ...globalData.real,
            ...realNameVO,
          },
        }
        updateGlobalData(globalData)
      }
    } catch (error) {
      console.error('getUserAndAuth', error)
    }
  }
  /* 获取我的页面用户信息 */
  const getMinePageUserInfo = async () => {
    await getUserAndAuth()
  }
  /* 获取设置页用户信息 */
  const getSettingUserInfo = async () => {
    await getUserAndAuth()
  }

  const updateStorageUserRelationAuth = async () => {
    const { data: relationAuth } = await getAppUserRelationAuth()
    const globalData = getGeneralData()
    globalData.customerInfo = {
      ...globalData.customerInfo,
      ...relationAuth,
    }
    updateGlobalData(globalData)
  }

  const updateBaseUserInfo = async () => {
    try {
      const results = await fetchUserInfoAndRefreshToken()
      loggedUpdateUserInfo(results.data)
      updateRelaNameSwitch()
    } catch (error) {
      console.error('updateBaseUserInfo error:', error)
    }
  }

  return {
    updateBaseUserInfo,
    getMinePageUserInfo,
    getSettingUserInfo,
    updateStorageUserRelationAuth,
    globalUserStore,
  }
}
