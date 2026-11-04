import { ChangeKeys, OrderInfo } from '@order-public-sub-public/types'
import { http } from '@order-public-sub-public/utils/request'
import {
  MultilevelLinkage,
  MultilevelLinkageResponse,
  MapAddressSearchResponse,
  HotCityNameListResponse,
  FindSuggestResponse,
  FindSuggestParams,
  PagedQueryAddress,
  SwitchDefaultAddress,
  BatchDeleteAddress,
  HistoryAddress,
  DeleteHistoryAddress,
  ConfigAddressListParams,
  ConfigAddressListResponse,
  GetAddressFromMapResponse,
  AiAddrAnalysisRes,
  BatchSaveAddressResponse,
  QueryExhibitionResponse,
  // AnalysisResponse,
  OcrAnalysisResponse,
  PagedQueryAddressResponse,
  HistoryAddressResponse,
  QueryCompanyInfo,
  UpdateAddressResponse,
  OcrParams,
  IsAddressBookHasData,
  ClearAddrPagedQueryAddress,
  ClearAddrPagedQueryAddressResponse,
  IsCanClearAddrResponse,
  ICleanAddressConfirm,
  AddressLabel,
  CompleteAddressParams,
  CompleteAddressResponse,
  AddressReminderResponse,
  AddressReminderParams,
} from './types'
import { Any } from '@public/utils/types'

/**
 * @description 地址簿
 * @param params
 * @returns
 */
export const getAddressBookList = (params: PagedQueryAddress) => {
  return http<PagedQueryAddressResponse>('web.order.address.orderV1.pageList', params, { toast: false })
}

/**
 * @description 设置默认地址
 * @param params
 * @returns
 */
export const switchDefaultAddress = (params: SwitchDefaultAddress) => {
  return http('web.order.address.v1.defaultAddress', params)
}

/**
 * @description 删除地址簿列表
 * @param params
 * @returns
 */
export const batchDeleteAddress = (params: BatchDeleteAddress) => {
  return http('web.order.address.v1.batchDelete', params, { toast: true })
}

/**
 * @description 获取省市区
 * @param params
 * @returns
 */
export const multilevelLinkage = (params: MultilevelLinkage) => {
  return http<MultilevelLinkageResponse>('web.order.address.multilevelLinkage', params, { toast: false })
}

/**
 * @description 获取最近寄/收件地址
 * @param params
 * @returns
 */
export const historyAddress = (params: HistoryAddress) => {
  return http<HistoryAddressResponse[]>('web.order.address.userHistory.list', params)
}

/**
 * @description 删除最近寄/收件地址
 * @param params
 * @returns
 */
export const deleteHistoryAddress = (params: DeleteHistoryAddress) => {
  return http('web.order.address.userHistory.remove', params)
}

/**
 * @description 智能识别解析
 * @param params
 * @returns
 */
export const aiAddrAnalysis = (params: OcrParams) => {
  return http<AiAddrAnalysisRes>('web.order.address.v1.resolution', params)
}

// 地址批量解析
export const batchAddressResolution = (params: { text: string; addressType: number }) => {
  return http<AiAddrAnalysisRes>('web.order.batch.address.resolution', params, { toast: false })
}

/**
 * @description 图片解析
 * @param params
 * @returns
 */
// export const analysis = (params: { data: { base64_data: string; img_id: string } }) => {
//   return http<AnalysisResponse>('star.image.address.analysis', params, { toast: false })
// }
export const analysis = (params: { data: { base64_data: string; img_id: string } }) => {
  const payload = {
    imgId: params.data.img_id,
    base64Data: params.data.base64_data,
  }
  return http<OcrAnalysisResponse>('web.order.image.ocrAnalysis', payload, { toast: false })
}

interface BatchSaveAddress {
  addressType: string
  addressList: Record<string, any>[]
}

/**
 * @description 新增地址簿
 * @param params
 * @returns
 */
export const batchSaveAddress = (params: BatchSaveAddress) => {
  return http<BatchSaveAddressResponse[]>('web.order.address.orderV1.batchSave', params, { toast: false })
}

interface UpdateAddress {
  id: string | number
  addressType: string | number | unknown
  person: string
  mobile: string
  telephone: string
  extension: string
  companyName: string
  province: string
  county: string
  city: string
  detailAddress: string
}

/**
 * 新增地址时，查询公司名的是否可编辑以及公司名称
 */
export const queryCompanyInfo = () => {
  return http<QueryCompanyInfo>('web.order.configOrder.query.companyInfo')
}

/**
 * @description 编辑地址簿
 * @param params
 * @returns
 */
export const updateAddress = (params: UpdateAddress) => {
  return http<UpdateAddressResponse>('web.order.address.orderV2.update', params)
}

/**
 * @description 获取省市区热门城市
 * @param params
 * @returns
 */
export const hotCityNameList = () => {
  return http<HotCityNameListResponse[]>('web.order.address.hotCityNameList')
}

interface MapAddressSearch {
  keyword: string
}

/**
 * @description 省市区搜索结果列表
 * @param params
 * @returns
 */
export const mapAddressSearch = (params: MapAddressSearch) => {
  return http<MapAddressSearchResponse>('web.order.address.mapAddressSearch', params)
}
/*
 * @description 根据关键词查询详细地址
 * @param params
 */
export const findSuggest = (params: FindSuggestParams) => {
  return http<FindSuggestResponse>('web.order.address.findSuggest', params, { toast: false })
}

/**
 * @description 获取已配置的地址列表
 */
export const getConfigAddressList = (params: ConfigAddressListParams) => {
  return http<ConfigAddressListResponse>('web.order.address.v1.getConfigAddressAndLocations', params)
}

