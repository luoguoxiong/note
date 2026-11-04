import Taro from '@tarojs/taro'

export const getUuid = (): string => {
  const s: string[] = []
  const hexDigits = '0123456789abcdef'
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((parseInt(s[19], 16) & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = '-'
  return s.join('')
}

interface UploadResponse {
  code: number
  data?: any
  [key: string]: any
}

interface ProgressEvent {
  progress: number
  totalBytesSent: number
  totalBytesExpectedToSend: number
}

export const fileUpload = (file: string, onProgress?: (progress: number) => void): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadTask = Taro.uploadFile({
      url: 'https://api.ky-express.com/router/upload',
      filePath: file,
      name: 'file',
      formData: {
        bizCode: 'web-kyreference-files',
        bizId: getUuid(),
        type: 'img',
      },
      success: (res) => {
        try {
          const result: UploadResponse = JSON.parse(res.data || '{}')
          if (result && +result.code === 0) {
            resolve(result)
          } else {
            reject(result || res)
          }
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        reject(error)
      },
    })

    if (onProgress) {
      uploadTask.progress((res: ProgressEvent) => {
        onProgress(res.progress)
      })
    }
  })
}

export default {}
