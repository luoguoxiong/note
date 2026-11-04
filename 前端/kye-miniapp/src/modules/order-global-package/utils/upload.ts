import Taro from '@tarojs/taro'
import { ActionSheet } from '@kye-netc/kye-miniui'
import plateform from '@kye-netc/plateform'
import { isQw, isWxAppEnv, isWxPcAppletEnv, isWechatNotAppEnv, isH5FSEnv, isWechatEnv } from '@/public/utils'
import { createVNode, render } from 'vue'
import { Any } from '@public/utils/types'
import { getDialogRootClass } from '../validate/pageConfig'
import { umpOtherReport } from '../report/index'

/**
 * 系统权限错误 Toast 提示
 * @returns false 遇到未知错误可继续执行，true 为已知错误已处理
 */
const systemPermissionToast = (error: any, text = '') => {
  let flag = false
  if (error?.message) {
    Taro.showToast({ title: error.message, icon: 'none' })
    return true
  }
  const errList = ['system permission denied', 'Photo Authorization']
  const msg = error?.errMsg || ''
  if ((msg && errList.some((item) => msg.includes(item))) || msg.indexOf('auth') > -1) {
    Taro.showToast({ title: text || '请开启定位权限', icon: 'none' })
    return true
  }
  return flag
}

export const commonFileTypes = ['doc', 'docx', 'xls', 'xlsx', 'pdf']

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

// Hook 参数配置
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
}

/* 获取wx api文件上传错误 */
const getPlatformUploadError = () => {
  if (isWechatEnv) {
    return '您的微信版本暂不支持该功能，请升级微信后重试'
  } else {
    return '您的版本暂不支持该功能，请确认权限开启或升级版本后重试'
  }
}
/**
 * 获取文件后缀
 * @returns {*}
 */
export const getFileSuffix = (fileName: string = ''): any => {
  if (!fileName) return
  return fileName?.split('.')?.pop()?.toLowerCase()
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

// 多端app / 微信小程序选择文件api
const appChooseFile = () => {
  return new Promise((resolve, reject) => {
    wx?.miniapp?.chooseFile({
      allowsMultipleSelection: true,
      success(res) {
        resolve(res)
        console.log('选择的文件列表', res)
      },
      fail(err) {
        console.log('选择文件失败', err)
        reject(err)
      },
    })
  })
}

//自定义的底部选择图片面板,支持相册、拍照、聊天框选择
export const chooseImageModal = (count: number) => {
  const parentClassName = getDialogRootClass()
  const page = document.getElementsByClassName(parentClassName)?.[0] || document.body
  if (!parentClassName) {
    return plateform.chooseMedia({
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      count: count,
    })
  }
  const choseImageByType = async (type: string) => {
    if (type === 'chooseMessageFile') {
      return Taro.chooseMessageFile({
        type: 'image',
        count: count,
      })
    }
    return plateform.chooseMedia({
      mediaType: ['image'],
      sourceType: [type as any],
      count: count,
    })
  }
  const filterType = []
  let menuList = [
    {
      name: '拍摄',
      type: 'camera',
    },
    {
      name: '从手机相册选择',
      type: 'album',
    },
    {
      name: '从微信聊天选择',
      type: 'chooseMessageFile',
    },
  ]
  menuList = menuList.filter((item) => !filterType?.includes(item?.type))
  return new Promise((resolve, reject) => {
    const closePopup = () => {
      render(null, page)
    }
    const vnode = createVNode(ActionSheet, {
      show: true,
      menuItems: menuList,
      safeAreaInsetBottom: true,
      onChoose: (item: any) => {
        resolve(choseImageByType(item.type))
        closePopup()
      },
      onCancel: () => {
        reject('cancel')
        closePopup()
      },
      onClose: () => {
        reject('close')
        closePopup()
      },
    })
    render(vnode, page)
  })
}

const inputUpload = (options: UseFileUploadOptions, image?: boolean) => {
  return new Promise((resolve, reject) => {
    const { multiple = true } = options

    // 创建input元素
    const input = document.createElement('input')
    input.type = 'file'
    input.style.display = 'none'

    // 设置属性
    input.multiple = multiple
    // 处理accept参数
    if (image) {
      input.accept = 'image/*'
    } else {
      input.accept = '.xls,.xlsx,.doc,.docx,.pdf'
    }

    // 添加到DOM
    document.body.appendChild(input)
    // change事件处理器
    const changeHandler = (event) => {
      const files = Array.from(event.target.files)
      if (files && files.length > 0) {
        // 处理每个文件
        const processFile = (file) => {
          return new Promise((fileResolve, fileReject) => {
            const reader = new FileReader()
            const fileInfo = {
              file,
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified,
              lastModifiedDate: file.lastModifiedDate,
              base64: null,
              dataURL: null,
              arrayBuffer: null,
              text: null,
            }

            reader.onload = (e: Any) => {
              const result = e.target.result
              if (result.startsWith('data:')) {
                fileInfo.base64 = result
              }

              fileResolve(fileInfo)
            }

            reader.onerror = (error) => {
              fileReject(new Error(`Failed to read file ${file.name}: ${error}`))
            }

            // 根据选项选择读取方式
            reader.readAsDataURL(file)
          })
        }

        Promise.all(files?.map(processFile))
          .then((results) => {
            resolve(results)
            cleanup()
          })
          .catch((error) => {
            reject(error)
            cleanup()
          })
      } else {
        reject(new Error('No file selected'))
      }
      cleanup()
    }

    const cancelHandler = () => {
      // reject(new Error('File selection cancelled'))
      cleanup()
    }
    const cleanup = () => {
      input.removeEventListener('change', changeHandler)
      input.removeEventListener('cancel', cancelHandler)
      setTimeout(() => {
        if (input.parentNode) {
          document.body.removeChild(input)
        }
      }, 1000)
    }
    // 添加事件监听
    input.addEventListener('change', changeHandler)
    input.addEventListener('cancel', cancelHandler)
    input.click()
  })
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
  } catch (e) {}
  console.log('getFileSize33')
}
/**
 * 处理img数据格式
 */
