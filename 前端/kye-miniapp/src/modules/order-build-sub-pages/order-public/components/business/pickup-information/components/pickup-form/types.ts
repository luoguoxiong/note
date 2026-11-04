import { RecommendType } from '@order-public-sub-public/apis/pickup/type'

interface showItemType {
  picker: boolean
  pickerMobile: boolean
  pickerPhone: boolean
  pickeData: boolean
}
export interface pickupFormProps {
  personValue: string
  telephoneValue: string
  mobileValue: string
  extensionValue: string
  suggestList: RecommendType[]
  showItem: showItemType
  editableItem: showItemType
  keyword?: string
}
