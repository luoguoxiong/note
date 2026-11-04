/**
 * @Desc: unifyPay
 * @Date: 2025/8/22
 */
import { AppPlugin } from '@public/appPlugins'

/**
 * APP唤起银联支付
 * @param opts
 * @returns {Promise<unknown>}
 */
export const handleAppUnifyPay = (opts) => {
  const { channel } = opts || {}
  const data = { ...opts }
  if (data) {
    delete data.channel
  }
  const params = {
    data,
    channel,
  }
  console.log('[appPlugin] handleAppUnifyPay', params)
  return AppPlugin.pay?.payUnifyAsyncWithCallback(params)
}
