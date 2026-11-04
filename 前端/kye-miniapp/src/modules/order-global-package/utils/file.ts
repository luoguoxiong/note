import { cloneDeep } from 'lodash-es'

/** 生成 UUID v4 */
const uuid = (): string => {
  function b(a?: number) {
    return a
      ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
      : (([1e7] as any) + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
  }
  return b()
}

export interface CustomerFile {
  id?: string
  suffix?: string
  fileName?: string
  size: number
  fileType?: string
  data?: string
  base64?: string
  type?: string
}

interface AfterRead {
  fileList: any
  type?: string
  maxSize?: number
  acceptList?: string[]
}

/**
 * @description 图片url转换为base64
 * @param imageUrl
 */
export const convertImageToBase64 = (imageUrl: string) => {
  return new Promise((resolve, reject) => {
    try {
      fetch(imageUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const reader = new FileReader()

          reader.readAsDataURL(blob)

          // 当读取完成时触发事件
          reader.onloadend = function () {
            const base64data = reader.result // 获取Base64编码的数据
            resolve(base64data)
          }
        })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 转换为数组
 * @param { any | any[] } item 文件对象
 * @returns { any[] } 返回一个数组
 */
export const toArray = (item: any) => {
  return Array.isArray(item) ? item : [item]
}

export const toUnitSize = (fileSize = 0, accuracy = 2) => {
  if (fileSize <= 100) {
    return `${(fileSize / 1).toFixed(accuracy)}K`
  }
  return `${(fileSize / 1024).toFixed(accuracy)}M`
}

/**
 * 检测文件大小
 * @param { file | file[] } files 文件对象
 * @param { number } maxSize 大小
 * @returns { Boolean } 如果文件大小超出 maxSize 则返回 true 否则为 false
 */
export const isOversize = (files: any, maxSize: number) => {
  return toArray(files).some((file) => {
    if (file.file.size) {
      return file.file.size / 1024 > maxSize
    }
    return false
  })
}
/**
 * 获取文件后缀
 * @returns {*}
 */
export const getFileSuffix = (fileName = '') => {
  return fileName?.split('.')?.pop()?.toLowerCase() as string
}

// 选择文件之后
export const fileAfterRead = async (params: AfterRead) => {
  const list: CustomerFile[] = []
  try {
    const { fileList, type, maxSize = 1024 * 5, acceptList = ['png', 'jpg', 'bmp', 'jpeg'] } = params
    const files = toArray(fileList)
    console.log('选择文件之后', cloneDeep(params))

    for (let i = 0; i < files.length; i++) {
      const v = files[i]
      const suffix = getFileSuffix(v.name)
      const file = {
        id: uuid(),
        suffix,
        creationDate: Date.now(),
        originalName: v.name,
        size: v.size,
        type: type || (v.type?.includes('image') ? 'img' : 'file'),
        // base64
        path: v.path,
      }
      list.push(file)
    }
  } catch (err) {
    console.log(err)
  }
  return list
}
