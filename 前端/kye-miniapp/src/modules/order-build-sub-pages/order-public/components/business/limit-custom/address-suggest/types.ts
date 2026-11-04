import { DialogMaskerProps } from '@order-public-sub-public/components/business/limit-custom/dialog-masker/types'
import { ReceiveAiInfo } from '@order-public-sub-public/types'

export interface addressDialogProps extends Omit<DialogMaskerProps, 'show'> {
  parentClassName: string
  senderInfoVoList: ReceiveAiInfo[]
  className?: string
}
