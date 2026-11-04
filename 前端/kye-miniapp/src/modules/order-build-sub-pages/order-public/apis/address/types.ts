import { EAddressPermission } from '@order-public-sub-public/components/business/address-book/types'
import {
  AddressType,
  DefaultType,
  EAM_ORDER_ADDRESS_SCENE_TYPE,
  UpdateAddressStatus,
} from '@order-public-sub-public/constants'

// 省市区列表
export interface MultilevelLinkage {
  commonId: string
  levelType: string
}

export interface MultilevelLinkageResponse {
  cityDistrID: string
  districtLevel: string
  districtList: {
    districtID: string
    districtName: string
  }[]
}

// 省市区搜索
export interface MapAddressSearchResponse {
  districtVOList: { districtName: string }[]
}

// 热门城市
export interface HotCityNameListResponse {
  title: string
  id: string
  provinceId: string
}

export interface DeleteHistoryAddress {
  removeId?: string
  addressType?: string
  clean?: boolean // 是否清空addressType指定的所有地址
}

export interface HistoryAddress {
  addressType: string
}

export interface BatchDeleteAddress {
  addressType: string
  ids: string[]
}

export interface SwitchDefaultAddress {
  id: string
  addressType?: string
  type?: string
}

export interface PagedQueryAddress {
  addressType: string
  keyword: string
  page: number
  pageSize: number
  requestSource?: string | number
  queryScene?: string
}

export interface FindSuggestParams {
  keyword?: string //用户输入关键词
  city?: string //城市
  region?: number // 限定城市范围
  region_fix?: number // 是否固定城市范围
  page_index?: number //页码
  page_size?: number //每页条数
  policy?: number //查询策略
  only_mainland?: number //是否过滤港澳台数据
}

export interface FindSuggestItem {
  address: string
  province: string
  city: string
  id: string
  companyName: string
  county: string
  title: string
  district?: string
}

export interface FindSuggestResponse {
  data: FindSuggestItem[]
  count: number
}
export interface PreciseQueryParams {
  addressType: string
  phone?: string
  page: number
  pageSize: number
  contact?: string
  contactPhone?: string
  source: string
}
export interface PreciseQuery {
  id: string
  createTime: string
  updateTime: string
  phone: string
  customerCode: string
  companyName: string
  telephone: string
  extension: string
  contact: string
  contactPhone: string
  province: string
  city: string
  area: string
  county: string
  address: string
  remark: string
  isCollect: boolean
  source: string
  openid: string
}
export interface PreciseQueryResponse {
  records: PreciseQuery[]
}

export interface ConfigAddressListParams {
  configId: string
  addrType: AddressType //地址类型（10：寄件，20收件）
  keyword?: string //	搜索关键词
  longitude?: number | string //经度
  latitude?: number | string // 维度
  page?: number //页码
  pageSize?: number //每页记录数
}

export interface ConfigAddress {
  extension?: string
  configId?: number //配置id
  addressId?: number //	地址id
  addrType: AddressType //	地址类型（10：寄件，20收件）
  userName?: string | null //姓名
  mobile?: string | null //手机
  telephone?: string // 固定电话
  fixedTelephone?: string | null //座机
  company?: string
  companyName?: string | null //公司名称
  addrName: string | null //地址名称
  addrCode?: string | null //门店ID
  addrDetail?: string //	地址项目
  province?: string | null
  city?: string | null
  county?: string | null
  district?: string | null
  detailAddress?: string | null
  defaultType?: DefaultType // 默认类型
  longitude?: number //经度
  latitude?: number //纬度
  locationDistance?: number | null // 位置距离
  distanceTag?: string | null //距离标签
  isSelectItem?: boolean //批量寄是否选中
}

export interface ConfigAddressListResponse {
  rows: ConfigAddress[]
  rowTotal: number //总记录数
  pageTotal: number //	总页数
  page: number //页码
  pageSize: number //	每页记录数
}

