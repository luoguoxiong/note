import { ScrollViewProps } from '@packages/__components/list/src/types';

interface FetchResult<T> {
  total: number;
  data: T[];
}

export type ListVirtualProps<T> = {
  fetch: (page: number) => Promise<FetchResult<T>>;
  /** 是否禁用下拉刷新 */
  disabledRefresh?: boolean;
  scrollViewProps?: ScrollViewProps
  itemHeight?: number
  itemSpace?: number
  overscan?: number
  getKey?: any
}