const filterImage = async (res: any) => {
  if (!res) return
  const files = res?.tempFiles?.map((file) => {
    const res = {
      name: file.name || file.path || file.tempFilePath,
      path: file.path || file.tempFilePath,
      size: file.size,
      type: file.type || getFileType(file.name || ''),
    }
    if (isH5FSEnv) {
      res.base64 = file.base64?.split(',')[1]
    }
    return res
  })
  files?.forEach(async (x) => {
    if (!x.size && !isH5FSEnv) {
      await getFileSize(x)
    }
  })
  return files
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
 * 选择文件
 * @param options
 * @returns
 */
export const chooseFiles = async (options: Omit<UseFileUploadOptions, 'uploadUrl'> = {}, image?: boolean) => {
  const { multiple = true, maxCount = 9, extension = ['pdf', 'jpg', 'png'], type } = options
  // 微信小程序环境
  if (process.env.TARO_ENV === 'weapp' || process.env.TARO_ENV === 'alipay' || process.env.TARO_ENV === 'h5') {
    let res: Any
    try {
      if (type === 'image') {
        const count = multiple ? Math.min(maxCount, 9) : 1
        if (image) {
          //智能识别，处理bug616724
          res = await Taro.chooseImage({
            // 飞书的情况下，如果数组里面有两个，会拉起一个选择拍摄和从手机中选择的弹窗
            sourceType: isH5FSEnv ? ['album'] : ['album', 'camera'],
            count: count,
          })
        } else {
          if (isH5FSEnv) {
            res = {}
            res.tempFiles = await inputUpload(options, type === 'image')
            return await filterImage(res)
          } else {
            //微信小程序稳定后，可以统一用自定义的
            const showCustomChose = isWechatNotAppEnv && !isWxPcAppletEnv && !isQw
            res = showCustomChose
              ? await chooseImageModal(count)
              : await plateform.chooseMedia({
                  mediaType: ['image'],
                  sourceType: ['album', 'camera'],
                  count: count,
                })
          }
        }
      } else {
        if (process.env.TARO_ENV === 'alipay') {
          // res = await window.my.chooseFileFromDisk({
          //   count: multiple ? Math.min(maxCount, 100) : 1,
          //   type,
          //   extension,
          // })
          // return await filterAlipayFile(res)
        } else {
          if (isWxAppEnv) {
            res = await appChooseFile()
          } else {
            if (isQw) {
              Taro.showToast({ title: '暂不支持当前功能', icon: 'none' })
              return
            }
            if (isH5FSEnv) {
              res = {}
              res.tempFiles = await inputUpload(options)
              return await filterImage(res)
            }
            if (!Taro.canIUse('chooseMessageFile') && isWxPcAppletEnv) {
              Taro.showToast({ title: '您的微信版本暂不支持该功能，请升级微信后重试', icon: 'none' })
              throw ''
            } else {
              res = await Taro.chooseMessageFile({
                count: multiple ? Math.min(maxCount, 100) : 1,
                type,
                extension,
              })
            }
          }
        }
      }
      return await filterImage(res)
    } catch (error) {
      console.log('chooseFiles error:', error)
      if (error?.errMsg?.toLowerCase()?.indexOf('permission') > -1) {
        systemPermissionToast(error, '请在设置中开启相册权限')
      } else if (error?.errMsg?.indexOf(':fail') > -1 && error?.errMsg?.indexOf('cancel') === -1) {
        Taro.showToast({ title: '文件名称或格式不符，请检查后重新上传', icon: 'none' })
        umpOtherReport(
          'OTHER',
          {
            eventCode: 'upload_file_error',
          },
          {
            fail: error?.errMsg,
          },
        )
      } else {
        systemPermissionToast(error, '请在设置中开启相册权限')
      }
    }
  }
}

/**
 * 获取文件的 base64
 */
export const getFileBase64 = async (tempFilePath: string) => {
  const fs = Taro.getFileSystemManager()
  const base64 = await new Promise((resolve, reject) => {
    fs.readFile({
      filePath: tempFilePath,
      encoding: 'base64',
      success: (res) => resolve(res.data),
      fail: reject,
    })
  })
  return base64
}
