import { report_other_event } from '@public/utils/reportUtil'
import Taro from '@tarojs/taro'
import { isH5Env } from '@public/utils'

export const useRedirect = () => {
  // 添加路由事件处理前的监听
  if (Taro.getEnv() === 'WEAPP' && wx?.onBeforeAppRoute) {
    wx.onBeforeAppRoute((res) => {
      report_other_event('new-mini-app-open-page', {
        openType: res?.openType,
        path: res?.path,
        query: res?.query ? JSON.stringify(res?.query) : '',
      })
    })
  }
}

const { hostname } = window.location
const isLocalHost =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  /^192\.168\./.test(hostname) ||
  /^10\./.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)

export const H5RedirectToHome = () => {
  if (!isH5Env || isLocalHost) {
    return
  }
  window.onbeforeunload = function (event) {
    // 显示默认的确认对话框（浏览器自带的）
    event.returnValue = '刷新会返回首页' // 对于老版本的浏览器
    return '刷新会返回首页' // 对于现代浏览器
  }
  if (location.href?.indexOf('pages/home/index') === -1) {
    Taro.switchTab({
      url: '/layout/pages/home/index',
    })
  }
}