export interface MapPosition {
  province: string
  city: string
  county: string
  area: string[] | [] | ''
  detailAddress: string
  isSelectItem: boolean
}

export interface SenderPage {
  person: string
  mobile: string
  telephone: string
  extension: string
  companyName: string
  province: string
  city: string
  county: string
  detailAddress: string
  locationName: string
  addressLabelCode?: string
  locationId: string
  saveAddressFlag: boolean
  aiAddressRecommend?: boolean
  selectSpecifyAddressId?: string
  exhibition?: {
    exhibitionCode: string
    exhibitionNumber: string
  }
}

export interface AddressBook {
  id: string | number
  person: string
  mobile: string
  telephone: string
  extension: string
  companyName: string
  province: string
  city: string
  county: string
  addressLabelCode?: string[]
  area: string[] | [] | ''
  detailAddress: string
  addressType: string
  isSelectItem: boolean
  justAddedFlagId?: string
  remark?: string
  defaultFlag?: boolean
}

export interface GetAddressFromMapResponse {
  addressList: { title?: string | undefined; detailAddress?: string | undefined; distanceView?: string | undefined }[]
  count: number
  city: string
  title: string
  detailAddress: string
  distanceView: string
  list: Record<string, any>[]
}

export enum resultFlagtype {
  '需要提示' = '20',
  '不需要提示' = '10',
}

export interface AiAddrAnalysisRes {
  resultFlag: resultFlagtype // 10.需要 20.不需要
  addressInfos: AiAddrAnalysis[] // 解析结果
  checkResult?: {
    //解析可能存在错误，在这个对象中返回
    content?: string
  }
  originalAddress?: string
}

export interface AiAddrAnalysis {
  name?: string
  mobilePhone?: string
  telPhone?: string
  province?: string
  city?: string
  district?: string
  address?: string
  county?: string
  detailAddress?: string
  title?: string
  telephone?: string
  extension?: string
  mobile?: string
  company?: string
  source?: number
}

export interface BatchSaveAddressResponse {
  id: string
  onlyMdRepeatFlag?: boolean
}
export interface QueryExhibitionResponse {
  exhibitionNumber: string
  exhibitionCode: string
}

export interface QueryCompanyInfo {
  modifyShipperFlag: boolean // 公司名称修改权限（当前绑码的客户编码）
  customerCode: string // 客户编码
  companyName: string // 公司名称
}

export interface Detect_information {
  address: string
  company: string
}
export interface AnalysisResponse {
  detect_information: Detect_information
  from_type: string
}

export interface OcrAnalysisResponse {
  detectInformation: Detect_information
  fromType: string
}

export interface PagedQueryAddressRow {
  id: string
  companyName: string
  telephone: string
  person: string
  mobile: string
  province: string
  provinceId: string
  city: string
  cityId: string
  county: string
  countyId: string
  detailAddress: string
  fullAddress: string
  remark: string
  extension: string
  collectFlag: boolean
  defaultFlag: boolean
  commonFlag: boolean
  justAddedFlag: boolean
  updateFlag: boolean
  deleteFlag: boolean
  /** 地址完善标识：10待完善（展示"地址待完善"标签与完善按钮） */
  addressCompleteFlag?: string
}

export interface PagedQueryAddressResponse {
  page: number
  pageSize: number
  pageTotal: number
  rowTotal: number
  rows: PagedQueryAddressRow[]
  shareAddressPermission: string
}

export interface HistoryAddressResponse {
  id: string
  city: string
  companyName: string
  detailAddress: string
  district: string
  phone: string
  province: string
  telPhone: string
  userName: string
  extensionNumber: string
  lastUsed: string
  person: string
  county: string
  telephone: string
  company: string
  mobile: string
  extension: string
  tag: boolean
}

export interface UpdateAddressResponse {
  status: UpdateAddressStatus
}

