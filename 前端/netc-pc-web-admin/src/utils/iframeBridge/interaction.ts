import { showLogoutDialog } from './logoutDialog'

/**
 * 退登处理 - 清空缓存并显示弹窗
 * 与公共 request 拦截器 / 子应用 loginOut / 原始 postMessage 共用全局退登弹窗单例，
 * 防重入与「确认后退登」均由单例统一接管，调用方无需再拼 then。
 * @param data { msg: string; code: string; title: string }
 */
export const handleLogOutConfirm = (data: { msg?: string; code?: string; title?: string } = {}) => {
  return showLogoutDialog({
    message: data.msg,
    title: data.title,
    reason: 'invalid',
  })
}

/** 直接退出登录（实现已移至 ./userLogout，此处保留导出以兼容既有引用） */
export { userLogOut } from './userLogout'
