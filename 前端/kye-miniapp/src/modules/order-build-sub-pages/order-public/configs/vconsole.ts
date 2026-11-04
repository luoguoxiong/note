import { isLocal } from '@order-public-sub-public/utils/env'
import { isPreviewPath } from '@order-public-sub-public/utils/route'

class VConsoleInit {
  constructor() {
    this.init()
  }
  init() {
    // 非生产环境启用vconsole
    const isEnv = /uat|stg|dev/.test(window.location.host) || process.env.NODE_ENV === 'development'
    const isPreivew = isPreviewPath()
    if (isEnv && !isLocal && !isPreivew) {
      this.loadJS(process.env.BASE_URL + './lib/vconsole@3.3.4.min.js').then(() => {
        if (window.VConsole) {
          new window.VConsole()
        }
      })
    }
  }
  loadJS(url: string) {
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
}

export default VConsoleInit
