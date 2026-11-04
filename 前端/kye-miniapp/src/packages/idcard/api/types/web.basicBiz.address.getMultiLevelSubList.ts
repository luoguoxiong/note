interface AddressGetMultiLevelSubListRequest {
  /** 查询的数据级别 一级省级:province 二级市:city 三级区/县:zone 四级镇/街道:street 五级村/社区：village */
  districtLevel?: string
  /** 省行政区id */
  provinceDistrID?: string
  /** 市行政区id */
  cityDistrID?: string
  /** 区/县行政区ID */
  zoneDistrID?: string
  /** 镇/街道行政区ID */
  streetDistrID?: string
  /** 通用查询行政区id,该参数不为空则查询直接下级列表 */
  commonDistrID?: string
}

interface AddressGetMultiLevelSubListResponse {
  /** 状态码 */
  code: number
  /** 错误描述 */
  msg: string
  /** 数据对象 */
  data: AddressGetMultiLevelSubListResponseData
}

interface AddressGetMultiLevelSubListResponseData {
  /** 查询的数据级别 一级省级:province 二级市:city 三级区/县:zone 四级镇/街道:street 五级村/社区：village */
  districtLevel: string
  /** 省行政区ID */
  provinceDistrID: string
  /** 市行政区ID */
  cityDistrID: string
  /** 区/县行政区ID */
  zoneDistrID: string
  /** 镇/街道行政区ID */
  streetDistrID: string
  /** 行政区列表 */
  districtList: District[]
}

export interface District {
  /** 行政区ID */
  districtID: string
  /** 行政区名称 */
  districtName: string
  /** 行政区划编码 */
  adminCode: string
}

export interface AiAddrAnalysisRes {
  address: string
  aimd5: string
  city: string
  cityId: string
  district: string
  districtId: string
  mobilePhone: string
  name: string
  postalCode: string
  province: string
  provinceId: string
  telPhone: string
  town: string
  townId: string
  traceId: string
}
