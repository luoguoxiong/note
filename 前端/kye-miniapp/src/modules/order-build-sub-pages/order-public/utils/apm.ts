/**
 * @Desc: apm 性能接入
 * @Author: wu xingtao
 * @Date: 2024/11/13
 */
import { getEnv } from '@order-public-sub-public/utils/device'
import { ENV_TYPE } from '@tarojs/taro'

const apmConfig = {
  appKey: process.env.TARO_APP_APM_APPKEY,
  dsn: process.env.TARO_APP_APM_DSN,
}

let umengApm
if (getEnv() === ENV_TYPE.WEAPP) {
  umengApm = require('./umengfe/wx.esm.js')
} else if (getEnv() === ENV_TYPE.ALIPAY) {
  umengApm = require('./umengfe/alipay.esm')
}

const apm_help = {
  // apm 初始化
  init: () => {
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
        rules: [''], // rules 错误过滤规则 模糊匹配 命中后会根据黑白名单模式上报或是不上报 stringArray
      },
      // API过滤 object
      apiFilter: {
        mode: 'ignore', // mode 黑白名单模式(ignore 黑名单 命中规则不上报，match 白名单 命中规则上报) string
        rules: ['apm_web'], // rules api过滤规则 模糊匹配 命中后会根据黑白名单模式上报或是不上报 stringArray
      },
    })
  },
}

export default apm_help
