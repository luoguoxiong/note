import { ExtractPropTypes } from 'vue'

export const uploadProps = {} as const

export type UploaderProps = ExtractPropTypes<typeof uploadProps>

export type FileItemStatus = 'ready' | 'uploading' | 'success' | 'error'

interface sourceType {
  /** 从相册选择 */
  album
  /** 使用相机拍摄 */
  camera
}

export type UploadProps = Partial<{
  name: string
  sourceType: Array<keyof sourceType>
  fileList: any[]
  modelValue: any[]
  listType: 'picture' | 'list'
  accept: string
  // 上传文件读取前拦截
  // beforeRead: () => void
  beforeRead?: (files: File[]) => Promise<File[]>
  // 文件读取完成后完毕回调
  afterRead: () => void
  beforeDelete: () => void
  maxSize: number | string
  maxCount: number
  // 图片多选(安卓部分不支持)
  multiple: boolean
  // 是否禁用
  disabled: boolean
  // 是否展示删除按钮
  deletable: boolean
  // 仅小程序支持
  mode: string
  data: {}
  // 是否允许使用摄像头
  capture: boolean
}>

export class FileItem {
  status: FileItemStatus = 'ready'
  message: string = ''
  uid: string = new Date().getTime().toString()
  name?: string
  url?: string
  type?: string
  path?: string
  base64?: string
  originalFileObj?: any
  percentage: string | number = 0
  formData: any = {}
}
