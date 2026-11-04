/**
 * AreaAddress 省市区选择弹窗专用类型定义
 * 来源: @order-public/apis/address/types.ts (行 4-29)
 */

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
