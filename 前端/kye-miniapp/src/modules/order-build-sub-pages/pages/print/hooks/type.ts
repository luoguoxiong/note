

export interface btnListType {
  type: string
  typeName?: string
  typeNameDes?: string
}
export interface printerType {
  name: string
  state?: string
  uuid?: string
  [x: string]: any
}
export interface printerFormType {
  printer: printerType
  templateList: btnListType[]
  tagList: btnListType[]
  mdList: btnListType[]
  count: number | string
  pageSize: string
  markFont: string
  isMother: boolean
  printerType: string
  stubChildData: btnListType[]
}

export enum ParentChildrenPermissionType {
  '有子母单权限' = '10',
  '无子母单权限' = '20',
  '即不是子单也不是母单' = '30',
}

export enum ChangeCountPermission {
  '有更改件数权限' = '10',
  '无更改件数权限' = '20',
  '部分有修改运单权限' = '30',
}

export enum labelPermissionType {
  '有打印标签权限' = '10',
  '无打印标签权限' = '20',
}

export enum changeCountPermissionType {
  '可以修改件数' = '10',
  '不可修改件数' = '20',
}

export interface printManagementListType {
  key: string
  label: string
  imgList: imgListType[]
}
export interface imgListType {
  imgUrl: string
  [key: string]: any
}

export enum VisibleAuth {
  '全部展示' = '10', //全部展示
  '全部隐藏' = '20', //全部隐藏
  '部分展示' = '30', //部分展示
}

export interface storageType {
  waybillNumber: string[]
  type: string
  showNumber: string
}

export enum PrinterTypeEnum {
  '蓝牙打印' = 'blueTooth',
  '云打印' = 'cloud',
}

export enum CloundPrintStatusEnum {
  '进行中' = 10,
  '成功' = 20,
  '失败' = 30,
}
