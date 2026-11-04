import md5 from 'js-md5'
import * as Type from './type'

/**
 * 轮询工具函数
 * @param fn   每次轮询调用的方法，返回 Promise<结果或null>
 * @param interval 轮询间隔，默认 500ms
 * @param timeout  超时时间，默认 5000ms
 */
export function poll<T>(
  fn: () => Promise<T | null>,
  interval = 500,
  timeout = 5000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const start = Date.now()

    const timer = setInterval(async () => {
      try {
        const result = (await fn()) as any
        if (result.data) {
          clearInterval(timer)
          resolve(result.data)
        } else if (Date.now() - start >= timeout) {
          clearInterval(timer)
          reject(new Error('轮询超时'))
        }
      } catch (err) {
        clearInterval(timer)
        reject(err)
      }
    }, interval)
  })
}

type ApiResponse<T = any> = {
  success: boolean
  data: T
  message?: string
  code: number
  msg: string
  [key: string]: any
}

export const md5Http = (
  token: string,
  timestamp: number,
  body?: Record<string, any> | any,
): string => {
  return md5(
    md5(token).toUpperCase() + timestamp + JSON.stringify(body || {}),
  ).toUpperCase()
}

export async function chhommonHttp<T = any>(
  apiCode: string,
  data: Record<string, any> | null = null,
  customHeaders: Record<string, string> = {},
  isProd: boolean,
): Promise<ApiResponse<T>> {
  const timestamp = Date.now()

  const token = window.sessionStorage.getItem('token') || ''

  const headers = {
    'Content-Type': 'application/json;charset=UTF-8',
    appKey: isProd ? '80013' : '50342',
    token,
    Method: apiCode,
    timestamp: timestamp.toString(),
    sign: md5Http(token, timestamp, data),
    ...customHeaders,
  }

  const options: RequestInit = {
    method: 'POST',
    headers: headers as HeadersInit,
    body: data ? JSON.stringify(data) : null,
  }

  const response = await fetch(
    isProd
      ? `/router/rest?${apiCode}`
      : `https://ic-h5-uat.kye-erp.com/router/rest?${apiCode}`,
    options,
  )

  const jsonResponse: ApiResponse<T> = await response.json()

  return jsonResponse
}

export async function http<T = any>(
  apiCode: string,
  data: Record<string, any> | null = null,
  isProd: boolean,
  customHeaders: Record<string, string> = {},
): Promise<ApiResponse<T>> {
  return chhommonHttp(apiCode, data, customHeaders, isProd)
}

// web.basic.biz.native.store.get
// web.native.store.get
export const nativeGet = async (taskKey: string, isProd: boolean) => {
  return await poll(
    () => http<string>('web.native.store.get', { key: taskKey }, isProd),
    1000,
    600000,
  )
}

export const uuid = (): string => {
  function b(a?: number) {
    return a
      ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
      : (([1e7] as any) + -[1e3] + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
  }
  return b()
}

export const createTaskId = (methodName = 'native') => {
  return `${methodName}-${uuid()}`
}
/**
 * 转换 ShareParmas -> ShareToWxMini
 * @param params
 * @returns
 */
export const parseShareParams = (
  params: Type.ShareParmas,
  isProd: boolean,
): Type.ShareToWxMini => {
  if (params.contentType === 'image') {
    return {
      type: 'ShareImage',
      shareInfo: {
        imagePath: params.imageUrl || params.imgUrl || '',
        thumbPath: params.imageUrl || params.imgUrl,
        entranceMiniProgramUsername: params.programUserName || '',
        entranceMiniProgramPath: params.programPath || params.path || '',
        scene: 0, // 默认分享到会话
        miniprogramType: isProd ? 0 : 2,
      },
    }
  } else if (params.contentType === 'url') {
    return {
      type: 'ShareWebPage',
      shareInfo: {
        title: params.title || '',
        description: params.desc || params.content || '',
        thumbPath: params.imageUrl || params.imgUrl || params.bgImgUrl || '',
        webpageUrl: params.link || '',
        scene: 0, // 默认分享到会话
      },
    }
  } else {
    return {
      type: 'ShareMiniApp',
      shareInfo: {
        userName: params.programUserName || '',
        path: params.programPath || params.path || '',
        title: params.title || '',
        imagePath: params.imageUrl || params.imgUrl || '',
        webpageUrl: params.link || '',
        withShareTicket: true,
        miniprogramType: isProd ? 0 : 2,
        scene: 0, // 默认分享到会话
      },
    }
  }
}
