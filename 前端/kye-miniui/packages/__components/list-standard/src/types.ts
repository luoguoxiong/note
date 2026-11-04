import { ScrollViewProps } from '@packages/__components/list/src/types'

interface FetchResult<T> {
  total: number;
  data: T[];
}

export type ListStandardProps<T> = {
  fetch: (page: number) => Promise<FetchResult<T>>
  shallowRef?: boolean
  /** 是否禁用下拉刷新 */
  disabledRefresh?: boolean
  scrollViewProps?: ScrollViewProps
  showLoading?: boolean
}
