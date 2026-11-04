import { IdType, IdTypeEnum } from '../../hooks/type'
import Taro from '@tarojs/taro'
import {
  ocrImgRecognition,
  ocrImgByForeignResidentIdCard,
  ocrImgByGatIdentityCard,
  ocrImgByIdentityCard,
} from '@modules/user/apis/realname'
import { ref } from 'vue'
import {
  other_center_id_company_upload_business_license_write,
  other_center_id_company_upload_identity_photo_write,
  other_center_id_personal_write,
  other_id_personal_photo,
  other_id_company_photo,
  clk_center_id_personal_upload_identity_photo_button,
  clk_center_id_company_upload_identity_photo_button,
  clk_center_id_company_upload_business_license_button,
} from '../../report'

const type = ref(IdTypeEnum.身份证人像面)
const idType = ref(IdType.RESIDENT_ID_NO)
const user = ref('personal')

export const showPopover = ref(true)
export const setShowPopover = (value: boolean) => (showPopover.value = value)

// 个人认证、企业认证文件限制大小
export const personVerifyOptions = {
  maxSize: 1024 * 1024 * 2, // 文件大小限制，单位kb
  maxSizeLimit: 1024 * 1024 * 15, // 直接提示文件大小限制，单位kb(不再压缩了)
}

/**
 * 转换为数组
 * @param { any | any[] } item 文件对象
 * @returns { any[] } 返回一个数组
 */
export const toArray = (item) => {
  return Array.isArray(item) ? item : [item]
}

/**
 * 转换单位 b2mb
 * @returns { string }
 */
export const toUnitSize = (fileSize = 0) => {
  if (fileSize <= 100) {
    return `${fileSize.toFixed(2)}K`
  }
  return `${(fileSize / 1024 / 1024).toFixed(2)}M`
}

/**
 * 检测文件列表大小
 * @param { file | file[] } files 文件对象
 * @param { number } maxSize 大小
 * @returns { Boolean } 如果文件大小超出 maxSize 则返回 true 否则为 false
 */
export const isOversize = (files, maxSize) => {
  return toArray(files).some((file) => {
    if (file) {
      return file.fileSize > maxSize || file.size > maxSize
    }
    return false
  })
}

// 1 - 身份证人像面。2 - 身份证国徽面。3 - 营业执照。4 - 组织机构代码。5 - 税务登记证 6 - 外国人永久居留证人像面
/**
 * 企业认证图片识别 type 入参
 *  10.营业执照；20.组织机构代码照片；30.税务登记证
 */
export const ocrImgRecognitionType = () => {
  let text = ''
  switch (type.value) {
    case '3':
      text = '10'
      break
    case '4':
      text = '20'
      break
    case '5':
      text = '30'
      break
    default:
      text = ''
      break
  }
  return text
}

export const isResidentGatIdNo = () => {
  return +idType.value === IdType.RESIDENT_GAT_ID_NO
}
export const isForeignerIdNo = () => {
  return +idType.value === IdType.FOREIGNER_ID_NO
}

const getImgByteSize = (base64: string): number => {
  if (!base64) return 0
  const strLength = base64.indexOf('=') > 0 ? base64.indexOf('=') : base64.length
  return Math.floor(strLength - (strLength / 8) * 2)
}

export const handleFilePathToBase64 = (
  filePath: string,
): Promise<{ fileName: string; fileSize: string; base64: string }> => {
  return new Promise((resolve, reject) => {
    const fs = Taro.getFileSystemManager()
    fs.readFile({
      filePath: filePath,
      success: ({ data }: any) => {
        const base64 = Taro.arrayBufferToBase64(data)
        var localData = base64
        if (localData.indexOf('data:image') != 0) {
          localData = 'data:image/jpeg;base64,' + localData
        }
        let suffix = '.png'
        if (localData.includes('data:image/jpeg')) suffix = '.jpeg'
        else if (localData.includes('data:image/jpg')) suffix = '.jpg'

        localData = localData.replace(/\r|\n/g, '').replace('data:image/jgp', 'data:image/jpeg')

        resolve({
          fileName: `img-${Date.now()}${suffix}`,
          fileSize: (getImgByteSize(localData) / 1024).toFixed(2),
          base64: localData,
        })
      },
      fail: (error: any) => {
        reject(error)
      },
    })
  })
}

