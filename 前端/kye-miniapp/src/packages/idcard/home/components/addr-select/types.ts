export interface DistrictItem {
  districtID: string
  districtName: string
  [key: string]: any
}

export interface HotCity {
  text?: string
  districtIDCity?: string
  districtIDProvince?: string
  districtIDProvinceIndex?: number
  districtIDCityIndex?: number
}

export interface District {
  districtID: string
  districtName: string
}

export interface AddrSelectProps {
  resetAddress?: boolean
  defaultAddress?: {
    province: string
    provinceId: string
    city: string
    cityId: string
    county: string
    countyId: string
    town: string
    townId: string
  }
}

export interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}
