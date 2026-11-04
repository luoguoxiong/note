import { ConfigAddress } from '@order-public-sub-public/apis/address/types'

export interface SpecifyAddress {
  showPopup: boolean // 弹窗
  showSkeleton: boolean // 是否显示骨架屏
  searchLoading: boolean // 搜索加载
  keyword: string // 搜索关键词
  refreshing: boolean
  loading: boolean
  finished: boolean
  list: ConfigAddress[]
  page: number
  pageSize: number
  pageTotal: number
  longitude?: number | string
  latitude?: number | string
  activeItem?: number | string
  addressId?: number | string
  isHasLocationRecode?: boolean
}
