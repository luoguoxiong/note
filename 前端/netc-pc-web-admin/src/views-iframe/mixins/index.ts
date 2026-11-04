import { ref } from 'vue'
import { fmkGetEnv } from '@/views/admin/components/header/utils/fmkEnvUtil'

/**
 * 统计分析弹窗是否已弹出过
 * 对齐老项目 microIframeApp store 的 UPDATE_STATISTICAL_POPUP（模块级会话状态，刷新后重置）
 */
const isStatisticalPopup = ref(false)

/** MessagePopup 组件 ref 的最小结构类型 */
interface MessagePopupRef {
  loadNotice?: (pageCode: string) => Promise<boolean>
}

export function useIframeMixin() {
  /**
   * iframe url默认参数拼接
   * @param fullUrl 传入url {timeStamp: 时间戳, token: 登录态, route: 路由参数}
   * @returns {string}
   */
  const initIframeUrl = (fullUrl = '', query: any = {}, params: any = {}) => {
    // 模拟 urlContact 函数，添加默认参数
    const separator = fullUrl.includes('?') ? '&' : '?'
    const searchParams = new URLSearchParams({
      timestamp: Date.now().toString(),
      ...query,
      ...params,
    })
    return `${fullUrl}${separator}${searchParams.toString()}`
  }

  /**
   * @description 拼接修改运单的iframe URL
   * @param {*} fullUrl
   * @param {*} params
   * @returns
   */
  const initIframeUrlByParams = (fullUrl: string, params: any) => {
    const separator = fullUrl.includes('?') ? '&' : '?'
    const searchParams = new URLSearchParams({
      timestamp: Date.now().toString(),
      ...params,
    })
    return `${fullUrl}${separator}${searchParams.toString()}`
  }

  const splicingEnvId = (url: string) => {
    // 对齐老项目 storage.fmk_get_env()，读取 localStorage NETC_FMK_ENV
    const fmkEnv = fmkGetEnv()
    // 对动态iframe 增加envId
    if (fmkEnv?.envId) {
      url = `${url}&envId=${fmkEnv.envId}`
    }
    return url
  }

  // 精准通知（对齐老项目 bi/mixins handleNotice：拉统计分析弹窗并标记会话内已弹）
  const handleNotice = (messagePopupRef?: MessagePopupRef | null) => {
    messagePopupRef?.loadNotice?.('statistical_analysis')
    isStatisticalPopup.value = true
  }

  const getPopupStatus = () => {
    return isStatisticalPopup.value
  }

  return {
    initIframeUrl,
    initIframeUrlByParams,
    splicingEnvId,
    handleNotice,
    getPopupStatus,
  }
}
