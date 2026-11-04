import Taro from '@tarojs/taro'
/* QT埋点初始化 */
import { uuid, nanoid, getEnv, getBridgeModule, isH5Env } from '@public/utils/index'
import { getBuriedPointUserInfo } from '@public/apis/aplus'
import { Any } from '@public/utils/types'
// @ts-ignore
import { getEnvConfig } from '../constants'
import { getDeviceType } from '@/modules/user/utils/device'
import { useUserGlobalStore } from '@/store/user'
import { initQTSDK } from './qt'
import { isPROD } from './env'
import { AppPlugin } from '../appPlugins'
/* aplus 环境变量 */
const APLUS_URL = process.env.TARO_APP_APLUS_URL
const APLUS_APPKEY = process.env.TARO_APP_APLUS_APPKEY
const globalUserStore = useUserGlobalStore()
/* aplus 用户数据 */
export interface AplusUserData {
  xcxOpenId?: string
  dev_id?: string
  open_id?: string
}

//声明aplus采集sdk全局变量
const aplusConfig = {
  metaInfo: {
    // 设置其他值不生效
    'max-queue-count': 5,
    'aplus-request-timeout': 3000,
    autoGetOpenid: false,
    appKey: APLUS_APPKEY, //QuickTracking 创建应用时填写的Appkey, 必填(支付宝小程序key)
    'aplus-rhost-v': APLUS_URL, //采集日志上报域名，必填
    trackDomain: APLUS_URL,
    _hold: 'BLOCK',
    DEBUG: false,
    // 'aplus-waiting':'MAN', //关闭页面浏览事件自动采集
    _user_nick: '', //用户昵称
    _user_id: 'testUserId', //用户账号体系id
    _anony_id: 'testOpenid', //小程序平台用户唯一标识
  },
}

export const aplusTraceId = uuid()

export const getAnonyId = () => {
  const anonyId =
    Taro.getStorageSync('QT_ANONY_ID') || [getDeviceType().trim(), nanoid()].join('@').replace(/\s+/g, '_')
  Taro.setStorageSync('QT_ANONY_ID', anonyId)
  return anonyId
}

class AplusTrace {
  bridge: Any
  env: TaroGeneral.ENV_TYPE
  aplusUserData: AplusUserData = {}
  isInit: Boolean
  get aplusHeader() {
    return `traceId=${aplusTraceId}&xForm=114`
  }

  constructor() {
    this.__init()
  }
  /* 初始化配置 */
  async __init() {
    this.__envInit()
  }
  /* 初始化平台变量 */
  __envInit() {
    this.env = getEnv()
    this.bridge = getBridgeModule()
  }
  /* 设置aplus用户变量 */
  setAplusUserData(value) {
    this.aplusUserData = value
  }
  /* 写入QT用户信息 */
  async setUserAplus() {
    const { data } = await getBuriedPointUserInfo()
    try {
      if (!globalUserStore.openId && data.xcxOpenId) {
        globalUserStore.setOpenId(data.xcxOpenId)
      }
      this.setAplusUserData(data)
      console.log('[log] aplusUserData', data)

      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_user_id', data?.userId],
      })
      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: [
          'globalproperty',
          {
            traceId: aplusTraceId,
            userid: data?.userId,
            customer_code: data?.customerCode,
            mobile_number: data?.encryptPhone,
          },
        ],
      })

      let anonyId = data.xcxOpenId

      if (getEnvConfig().isApp) {
        anonyId = await AppPlugin.getDeviceId()
        anonyId = anonyId || getAnonyId()
      }

      console.log('[log] anonyId', anonyId)

      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_anony_id', isH5Env ? data.userId : anonyId],
      })
      // this.bridge.aplus_queue.push({
      //   action: 'aplus.setMetaInfo',
      //   arguments: ['_dev_id', aplusUserData.dev_id],
      // })
      this.bridge.aplus_queue.push({
        action: 'aplus.record',
        arguments: [
          '$$_user_profile',
          'OTHER',
          {
            userid: data?.userId,
            customer_code: data?.customerCode,
            open_id: anonyId,
            mobile_number: data?.encryptPhone,
          },
        ],
      })
      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_hold', 'START'],
      })
      // 上报apm-userid
      this.bridge.$umapm && this.bridge.$umapm.setUserid(data.encryptPhone) // apm设置手机号
    } catch (e) {
      console.error('setNologgedIn e>>>>>', e)
    }
  }

  /* 退登 还原QT用户信息+openId */
  async setNologgedIn() {
    try {
      const { xcxOpenId } = this.aplusUserData

      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: [
          'globalproperty',
          {
            traceId: aplusTraceId,
          },
        ],
      })
      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_user_id', ''],
      })

      let anonyId = xcxOpenId

      if (getEnvConfig().isApp) {
        anonyId = await AppPlugin.getDeviceId()
        anonyId = anonyId || getAnonyId()
      }

      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_anony_id', anonyId],
      })
      this.bridge.aplus_queue.push({
        action: 'aplus.record',
        arguments: ['$$_user_profile', 'OTHER', {}],
      })
      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_hold', 'START'],
      })
      this.bridge.$umapm && this.bridge.$umapm.setUserid('') // apm退出登录， 清空手机号
    } catch (e) {
      console.log('setNologgedIn e>>>', e)
    }
  }
  init() {
    if (!this.isInit) {
      if (!isH5Env) {
        initQTSDK(aplusConfig)
      }
      // #ifdef H5
      if (isH5Env) {
        // appKey：在控制台获取
        if (isPROD) {
          // 生产环境
          this.bridge.aplus_queue.push({ action: 'aplus.setMetaInfo', arguments: ['appKey', APLUS_APPKEY] })
          this.bridge.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['aplus-rhost-v', 'kye-log-sdk.ky-express.com'],
          })
        } else {
          // 测试环境
          this.bridge.aplus_queue.push({ action: 'aplus.setMetaInfo', arguments: ['appKey', APLUS_APPKEY] })
          this.bridge.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['aplus-rhost-v', 'kye-log-sdk-uat.ky-express.com'],
          })
        }
        this.bridge.aplus_queue.push({
          action: 'aplus.setMetaInfo',
          arguments: ['_hold', 'BLOCK'],
        })
      }
      // #endif
      this.isInit = true
    }
  }
}

export default new AplusTrace()
