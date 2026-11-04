/**
 * @Desc: 用户退登动作（清空登录态 + 整页刷新）
 *
 * 从 interaction.ts 拆出，供退登弹窗单例(logoutDialog)与交互事件共用，
 * 避免 logoutDialog ↔ interaction 之间形成循环依赖。
 */
import { routerReload } from '@/stores/pc-web/deps/misc'

/**
 * 直接退出登录
 * 对齐旧基座 netc-pc-web/src/utils/commonUtil.js userLogout：
 * 清空缓存后 routerReload 整页刷新，由路由守卫校验 token 失效并跳回登录页
 * （旧版壳 30 天免登录清理 __setLocalCache('AUTO_*') 与官网登录标识 cookie，
 *   新基座无对应缓存体系，与 useSwitchLoginSuccess 同口径略去）
 *
 * 说明：登录失效弹窗场景的 sessionStorage 已由 showLogoutDialog 在弹窗前清空，
 * 此处为主动退登/兜底入口，重复清理无副作用
 */
export const userLogOut = () => {
  // 清空会话缓存
  sessionStorage.clear()
  // [客服中心-中转页]需求：登录完成后会往 localStorage 写入 token 字段，用户退出后需要清除
  localStorage.setItem('TOKEN', '')
  // 重载清空状态，路由守卫会拦截并跳回登录页
  routerReload()
}
