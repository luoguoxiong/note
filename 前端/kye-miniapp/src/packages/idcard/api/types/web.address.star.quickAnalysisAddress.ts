interface QuickAnalysisAddressRequest {
  /** 详细地址 */
  data: string[]
}

interface QuickAnalysisAddressResponse {
  /** 状态码 */
  code: number
  /** 状态信息 */
  msg: string
  /** 返回数据 */
  data: QuickAnalysisAddressResponseData[]
}

interface QuickAnalysisAddressResponseData {
  /** 名字 */
  name: string
  /** 省 */
  provice: string
  /** 省id */
  proviceId: string
  /** 市 */
  city: string
  /** 市id */
  cityId: string
  /** 区 */
  district: string
  /** 区id */
  districtId: string
  /** 详细地址 */
  detailedAddress: string
  /** 详细地址id */
  detailedAddressId: string
  /** 电话号码 */
  phoneNumber: string
  /** 商品编码 */
  goodsNumber: string
  /** 邮编 */
  postalCode: string
  /** 检验信息列表 */
  interceptList: string[]
  /** 镇编码 */
  townCode: string
  /** 镇Id */
  townId: string
  /** 镇名 */
  town: string
}
