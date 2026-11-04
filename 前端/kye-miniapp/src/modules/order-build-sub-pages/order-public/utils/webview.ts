import { getToken } from '@order-public-sub-public/storage/user'
import { getQueryObject } from './url'
import { defaultAppId } from '@order-public-sub-public/utils/request/utils'

// 用来判断webview页面是否需要刷新，主要通过token来判断
export const refreshWebviewCheck = (currentSrc) => {
  let result = false
  const currentToken = getToken()
  const { token } = getQueryObject(currentSrc) as any
  // 匹配需登录刷新web-view{当前存在src, src token 与本地token不一致}
  if (currentSrc && token && (!currentSrc.includes(currentToken) || !currentToken)) {
    result = true
  }
  return result
}

/* webview 默认追加参数 */
export const webviewParamsDefault = {
  xForm: defaultAppId,
}
