import { recommendContactData } from '@order-public-sub-public/apis/pickup/type'
export interface pickUpProps {
  visible: boolean
  suggestList: recommendContactData
  keyword: string
}