/**
 * 处理img数据格式
 */
const filterImage = async (res: any) => {
  if (!res) return
  const files = res?.tempFiles?.map((file) => {
    return {
      name: file.name || file.path || file.tempFilePath,
      path: file.path || file.tempFilePath,
      size: file.size,
      type: file.type,
    }
  })
  return files
}

// 上报埋点
export const onReportClickUpload = () => {
  if (user.value === 'personal') {
    clk_center_id_personal_upload_identity_photo_button({
      page_name: 'page_id_personal',
      eventCode: 'clk_center_id_personal_upload_identity_photo_button',
      event_type_id: 2101,
      button_name: '点击上传身份证',
    })
  } else if (user.value === 'enterprise') {
    if (type.value === IdTypeEnum.身份证人像面) {
      clk_center_id_company_upload_identity_photo_button({
        page_name: 'page_id_company',
        eventCode: 'clk_center_id_company_upload_identity_photo_button',
        event_type_id: 2101,
        button_name: '点击上传身份证',
      })
    }
    if (type.value === IdTypeEnum.营业执照) {
      clk_center_id_company_upload_business_license_button({
        page_name: 'page_id_company',
        eventCode: 'clk_center_id_company_upload_business_license_button',
        event_type_id: 2101,
        button_name: '点击上传营业执照',
      })
    }
  } else {
    console.log('暂无')
  }
}

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

interface UseFileUploadOptions {
  acceptType?: SelectType // 文件类型
  multiple?: boolean // 是否多选
  maxCount?: number // 最大选择数量 0～100
  maxSize?: number // 单个文件最大大小（字节）
  uploadUrl?: string // 上传接口URL
  formData?: Record<string, any> // 附加表单数据
  concurrentLimit?: number // 并发上传限制
  timeout?: number // 上传超时时间(毫秒)
  extension?: string[]
  type?: keyof SelectType
}
export const inputUpload = (options: UseFileUploadOptions, image?: boolean) => {
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

export const useInitUpload = (props) => {
  type.value = props.type
  idType.value = props.idType || undefined
  user.value = props.user || 'personal'
}

export const afterRead = async ({ content }) => {
  try {
    const IdentityCardApi = isForeignerIdNo()
      ? ocrImgByForeignResidentIdCard
      : isResidentGatIdNo()
        ? ocrImgByGatIdentityCard
        : ocrImgByIdentityCard

    const type = ocrImgRecognitionType()
    // ocr 识别
    const { data: ocrData } = type
      ? await ocrImgRecognition({
          image_data: content,
          type: type,
        })
      : await IdentityCardApi({
          imageBase64: content,
        })
    onReportDone(true)
    const params = {
      upload_type: '',
      request_result: '成功',
      failure_reason: '',
    }
    if (user.value === 'personal') {
      other_id_personal_photo(params)
    } else if (user.value === 'enterprise') {
      other_id_company_photo(params)
    }
    return {
      bizId: '',
      ocrData,
      type: '1',
    }
  } catch (error) {
    onReportDone(false)
    const params = {
      upload_type: '',
      request_result: '失败',
      failure_reason: error,
    }
    if (user.value === 'personal') {
      other_id_personal_photo(params)
    } else if (user.value === 'enterprise') {
      other_id_company_photo(params)
    }
  }
}

// 完成
export const onReportDone = (isDone) => {
  if (user.value === 'personal') {
    other_center_id_personal_write({
      page_name: 'page_id_personal',
      eventCode: 'other_center_id_personal_write',
      event_type_id: 19999,
      if_identity_information: isDone ? '是' : '否',
    })
  } else if (user.value === 'enterprise') {
    if (+type.value === 1) {
      other_center_id_company_upload_identity_photo_write({
        page_name: 'page_id_company',
        eventCode: 'other_center_id_company_upload_identity_photo_write',
        event_type_id: 19999,
        if_identity_information: isDone ? '是' : '否',
      })
    }
    if (+type.value === 3) {
      other_center_id_company_upload_business_license_write({
        page_name: 'page_id_company',
        eventCode: 'other_center_id_company_upload_business_license_write',
        event_type_id: 19999,
        if_identity_information: isDone ? '是' : '否',
      })
    }
  } else {
    console.log('暂无')
  }
}
