import { uuid } from '@/public/utils'
import Taro from '@tarojs/taro'

export const getFileName = (url: string, fileType?: string): Promise<string> => {
  let filePath = url?.split('/').pop()
  
  if(filePath && filePath.includes('?')){
    filePath= filePath.split('?').shift()
  }
  if (filePath?.includes('.')) {
    return Promise.resolve(wx.env.USER_DATA_PATH + '/' + filePath)
  }

  return new Promise((resolve) => {
    Taro.request({
      url: url,
      method: 'HEAD',
      success: (headRes) => {
        const disposition = headRes.header['Content-Disposition'] || headRes.header['content-disposition']
        let fileName = `default.${fileType || 'jpg'}`
        if (disposition) {
          // 处理 filename* 的情况
          let match = disposition.match(/filename\*=\s*UTF-8''([^;]+)/i)
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1])
          } else {
            // fallback 普通 filename=
            match = disposition.match(/filename="?([^"]+)"?/i)
            if (match && match[1]) {
              fileName = decodeURIComponent(match[1])
            }
          }
        }
        resolve(wx.env.USER_DATA_PATH + `/${fileName}`)
      },
      fail: (err) => {
        console.error('getFileName fail', err)
        const fileName = filePath + '.jpg' || `feedback_${uuid()}.${fileType || 'jpg'}`

        resolve(wx.env.USER_DATA_PATH + '/' + fileName)
      },
    })
  })
}

export const downloadFile = async (url: string, fileType?: string) => {
  try {
    const filePath = await getFileName(url, fileType)
    const res = await Taro.downloadFile({ url, filePath })
    return res.filePath
  } catch (error) {
    Taro.showToast({ title: '资源下载失败', icon: 'none', duration: 1800 })
    await new Promise((resolve) => setTimeout(resolve, 1800))
    Taro.navigateBack()
    throw Error(error)
  }
}

/**
 * 压缩图片到指定大小 (基于 wx.compressImage)
 *
 * @param src 原图路径
 * @param maxSizeKB 目标大小 (KB)
 * @param minQuality 最低压缩质量 (0 - 100)
 * @param step 每次递减的质量步长
 * @returns 压缩后 { tempFilePath, size }
 */
export function compressToTargetSize(src: string, maxSizeKB: number): Promise<{ tempFilePath: string }> {
  return new Promise((resolve, reject) => {
    Taro.getFileInfo({
      filePath: src,
      success(info) {
        const originSizeKB = info.size / 1024

        // 如果本身就小于目标大小，直接返回
        if (originSizeKB <= maxSizeKB) {
          resolve({ tempFilePath: src })
          return
        }

        // 计算压缩比例
        let ratio = maxSizeKB / originSizeKB
        let quality = Math.floor(ratio * 100)

        // 限制范围 [10, 100]
        if (quality < 10) quality = 10
        if (quality > 100) quality = 100
        console.error('quality', quality)
        // 调用 compressImage
        Taro.compressImage({
          src,
          quality,
          success(res) {
            resolve({
              tempFilePath: res.tempFilePath,
            })
          },
          fail: reject,
        })
      },
      fail: reject,
    })
  })
}
