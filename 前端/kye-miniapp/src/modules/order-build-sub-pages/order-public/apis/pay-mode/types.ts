import { CheckDetail } from '@order-public-sub-public/types'

export interface AuthorizedList {
  customerCode: string
  customerName: string
  authorizeStatus: authorizeStatus
  isDefault: boolean
  checkResultList: CheckDetail[]
}

interface authorizeStatus {
  status: number
  tipMsg: string
}
