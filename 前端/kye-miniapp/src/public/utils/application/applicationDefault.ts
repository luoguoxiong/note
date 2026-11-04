import { AreaItem } from '@/public/utils/application/applicationType'
import useApplicationStorage from './useApplicationStorage'
import Taro from '@tarojs/taro'

interface DefaultDataIn {
  status: 0 | 1 | -1
  application: AreaItem[]
}

export let APP_DEFAULT_DATA: DefaultDataIn = {
  status: 0,
  application: [],
}

// 用于缓存首次加载的 Promise
let loadingPromise: Promise<DefaultDataIn> | null = null

/**
 * 同步获取默认数据
 * 如果数据还没加载，会返回初始状态
 */
export const getDefaultApplicationSync = (): AreaItem[] => {
  return APP_DEFAULT_DATA.application
}

/**
 * 异步初始化一次默认数据
 * 推荐在应用启动阶段调用
 * —— 即使调用多次，也只会真正加载一次
 */
export const getDefaultApplication = (): Promise<DefaultDataIn> => {
  // 已加载成功：直接返回
  if (APP_DEFAULT_DATA.status === 1) {
    return Promise.resolve(APP_DEFAULT_DATA)
  }

  // 已经在加载：复用 loadingPromise
  if (loadingPromise) {
    return loadingPromise
  }

  // 第一次开始加载，创建 Promise 并缓存
  loadingPromise = new Promise((res) => {
    const startTime = Date.now()

    __non_webpack_require__('~/libs/application/index.js', ({ application }: DefaultDataIn) => {
      console.error('默认数据加载成功：', (Date.now() - startTime) / 1000, application)
      APP_DEFAULT_DATA = {
        application,
        status: 1,
      }

      try {
        const applicationInfoList = Taro.getStorageSync('applicationInfoList')
        if (!applicationInfoList) {
          useApplicationStorage().setApplicationStorage(application)
        }
      } catch (error) {
        useApplicationStorage().setApplicationStorage(application)
      }

      loadingPromise = null // 清除 Promise 缓存
      res(APP_DEFAULT_DATA)
    })
  })

  return loadingPromise
}
