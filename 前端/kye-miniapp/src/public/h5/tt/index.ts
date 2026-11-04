// #ifdef H5
/* 飞书鉴权 */
import Taro from '@tarojs/taro'
import { ApiGetFSJSSDK, ApiGetPrivateFSJSSDK } from '@public/apis/fs-api'
import { getQueryObject } from '@/public/utils'

export const getFsCode = () => {
  return new Promise((resolve, reject) => {
    window.tt.requestAccess({
      scopeList: ['contact:user.base:readonly'],
      appID: process.env.TARO_APP_LARK_APPID as string,
      success(res) {
        resolve(res.code as string)
      },
      fail(res) {
        reject(res)
      },
    })
  })
}

/** 判断是否为飞书店铺：优先取缓存，没有则从 URL 获取并缓存 */
function getIsHuaQinApp(): boolean {
  const key = 'fromFuaQinApp'

  const cached = Taro.getStorageSync(key)

  if (cached) return true

  const isShop = getQueryObject(location.href).fromFuaQinApp

  if (isShop) Taro.setStorageSync(key, 'true')

  return isShop === '1'
}

export async function fsApiAuth() {
  if (!window.h5sdk) {
    console.error('invalid h5sdk')
    // alert('please open in feishu')
    return
  }

  // 通过服务端的Route: get_appid获取app_id
  // 服务端Route: get_appid的具体内容请参阅服务端模块server.py的get_appid()函数
  // 为了安全，app_id不应对外泄露，尤其不应在前端明文书写，因此此处从服务端获取

  const url = window.location.href.split('#')[0]

  const isHuaQinApp = getIsHuaQinApp()

  let res

  if (!isHuaQinApp) {
    const code = await getFsCode()

    res = await ApiGetFSJSSDK({
      url: url,
      code,
    })
  } else {
    res = await ApiGetPrivateFSJSSDK({
      url: url,
      // code,
    })
  }

  console.log('[tt log res]', res)
  ttH5Config(res?.data)
  await new Promise<void>((resolve, reject) => {
    window.h5sdk.ready(() => {
      console.error('[fs log] h5sdk.ready')
      resolve()
    })
    window.h5sdk.error((error: any) => {
      console.error('[fs log] h5sdk.error', JSON.stringify(error))
      reject(error)
    })
  })
}

/* h5 jssdk 调试 */
// TODO 待对接后台飞书:jssdk签名接口
export function ttH5Config(configTT) {
  try {
    window.h5sdk.config({
      beta: true,
      debug: false,
      // appId: 'cli_a9869f41be3bd013',
      appId: configTT.appid,
      timestamp: +configTT?.timestamp,
      nonceStr: configTT.noncestr,
      signature: configTT.signature,
      jsApiList: [
        'getUserInfo',
        'scanQRCode',
        'previewImage',
        'chooseImage',
        'chooseMedia',
        'openLocation',
        'getLocation',
      ],
      //成功回调
      onSuccess: (res) => {
        console.log(`[tt log]config success:`, JSON.stringify(res))
      },
      //失败回调
      onFail: (err) => {
        console.error('[fs log] config error', JSON.stringify(err))
      },
    })
  } catch (e) {
    console.error('tt error', e)
  }
}
// #endif
