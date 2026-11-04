/**
 * @Desc: platform
 * @Date: 2025/7/8
 */
import { defineStore } from 'pinia'
import { AplusUserData } from '@public/utils/aplusConfig'
import { getStorageSyncPure } from '@public/storage'
import { isWxAppEnv } from '@public/utils'

type GlobalData = {
  aplusUserData: Record<string, any>
}

type LastUploadPage = { route: string; params?: Record<string, any> } | null
type AppPushParams = {
  jpushrid: string // 极光设备标识(极光sdk注册返回)
}

type MessageRouteItem = {
  pageName: string
  type: 'h5' | 'native' | 'miniProgram'
  url: string
  customParams: Record<string, any>
}

export const usePlatformStore = defineStore('platform', {
  state: () => ({
    isWxApp: isWxAppEnv || false, // 是否是微信端APP
    aplusUserData: {} as AplusUserData,
    userLastUnloadPage: null as LastUploadPage, // 用户相关：上一个卸载的路由信息
    // appPushParams app插件配置
    appPushParams: {
      jpushrid: '',
    } as AppPushParams,
    messageRouteMap: (getStorageSyncPure('GLOBAL_MESSAGE_ROUTES') || []) as MessageRouteItem[], // 消息中心路由配置
  }),
  getters: {
    isWeixinApp: (state) => state.isWxApp,
  },
  actions: {
    set<K extends keyof GlobalData>(key: K, value: GlobalData[K]) {
      this[key] = value
    },
    get<K extends keyof GlobalData>(key: K): GlobalData[K] {
      return this[key]
    },
    setAppPushParams(value: AppPushParams) {
      this.appPushParams = value
    },
    setMessageRouteMap(value: any) {
      this.messageRouteMap = value
    },
  },
})
