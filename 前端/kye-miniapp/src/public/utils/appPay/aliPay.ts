/**
 * @Desc: aliPay
 * @Date: 2025/8/22
 */

import { AppPlugin } from '@public/appPlugins'
import { isWeixinAppSync } from '@public/config'
import { iosAlipayUrlSchemes } from '@public/utils/appPay/constant'
import { isWxAppIos } from '@public/appPlugins/utils/device'
import { report_other_event } from '@/public/utils'

type AliPayParams = {
  orderString: string
  out_trade_no: string
}
/* APP端 - 唤起支付宝支付 */
export const handleAppAliPay = async (params: AliPayParams) => {
  try {
    const isWeixinApp = isWeixinAppSync()
    if (!isWeixinApp) {
      return
    }
    // ios-app标识
    const isWxAppIOS = await isWxAppIos()
    // app端默认配置
    const defaultParams = isWxAppIOS
      ? {
          urlSchema: iosAlipayUrlSchemes, // App urlSchema
        }
      : {}
    const { orderString } = params || {}
    const opts = {
      orderString: decodeURIComponent(decodeURIComponent(orderString)),
      ...defaultParams,
    }
    AppPlugin.error('payAliOrderAsyncWithCallback opts', opts)
    if (AppPlugin?.pay?.payAliOrderAsyncWithCallback) {
      const result = await AppPlugin?.pay?.payAliOrderAsyncWithCallback(opts)
      console.log('[appPlugin] handleAppAliPay result', result)
      report_other_event('appAliPayCallback', {
        result: typeof result === 'string' ? result : JSON.stringify(result),
      })
    }
  } catch (e) {
    AppPlugin.error(e)
  }
}

/**
 * APP端 - 支付宝支付结果监听
 * @param listener
 */
export const handleAppAliPayResultSubscribe = (listener) => {
  try {
    const isWeixinApp = isWeixinAppSync()
    if (!isWeixinApp) {
      return
    }
    AppPlugin.pay?.onMiniPluginEvent(listener)
  } catch (e) {
    AppPlugin.error(e)
  }
}
export const handleAppAliPayResultUnSubscribe = (listener) => {
  try {
    const isWeixinApp = isWeixinAppSync()
    if (!isWeixinApp) {
      return
    }
    AppPlugin.pay?.offMiniPluginEvent(listener)
  } catch (e) {
    AppPlugin.error(e)
  }
}
