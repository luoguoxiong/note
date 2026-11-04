/**
 * @description store 的类型描述文件，后续开发者每添加新的属性需要同步维护类型
 */

import { AddressBook, MapPosition, SenderPage } from '@order-public-sub-public/apis/address/types'
import { preConfigInitResponse } from '@order-public-sub-public/apis/init/types'
import { ModuleType, OrderPageType, ReturnWaybillBackType } from '@order-public-sub-public/constants'
import { GetEstimateFeeByTaskIdResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { BatchOrderInfo } from '@order-public-sub-public/apis/batch/types'
import {
  ComponentMap,
  ModuleDimension,
  OrderInfo,
  RelationMap,
  UserInfo,
  Schema,
  RestrictData,
  KaCustomerMap,
  CheckDetail,
  InitDataResponse,
  pageDefaultInfoType,
  RemoteCheckParams,
  PlainObject,
} from '@order-public-sub-public/types'
import { DynamicConfig, StaticConfig, InitResponse } from '@order-public-sub-public/apis/types'

export type State = {
  axiosItems: AxiosItem[]
  isTokenAlive: boolean
  orderPageType: OrderPageType
  currentWaybillNumber: string
  count?: number
}

// 单票场景
export type SingleOrderPageType = Exclude<OrderPageType, OrderPageType.单票 | OrderPageType.返程单 | OrderPageType.预览>

// 批量场景
export type BatchOrderPageType = Extract<OrderPageType, OrderPageType.批量寄 | OrderPageType.批量寄单票>

/**
 * module:schema
 */

export interface SchemaConfig extends StaticConfig {
  configId: string // 配置id
  schema: Schema
  versionId?: string // 版本id
  themeName?: string // 主题名称
  currentThemeName?: string // 当前主题名称，退出活动使用
}

export interface SchemaState {
  [OrderPageType.单票]: SchemaConfig
  [OrderPageType.批量寄]: SchemaConfig
  [OrderPageType.批量寄单票]: SchemaConfig
  [OrderPageType.返程单]: SchemaConfig
  [OrderPageType.预览]: SchemaConfig
}

export type ModuleDimensionType = Uncapitalize<ModuleType> & keyof ModuleDimension

export type OrderState = {
  [OrderPageType.单票]: OrderInfo
  [OrderPageType.批量寄]: BatchOrderInfo
  [OrderPageType.批量寄单票]: OrderInfo
  [OrderPageType.返程单]: OrderInfo
  [OrderPageType.预览]: OrderInfo
}

export type ModuleFormType = Uncapitalize<ModuleType> & keyof OrderInfo

/**
 * module:globalData
 */

export interface AxiosItem {
  uuid: string
  method: string
  cancel: (reason: string) => void
}

export interface StaticConfigAndWaybillInfo {
  [key: string]: {
    waybillInfo: OrderInfo
    staticConfig: StaticConfig
    dynamicConfig: DynamicConfig
    orderCustomer: Partial<ExtendOrderCustomer>
    batchId: string
  }
}

export interface GlobalDataState {
  [OrderPageType.单票]: GlobalState
  [OrderPageType.批量寄]: GlobalState
  [OrderPageType.批量寄单票]: GlobalState
  [OrderPageType.返程单]: GlobalState
  [OrderPageType.预览]: GlobalState
}

export interface GlobalState {
  eventsMap?: RelationMap
  componentList: string[]
  existComponentMap: ComponentMap
  userInfo: UserInfo
  processLoading: boolean
  initDataPromise: Promise<unknown> | null
  processPromise: Promise<unknown> | null
  serviceModePromise?: Promise<unknown> | null
  restrictData: RestrictData
  dynamicConfig: DynamicConfig
  checkResultList: CheckDetail[]
  preConfig: {
    preConfigId?: string
    preVersionId?: string
    preThemeName?: string
  }
  currentConfig: {
    configId?: string
    versionId?: string
    themeName?: string
    currentThemeName?: string
  }
  initConfig?: InitResponse
  batchWaybillInfo?: OrderInfo //批量寄运单信息
  batchWaybillInfoList?: InitDataResponse[] //批量寄单票运单信息list
  batchDynamicConfig?: DynamicConfig // 批量寄动态数据
  batchRestrictData?: RestrictData
  estimatedCost: GetEstimateFeeByTaskIdResponse // 批量寄 预估费用列表
  batchModuleDimension?: ModuleDimension
  orderPageType?: OrderPageType
  currentWaybillNumber: string
  returnWaybillNumber: string
  returnWaybillInfo?: OrderInfo | PlainObject
  restrictWaybillNumber: string
  goWaybillNumber: string
  staticConfigAndWaybillInfo: StaticConfigAndWaybillInfo
  isEditAndReturnWaybill: boolean
  returnWaybillBackType: ReturnWaybillBackType
  tempWaybillInfo: Pick<OrderInfo, 'addedService'>
  userDefaultSettingInfo?: pageDefaultInfoType
  preConfigProcess: preConfigInitResponse
  serviceModeLoading?: boolean
  serviceModeError?: {
    error: boolean
    remoteCheckParams?: RemoteCheckParams
  }
  recommendAddressTime?: number
  maskInstance?: any // 遮罩实例
  batchId?: string
  scrollTop?: number
}

export type HotZoneStore = Partial<Record<ModuleType, boolean>>

export interface effectByPageType {
  pageName: string
  effect: string
}

/**
 * module:extend
 */

export interface ExtendOrderCustomer {
  bindCustomerCodeFlag: boolean
  bindCustomerCodeBar: boolean
  needBindCustomerCode: boolean
}

interface BatchIdsMapType {
  [key: string]: string
}

export type ExtendCommonState = {
  orderCustomer: ExtendOrderCustomer
  waybillNumberVisiable: boolean
  isShowBindCode: boolean
  isShowNoticeBar: boolean
  contactBusinessVsisable: boolean
  kaCustomerMapStatus: boolean
  sender: {
    visible: boolean
    mapPosition: MapPosition
    addressBook: AddressBook
    addressBookMapPosition: MapPosition
    page: SenderPage
  }
  receive: {
    visible: boolean
    mapPosition: MapPosition
    addressBook: AddressBook
    addressBookMapPosition: MapPosition
    receipterMapPosition: MapPosition
    page: SenderPage
  }
  hotZoneStore: HotZoneStore
  kaCustomerMap: KaCustomerMap
  effectByPage: effectByPageType[]
  batchIdsMap: BatchIdsMapType
}

export type ExtendState = {
  [OrderPageType.单票]: ExtendCommonState
  [OrderPageType.批量寄]: ExtendCommonState
  [OrderPageType.批量寄单票]: ExtendCommonState
  [OrderPageType.返程单]: ExtendCommonState
  [OrderPageType.预览]: ExtendCommonState
}

export enum saveAddressFlagType {
  '保存寄件人信息' = '10',
  '保存收件人信息' = '20',
  '同时保存寄收人信息' = '30',
  '不保存' = '-1',
}
