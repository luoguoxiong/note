import {
  isWxApplet,
  isAppBrowse,
  isAppiOS,
  isAppAndroid,
  isWxAppletAndroid,
  isWxPcApplet,
  isIpad,
  isAndroidPad,
  isAliPayClient,
  isAndroid,
  isAmapApp,
} from './device'
import { getJsSdkSign } from '@order-public-sub-public/apis/index'
import { wxNative } from './wxNative'
import {
  NativeCheckApiParams,
  NativeChooseFileParams,
  NativeChooseImageParams,
  NativeDownLoadFileParams,
  NativeDownloadImgParams,
  NativeFileParams,
  NativeJumpParams,
  NativeNavigateToParams,
  NativePreviewImageParams,
  NativeScanQRCodeParams,
  NativeShareParams,
  TokenResponse,
} from './types'
import { PlainObject } from '@order-public-sub-public/types'
import { isPROD } from './env'
import { ListItem } from '@order-public-sub-public/components/business/address-book/types'
import { aliPayNative } from './aliPayNative'
import { getEnvConfig } from '@/public/config'

const host = isPROD ? 'https://ic-h5.kye-erp.com' : 'https://ic-h5-uat.kye-erp.com'

const JSSDK_WECHAT_PATH = `${host}/netc-static/jweixin-1.6.0.js`

// const TOUCH_SIMULATE = `${host}/netc-static/touch-emulator-5.14.1.js`
export const isDesktopMiniprogram = () => {
  const userAgent = navigator.userAgent
  return isWxPcApplet || /WindowsWechat/i.test(userAgent) || /Windows NT/i.test(userAgent) // WindowWechat是桌面版微信小程序的用户代理的一部分
}

const ENV = {
  WECHAT: 'wechat',
  APP: 'app',
  ALIPAY: 'aliPay',
}

const RES_CODE = {
  SUCCESS: '0',
  ERROR: '-1',
  CANCEL: '-2',
  NO_PERMISSION: '10001',
  INVALID_PARAM: '10002',
  SDKSIGN_PROGRESS: '10003', // 获取签名中
  SDKSIGN_ERROR: '10004', // 获取签名失败
  WXCONFIG_PROGRESS: '10005', // 获取微信权限配置
  WXCONFIG_ERROR: '10006', // 获取微信权限失败
  NO_SHARE: '20001',
}

class Native {
  env = ''
  bridge: any
  getSdkSign = 0 // 是否获取签名， 0 加载中， 1 成功 2失败
  getWxConfig = 0 // 微信配置 0 初始化配置中 1 配置成功 2 配置失败
  visitEnv = 'prod'
  constructor(params: { visitEnv: string }) {
    console.log('环境', params)
    this.visitEnv = params.visitEnv || 'prod'
    this.__init()
  }

  __init() {
    // 微信
    if (isWxApplet) {
      this.env = ENV.WECHAT
      loadJS(JSSDK_WECHAT_PATH).then(() => {
        this.bridge = window['wx'] || null
        this.__initWechat()
      })
      return
    }

    // App
    if (isAppBrowse) {
      this.env = ENV.APP
      this.bridge = window['dsBridge'] || null
      return
    }
    console.log('是否为支付宝环境:', isAliPayClient)
    // 支付宝
    if (isAliPayClient) {
      this.env = ENV.ALIPAY
      this.bridge = window['my'] || null
      return
    }

    // PC桌面小程序,则添加兼容移动端 touch 事件
    // if (isDesktopMiniprogram()) {
    //   loadJS(TOUCH_SIMULATE)
    // }
  }

