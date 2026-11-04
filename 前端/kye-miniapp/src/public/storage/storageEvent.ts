import Taro from '@tarojs/taro'
import { wrapAddEventListener, wrapRemoveEventListener } from './event-helper'

// 定义事件中心
const storageEventCenter = Taro.eventCenter

/* storage数据事件类型 */
export enum StorageEventType {
  applicationInfoList = 'storageApplicationChange',
  TOKEN = 'storageTokenChange',
  USER_INFO = 'storageUserInfoChange',
}
/* ref数据事件类型 */
export enum RefEventType {
  GLOBAL_DATA_CHANGE = 'GLOBAL_DATA_CHANGE', // 通用数据变更事件
  GLOBAL_DATA_USER_INFO_CHANGE = 'GLOBAL_DATA_USER_INFO_CHANGE', // 通用数据-用户信息变更事件
  GLOBAL_DATA_CUSTOMER_INFO_CHANGE = 'GLOBAL_DATA_CUSTOMER_INFO_CHANGE', // 通用数据-客户编码信息-变更事件
  GLOBAL_DATA_CUSTOMER_CODE_CHANGE = 'GLOBAL_DATA_CUSTOMER_CODE_CHANGE', // 通用数据-客户编码code-变更事件
  GLOABAL_WAYBILL_SEARCH = 'GLOABAL_WAYBILL_SEARCH', // 查件数据-更新
  GLOABAL_WAYBILL_ROUTE = 'GLOABAL_WAYBILL_ROUTE', // 查件路由-更新
  GLOBAL_SWITCH_USER = 'GLOBAL_SWITCH_USER', // 切换手机号
}

export const EventTypeMap = {
  ...StorageEventType,
  ...RefEventType,
}

/* 触发事件类型 */
export const storageEventCenterTrigger = (key, value) => {
  const eventKeyType = key ? EventTypeMap[key] : null
  if (eventKeyType) {
    storageEventCenter.trigger(eventKeyType, { key, value })
  }
}

// 封装 setStorage
export const setStorage = (key, value) => {
  Taro.setStorage({ key, data: value }).then(() => {
    storageEventCenter.trigger('storageChange', { key, value })
    storageEventCenterTrigger(key, value)
  })
}
// 封装 setStorageSync
export const setStorageSync = (key, value) => {
  Taro.setStorageSync(key, value)
  storageEventCenter.trigger('storageChange', { key, value })
  storageEventCenterTrigger(key, value)
}

// 封装 removeStorage
export const removeStorage = (key) => {
  Taro.removeStorage({ key }).then(() => {
    storageEventCenter.trigger('storageChange', { key, value: null })
    storageEventCenterTrigger(key, null)
  })
}
// 封装 removeStorageSync
export const removeStorageSync = (key) => {
  Taro.removeStorageSync(key)
  storageEventCenter.trigger('storageChange', { key, value: null })
  storageEventCenterTrigger(key, null)
}
// 通用数据变化通知
export const GlobalDataChangeEventTrigger = (value) => {
  storageEventCenterTrigger(RefEventType.GLOBAL_DATA_CHANGE, value)
}
// 通用数据-key对应value变化通知
export const GlobalDataKeyValueEventTrigger = (key, value) => {
  storageEventCenterTrigger(key, value)
  storageEventCenterTrigger(RefEventType.GLOBAL_DATA_CHANGE, value)
}

// 暴露事件中心
export const onStorageChange = wrapAddEventListener(
  storageEventCenter.on.bind(storageEventCenter, 'storageChange'),
  'storageChange',
)
export const offStorageChange = wrapRemoveEventListener(
  storageEventCenter.off.bind(storageEventCenter, 'storageChange'),
  'storageChange',
)
/* 轻应用列表变化监听 */
export const onStorageApplicationChange = wrapAddEventListener(
  storageEventCenter.on.bind(storageEventCenter, StorageEventType.applicationInfoList),
  StorageEventType.applicationInfoList,
)
export const offStorageApplicationChange = wrapRemoveEventListener(
  storageEventCenter.off.bind(storageEventCenter, StorageEventType.applicationInfoList),
  StorageEventType.applicationInfoList,
)
/* token变化监听事件 */
export const onStorageTokenChange = wrapAddEventListener(
  storageEventCenter.on.bind(storageEventCenter, StorageEventType.TOKEN),
  StorageEventType.TOKEN,
)
export const offStorageTokenChange = wrapRemoveEventListener(
  storageEventCenter.off.bind(storageEventCenter, StorageEventType.TOKEN),
  StorageEventType.TOKEN,
)

