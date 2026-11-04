/**
 * @Desc: httpProcess http请求过程处理
 * @Date: 2025/12/11
 */

/* 接口token失效-清除逻辑 */
import { clearUserCache, getToken } from '@public/storage'
import { ResponseData } from '@public/utils/types'
import { logoutIgnoreList } from '@public/utils/request/constants'
import { useLogOutTip } from '@public/utils/request/useLogOutTip'
import { getApplicationListAllDebounce } from '@public/utils/application/applicationService'
import { debounce } from 'lodash-es'

let httpExpiredPromise: Promise<any> | null = null
let resolveFn: ((v: any) => void) | null = null
let rejectFn: ((err: any) => void) | null = null

/* 接口token失效-清理storage */
const httpExpiredClear = () => {
  // 清理token、USER_INFO、openId
  clearUserCache()
}

/* 接口token失效-数据处理 */
const httpExpiredDataHandler = () => {
  getApplicationListAllDebounce()
  console.log('[log] httpExpiredDataHandler')
}

/* 接口token失效-退登原因查询 */
const httpExpiredLogOutTipHandler = async (config: ResponseData['config'], options = { oldToken: '' }) => {
  const { isShowingLogoutModal, onLogoutTipApi } = useLogOutTip()
  // 进入退登原因查询-（未打开退登弹窗 + 非忽略接口）
  if (!isShowingLogoutModal.value && logoutIgnoreList.indexOf(config.headers?.method) === -1) {
    await onLogoutTipApi({ method: config.headers?.method, oldToken: options?.oldToken })
  }
}

/**
 * 接口调用 - token 失效场景处理
 * @param config
 */
export const httpExpiredCallback = debounce(async (config: ResponseData['config']) => {
  try {
    const oldToken = getToken()
    // 场景：token失效数据清理逻辑 (避免后续还继续使用该token)
    httpExpiredClear()
    // 查询退登原因
    await httpExpiredLogOutTipHandler(config, { oldToken })
    // 退登原因完毕后 - 拉取游客信息
    httpExpiredDataHandler()
    resolveFn?.({})
  } catch (e) {
    console.error('httpExpiredCallback error', e)
    rejectFn?.(e)
  } finally {
    // 重新清空promise
    httpExpiredPromise = null
    resolveFn = null
    rejectFn = null
  }
}, 200)

export const httpExpiredProcess = (options) => {
  if (httpExpiredPromise) return httpExpiredPromise
  httpExpiredPromise = new Promise((resolve, reject) => {
    resolveFn = resolve
    rejectFn = reject
    httpExpiredCallback(options)
  })
  return httpExpiredPromise
}
