/**
 * 获取设备唯一标识
 * 最多重试 5 次，指数退避延迟：第1次重试2s，第2次4s，第3次8s...
 * 全部失败后返回空字符串
 */
import { getNativePlugin } from '@public/appPlugins/utils/pluginLoader'

const DEVICE_PLUGIN_ID = 'wxbe1a61223a0aa4d7'
const MAX_RETRY = 5

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function attemptGetDeviceId(retryCount: number = 0): Promise<string> {
  const plugin = await getNativePlugin(DEVICE_PLUGIN_ID, 'getDeviceId')
  if (!plugin?.getDeviceId) {
    throw new Error('getDeviceId not found')
  }
  let res = plugin.getDeviceId({
    allowsMultipleSelection: true,
  })

  console.error('getDeviceId', typeof res, `${res?.code}` === '0', res?.data)

  if (typeof res === 'string') {
    res = JSON.parse(res)
  }
  if (`${res.code}` === '0') {
    return res?.data || ''
  }
  throw new Error(`getDeviceId failed, code: ${res?.code}`)
}

export function getDeviceId(): Promise<string> {
  return new Promise((resolve) => {
    const retry = async (count: number) => {
      try {
        const deviceId = await attemptGetDeviceId(count)
        resolve(deviceId)
      } catch (err) {
        console.error(`getDeviceId 第 ${count + 1} 次尝试失败:`, err)
        if (count + 1 >= MAX_RETRY) {
          resolve('')
        } else {
          const delayMs = Math.pow(2, count + 1) * 1000
          console.error(`getDeviceId ${delayMs / 1000}s 后进行第 ${count + 2} 次尝试`)
          await sleep(delayMs)
          retry(count + 1)
        }
      }
    }
    retry(0)
  })
}