/* 用户信息变化监听 */
export const onStorageUserInfoChange = wrapAddEventListener(
  storageEventCenter.on.bind(storageEventCenter, StorageEventType.USER_INFO),
  StorageEventType.USER_INFO,
)
export const offStorageUserInfoChange = wrapRemoveEventListener(
  storageEventCenter.off.bind(storageEventCenter, StorageEventType.USER_INFO),
  StorageEventType.USER_INFO,
)

/* 通用信息信息变化监听 */
export const onRefGlobalDataChange = storageEventCenter.on.bind(storageEventCenter, RefEventType.GLOBAL_DATA_CHANGE)
export const offRefGlobalDataChange = storageEventCenter.off.bind(storageEventCenter, RefEventType.GLOBAL_DATA_CHANGE)

/* 通用信息- 客户编码信息变化监听 */
export const onRefGlobalDataCustomerInfoChange = wrapAddEventListener(
  storageEventCenter.on.bind(storageEventCenter, RefEventType.GLOBAL_DATA_CUSTOMER_INFO_CHANGE),
  RefEventType.GLOBAL_DATA_CUSTOMER_INFO_CHANGE,
)
export const offRefGlobalDataCustomerInfoChange = wrapRemoveEventListener(
  storageEventCenter.off.bind(storageEventCenter, RefEventType.GLOBAL_DATA_CUSTOMER_INFO_CHANGE),
  RefEventType.GLOBAL_DATA_CUSTOMER_INFO_CHANGE,
)

/* 通用信息- 客户编码code变化监听 */
export const onRefGlobalDataCustomerCodeChange = wrapAddEventListener(
  storageEventCenter.on.bind(storageEventCenter, RefEventType.GLOBAL_DATA_CUSTOMER_CODE_CHANGE),
  RefEventType.GLOBAL_DATA_CUSTOMER_CODE_CHANGE,
)
export const offRefGlobalDataCustomerCodeChange = wrapRemoveEventListener(
  storageEventCenter.off.bind(storageEventCenter, RefEventType.GLOBAL_DATA_CUSTOMER_CODE_CHANGE),
  RefEventType.GLOBAL_DATA_CUSTOMER_CODE_CHANGE,
)

/* 查件搜索更新 */
export const onRefGlobalDataWaybillSearchChange = storageEventCenter.on.bind(
  storageEventCenter,
  RefEventType.GLOABAL_WAYBILL_SEARCH,
)

export const offRefGlobalDataWaybillSearchChange = storageEventCenter.off.bind(
  storageEventCenter,
  RefEventType.GLOABAL_WAYBILL_SEARCH,
)

/** 全局刷新-再次进入列表页面刷新 */
export const triggerWaybillSearch = (parmas?: any) => {
  storageEventCenterTrigger(RefEventType.GLOABAL_WAYBILL_SEARCH, parmas)
}

/* 查件列表更新 */
export const onRefGlobalDataWaybillRouteChange = storageEventCenter.on.bind(
  storageEventCenter,
  RefEventType.GLOABAL_WAYBILL_ROUTE,
)

export const offRefGlobalDataWaybillRouteChange = storageEventCenter.off.bind(
  storageEventCenter,
  RefEventType.GLOABAL_WAYBILL_ROUTE,
)

/** 全局刷新-再次进入路由页面刷新 */
export const triggerWaybillRoute = (parmas?: any) => {
  storageEventCenterTrigger(RefEventType.GLOABAL_WAYBILL_ROUTE, parmas)
}

/* 切换用户trigger */
export const triggerSwitchUserChange = (value) => {
  console.log('triggerSwitchUserChange', value)
  storageEventCenterTrigger(RefEventType.GLOBAL_SWITCH_USER, value)
}

/* 切换用户-用户信息变化监听 */
export const onStorageSwitchUserChange = storageEventCenter.on.bind(storageEventCenter, RefEventType.GLOBAL_SWITCH_USER)
export const offStorageSwitchUserChange = storageEventCenter.off.bind(
  storageEventCenter,
  RefEventType.GLOBAL_SWITCH_USER,
)
