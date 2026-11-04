import Taro from '@tarojs/taro'

export type UploaderResultType = 'dataUrl' | 'text' | 'file'
/* H5上传文件类型处理 */
export function readFileContent(file: File, resultType: UploaderResultType): Promise<string> {
  return new Promise<string | void>((resolve) => {
    if (resultType === 'file') {
      resolve()
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      resolve((event.target as FileReader).result as string)
    }

    if (resultType === 'dataUrl') {
      reader.readAsDataURL(file)
    } else if (resultType === 'text') {
      reader.readAsText(file)
    }
  })
}

/* 小程序上传文件类型处理 */
export function getMiniFileContent(tempFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 使用 FileSystemManager 转 Base64
    const fs = Taro.getFileSystemManager()
    fs.readFile({
      filePath: tempFilePath,
      encoding: 'base64', // 指定返回的内容为 Base64
      success: (data) => {
        const base64 = 'data:image/png;base64,' + data.data // 拼接成完整的 Base64 数据
        console.log('Base64:', base64)
        resolve(base64)
      },
      fail: (err) => {
        reject(err)
        console.error('读取文件失败:', err)
      },
    })
  })
}
