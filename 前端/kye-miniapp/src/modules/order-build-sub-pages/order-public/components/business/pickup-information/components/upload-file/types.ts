export interface uploadFileProps {
  bizId: string
  bizCode: string
  maxSize?: number
  maxCount?: number
  listLength?: number //当前文件数量
  maxCountImage?: number // 最大的选择文件数量
  fileType?: string[] //文件类型
  imgType?: string[] // 图片类型
  isUseNewUpload?: boolean
}
