/**
 * 旧基座(netc-pc-web) 其它工具适配层
 * 来源:
 *  - netc-pc-web/src/utils/commonUtil.js (generateBrowserUuid)
 *  - netc-pc-web/src/utils/message.js (kye_message)
 *  - netc-pc-web/src/views/payment-authorization/utils/index.js (resolveBack)
 *  - netc-pc-web/src/utils/envSdk.js (routerReload)
 *
 * 使用场景: pc-web 各 Pinia store 的 action 内部复用旧基座工具逻辑
 *
 * 【2026-09 删除】轻应用/下单配置相关工具(菜单/轻应用已采用新方案, 见 @/stores/permission + lightapp):
 * getClickId/setClickId、getOrderConfigUrl/getOrderConfigUrlWithParam、getApplicationUrl/getMicroUrlWithParam、
 * iframeMicroResolvedCheck、setHomeMenuStorage、eventEmitter 再导出
 */
import { uuid } from '@/utils'

// ==================== uuid (旧 commonUtil.generateBrowserUuid) ====================

/** 浏览器唯一ID: localStorage.BROWSER_FINGER_PRINT, 不存在则生成并回写 */
export const generateBrowserUuid = (): string => {
  let id = localStorage.getItem('BROWSER_FINGER_PRINT')
  if (!id) {
    id = uuid()
    localStorage.setItem('BROWSER_FINGER_PRINT', id)
  }
  return id
}

// ==================== 消息弹窗 (旧 utils/message.js kye_message, element-ui MessageBox -> element-plus ElMessageBox) ====================

// export const kye_message = {
//   /**
//    * confirm 提示, options 与旧基座 kye_message.confirm 一致
//    * @deprecated 旧基座适配层遗留(当前 src 下已无引用), 新代码请勿使用:
//    * 二次确认弹窗直接用 element-plus 的 ElMessageBox.confirm(命令式),
//    * 需要自定义内容/按钮时用 @netc-design-pc/ui 的 KMessageBox / KMessageBoxDialog 组件
//    */
//   confirm(msg: string, options: Record<string, any> = {}) {
//     const {
//       title,
//       needTitle,
//       type = 'warning',
//       confirmButtonText,
//       cancelButtonText,
//       confirmButtonClass,
//       cancelButtonClass,
//       showCancelButton = true,
//       customClass,
//     } = options
//     return ElMessageBox.confirm(msg, needTitle ? title : '', {
//       type,
//       confirmButtonText: confirmButtonText || '确定',
//       cancelButtonText: cancelButtonText || '取消',
//       showCancelButton,
//       closeOnClickModal: false,
//       closeOnPressEscape: false,
//       customClass,
//       ...(confirmButtonClass ? { confirmButtonClass } : {}),
//       ...(cancelButtonClass ? { cancelButtonClass } : {}),
//     })
//   },
// }

// ==================== 付款授权工具 (旧 views/payment-authorization/utils) ====================

/** 接口结果分发: code===0 且 data 非空走 success, 否则走 error */
export const resolveBack = (res: any, successCb: () => void, errorCb: () => void) => {
  if (res?.code === 0 && !isEmptyValue(res?.data)) {
    successCb()
  } else {
    errorCb()
  }
}

/** lodash isEmpty 的最小实现(避免循环依赖, 行为一致: null/undefined/空串/空数组/空对象) */
const isEmptyValue = (val: any): boolean => {
  if (val === null || val === undefined) return true
  if (Array.isArray(val) || typeof val === 'string') return val.length === 0
  if (typeof val === 'object') return Object.keys(val).length === 0
  return false
}

// ==================== 环境刷新 (旧 utils/envSdk.routerReload) ====================

/**
 * 旧实现: 壳内走 native.reload(), 网页走 location.reload()
 * 新基座暂无 native reload 能力, 统一走浏览器刷新
 */
export const routerReload = () => {
  location.reload()
}
