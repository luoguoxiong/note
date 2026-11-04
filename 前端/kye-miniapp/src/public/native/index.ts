import { openURL } from '@/modules/webview/utils'
import { urlContact, uuid } from '../utils'

type Options = Record<string, string>

interface OpenWebUpload {
  /** 当前使用组件名称 */
  componentName?: string
  /** web H5 input属性设置 */
  inputOptions?: Options
  /** 文件中心biz配置 */
  bizOptions?: Options
  /** 上传大小限制 */
  limit?: number
  /** 最大上传文件数量 */
  maxLength?: number
  /** 上次完成后回调 */
  callback: WebUploadCallback
  source: 'pc' | 'mobile'
}

interface WebUploadCallbackQuery {
  componentName: string
  type: 'from-chat' | 'from-files'
  data: any[]
}

// eslint-disable-next-line no-unused-vars
type WebUploadCallback = (parmas: WebUploadCallbackQuery) => void

export const openWebUpload = ({
  componentName,
  inputOptions,
  bizOptions,
  limit = 10,
  maxLength = 10000000,
  source = 'pc',
  callback,
}: OpenWebUpload) => {
  const uuId = componentName || uuid()
  const url =
    process.env.TARO_APP_ENV !== 'prod'
      ? 'https://ic-h5-uat.kye-erp.com/netc-h5-modules/native/0.0.171/index.html'
      : 'https://ic-h5.kye-erp.com/netc-h5-modules/native/index.html'
  openURL(
    urlContact(url, {
      componentName: uuId,
      inputOptions: inputOptions ? JSON.stringify(inputOptions) : '',
      bizOptions: bizOptions ? JSON.stringify(bizOptions) : '',
      limit,
      maxLength,
      source,
    }),
  )
  return listenWebUpload({
    componentName: uuId,
    callback,
  })
}

// 用于存储所有监听的回调
const webUploadListeners: Record<string, WebUploadCallback> = {}

export const emitWebUpload = (data: WebUploadCallbackQuery) => {
  // 触发所有监听的 callback
  const { componentName } = data
  const cb = webUploadListeners[componentName]
  try {
    cb(data)
  } catch (err) {
    console.error('emitWebUpload callback error:', err)
  }
}

export const listenWebUpload = ({
  componentName,
  callback,
}: {
  componentName: string
  callback: WebUploadCallback
}) => {
  if (typeof callback === 'function' && typeof componentName === 'string') {
    webUploadListeners[componentName] = callback
  }

  return () => {
    delete webUploadListeners[componentName]
  }
}
