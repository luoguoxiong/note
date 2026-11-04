import Taro from '@tarojs/taro'

// 定义事件中心
const storageEventCenter = Taro.eventCenter

export enum StorageEventType {
  applicationInfoList = 'storageApplicationChange',
  TOKEN = 'storageTokenChange',
  USER_INFO = 'storageUserInfoChange',
}

export const storageEventCenterTrigger = (key, value) => {
  const eventKeyType = key ? StorageEventType[key] : null
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

// 暴露事件中心
export const onStorageChange = storageEventCenter.on.bind(storageEventCenter, 'storageChange')
export const offStorageChange = storageEventCenter.off.bind(storageEventCenter, 'storageChange')
/* 轻应用列表变化监听 */
export const onStorageApplicationChange = storageEventCenter.on.bind(
  storageEventCenter,
  StorageEventType.applicationInfoList,
)
export const offStorageApplicationChange = storageEventCenter.off.bind(
  storageEventCenter,
  StorageEventType.applicationInfoList,
)
/* token变化监听事件 */
export const onStorageTokenChange = storageEventCenter.on.bind(storageEventCenter, StorageEventType.TOKEN)
export const offStorageTokenChange = storageEventCenter.off.bind(storageEventCenter, StorageEventType.TOKEN)
