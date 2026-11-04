import { PageName } from '../config'
import { IdetailList, IGetAdvertisementDetail } from '../type'

export type PopupInfo = IdetailList & { areaStyleCode: string }

export type EntrySectionProps = {
  isFetching: boolean
  pageName: PageName
  qtPageCode?: string
  data?: IGetAdvertisementDetail
  modelValue: PopupInfo | undefined
}
