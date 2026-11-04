/**
 * 回到旧版跳转工具
 * 来源: netc-pc-web/src/views/layout/components/back-version-dialog/backVersionUtil.js
 *
 * 说明:
 * - 老项目 handleBackVersionInfoAsync 依赖 apiBackOldVersionInfo 接口
 *   (web.user.lightApplication.backToVersion.backOldVersionInfo), 新基座 header API 层未提供该接口, 暂不迁移
 * - 老项目 clearGrayHomeMenuItemCurrent(清空灰度首页缓存) 新基座无对应能力, 此处省略
 */
import { routerReload } from '@/stores/pc-web/deps/misc'

/** 返回旧版提交接口返回的应用信息 */
export interface BackVersionApplicationInfo {
  /** 旧版应用地址 */
  loadAddress?: string
  /** 线上版本 md5 */
  md5?: string
  /** 完整路由 */
  fullPath?: string
}

/**
 * 获取 hash 路由当前 path(等价老项目 router.history.current.path)
 */
const getCurrentRoutePath = () => {
  const hash = window.location.hash || ''
  return hash.replace(/^#/, '').split('?')[0]
}

/* 回到旧版本跳转(老项目 envSdk.grayLocationTo 的等价实现: 同地址仅刷新, 否则 location.replace 到旧版应用) */
export const handleBackVersion = (applicationInfo?: BackVersionApplicationInfo) => {
  const { loadAddress, fullPath } = applicationInfo || {}
  if (!loadAddress) {
    routerReload()
    return
  }
  // 老项目逻辑: /admin/home 暂不支持回到旧版本首页, 跳转运单列表
  const currentPath = getCurrentRoutePath()
  const path = currentPath === '/admin/home' ? '/admin/waybill-v3' : currentPath
  // 匹配接口下发 loadAddress 与当前 url 是否一致(老项目 loadAddressRoutePathCheck)
  const hrefUrl = window.location.origin + window.location.pathname
  if (hrefUrl === loadAddress) {
    // 同一版本, 强制刷新
    routerReload()
  } else {
    // 跳转旧版应用(md5 仅用于老项目离线包比对, 新基座无离线包能力)
    window.location.replace(`${loadAddress}#${fullPath || path}`)
  }
}
