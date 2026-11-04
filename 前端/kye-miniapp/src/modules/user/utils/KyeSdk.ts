import Taro, { ENV_TYPE } from '@tarojs/taro'
import { PlainObject } from '@public/utils/types'
import { getEnv } from '@public/utils/device'

interface CallFuncParams {
  method: string
  params: PlainObject
}

class KyeSdk {
  /**
   * 手动调用小程序原生方法
   * @param string
   * @returns {any}
   */
  static callFunc({ method, params }: CallFuncParams) {
    if (Taro && Taro[method]) {
      return Taro[method](params)
    } else {
      if (getEnv() === ENV_TYPE.ALIPAY) {
        return my && my[method](params)
      }
    }
  }

  __callFunc({ method, params }: CallFuncParams) {
    if (Taro && Taro[method]) {
      return Taro[method](params)
    } else {
      if (getEnv() === ENV_TYPE.ALIPAY) {
        return my && my[method](params)
      }
    }
  }

  // 静态方法-兼容showLoading
  showLoading(params) {
    return this.__callFunc({ method: 'showLoading', params })
  }
}

const kyeSdkInstance = new KyeSdk()

const handlerPlus = {
  get(target, prop) {
    if (typeof target[prop] === 'function') {
      // 如果实例上存在该方法，直接返回该方法
      return target[prop]
    } else {
      // 如果实例上不存在该方法，则代理到静态方法
      return function (...args) {
        return KyeSdk.callFunc({ method: prop, params: [...args][0] })
      }
    }
  },
}

const kyeSdk = new Proxy(kyeSdkInstance, handlerPlus)

export default kyeSdk