/**
 * @description 定位
 * @param params
 */
export const getAddressFromMap = (params: Record<string, any>) => {
  return http<GetAddressFromMapResponse>('web.order.address.config.getAddressFromMap', params)
}

/**
 * @description 定位(搜索)
 * @param params
 */
export const findPositionFromMap = (params: Record<string, any>) => {
  return http<GetAddressFromMapResponse>('web.order.address.findPosition', params, {
    toast: false,
    cancelDuplicated: true,
  })
}

/**
 * @description 指定地址-按就近地址推荐按钮
 * @param params
 */
export const hideRecommendLocation = (params: Record<string, any>) => {
  return http('web.order.address.hideRecommendLocation', params, { toast: false })
}

/**
 * @description 寄方展馆号
 * @param params
 */
export const queryExhibition = (params: { sourceFlag?: string; waybillId: string }) => {
  return http<QueryExhibitionResponse[]>('web.order.configOrder.queryExhibition', params, { toast: false })
}

/**
 * @description 获取是否保存到地址簿状态
 * @param params
 */
export const getAddressSaveFlag = (params: Record<string, any>) => {
  return http<boolean>('web.order.address.setting.getAddressSaveFlag', params, { toast: false })
}

/**
 * @description 设置是否保存到地址簿状态
 * @param params
 */
export const putAddressSaveFlag = (params: Record<string, any>) => {
  return http<boolean>('web.order.address.setting.putAddressSaveFlag', params, { toast: false })
}

/**
 * @description 批量校验
 * @param params
 */
export const senderReceiverCheck = (params: { elementsChange: ChangeKeys[]; orderInfo: OrderInfo }) => {
  return http('web.order.configOrder.senderReceiverCheck', params, { toast: false })
}

/**
 * @description 地址簿是否展示搜索框
 * @returns
 */
export const getIsShowSearch = () => {
  return http<IsAddressBookHasData>('web.order.address.v1.checkHasAddress', {}, { toast: false })
}

/**
 * @description 可以清理的地址簿列表
 * @param params
 * @returns
 */
export const getClearAddressBookList = (params: ClearAddrPagedQueryAddress) => {
  return http<ClearAddrPagedQueryAddressResponse>('web.order.address.cleanAddressList', params, { toast: false })
}

/**
 * @description 是否拥有一键清理的按钮
 * @param params
 * @returns
 */
export const getIsCanClearAddr = (params: { addressType: string; addressShowType: string }) => {
  return http<IsCanClearAddrResponse>('web.order.address.cleanAddressAuth', params, { toast: false })
}

/**
 * @description 用户一键清理或者选择地址清理
 * @param params
 * @returns
 */
export const cleanAddressConfirm = (params: ICleanAddressConfirm) => {
  return http<{ taskNo: string }>('web.order.address.cleanAddressConfirm', params, { toast: false })
}

/**
 * @description 轮询一键清理结果
 * @param params
 * @returns
 */
export const getCleanResult = (params: { taskNo: string }) => {
  return http<string>('web.order.address.cleanAddressResult', params, { toast: false })
}

/**
 * @description 地址簿进入新增或者编辑页面时，调用初始化接口，后端返回是否可以编辑等信息
 * @param params
 * @returns
 */
export const getRequireConfig = (params: { addressType: string }) => {
  return http<Any>('web.order.address.orderV1.initConfig', params, { toast: false })
}

/**
 * @description 地址导航栏接口（包含地址标签、搜索框）
 * @param params
 * @returns
 */
export const navigationbarQuery = (params: { source: string }) => {
  return http<IsAddressBookHasData>('web.order.address.navigationbar.query', params, { toast: false })
}

/**
 * @description 地址标签修改接口
 * @param params
 * @returns
 */
export const addressLabelUpdate = (params: { type: '10' | '20'; addressLabelList: AddressLabel[] }) => {
  return http<AddressLabel[]>('web.order.address.addressLabel.update', params, { toast: false })
}

/**
 * @description 地址标签新增接口
 * @param params
 * @returns
 */
export const addressLabelSave = (params: { labelName: string }) => {
  return http<AddressLabel>('web.order.address.addressLabel.save', params, { toast: false })
}

/**
 * @description 地址导航栏接口（包含地址标签、搜索框）
 * @param params
 * @returns
 */
export const addressLabelDelete = (params: { labelCode: string }) => {
  return http<string>('web.order.address.addressLabel.delete', params, { toast: false })
}

/**
 * @description 地址批量加入地址标签
 * @param params
 * @returns
 */
export const addAddressToAddressLabel = (params: { addressType: string; labelCode: string; addressIds: string[] }) => {
  return http<string>('web.order.address.addressLabel.addAddressToAddressLabel', params, { toast: false })
}

/**
 * @description 批量加入地址标签轮询接口
 * @param params
 * @returns
 */
export const getAddressResultByTaskNo = (params: { taskNo: string }) => {
  return http<boolean>('web.order.address.addressLabel.getResultByTaskNo', params, { toast: false })
}

/**
 * @description 地址校正-完善地址
 * @param params
 * @returns
 */
export const completeAddress = (params: CompleteAddressParams) => {
  return http<CompleteAddressResponse>('web.order.address.completeAddress', params, { toast: false })
}

/**
 * @description 地址提醒
 * @param params.addressType 地址类型：sender-寄件, receiver-收件, all-全部（默认）
 * @returns
 */
export const getAddressReminder = (params: AddressReminderParams = {}) => {
  const { addressType = 'all' } = params
  return http<AddressReminderResponse>('web.order.address.reminder', { addressType }, { toast: false })
}
