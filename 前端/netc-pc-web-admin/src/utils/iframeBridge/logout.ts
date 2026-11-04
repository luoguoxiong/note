/**
 * @Desc: 退登原因检查公共处理（对齐老项目 services/api.js 与 iframe/index.vue 的 loginOut 分支：
 * checkPsdChanged + handleLogout + auth/setLoginTips）
 */
import { checkPsdChanged } from '@/apis/user'
import { getToken } from '@/utils/auth'
import { usePcWebAuthStore } from '@/stores/pc-web/auth'
import { isLogoutDialogVisible, showLogoutDialog } from './logoutDialog'

// 退登原因-兜底值
const EXPIRED_MSG = '该手机号登录已失效，请重新登录'

/**
 * 退登检查结果复用窗口(ms)：并发请求共享同一次 logoutTip 结论。
 * 避免一次 token 失效打出 N 次检查、且各次结论不一致（改密 / 普通 / 接口异常）
 * 导致后续弹出两个不同的退登弹窗。
 */
const CHECK_REUSE_WINDOW = 1500

/** 进行中的退登检查，并发复用 */
let logoutCheckInFlight: Promise<unknown> | null = null

/**
 * 写入退登提示并触发退登弹窗（auth/setLoginTips + 全局退登弹窗）
 * 清缓存时机与用户确认后的退登动作均由 showLogoutDialog 统一处理，此处无需拼 then
 * @param message         弹窗文案，默认"登录失效"兜底文案
 * @param psdChange       是否因修改密码退登（true 走密码已修改弹窗）
 * @param clearBeforeShow 弹窗前是否清空 sessionStorage，默认 true（对齐老基座 loginOut 链路）
 */
export const triggerLogout = (message: string = EXPIRED_MSG, psdChange?: boolean, clearBeforeShow = true) => {
  usePcWebAuthStore().setLoginTips(message)
  return showLogoutDialog({ message, reason: psdChange ? 'psd' : 'invalid', clearBeforeShow })
}

export interface CheckPsdChangedOptions {
  /**
   * 弹窗前是否清空 sessionStorage，默认 true
   * 100201 链路传 false：对齐老基座（点「去登录」后由 userLogout 清）
   * 6001/60010 链路传 true：对齐老基座 handleLogout（先清再弹）
   */
  clearBeforeShow?: boolean
}

/**
 * 检查 token 失效是否因修改密码，并触发对应退登弹窗：
 * status==1 弹后端 tips（密码已修改弹窗），其余结果及接口异常统一走"登录失效"弹窗
 */
export const checkPsdChangedAndLogout = ({ clearBeforeShow = true }: CheckPsdChangedOptions = {}) => {
  // 并发复用：同一批失败请求只认第一次检查结论
  if (logoutCheckInFlight) return logoutCheckInFlight
  // 已有退登弹窗在展示：本次失效无需再查（弹窗层同样会拦截）
  if (isLogoutDialogVisible()) return Promise.resolve()

  logoutCheckInFlight = checkPsdChanged({ token: getToken(), from: 7 })
    .then((res) => {
      if (res.data && Number(res.data?.status) === 1) {
        triggerLogout(res.data.tips, true, clearBeforeShow)
      } else {
        triggerLogout(EXPIRED_MSG, false, clearBeforeShow)
      }
    })
    .catch(() => {
      triggerLogout(EXPIRED_MSG, false, clearBeforeShow)
    })
    .finally(() => {
      setTimeout(() => {
        logoutCheckInFlight = null
      }, CHECK_REUSE_WINDOW)
    })

  return logoutCheckInFlight
}
