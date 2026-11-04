import Taro from '@tarojs/taro'
import plateform from '@kye-netc/plateform'
import { isQw, isWxAppEnv, isWxAppIosEnv, isWxPcAppletEnv } from '@/public/utils'
import { AppPlugin } from '@/public/appPlugins'

interface SelectType {
  /** 从所有文件选择 */
  all
  /** 只能选择视频文件 */
  video
  /** 只能选择图片文件 */
  image
  /** 可以选择除了图片和视频之外的其它的文件 */
  file
}

export type UploadSourceType = 'album' | 'camera'

interface UseFileUploadOptions {
  acceptType?: SelectType // 文件类型
  multiple?: boolean // 是否多选
  maxCount?: number // 最大选择数量 0～100
  maxSize?: number // 单个文件最大大小（字节）
  uploadUrl: string // 上传接口URL
  formData?: Record<string, any> // 附加表单数据
  concurrentLimit?: number // 并发上传限制
  timeout?: number // 上传超时时间(毫秒)
  extension?: string[]
  type?: keyof SelectType
  sourceType?: UploadSourceType[]
}

export const showToast = (data: string | { message: string }) => {
  if (typeof data === 'string') return Taro.showToast({ title: data, icon: 'none' })

  return Taro.showToast({ title: data?.message, icon: 'none' })
}

export const showLoadingToast = (params: {
  title?: string
  mask?: boolean
  duration?: number
  forbidClick?: boolean
}) => {
  const { title = '加载中', mask = true, duration = 1000, forbidClick = false } = params
  console.log(forbidClick)

  Taro.showLoading({
    title,
    mask,
  })
  if (duration > 0) {
    setTimeout(() => {
      Taro.hideLoading()
    }, duration)
  }
}

export const systemPermissionToast = (error, text) => {
  if (error?.message) {
    showToast(error.message)
    return
  }
  const errList = ['system permission denied']
  const msg = error?.errMsg || ''
  if ((msg && errList.some((item) => msg.includes(item))) || msg.indexOf('auth') > -1) {
    showToast(text || '请开启定位权限')
  }
}

/**
 * 选择文件
 * @param options
 * @returns
 */
export const chooseFiles = async (options: Omit<UseFileUploadOptions, 'uploadUrl'> = {}) => {
  const { multiple = true, maxCount = 9, extension = ['pdf', 'jpg', 'png'], type } = options
  // 微信小程序环境
  if (process.env.TARO_ENV === 'weapp' || process.env.TARO_ENV === 'alipay') {
    let res
    try {
      if (type === 'image') {
        res = await plateform.chooseMedia({
          mediaType: ['image'],
          // 如果传入了 sourceType，就是用传入的
          sourceType: options.sourceType?.length ? options.sourceType : ['album', 'camera'],
          count: multiple ? Math.min(maxCount, 9) : 1,
        })
      } else {
        if (process.env.TARO_ENV === 'alipay') {
          res = await window.my.chooseFileFromDisk({
            count: multiple ? Math.min(maxCount, 100) : 1,
            type,
            extension,
          })
          return await filterAlipayFile(res)
        } else {
          if (isWxAppEnv) {
            res = await appChooseFile()
          } else {
            if (isQw) {
              showToast('暂不支持当前功能')
              return
            }
            if (!Taro.canIUse('chooseMessageFile') && isWxPcAppletEnv) {
              showToast('您的微信版本暂不支持该功能，请升级微信后重试')
              throw ''
            } else {
              // 如果是ios app
              // if (isWxAppIosEnv) {
              //   return await wxChooseFile({ allowsMultipleSelection: true })
              // }
              res = await Taro.chooseMessageFile({
                count: multiple ? Math.min(maxCount, 100) : 1,
                type,
                extension,
              })
            }
          }
        }
      }
      return await filterImage(res, options)
    } catch (error) {
      if (error?.errMsg?.indexOf(':fail') > -1 && error?.errMsg?.indexOf('cancel') === -1) {
        showToast('您的微信版本暂不支持该功能，请升级微信后重试')
      } else {
        systemPermissionToast(error, '请在设置中开启相册权限')
      }
    }
  }
}

// 获取文件类型（根据扩展名）
const getFileType = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const typeMap: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
  return typeMap[ext] || 'application/octet-stream'
}

/**
 * 获取文件后缀
 * @returns {*}
 */
export const getFileSuffix = (fileName: string = ''): any => {
  if (!fileName) return
  return fileName?.split('.')?.pop()?.toLowerCase()
}

/**
 * 处理img数据格式
 */
const filterImage = async (res: any, options) => {
  if (!res) return
  const files = res?.tempFiles
    ?.map((file) => {
      return {
        name: file.name || file.path || file.tempFilePath,
        path: file.path || file.tempFilePath,
        size: file.size,
        type: file.type || getFileType(file.name || ''),
      }
    })
    ?.filter((file) => validateFile(file, options))
  files?.forEach(async (x) => {
    await getFileSize(x)
  })
  return files
}

const validateFile = (file: any, options: Omit<UseFileUploadOptions, 'uploadUrl'>) => {
  const { extension = ['pdf', 'jpg', 'png'], maxSize = 5 * 1024 * 1024 } = options
  if (!file) throw new Error('未选择文件')
  // 验证文件类型

  if (!extension.join(',').includes(getFileSuffix(file.name))) {
    // throw new Error('请选择正确文件类型')
  }
  // 验证文件大小
  if (file.size > maxSize) {
    const sizeInMB = (maxSize / (1024 * 1024)).toFixed(1)
    // throw new Error(`文件大小不能超过${sizeInMB}MB`)
  }
  return true
}

// 多端app / 微信小程序选择文件api
const appChooseFile = () => {
  return AppPlugin.chooseFile()
  // return new Promise((resolve, reject) => {
  //   wx?.miniapp?.chooseFile({
  //     allowsMultipleSelection: true,
  //     success(res) {
  //       resolve(res)
  //       console.log('选择的文件列表', res)
  //     },
  //     fail(err) {
  //       console.log('选择文件失败', err)
  //       reject(err)
  //     },
  //   })
  // })
}

/**
 * 处理文件类型数据格式
 */
const filterAlipayFile = async (res) => {
  const file = {
    name: res.fileName,
    path: res.apFilePath,
  }
  await getFileSize(file)
  const files = [file]
  return files
}

/**
 * 使用taro获取 文件size
 */
const getFileSize = async (file) => {
  console.log('getFileSize11')
  try {
    await Taro.getFileInfo({
      filePath: file.path,
      success: function (res) {
        file.size = res.size
        console.log('getFileSize22')
      },
    })
    // file.size = res.size
  } catch (e) {
    console.log(e)
  }
  console.log('getFileSize33')
}
