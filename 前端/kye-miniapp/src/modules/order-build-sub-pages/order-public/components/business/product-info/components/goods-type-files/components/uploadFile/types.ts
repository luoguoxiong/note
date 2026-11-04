import { fileType } from '@order-public-sub-public/apis/pickup/type'

export interface IUploaderFileProps {
  maxSize?: number
  maxCount?: number
  fileTypes?: string[] //文件类型
  fileList: fileType[]
}
