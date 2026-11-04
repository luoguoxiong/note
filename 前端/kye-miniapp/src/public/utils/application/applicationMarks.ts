import Taro from '@tarojs/taro'
import { ApplicationItem } from './applicationType'

export const applicationMarks = new Map<string, ApplicationItem | null>()

export const setMarksByMenuCodes = (menuCodes: string[], marks: ApplicationItem[]) => {
  const userInfo = Taro.getStorageSync('USER_INFO')
  if (!userInfo.phone) {
    applicationMarks.clear()
    return
  }
  const marksMap = new Map<string, ApplicationItem>()

  marks.forEach((item) => {
    marksMap.set(item.menuCode, item)
  })

  menuCodes.forEach((code) => {
    const key = `${userInfo.phone}-${code}`
    applicationMarks.set(key, marksMap.get(code) ?? null)
  })
}

export const getAppMarks = () => {
  const userInfo = Taro.getStorageSync('USER_INFO')

  // 未登录：清空并返回空 Map
  if (!userInfo?.phone) {
    applicationMarks.clear()
    return new Map<string, ApplicationItem | null>()
  }

  const phonePrefix = `${userInfo.phone}-`
  const result = new Map<string, ApplicationItem | null>()

  applicationMarks.forEach((value, key) => {
    // 只取当前用户的数据
    if (key.startsWith(phonePrefix)) {
      const code = key.slice(phonePrefix.length)
      result.set(code, value)
    }
  })

  return result
}
