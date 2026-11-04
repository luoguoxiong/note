import { getChannel } from '@order-public-sub-public/configs'
import { Channel } from '@order-public-sub-public/constants'
import { isAliPayClient, isWxApplet } from '@order-public-sub-public/utils/device'
import { $native } from '@order-public-sub-public/utils'

//通知更新缓存
export const updateInitConfigCache = (forceRefresh = '1') => {
  if (getChannel() !== Channel.快速寄件) {
    return
  }
  if (isWxApplet || isAliPayClient) {
    //通知刷新下单配置缓存
    $native.postMessage({
      actionType: 'UPDATE_STORAGE_ORDER_CONFIG',
      data: {
        forceRefresh,
      },
    })
  } else {
    $native.getPreloadOrderData({
      refresh: 1,
      forceRefresh,
    })
  }
  console.log('通知更新缓存')
}
