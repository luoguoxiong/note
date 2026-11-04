import { getToken } from '@/public/storage'
import { http } from '../request'
import { urlContact } from '../url'
import { isAmapMiniApp } from '../device'

// 声明支付宝小程序全局对象类型（如果 @mini-types/alipay 未正确加载）
declare const my: {
  getAuthCode: (_options: {
    scopes: string[]
    success: (_result: { authCode: string }) => void
    fail: (_error: any) => void
  }) => void

  gd: {
    getAmapAuthCode: (_options: {
      scopes: string[]
      showErrorTip: boolean
      success: (_result: { authCode: string }) => void
      fail: (_error: any) => void
    }) => void
  }
}

// 任务队列
let taskQueue: Array<() => void> = []
let isExecuting = false

// 执行队列中的下一个任务
function executeNextTask() {
  if (taskQueue.length === 0) {
    isExecuting = false
    return
  }

  const nextTask = taskQueue.shift()!
  nextTask()
}

export async function getAmapAuthCodeTask() {
  // 每次调用都创建新的请求，但通过任务队列确保同一时间只有一个在执行

  const requiredScopes = ['auth_base', 'auth_user', 'auth_phone']

  return new Promise<{ authCode: string }>((resolve, reject) => {
    const task = () => {
      // 创建新的请求 Promise
      my.gd.getAmapAuthCode({
        scopes: requiredScopes,
        showErrorTip: false,
        success: (result: { authCode: string }) => {
          resolve(result)
          executeNextTask() // 执行下一个任务
        },
        fail: (error: any) => {
          reject(error)
          executeNextTask() // 执行下一个任务
        },
      })
    }

    if (isExecuting) {
      // 如果正在执行，将任务加入队列
      taskQueue.push(task)
    } else {
      // 如果没有在执行，立即执行任务
      isExecuting = true
      task()
    }
  })
}

export async function getAmapAuthCode() {
  return await new Promise<{ authCode: string }>((resolve, reject) => {
    my.gd.getAmapAuthCode({
      scopes: ['auth_base', 'auth_user', 'auth_phone'],
      showErrorTip: false,
      success: (result: { authCode: string }) => {
        resolve(result)
      },
      fail: (error: any) => {
        reject(error)
      },
    })
  })
}

export async function getAlipayOpenId() {
  try {
    const authCode = await new Promise<string>((resolve, reject) => {
      my.getAuthCode({
        scopes: ['auth_base'],
        success: (result: { authCode: string }) => {
          resolve(result.authCode)
        },
        fail: (error: any) => {
          reject(error)
        },
      })
    })
    const resp = await http<{ userOpenIdEncrypt: string }>(
      'web.login.loginComponent.userOpenId',
      {
        authCode,
        from: 45,
      },
      { hideToast: true },
    )
    return resp.data.userOpenIdEncrypt
  } catch {
    return ''
  }
}

let cacheAlipayOpenId = ''

export async function resetOpenId() {
  cacheAlipayOpenId = ''
}

const NEED_CONNECT_URLS = ['/fms-online-settlement-h5']

export async function connectOpenId(url: string) {
  if (!getToken() || !isAmapMiniApp) return url

  if (!NEED_CONNECT_URLS.some((item) => url.includes(item))) return url

  cacheAlipayOpenId = cacheAlipayOpenId || (await getAlipayOpenId())

  let result = url

  if (result.indexOf('userOpenIdEncrypt=') > -1) {
    result = result.replace(/userOpenIdEncrypt=[^&]*/, `userOpenIdEncrypt=${encodeURIComponent(cacheAlipayOpenId)}`)
  } else {
    result = urlContact(result, { userOpenIdEncrypt: cacheAlipayOpenId })
  }
  return result
}
