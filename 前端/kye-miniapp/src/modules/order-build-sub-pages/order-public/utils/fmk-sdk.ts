import { isPROD } from '@order-public-sub-public/utils/env'
import { getQueryObject, isAmapApp } from '@order-public-sub-public/utils/index'
import { onlyNumber } from './pattern'
import { sessionStorage } from './storage'

class FmkSdk {
  constructor() {
    if (isPROD) {
      return
    }
    this.init()
  }

  init() {
    this.setXEnvid()
  }

  /**
   * url获取envId 写入storage
   */
  setXEnvid() {
    const { xEnvid, envId, envid, xenvid } = getQueryObject()
    sessionStorage?.setItem('x-envid', xEnvid || envId || envid || xenvid)
  }
  /**
   * 获取泳道id
   * @returns {string|string}
   */
  getXEnvid() {
    // if (isAmapApp) {
    //   return '2593'
    // }
    return sessionStorage.getItem('x-envid') || ''
  }

  // 追加泳道header配置
  public addFmkHeader(): { [key: string]: string } {
    const result: { [key: string]: string } = {}
    // 泳道非测试环境不添加该header
    if (isPROD) {
      return result
    }
    const envId = this.getXEnvid()
    if (onlyNumber.test(envId)) {
      result['x-envid'] = envId
    }

    return result
  }
}

export default FmkSdk
