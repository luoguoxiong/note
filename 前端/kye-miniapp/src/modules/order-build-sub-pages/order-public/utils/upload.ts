import Taro from '@tarojs/taro'
import { RequestBaseUrl } from '@order-public-sub-public/utils/env'
import { cloneDeep } from 'lodash-es'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { showImagePreview, ActionSheet } from '@kye-netc/kye-miniui'
import { systemPermissionToast } from '@order-public-sub-public/hooks/address/useCommon'
import plateform from '@kye-netc/plateform'
import { isAmapApp } from './device'
import { isQw, isWxAppEnv, isWxAppIosEnv, isWxPcAppletEnv, isWechatNotAppEnv, isH5FSEnv } from '@/public/utils'
import { createVNode, onMounted, onUnmounted, ref, render } from 'vue'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { getDialogRootClass } from '@order-public-sub-public/validate/pageConfig'
import axios from 'axios'
import { Any } from '@public/utils/types'
import { AppPlugin } from '@/public/appPlugins'

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
  sourceType?: UploadSourceType[]
  selectCallBack?: (res: any) => any
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

//自定义的底部选择图片面板,支持相册、拍照、聊天框选择
export const chooseImageModal = (count: number, selectCallBack: any) => {
  const parentClassName = getDialogRootClass()
  const page = document.getElementsByClassName(parentClassName)?.[0] || document.body
  console.log('pagepagepage', page, parentClassName)
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
        typeof selectCallBack === 'function' && selectCallBack(item.type)
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
    const { extension, multiple = true } = options

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
            const showCustomChose = !isWxPcAppletEnv && isWechatNotAppEnv && !isQw
            res = showCustomChose
              ? await chooseImageModal(count, options.selectCallBack)
              : await plateform.chooseMedia({
                  mediaType: ['image'],
                  // 如果传入了 sourceType，就是用传入的
                  sourceType: options.sourceType?.length ? options.sourceType : ['album', 'camera'],
                  count: count,
                })
          }
        }
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
            if (isH5FSEnv) {
              res = {}
              res.tempFiles = await inputUpload(options)
              return await filterImage(res)
            }
            if (!Taro.canIUse('chooseMessageFile') && isWxPcAppletEnv) {
              showToast('您的微信版本暂不支持该功能，请升级微信后重试')
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
      console.log(error, 'dasfsaf')
      if (error?.errMsg?.toLowerCase()?.indexOf('permission') > -1) {
        systemPermissionToast(error, '请在设置中开启相册权限')
      } else if (error?.errMsg?.indexOf(':fail') > -1 && error?.errMsg?.indexOf('cancel') === -1) {
        showToast('文件名称或格式不符，请检查后重新上传')
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

export const getFileBase64 = async (tempFilePath: string) => {
  // 2. 获取文件管理器
  const fs = Taro.getFileSystemManager()
  // 3. 读取文件并转为 base64
  const base64 = await new Promise((resolve, reject) => {
    fs.readFile({
      filePath: tempFilePath,
      encoding: 'base64', // 指定编码格式
      success: (res) => resolve(res.data),
      fail: reject,
    })
  })
  // 4. 添加 MIME 类型前缀 (可选)
  // 可以根据实际图片类型设置，如 'image/jpeg'
  // const fullBase64 = `data:image;base64,${base64}`;
  // return fullBase64
  return base64
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

export const uploadFile = async (options: UseFileUploadOptions, formData?: any) => {
  try {
    const file = await chooseFiles(options)
    const list = await onChangeFile(file, formData)
    // 执行上传
    return list
  } catch (error) {
    systemPermissionToast(error, '请在设置中开启相册权限')
    if (error.message) {
      Taro.showToast({
        title: error.message,
        icon: 'none',
        duration: 2000,
      })
    }
  }
}

export const onChangeFile = async (fileList, formData) => {
  // const { configData, getBizCode } = await getData()
  const list = [] as any
  const upload = () => {
    return new Promise((resolve) => {
      fileList.map(async (item) => {
        const uploadRes = await Taro.uploadFile({
          url: `${RequestBaseUrl}/router/upload`,
          filePath: item.path,
          name: 'file',
          fileName: item.name,
          header: {
            'Content-Type': 'multipart/form-data',
          },
          formData: {
            ...formData,
            originalName: item.name,
            name: item.name,
          },
        })
        const res = JSON.parse(uploadRes.data)
        if (res.code === 0) {
          const data = (res?.data || []).find((v: any) => v.lastOperate === 1) || {}
          item = { ...data }
          // item.status = UploadStatusEnum['SUCCESS']
          item.url = data?.url
          item.id = data?.id

          const suffix = getFileSuffix(data.name)
          const img = ['jpg', 'png', 'jpeg'].includes(suffix?.toLowerCase())
          const type = img ? 'img' : suffix
          item.type = type
          item.suffix = suffix

          list.push(item)
          if (list.length === fileList.length) {
            resolve('')
          }
        }
      })
    })
  }
  await upload()
  return cloneDeep(list)
}

export const onChangeSingleFile = async (file, formData) => {
  let uploadRes
  if (isH5FSEnv) {
    const params = {
      bizCode: formData.bizCode, //
      bizId: formData.bizId, //运单号
      type: file.type,
      file: file.file,
      preview: false, // 取货资料新增标识
    }
    uploadRes = await httpFile(params)
  } else {
    uploadRes = await Taro.uploadFile({
      url: `${RequestBaseUrl}/router/upload`,
      filePath: file.path,
      name: 'file',
      fileName: file.name,
      header: {
        'Content-Type': 'multipart/form-data',
      },
      formData: {
        ...formData,
        fileName: file.name,
        originalName: file.name,
        name: file.name,
      },
    })
  }
  const res = typeof uploadRes.data === 'string' ? JSON.parse(uploadRes.data) : uploadRes.data
  if (res.code === 0) {
    const data = (res?.data || []).find((v: any) => v.lastOperate === 1) || {}
    const fileRes = { ...data }
    fileRes.url = data?.url
    fileRes.id = data?.id

    const suffix = getFileSuffix(data.name)
    const img = ['jpg', 'png', 'jpeg', 'webp'].includes(suffix?.toLowerCase())
    const type = img ? 'img' : suffix
    fileRes.type = type
    fileRes.suffix = suffix
    return fileRes
  }
}

// 转为可读属性，例如  22k, 22kb, 2M
export const formatFileSize = (bytes, decimals = 2) => {
  if (!+bytes) return ''
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['k', 'kb', 'M', 'G', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))}${sizes[i]}`
}

/**
 * 转换为数组
 * @param { any | any[] } item 文件对象
 * @returns { any[] } 返回一个数组
 */
export const toArray = (item: any) => {
  return Array.isArray(item) ? item : [item]
}
/**
 * 检测文件大小
 * @param { file | file[] } files 文件对象
 * @param { number } maxSize 大小
 * @returns { Boolean } 如果文件大小超出 maxSize 则返回 true 否则为 false
 */
export const isOverFilesize = (files, maxSize) => {
  return toArray(files).some((file) => {
    if (file) {
      return file.size > maxSize
    }
    return false
  })
}

export const openPreviewFile = (url: string, type: string) => {
  // console.log('打开文件预览', url)
  if (!commonFileTypes.includes(type)) {
    showToast('暂不支持预览文件')
  }
  let path = url
  // downloadFile 下载需要在链接上拼接文件后缀， ios不需要
  if (!isWxAppIosEnv) {
    const res = url.split('?')
    path = `${res[0]}.${type}?${res[1]}`
  }
  if (!isH5FSEnv) {
    Taro.downloadFile({
      url: path,
      fileType: type,
      success: function (res) {
        console.log('openPreviewFile', res)
        const filePath = res.tempFilePath
        if (filePath) {
          Taro.openDocument({
            filePath: filePath,
            fileType: type,
            success: function (item) {
              console.log('打开文档成功', item, type, path)
            },
            fail: function (err) {
              console.log('打开文档失败', err, type, path)
            },
          })
        } else {
        }
      },
      fail: function (err) {
        console.log('openPreviewFile', err)
      },
    })
  } else {
    location.href = path
  }
}

/**
 *
 * @param urls 要预览的图片链接列表 ['imgUrl1','imgUrl2']
 * @param current 当前预览的图片链接 imgUrl1
 * @param parentClassName 要挂在的父级容器class (使用此方法的组件容器)
 */
export const openPreviewImg = (
  urls: string[],
  current: string,
  parentClassName: string,
  showMenuByLongpress?: boolean,
) => {
  showImagePreview({
    parentClassName,
    images: urls.map((url) => ({ src: url })),
    activeIndex: urls.lastIndexOf(current),
    showMenuByLongpress: !!showMenuByLongpress,
  })
}
/**
 * 禁用提示语
 */
export const disableAlertUnload = () => {
  if (isAmapApp) {
    return
  }
  try {
    umpOtherReport('EXP', {
      eventCode: 'exp_express_dispatch_back_v1',
    })
    Taro?.disableAlertBeforeUnload()
  } catch (error) {
    console.log('禁用提示语', error)
  }
}
/**
 * 返回拦截注册成功
 */
export const enableAlertUnload = () => {
  if (isAmapApp) {
    // 高德小程序不支持返回拦截
    return
  }
  try {
    Taro?.enableAlertBeforeUnload({
      message: '您有未保存的数据，您确定离开吗？',
      success: function (res) {
        console.log('返回拦截注册成功', res)
      },
      fail: function (err) {
        console.log('返回拦截注册失败', err)
      },
    })
  } catch (error) {
    console.log('Taro返回拦截注册失败', error)
  }
}

/**
 * 界面返回时上报
 * @param params
 * @returns
 */
export const useNativeBackReport = (params) => {
  const { reportCb } = params
  const manualReturnReportFlag = ref(false)
  const setManualReturnReport = (flag = false) => {
    manualReturnReportFlag.value = flag
  }
  const manualReturnReport = () => {
    console.log('useNativeBackReport-onU', manualReturnReportFlag.value)
    if (manualReturnReportFlag.value) {
      manualReturnReportFlag.value = false
      reportCb?.()
    }
  }
  onMounted(() => {
    setManualReturnReport(true)
    console.log('useNativeBackReport-on')
  })
  onUnmounted(() => {
    manualReturnReport()
  })
  return {
    manualReturnReportFlag,
    setManualReturnReport,
  }
}

const timeout = 10000
const service = axios.create({ timeout })
export const httpFile = (data) => {
  delete data.base64
  delete data.fileType
  delete data.fileName
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })
  const headers = {
    // 跨越速运_APP x-from:111 跨越寄件_微信小程序 x-from:114
    'Content-Type': 'multipart/form-data',
  }

  return service({
    url: `${RequestBaseUrl}/router/upload`,
    method: 'POST',
    data: formData,
    headers,
  })
}
