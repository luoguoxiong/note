

export interface ListItem {
  title?: string
  detailAddress?: string
  distanceView?: string
  address?: string
  country?: string
  county?: string
  city?: string
  district?: string
  province?: string
}

export interface ItemSelect {
  city?: string
  country?: string
  detailAddress?: string
  distance?: number
  distanceView?: string
  county?: string
  district?: string
  address?: string
  id?: null
  location?: {
    lat: number
    lng: number
  }
  province?: string
  title?: string
}

export interface ReactiveType {
  show: boolean
  keyword: string
  showSkeleton: boolean
  searchLoading: boolean
  isSearch: boolean
  refreshing: boolean
  loading: boolean
  finished: boolean
  list: ListItem[]
  page: number
  pageSize: number
  pageTotal: number
  activeIndex: number
  // region: string
  result: ItemSelect
  region: string
  lng?: string
  lat?: string
}
export interface OnloadParams {
  policy?: string
  radius?: string
  lng?: number | unknown
  lat?: number | unknown
  page?: number
  pageSize?: number
  pageIndex?: number
  address?: string
  message?: string
  region?: string
}

export interface PropsType {
  show: boolean
  result: any
  lngLat: {
    lng: number | string
    lat: number | string
  }
}
