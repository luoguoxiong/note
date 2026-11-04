import {
  isAliMiniApp,
  isAmapMiniApp,
  isH5Env,
  isWxAppAndroidEnv,
  isWxAppIosEnv,
  isWxAppOhosEnv,
  isWxPcAppletEnv,
} from '@public/utils/device'
import umengApm from './umengfe'
/**
 * @Desc: apm 性能接入
 * @Author: wu xingtao
 * @Date: 2024/11/13
 */
const getApmAppKey = () => {
  const env = process.env.TARO_ENV
  // weapp 平台 key 映射
  const weappMap = {
    ios: process.env.TARO_APP_APM_APPKEY_IOS,
    android: process.env.TARO_APP_APM_APPKEY_ANDROID,
    ohos: process.env.TARO_APP_APM_APPKEY_OHOS,
    pc: process.env.TARO_APP_APM_APPKEY_WEAPP_PC,
    default: process.env.TARO_APP_APM_APPKEY_WEAPP,
  }

  // alipay 平台 key 映射
  const alipayMap = {
    alipay: process.env.TARO_APP_APM_APPKEY_ALIPAY,
    amap: process.env.TARO_APP_APM_APPKEY_GD,
  }

  let result = process.env.TARO_APP_APM_APPKEY
  if (env === 'weapp') {
    if (isWxAppIosEnv) {
      result = weappMap.ios
    } else if (isWxAppAndroidEnv) {
      result = weappMap.android
    } else if (isWxAppOhosEnv) {
      result = weappMap.ohos
    } else if (isWxPcAppletEnv) {
      result = weappMap.pc
    } else {
      result = weappMap.default
    }
  } else if (env === 'alipay') {
    if (isAliMiniApp) {
      result = alipayMap.alipay
    } else if (isAmapMiniApp) {
      result = alipayMap.amap
    }
  }
  console.log('[log] apm key', result)
  return result
}

const apmConfig = {
  appKey: getApmAppKey(),
  dsn: process.env.TARO_APP_APM_DSN,
}

// let umengApm
// if (getEnv() === ENV_TYPE.WEAPP) {
//   umengApm = require('./umengfe/wx.esm.js')
// } else if (getEnv() === ENV_TYPE.ALIPAY) {
//   // umengApm = require('./umengfe/alipay.esm')
// }
const apm_help = {
  // apm 初始化
  init: () => {
    if (isH5Env) {
      return
    }
    umengApm.init({
      appKey: apmConfig.appKey, // 通过私有化部署后台获取到的应用的appKey string 必填
      dsn: apmConfig.dsn,
      // debug: true, // apm日志等级 number   若上线建议删除
      // 页面过滤API object
      pageFilter: {
        mode: 'ignore', // mode 黑白名单模式(ignore 黑名单 命中规则不上报，match 白名单 命中规则上报) string
        rules: [''], // rules 页面过滤规则 模糊匹配 命中后会根据黑白名单模式上报或是不上报 stringArray
      },
      // 错误过滤API object
      errorFilter: {
        mode: 'ignore', // mode 黑白名单模式(ignore 黑名单 命中规则不上报，match 白名单 命中规则上报) string
        rules: [/abort/, 'abort'], // rules 错误过滤规则 模糊匹配 命中后会根据黑白名单模式上报或是不上报 stringArray
      },
      // API过滤 object
      apiFilter: {
        mode: 'ignore', // mode 黑白名单模式(ignore 黑名单 命中规则不上报，match 白名单 命中规则上报) string
        rules: ['apm_web'], // rules api过滤规则 模糊匹配 命中后会根据黑白名单模式上报或是不上报 stringArray
      },
    })

    // __non_webpack_require__(
    //   '~/libs/apm/index.js',
    //   (umengApm) => {
    //     console.log('apminit')
    //   },
    //   (err) => {
    //     console.error('__non_webpack_require__:apm', err)
    //   },
    // )
  },
}

export default apm_help
