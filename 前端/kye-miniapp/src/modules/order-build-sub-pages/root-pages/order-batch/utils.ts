//通知更新缓存
import { isWxApplet } from '@order-public-sub-public/utils/device'
import { $native } from '@order-public-sub-public/utils'

export const updateInitBatchConfigCache = (forceRefresh = '1') => {
  //通知刷新下单配置缓存，app可以自己触发及调用
  if (!isWxApplet) {
    return
  }
  $native.postMessage({
    actionType: 'UPDATE_STORAGE_ORDER_CONFIG',
    data: {
      forceRefresh,
    },
  })
}
export const postMessageSuccess = () => {
  if (!isWxApplet) {
    return
  }
  $native.postMessage({
    actionType: 'UPDATE_GO_BATCH_SUCCESS',
  })
}
