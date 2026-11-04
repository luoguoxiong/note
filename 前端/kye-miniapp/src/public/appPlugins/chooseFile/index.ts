import { isWxAppEnv, isWxAppIosEnv } from '@/public/utils'
import { isSupportNativeMethod } from '@/public/constants/featureVersionConfig'
import { getNativePlugin } from '@public/appPlugins/utils/pluginLoader'

const CHOOSE_FILE_PLUGIN_ID = 'wxbe1a61223a0aa4d7'

interface FileItem {
  path: string
  [key: string]: any
}

interface ChooseFileResult {
  tempFiles: FileItem[]
}

const EMPTY_RESULT: ChooseFileResult = {
  tempFiles: [],
}

/**
 * iOS native file 转微信临时文件
 */
function copyNativeFile(file: FileItem): Promise<FileItem> {
  return new Promise((resolve, reject) => {
    console.error('copyNativeFile', file.path)
    wx?.miniapp?.copyNativeFileToWx({
      nativeFilePath: file.path,

      success(res: any) {
        resolve({
          ...file,
          path: res.tempFilePath,
        })
      },

      fail(err: any) {
        console.error('copyNativeFileToWx-error', err)
        reject(err)
      },
    })
  })
}

/**
 * Android 文件选择
 */
function chooseAndroidFile(): Promise<ChooseFileResult> {
  return new Promise((resolve, reject) => {
    wx?.miniapp?.chooseFile({
      allowsMultipleSelection: true,

      success(res: ChooseFileResult) {
        console.log('chooseFile-android', res)
        resolve(res)
      },

      fail(err: any) {
        reject(err)
      },
    })
  })
}

/**
 * iOS 文件选择
 */
async function chooseIosFile(): Promise<ChooseFileResult> {
  const plugin = await getNativePlugin(CHOOSE_FILE_PLUGIN_ID, 'chooseFile')
  if (!plugin?.chooseFileAsyncWithCallback) {
    throw new Error('chooseFileAsyncWithCallback not found')
  }

  return new Promise((resolve, reject) => {
    plugin.chooseFileAsyncWithCallback(
      {
        allowsMultipleSelection: true,
      },
      async (res: any) => {
        const data = res?.data
        console.error('chooseFileAsyncWithCallback', data)
        if (res?.code !== 0) {
          resolve(EMPTY_RESULT)
          return
        }

        const tempFiles: FileItem[] = data.tempFiles || []

        console.error('chooseFileAsyncWithCallback', tempFiles)

        try {
          const newFiles = await Promise.all(tempFiles.map(copyNativeFile))
          console.error('newFiles', newFiles)
          resolve({
            tempFiles: newFiles,
          })
        } catch (err) {
          console.error('chooseFileAsyncWithCallback', err)
          reject(err)
        }
      },
    )
  })
}

/**
 * 选择文件
 */
export function chooseFile(): Promise<ChooseFileResult> {
  if (!isWxAppEnv) {
    return Promise.resolve(EMPTY_RESULT)
  }

  // 只有当是 iOS 环境、支持该功能且是生产环境时才使用 chooseIosFile
  if (isWxAppIosEnv && isSupportNativeMethod('chooseFile')) {
    return chooseIosFile()
  }

  // 其他情况都使用 chooseAndroidFile
  return chooseAndroidFile()
}
