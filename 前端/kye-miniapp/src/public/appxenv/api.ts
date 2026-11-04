import { http } from '@public/utils/request'
import { ProductLineItem } from './type'

export const getVirtualEnv = () => {
  return http<ProductLineItem>('fmk.virtualEnv.list', { clientType: 14, productLine: '互联网' }, { hideToast: true })
}
