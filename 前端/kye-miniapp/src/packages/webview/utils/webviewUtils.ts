/**
 * @Desc: webviewUtils 待统一迁移到common-page/webviewHelp
 * @Author: wu xingtao
 * @Date: 2024/2/6
 */
import Taro from '@tarojs/taro'
import { getQueryObject } from '@public/utils/url'
import { useLogin } from '@/public/hooks'

/**
 * webview 清空 (用于webview刷新，需要登录场景)
 * @param currentSrc 当前webview src
 * @param setFunc 当前<web-view> src set方法
 * @returns {Promise<void>}
 */
export const refreshWebviewCheck = async (currentSrc: string, setFunc?: (src: string) => void) => {
  const { token: currentToken } = useLogin()
  const { token } = getQueryObject(currentSrc) as any
  // 匹配需登录刷新web-view{当前存在src, src token 与本地token不一致}
  if (currentSrc && token && !currentSrc.includes(currentToken.value)) {
    console.log('触发重置web-view')
    setFunc && setFunc('')
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

export default {
  refreshWebviewCheck,
}
