/**
 * @Desc: initCommonLaunch
 * @Date: 2025/12/12
 */

/* 应用是否冷启动完毕 */
let appLaunchReady = false

/* 获取是否冷启动完毕标识 */
export const getAppLaunchStatus = () => {
  return appLaunchReady
}
/* 更新是否冷启动完毕标识 */
export const updateAppLaunchStatus = (value: boolean) => {
  appLaunchReady = value
}

/* 全局通用-冷启动逻辑 */
export const initCommonLaunch = () => {
  // 2s后才标识-已经冷启动完成
  setTimeout(() => {
    updateAppLaunchStatus(true)
  }, 2000)
}
