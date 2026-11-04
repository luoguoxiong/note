/* QT埋点初始化 */
import { uuid, getEnv, getBridgeModule } from '@order-public-sub-public/utils/index'
import { fetchAppletOpenIdByCode, getBuriedPointUserInfo } from '@order-public-sub-public/apis/aplus'
/* aplus 环境变量 */
const APLUS_URL = process.env.TARO_APP_APLUS_URL
const APLUS_APPKEY = process.env.TARO_APP_APLUS_APPKEY

/* aplus 用户数据 */
interface AplusUserData {
  open_id?: string
  dev_id?: string
}

//声明aplus采集sdk全局变量
const aplusConfig = {
  metaInfo: {
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

class AplusTrace {
  bridge: any
  env: TaroGeneral.ENV_TYPE
  aplusUserData: AplusUserData = {}
  constructor() {
    this.__init()
  }
  /* 初始化配置 */
  __init() {
    __non_webpack_require__('package-qt/index.js', ({ initQTSDK }) => {
      initQTSDK(aplusConfig)
    })
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
  setUserAplus(data) {
    try {
      getBuriedPointUserInfo().then((res) => {
        if (res.code === 0 && res.data) {
          const resData = res.data
          const aplusUserData = {
            ...this.aplusUserData,
            userid: resData.userId,
            customer_code: resData.customerCode,
            open_id: data.openid || resData.xcxOpenId,
            mobile_number: resData.encryptPhone,
          }
          console.log(aplusUserData, 'aplusUserData')

          this.bridge.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_user_id', aplusUserData?.userid],
          })
          this.bridge.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: [
              'globalproperty',
              {
                traceId: aplusTraceId,
                userid: resData?.userId,
                customer_code: resData?.customerCode,
                mobile_number: resData?.encryptPhone,
              },
            ],
          })
          this.bridge.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_anony_id', aplusUserData.open_id],
          })
          this.bridge.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_dev_id', aplusUserData.dev_id],
          })
          this.bridge.aplus_queue.push({
            action: 'aplus.record',
            arguments: [
              '$$_user_profile',
              'OTHER',
              {
                userid: aplusUserData?.userid,
                customer_code: aplusUserData?.customer_code,
                open_id: aplusUserData?.open_id,
                mobile_number: aplusUserData?.mobile_number,
              },
            ],
          })
          this.bridge.aplus_queue.push({
            action: 'aplus.setMetaInfo',
            arguments: ['_hold', 'START'],
          })
          // 上报apm-userid
          this.bridge.$umapm && this.bridge.$umapm.setUserid(resData.encryptPhone) // apm设置手机号
        }
      })
    } catch (e) {
      console.log('setNologgedIn e>>>>>', e)
    }
  }
  /* 设置用户id */
  setLoginId() {
    const { open_id, dev_id } = this.aplusUserData
    this.bridge.aplus_queue.push({
      action: 'aplus.setMetaInfo',
      arguments: ['_anony_id', open_id],
    })
    this.bridge.aplus_queue.push({
      action: 'aplus.setMetaInfo',
      arguments: ['_dev_id', dev_id],
    })
  }

  /* 退登 还原QT用户信息+openId */
  setNologgedIn() {
    try {
      let aplusUserData = this.aplusUserData
      console.log(aplusUserData, 'aplusUserData')
      this.setAplusUserData({
        open_id: aplusUserData.open_id,
        dev_id: aplusUserData.dev_id,
      })

      const { open_id, dev_id } = this.aplusUserData

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
      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_anony_id', open_id],
      })
      this.bridge.aplus_queue.push({
        action: 'aplus.setMetaInfo',
        arguments: ['_dev_id', dev_id],
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
}

const aPlus = new AplusTrace()

export default aPlus

/* 根据小程序code查询openid -写入aplus */
export const updateAppletOpenIdByCode = () => {
  fetchAppletOpenIdByCode().then((res) => {
    if (res.code === 0 && res.data) {
      aPlus?.setAplusUserData({
        ...aPlus.aplusUserData,
        open_id: res.data?.openid,
        dev_id: res.data?.unionid,
      })
      aPlus?.setLoginId()
      // 设置 apm用户信息
      const bridge = getBridgeModule()
      const { unionid, openid } = res.data
      bridge.$umapm?.setUnionid && bridge.$umapm?.setUnionid(unionid)
      bridge.$umapm?.setOpenid && bridge.$umapm?.setOpenid(openid)
    }
  })
}
