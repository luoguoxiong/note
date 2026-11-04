import Taro from '@tarojs/taro'
import { AliApiIn } from './index.type'

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
        localData = localData.replace(/\r|\n/g, '').replace('data:image/jgp', 'data:image/jpeg')
        resolve(localData)
      },
      fail: (error: any) => {
        console.log('handleFilePathToBase64', error)
        reject(error)
      },
    })
  })
}

export const handleAliApiOnWebviewMsg = async (parmas: AliApiIn) => {
  return new Promise((resolve) => {
    const method = parmas.method
    switch (method) {
      case 'chooseImage':
        Taro.chooseImage({
          count: parmas.data?.count || 1,
          sourceType: parmas.data?.sourceType || ['album', 'camera'],
          ...(parmas.data || {}),
          success: async function (res) {
            // ios 偶现拿不到文件路径，延时处理
            await new Promise((r) => setTimeout(r, 200))
            const base64 = await handleFilePathToBase64(`${res.tempFilePaths[0]}`)
            resolve(base64)
          },
        })
    }
  })
}

export const handleAliApiOnWebviewNewMsg = async (parmas: AliApiIn) => {
  return new Promise((resolve) => {
    const method = parmas.method
    switch (method) {
      case 'chooseImage':
        Taro.chooseImage({
          count: parmas.data?.count || 1,
          sourceType: parmas.data?.sourceType || ['album', 'camera'],
          ...(parmas.data || {}),
          success: async function (res) {
            const base64 = Promise.all(res.tempFilePaths.map((id) => this.handleFilePathToBase64(id)))
            resolve({ imageList: base64 })
          },
          fail: (res) => {
            resolve(res)
          },
        })
    }
  })
}
