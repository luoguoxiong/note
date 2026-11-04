import {
  isAmapMiniApp,
  isAliMiniApp,
  isH5FSEnv,
  isWechatEnv,
  isWxAppEnv,
  isWxAppOhosEnv,
  isWxMiniApp,
} from '@/public/utils'

/** 每日任务端渠道：1-app 2-微信小程序 3-支付宝 4-鸿蒙 5-高德 6-飞书 */
export enum DailyTaskChannel {
  'app' = 1,
  'wxMiniApp' = 2,
  'aliMiniApp' = 3,
  'ohos' = 4,
  'amapMiniApp' = 5,
  'feishu' = 6,
}

/** 获取每日任务端渠道 */
export const getDailyTaskChannel = (): DailyTaskChannel => {
  // 鸿蒙需先于 app 判断（isWxAppOhosEnv 是 isWxAppEnv 的子集）
  if (isWxAppOhosEnv) return DailyTaskChannel.ohos
  if (isWxAppEnv) return DailyTaskChannel.app
  if (isAmapMiniApp) return DailyTaskChannel.amapMiniApp
  if (isAliMiniApp) return DailyTaskChannel.aliMiniApp
  if (isWxMiniApp || isWechatEnv) return DailyTaskChannel.wxMiniApp
  if (isH5FSEnv) return DailyTaskChannel.feishu
  return DailyTaskChannel.aliMiniApp
}
