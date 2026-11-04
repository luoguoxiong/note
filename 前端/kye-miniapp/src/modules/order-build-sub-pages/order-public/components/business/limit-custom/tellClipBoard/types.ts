import { DialogMaskerProps } from '@order-public-sub-public/components/business/limit-custom/dialog-masker/types'

export interface tellClipBoardDialogProps extends Omit<DialogMaskerProps, 'show'> {
  person?: string
  mobile?: string
  detailAddress?: string
  telephone?: string
}
