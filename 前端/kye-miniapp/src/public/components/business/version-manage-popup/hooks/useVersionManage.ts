import Taro from '@tarojs/taro'
import { ApiVersionManagerCheckVersion } from '@public/apis/version'
import { getUserPhoneStorage } from '@public/storage'
import { isWeixinAppSync } from '@public/config'
import { isWxAppIos } from '@public/appPlugins/utils/device'
import { MINI_APP_VERSION } from '@public/constants'
import { ref } from 'vue'
import { useCommonDataHook } from '@public/storage/hooks/useCommonHook'

enum TouchLocation {
  '首页' = '10',
  '设置页' = '20',
}

interface NoTipVersion {
  version: string
  date: string // yyyy-MM-dd
}

/* APP升级存储 Key - 用于 */
const STORAGE_KEY = 'NO_TIP_APP_VERSIONS'

/* 强制升级弹窗是否开启 */
const showForceVersionPopup = ref(false)

/**
 * @Desc: useVersionManage
 * @Date: 2025/8/26
 */
const useVersionManage = () => {
  const fetchAppVersion = async (location) => {
    const isWeixinApp = isWeixinAppSync()
    // 是否app端
    if (!isWeixinApp) {
      return Promise.reject(false)
    }
    const isWxAppIOS = await isWxAppIos()
    const { customerCode } = useCommonDataHook()
    console.log('customerCode', customerCode?.value)
    // 调试
    // const params = {
    //   appType: 'android',
    //   appVersion: 'v7.67.0',
    //   grayCustomer: '075523119960',
    //   grayPhone: '13072111116',
    //   touchLocation: 20,
    // }
    const params = {
      grayPhone: getUserPhoneStorage(),
      appType: isWxAppIOS ? 'ios' : 'android',
      appVersion: MINI_APP_VERSION,
      grayCustomer: customerCode?.value,
      touchLocation: location || TouchLocation['首页'],
    }
    console.log('[app update]fetchAppVersion>>>', params)
    return ApiVersionManagerCheckVersion(params)
  }

  /* 获取存储的不升级安装包数据（返回对象数组） */
  const storageGetUpdatedAppVersion = (): NoTipVersion[] => {
    try {
      const list = Taro.getStorageSync(STORAGE_KEY)
      return Array.isArray(list) ? list : []
    } catch {
      return []
    }
  }

  /* 追加一条升级今日不提醒，最多保留10条 */
  const storageAddNoTipAppVersion = (version: string) => {
    if (!version) return

    const today = new Date().toISOString().slice(0, 10) // yyyy-MM-dd
    const list = storageGetUpdatedAppVersion()

    // 去重：同一个版本只保留最新日期
    const filtered = list.filter((item) => item.version !== version)

    // 插入最新版本记录
    filtered.unshift({ version, date: today })

    // 限制最多 10 条
    const newList = filtered.slice(0, 10)

    Taro.setStorageSync(STORAGE_KEY, newList)
  }

  /* 判断某个版本是否在今天已设置为不提醒 */
  const storageIsNoTipToday = (version: string): boolean => {
    if (!version) return false
    const today = new Date().toISOString().slice(0, 10)
    return storageGetUpdatedAppVersion().some((item) => item.version === version && item.date === today)
  }

  /* 获取强制升级弹窗状态 */
  const checkForceVersionPopupShow = () => {
    return showForceVersionPopup.value
  }

  const setForceVersionPopupShow = (value: boolean) => {
    showForceVersionPopup.value = value
  }

  return {
    fetchAppVersion,
    storageAddNoTipAppVersion,
    storageIsNoTipToday,
    checkForceVersionPopupShow,
    setForceVersionPopupShow,
  }
}

export default useVersionManage
