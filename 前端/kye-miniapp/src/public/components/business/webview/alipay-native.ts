import Taro from '@tarojs/taro'
import { AliApiIn } from './index.type'
import plateform from '@kye-netc/plateform'

const getImgByteSize = (base64: string): number => {
  if (!base64) return 0
  const strLength = base64.indexOf('=') > 0 ? base64.indexOf('=') : base64.length
  return Math.floor(strLength - (strLength / 8) * 2)
}

const handleFilePathToBase64 = (filePath: string) => {
  return new Promise((resolve, reject) => {
    const fs = Taro.getFileSystemManager()
    fs.readFile({
      filePath: filePath,
      success: ({ data }: any) => {
        const base64 = Taro.arrayBufferToBase64(data)
        var localData = base64
        if (localData.indexOf('data:image') != 0) {
          localData = 'data:image/jpeg;base64,' + localData
        }
        let suffix = '.png'
        if (localData.includes('data:image/jpeg')) suffix = '.jpeg'
        else if (localData.includes('data:image/jpg')) suffix = '.jpg'

        localData = localData.replace(/\r|\n/g, '').replace('data:image/jgp', 'data:image/jpeg')

        resolve({
          fileName: `img-${Date.now()}${suffix}`,
          fileSize: (getImgByteSize(localData) / 1024).toFixed(2),
          base64: localData,
        })
      },
      fail: (error: any) => {
        reject(error)
      },
    })
  })
}

export const handleAliApiOnWebviewNewMsg = async (parmas: AliApiIn) => {
  return new Promise(async (resolve) => {
    const method = parmas.method
    switch (method) {
      case 'chooseImage': {
        const res = await plateform.chooseMedia({
          count: parmas.data?.count || 1,
          sourceType: parmas.data?.sourceType || ['album', 'camera'],
          ...(parmas.data || {}),
        })
        const fileList = res.tempFiles
        await new Promise((r) => setTimeout(r, 200))
        const base64 = await Promise.all(fileList.map((item) => handleFilePathToBase64(item.tempFilePath)))
        resolve({ imgList: base64 })
        break
      }

      case 'getLocation':
        Taro.getLocation({
          ...parmas.data,
          success: async function (res) {
            resolve(res)
          },
          fail: (res) => {
            resolve(res)
          },
        })
        break
      case 'scanCode': {
        try {
          const res = await plateform.scanCode()
          if (res.result) {
            let result = res.result
            if (result.includes(',')) {
              result = result.split(',')[1]
            }
            resolve({
              scanResult: result,
            })
          }
        } catch (error) {
          resolve(error)
        }
        break
      }
      case 'saveImageToPhotosAlbum': {
        await plateform.saveImageToPhotosAlbum(parmas.data?.url)
      }
    }
  })
}