  async __initWechat() {
    return new Promise((resolve, reject) => {
      this.getSdkSign = 0
      const url = window.location.href.split('#')[0]
      getJsSdkSign({ url })
        .then((res) => {
          const { data } = res
          console.log(data, 'data')
          this.getSdkSign = 1
          this.getWxConfig = 0
          // wx.config
          window['wx'].config({
            beta: true,
            // debug: true,
            appId: data.appid,
            timestamp: data.timestamp,
            nonceStr: data.noncestr,
            signature: data.signature,
            jsApiList: [
              'checkJsApi',
              'scanQRCode',
              'previewImage',
              'downloadImage',
              'chooseImage',
              'getLocalImgData',
              'openLocation',
              'getLocation',
            ],
          })

          // wx加载成功
          window['wx'].ready(() => {
            this.bridge = window?.['wx'] || null
            this.getWxConfig = 1
            resolve({ code: 0, data: '微信权限配置成功', msg: '微信权限配置成功' })
          })
          window['wx'].error(() => {
            this.getWxConfig = 2
            reject({ code: RES_CODE.WXCONFIG_ERROR, data: null, msg: '获取微信权限配置失败' })
          })
        })
        .catch(() => {
          this.getSdkSign = 2
          reject({ code: RES_CODE.SDKSIGN_ERROR, data: null, msg: '获取签名失败' })
        })
    })
  }

