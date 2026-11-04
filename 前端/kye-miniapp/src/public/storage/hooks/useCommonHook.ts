/* 常用数据获取，数据变更回调 */
import {
  getToken,
  getUserInfoStorage,
  onRefGlobalDataChange,
  onRefGlobalDataCustomerCodeChange,
  onRefGlobalDataCustomerInfoChange,
  onStorageApplicationChange,
  onStorageSwitchUserChange,
  onStorageTokenChange,
  onStorageUserInfoChange,
} from '@public/storage'
import { useGeneralDataHook } from '@public/storage/hooks/useGeneralDataHook'
import { GeneralData } from '@public/storage/hooks/useGeneralDataHook/defualtValue'
import { onUnmounted, Ref } from 'vue'
import { useUserGlobalStore } from '@/store'
import { storeToRefs } from 'pinia'

const { getGeneralDataWithKey } = useGeneralDataHook()

type CallbackFunction<T = any> = (value: T) => void

interface CommonHookContent {
  onTokenChange: (cb: CallbackFunction) => void
  onUserInfoChange: (cb: CallbackFunction) => void
  onApplicationChange: (cb: CallbackFunction) => void
  onCustomerInfoChange: (cb: CallbackFunction) => void
  onCustomerCodeChange: (cb: CallbackFunction) => void
  onGlobalDataChange: (cb: CallbackFunction) => void
  onSwitchUserChange: (cb: CallbackFunction) => void
  getCustomerInfo: () => GeneralData['customerInfo']
  getUserInfo: () => GeneralData['userInfo']
  getToken: () => string
  customerCode: Ref<string> // 响应式-客户编码
  customerInfo: Ref<GeneralData['customerInfo']> // 响应式-客户编码信息
  token: Ref<string> // 响应式-token
  phone: Ref<string> // 响应式-手机号
}

/** ========== 模块级单例 ========== */
/** 全局保存每类事件的全部回调 */
const globalCallbackMap = new Map<string, Set<CallbackFunction>>()

/** 只做一次的底层订阅 */
export const ensureSubscribeOnce = (() => {
  let inited = false
  return () => {
    if (inited) return
    inited = true

    const bind = (event: string, subscribeFn: (cb: (v: any) => void) => void) => {
      subscribeFn((value: any) => {
        const set = globalCallbackMap.get(event)
        if (!set) return
        set.forEach((cb) => {
          try {
            cb(value)
          } catch (e) {
            console.error(`[useCommonDataHook] ${event} callback error:`, e)
          }
        })
      })
    }

    bind('onTokenChange', (emit) => onStorageTokenChange((d) => emit(d?.value)))
    bind('onUserInfoChange', (emit) => onStorageUserInfoChange((d) => emit(d?.value)))
    bind('onApplicationChange', (emit) => onStorageApplicationChange((d) => emit(d?.value)))
    bind('onGlobalDataChange', (emit) => onRefGlobalDataChange((d) => emit(d?.value)))
    bind('onCustomerInfoChange', (emit) => onRefGlobalDataCustomerInfoChange((d) => emit(d?.value)))
    bind('onCustomerCodeChange', (emit) => onRefGlobalDataCustomerCodeChange((d) => emit(d?.value)))
    bind('onSwitchUserChange', (emit) => onStorageSwitchUserChange((d) => emit(d?.value)))
  }
})()

/** ========== Hook ========== */
export const useCommonDataHook = (): CommonHookContent => {
  ensureSubscribeOnce()

  /* 当前 hook 实例的回调集合 */
  const localCallbacks = new Map<string, Set<CallbackFunction>>()

  const addCallback = (event: string, cb: CallbackFunction) => {
    // 保存到本地集合（方便自动清理）
    let localSet = localCallbacks.get(event)
    if (!localSet) {
      localSet = new Set()
      localCallbacks.set(event, localSet)
    }
    localSet.add(cb)

    // 保存到全局集合
    let globalSet = globalCallbackMap.get(event)
    if (!globalSet) {
      globalSet = new Set()
      globalCallbackMap.set(event, globalSet)
    }
    globalSet.add(cb)
  }

  // 自动清理：页面卸载时清除当前 hook 注册的回调
  onUnmounted(() => {
    console.log('localCallbacks>>>', localCallbacks)
    localCallbacks.forEach((set, event) => {
      const globalSet = globalCallbackMap.get(event)
      if (globalSet) {
        set.forEach((cb) => globalSet.delete(cb))
      }
    })
    localCallbacks.clear()
  })
  // 全局响应式-用户信息
  const userGlobalStore = useUserGlobalStore()
  const { customerInfo, customerCode, phone, token } = storeToRefs(userGlobalStore)

  return {
    customerInfo,
    customerCode,
    phone,
    token,
    getToken,
    getUserInfo: () => getUserInfoStorage(),
    getCustomerInfo: () => getGeneralDataWithKey('customerInfo'),
    onTokenChange: (cb) => addCallback('onTokenChange', cb),
    onUserInfoChange: (cb) => addCallback('onUserInfoChange', cb),
    onApplicationChange: (cb) => addCallback('onApplicationChange', cb),
    onCustomerInfoChange: (cb) => addCallback('onCustomerInfoChange', cb),
    onCustomerCodeChange: (cb) => addCallback('onCustomerCodeChange', cb),
    onGlobalDataChange: (cb) => addCallback('onGlobalDataChange', cb),
    onSwitchUserChange: (cb) => addCallback('onSwitchUserChange', cb),
  }
}
