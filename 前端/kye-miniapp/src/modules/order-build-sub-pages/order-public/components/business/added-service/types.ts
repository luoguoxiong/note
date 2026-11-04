export enum goodsControlEnum {
  '等通知发运' = '10',
  '等通知派送' = '30',
}

export const goodsControlTypeEnum: Record<string, string> = {
  '10': '等通知发运',
  '30': '等通知派送',
}

export enum PackageServiceEnum {
  '打木架' = '20',
  '打木箱' = '30',
  '打卡板' = '10',
  '打木箱(国际)' = '100',
  '打木托(国际)' = '110',
}

export enum OtherPackageServiceEnum {
  '打绷带' = '110',
  '打护角' = '40',
  '蜂窝板' = '50',
  '气泡膜' = '10',
  '气泡柱' = '150',
  '珍珠棉' = '30',
  '拉伸膜' = '20',
  '打纸箱' = '70',
  '防倾斜' = '160',
  '防震动' = '170',
}

export const PackageServiceTypeEnum: Record<string, string> = {
  '20': '打木架',
  '30': '打木箱',
  '10': '打卡板',
  '100': '打木箱(国际)',
  '110': '打木托(国际)',
}

export const OtherPackageServiceTypeEnum: Record<string, string> = {
  '110': '打绷带',
  '40': '打护角',
  '50': '蜂窝板',
  '10': '气泡膜',
  '150': '气泡柱',
  '30': '珍珠棉',
  '20': '拉伸膜',
  '70': '打纸箱',
  '160': '防倾斜',
  '170': '防震动',
}

export enum FreightLookAuthFlagEnum {
  '有权限' = '10',
  '无权限' = '20',
}

export const ReceiptTypeEnum: Record<string, string> = {
  '10': '回单原件',
  '20': '',
  '30': '回单照片',
  '40': '电子回单',
}
export const ReceiptCheckTypeEnum: Record<string, string> = {
  signFlag: '签字',
  sealFlag: '盖章',
  idCardFlag: '签身份证',
  dateFlag: '签日期',
}
export const ReceiptUrgentReturnEnum: Record<string, string> = {
  urgent: '加急',
  notUrgent: '不加急',
}
export const ReceiptProviderTypeEnum: Record<string, string> = {
  '10': '收方提供',
  '20': '寄方提供',
  '30': '跨越代打',
  '40': '自行提供',
}

export interface CustomerFile {
  fileName?: string
  fileSize: number
  fileType?: string
  data?: string
  base64?: string
}

export enum UploadStatusEnum {
  'WAIT' = 1,
  'FAIL' = 2,
  'SUCCESS' = 3,
  'DELETING' = 4,
  'UPLOADING' = 5,
}

export interface UploadFile {
  id: string
  suffix: string
  creationDate: number
  originalName?: string
  size: number
  status: UploadStatusEnum
  type: string
  file: File
  url?: string
  base64?: string
  request_id?: string | undefined
  angle_reg_type?: string | undefined
}

export enum DismantlingWoodenFrameEnum {
  '选中' = '10',
  '未选中' = '',
}

export enum WoodFeeType {
  '总价' = '20',
  '单价' = '10',
}

export enum AddressUnfoldFrom {
  '返单' = 'receipter'
}