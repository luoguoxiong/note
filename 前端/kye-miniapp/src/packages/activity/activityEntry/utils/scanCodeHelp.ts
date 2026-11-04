import Taro from '@tarojs/taro'
import { http } from '@public/utils/request'
import { useLogin } from '@public/hooks'
import { urlContact } from '@public/utils'

/**
 * 检查URL是否为TabBar页面
 * @param url 页面URL
 * @returns {boolean}
 */
const urlIsTabBar = (url: string): boolean => {
  // 根据项目的tabBar配置判断
  const tabBarPages = [
    'layout/pages/home/index',
    'layout/pages/order/index',
    'layout/pages/waybill/index',
    'layout/pages/mine/index',
  ]

  return tabBarPages.some((page) => url.includes(page))
}

/**
 * 扫小程序活动码
 * @param codeId 活动图形id
 * @returns {Promise<*>}
 */
export const scanMiniActivityCode = async (codeId = '') => {
  try {
    const { token } = useLogin()
    const wxCode = token.value || ''

    const params = {
      reportChannel: 10, // <10 小程序 20：安卓 30：ios>
      reportNode: 10, // <10 扫码中转页，20：授权登录页>
      platformCode: wxCode, // 平台code，如是小程序，则为微信CODE，如为APP 则为极光ID，如此类推
      codeId: codeId,
    }

    const response = await http('web.activity.getAttributeByCodeId', params, {
      hideToast: true,
    })

    const data = response.data || response
    let jumpData = {}

    if (data) {
      let { jumpType, jumpUrl, customParams } = data || {}
      // customParams追加codeId参数
      if (typeof customParams === 'object') {
        customParams = Object.assign({}, customParams, { codeId })
      }
      // customParamsString 自定义逻辑配置
      const customParamsString = JSON.stringify(customParams || {})
      console.log('jumpUrl', jumpUrl)

      // jumpType<0:不跳转，1:h5,2:内部页面(原生), jumpUrl跳转页面
      if (jumpType && jumpUrl) {
        switch (jumpType) {
          case 1:
            //h5默认使用下单页webview容器 openWebView暂不支持下单页刷新，已知场景[戈壁下单、戈壁营销活动页]
            jumpUrl = encodeURIComponent(jumpUrl)
            jumpData = {
              nativeJumpType: 'redirectTo',
              url: `/packages/webview/openWebview?url=${jumpUrl}&customParams=${customParamsString}&sourcePage=wx-scan&sourceAction=activity`,
            }
            break
          case 2: // 2:内部页面(原生)
            if (urlIsTabBar(jumpUrl)) {
              jumpData = {
                nativeJumpType: 'switchTab',
                url: jumpUrl,
              }
            } else {
              const url = urlContact(jumpUrl, {
                customParams: encodeURIComponent(customParamsString),
              })
              jumpData = {
                nativeJumpType: 'redirectTo',
                url: url,
              }
            }
            break
        }
      }
    }

    return {
      success: true,
      data: jumpData,
    }
  } catch (err: any) {
    const errorData = {
      ...err,
      msg: err.msg || '当前网络连接失败，请检查后重试',
      noApiError: !err.msg,
    }
    return Promise.reject({
      success: false,
      errorData: errorData,
    })
  }
}

/**
 * 通用-小程序扫码活动埋点上报
 * @param codeId 活动id
 * @returns {Promise<*>}
 */
export const scanMiniActivityReport = async (codeId: string) => {
  if (!codeId) {
    return Promise.reject({})
  }

  const { token } = useLogin()
  const wxCode = token.value || ''

  const reqParams = {
    reportChannel: 10, // <10 小程序 20：安卓 30：ios>
    reportNode: 20, // <10 扫码中转页，20：授权登录页>
    platformCode: wxCode, // 平台code，如是小程序，则为微信CODE，如为APP 则为极光ID，如此类推
    codeId: codeId,
  }

  return http('web.activity.report', reqParams, {
    hideToast: true,
  })
}

/**
 * Taro 跳转url
 * @param jumpType 跳转类型
 * @param url 跳转URL
 * @returns {Promise<Taro.General.CallbackResult>}
 */
export const nativeJumpUrl = ({ jumpType = '', url = '' }) => {
  try {
    switch (jumpType) {
      case 'redirectTo':
        return Taro.redirectTo({ url })
      case 'switchTab':
        return Taro.switchTab({ url })
      case 'navigateTo':
        return Taro.navigateTo({ url })
      default:
        return Taro.navigateTo({ url })
    }
  } catch (e) {
    console.log('e', e)
  }
}

export default {
  scanMiniActivityCode,
  scanMiniActivityReport,
  nativeJumpUrl,
}
