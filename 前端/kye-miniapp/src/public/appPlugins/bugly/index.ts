import { isWxAppEnv } from '@/public/utils'
import Taro from '@tarojs/taro'
import { getNativePlugin } from '@public/appPlugins/utils/pluginLoader'

/**
 * Bugly 插件 ID
 */
const BUGLY_PLUGIN_ID = 'wxbe1a61223a0aa4d7'

/**
 * 获取设备唯一标识
 *
 * 规则：
 * deviceId = 设备型号 + userId
 *
 * 示例：
 * iPhone15,3_10001
 */
function createDeviceId(userId: string) {
  const systemInfo = Taro.getSystemInfoSync()

  // 设备型号
  const model = systemInfo.model || 'unknown'

  /**
   * 去掉空格，避免部分机型：
   * "iPhone 15 Pro"
   * 变成：
   * "iPhone15Pro"
   */
  const safeModel = model.replace(/\s+/g, '')

  return `${safeModel}_${userId}`
}

/**
 * 加载 Bugly 原生插件（使用全局单例）
 */
function loadBuglyPlugin(): Promise<any> {
  return getNativePlugin(BUGLY_PLUGIN_ID, 'Bugly')
}

/**
 * 获取当前隐私授权状态
 *
 * true  -> 用户已同意隐私协议
 * false -> 用户未同意隐私协议
 */
function getPrivacyAuthorized(): Promise<boolean> {
  return new Promise((resolve) => {
    wx.miniapp.getPrivacySetting({
      success(res) {
        const isAuthorized = !res.needAuthorization

        console.log('[Bugly] privacy status:', isAuthorized ? 'authorized' : 'unauthorized')

        resolve(isAuthorized)
      },
      fail(err: any) {
        console.error('[Bugly] getPrivacySetting fail:', err)
        // 默认返回 false，避免未授权时调用插件
        resolve(false)
      },
    })
  })
}

/**
 * 设置 Bugly 隐私状态
 *
 * @param status 是否同意隐私协议
 */
async function setPrivacyStatusSync(status = false) {
  try {
    const plugin = await loadBuglyPlugin()

    const result = plugin?.setPrivacyStatusSync(
      {
        status,
      },
      (err: any) => {
        console.error('[Bugly] setPrivacyStatusSync error:', err)
      },
    )

    console.log('[Bugly] setPrivacyStatusSync success:', result)

    return result
  } catch (err) {
    console.error('[Bugly] setPrivacyStatusSync fail:', err)
  }
}

/**
 * 检查隐私协议状态，并同步给 Bugly
 *
 * 小程序启动时建议调用一次
 */
async function checkPrivacyStatus() {
  if (!isWxAppEnv) return
  const isAuthorized = await getPrivacyAuthorized()

  await setPrivacyStatusSync(isAuthorized)
}

/**
 * 设置 Bugly 用户信息
 *
 * 注意：
 * - 用户未同意隐私协议时不会执行
 * - deviceId 自动生成：设备型号 + userId
 */
export async function setBuglyUserInfoSync(userId: string) {
  if (!isWxAppEnv) return
  try {
    // 检查隐私授权状态
    const isAuthorized = await getPrivacyAuthorized()

    if (!isAuthorized) {
      console.warn('[Bugly] user has not authorized privacy agreement')
      return
    }

    const plugin = await loadBuglyPlugin()

    plugin.setUMengAPMUserInfoSync({
      userId: userId,
    })

    const deviceId = createDeviceId(userId)

    plugin?.setBuglyUserInfoSync({
      deviceId,
      userId,
    })
  } catch (err) {
    console.error('[Bugly] setBuglyUserInfoSync fail:', err)
  }
}

/**
 * 测试app 异常情况上报
 * @param type 1 java crash 2 native crash 3 anr 4 内存溢出
 */
async function testUmengCrash(type: '1' | '2' | '3' | '4') {
  try {
    const plugin = await loadBuglyPlugin()

    const result = plugin?.testBuglyCrash(
      {
        type,
      },
      (err: any) => {
        console.error('[Bugly] testBuglyCrash error:', err)
      },
    )

    console.log('[Bugly] testBuglyCrash success:', result)

    return result
  } catch (err) {
    console.error('[Bugly] testBuglyCrash fail:', err)
  }
}

/**
 * Bugly 日志能力导出
 */
export const buglyLog = {
  setBuglyUserInfoSync,
  checkPrivacyStatus,
  testUmengCrash,
}
