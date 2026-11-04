import { Any } from '@/types'

const nativeCallBackMap: Any = {
  net_downLoadFile: 'net_downLoadResult',
  net_downLoadFileByBatch_New: 'net_downLoadFileByBatchResult',
  electron_testProxy: 'electron_testProxyResult',
  electron_updateLog: 'electron_updateLogResult',
  kuasheng_getZoom: 'kuasheng_getZoomResult',
}

const kuashengNativeAsyn = () => {
  const _window: Any = window
  for (const key in nativeCallBackMap) {
    _window[`${key}_oldFun`] = _window[key]
    const newFun = (...args: Any[]) => {
      return new Promise((resolve, reject) => {
        const callbackFun: Any = nativeCallBackMap[key]
        _window[callbackFun] = (res: Any) => {
          console.log('返回值', res, typeof res)
          if (typeof res === 'string') {
            res = JSON.parse(res)
          }
          if (res.code === 0) {
            return resolve(res)
          }
          reject(res)
        }
        _window[`${key}_oldFun`](...args)
      })
    }
    _window[key] = newFun
  }
}
export default {
  kuashengNativeAsyn,
}
