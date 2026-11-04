import { fileType } from '@order-public-sub-public/apis/pickup/type'

export interface fileListProps {
  bizId: string
  bizCode: string
  list: fileType[]
  maxCount: number
  type?: 'dispatchInformation' | 'pickupInformation'
  isUseNew?: boolean
  /** 删除前校验，返回 true 才允许删除 */
  deleteValidate?: (file: fileType) => Promise<boolean> | boolean
}
