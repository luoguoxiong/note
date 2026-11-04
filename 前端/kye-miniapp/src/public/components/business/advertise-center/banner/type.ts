import { PageName } from '../config'
import { IAdvertisementBannerDto, IGetAdvertisementDetail } from '../type'

export interface IBannerProp extends Pick<
  IAdvertisementBannerDto,
  'h5Link' | 'jumpMode' | 'pageGroupCode' | 'posterLink' | 'buttonIndex' | 'modelRoute'
> {
  advertisementCode: string
  advertisementTitle?: string
  showStrategy?: 0 | 1 | 2
  subject?: string
}

export type QT = { page_code: string; region_code: string; event_code: string }

export type EntrySectionProps = {
  /** banner 数据从父组件传入 */
  data?: IGetAdvertisementDetail
  pageName: PageName
  paginationOffset?: number
  clickQT?: QT
  changeQT?: QT
  isFetching: boolean
  modelValue: IBannerProp[]
}
