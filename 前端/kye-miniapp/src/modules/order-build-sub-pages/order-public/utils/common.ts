import Taro from '@tarojs/taro'
import { isAliMiniApp, isWxMiniApp } from '@public/utils'
export const requestIdleCallbackIfAvailable = () => {
  return new Promise((resolve) => {
    if ('function' === typeof window.requestIdleCallback) {
      window.requestIdleCallback(function (deadline) {
        if (deadline.timeRemaining() > 1) {
          resolve(true)
        }
      })
    } else {
      setTimeout(() => {
        resolve(true)
      })
    }
  })
}

// 获取dom
export const getTaroDom = (selector: string) => {
  return new Promise((resolve) => {
    const query = Taro.createSelectorQuery()
    query.select(selector).boundingClientRect()
    query.exec((res) => {
      if (res && res[0]) {
        resolve(res[0])
      } else {
        resolve({})
      }
    })
  })
}

/**
 * 主动隐藏键盘
 */
export const hideKeyboardUtil = () => {
  Taro.hideKeyboard()
}

// 此处统一处理postMessage 数据返回的格式
export const convertPostMessage = (e, func) => {
  if (isWxMiniApp) {
    // 微信返回的是在data中 且是一个数组
    e.detail.data.forEach((item) => {
      func(item)
    })
  } else if (isAliMiniApp) {
    // 支付宝是对象
    func(e.detail.data)
  } else {
    func(e.detail.data)
  }
}
//富文本转成符合H5的渲染
export const htmlTagFilter = (value: string) => {
  try {
    return value?.replace(/span/g, 'text')
  } catch (e) {
    console.error(e)
    return value
  }
}
