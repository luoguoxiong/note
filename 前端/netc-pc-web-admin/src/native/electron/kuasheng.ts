/**
 * 跨声3.0壳异步回调处理
 */
import type { Any } from '@/types'

// 回调映射关系
const nativeCallBackMap: Record<string, string> = {
  net_downLoadFile: 'net_downLoadResult',
  net_downLoadFileByBatch_New: 'net_downLoadFileByBatchResult',
  electron_testProxy: 'electron_testProxyResult',
  electron_updateLog: 'electron_updateLogResult',
  kuasheng_getZoom: 'kuasheng_getZoomResult',
  kuasheng_startCaptureWnd: 'kuasheng_sendCaptureImageData',
  kuasheng_getImageFilesFromClipBoard: 'kuasheng_getImageFilesFromClipBoardResult',
}

/**
 * 初始化跨声壳异步回调
 */

export const kuashengNativeAsyn = () => {
  const _window: Any = window

  for (const key in nativeCallBackMap) {
    // 已经代理过
    if (_window[`${key}_oldFun`]) {
      console.warn(`${key} already wrapped`)
      continue
    }

    const oldFun = _window[key]

    if (!oldFun) {
      console.warn(`${key} not exist`)
      continue
    }

    _window[`${key}_oldFun`] = oldFun

    const newFun = (...args: Any[]) => {
      return new Promise((resolve, reject) => {
        const callbackFun = nativeCallBackMap[key]

        _window[callbackFun] = (res: Any) => {
          if (typeof res === 'string') {
            res = JSON.parse(res)
          }

          res.code === 0 ? resolve(res) : reject(res)
        }

        oldFun(...args)
      })
    }

    _window[key] = newFun
  }
}

export default {
  kuashengNativeAsyn,
}
