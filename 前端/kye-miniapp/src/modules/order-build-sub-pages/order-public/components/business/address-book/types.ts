// 地址簿列表每项
import { PagedQueryAddressRow } from '@order-public-sub-public/apis/address/types'
import { Address } from '@order-public-sub-public/constants/address'

export type ListItem = {
  id: string
  onlyMd5UniqueId?: string
  companyName: string
  telephone: string
  person: string
  mobile: string
  province: string
  city: string
  county: string
  detailAddress: string
  fullAddress: string
  remark: string
  collectFlag: boolean
  defaultFlag?: boolean
  addressLabelCode?: string[]
  labelName?: string
  commonFlag: boolean
  justAddedFlag: boolean
  isSelectItem?: boolean
  updateFlag?: boolean
  deleteFlag?: boolean
  addressLabelAble?: boolean // true则禁用加入标签
  extension?: string
  district?: string
  strategyId?: string
  cannotDeleteAbleTips?: string
  cannotAddAddressLabelTips?: string
  /** 地址完善标识：10待完善（展示"地址待完善"标签与完善按钮） */
  addressCompleteFlag?: string
}

export interface AreaType {
  show: boolean
}

export interface RefType {
  open: (locations: string[] | null | string) => void
}

export interface AreaAddressItem {
  province: string
  city: string
  county: string
}

export interface AddressData {
  name: string
  mobilePhone: string
  telPhone: string
  province: string
  city: string
  district: string
  address: string
}

export interface PageReactiveType {
  area: string[]
  detailAddress: string
  fullAddress: string
  specifyAddress: string
}

export interface AreaType {
  show: boolean
}

export interface RefType {
  open: (locations: string[] | null | string) => void
  toFocus: () => void
}

export interface AreaAddressItem {
  province: string
  city: string
  county: string
}

/**
 * @description 包含省市区详细地址
 */
export interface detailedAddress extends AreaAddressItem {
  detailAddress: string
}

export interface AddressData {
  name: string
  mobilePhone: string
  telPhone: string
  province: string
  city: string
  district: string
  address: string
}

export interface PageReactiveType {
  province: string
  city: string
  county: string
  area: string[]
  detailAddress: string
  fullAddress: string
  specifyAddress: string
}

export interface ListReactiveType {
  active: number
  keyword: string
  refreshing: boolean
  loading?: boolean
  finished: boolean
  list: ListItem[]
  page: number
  pageSize: number
  pageTotal: number
  rowTotal?: number
  defaultValue: boolean
  selectItem: boolean
  showManage: boolean
  showSkeleton: boolean
  errorText: string
  errorStatus: boolean
  switchLoading: boolean
  batchCanSelect: boolean
  batchSelectList?: ListItem[]
  isSubTab: boolean
  shareAddressPermission: string
  shareAddressPermissionKey: string
  showBtnOne: boolean
}

export interface Error {
  code: number
  message?: string
  msg?: string
}

export enum EAddressPermission {
  '有权限' = '10',
  '无权限' = '20',
}

export enum EAddressPermissionTab {
  '全部地址' = '10',
  '我的地址' = '20',
  '共享地址' = '30',
}

type AddressKeys = Address.SENDER_ADDRESS_TYPE | Address.RECEIVE_ADDRESS_TYPE
type TabKeys = EAddressPermissionTab.全部地址 | EAddressPermissionTab.共享地址 | EAddressPermissionTab.我的地址

export type DynamicKeys = `${AddressKeys}_${TabKeys}`

export interface tabDataType {
  rowTotal?: number
  page: number
  list: PagedQueryAddressRow[]
  finished?: boolean
  errorText?: string
  errorStatus?: boolean
}

// 地址簿应用场景
export enum AddressScene {
  移动端 = 'mobile',
}

export enum RequestSource {
  移动端 = '30',
}

export interface IClearAddrListItem {
  id: string
  phone: string
  customerCode: string
  telephone: string
  contact: string
  contactPhone: string
  province: string
  city: string
  area: string
  address: string
  company: string
}

export interface ClearAddrListReactiveType {
  refreshing: boolean
  loading: boolean
  finished: boolean
  list: IClearAddrListItem[]
  page: number
  pageSize: number
  pageTotal: number
  errorText: string
  rowTotal: number
  firstLoad: boolean
}

export interface IClearAddrInfo {
  type: string
  value: number
}

export type cleanAddrType = '30' | '60' | '90'
export const CleanAddressTypeMap = {
  '30': '10', // 30天没使用
  '60': '20', // 60天没使用
  '90': '30', // 90天没使用
}

export const MaxClearAddrNum = 20000
export interface addressID {
  sender_id?: string | number
  receiver_id?: string | number
}
