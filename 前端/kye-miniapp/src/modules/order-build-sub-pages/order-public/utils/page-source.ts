import { HttpCode } from '@order-public-sub-public/constants'

export const toastConfig = (code?: number) => {
  let flag = false
  if (location.href.includes('waybill-search') && code === HttpCode.EXPIRED) {
    flag = true
  }

  return flag
}