  __call(method: string, params?: PlainObject) {
    console.log('是否为支付宝环境:', method, this.env, params)
    return new Promise((resolve, reject) => {
      if (!this.bridge) {
        return reject({ code: '-1', msg: `原生与js未桥接, method: ${method}, params: ${JSON.stringify(params)}` })
      }
      if (isWxApplet) {
        if (this.getSdkSign === 0) {
          reject({ code: RES_CODE.SDKSIGN_PROGRESS, data: null, msg: '获取签名中' })
        } else if (this.getSdkSign === 2) {
          reject({ code: RES_CODE.SDKSIGN_ERROR, data: null, msg: '获取签名失败' })
        } else if (this.getWxConfig === 0) {
          reject({ code: RES_CODE.WXCONFIG_PROGRESS, data: null, msg: '获取微信权限配置中' })
        } else if (this.getWxConfig === 2) {
          reject({ code: RES_CODE.WXCONFIG_ERROR, data: null, msg: '获取微信权限配置失败' })
        }
      }
      try {
        // 微信定制化
        if (this.env === ENV.WECHAT) {
          wxNative(method, params, this, RES_CODE, this.visitEnv)
            .then((res) => {
              resolve(res)
            })
            .catch((error) => {
              reject(error)
            })
          return
        }
        // App
        if (this.env === ENV.APP) {
          this.bridge?.call(method, params, function (res: any) {
            const resObject = typeof res === 'object' ? res : JSON.parse(res)
            if (resObject.code === RES_CODE.SUCCESS) {
              resolve(resObject.data)
            }
            reject(resObject)
          })
        }

        // 支付宝
        if (this.env === ENV.ALIPAY) {
          aliPayNative(method, params)
            .then((res) => {
              resolve(res)
            })
            .catch((error) => {
              reject(error)
            })
          return
        }
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  }

  /**
   * 扫一扫
   */
  scanQRCode(params: NativeScanQRCodeParams) {
    return this.__call('scanQRCode', params) as Promise<{ scanResult: string }>
  }

  /**
   * 预览图片
   */
  previewImage(params: NativePreviewImageParams) {
    return this.__call('previewImage', params)
  }

  /**
   * 选择图片
   */
  chooseImage(params: NativeChooseImageParams) {
    return this.__call('chooseImage', params)
  }

  /**
   * 选择文件
   */
  chooseFile(params: NativeChooseFileParams) {
    return this.__call('chooseFile', params)
  }

  /**
   * 判断原生是否支持
   */
  checkApi(params: NativeCheckApiParams) {
    console.log('checkApi', params, Date.now())
    return this.__call('checkApi', params) as Promise<{ result: string }>
  }

  /**
   * 返回
   */
  navigateBack(params = {}) {
    return this.__call('navigateBack', params)
  }

  /**
   * 跳转
   */
  navigateTo(params: NativeNavigateToParams) {
    return this.__call('navigateTo', params)
  }

  /**
   * 分享
   */
  share(params: NativeShareParams) {
    return this.__call('share', params)
  }

  /**
   * 调起输入法软键盘
   */
  showSoftKeyboard(params = {}) {
    return this.__call('showSoftKeyboard', params)
  }

  /**
   * 登录
   */
  login() {
    return this.__call('login')
  }

  /**
   * 获取当前环境
   * @returns {Promise<{ source: string }>}
   */
  getSource() {
    return new Promise<{ source: string }>((resolve) => {
      let source: { source: string }
      const { systemType, isApp } = getEnvConfig()
      console.log('获取当前环境', systemType, isApp, isWxApplet, isAliPayClient)
      if (isWxApplet) {
        source = { source: 'miniprogram' }
      } else if (isAmapApp) {
        source = { source: 'amap' }
      } else if (isAliPayClient) {
        source = { source: 'aliPay' }
      } else if (isApp) {
        source = systemType === 'iOS' ? { source: 'ios' } : { source: 'android' }
      } else {
        source = { source: 'other' }
      }
      console.log('获取当前环境source', source)
      resolve(source)
    })
  }

  /**
   * 获取当前位置
   */
  getLocation(params = {}) {
    return this.__call('getLocation', params) as Promise<{ longitude: number; latitude: number }>
  }

  enableAlertBeforeUnload(params = {}) {
    return this.__call('enableAlertBeforeUnload', params)
  }

  /**
   * 刷新查件tab页
   */
  refreshSearch(params = {}) {
    return this.__call('refreshSearch', params)
  }

  /**
   * 判断原生是否支持
   */
  // checkApi(params) {
  //   return this.__call('checkApi', params)
  // }

  /**
   * 打开地图
   */
  openLocation(params = {}) {
    return this.__call('openLocation', params)
  }

  /**
   * 获取非第一次进入的页面的签名
   */
  async getSdkRole() {
    if (isWxAppletAndroid) {
      await this.__initWechat()
    }
  }

  /**
   * 获取原生端剪切板内容
   */
  getClipboardData(params = {}) {
    console.log('调用了粘贴板', Date.now())
    return this.__call('getClipboardData', params)
  }

  /**
   * 获取原生端生成的sessionId
   */
  getSessionId(params = {}) {
    return this.__call('getSession', params)
  }

  /**
   * 获取缓存配置
   */
  getPreloadOrderData(params = {}) {
    return this.__call('getPreloadOrderData', params)
  }

  /**
   * 新开Webview 比较函数存在报错，已移除
   */
  openWebview(params: { url: string; type?: string; withToken?: boolean; blueMethod?: string }) {
    return this.__call('openWebview', params)
  }

  /**
   *  关闭窗口
   */
  closeWindow(params = {}) {
    return this.__call('closeWindow', params)
  }
  /**
   *  检查手机蓝牙是否开启的方法
   */
  checkBluetoothAuth(params = {}) {
    if (isWxApplet) {
      return true
    } else {
      return this.__call('checkBluetoothAuth', params)
    }
  }
  /**
   *  获取当前连接的打印机的方法
   */
  getBluetoothDevice(params = {}) {
    return this.__call('getBluetoothDevice', params)
  }
  /**
   *  向打印机发送数据的方法
   */
  sendBluetoothData(params = {}) {
    return this.__call('sendBluetoothData', params)
  }
  /**
   *  跳转打印机列表
   */
  jumpBluetoothDeviceList(params = {}) {
    return this.__call('jumpBluetoothDeviceList', params)
  }
  /**
   *  跳转打印机列表
   */
  jumpPrintPage(params = {}) {
    return this.__call('jumpPrintPage', params)
  }
  /**
   *  打开手机蓝牙设置
   */
  openBluetoothSet(params = {}) {
    return this.__call('openBluetoothSet', params)
  }

  /**
   * 微信配置初始化
   */
  async initWechat() {
    await this.__initWechat()
  }

  /**
   * 离线包-app跨域-封装普通请求
   */
  request<T>(params = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.bridge) {
        return reject({ code: '-1', msg: `原生与js未桥接, method: 'request', params: ${JSON.stringify(params)}` })
      }
      try {
        this.bridge?.call('request', params, function (res: any) {
          const resObject = typeof res === 'object' ? res : JSON.parse(res)
          if (resObject.code === 0) {
            resolve(resObject)
          }
          reject(resObject)
        })
      } catch (e) {
        reject(e)
      }
    })
  }
  /**
   * 离线包-ios跨域-封装上传文件请求
   */
  upload<T>(params = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.bridge) {
        return reject({ code: '-1', msg: `原生与js未桥接, method: 'upload', params: ${JSON.stringify(params)}` })
      }
      try {
        this.bridge?.call('upload', params, function (res: any) {
          const resObject = typeof res === 'object' ? res : JSON.parse(res)
          if (resObject.code === 0) {
            resolve(resObject)
          }
          reject(resObject)
        })
      } catch (e) {
        reject(e)
      }
    })
  }
  postMessage(params = {}) {
    return this.__call('postMessage', params)
  }

  /**
   * 保存图片
   */
  downloadImage(params: NativeDownloadImgParams) {
    return this.__call('downloadImage', params)
  }
  // 保存文件
  downloadFile(params: NativeDownLoadFileParams) {
    return this.__call('downloadFile', params)
  }
  // APP系统分享
  shareFile(params: NativeFileParams) {
    return this.__call('shareFile', params)
  }
  openFile(params: NativeFileParams) {
    return this.__call('openFile', params)
  }
  //获取系统信息
  getSystemInfo() {
    return this.__call('getSystemInfo')
  }

  jumpNative(params: NativeJumpParams) {
    return this.__call('jumpNative', params)
  }

  // 重新加载jsSdk
  __initWxJsSdk() {
    // 微信
    if (isWxApplet) {
      this.env = ENV.WECHAT
      // 移除quickOrderInitConfig
      if (location.href.includes('quickOrderInitConfig')) {
        location.replace(removeUrlParameter(location.href, 'quickOrderInitConfig'))
      }
      loadJS(JSSDK_WECHAT_PATH).then(() => {
        this.bridge = window['wx'] || null
        this.__initWechat()
      })
      return
    }
  }
}
/**
 * 动态加载JS
 */
