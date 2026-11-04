import Taro from '@tarojs/taro'

interface CanvasToTempFilePathOptions {
  canvasId: string
  x?: number
  y?: number
  width: number
  height: number
  destWidth?: number
  destHeight?: number
  fileType?: 'jpg' | 'png' | 'jpeg'
  quality?: number
}

/**
 * 读取文件为 base64（用于导出）
 */
const getFileBase64 = async (tempFilePath: string) => {
  return new Promise<string>((resolve, reject) => {
    try {
      const fs = Taro.getFileSystemManager()
      fs.readFile({
        filePath: tempFilePath,
        encoding: 'base64',
        success: (res: any) => resolve(res.data),
        fail: (err: any) => reject(err),
      })
    } catch (err) {
      reject(err)
    }
  })
}

export function webCanvasToTempFilePathH5(options: CanvasToTempFilePathOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      canvasId,
      x = 0,
      y = 0,
      width,
      height,
      destWidth = width,
      destHeight = height,
      fileType = 'jpg',
      quality = 1,
    } = options

    Taro.createSelectorQuery()
      .select(`canvas[canvas-id="${canvasId}"]`)
      .node()
      .exec((res) => {
        const canvas = res?.[0]?.node as HTMLCanvasElement
        if (!canvas) {
          reject(new Error(`canvas with canvas-id="${canvasId}" not found`))
          return
        }

        const exportCanvas = document.createElement('canvas')
        exportCanvas.width = destWidth
        exportCanvas.height = destHeight
        const exportCtx = exportCanvas.getContext('2d')!

        exportCtx.drawImage(canvas, x, y, width, height, 0, 0, destWidth, destHeight)

        const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg'

        const base64 = exportCanvas.toDataURL(mimeType, quality)

        resolve(base64)
      })
  })
}

export function nativeCanvasToTempFilePathH5(options: CanvasToTempFilePathOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      canvasId,
      x = 0,
      y = 0,
      width,
      height,
      destWidth,
      destHeight = height,
      fileType = 'jpg',
      quality = 1,
    } = options
    Taro.canvasToTempFilePath({
      canvasId,
      x,
      y,
      width,
      height,
      destWidth,
      destHeight,
      fileType,
      quality,
      success: async (res: { tempFilePath: string }) => {
        try {
          let base64 = await getFileBase64(res.tempFilePath)
          if (!base64.startsWith('data:image')) {
            base64 = 'data:image/jpeg;base64,' + base64
          }
          base64 = base64.replace(/\r|\n/g, '').replace('data:image/jgp', 'data:image/jpeg')
          resolve(base64)
        } catch (err) {
          reject(err)
        }
      },
      fail: (err: any) => {
        console.error('canvasToTempFilePath fail:', err)
        reject(err)
      },
    })
  })
}
