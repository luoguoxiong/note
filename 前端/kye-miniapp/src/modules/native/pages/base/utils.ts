import Taro from '@tarojs/taro'
import { nativeSave } from '../api/index'
import { OpenFileParmas } from './type'
import { downloadFile } from '../utils'
import { getEnvConfig } from '@/public/config'
import plateform from '@kye-netc/plateform'

/**
 * 统一上报
 */
function report(taskKey: string, data: any, isSuccess: boolean) {
  nativeSave({
    key: taskKey,
    value: JSON.stringify({ result: data, isSuccess }),
  })
}

/**
 * 封装 Taro API 调用
 */
function wrapTaroApi<T>(
  api: (_opt: any) => void,
  taskKey: string,
  data: Record<string, any>,
  transform?: (_res: any) => Promise<T> | T,
  navigateEarly?: boolean,
) {
  api({
    ...data,
    success: async (res: any) => {
      if (navigateEarly) {
        Taro.navigateBack()
      }

      try {
        const result = transform ? await transform(res) : res
        report(taskKey, result, true)
      } catch (e) {
        report(taskKey, e, false)
      } finally {
        if (!navigateEarly) {
          Taro.navigateBack()
        }
      }
    },
    fail: (res: any) => {
      report(taskKey, res, false)
      Taro.navigateBack()
    },
  })
}

/**
 * 图片选择并转 base64
 */
export const chooseImage = (data: Taro.chooseImage.Option, taskKey: string) => {
  wrapTaroApi(
    Taro.chooseMedia,
    taskKey,
    {
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      mediaType: ['image'],
      count: Number(data.count) || 1,
    },
    async (res) => {
      const filePaths = res.tempFiles
      const promises = filePaths.map(
        (item) =>
          new Promise<{ fileName: string; fileSize: string; base64: string }>(async (resolve, reject) => {
            try {
              const suffix = item.tempFilePath.substring(item.tempFilePath.lastIndexOf('.')) || '.jpg'
              const file = await uloadToBizCode({ path: item.tempFilePath, name: `img-${Date.now()}${suffix}` })
              resolve(file)
            } catch (error) {
              reject(error)
            }
          }),
      )

      return Promise.all(promises)
    },
    true,
  )
}

/**
 * 获取地理位置
 */
export const getLocation = (data: Taro.getLocation.Option, taskKey: string) => {
  wrapTaroApi(Taro.getLocation, taskKey, data)
}

/**
 * 扫码
 */
export const scanCode = async (data: Taro.scanCode.Option, taskKey: string) => {
  try {
    const res = await plateform.scanCode()
    Taro.navigateBack()
    report(taskKey, res, true)
  } catch (error) {
    Taro.navigateBack()
    report(taskKey, error, false)
  }
}

/**
 * 获取粘贴板内容
 */
export const getClipboardData = (data: Taro.getClipboardData.Option, taskKey: string) => {
  wrapTaroApi(Taro.getClipboardData, taskKey, data)
}

export const openFile = async (data: OpenFileParmas, taskKey: string) => {
  try {
    const filePath = await downloadFile(data.url)
    wx.miniapp.shareFile({
      filePath,
      success(res) {
        report(taskKey, res, true)
        Taro.navigateBack()
      },
      fail(res) {
        report(taskKey, res, false)
        Taro.navigateBack()
      },
    })
  } catch (error) {
    report(taskKey, error, true)
  }
}

export const uloadToBizCode = async (file: { path: string; name: string }) => {
  const { isProd } = getEnvConfig()
  const requestUrl = isProd ? 'https://ic-api.ky-express.com' : 'https://ic-api-uat.ky-express.com'

  const uploadRes = await Taro.uploadFile({
    url: `${requestUrl}/router/upload`,
    filePath: file.path,
    name: 'file',
    formData: {
      bizCode: 'IC_NATIVE_UPLOAD_TEMP',
      originalName: file.name,
      name: file.name,
    },
  })

  const res = JSON.parse(uploadRes.data)

  if (res.code === 0) {
    const data = (res?.data || []).find((v: any) => v.lastOperate === 1) || {}
    return data.url
  }
}
