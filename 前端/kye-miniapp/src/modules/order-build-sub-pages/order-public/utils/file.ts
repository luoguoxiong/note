import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { getFileBase64 } from '@order-public-sub-public/utils/upload'
import { $native as native } from '.'
import { uuid } from '@order-public-sub-public/utils/index'
// import Compressor from 'compressorjs'
import { cloneDeep } from 'lodash-es'

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
 * @description 该函数将图片链接转换为base64，再调用原生方法进行下载
 * @param src
 */
export const downloadImage = async (src: string) => {
  try {
    const imageData = (await convertImageToBase64(src)) as string
    native.downloadImage({
      imageData: imageData.replace(/^data:.+;base64,/, ''),
    })
    showToast('保存成功')
  } catch (error) {
    console.error(error)
    showToast('保存失败')
  }
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
      // if (!acceptList.includes(suffix)) {
      //   showToast(`不支持该图片格式，请选择正确的图片格式`)
      //   return []
      // }

      // 如果文件大于5M，进行压缩
      // if (isOversize(v, maxSize)) {
      //   const { file, content } = await compressorFileSize(v)
      //   file && (v.file = file)
      //   content && (v.content = content)
      // }

      // 如果压缩后还是大于5M，提示
      // if (isOversize(v, maxSize)) {
      //   showToast(`图片大小不得超过${toUnitSize(maxSize, 0)}`)
      //   return []
      // }
      // 获取文件base64
      // const base64 = await getFileBase64(v.path)
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

/**
 * 图片压缩
 * @param file File
 * @returns
 */
export const compressorFileSize = (file: File | Blob): Promise<{ file?: File | Blob; content?: string }> => {
  return new Promise((resolve) => {
    try {
      new Compressor(file, {
        quality: 0.8, // 图片质量，范围是 0-1，默认是 0.8
        maxWidth: 750, // 最大宽度，单位是像素
        maxHeight: 1080, // 最大高度，单位是像素
        success(result: any) {
          const reader = new FileReader()
          reader.readAsDataURL(result) // 将压缩后的文件读取为 Data URL
          reader.onloadend = () => {
            const base64String = reader.result // 此处得到 Base64 编码的字符串
            console.log('选择文件之后压缩后', result)
            resolve({ file: result, content: base64String as string })
            // 在这里你可以将 base64String 发送到服务器或进行其他操作
          }
        },
        error(err: any) {
          resolve({})
          console.error(err.message)
        },
      })
    } catch (error) {
      resolve({})
      console.error(error)
    }
  })
}
