import { PageName } from '../config'
import { IadvertisementNoticeDto } from '../type'

export interface AdvertiseBannerSwiperOptions {
  autoPlay: boolean
  duration: number
}
export type EntrySectionProps = {
  type?: 'default' | 'glost'
  pageName: PageName
  swiperOptions?: AdvertiseBannerSwiperOptions
  hasClose?: boolean
  clickQT?: {
    page_code: string
    region_code: string
    event_code: string
  }
  closeQT?: {
    page_code: string
    region_code: string
    event_code: string
  }
  modelValue: INoticeProp[]
}

export interface INoticeProp extends Pick<
  IadvertisementNoticeDto,
  | 'h5Link'
  | 'jumpMode'
  | 'pageGroupCode'
  | 'noticeText'
  | 'showStrategy'
  | 'modelRoute'
  | 'customeParam'
  | 'urlCustomParam'
> {
  advertisementCode: string
  /** 是不是奖励金 */
  isMoney?: boolean
}