const loadJS = (url: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      const script = document.createElement('script')
      script.src = url
      script.onload = () => {
        resolve()
      }
      document.body.appendChild(script)
    } catch (e) {
      reject()
    }
  })
}

// 从原生获取token
export const getToken = () => {
  return new Promise<string | undefined>((resolve, reject) => {
    if (isAppiOS && window?.bridge) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.bridge?.call('getToken', {}, function (res: string) {
        const resObj: TokenResponse = JSON.parse(res)
        if (resObj?.data?.token) {
          resolve(resObj.data.token)
        }
      })
    } else if (isAppAndroid && window?.kye) {
      resolve(window.kye.getToken?.())
    } else {
      reject({ code: '-1', msg: `原生与js未桥接, method: getToken` })
    }
  })
}

// 传原生地址信息
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setAddressInfo = (data: string | ListItem) => {
  const dataString = JSON.stringify(data)
  if (isAppAndroid) {
    window.addressPicker?.setAddressInfo?.(dataString)
  } else {
    window.webkit.messageHandlers.setAddressInfo.postMessage(data)
  }
}

// 移除url指定参数
export const removeUrlParameter = (url: string, parameterName: string) => {
  // 使用正则表达式匹配 URL 中的参数部分，并替换掉指定的参数
  const regex = new RegExp(`[?&]${parameterName}=([^&#]*)`, 'g')
  const newUrl = url.replace(regex, '')

  // 清除可能存在的多余符号
  return newUrl.replace(/[?&]$/, '')
}

export default Native

export type { Native }
