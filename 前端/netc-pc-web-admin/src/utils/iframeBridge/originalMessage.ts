/**
 * @Desc: originalMessage 原始postMessage通信，用于未接入iframeBridge场景
 */
import { showLogoutDialog, isLogoutDialogVisible } from './logoutDialog'
import { userLogOut } from './userLogout'

interface MessageData {
  isOriginalIframe?: boolean
  key?: string
  value?: {
    title?: string
    message?: string
  }
}

class OriginalMessage {
  /** 事件监听状态 */
  private messageSubscribeStatus = false

  private messageHandler = (message: MessageEvent<MessageData>) => {
    try {
      // 仅接收isOriginalIframe message数据
      if (message?.data?.isOriginalIframe) {
        const { data } = message
        switch (data?.key) {
          // 手机号重新登录弹窗唤起 {type: ['default'|'confirm']} 默认直接跳转路由
          case 'ACTION_HANDLE_LOGOUT_CONFIRM':
            userLogOut()
            break
          // 唤起退登弹窗
          case 'ACTION_HANDLE_LOGOUT_DIALOG':
            this.handleLogout({
              title: data?.value?.title,
              message: data?.value?.message,
            })
            break
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  /** 原始message监听 */
  onOriginalIframeMessage = () => {
    window.addEventListener('message', this.messageHandler, false)
    this.messageSubscribeStatus = true
  }

  offOriginalIframeMessage = () => {
    window.removeEventListener('message', this.messageHandler)
    this.messageSubscribeStatus = false
  }

  /* 原始iframe message监听 */
  originalIframeMessageHandle = () => {
    if (!this.messageSubscribeStatus) {
      this.onOriginalIframeMessage()
    }
  }

  /**
   * 处理退登逻辑，当前清空缓存并显示弹窗
   * @param options - 弹窗配置
   * @param psdChange - 是否修改了密码
   */
  handleLogout = ({ message, title }: { message?: string; title?: string } = {}, psdChange?: boolean) => {
    const isLoginPath = window.location.href.indexOf('login') !== -1

    // 登录页不弹（因修改密码退登除外，需要告知用户去重新登录）
    if (isLoginPath && !psdChange) return
    // 已存在退登弹窗：本次忽略（全局单例接管，替代旧的 DOM 类名守卫）
    if (isLogoutDialogVisible()) return

    // 对齐老基座 originalMessage.js：弹窗前不清缓存，用户点确认后再清 + 退登
    showLogoutDialog({
      message,
      title,
      reason: psdChange ? 'psd' : 'invalid',
      clearBeforeShow: false,
    })
  }
}

export default new OriginalMessage()
