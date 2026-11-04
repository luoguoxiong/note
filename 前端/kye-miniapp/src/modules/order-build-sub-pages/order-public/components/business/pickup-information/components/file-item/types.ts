import { fileType } from '@order-public-sub-public/apis/pickup/type'

// export interface fileItem extends fileType {
//   fileName: string
//   updateTime: string
//   fileSize: string
//   url: string
//   type: string
//   id: string
// }
export interface fileItemProps {
  fileItem: fileType
  type: 'dispatchInformation' | 'pickupInformation'
}
