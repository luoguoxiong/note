// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import { STATUS } from '@order-public-sub-public/constants'
import dayjs from 'dayjs'
import { isAppiOS, isAppAndroid, isIpad } from '@order-global-package-order-sub/utils/device'
import { showLoadingToast, showToast } from '@order-global-package-order-sub/hooks/useShowToast'
import { $native } from '@order-public-sub-public/utils'
import { isH5FSEnv } from '@/public/utils'
/* eslint-disable */
/**
 * 转换为数组
 * @param { any | any[] } item 文件对象
 * @returns { any[] } 返回一个数组
 */
export const toArray = (item) => {
  return Array.isArray(item) ? item : [item]
}

/**
 * 读取文件
 * @param { file } file 文件对象
 * @param { 'dataUrl' | 'text' | 'file' } resultType 文件读取结果的类型
 * @returns { Promise } 返回一个 Promise
 */
export const readFile = (file, resultType) => {
  return new Promise((resolve) => {
    if (resultType === 'file') {
      resolve(null)
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      resolve(event.target.result)
    }
    if (resultType === 'dataUrl') {
      reader.readAsDataURL(file)
    } else if (resultType === 'text') {
      reader.readAsText(file)
    }
  })
}

/**
 * 读取文件
 * @param { file } file 文件对象
 * @param { string } dataurl 文件的 base64
 * @param { string } filename 文件名称
 * @returns { file } 返回一个 File 对象
 */
export function dataURLtoFile(dataurl, filename) {
  // 获取到base64编码
  const arr = dataurl.split(',')
  // 将base64编码转为字符串
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n) // 创建初始化为0的，包含length个元素的无符号整型数组
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, {
    type: 'image/jpeg',
  })
}

/**
 * 检测文件大小
 * @param { file | file[] } files 文件对象
 * @param { number } maxSize 大小
 * @returns { Boolean } 如果文件大小超出 maxSize 则返回 true 否则为 false
 */
export const isOversize = (files, maxSize) => {
  return toArray(files).some((file) => {
    if (file) {
      return file.fileSize > maxSize
    }
    return false
  })
}

/**
 * 生成随机字符串
 * @returns {*}
 */
export const uuid = () => {
  function b(a) {
    return a
      ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
      : ([1e7] + -[1e3] + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
  }
  return b()
}

/**
 * 获取文件后缀
 * @returns {*}
 */
export const getFileSuffix = (fileName = '') => {
  return fileName?.split('.')?.pop()?.toLowerCase()
}

/**
 * 转换单位
 * @returns {*}
 */
export const toUnitSize = (fileSize = 0) => {
  if (!fileSize) {
    return ''
  }
  if (fileSize <= 100) {
    return `${(fileSize / 1).toFixed(2)}K`
  }
  return `${(fileSize / 1024).toFixed(2)}M`
}

//文件对象转换成卡片需要的结构
export const makeFileItem = (fileItem: fileType): fileType => {
  const { originalName = '', creationDate, size, url, id, path, file } = fileItem
  const status = !url || url?.indexOf('base64') !== -1 ? STATUS.WAIT : undefined
  const sizeRatio = status ? 1 : 1024
  const fileName = originalName
  const res = {
    fileName: originalName,
    updateTime: formatDate(creationDate),
    size,
    path,
    name: fileName,
    url,
    type: getFileType(fileItem),
    id,
    status,
  }
  if (isH5FSEnv) {
    res.file = file
  }
  return res
}
//获取文件类型
export const getFileType = (file: fileType) => {
  const suffix = getFileSuffix(file.originalName)
  const img = ['jpg', 'png', 'jpeg'].includes(<string>suffix?.toLowerCase())
  const type = img ? 'img' : suffix
  return type
}
//转换时间格式
export const formatDate = (time, format?) => {
  // if (typeof time !== 'number') {
  //   time = Number(time)
  // }
  // console.log(time, dayjs(time))
  return dayjs(time).format(format || 'YYYY-MM-DD HH:mm')
}

//预览分享
export const previewOtherFile = (url: string) => {
  if (!url) {
    return showToast('该文件上传后才可预览')
  }
  if (isAppAndroid || isAppiOS || isIpad) {
    showLoadingToast({
      duration: 1000,
      message: '加载中',
      forbidClick: true,
      onClose: async () => {
        try {
          const path = await $native.downloadFile({ url })
          setTimeout(() => {
            $native.shareFile({ path })
          }, 300)
        } catch (err) {
          console.log('err', err)
          showToast('请更新为最新版本APP预览')
        }
      },
    })
  } else {
    showToast('请前往“跨越速运app”查看')
  }
}

/* eslint-disable */
