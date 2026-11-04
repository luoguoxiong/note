import { FindSuggestItem } from '@order-public-sub-public/apis/address/types'

export interface DetailAddressState {
  showPopup: boolean
  headerLoading: boolean
  message: string
  allLoading: boolean
  refreshing: boolean
  loading: boolean
  finished: boolean
  list: FindSuggestItem[]
  page: number
  pageSize: number
  pageTotal: number
}
