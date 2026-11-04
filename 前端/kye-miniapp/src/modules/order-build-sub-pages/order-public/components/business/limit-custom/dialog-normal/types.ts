import { DialogMaskerProps } from '@order-public-sub-public/components/business/limit-custom/dialog-masker/types'

export interface NormalDialogProps extends Omit<DialogMaskerProps, 'show'> {
  parentClassName: string
  showCustomConcat?: boolean
  showCustomConcatCallBack?: () => void
}
