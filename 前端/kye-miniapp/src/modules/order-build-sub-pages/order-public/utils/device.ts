import Taro, { ENV_TYPE } from '@tarojs/taro'
import { isWechatEnv, isWxPcAppletEnv } from '@/public/utils'

const ua = navigator.userAgent
export const isIpad = /(iPad).*OS\s([\d_]+)/.test(ua)
export const isAndroid = /(Android);?[\s/]+([\d.]+)?(.*Mobile)/.test(ua)
export const isIphone = !isIpad && /(iPhone\sOS)\s([\d_]+)/.test(ua)
export const isWechat = isWechatEnv
export const isAlipay = /alipayclient/i.test(ua)
export const isWxApplet = isWechatEnv
// export const isWxPcApplet = /MiniProgramEnv\/Windows/i.test(ua) || /MiniProgramEnv\/Mac/i.test(ua)
export const isWxPcApplet = isWxPcAppletEnv
export const isIpod = /(iPod)(.*OS\s([\d_]+))?/.test(ua)
export const isAndroidPad = /^(?!.*Mobile).*(Android);?[\s/]+([\d.]+)?/.test(ua)
export const isAppBrowse = /appType=/.test(ua)
export const isKuaSheng = /kuasheng-2.0/.test(ua.toLowerCase())
export const isWxwork = isWechat && /WxWork/i.test(ua)
export const isAppiOS = isAppBrowse && isIphone
export const isAppAndroid = isAppBrowse && isAndroid
export const isApp = isAppiOS || isAppAndroid
export const isClient = isApp || isAndroidPad || isIpad
export const isWxAppletAndroid = isWxApplet && isAndroid
export const isWxAppletI0S = isWxApplet && isIphone
import { localStorage } from '@order-public-sub-public/utils/storage'
// ua 判断是否离线包
export const isOfflinePackage = /(OfflinePackage)/.test(ua)

export const isAliPayClient = navigator.userAgent.indexOf('AliApp') > -1 || localStorage?.getItem('isAliPayClient') // 测试,待删除
export const isAmapApp = /AMAP/i.test(ua) //高德小程序
// 支付宝小程序和高德小程序的判断
export const aliPayOrAMapApp = isAliPayClient || isAmapApp

const DESIGN_BASE = 375
export const getCSSRatio = () => (window?.screen?.width || DESIGN_BASE * 1.5) / DESIGN_BASE // 获取当前设备 css 像素相对于设计稿的比值

const checkOptionalCatchBinding = () => {
  let result = true
  try {
    // 使用 new Function 替代 eval
    new Function("try { throw new Error('test'); } catch { console.log('x'); }")()
    console.log('支持catch不带括号')
  } catch (e) {
    console.log('不支持catch不带括号的语法', e)
    result = false
  }
  return result
}

const checkBaseEs2015 = () => {
  const tests = [
    '() => {}',
    'class MyClass {}',
    'let myLetVar = 1; const myConstVar = 2;',
    '(function(a = 1) { return a; })',
  ]

  let result = true

  try {
    // 测试每个语法
    for (const code of tests) {
      new Function(code)()
    }

    // 测试 Promise
    new Promise((resolve) => resolve('Promise supported'))

    console.log('支持基本ES2015语法')
  } catch (error) {
    console.log('不支持上述es2015语法', error)
    result = false
  }

  return result
}

/**
 * @description 检查浏览器兼容性，支持返回true，不支持返回false
 */
export const checkBrowserSupportEs2015 = () => {
  // 默认返回true
  const result = true

  if (!checkBaseEs2015()) {
    console.log('不支持es2015语法')
    return false
  }

  if (typeof Proxy === 'undefined') {
    // 检测 Proxy 对象，该对象没法被polyfill
    console.log('不支持proxy')
    return false
  }

  console.log('支持proxy')

  // 检测是否支持catch不带括号语法，vue-cropper源码中有这个
  if (!checkOptionalCatchBinding()) {
    return false
  }

  const match = ua.match(/Chrome\/(\d+)/)

  // 检测为chrome 66 以下
  if (match && parseInt(match[1], 10) < 66) {
    console.log('谷歌浏览器小于66版本')
    return false
  }

  return result
}

/**
 * @description 获取浏览器版本号
 * @returns
 */
export const getBrowserVersion = () => {
  let version = ''
  if (isWxApplet) {
    const match = ua.match(/miniProgram\/(\d+\.\d+\.\d+)/)
    if (match) {
      version = match[1]
    }
  } else if (isWxPcApplet) {
    const match = ua.match(/MicroMessenger\/(\d+\.\d+\.\d+)/)
    if (match) {
      version = match[1]
    }
  } else if (isIphone || isIpad) {
    const match = ua.match(/AppleWebKit\/(\d+\.\d+\.\d+)?/)
    if (match) {
      version = match[1]
    }
  } else if (isAndroid || isAndroidPad) {
    const match = ua.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/)
    if (match) {
      version = match[1]
    }
  }

  return version
}

export const getEnv = () => {
  return Taro.getEnv()
}

/* 获取平台环境变量控件 */
export const getBridgeModule = () => {
  const env = getEnv()
  let bridge = {
    aplus_queue: {} as any,
    $umapm: {} as any,
  }
  switch (env) {
    case ENV_TYPE.ALIPAY:
      bridge = my
      break
    case ENV_TYPE.WEAPP:
      bridge = wx
      break
  }
  return bridge
}

export function getDeviceModel() {
  const ua = navigator.userAgent

  // iOS
  if (/iPhone/.test(ua)) return 'iPhone'
  if (/iPad/.test(ua)) return 'iPad'
  if (/iPod/.test(ua)) return 'iPod'

  // Android
  const match = ua.match(/Android\s+[\d.]+;\s*([^;]+)/i)
  if (match && match[1]) {
    return match[1].trim() // 返回类似 "HUAWEI Mate 40 Pro"
  }

  return 'Unknown'
}
