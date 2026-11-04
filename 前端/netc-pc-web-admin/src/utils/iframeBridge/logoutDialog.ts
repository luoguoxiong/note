/**
 * @Desc: 登录失效提示弹窗 - 全局唯一出口（单例）
 *
 * 背景：
 * token 失效时存在多条触发链（公共 request 拦截器、子应用 loginOut / 原始 postMessage、
 * iframeBridge 交互事件），每条链各自弹窗且各自的防重入手段互不感知：
 *  - 旧实现用 document.querySelector('.user-invalid-dialog' / '.password-change-dialog') 判重，
 *    但 `if (!psdChange && invalidDialogTarget) return` 对 psdChange 放行，
 *    并发请求分别得到「改密退登」与「普通失效」两种结论时会叠出两个弹窗；
 *  - interaction 侧另有一个独立 flag，与类名守卫完全不互通。
 *
 * 现统一收敛到本模块：所有入口只调用 showLogoutDialog，同一时刻仅允许一个弹窗存在。
 * customClass 仍保留 user-invalid-dialog / password-change-dialog 作为「退登原因」语义标记
 * （便于排查与后续差异化样式），但不再承担去重职责。
 *
 * 副作用：默认在弹窗展示前清空 sessionStorage（可用 clearBeforeShow 关闭），
 * 用户点确认后统一执行退登（userLogOut 内部再次清缓存，幂等）。
 * 因此本模块只用于「登录失效」场景，勿在非退登提示中复用。
 */
import { KMessageBox } from '@netc-design-pc/ui'
import { userLogOut } from './userLogout'

/** 退登原因：psd=因修改密码被踢下线；invalid=普通登录失效 */
export type LogoutDialogReason = 'invalid' | 'psd'

export interface LogoutDialogOptions {
  /** 弹窗正文，缺省「登录已失效，请重新登录」 */
  message?: string
  /** 弹窗标题，缺省「温馨提示」 */
  title?: string
  /** 确认按钮文案，缺省「去登录」 */
  confirmText?: string
  /** 退登原因，缺省普通登录失效 */
  reason?: LogoutDialogReason
  /**
   * 是否在弹窗展示前清空 sessionStorage，缺省 true
   * - true（先清再弹）：对齐老基座 6001/60010、子应用 loginOut、iframeBridge 确认框（均在弹窗前 sessionStorage.clear()）
   * - false（点确认才清）：对齐老基座 100201（confirmCallback → userLogout 才清）、
   *   原始 postMessage ACTION_HANDLE_LOGOUT_DIALOG、消息中心 tokenInvalid（仅跳登录不清缓存）
   */
  clearBeforeShow?: boolean
}

const DEFAULT_MESSAGE = '登录已失效，请重新登录'
const DEFAULT_TITLE = '温馨提示'
const DEFAULT_CONFIRM_TEXT = '去登录'

/** 当前是否有退登弹窗在展示 */
let visible = false
/** 当前弹窗的退登原因，仅用于排查日志 */
let currentReason: LogoutDialogReason | null = null

/** 是否已有退登弹窗在展示 */
export const isLogoutDialogVisible = () => visible

/**
 * 展示登录失效提示（全局唯一出口）
 * 已有弹窗在展示时直接忽略本次调用（策略 A：先到先弹，后到丢弃）
 *
 * 弹窗展示前清空 sessionStorage；用户点确认后由本方法统一执行退登(userLogOut)，
 * 调用方无需（也不应）自行拼接 then —— 避免某个入口漏接导致点了「去登录」没反应
 * @returns 用户是否点了确认（弹窗被单例拦截 / 取消时返回 false）
 */
export const showLogoutDialog = ({
  message,
  title,
  confirmText,
  reason = 'invalid',
  clearBeforeShow = true,
}: LogoutDialogOptions = {}): Promise<boolean> => {
  if (visible) {
    console.warn('[logoutDialog] 已存在退登弹窗，本次调用被忽略', { reason, currentReason })
    return Promise.resolve(false)
  }

  visible = true
  currentReason = reason

  // 清理时机对齐老基座：6001/60010 等链路弹窗前先清空会话缓存，让登录态立即失效；
  // 100201（走 logoutTip 检查）等链路保持"点确认后才清"（见 clearBeforeShow 说明）
  if (clearBeforeShow) {
    sessionStorage.clear()
  }

  return KMessageBox.alert(message || DEFAULT_MESSAGE, {
    title: title || DEFAULT_TITLE,
    confirmButtonText: confirmText || DEFAULT_CONFIRM_TEXT,
    customClass: reason === 'psd' ? 'password-change-dialog' : 'user-invalid-dialog',
  })
    .then(() => {
      // 确认后统一退登（清缓存 + 重载，由路由守卫跳登录页）
      userLogOut()
      return true
    })
    .catch(() => false)
    .finally(() => {
      visible = false
      currentReason = null
    })
}

/** 强制复位单例状态（登录态切换、异常兜底等场景） */
export const resetLogoutDialog = () => {
  visible = false
  currentReason = null
}
