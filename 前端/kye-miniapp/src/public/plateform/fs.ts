/**
 * @Desc: index.fs
 * @Date: 2025/11/12
 */
import * as Type from './type'
import { promisify } from './utils'

const formatLocalData = (localData: string): string => {
  if (!localData.startsWith('data:image')) {
    localData = 'data:image/jpeg;base64,' + localData
  }
  return localData.replace(/\r|\n/g, '').replace('data:image/jgp', 'data:image/jpeg')
}

const getImageSuffix = (localData: string): string => {
  if (localData.includes('data:image/jpeg')) return '.jpeg'
  if (localData.includes('data:image/jpg')) return '.jpg'
  return '.png'
}

const getLocalImgData = async (file: Type.FsFile): Promise<Type.ChooseImageFile> => {
  const fileSystemManager = window.tt.getFileSystemManager()
  const result = await promisify<{ data: string; errMsg: string }, Type.FsFileReadParams>(fileSystemManager.readFile)({
    filePath: file?.tempFilePath || file?.path,
    encoding: 'base64',
  })
  const base64 = formatLocalData(result?.data)
  const suffix = getImageSuffix(base64)
  return {
    name: `img-${Date.now()}${suffix}`,
    size: file?.size,
    base64: base64,
    tempFilePath: file?.tempFilePath,
    type: file?.type,
  }
}

export const getBase64ByTempFile = (tempFiles: Type.FsFile[]): Promise<Type.ChooseImageFile[]> => {
  return Promise.all(tempFiles.map((file) => getLocalImgData(file)))
}