export interface OcrParams {
  text: string
  addressType?: number
  fillTownToDetails?: number
  businessId?: string
  sceneType?: EAM_ORDER_ADDRESS_SCENE_TYPE | ''
}

export type OcrSceneParams = Pick<OcrParams, 'businessId' | 'sceneType'>

export interface AddressLabel {
  labelName: string
  labelCode: string
  labelSort: number
  sortFlag: boolean
}

/**
 * allPersonCompanySenderReceive 所有类型地址是否有数据
 * sender: 寄件人是否有数据
 * receive: 收件人是否有数据
 */
export interface IsAddressBookHasData {
  allPersonCompanySenderReceive: boolean
  shareAddressPermission: EAddressPermission
  addressLabelList: AddressLabel[]
}

export interface ClearAddrPagedQueryAddress {
  addressType: string
  addressShowType: string
  page: number
  pageSize: number
  cleanAddressType: string
  requestSource: string
}

export interface ClearAddrPagedQueryAddressRow {
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

export interface ClearAddrPagedQueryAddressResponse {
  page: number
  pageSize: number
  pageTotal: number
  rowTotal: number
  rows: ClearAddrPagedQueryAddressRow[]
}

export interface addressInfo {
  type: string
  value: number
}
export interface IsCanClearAddrResponse {
  hasCleanAddressAuth: string
  authFlag: string
  addressInfoList: Array<addressInfo>
}

export interface ICleanAddressConfirm {
  addressType: string
  addressShowType: string
  cleanAddressType: string
  requestSource: string
  ids: Array<string>
}

/**
 * @description 地址校正-完善地址接口的地址信息（入参）
 * 收件场景需要带上电话三字段供后端校正参考，寄件不传
 */
export interface CompleteAddressInfo {
  telephone?: string | null
  mobile?: string | null
  extension?: string | null
  fullAddress?: string | null
  province?: string | null
  city?: string | null
  county?: string | null
  detailAddress?: string | null
}

/**
 * @description 地址校正-完善地址接口返回的建议地址（出参）
 * 只允许使用地址相关字段；接口返回的手机号/固话/分机号等字段禁止使用
 */
export interface CompleteAddressResult {
  fullAddress?: string | null
  province?: string | null
  city?: string | null
  county?: string | null
  detailAddress?: string | null
}

/**
 * @description 地址校正-完善地址入参
 */
export interface CompleteAddressParams {
  /** 地址类型：10寄件 20收件 */
  addressType: string
  /** 场景类型：20下单的寄/收场景 40地址簿场景 */
  sceneType: string
  /** 地址列表编辑要传，没有时可以不传 */
  addressId?: string
  sender?: CompleteAddressInfo
  receive?: CompleteAddressInfo
}

/**
 * @description 地址校正-完善地址出参
 */
export interface CompleteAddressResponse {
  /** 是否需要弹窗：10需要弹 20不需要弹 */
  needFlag: string
  /** 返回类型：10正常返回 20异常（前端需要兜底） */
  type: string
  /** 当前地址（完整地址字符串，相当于 fullAddress） */
  beforeAddress: string
  /** 建议修改地址（仅地址相关字段可用，手机号/固话等返回字段禁止使用） */
  afterAddress: CompleteAddressResult
  /** 地址id */
  addressId?: string
}

/**
 * @description 地址提醒-提醒项
 */
export interface AddressReminderItem {
  /** 提醒类型枚举：800寄件提醒 900收件提醒 700海南违禁品 */
  type: number
  /** 提醒标题 */
  title: string
  /** 提醒内容 */
  content: string
  /** 是否展示按钮 */
  button: boolean
}

/**
 * @description 地址提醒接口入参
 * @param addressType 地址类型：sender-寄件, receiver-收件, all-全部（默认）
 */
export interface AddressReminderParams {
  addressType?: 'sender' | 'receive' | 'all'
}

/**
 * @description 地址提醒接口出参
 */
export interface AddressReminderResponse {
  reminders: AddressReminderItem[]
}
